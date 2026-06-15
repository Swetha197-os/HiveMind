import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { HiveMindProvider } from './utils/HiveMindContext';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import ResponsesPage from './pages/ResponsesPage';
import AnalysisPage from './pages/AnalysisPage';
import SettingsPage from './pages/SettingsPage';
import Footer from './components/Footer';
import { Brain, Settings } from 'lucide-react';

function App() {
  return (
    <HiveMindProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          {/* Header Navigation */}
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
              <div className="flex items-center space-x-4">
                <Link
                  to="/compare"
                  className="text-xs sm:text-sm text-gray-300 hover:text-butter transition-colors font-medium"
                >
                  New Compare
                </Link>
                
                <Link
                  to="/settings"
                  className="text-xs sm:text-sm text-gray-300 hover:text-butter transition-colors font-medium flex items-center space-x-1"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
              </div>

            </div>
          </header>

          {/* Main Workspace content */}
          <main className="flex-1 w-full">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/compare" element={<HomePage />} />
              <Route path="/responses" element={<ResponsesPage />} />
              <Route path="/analysis" element={<AnalysisPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>

          {/* Footer branding */}
          <Footer />
        </div>
      </Router>
    </HiveMindProvider>
  );
}

export default App;
