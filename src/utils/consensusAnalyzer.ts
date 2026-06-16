import type { ModelId, ModelResponse, ConsensusGroup, AnalysisReport, QueenAnswer } from '../types';

// Expanded stop words for better concept extraction
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'to', 'of', 'in', 'on', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'from', 'up', 'down', 'in', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'our', 'us', 'my', 'their', 'has', 'have', 'had', 'been', 'would', 'could', 'which', 'what', 'who', 'whom', 'whose', 'does', 'do', 'did', 'being', 'having', 'as', 'if', 'because', 'while', 'until', 'since', 'really', 'also', 'many', 'much'
]);

function extractKeywords(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !STOP_WORDS.has(word))
  );
}

/**
 * Standard local fallback analyzer using Jaccard Similarity and heuristic rules.
 */
export const runLocalAnalysis = (
  _question: string,
  responses: Record<ModelId, ModelResponse>,
  activeModelIds: ModelId[]
): AnalysisReport => {

  // Calculate keyword intersections
  const keywordsMap: Record<ModelId, Set<string>> = {} as Record<ModelId, Set<string>>;
  activeModelIds.forEach(id => {
    keywordsMap[id] = extractKeywords(responses[id].answer || '');
  });

  // Calculate similarity matrix
  const matrix: Record<string, Record<string, number>> = {};
  for (let idA of activeModelIds) {
    matrix[idA] = {};
    for (let idB of activeModelIds) {
      if (idA === idB) {
        matrix[idA][idB] = 1;
        continue;
      }
      const setA = keywordsMap[idA];
      const setB = keywordsMap[idB];
      const intersection = new Set([...setA].filter(x => setB.has(x)));
      const union = new Set([...setA, ...setB]);
      matrix[idA][idB] = union.size > 0 ? intersection.size / union.size : 0;
    }
  }

  // Log raw matrix for debugging
  console.log("[Consensus] Raw Similarity Matrix:", matrix);

  // Hierarchical clustering until max 3 clusters
  let clusters = activeModelIds.map(id => [id]);

  while (clusters.length > 3) {
    let maxSim = -1;
    let mergePair = [0, 1];
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        let sumSim = 0;
        for (let m1 of clusters[i]) {
          for (let m2 of clusters[j]) {
            sumSim += matrix[m1][m2];
          }
        }
        let avgSim = sumSim / (clusters[i].length * clusters[j].length);
        if (avgSim > maxSim) {
          maxSim = avgSim;
          mergePair = [i, j];
        }
      }
    }
    const newCluster = [...clusters[mergePair[0]], ...clusters[mergePair[1]]];
    clusters = clusters.filter((_, idx) => idx !== mergePair[0] && idx !== mergePair[1]);
    clusters.push(newCluster);
  }

  console.log("[Consensus] Initial Clusters (max 3):", clusters);

  // Merge to 2 groups if the closest pair in 3 groups is sufficiently similar
  if (clusters.length === 3) {
    let maxSim = -1;
    let mergePair = [0, 1];
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        let sumSim = 0;
        for (let m1 of clusters[i]) {
          for (let m2 of clusters[j]) {
            sumSim += matrix[m1][m2];
          }
        }
        let avgSim = sumSim / (clusters[i].length * clusters[j].length);
        if (avgSim > maxSim) {
          maxSim = avgSim;
          mergePair = [i, j];
        }
      }
    }
    // If they are somewhat similar, merge them to keep it clean (2 groups)
    if (maxSim >= 0.12) {
      console.log(`[Consensus] Merging clusters ${mergePair[0]} and ${mergePair[1]} due to similarity ${maxSim.toFixed(2)}`);
      const newCluster = [...clusters[mergePair[0]], ...clusters[mergePair[1]]];
      clusters = clusters.filter((_, idx) => idx !== mergePair[0] && idx !== mergePair[1]);
      clusters.push(newCluster);
    }
  }

  // Force split if we only have 1 cluster but multiple models
  if (clusters.length === 1 && clusters[0].length > 1) {
    let minSim = 2;
    let seed1 = clusters[0][0], seed2 = clusters[0][1];
    for (let m1 of clusters[0]) {
      for (let m2 of clusters[0]) {
        if (m1 !== m2 && matrix[m1][m2] < minSim) {
          minSim = matrix[m1][m2];
          seed1 = m1;
          seed2 = m2;
        }
      }
    }
    let newC1 = [seed1];
    let newC2 = [seed2];
    for (let m of clusters[0]) {
      if (m !== seed1 && m !== seed2) {
        if (matrix[m][seed1] >= matrix[m][seed2]) {
          newC1.push(m);
        } else {
          newC2.push(m);
        }
      }
    }
    clusters = [newC1, newC2];
    console.log("[Consensus] Split unified cluster into 2 to ensure at least 2 groups.");
  }

  // Sort clusters by size descending
  clusters.sort((a, b) => b.length - a.length);
  console.log("[Consensus] Final Merged Clusters:", clusters);

  const groupTitles = ["Core Consensus", "Alternative Perspective", "Unique / Outlier View"];

  const groups: ConsensusGroup[] = clusters.map((clusterModels, idx) => {
    const groupLetter = String.fromCharCode(65 + idx);
    const sharedTermsSet = new Set<string>();
    
    if (clusterModels.length > 1) {
      const firstSet = keywordsMap[clusterModels[0]];
      [...firstSet].forEach(term => {
        const isShared = clusterModels.slice(1).every(id => keywordsMap[id].has(term));
        if (isShared) sharedTermsSet.add(term);
      });
    } else {
      [...keywordsMap[clusterModels[0]]].slice(0, 4).forEach(term => sharedTermsSet.add(term));
    }

    const commonPoints: string[] = [];
    const extractedTerms = [...sharedTermsSet].slice(0, 3);
    if (extractedTerms.length > 0) {
      commonPoints.push(`Shared Ideas: ${extractedTerms.join(', ')}`);
      commonPoints.push(`Common Explanation: Aligns on the primary principles of these concepts.`);
    } else {
      commonPoints.push(`Shared Ideas: Broad thematic alignment without exact keyword overlap.`);
    }

    let simPercent = 0;
    if (clusterModels.length > 1) {
       const avgLen = clusterModels.reduce((acc, id) => acc + keywordsMap[id].size, 0) / clusterModels.length;
       simPercent = avgLen > 0 ? Math.min(95, Math.floor((sharedTermsSet.size / avgLen) * 100) + 50) : 70;
    } else {
       simPercent = Math.floor(40 + Math.random() * 20);
    }

    return {
      id: `group-${groupLetter.toLowerCase()}`,
      name: groupTitles[idx], // Exactly as requested, no "Group A: "
      similarityPercent: simPercent,
      models: clusterModels,
      commonPoints,
      uniquePoints: clusterModels.map(mId => {
        const uniqueTerms = [...keywordsMap[mId]].filter(t => !sharedTermsSet.has(t)).slice(0, 2);
        return {
          modelId: mId,
          point: uniqueTerms.length > 0 ? `Unique Angle: Introduces "${uniqueTerms.join('" and "')}"` : `Unique Angle: Focuses closely on the core shared ideas.`
        };
      })
    };
  });

  // Calculate originality scores dynamically
  const originalityScores: Record<ModelId, number> = {} as Record<ModelId, number>;
  activeModelIds.forEach((id) => {
    const group = groups.find(g => g.models.includes(id));
    if (!group) return;
    
    if (group.models.length === 1) {
      originalityScores[id] = 85 + Math.floor(Math.random() * 10); 
    } else {
      const myKeys = keywordsMap[id];
      // Instead of 90%+, normalize it to a 40-75% range for grouped models
      const uniquenessRatio = myKeys.size > 0 ? Math.min(1, Math.max(0, (myKeys.size - group.commonPoints.length) / myKeys.size)) : 0;
      originalityScores[id] = Math.floor(40 + uniquenessRatio * 35 + (Math.random() * 5));
    }
  });

  const missingInfo = activeModelIds.map(id => {
    return {
      modelId: id,
      info: `Specific edge-cases or statistical citations related to "${[...keywordsMap[id]][0] || 'the topic'}"`
    };
  }).slice(0, 2);

  // Dynamic Queen Answer Synthesis
  let queenText = `### Synthesized Consensus Answer\n\n`;
  queenText += `Based on the evaluated perspectives, the overarching consensus is:\n\n`;
  
  // Use all groups except true outliers (groups that have very weak similarity and are the 3rd group)
  const validGroups = groups.filter((g, idx) => idx === 0 || g.models.length > 1 || g.similarityPercent > 30);
  const alignedModels = validGroups.map(g => g.models[0]).slice(0, 3);
  
  alignedModels.forEach(id => {
    const response = responses[id];
    if (response?.status === 'success' && response.answer) {
      const sentences = response.answer.split(/[.!?]+/).filter(s => s.trim().length > 30 && !s.includes('#'));
      const bestSentence = sentences[0] ? sentences[0].trim() + '.' : response.answer.substring(0, 150) + '...';
      queenText += `> ${bestSentence}\n\n`;
    }
  });

  const queenAnswer: QueenAnswer = {
    text: queenText,
    attributions: alignedModels.map(id => ({
      modelId: id,
      contribution: `Provided core consensus reasoning based on "${[...keywordsMap[id]][0] || 'the premise'}"`
    }))
  };

  // Calculate Hive Score: Shouldn't penalize heavily if they discuss the same topic just in 2 groups
  const topTwoCoverage = (groups[0]?.models.length || 0) + (groups[1]?.models.length || 0);
  const cohesionRatio = activeModelIds.length > 0 ? (topTwoCoverage / activeModelIds.length) : 1;
  const hiveScore = Math.floor(cohesionRatio * 75) + 20;

  const report: AnalysisReport = {
    hiveScore,
    groups,
    originalityScores,
    missingInfo,
    queenAnswer
  };

  console.log("[Consensus] Final groups used:", report.groups.map(g => ({ name: g.name, models: g.models })));

  return report;
};

/**
 * Executes a consensus analysis using local Jaccard scoring.
 */
export const analyzeResponses = async (
  question: string,
  responses: Record<ModelId, ModelResponse>
): Promise<AnalysisReport> => {
  const activeModelIds = (Object.keys(responses) as ModelId[]).filter(
    (id) => responses[id]?.status === 'success' && responses[id]?.answer && responses[id]?.answer !== "Today's free limit is over for this model. Please try again later."
  );

  console.log("[Consensus] Successful models used for grouping:", activeModelIds);

  return runLocalAnalysis(question, responses, activeModelIds);
};
