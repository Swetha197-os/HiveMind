import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Brain, Settings, LogOut, History, UserCircle } from 'lucide-react';
import { useAuth } from '../utils/AuthContext';

export const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isLandingPage = location.pathname === '/';
  
  // If we are on the landing page and not logged in, we only show the logo
  const showNavLinks = user || !isLandingPage;

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-butter/10 bg-darkgreen/85">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-2.5 group">
          <div className="p-1.5 rounded-lg bg-butter text-darkgreen transition-transform group-hover:rotate-6">
            <Brain className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-butter transition-colors">
            <span className="text-butter">Hive</span>Mind
          </span>
        </Link>

        {/* Navigation Links / Actions */}
        {showNavLinks && (
          <div className="flex items-center space-x-4">
            <Link
              to="/compare"
              className="text-xs sm:text-sm text-gray-300 hover:text-butter transition-colors font-medium hidden sm:block"
            >
              New Compare
            </Link>
            
            <Link
              to="/history"
              className="text-xs sm:text-sm text-gray-300 hover:text-butter transition-colors font-medium flex items-center space-x-1"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </Link>

            <Link
              to="/settings"
              className="text-xs sm:text-sm text-gray-300 hover:text-butter transition-colors font-medium flex items-center space-x-1"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            <div className="w-px h-6 bg-gray-700/50 mx-2"></div>

            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-butter text-sm font-medium">
                  <UserCircle className="w-5 h-5" />
                  <span className="hidden md:inline">{user.displayName || user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs sm:text-sm text-gray-400 hover:text-red-400 transition-colors font-medium flex items-center space-x-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                {isLandingPage ? (
                  <>
                    <Link
                      to="/login"
                      className="text-xs sm:text-sm text-gray-300 hover:text-white transition-colors font-medium"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/signup"
                      className="text-xs sm:text-sm text-darkgreen bg-butter px-3 py-1.5 rounded-lg hover:bg-butter-dark transition-colors font-semibold"
                    >
                      Sign up
                    </Link>
                  </>
                ) : (
                  <div className="flex items-center space-x-1 text-xs sm:text-sm text-butter bg-butter/10 px-3 py-1.5 rounded-lg border border-butter/20 font-medium">
                    <UserCircle className="w-4 h-4" />
                    <span>Guest Mode</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </header>
  );
};

export default Navigation;
