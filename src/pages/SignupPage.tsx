import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { Brain, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../utils/AuthContext';

export const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { isAuthSetup } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!auth || !isAuthSetup) {
      setError('Authentication is not configured.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Update profile with name
      if (name.trim()) {
        await updateProfile(userCredential.user, { displayName: name });
      }
      navigate('/compare');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-card rounded-2xl p-8 border border-butter/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-butter/20 via-butter to-green-400"></div>
        
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-darkgreen rounded-xl border border-butter/20 mb-4 shadow-[0_0_15px_rgba(255,239,179,0.15)]">
            <Brain className="w-8 h-8 text-butter" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Create Account</h2>
          <p className="text-sm text-gray-400 mt-2 text-center">Join HiveMind to save and analyze your consensus runs</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-red-200">{error}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-[#001f1c] border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-butter focus:ring-1 focus:ring-butter transition-all"
              placeholder="Swetha"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#001f1c] border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-butter focus:ring-1 focus:ring-butter transition-all"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#001f1c] border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-butter focus:ring-1 focus:ring-butter transition-all"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full bg-[#001f1c] border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-butter focus:ring-1 focus:ring-butter transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !isAuthSetup}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-butter text-darkgreen rounded-xl font-bold transition-all hover:bg-butter-dark hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-butter hover:underline font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
