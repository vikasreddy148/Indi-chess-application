import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { Logo } from '../components/Logo.jsx'
import { Button } from '../components/Button.jsx'
import { Card, CardHeader, CardTitle, CardBody } from '../components/Card.jsx'
import { Badge } from '../components/Badge.jsx'
import { Input } from '../components/Input.jsx'
import * as matchApi from '../api/match.js'
import * as userApi from '../api/users.js'
import * as ratingsApi from '../api/ratings.js'
import * as authApi from '../api/auth.js'
import {
  createStompClient,
  subscribeMatchmaking,
} from '../ws/stompClient.js'

const GAME_TYPES = [
  { value: 'rapid', label: 'Rapid (10+0)' },
  { value: 'blitz', label: 'Blitz (3+2)' },
  { value: 'classical', label: 'Classical (30+0)' },
]

function statusToBadge(status, myPlayerNumber) {
  if (status === 'ONGOING') return { variant: 'live', label: 'Live' }
  if (status === 'DRAW' || status === 'ABANDONED') return { variant: 'draw', label: status === 'DRAW' ? 'Draw' : 'Abandoned' }
  if (status === 'PLAYER1_WON') return { variant: myPlayerNumber === 1 ? 'success' : 'danger', label: myPlayerNumber === 1 ? 'Won' : 'Lost' }
  if (status === 'PLAYER2_WON') return { variant: myPlayerNumber === 2 ? 'success' : 'danger', label: myPlayerNumber === 2 ? 'Won' : 'Lost' }
  return { variant: 'default', label: status }
}

export default function HomePage() {
  const navigate = useNavigate()
  const { user, logout, getToken, getUserId, setUserFromProfile } = useAuth()
  const userId = getUserId()
  const [gameType, setGameType] = useState('rapid')
  const [findingMatch, setFindingMatch] = useState(false)
  const [matchSeconds, setMatchSeconds] = useState(0)
  const [matchError, setMatchError] = useState('')
  const [profileCollapsed, setProfileCollapsed] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileUsername, setProfileUsername] = useState(user?.username ?? '')
  const [profileEmail, setProfileEmail] = useState(user?.email ?? '')
  const [profileCountry, setProfileCountry] = useState(user?.country ?? '')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [changePasswordCurrent, setChangePasswordCurrent] = useState('')
  const [changePasswordNew, setChangePasswordNew] = useState('')
  const [changePasswordError, setChangePasswordError] = useState('')
  const [changePasswordSaving, setChangePasswordSaving] = useState(false)
  const [games, setGames] = useState([])
  const [gamesLoading, setGamesLoading] = useState(true)
  const [myRatings, setMyRatings] = useState([])
  const stompRef = useRef(null)
  const timerRef = useRef(null)

  const displayRating = ratingsApi.ratingForGameType(myRatings, ratingsApi.GAME_TYPE_MAP[gameType] || 'RAPID')

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    userApi.getProfile().then((data) => {
      if (!cancelled && data) {
        setUserFromProfile(data)
        setProfileUsername(data.username ?? '')
        setProfileEmail(data.email ?? '')
        setProfileCountry(data.country ?? '')
      }
    }).catch(() => {})
    return () => { cancelled = true }
  }, [userId])

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    ratingsApi.getMyRatings().then((data) => {
      if (!cancelled && Array.isArray(data)) setMyRatings(data)
    }).catch(() => {})
    return () => { cancelled = true }
  }, [userId])

  useEffect(() => {
    profileUsername === '' && user?.username && setProfileUsername(user.username)
    profileEmail === '' && user?.email && setProfileEmail(user.email)
    profileCountry === '' && user?.country && setProfileCountry(user.country)
  }, [user, profileUsername, profileEmail, profileCountry])

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    matchApi.getUserMatches(userId).then((data) => {
      if (!cancelled) setGames(Array.isArray(data) ? data : [])
    }).catch(() => {
      if (!cancelled) setGames([])
    }).finally(() => {
      if (!cancelled) setGamesLoading(false)
    })
    return () => { cancelled = true }
  }, [userId])

  const goToMatch = (match) => {
    if (match && match.id) navigate(`/game/${match.id}`, { replace: true })
  }

  const startFindingMatch = async () => {
    if (!userId) return
    setFindingMatch(true)
    setMatchSeconds(0)
    setMatchError('')
    const token = getToken()
    const client = createStompClient(() => token)
    if (!client) {
      setMatchError('WebSocket not available.')
      setFindingMatch(false)
      return
    }
    stompRef.current = client
    let unsub = () => {}
    const onMatch = (match) => {
      unsub()
      client.deactivate?.()
      stompRef.current = null
      setFindingMatch(false)
      if (timerRef.current) clearInterval(timerRef.current)
      goToMatch(match)
    }
    client.onConnect = async () => {
      unsub = subscribeMatchmaking(client, userId, onMatch)
      try {
        const result = await matchApi.joinMatchmaking(gameType)
        if (result && result.id) {
          unsub()
          client.deactivate?.()
          stompRef.current = null
          setFindingMatch(false)
          if (timerRef.current) clearInterval(timerRef.current)
          goToMatch(result)
          return
        }
      } catch (err) {
        setMatchError(err.message || 'Failed to join queue.')
        setFindingMatch(false)
        client.deactivate?.()
        stompRef.current = null
        if (timerRef.current) clearInterval(timerRef.current)
      }
    }
    client.onStompError = () => {
      setMatchError('Connection error.')
      setFindingMatch(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }
    client.activate()
    timerRef.current = setInterval(() => {
      setMatchSeconds((s) => s + 1)
    }, 1000)
  }

  const cancelFindingMatch = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    const client = stompRef.current
    if (client) {
      client.deactivate?.()
      stompRef.current = null
    }
    try {
      await matchApi.leaveMatchmaking()
    } catch {}
    setFindingMatch(false)
    setMatchError('')
  }

  const formatTimer = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  const handleSaveProfile = async () => {
    setProfileError('')
    setProfileSaving(true)
    try {
      const data = await userApi.updateProfile({
        username: profileUsername.trim(),
        email: profileEmail.trim(),
        country: profileCountry.trim() || undefined,
      })
      setUserFromProfile(data)
      setEditingProfile(false)
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile.')
    } finally {
      setProfileSaving(false)
    }
  }

  const handleChangePassword = async () => {
    setChangePasswordError('')
    if (!changePasswordCurrent.trim() || !changePasswordNew.trim()) {
      setChangePasswordError('Please fill in both fields.')
      return
    }
    if (changePasswordNew.length < 6) {
      setChangePasswordError('New password must be at least 6 characters.')
      return
    }
    setChangePasswordSaving(true)
    try {
      await authApi.changePassword(changePasswordCurrent, changePasswordNew)
      setShowChangePassword(false)
      setChangePasswordCurrent('')
      setChangePasswordNew('')
    } catch (err) {
      setChangePasswordError(err.message || 'Failed to change password.')
    } finally {
      setChangePasswordSaving(false)
    }
  }

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
              <p className="font-semibold text-white">{user?.username ?? 'Player'}</p>
              <p className="text-sm text-emerald-400">Rating: {displayRating}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => logout()}
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
                disabled={findingMatch}
                className="w-full rounded-xl border border-emerald-500/40 bg-white/5 py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 disabled:opacity-60"
              >
                {GAME_TYPES.map((g) => (
                  <option key={g.value} value={g.value} className="bg-slate-800 text-white">
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              {!findingMatch ? (
                <Button
                  variant="primary"
                  className="rounded-xl px-6 py-3"
                  onClick={startFindingMatch}
                >
                  Find Match
                </Button>
              ) : (
                <>
                  <Button
                    variant="danger"
                    className="rounded-xl px-6 py-3"
                    onClick={cancelFindingMatch}
                  >
                    Cancel
                  </Button>
                  <div className="flex items-center gap-3 text-white/80">
                    <svg className="animate-spin h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Finding opponent...</span>
                    <span className="font-mono">{formatTimer(matchSeconds)}</span>
                  </div>
                </>
              )}
            </div>
            {matchError && (
              <p className="text-sm text-red-400">{matchError}</p>
            )}
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
                      <Input
                        label="Country"
                        value={profileCountry}
                        onChange={(e) => setProfileCountry(e.target.value)}
                        className="bg-white/5 border-emerald-500/40"
                      />
                      {profileError && <p className="text-sm text-red-400">{profileError}</p>}
                      <div className="flex gap-2">
                        <Button variant="primary" className="rounded-xl" disabled={profileSaving} onClick={handleSaveProfile}>Save</Button>
                        <Button variant="secondary" className="rounded-xl" disabled={profileSaving} onClick={() => { setEditingProfile(false); setProfileError(''); }}>Cancel</Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-white/80">Country: {user?.country ?? '—'}</p>
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
                      <button type="button" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium" onClick={() => setShowChangePassword(true)}>
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
            {gamesLoading ? (
              <div className="px-6 py-8 text-center text-white/60">Loading games…</div>
            ) : games.length === 0 ? (
              <div className="px-6 py-8 text-center text-white/60">No games yet. Find a match to start.</div>
            ) : (
              <ul className="divide-y divide-white/10">
                {games.map((g) => {
                  const myPlayerNumber = g.player1Id === userId ? 1 : 2
                  const { variant, label } = statusToBadge(g.status, myPlayerNumber)
                  return (
                    <li key={g.id}>
                      <Link
                        to={`/game/${g.id}`}
                        className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors group"
                      >
                        <div className="flex items-center gap-4 flex-wrap">
                          <span className="text-white/80">Game #{g.id}</span>
                          <Badge variant={variant}>{label}</Badge>
                        </div>
                        <span className="text-white/50 group-hover:text-emerald-400">→</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardBody>
        </Card>

        <footer className="text-center py-6">
          <Link to="/local" className="text-emerald-400 hover:text-emerald-300 font-medium">
            Play locally (2 players)
          </Link>
        </footer>
      </main>

      {showChangePassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => !changePasswordSaving && setShowChangePassword(false)}>
          <div className="w-full max-w-sm rounded-xl bg-slate-800 border border-white/10 p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
            <Input
              label="Current password"
              type="password"
              value={changePasswordCurrent}
              onChange={(e) => setChangePasswordCurrent(e.target.value)}
              className="bg-white/5 border-emerald-500/40 mb-3"
            />
            <Input
              label="New password"
              type="password"
              value={changePasswordNew}
              onChange={(e) => setChangePasswordNew(e.target.value)}
              className="bg-white/5 border-emerald-500/40 mb-3"
            />
            {changePasswordError && <p className="text-sm text-red-400 mb-3">{changePasswordError}</p>}
            <div className="flex gap-2">
              <Button variant="primary" className="rounded-xl flex-1" disabled={changePasswordSaving} onClick={handleChangePassword}>Change</Button>
              <Button variant="secondary" className="rounded-xl" disabled={changePasswordSaving} onClick={() => setShowChangePassword(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
