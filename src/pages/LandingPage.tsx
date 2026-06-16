import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowRight, Zap, Combine, ShieldCheck, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '../utils/AuthContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthSetup } = useAuth();

  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center overflow-hidden">
      
      {/* Background Floating Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-butter/5 rounded-full mix-blend-screen filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-green-500/10 rounded-full mix-blend-screen filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-1/4 left-1/2 w-96 h-96 bg-teal-500/10 rounded-full mix-blend-screen filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 flex flex-col items-center text-center space-y-12">
        
        {/* Animated Logo */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-butter to-green-400 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
          <div className="relative p-6 bg-darkgreen rounded-full border border-butter/20 glass-card">
            <Brain className="w-20 h-20 text-butter" />
          </div>
        </div>

        {/* Hero Text */}
        <div className="space-y-6">
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 tracking-tight">
            Hive<span className="text-butter">Mind</span>
          </h1>
          <p className="text-xl md:text-2xl font-light text-butter tracking-wide">
            One Question. Many Minds. One Consensus.
          </p>
          <p className="max-w-2xl mx-auto text-base md:text-lg text-gray-400 font-light leading-relaxed">
            Compare multiple AI models, discover agreements, and generate a final synthesized Queen Answer.
          </p>
        </div>

        {/* CTA Button */}
        <div className="flex flex-col items-center gap-6">
          {user ? (
            <button
              onClick={() => navigate('/compare')}
              className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-darkgreen bg-butter rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(255,239,179,0.6)] focus:outline-none focus:ring-2 focus:ring-butter focus:ring-offset-2 focus:ring-offset-darkgreen active:scale-95"
            >
              <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
              <span className="relative flex items-center gap-2">
                Start Comparing
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          ) : !isAuthSetup ? (
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={() => navigate('/compare')}
                className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-darkgreen bg-butter rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(255,239,179,0.6)] focus:outline-none focus:ring-2 focus:ring-butter focus:ring-offset-2 focus:ring-offset-darkgreen active:scale-95"
              >
                <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
                <span className="relative flex items-center gap-2">
                  Start Comparing
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              <p className="text-sm text-gray-400 font-medium">
                No account required. Explore HiveMind instantly.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={() => navigate('/signup')}
                  className="flex items-center gap-2 px-8 py-3.5 font-bold text-darkgreen bg-butter rounded-full transition-all duration-300 hover:scale-105 shadow-[0_0_20px_-5px_rgba(255,239,179,0.4)]"
                >
                  <UserPlus className="w-5 h-5" />
                  Sign Up
                </button>
                
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-2 px-8 py-3.5 font-bold text-butter border border-butter/30 bg-darkgreen rounded-full transition-all duration-300 hover:bg-butter/10 hover:scale-105"
                >
                  <LogIn className="w-5 h-5" />
                  Log In
                </button>
                
                <button
                  onClick={() => navigate('/compare')}
                  className="flex items-center gap-2 px-6 py-3.5 font-medium text-gray-300 hover:text-white transition-all duration-300"
                >
                  Continue as Guest
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-16">
          <div className="p-6 rounded-2xl glass-card border border-gray-800/60 bg-darkgreen-muted/30 backdrop-blur-sm flex flex-col items-center text-center space-y-3">
            <Zap className="w-8 h-8 text-butter/80" />
            <h3 className="text-white font-semibold">Simultaneous Query</h3>
            <p className="text-xs text-gray-400 font-light leading-relaxed">
              Query multiple premium LLMs concurrently without tab-switching.
            </p>
          </div>
          <div className="p-6 rounded-2xl glass-card border border-gray-800/60 bg-darkgreen-muted/30 backdrop-blur-sm flex flex-col items-center text-center space-y-3">
            <Combine className="w-8 h-8 text-butter/80" />
            <h3 className="text-white font-semibold">Consensus Engine</h3>
            <p className="text-xs text-gray-400 font-light leading-relaxed">
              Intelligently groups models by perspective to extract core truths.
            </p>
          </div>
          <div className="p-6 rounded-2xl glass-card border border-gray-800/60 bg-darkgreen-muted/30 backdrop-blur-sm flex flex-col items-center text-center space-y-3">
            <ShieldCheck className="w-8 h-8 text-butter/80" />
            <h3 className="text-white font-semibold">Fallback Protection</h3>
            <p className="text-xs text-gray-400 font-light leading-relaxed">
              Gracefully handles API rate limits to keep analysis stable.
            </p>
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}} />
    </div>
  );
};

export default LandingPage;
