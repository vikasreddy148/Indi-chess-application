import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import LandingPage from './pages/LandingPage.jsx'
import LoginRegisterPage from './pages/LoginRegisterPage.jsx'
import HomePage from './pages/HomePage.jsx'
import GamePage from './pages/GamePage.jsx'
import LocalGamePage from './pages/LocalGamePage.jsx'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/home" replace />
  return children
}

function LandingOrRedirect() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/home" replace />
  return <LandingPage />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingOrRedirect />} />
      <Route path="/login" element={<PublicOnlyRoute><LoginRegisterPage /></PublicOnlyRoute>} />
      <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/game/:gameId" element={<ProtectedRoute><GamePage /></ProtectedRoute>} />
      <Route path="/local" element={<LocalGamePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
