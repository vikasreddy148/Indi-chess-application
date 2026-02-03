import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { Logo } from '../components/Logo.jsx'

export default function OAuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setUserFromOAuth } = useAuth()

  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      navigate('/login?error=' + encodeURIComponent(error), { replace: true })
      return
    }
    const token = searchParams.get('token')
    const userId = searchParams.get('userId')
    const username = searchParams.get('username')
    const email = searchParams.get('email')
    if (token && userId) {
      setUserFromOAuth(token, userId, username || null, email || null)
      navigate('/home', { replace: true })
    } else {
      navigate('/login?error=missing_token', { replace: true })
    }
  }, [searchParams, setUserFromOAuth, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex flex-col items-center justify-center gap-4">
      <Logo compact />
      <p className="text-white/80">Signing you in...</p>
      <svg className="animate-spin h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>
  )
}
