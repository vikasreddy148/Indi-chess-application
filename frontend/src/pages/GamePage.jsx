import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Chess } from 'chess.js'
import { useAuth } from '../context/AuthContext.jsx'
import { Logo } from '../components/Logo.jsx'
import { Button } from '../components/Button.jsx'
import { Card } from '../components/Card.jsx'
import { ChessBoard } from '../components/ChessBoard.jsx'
import * as matchApi from '../api/match.js'
import {
  createStompClient,
  subscribeGame,
  sendMove,
  sendResign,
  sendOfferDraw,
  sendAcceptDraw,
  sendDeclineDraw,
} from '../ws/stompClient.js'

export default function GamePage() {
  const { gameId } = useParams()
  const matchId = gameId ? Number(gameId) : null
  const { user, getToken, getUserId } = useAuth()
  const userId = getUserId()
  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [connected, setConnected] = useState(false)
  const [selectedSquare, setSelectedSquare] = useState(null)
  const [lastMove, setLastMove] = useState(null)
  const [moveHistory, setMoveHistory] = useState([])
  const stompRef = useRef(null)

  const amWhite = match && userId === match.player1Id
  const fen = match?.fenCurrent || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
  const game = new Chess(fen)
  const whiteToMove = game.turn() === 'w'
  const myTurn = match?.status === 'ONGOING' && ((amWhite && whiteToMove) || (!amWhite && !whiteToMove))
  const drawOffered = match?.status === 'ONGOING' && match?.drawOfferedByPlayerId != null && match.drawOfferedByPlayerId !== userId

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

  const handleResign = () => {
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
      <span key={i} className="flex gap-1 flex-wrap">
        <span className="text-white/50">{num}.</span>
        {white && <span>{white.moveNotation || `${white.fromSquare}-${white.toSquare}`}</span>}
        {black && <span>{black.moveNotation || `${black.fromSquare}-${black.toSquare}`}</span>}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex flex-col items-center justify-center gap-4">
        <svg className="animate-spin h-10 w-10 text-emerald-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-white font-medium">Loading game...</p>
      </div>
    )
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex flex-col items-center justify-center gap-4">
        <p className="text-red-400">{error || 'Game not found.'}</p>
        <Link to="/home"><Button variant="primary">Back to Home</Button></Link>
      </div>
    )
  }

  const opponentId = amWhite ? match.player2Id : match.player1Id

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 bg-slate-900/90 backdrop-blur-md border-b border-white/5 shrink-0">
        <Link to="/home" className="flex items-center gap-2">
          <Logo compact />
        </Link>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-sm font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01" />
          </svg>
          {connected ? 'Connected' : 'Reconnecting...'}
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row gap-6 p-6 min-h-0">
        <div className="flex-1 flex items-center justify-center lg:justify-start relative min-w-0">
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

        <aside className="w-full lg:w-80 xl:w-96 flex flex-col gap-4 shrink-0">
          <Card className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-600 flex items-center justify-center text-white/80 text-lg font-bold">
              {String(opponentId).slice(-1)}
            </div>
            <div>
              <p className="font-bold text-white">Opponent #{opponentId}</p>
              <p className="text-sm text-emerald-400">Rating: —</p>
            </div>
          </Card>

          {match.status === 'ONGOING' && myTurn && (
            <div className="rounded-xl bg-emerald-500 py-3 px-4 flex items-center gap-2 text-white font-medium border border-emerald-400/50 shadow-lg shadow-emerald-500/20">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Your turn
            </div>
          )}

          <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 font-semibold text-white">Moves</div>
            <div className="flex-1 overflow-y-auto p-4 text-sm text-white/90 font-mono space-y-1 max-h-64">
              {moveListFormatted.length ? moveListFormatted : <span className="text-white/50">No moves yet</span>}
            </div>
          </Card>

          {match.status === 'ONGOING' && (
            <div className="grid grid-cols-2 gap-2">
              <Button variant="danger" className="rounded-xl py-3 flex items-center justify-center gap-2" onClick={handleResign}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>
                Resign
              </Button>
              {!drawOffered ? (
                <Button variant="primary" className="rounded-xl py-3 flex items-center justify-center gap-2" onClick={handleOfferDraw}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a7.5 7.5 0 0115 0v1m-15 0h15" /></svg>
                  Offer Draw
                </Button>
              ) : (
                <>
                  <Button variant="primary" className="rounded-xl py-3" onClick={handleAcceptDraw}>Accept Draw</Button>
                  <Button variant="danger" className="rounded-xl py-3" onClick={handleDeclineDraw}>Decline Draw</Button>
                </>
              )}
            </div>
          )}
        </aside>
      </main>
    </div>
  )
}
