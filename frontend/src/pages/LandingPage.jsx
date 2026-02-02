import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-6xl font-bold mb-4">IndiChess</h1>
        <p className="text-xl mb-8">Play Chess Online</p>
        <div className="flex gap-4 justify-center">
          <Link
            to={isAuthenticated ? '/home' : '/home'}
            className="px-8 py-3 bg-white text-purple-900 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            {isAuthenticated ? 'Go to Home' : 'Get Started'}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
