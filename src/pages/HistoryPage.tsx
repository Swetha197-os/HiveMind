import React from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Brain, ArrowRight, Clock, Star } from 'lucide-react';
import { useHiveMind } from '../utils/HiveMindContext';
import { useAuth } from '../utils/AuthContext';

export const HistoryPage: React.FC = () => {
  const { history, loadSession } = useHiveMind();
  const { user, isAuthSetup } = useAuth();
  const navigate = useNavigate();

  const handleResumeSession = (session: any) => {
    loadSession(session);
    navigate('/analysis');
  };

  return (
    <div className="flex flex-col flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative">
      <div className="flex items-center space-x-3 mb-2">
        <div className="p-2.5 rounded-xl bg-darkgreen border border-butter/20 shadow-lg">
          <History className="w-6 h-6 text-butter" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Your History</h1>
          <p className="text-gray-400 text-sm mt-1">Review past consensus runs</p>
        </div>
      </div>

      {!user && isAuthSetup && (
        <div className="bg-darkgreen-muted border border-butter/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center space-x-3 mb-3 sm:mb-0">
            <Star className="w-5 h-5 text-butter" />
            <p className="text-sm text-gray-300">
              You are using a temporary guest session. History is saved locally.
            </p>
          </div>
          <button
            onClick={() => navigate('/signup')}
            className="text-darkgreen bg-butter px-4 py-2 rounded-lg text-sm font-semibold hover:bg-butter-dark transition-colors"
          >
            Create Account to Sync
          </button>
        </div>
      )}

      {history.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="p-4 rounded-full bg-darkgreen-muted border border-gray-800">
            <Brain className="w-12 h-12 text-gray-600" />
          </div>
          <h3 className="text-xl font-semibold text-white">No saved comparisons yet.</h3>
          <p className="text-gray-400 max-w-sm">
            Run your first AI comparison to see it saved here.
          </p>
          <button
            onClick={() => navigate('/compare')}
            className="mt-4 px-6 py-3 bg-butter text-darkgreen font-semibold rounded-xl hover:bg-butter-dark transition-colors"
          >
            Start Comparing
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {history.map((session) => (
            <div 
              key={session.id}
              className="glass-card border border-gray-800/60 rounded-2xl p-5 hover:border-butter/30 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(session.timestamp).toLocaleString()}</span>
                  <span className="px-2 py-0.5 rounded-full bg-gray-800 text-gray-300">
                    {session.selectedModels.length} models
                  </span>
                  {session.analysis && (
                    <span className="px-2 py-0.5 rounded-full bg-butter/10 text-butter border border-butter/20">
                      Score: {session.analysis.hiveScore}%
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-medium text-white truncate group-hover:text-butter transition-colors">
                  {session.question}
                </h3>
              </div>
              
              <button
                onClick={() => handleResumeSession(session)}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-gray-700 text-gray-300 hover:bg-butter hover:text-darkgreen hover:border-butter transition-all font-medium text-sm flex-shrink-0"
              >
                View Details
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
