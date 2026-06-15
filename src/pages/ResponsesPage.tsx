import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHiveMind } from '../utils/HiveMindContext';
import { ResponseCard } from '../components/ResponseCard';
import { AVAILABLE_MODELS } from '../data/mockData';
import { ArrowLeft, BarChart2, Loader2, Sparkles } from 'lucide-react';

export const ResponsesPage: React.FC = () => {
  const { question, selectedModels, responses, toggleBookmark, isBookmarked } = useHiveMind();
  const navigate = useNavigate();

  // Redirect if someone visits this page directly without a question
  useEffect(() => {
    if (!question.trim()) {
      navigate('/compare');
    }
  }, [question, navigate]);

  const allDone = selectedModels.every((id) => responses[id]?.status === 'success' || responses[id]?.status === 'error');
  const hasValidResponses = selectedModels.some(id => responses[id]?.status === 'success');

  const handleAnalyzeClick = () => {
    console.log("Analyze clicked");
    console.log("Responses available:", hasValidResponses);
    
    if (hasValidResponses) {
      console.log("Navigating to /analysis");
      navigate('/analysis');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Navigation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div className="space-y-2">
          <button
            onClick={() => navigate('/compare')}
            className="flex items-center space-x-2 text-butter hover:text-butter-dark transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Edit Question & Models</span>
          </button>
          
          <h2 className="text-xl md:text-2xl font-bold text-white leading-relaxed line-clamp-2">
            {selectedModels.length > 1 ? 'Comparing answers for:' : 'Answer for:'} <span className="text-butter font-light">"{question}"</span>
          </h2>
        </div>

        {selectedModels.length > 1 && (
          <div>
            <button
              onClick={handleAnalyzeClick}
              disabled={!allDone || !hasValidResponses}
              className={`py-3 px-6 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all duration-300 shadow-md ${
                allDone && hasValidResponses
                  ? 'bg-butter text-darkgreen hover:bg-butter-dark hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                  : 'bg-darkgreen-muted text-gray-500 border border-gray-800 cursor-not-allowed'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Analyze Consensus</span>
            </button>
          </div>
        )}
      </div>

      {/* Streaming Loader Banner */}
      {!allDone && (
        <div className="p-4 rounded-xl glass-card border-butter/10 flex items-center justify-between bg-butter/5">
          <div className="flex items-center space-x-3 text-sm text-gray-300">
            <Loader2 className="w-5 h-5 text-butter animate-spin" />
            <span>{selectedModels.length > 1 ? 'Awaiting responses from models. Analyzing semantic overlap...' : 'Awaiting response from model...'}</span>
          </div>
          <span className="text-xs text-butter bg-butter/10 px-2.5 py-1 rounded-full font-medium">
            Generating
          </span>
        </div>
      )}

      {/* Grid of responses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {selectedModels.map((mId) => {
          const model = AVAILABLE_MODELS.find((m) => m.id === mId)!;
          const res = responses[mId];
          const isMarked = isBookmarked(question, mId);

          return (
            <div key={mId} className="h-full">
              <ResponseCard
                model={model}
                response={res}
                isBookmarked={isMarked}
                onToggleBookmark={() => toggleBookmark(question, mId, model.name, res?.answer || '')}
              />
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      {selectedModels.length > 1 && (
        <div className="flex justify-center pt-4">
          {allDone ? (
            <button
              onClick={handleAnalyzeClick}
              disabled={!hasValidResponses}
              className={`py-4 px-10 rounded-xl flex items-center space-x-2 shadow-lg transition-all transform ${
                hasValidResponses 
                  ? 'bg-butter text-darkgreen hover:bg-butter-dark font-bold hover:scale-[1.01] active:scale-[0.99]' 
                  : 'bg-darkgreen-muted text-gray-500 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              <span>Proceed to Consensus Analysis</span>
            </button>
          ) : (
            <div className="text-xs text-gray-400 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-butter" />
              <span>Waiting for all models to respond before analysis can be calculated...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default ResponsesPage;
