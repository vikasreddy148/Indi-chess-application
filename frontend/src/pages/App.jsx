import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import LandingPage from './LandingPage';
import HomePage from './HomePage';
import GamePage from './GamePage';
import LocalGamePage from './LocalGamePage';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/game/:matchId" element={<ProtectedRoute><GamePage /></ProtectedRoute>} />
        <Route path="/local" element={<LocalGamePage />} />
      </Routes>
    </Router>
  );
}

export default App;
