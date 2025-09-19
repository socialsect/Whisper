import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import SurveyPage from './pages/SurveyPage';
import ThankYouPage from './pages/ThankYouPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Footer from './components/Footer';
import './App.css';

function App() {
  useEffect(() => {
    // Prevent duplicate console messages in development
    if (window.whisperConsoleShown) return;
    window.whisperConsoleShown = true;
    
    // Styled console message with animation
    const showConsoleMessage = () => {
      const styles = [
        'color: #695af2',
        'background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
        'font-size: 16px',
        'font-weight: bold',
        'padding: 20px',
        'border-radius: 10px',
        'border: 2px solid #695af2',
        'text-shadow: 0 0 10px #695af2',
        'box-shadow: 0 0 20px rgba(105, 90, 242, 0.5)'
      ].join(';');

      const message = `
        🎯 WHISPER - Anonymous Feedback System
        ═══════════════════════════════════════
        
        🔒 Nothing to see here... 
        👀 (But we're watching you 👀)
        
        ✨ Built with React + Vite + Firebase
        🎨 Styled with CSS Modules
        🚀 Powered by Socialsect
        
        ═══════════════════════════════════════
        💜 Made with love for honest feedback
      `;

      console.log(`%c${message}`, styles);
      
      // Additional animated console messages
      setTimeout(() => {
        console.log('%c🎭 Psst... Your feedback is anonymous!', 'color: #8b5fff; font-size: 14px; font-weight: bold;');
      }, 1000);
      
      setTimeout(() => {
        console.log('%c🔍 Admin dashboard is watching...', 'color: #ff6b6b; font-size: 12px; font-style: italic;');
      }, 2000);
      
      setTimeout(() => {
        console.log('%c💡 Pro tip: Use the floating recommendation button!', 'color: #4ecdc4; font-size: 12px;');
      }, 3000);
      
      // Animated typing effect
      setTimeout(() => {
        const typingMessage = '🎪 Welcome to the Socialsect feedback circus!';
        let index = 0;
        const typingInterval = setInterval(() => {
          if (index < typingMessage.length) {
            console.log(`%c${typingMessage.slice(0, index + 1)}`, 'color: #ffd700; font-size: 14px; font-weight: bold;');
            index++;
          } else {
            clearInterval(typingInterval);
          }
        }, 100);
      }, 4000);
      
      // Final animated message
      setTimeout(() => {
        console.log('%c🎉 Thanks for using Whisper!', 'color: #695af2; font-size: 18px; font-weight: bold; text-shadow: 0 0 10px #695af2;');
      }, 6000);
    };

    showConsoleMessage();
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="app">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/survey" element={<SurveyPage />} />
              <Route path="/thank-you" element={<ThankYouPage />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
            </Routes>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
