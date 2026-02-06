import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Chess } from 'chess.js'
import { useAuth } from '../context/AuthContext.jsx'
import { Logo } from '../components/Logo.jsx'
import { Button } from '../components/Button.jsx'
import { ChessBoard } from '../components/ChessBoard.jsx'

import * as matchApi from '../api/match.js'
import * as userApi from '../api/users.js'
import * as ratingsApi from '../api/ratings.js'
import {
  createStompClient,
  subscribeGame,
  sendMove,
  sendResign,
  sendOfferDraw,
  sendAcceptDraw,
  sendDeclineDraw,
} from '../ws/stompClient.js'

function ResignConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="resign-title">
      <div className="w-full max-w-sm rounded-xl bg-[#2d3748] border border-white/10 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 id="resign-title" className="text-lg font-semibold text-white mb-2">Resign game?</h3>
        <p className="text-slate-400 text-sm mb-6">Are you sure? This will end the game.</p>
        <div className="flex gap-3">
          <button onClick={onConfirm} className="flex-1 h-10 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium">
            Resign
          </button>
          <button onClick={onCancel} className="flex-1 h-10 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default function GamePage() {
  const { gameId } = useParams()
  const matchId = gameId ? Number(gameId) : null
  const { getToken, getUserId } = useAuth()
  const userId = getUserId()
  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [connected, setConnected] = useState(false)
  const [selectedSquare, setSelectedSquare] = useState(null)
  const [lastMove, setLastMove] = useState(null)
  const [moveHistory, setMoveHistory] = useState([])
  const [opponent, setOpponent] = useState(null)
  const [myRatings, setMyRatings] = useState([])
  const [opponentRatings, setOpponentRatings] = useState([])
  const stompRef = useRef(null)

  const amWhite = match && userId === match.player1Id
  const opponentId = match && (amWhite ? match.player2Id : match.player1Id)
  const fen = match?.fenCurrent || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
  const game = new Chess(fen)
  const whiteToMove = game.turn() === 'w'
  const myTurn = match?.status === 'ONGOING' && ((amWhite && whiteToMove) || (!amWhite && !whiteToMove))
  const drawOffered = match?.status === 'ONGOING' && match?.drawOfferedByPlayerId != null && match.drawOfferedByPlayerId !== userId

  const gameTypeStr = match?.gameType || 'RAPID'
  const myRating = ratingsApi.ratingForGameType(myRatings, gameTypeStr)
  const opponentRating = ratingsApi.ratingForGameType(opponentRatings, gameTypeStr)

  const [showResignConfirm, setShowResignConfirm] = useState(false)

  const formatClock = (seconds) => {
    if (seconds == null || seconds < 0) return '0:00'
    const m = Math.floor(seconds / 60)
    const s = Math.max(0, Math.floor(seconds % 60))
    return `${m}:${String(s).padStart(2, '0')}`
  }

  const [displayWhiteClock, setDisplayWhiteClock] = useState('10:00')
  const [displayBlackClock, setDisplayBlackClock] = useState('10:00')
  const matchRef = useRef(match)
  const gameStartRef = useRef(Date.now())

  useEffect(() => {
    matchRef.current = match
  }, [match])

  function parseServerTime(val) {
    if (!val) return null
    if (typeof val === 'number') return val
    if (Array.isArray(val)) {
      const [y, mo, d, h = 0, min = 0, s = 0] = val
      const date = new Date(y, (mo || 1) - 1, d || 1, h, min, s)
      return isNaN(date.getTime()) ? null : date.getTime()
    }
    const date = new Date(val)
    return isNaN(date.getTime()) ? null : date.getTime()
  }

  useEffect(() => {
    if (!match) return

    const p1 = typeof match.player1TimeLeftSeconds === 'number' ? match.player1TimeLeftSeconds : 600
    const p2 = typeof match.player2TimeLeftSeconds === 'number' ? match.player2TimeLeftSeconds : 600

    if (match.status !== 'ONGOING') {
      setDisplayWhiteClock(formatClock(p1))
      setDisplayBlackClock(formatClock(p2))
      return
    }

    gameStartRef.current = Date.now()

    const tick = () => {
      const m = matchRef.current
      if (!m || m.status !== 'ONGOING') return

      const p1Time = typeof m.player1TimeLeftSeconds === 'number' ? m.player1TimeLeftSeconds : 600
      const p2Time = typeof m.player2TimeLeftSeconds === 'number' ? m.player2TimeLeftSeconds : 600

      let lastMoveAt = parseServerTime(m.lastMoveAt) ?? parseServerTime(m.startedAt)
      if (!lastMoveAt) lastMoveAt = gameStartRef.current

      const fenParts = (m.fenCurrent || '').split(' ')
      const isWhiteToMove = fenParts[1] === 'w'

      const elapsed = Math.floor((Date.now() - lastMoveAt) / 1000)

      if (isWhiteToMove) {
        setDisplayWhiteClock(formatClock(Math.max(0, p1Time - elapsed)))
        setDisplayBlackClock(formatClock(p2Time))
      } else {
        setDisplayWhiteClock(formatClock(p1Time))
        setDisplayBlackClock(formatClock(Math.max(0, p2Time - elapsed)))
      }
    }

    tick()
    const id = setInterval(tick, 250)
    return () => clearInterval(id)
  }, [match])

  useEffect(() => {
    if (!matchId) {
      setLoading(false)
      setError('Invalid game.')
      return
    }
    let cancelled = false
    matchApi.getMatch(matchId).then((data) => {
      if (!cancelled) {
        setMatch(data)
        if (data?.lastMoveUci && data.lastMoveUci.length >= 4) {
          setLastMove({ from: data.lastMoveUci.slice(0, 2), to: data.lastMoveUci.slice(2, 4) })
        }
      }
    }).catch((err) => {
      if (!cancelled) setError(err.message || 'Failed to load game.')
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [matchId])

  useEffect(() => {
    if (!matchId || !match) return
    let cancelled = false
    matchApi.getMoveHistory(matchId).then((list) => {
      if (!cancelled && Array.isArray(list)) setMoveHistory(list)
    }).catch(() => {})
    return () => { cancelled = true }
  }, [matchId, match?.currentPly])

  useEffect(() => {
    if (!opponentId) {
      setOpponent(null)
      return
    }
    let cancelled = false
    userApi.getUserById(opponentId).then((data) => {
      if (!cancelled) setOpponent(data)
    }).catch(() => {
      if (!cancelled) setOpponent(null)
    })
    return () => { cancelled = true }
  }, [opponentId])

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    ratingsApi.getMyRatings().then((data) => {
      if (!cancelled && Array.isArray(data)) setMyRatings(data)
    }).catch(() => {})
    return () => { cancelled = true }
  }, [userId])

  useEffect(() => {
    if (!opponentId) {
      setOpponentRatings([])
      return
    }
    let cancelled = false
    ratingsApi.getUserRatings(opponentId).then((data) => {
      if (!cancelled && Array.isArray(data)) setOpponentRatings(data)
    }).catch(() => {
      if (!cancelled) setOpponentRatings([])
    })
    return () => { cancelled = true }
  }, [opponentId])

  useEffect(() => {
    if (!matchId || !match || loading) return
    const token = getToken()
    const client = createStompClient(() => token)
    if (!client) return
    stompRef.current = client
    client.onConnect = () => {
      setConnected(true)
      subscribeGame(client, matchId, (msg) => {
        if (msg.match) {
          setMatch(msg.match)
          if (msg.moveUci && msg.moveUci.length >= 4) {
            setLastMove({ from: msg.moveUci.slice(0, 2), to: msg.moveUci.slice(2, 4) })
          }
        }
      })
      matchApi.getMatch(matchId).then((data) => {
        setMatch(data)
        if (data?.lastMoveUci && data.lastMoveUci.length >= 4) {
          setLastMove({ from: data.lastMoveUci.slice(0, 2), to: data.lastMoveUci.slice(2, 4) })
        }
      }).catch(() => {})
    }
    client.onDisconnect = () => setConnected(false)
    client.onStompError = () => setConnected(false)
    client.activate()
    return () => {
      client.deactivate?.()
      stompRef.current = null
    }
  }, [matchId, loading, match?.id])

  const legalSquares = selectedSquare
    ? game.moves({ square: selectedSquare, verbose: true }).map((m) => m.to)
    : []

  const handleSquareClick = (sq) => {
    if (match?.status !== 'ONGOING') return
    const piece = game.get(sq)
    const myColor = amWhite ? 'w' : 'b'
    if (piece && piece.color === myColor) {
      setSelectedSquare(sq)
      return
    }
    if (selectedSquare && legalSquares.includes(sq)) {
      const move = game.move({ from: selectedSquare, to: sq })
      if (move) {
        const uci = move.promotion ? `${selectedSquare}${sq}${move.promotion}` : `${selectedSquare}${sq}`
        const client = stompRef.current
        if (client && client.connected) {
          sendMove(client, matchId, uci)
        } else {
          matchApi.makeMove(matchId, uci).then((updated) => setMatch(updated)).catch(() => {})
        }
        setSelectedSquare(null)
      }
      return
    }
    setSelectedSquare(null)
  }

  const handleResignClick = () => setShowResignConfirm(true)

  const handleResignConfirm = () => {
    setShowResignConfirm(false)
    const client = stompRef.current
    if (client && client.connected) sendResign(client, matchId)
    else matchApi.resign(matchId).then((updated) => setMatch(updated)).catch(() => {})
  }

  const handleOfferDraw = () => {
    const client = stompRef.current
    if (client && client.connected) sendOfferDraw(client, matchId)
    else matchApi.offerDraw(matchId).then((updated) => setMatch(updated)).catch(() => {})
  }

  const handleAcceptDraw = () => {
    const client = stompRef.current
    if (client && client.connected) sendAcceptDraw(client, matchId)
    else matchApi.acceptDraw(matchId).then((updated) => setMatch(updated)).catch(() => {})
  }

  const handleDeclineDraw = () => {
    const client = stompRef.current
    if (client && client.connected) sendDeclineDraw(client, matchId)
    else matchApi.declineDraw(matchId).then((updated) => setMatch(updated)).catch(() => {})
  }

  const moveListFormatted = []
  for (let i = 0; i < moveHistory.length; i += 2) {
    const white = moveHistory[i]
    const black = moveHistory[i + 1]
    const num = Math.floor(i / 2) + 1
    moveListFormatted.push(
      <span key={i} className="flex gap-1 flex-wrap text-slate-300">
        <span className="text-slate-500">{num}.</span>
        {white && <span>{white.moveNotation || `${white.fromSquare}-${white.toSquare}`}</span>}
        {black && <span>{black.moveNotation || `${black.fromSquare}-${black.toSquare}`}</span>}
      </span>
    )
  }

  const opponentName = opponent ? opponent.username : `Opponent #${opponentId}`
  const myName = 'You'

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a202c] flex flex-col items-center justify-center gap-5">
        <svg className="animate-spin h-10 w-10 text-indigo-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-slate-400">Loading game...</p>
      </div>
    )
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-[#1a202c] flex flex-col items-center justify-center gap-5">
        <p className="text-red-400">{error || 'Game not found.'}</p>
        <Link to="/home"><button className="h-10 px-6 rounded-lg bg-indigo-600 text-white font-medium">Back to Home</button></Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1a202c] flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 bg-[#2d3748] border-b border-white/5">
        <Link to="/home" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">♞</div>
          <span className="font-bold text-white">Indi<span className="text-indigo-400">Chess</span></span>
        </Link>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${connected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          {connected ? 'Connected' : 'Reconnecting...'}
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row lg:items-start lg:justify-center gap-0 p-4 min-h-0 overflow-auto">
        <div className="flex flex-col items-center shrink-0">
          <div className="flex flex-col gap-0 w-fit">
            <div className="flex items-center justify-between w-full px-3 py-2 bg-[#2d3748] rounded-t-xl border-b border-white/5 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {opponent ? opponent.username?.charAt(0)?.toUpperCase() : '?'}
                </div>
                <span className="text-white font-medium truncate">{opponentName}</span>
                <span className="text-slate-400 text-sm shrink-0">({opponentRating})</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className={`font-mono font-semibold tabular-nums ${game.turn() === (amWhite ? 'b' : 'w') ? 'text-amber-400' : 'text-slate-400'}`}>
                  {amWhite ? displayBlackClock : displayWhiteClock}
                </span>
              </div>
            </div>

            <div className="p-1 bg-[#2d3748]">
              <ChessBoard
                fen={fen}
                orientation={amWhite ? 'white' : 'black'}
                selectedSquare={selectedSquare}
                lastMove={lastMove}
                legalMoves={legalSquares}
                onSquareClick={handleSquareClick}
                disabled={!myTurn}
              />
            </div>

            <div className="flex items-center justify-between w-full px-3 py-2 bg-[#2d3748] rounded-b-xl border-t border-white/5">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">Y</div>
                <span className="text-white font-medium truncate">{myName}</span>
                <span className="text-slate-400 text-sm shrink-0">({myRating})</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className={`font-mono font-semibold tabular-nums ${game.turn() === (amWhite ? 'w' : 'b') ? 'text-amber-400' : 'text-slate-400'}`}>
                  {amWhite ? displayWhiteClock : displayBlackClock}
                </span>
              </div>
            </div>
          </div>

          {match.status === 'ONGOING' && myTurn && (
            <p className="mt-2 text-sm text-amber-400 font-medium">Your turn</p>
          )}
        </div>

        <aside className="w-full lg:w-72 flex flex-col gap-3 shrink-0 mt-4 lg:mt-0 lg:ml-4">
          <div className="rounded-xl bg-[#2d3748] border border-white/5 overflow-hidden">
            <div className="px-3 py-2 border-b border-white/5 text-sm font-semibold text-white">Moves</div>
            <div className="p-3 max-h-48 overflow-y-auto space-y-1 font-mono text-sm">
              {moveListFormatted.length ? moveListFormatted : <span className="text-slate-500">No moves yet</span>}
            </div>
          </div>

          {match.status === 'ONGOING' && (
            <div className="flex flex-wrap gap-2">
              <button onClick={handleResignClick} className="flex-1 min-w-[100px] h-10 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium text-sm">
                Resign
              </button>
              {!drawOffered ? (
                <button onClick={handleOfferDraw} className="flex-1 min-w-[100px] h-10 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm">
                  Offer Draw
                </button>
              ) : (
                <>
                  <button onClick={handleAcceptDraw} className="flex-1 min-w-[100px] h-10 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm">
                    Accept Draw
                  </button>
                  <button onClick={handleDeclineDraw} className="flex-1 min-w-[100px] h-10 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-sm">
                    Decline
                  </button>
                </>
              )}
            </div>
          )}

          {match.status !== 'ONGOING' && (
            <Link to="/home" className="block">
              <button className="w-full h-10 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium">
                Back to Home
              </button>
            </Link>
          )}

          {match.status !== 'ONGOING' && (
            <div className={`rounded-lg px-4 py-3 text-center text-sm font-semibold ${
              match.status === 'DRAW' || match.status === 'ABANDONED'
                ? 'bg-slate-600/50 text-slate-300'
                : (match.status === 'PLAYER1_WON' && amWhite) || (match.status === 'PLAYER2_WON' && !amWhite)
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/20 text-red-400'
            }`}>
              {match.status === 'DRAW' || match.status === 'ABANDONED'
                ? (match.status === 'DRAW' ? 'Game drawn' : 'Game abandoned')
                : (match.status === 'PLAYER1_WON' && amWhite) || (match.status === 'PLAYER2_WON' && !amWhite)
                  ? 'You won'
                  : 'You lost'}
            </div>
          )}
        </aside>
      </main>

      {showResignConfirm && (
        <ResignConfirmModal onConfirm={handleResignConfirm} onCancel={() => setShowResignConfirm(false)} />
      )}

      {match.status !== 'ONGOING' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-xl bg-[#2d3748] border border-white/10 p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white text-center mb-2">
              {match.status === 'DRAW' || match.status === 'ABANDONED'
                ? (match.status === 'DRAW' ? 'Game drawn' : 'Game abandoned')
                : (match.status === 'PLAYER1_WON' && amWhite) || (match.status === 'PLAYER2_WON' && !amWhite)
                  ? 'You won'
                  : 'You lost'}
            </h2>
            <p className="text-slate-400 text-center text-sm mb-6">
              {match.status === 'DRAW' ? 'The game ended in a draw.'
                : match.status === 'ABANDONED' ? 'The game was abandoned.'
                : (match.status === 'PLAYER1_WON' && !amWhite) || (match.status === 'PLAYER2_WON' && amWhite)
                  ? 'Opponent resigned.'
                  : 'Congratulations!'}
            </p>
            <div className="flex flex-col gap-3">
              <Link to="/home"><button className="w-full h-10 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium">Back to Home</button></Link>
              <Link to="/home"><button className="w-full h-10 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium">New game</button></Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
