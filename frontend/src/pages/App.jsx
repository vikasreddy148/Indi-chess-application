import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import HomePage from './HomePage';
import GamePage from './GamePage';
import LocalGamePage from './LocalGamePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/game/:matchId" element={<GamePage />} />
        <Route path="/local" element={<LocalGamePage />} />
      </Routes>
    </Router>
  );
}

export default App;
