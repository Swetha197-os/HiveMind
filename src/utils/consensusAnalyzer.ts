import type { ModelId, ModelResponse, ConsensusGroup, AnalysisReport, QueenAnswer } from '../types';
import { AVAILABLE_MODELS } from '../data/mockData';

// Stop words for Jaccard fallback similarity
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'to', 'of', 'in', 'on', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'from', 'up', 'down', 'in', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'our', 'us', 'my', 'their'
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
  responses: Record<ModelId, ModelResponse>
): AnalysisReport => {
  const activeModelIds = Object.keys(responses) as ModelId[];

  // Calculate keyword intersections
  const keywordsMap: Record<ModelId, Set<string>> = {} as Record<ModelId, Set<string>>;
  activeModelIds.forEach(id => {
    keywordsMap[id] = extractKeywords(responses[id].answer || '');
  });

  // Calculate similarity matrix and cluster
  const groups: ConsensusGroup[] = [];
  const visited = new Set<ModelId>();

  for (let i = 0; i < activeModelIds.length; i++) {
    const idA = activeModelIds[i];
    if (visited.has(idA)) continue;

    const currentGroup: ModelId[] = [idA];
    visited.add(idA);

    for (let j = i + 1; j < activeModelIds.length; j++) {
      const idB = activeModelIds[j];
      if (visited.has(idB)) continue;

      const setA = keywordsMap[idA];
      const setB = keywordsMap[idB];
      const intersection = new Set([...setA].filter(x => setB.has(x)));
      const union = new Set([...setA, ...setB]);
      const similarity = union.size > 0 ? intersection.size / union.size : 0;

      if (similarity >= 0.35 || intersection.size >= 4) { // Adjusted similarity threshold for conceptual grouping
        currentGroup.push(idB);
        visited.add(idB);
      }
    }

    const sharedTermsSet = new Set<string>();
    if (currentGroup.length > 1) {
      const firstSet = keywordsMap[currentGroup[0]];
      [...firstSet].forEach(term => {
        const isShared = currentGroup.slice(1).every(id => keywordsMap[id].has(term));
        if (isShared) sharedTermsSet.add(term);
      });
    } else {
      [...keywordsMap[idA]].slice(0, 3).forEach(term => sharedTermsSet.add(term));
    }

    const commonPoints = [...sharedTermsSet].slice(0, 3).map(term => `Discussion surrounding the core concept of "${term}"`);
    if (commonPoints.length === 0) {
      commonPoints.push('General alignment on semantic inquiry components.');
    }

    const groupLetter = String.fromCharCode(65 + groups.length);
    const simPercent = currentGroup.length > 1 ? Math.floor(60 + Math.random() * 30) : Math.floor(20 + Math.random() * 20);

    groups.push({
      id: `group-${groupLetter.toLowerCase()}`,
      name: `Group ${groupLetter} (${currentGroup.length > 1 ? 'Aligned Perspective' : 'Unique Viewpoint'})`,
      similarityPercent: simPercent,
      models: currentGroup,
      commonPoints,
      uniquePoints: currentGroup.map(mId => ({
        modelId: mId,
        point: `Focuses on custom structures, syntax definitions, or specific developer guides.`
      }))
    });
  }

  // Calculate originality scores
  const originalityScores: Record<ModelId, number> = {} as Record<ModelId, number>;
  activeModelIds.forEach((id) => {
    const group = groups.find(g => g.models.includes(id));
    const size = group ? group.models.length : 1;
    originalityScores[id] = Math.floor(100 / size + (Math.random() * 10 - 5));
    if (originalityScores[id] > 95) originalityScores[id] = 95;
    if (originalityScores[id] < 15) originalityScores[id] = 15;
  });

  const missingInfo = activeModelIds.map(id => {
    return {
      modelId: id,
      info: `Detailed specific ${AVAILABLE_MODELS.find(m => m.id === id)?.name || id} implementation steps and framework settings.`
    };
  }).slice(0, 2);

  // Dynamic Queen Answer Synthesis
  let queenText = `### Synthesized Consensus Answer (Local Fallback)\n\n`;
  queenText += `Aggregating viewpoints from the evaluated sources:\n\n`;
  activeModelIds.forEach(id => {
    const response = responses[id];
    if (response?.status === 'success' && response.answer) {
      const firstLine = response.answer.split('\n').find(l => l.trim() && !l.startsWith('#')) || '';
      queenText += `* **From ${AVAILABLE_MODELS.find(m => m.id === id)?.name}:** ${firstLine.substring(0, 150)}...\n`;
    }
  });

  const queenAnswer: QueenAnswer = {
    text: queenText,
    attributions: activeModelIds.slice(0, 3).map(id => ({
      modelId: id,
      contribution: `Core definition contribution`
    }))
  };

  const hiveScore = Math.min(95, Math.max(20, Math.floor(40 + (groups[0]?.similarityPercent || 50) * 0.5)));

  const report: AnalysisReport = {
    hiveScore,
    groups,
    originalityScores,
    missingInfo,
    queenAnswer
  };

  console.log("Fallback analysis groups:", report.groups);
  console.log("Final groups used:", report.groups);

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
    (id) => responses[id]?.status === 'success'
  );

  console.log("Successful models used:", activeModelIds);

  return runLocalAnalysis(question, responses);
};
