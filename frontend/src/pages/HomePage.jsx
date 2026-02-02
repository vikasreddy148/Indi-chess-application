import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { joinMatchmaking, leaveMatchmaking, getUserMatches, GAME_TYPES } from '../api/match.js';

function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [gameType, setGameType] = useState('RAPID');
  const [status, setStatus] = useState('idle'); // idle | finding | error
  const [error, setError] = useState(null);

  const handleFindMatch = async () => {
    if (!user?.userId) return;
    setError(null);
    setStatus('finding');
    try {
      const res = await joinMatchmaking(gameType);
      if (res?.id) {
        navigate(`/game/${res.id}`);
        return;
      }
      // Waiting - polling effect will check for new match
    } catch (e) {
      setError(e.message || 'Failed to find match');
      setStatus('idle');
    }
  };

  const cancelSearch = async () => {
    try {
      await leaveMatchmaking();
    } catch (_) {}
    setStatus('idle');
    setError(null);
  };

  useEffect(() => {
    if (status !== 'finding' || !user?.userId) return;
    const interval = setInterval(async () => {
      try {
        const matches = await getUserMatches(user.userId);
        const recent = (matches || []).filter((m) => {
          if (m.status !== 'ONGOING') return false;
          const started = m.startedAt ? new Date(m.startedAt).getTime() : 0;
          return Date.now() - started < 60_000;
        });
        if (recent.length > 0) {
          navigate(`/game/${recent[0].id}`);
        }
      } catch (_) {}
    }, 2000);
    return () => clearInterval(interval);
  }, [status, user?.userId, navigate]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <p className="text-white">Please log in to play.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      <header className="max-w-2xl mx-auto flex justify-between items-center mb-12">
        <h1 className="text-2xl font-bold tracking-tight">IndiChess</h1>
        <div className="text-sm text-stone-300">
          {user.username} · Rating {user.rating ?? 1200}
        </div>
      </header>

      <main className="max-w-md mx-auto space-y-6">
        <h2 className="text-xl font-semibold text-center">Play Online</h2>

        <div>
          <label className="block text-sm text-stone-400 mb-2">Game Type</label>
          <select
            value={gameType}
            onChange={(e) => setGameType(e.target.value)}
            disabled={status === 'finding'}
            className="w-full px-4 py-3 rounded-lg bg-stone-800/80 border border-stone-600 text-white focus:ring-2 focus:ring-amber-500 outline-none disabled:opacity-60"
          >
            {GAME_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0) + t.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        {status === 'idle' && (
          <button
            onClick={handleFindMatch}
            className="w-full py-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold transition"
          >
            Find Match
          </button>
        )}

        {status === 'finding' && (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 py-4">
              <span className="animate-pulse">●</span>
              <span>Finding opponent...</span>
            </div>
            <button
              onClick={cancelSearch}
              className="w-full py-2 rounded-lg border border-stone-500 text-stone-300 hover:bg-stone-800 transition"
            >
              Cancel
            </button>
          </div>
        )}

        {error && (
          <p className="text-rose-400 text-sm text-center">{error}</p>
        )}

        <div className="pt-8 text-center">
          <Link
            to="/local"
            className="text-stone-400 hover:text-white transition"
          >
            Play locally (2 players)
          </Link>
        </div>
      </main>
    </div>
  );
}

export default HomePage;
