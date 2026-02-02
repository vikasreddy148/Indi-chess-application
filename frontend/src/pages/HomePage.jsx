import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { Logo } from '../components/Logo.jsx'
import { Button } from '../components/Button.jsx'
import { Card, CardHeader, CardTitle, CardBody } from '../components/Card.jsx'
import { Badge } from '../components/Badge.jsx'
import { Input } from '../components/Input.jsx'

const GAME_TYPES = [
  { value: 'rapid', label: 'Rapid (10+0)' },
  { value: 'blitz', label: 'Blitz (3+2)' },
  { value: 'classical', label: 'Classical (30+0)' },
]

const DUMMY_GAMES = [
  { id: '98765', status: 'Ongoing', result: 'Live' },
  { id: '98764', status: 'Finished', result: 'Won' },
  { id: '98763', status: 'Draw', result: 'Draw' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [gameType, setGameType] = useState('rapid')
  const [findingMatch, setFindingMatch] = useState(false)
  const [matchSeconds, setMatchSeconds] = useState(0)
  const [profileCollapsed, setProfileCollapsed] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileUsername, setProfileUsername] = useState(user?.username ?? '')
  const [profileEmail, setProfileEmail] = useState(user?.email ?? '')

  const startFindingMatch = () => {
    setFindingMatch(true)
    setMatchSeconds(0)
    const t = setInterval(() => {
      setMatchSeconds((s) => {
        if (s >= 59) clearInterval(t)
        return s + 1
      })
    }, 1000)
    setTimeout(() => {
      clearInterval(t)
      setFindingMatch(false)
      navigate('/game/dummy-1')
    }, 5000)
  }

  const formatTimer = (s) => `0:${String(s).padStart(2, '0')}`

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-slate-900/90 backdrop-blur-md border-b border-white/5">
        <Link to="/home" className="flex items-center gap-2">
          <Logo compact />
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400 font-bold">
              {user?.username?.charAt(0)?.toUpperCase() ?? 'P'}
            </div>
            <div>
              <p className="font-semibold text-white">{user?.username ?? 'Player123'}</p>
              <p className="text-sm text-emerald-400">Rating: {user?.rating ?? 1200}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="text-white/80 hover:text-white font-medium transition-colors"
          >
            → Logout
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Play Online</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Game Type</label>
              <select
                value={gameType}
                onChange={(e) => setGameType(e.target.value)}
                className="w-full rounded-xl border border-emerald-500/40 bg-white/5 py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              >
                {GAME_TYPES.map((g) => (
                  <option key={g.value} value={g.value} className="bg-slate-800 text-white">
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <Button
                variant="primary"
                className="rounded-xl px-6 py-3"
                onClick={startFindingMatch}
                disabled={findingMatch}
              >
                Find Match
              </Button>
              {findingMatch && (
                <div className="flex items-center gap-3 text-white/80">
                  <svg className="animate-spin h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Finding opponent...</span>
                  <span className="font-mono">{formatTimer(matchSeconds)}</span>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between cursor-pointer" onClick={() => setProfileCollapsed((c) => !c)}>
            <CardTitle>Profile</CardTitle>
            <svg className={`w-5 h-5 text-white/70 transition-transform ${profileCollapsed ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </CardHeader>
          {!profileCollapsed && (
            <CardBody>
              <div className="flex gap-6">
                <div className="w-20 h-20 rounded-full bg-emerald-500/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400 text-2xl font-bold shrink-0">
                  {user?.username?.charAt(0)?.toUpperCase() ?? 'P'}
                </div>
                <div className="flex-1 space-y-4 min-w-0">
                  <p className="text-white/80">Country: {user?.country ?? 'USA'}</p>
                  {editingProfile ? (
                    <>
                      <Input
                        label="Username"
                        value={profileUsername}
                        onChange={(e) => setProfileUsername(e.target.value)}
                        className="bg-white/5 border-emerald-500/40"
                      />
                      <Input
                        label="Email"
                        type="email"
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        className="bg-white/5 border-emerald-500/40"
                      />
                      <div className="flex gap-2">
                        <Button variant="primary" className="rounded-xl" onClick={() => setEditingProfile(false)}>Save</Button>
                        <Button variant="secondary" className="rounded-xl" onClick={() => setEditingProfile(false)}>Cancel</Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Input
                        label="Username"
                        value={profileUsername}
                        readOnly
                        className="bg-white/5 border-emerald-500/40"
                      />
                      <Input
                        label="Email"
                        value={profileEmail}
                        readOnly
                        className="bg-white/5 border-emerald-500/40"
                      />
                      <button type="button" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium">
                        Change Password
                      </button>
                      <div className="flex gap-2">
                        <Button variant="primary" className="rounded-xl" onClick={() => setEditingProfile(true)}>Edit</Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardBody>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Games</CardTitle>
          </CardHeader>
          <CardBody className="p-0">
            <ul className="divide-y divide-white/10">
              {DUMMY_GAMES.map((g) => (
                <li key={g.id}>
                  <Link
                    to={`/game/${g.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="text-white/80">Game ID: #{g.id}</span>
                      <span className="text-white/80">Status: {g.status}</span>
                      <Badge variant={g.result === 'Live' ? 'live' : g.result === 'Won' ? 'success' : 'draw'}>
                        {g.result}
                      </Badge>
                    </div>
                    <span className="text-white/50 group-hover:text-emerald-400">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <footer className="text-center py-6">
          <Link to="/local" className="text-emerald-400 hover:text-emerald-300 font-medium">
            Play locally (2 players)
          </Link>
        </footer>
      </main>
    </div>
  )
}
