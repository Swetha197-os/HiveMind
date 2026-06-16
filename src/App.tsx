import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HiveMindProvider } from './utils/HiveMindContext';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import ResponsesPage from './pages/ResponsesPage';
import AnalysisPage from './pages/AnalysisPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HistoryPage from './pages/HistoryPage';
import Footer from './components/Footer';
import Navigation from './components/Navigation';
import { AuthProvider } from './utils/AuthContext';

function App() {
  return (
    <AuthProvider>
      <HiveMindProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
          {/* Header Navigation */}
          <Navigation />

          {/* Main Workspace content */}
          <main className="flex-1 w-full">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/compare" element={<HomePage />} />
              <Route path="/responses" element={<ResponsesPage />} />
              <Route path="/analysis" element={<AnalysisPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/history" element={<HistoryPage />} />
            </Routes>
          </main>

          {/* Footer branding */}
          <Footer />
        </div>
      </Router>
    </HiveMindProvider>
  </AuthProvider>
  );
}

export default App;
