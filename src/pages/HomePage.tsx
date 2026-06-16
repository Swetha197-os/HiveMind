import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useHiveMind } from '../utils/HiveMindContext';
import { ModelSelector } from '../components/ModelSelector';
import { QuestionInput } from '../components/QuestionInput';
import { BrainCircuit, History, Bookmark, Trash2, ArrowRight } from 'lucide-react';
import { useAuth } from '../utils/AuthContext';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const {
    question,
    setQuestion,
    selectedModels,
    setSelectedModels,
    triggerComparison,
    history,
    bookmarks,
    clearAllData,
    loadSession,
    isLoading
  } = useHiveMind();
  
  const navigate = useNavigate();

  const handleCompare = async () => {
    if (!question.trim()) return;
    if (selectedModels.length < 1) return;
    
    // Trigger the asynchronous stream comparison
    triggerComparison();
    navigate('/responses');
  };

  const handleSelectHistory = (session: any) => {
    loadSession(session);
    navigate('/analysis'); // skip straight to analysis for completed logs
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto relative py-8">
        <div className="absolute inset-0 bg-butter/5 rounded-full blur-3xl animate-pulse-glow -z-10" />
        
        <div className="inline-flex items-center gap-2 bg-butter/10 border border-butter/25 text-butter px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
          <BrainCircuit className="w-4 h-4" />
          <span>Multi-AI Consensus Engine</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white">
          <span className="text-butter">Hive</span>Mind
        </h1>
        
        <p className="text-xl md:text-2xl text-butter-dark font-medium font-sans">
          Ask Once. Think With Many.
        </p>
        
        <p className="text-sm md:text-base text-gray-300 font-light max-w-xl mx-auto leading-relaxed">
          Compare multiple AI models simultaneously, detect alignment, isolate unique insights, and synthesize optimal solutions.
        </p>
      </div>

      {/* Input and Selection Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Query & Models */}
        <div className="lg:col-span-2 space-y-8">
          <div className="p-6 rounded-2xl glass-card border-butter/15 space-y-6">
            <QuestionInput 
              value={question} 
              onChange={setQuestion} 
              placeholder="e.g. What is polymorphism in Java? Or compare React vs Vue."
            />
            
            <ModelSelector 
              selectedModels={selectedModels} 
              onChange={setSelectedModels} 
            />

            <div className="pt-2">
              <button
                onClick={handleCompare}
                disabled={!question.trim() || selectedModels.length < 1 || isLoading}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all duration-300 shadow-lg ${
                  question.trim() && selectedModels.length >= 1 && !isLoading
                    ? 'bg-butter text-darkgreen hover:bg-butter-dark hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
                    : 'bg-darkgreen-muted text-gray-500 border border-gray-800 cursor-not-allowed'
                }`}
              >
                <span>{isLoading ? 'Processing...' : (selectedModels.length > 1 ? `Compare ${selectedModels.length} Models` : 'Generate Response')}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              {selectedModels.length < 1 && (
                <p className="text-xs text-red-400 mt-2 text-center">
                  * Please select at least 1 AI model.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: History & Bookmarks */}
        <div className="space-y-6">
          {/* History Panel */}
          <div className="p-6 rounded-2xl glass-card border-butter/10 space-y-4 max-h-[360px] overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-butter uppercase tracking-wider flex items-center gap-2">
                    <History className="w-4 h-4" />
                    <span>Recent Logs</span>
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium border border-gray-700 bg-gray-800 text-gray-300">
                    {user ? 'Cloud History' : 'Guest History'}
                  </span>
                </div>
                {history.length > 0 && (
                  <button 
                    onClick={clearAllData}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                    title="Clear All History"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <p className="text-xs text-gray-400 py-8 text-center font-light">
                  No query history found. Make a comparison to see logs here.
                </p>
              ) : (
                <div className="space-y-2 mt-3 overflow-y-auto max-h-[200px] pr-1">
                  {history.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => handleSelectHistory(session)}
                      className="w-full text-left p-3 rounded-lg bg-darkgreen-muted/30 border border-gray-800/80 hover:border-butter/20 transition-all block group"
                    >
                      <p className="text-xs font-medium text-white truncate group-hover:text-butter transition-colors">
                        {session.question}
                      </p>
                      <div className="flex justify-between items-center mt-2 text-[10px] text-gray-400 font-light">
                        <span>Score: {session.analysis?.hiveScore || 0}%</span>
                        <span>{new Date(session.timestamp).toLocaleDateString()}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bookmarks Panel */}
          <div className="p-6 rounded-2xl glass-card border-butter/10 space-y-4 max-h-[360px] overflow-y-auto">
            <div className="flex items-center border-b border-gray-800 pb-3">
              <h3 className="text-sm font-semibold text-butter uppercase tracking-wider flex items-center gap-2">
                <Bookmark className="w-4 h-4" />
                <span>Bookmarked Answers</span>
              </h3>
            </div>

            {bookmarks.length === 0 ? (
              <p className="text-xs text-gray-400 py-8 text-center font-light">
                No bookmarked items. Toggle bookmarks inside comparison cards.
              </p>
            ) : (
              <div className="space-y-3 mt-3 overflow-y-auto max-h-[220px] pr-1">
                {bookmarks.map((bookmark) => (
                  <div 
                    key={bookmark.id}
                    className="p-3 rounded-lg bg-darkgreen-muted/30 border border-gray-800/80 space-y-2"
                  >
                    <div className="flex justify-between items-start gap-1">
                      <span className="text-[10px] bg-butter/10 text-butter border border-butter/25 px-1.5 py-0.5 rounded font-medium">
                        {bookmark.modelName}
                      </span>
                      <span className="text-[9px] text-gray-500">
                        {new Date(bookmark.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-300 font-medium line-clamp-1">
                      Q: {bookmark.question}
                    </p>
                    <p className="text-[10px] text-gray-400 line-clamp-2 font-light">
                      {bookmark.answer}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
        <div className="p-5 rounded-xl glass-card border-butter/10 space-y-2">
          <div className="w-8 h-8 rounded bg-butter/10 text-butter flex items-center justify-center font-semibold text-sm">01</div>
          <h4 className="font-semibold text-white">Multi AI Comparison</h4>
          <p className="text-xs text-gray-400 font-light leading-relaxed">
            Run requests across models simultaneously to prevent single-source bias.
          </p>
        </div>
        <div className="p-5 rounded-xl glass-card border-butter/10 space-y-2">
          <div className="w-8 h-8 rounded bg-butter/10 text-butter flex items-center justify-center font-semibold text-sm">02</div>
          <h4 className="font-semibold text-white">Consensus Engine</h4>
          <p className="text-xs text-gray-400 font-light leading-relaxed">
            Auto-cluster model responses and calculate absolute similarity alignments.
          </p>
        </div>
        <div className="p-5 rounded-xl glass-card border-butter/10 space-y-2">
          <div className="w-8 h-8 rounded bg-butter/10 text-butter flex items-center justify-center font-semibold text-sm">03</div>
          <h4 className="font-semibold text-white">Queen Answer</h4>
          <p className="text-xs text-gray-400 font-light leading-relaxed">
            Produce one optimal answer combining strength perspectives from all systems.
          </p>
        </div>
        <div className="p-5 rounded-xl glass-card border-butter/10 space-y-2">
          <div className="w-8 h-8 rounded bg-butter/10 text-butter flex items-center justify-center font-semibold text-sm">04</div>
          <h4 className="font-semibold text-white">Hive Score</h4>
          <p className="text-xs text-gray-400 font-light leading-relaxed">
            View statistical agreement percentages to estimate answer consensus reliability.
          </p>
        </div>
      </div>
    </div>
  );
};
export default HomePage;
