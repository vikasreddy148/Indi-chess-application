import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { joinMatchmaking, leaveMatchmaking, getUserMatches, GAME_TYPES } from '../api/match.js';
import { createStompClient, subscribeToMatchmaking } from '../ws/stompClient.js';

function HomePage() {
  const { user, isAuthenticated, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [gameType, setGameType] = useState('RAPID');
  const [status, setStatus] = useState('idle'); // idle | finding | error
  const [error, setError] = useState(null);
  const [userMatches, setUserMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editCountry, setEditCountry] = useState('');
  const [editPfpUrl, setEditPfpUrl] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState(null);

  const matchmakingClientRef = useRef(null);

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
      // Waiting - WebSocket and polling will detect when match is found
    } catch (e) {
      setError(e.message || 'Failed to find match');
      setStatus('idle');
    }
  };

  const cancelSearch = async () => {
    try {
      await leaveMatchmaking();
    } catch (_) {}
    if (matchmakingClientRef.current) {
      matchmakingClientRef.current.deactivate?.();
      matchmakingClientRef.current = null;
    }
    setStatus('idle');
    setError(null);
  };

  useEffect(() => {
    if (status !== 'finding' || !user?.userId) return;
    const client = createStompClient({
      onConnect: () => {
        const unsub = subscribeToMatchmaking(client, user.userId, (match) => {
          if (match?.id) navigate(`/game/${match.id}`);
        });
        client._matchmakingUnsub = unsub;
      },
    });
    matchmakingClientRef.current = client;
    client.activate();
    return () => {
      client._matchmakingUnsub?.();
      client.deactivate?.();
      matchmakingClientRef.current = null;
    };
  }, [status, user?.userId, navigate]);

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
    }, 3000);
    return () => clearInterval(interval);
  }, [status, user?.userId, navigate]);

  useEffect(() => {
    if (!user?.userId) {
      setMatchesLoading(false);
      return;
    }
    let cancelled = false;
    setMatchesLoading(true);
    getUserMatches(user.userId)
      .then((list) => {
        if (!cancelled) setUserMatches(list || []);
      })
      .catch(() => {
        if (!cancelled) setUserMatches([]);
      })
      .finally(() => {
        if (!cancelled) setMatchesLoading(false);
      });
    return () => { cancelled = true; };
  }, [user?.userId]);

  useEffect(() => {
    if (user) {
      setEditCountry(user.country ?? '');
      setEditPfpUrl(user.pfpUrl ?? '');
    }
  }, [user?.userId, user?.country, user?.pfpUrl]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSaving(true);
    try {
      await updateProfile({ country: editCountry || null, pfpUrl: editPfpUrl || null });
      setShowEditProfile(false);
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <p className="text-white">Please log in to play.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      <header className="max-w-2xl mx-auto flex justify-between items-center mb-12 flex-wrap gap-2">
        <h1 className="text-2xl font-bold tracking-tight">IndiChess</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-stone-300">
            {user.username} · Rating {user.rating ?? 1200}
          </span>
          <button
            type="button"
            onClick={() => logout().then(() => navigate('/'))}
            className="text-sm text-stone-400 hover:text-white transition"
          >
            Log out
          </button>
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

        <div className="pt-6 border-t border-stone-700/80">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-stone-200">Profile</h3>
            <button
              type="button"
              onClick={() => { setShowEditProfile(!showEditProfile); setProfileError(null); }}
              className="text-sm text-amber-400 hover:text-amber-300 transition"
            >
              {showEditProfile ? 'Cancel' : 'Edit profile'}
            </button>
          </div>
          {showEditProfile ? (
            <form onSubmit={handleSaveProfile} className="space-y-3 mb-4">
              <div>
                <label className="block text-sm text-stone-400 mb-1">Country</label>
                <input
                  type="text"
                  value={editCountry}
                  onChange={(e) => setEditCountry(e.target.value)}
                  placeholder="e.g. India"
                  className="w-full px-4 py-2 rounded-lg bg-stone-800 border border-stone-600 text-white placeholder-stone-500 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-stone-400 mb-1">Profile picture URL</label>
                <input
                  type="url"
                  value={editPfpUrl}
                  onChange={(e) => setEditPfpUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2 rounded-lg bg-stone-800 border border-stone-600 text-white placeholder-stone-500 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
              {profileError && <p className="text-rose-400 text-sm">{profileError}</p>}
              <button
                type="submit"
                disabled={profileSaving}
                className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-900 font-medium transition disabled:opacity-60"
              >
                {profileSaving ? 'Saving…' : 'Save'}
              </button>
            </form>
          ) : (
            <p className="text-stone-400 text-sm">
              {user.country ? `Country: ${user.country}` : 'No country set'}
              {user.pfpUrl && ' · Profile picture set'}
            </p>
          )}
        </div>

        <div className="pt-8 border-t border-stone-700/80">
          <h3 className="text-lg font-semibold text-stone-200 mb-3">Your games</h3>
          {matchesLoading ? (
            <p className="text-stone-500 text-sm">Loading…</p>
          ) : userMatches.length === 0 ? (
            <p className="text-stone-500 text-sm">No games yet. Start a match above.</p>
          ) : (
            <ul className="space-y-2">
              {userMatches.slice(0, 10).map((m) => {
                const isOngoing = m.status === 'ONGOING';
                const label =
                  m.status === 'ONGOING'
                    ? 'Ongoing'
                    : m.status === 'PLAYER1_WON' || m.status === 'PLAYER2_WON'
                      ? 'Finished'
                      : m.status === 'DRAW' || m.status === 'ABANDONED'
                        ? 'Draw / Over'
                        : m.status ?? 'Game';
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => navigate(`/game/${m.id}`)}
                      className="w-full text-left px-4 py-3 rounded-lg bg-stone-800/80 border border-stone-600 hover:border-amber-500/50 hover:bg-stone-700/80 transition flex justify-between items-center"
                    >
                      <span className="text-white font-medium">
                        Game {m.id}
                        {isOngoing && (
                          <span className="ml-2 text-xs text-amber-400">• Live</span>
                        )}
                      </span>
                      <span className="text-stone-400 text-sm">{label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="pt-6 text-center">
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
