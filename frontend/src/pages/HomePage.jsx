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
import { createStompClient, subscribeMatchmaking } from '../ws/stompClient.js'

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
    }).catch(() => { if (!cancelled) setGames([]) })
    .finally(() => { if (!cancelled) setGamesLoading(false) })
    return () => { cancelled = true }
  }, [userId])

  const goToMatch = (match) => {
    if (match?.id) navigate(`/game/${match.id}`, { replace: true })
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
        if (result?.id) {
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
    timerRef.current = setInterval(() => setMatchSeconds((s) => s + 1), 1000)
  }

  const cancelFindingMatch = async () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    stompRef.current?.deactivate?.()
    stompRef.current = null
    try { await matchApi.leaveMatchmaking() } catch {}
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
    <div className="min-h-screen bg-[#fafafa]">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/home"><Logo compact /></Link>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                {user?.username?.charAt(0)?.toUpperCase() ?? 'P'}
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">{user?.username ?? 'Player'}</p>
                <p className="text-xs text-slate-500">Rating: <span className="text-indigo-600">{displayRating}</span></p>
              </div>
            </div>
            <button onClick={() => logout()} className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12 space-y-8">
        <section>
          <h1 className="text-2xl font-bold text-slate-900 mb-6">Find a game</h1>
          <Card hover>
            <CardBody className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Time control</label>
                <select
                  value={gameType}
                  onChange={(e) => setGameType(e.target.value)}
                  disabled={findingMatch}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 disabled:opacity-60"
                >
                  {GAME_TYPES.map((g) => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-wrap gap-4 items-center">
                {!findingMatch ? (
                  <Button variant="primary" size="lg" onClick={startFindingMatch}>
                    Find opponent
                  </Button>
                ) : (
                  <>
                    <Button variant="danger" onClick={cancelFindingMatch}>Cancel</Button>
                    <div className="flex items-center gap-3 text-slate-600">
                      <svg className="animate-spin h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="text-sm">Finding opponent...</span>
                      <span className="font-mono text-indigo-600">{formatTimer(matchSeconds)}</span>
                    </div>
                  </>
                )}
              </div>
              {matchError && <p className="text-sm text-red-600">{matchError}</p>}
            </CardBody>
          </Card>
        </section>

        <section>
          <div
            className="flex items-center justify-between cursor-pointer py-4"
            onClick={() => setProfileCollapsed((c) => !c)}
          >
            <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
            <svg className={`w-5 h-5 text-slate-400 transition-transform ${profileCollapsed ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </div>
          {!profileCollapsed && (
            <Card>
              <CardBody>
                <div className="flex gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl font-bold shrink-0">
                    {user?.username?.charAt(0)?.toUpperCase() ?? 'P'}
                  </div>
                  <div className="flex-1 space-y-4 min-w-0">
                    {editingProfile ? (
                      <>
                        <Input label="Username" value={profileUsername} onChange={(e) => setProfileUsername(e.target.value)} />
                        <Input label="Email" type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} />
                        <Input label="Country" value={profileCountry} onChange={(e) => setProfileCountry(e.target.value)} />
                        {profileError && <p className="text-sm text-red-600">{profileError}</p>}
                        <div className="flex gap-2">
                          <Button variant="primary" disabled={profileSaving} onClick={handleSaveProfile}>Save</Button>
                          <Button variant="outline" disabled={profileSaving} onClick={() => { setEditingProfile(false); setProfileError(''); }}>Cancel</Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-slate-500 text-sm">Country: {user?.country ?? '—'}</p>
                        <Input label="Username" value={profileUsername} readOnly />
                        <Input label="Email" value={profileEmail} readOnly />
                        <button type="button" className="text-indigo-600 hover:text-indigo-500 text-sm font-medium" onClick={() => setShowChangePassword(true)}>
                          Change password
                        </button>
                        <Button variant="primary" onClick={() => setEditingProfile(true)}>Edit profile</Button>
                      </>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent games</h2>
          <Card>
            {gamesLoading ? (
              <div className="px-6 py-16 text-center text-slate-500">Loading...</div>
            ) : games.length === 0 ? (
              <div className="px-6 py-16 text-center text-slate-500">No games yet. Find a match to start.</div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {games.map((g) => {
                  const myPlayerNumber = g.player1Id === userId ? 1 : 2
                  const { variant, label } = statusToBadge(g.status, myPlayerNumber)
                  return (
                    <li key={g.id}>
                      <Link
                        to={`/game/${g.id}`}
                        className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/80 transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-slate-500 text-sm">Game #{g.id}</span>
                          <Badge variant={variant}>{label}</Badge>
                        </div>
                        <span className="text-slate-400 group-hover:text-indigo-600 transition-colors">→</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>
        </section>

        <div className="text-center">
          <Link to="/local" className="text-indigo-600 hover:text-indigo-500 text-sm font-medium">
            Play locally (2 players on one device)
          </Link>
        </div>
      </main>

      {showChangePassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4" onClick={() => !changePasswordSaving && setShowChangePassword(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-900 mb-5">Change password</h3>
            <Input label="Current password" type="password" value={changePasswordCurrent} onChange={(e) => setChangePasswordCurrent(e.target.value)} containerClassName="mb-4" />
            <Input label="New password" type="password" value={changePasswordNew} onChange={(e) => setChangePasswordNew(e.target.value)} containerClassName="mb-4" />
            {changePasswordError && <p className="text-sm text-red-600 mb-4">{changePasswordError}</p>}
            <div className="flex gap-2">
              <Button variant="primary" className="flex-1" disabled={changePasswordSaving} onClick={handleChangePassword}>Change</Button>
              <Button variant="outline" disabled={changePasswordSaving} onClick={() => setShowChangePassword(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
