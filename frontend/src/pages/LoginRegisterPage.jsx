import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { Logo } from '../components/Logo.jsx'
import { Button } from '../components/Button.jsx'
import { Input } from '../components/Input.jsx'
import { getApiBase } from '../config/api.js'

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
      setLoading(true)
      try {
        await register(username.trim(), email.trim(), password)
        navigate('/home', { replace: true })
      } catch (err) {
        setError(err.message || 'Registration failed.')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(16,185,129,0.03) 40px, rgba(16,185,129,0.03) 41px),
            repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(16,185,129,0.03) 40px, rgba(16,185,129,0.03) 41px)`,
        }}
      />
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-emerald-500/5 rounded-full blur-3xl" />

      <header className="relative pt-12 pb-8 px-6 flex flex-col items-center gap-2">
        <Logo showTagline />
      </header>

      <main className="relative flex-1 flex items-start justify-center px-6 pb-16">
        <div className="w-full max-w-md rounded-xl bg-white/5 backdrop-blur-xl border border-emerald-500/30 shadow-2xl shadow-black/30 p-6">
          <div className="flex rounded-xl overflow-hidden bg-white/5 border border-white/10 p-0.5 mb-6">
            <button
              type="button"
              onClick={() => { setTab(TAB_LOGIN); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg font-semibold transition-all ${
                tab === TAB_LOGIN
                  ? 'bg-emerald-500 text-white shadow'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => { setTab(TAB_REGISTER); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg font-semibold transition-all ${
                tab === TAB_REGISTER
                  ? 'bg-emerald-500 text-white shadow'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Username or Email"
              icon="user"
              value={tab === TAB_REGISTER ? username : username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete={tab === TAB_LOGIN ? 'username' : 'username'}
              aria-label="Username or Email"
            />
            {tab === TAB_REGISTER && (
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                aria-label="Email"
                className="pl-4"
              />
            )}
            <Input
              type="password"
              placeholder="Password"
              icon="lock"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={tab === TAB_LOGIN ? 'current-password' : 'new-password'}
              aria-label="Password"
            />

            {error && (
              <div className="rounded-xl bg-red-500/20 border border-red-500/50 px-4 py-3 flex items-center gap-2 text-red-200 text-sm">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white font-bold">!</span>
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" className="w-full py-3.5 rounded-xl" disabled={loading}>
              {loading ? 'Please wait…' : tab === TAB_LOGIN ? 'Sign In' : 'Create Account'}
            </Button>

            <Button
              type="button"
              variant="secondary"
              className="w-full py-3.5 rounded-xl border border-emerald-500/50 flex items-center justify-center gap-2"
              onClick={() => {
                const base = getApiBase()
                const url = base ? `${base}/oauth2/authorization/google` : '/oauth2/authorization/google'
                window.location.href = url
              }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </Button>
          </form>

          <p className="mt-6 text-center text-white/70 text-sm">
            {tab === TAB_LOGIN ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => { setTab(tab === TAB_LOGIN ? TAB_REGISTER : TAB_LOGIN); setError(''); }}
              className="text-emerald-400 hover:text-emerald-300 font-medium"
            >
              {tab === TAB_LOGIN ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
      </main>
    </div>
  )
}
