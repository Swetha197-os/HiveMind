import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useHiveMind } from '../utils/HiveMindContext';
import { ConsensusGroupCard } from '../components/ConsensusGroupCard';
import { QueenAnswerCard } from '../components/QueenAnswerCard';
import { AVAILABLE_MODELS } from '../data/mockData';
import { ArrowLeft, Brain, BarChart2, ShieldAlert, Award, FileText } from 'lucide-react';

export const AnalysisPage: React.FC = () => {
  const { question, selectedModels, analysis, isLoading, responses } = useHiveMind();
  const navigate = useNavigate();

  // Do not auto-redirect. Let the UI handle missing state.
  const validResponsesCount = selectedModels.filter(id => responses[id]?.status === 'success').length;
  const hasValidResponses = validResponsesCount > 0;

  if (!analysis && isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Brain className="w-12 h-12 text-butter animate-bounce" />
        <span className="text-gray-400 font-light">Loading analysis metrics...</span>
      </div>
    );
  }

  if (!hasValidResponses) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-400" />
        <span className="text-gray-400 font-light">No responses available for analysis.</span>
        <button
          onClick={() => navigate('/compare')}
          className="mt-4 py-2 px-6 rounded-lg bg-butter text-darkgreen font-semibold"
        >
          Return Home
        </button>
      </div>
    );
  }

  if (validResponsesCount < 2) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <ShieldAlert className="w-12 h-12 text-yellow-500" />
        <span className="text-gray-400 font-light">Consensus analysis needs at least 2 successful model responses.</span>
        <button
          onClick={() => navigate('/compare')}
          className="mt-4 py-2 px-6 rounded-lg bg-butter text-darkgreen font-semibold"
        >
          Return Home
        </button>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Brain className="w-12 h-12 text-butter animate-bounce" />
        <span className="text-gray-400 font-light">Loading analysis metrics...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 md:space-y-12">
      {/* Navigation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div className="space-y-2">
          <button
            onClick={() => navigate('/responses')}
            className="flex items-center space-x-2 text-butter hover:text-butter-dark transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Response Cards</span>
          </button>
          
          <h2 className="text-xl md:text-2xl font-bold text-white leading-relaxed line-clamp-2">
            Consensus Analysis: <span className="text-butter font-light">"{question}"</span>
          </h2>
        </div>

        <div>
          <button
            onClick={() => navigate('/compare')}
            className="py-3 px-6 rounded-xl border border-butter/30 text-butter hover:bg-butter hover:text-darkgreen font-semibold transition-all duration-300 shadow-md text-sm"
          >
            Ask New Question
          </button>
        </div>
      </div>

      {/* Overview Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1: Hive Agreement Score */}
        <div className="p-6 rounded-xl glass-card border-butter/10 flex items-center justify-between relative overflow-hidden bg-gradient-to-br from-darkgreen/40 to-butter/5">
          <div className="space-y-2">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider block">
              Hive Agreement Score
            </span>
            <span className="text-4xl font-extrabold text-butter block">
              {analysis.hiveScore}%
            </span>
            <p className="text-xs text-gray-300 leading-relaxed font-light">
              {analysis.hiveScore > 70 
                ? 'High consensus. The models generally agree on the core facts.' 
                : 'Diverse consensus. Models provided divergent perspectives.'}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-butter/10 text-butter">
            <Award className="w-8 h-8" />
          </div>
        </div>

        {/* Metric 2: Evaluated Minds */}
        <div className="p-6 rounded-xl glass-card border-butter/10 flex items-center justify-between relative overflow-hidden">
          <div className="space-y-2">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider block">
              Evaluated Minds
            </span>
            <span className="text-4xl font-extrabold text-white block">
              {selectedModels.length}
            </span>
            <p className="text-xs text-gray-300 leading-relaxed font-light">
              Participating node clusters evaluated for this report.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-gray-800 text-gray-300">
            <Brain className="w-8 h-8" />
          </div>
        </div>

        {/* Metric 3: Cluster Groups */}
        <div className="p-6 rounded-xl glass-card border-butter/10 flex items-center justify-between relative overflow-hidden">
          <div className="space-y-2">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider block">
              Consensus Clusters
            </span>
            <span className="text-4xl font-extrabold text-white block">
              {analysis.groups.length}
            </span>
            <p className="text-xs text-gray-300 leading-relaxed font-light">
              Distinct perspectives grouped by similarity index.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-gray-800 text-gray-300">
            <BarChart2 className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Main Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Span): Clustered Groups & Queen Answer */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Queen Answer Synthesis */}
          <QueenAnswerCard queenAnswer={analysis.queenAnswer} />

          {/* Consensus Group Cards */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-butter" />
              <h3 className="text-lg font-semibold text-white">Consensus Grouping</h3>
            </div>
            {analysis.groups.map((group) => (
              <ConsensusGroupCard key={group.id} group={group} />
            ))}
          </div>

        </div>

        {/* Right Column (1 Span): Originality Chart & Missing info */}
        <div className="space-y-8">
          
          {/* Originality Index Chart */}
          <div className="p-6 rounded-xl glass-card border-butter/10 space-y-6">
            <div>
              <h4 className="text-base font-semibold text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-butter" />
                <span>Originality Index</span>
              </h4>
              <p className="text-xs text-gray-400 font-light mt-1">
                Reflects uniqueness of the response content compared to other models.
              </p>
            </div>

            <div className="space-y-4">
              {selectedModels.map((mId) => {
                const model = AVAILABLE_MODELS.find(m => m.id === mId)!;
                const score = analysis.originalityScores[mId] || 50;

                return (
                  <div key={mId} className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-white">{model.name}</span>
                      <span className="font-bold text-butter">{score}%</span>
                    </div>
                    {/* Bar Chart Container */}
                    <div className="h-2 w-full bg-darkgreen-muted/80 rounded-full overflow-hidden border border-gray-800">
                      <div 
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${score}%`, 
                          backgroundColor: model.accentColor 
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Missing Information Panel */}
          <div className="p-6 rounded-xl glass-card border-butter/10 space-y-4">
            <div className="flex items-center space-x-2 border-b border-gray-800 pb-3">
              <ShieldAlert className="w-4 h-4 text-butter" />
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                Missing Information Analysis
              </h4>
            </div>

            {analysis.missingInfo.length === 0 ? (
              <p className="text-xs text-gray-400 font-light">
                No major missing components identified between model outputs.
              </p>
            ) : (
              <div className="space-y-4">
                {analysis.missingInfo.map((item, idx) => {
                  const model = AVAILABLE_MODELS.find(m => m.id === item.modelId)!;
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <span 
                          className="w-1.5 h-1.5 rounded-full" 
                          style={{ backgroundColor: model.accentColor }} 
                        />
                        <span className="text-xs font-semibold text-white">
                          Only {model.name} mentioned:
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed font-light pl-3.5 border-l border-gray-800">
                        {item.info}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
export default AnalysisPage;
