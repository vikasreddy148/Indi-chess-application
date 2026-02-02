import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

function LandingPage() {
  const { user, isAuthenticated, login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('');
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(username, email, password, country || null);
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(usernameOrEmail, loginPassword);
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-5xl font-bold mb-2">IndiChess</h1>
          <p className="text-lg text-stone-300 mb-8">Welcome, {user.username}</p>
          <Link
            to="/home"
            className="inline-block px-8 py-3 bg-amber-500 hover:bg-amber-400 text-stone-900 rounded-lg font-semibold transition"
          >
            Play Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-white text-center mb-2">IndiChess</h1>
        <p className="text-stone-400 text-center mb-8">Play Chess Online</p>

        <div className="bg-stone-800/60 rounded-xl p-6 border border-stone-700">
          <div className="flex gap-4 mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-2 rounded-lg font-medium transition ${mode === 'login' ? 'bg-amber-500 text-stone-900' : 'text-stone-400 hover:text-white'}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); }}
              className={`flex-1 py-2 rounded-lg font-medium transition ${mode === 'register' ? 'bg-amber-500 text-stone-900' : 'text-stone-400 hover:text-white'}`}
            >
              Register
            </button>
          </div>

          {error && (
            <p className="text-rose-400 text-sm mb-4">{error}</p>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="text"
                placeholder="Username or Email"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-stone-900 border border-stone-600 text-white placeholder-stone-500 focus:ring-2 focus:ring-amber-500 outline-none"
              />
              <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-stone-900 border border-stone-600 text-white placeholder-stone-500 focus:ring-2 focus:ring-amber-500 outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold transition disabled:opacity-60"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={4}
                className="w-full px-4 py-3 rounded-lg bg-stone-900 border border-stone-600 text-white placeholder-stone-500 focus:ring-2 focus:ring-amber-500 outline-none"
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-stone-900 border border-stone-600 text-white placeholder-stone-500 focus:ring-2 focus:ring-amber-500 outline-none"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-lg bg-stone-900 border border-stone-600 text-white placeholder-stone-500 focus:ring-2 focus:ring-amber-500 outline-none"
              />
              <input
                type="text"
                placeholder="Country (optional)"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-stone-900 border border-stone-600 text-white placeholder-stone-500 focus:ring-2 focus:ring-amber-500 outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold transition disabled:opacity-60"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
