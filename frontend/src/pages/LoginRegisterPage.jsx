import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { Logo } from '../components/Logo.jsx'
import { Button } from '../components/Button.jsx'
import { Input } from '../components/Input.jsx'
import { getOAuthBase } from '../config/api.js'

const TAB_LOGIN = 'login'
const TAB_REGISTER = 'register'

export default function LoginRegisterPage() {
  const navigate = useNavigate()
  const { login, register } = useAuth()
  const [tab, setTab] = useState(TAB_LOGIN)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (tab === TAB_LOGIN) {
      if (!username.trim() || !password) {
        setError('Please enter username or email and password.')
        return
      }
      setLoading(true)
      try {
        await login(username.trim(), password)
        navigate('/home', { replace: true })
      } catch (err) {
        setError(err.message || 'Login failed.')
      } finally {
        setLoading(false)
      }
    } else {
      if (!username.trim() || !email.trim() || !password) {
        setError('Please fill in username, email, and password.')
        return
      }
      const u = username.trim()
      if (u.length < 4 || u.length > 50) {
        setError('Username must be between 4 and 50 characters.')
        return
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.')
        return
      }
      setLoading(true)
      try {
        await register(u, email.trim(), password)
        navigate('/home', { replace: true })
      } catch (err) {
        setError(err.message || 'Registration failed.')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen flex bg-[#fafafa]">
      <div className="hidden lg:flex flex-1 bg-indigo-600 p-12 items-center justify-center">
        <div className="max-w-md">
          <h2 className="text-4xl font-bold text-white tracking-tight">
            Play chess the way it was meant to be played.
          </h2>
          <p className="text-indigo-100 mt-6 text-lg leading-relaxed">
            Real-time games, fair matchmaking, and a beautiful interface. Join thousands of players.
          </p>
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-md mx-auto">
          <Link to="/" className="inline-block mb-12">
            <Logo compact />
          </Link>
          <div className="flex rounded-xl bg-slate-100 p-1 mb-8">
            <button
              type="button"
              onClick={() => { setTab(TAB_LOGIN); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                tab === TAB_LOGIN ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => { setTab(TAB_REGISTER); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                tab === TAB_REGISTER ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create account
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              type="text"
              placeholder="Username or email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete={tab === TAB_LOGIN ? 'username' : 'username'}
            />
            {tab === TAB_REGISTER && (
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            )}
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={tab === TAB_LOGIN ? 'current-password' : 'new-password'}
            />
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Please wait…' : tab === TAB_LOGIN ? 'Sign in' : 'Create account'}
            </Button>
          </form>
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-transparent px-4 text-sm text-slate-500">or</span>
            </div>
          </div>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => {
              const base = getOAuthBase()
              window.location.href = base ? `${base}/oauth2/authorization/google` : '/oauth2/authorization/google'
            }}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </Button>
          <p className="mt-8 text-center text-sm text-slate-500">
            {tab === TAB_LOGIN ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => { setTab(tab === TAB_LOGIN ? TAB_REGISTER : TAB_LOGIN); setError(''); }}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              {tab === TAB_LOGIN ? 'Create account' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
