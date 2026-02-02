import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Chess } from 'chess.js'
import { useAuth } from '../context/AuthContext.jsx'
import { Logo } from '../components/Logo.jsx'
import { Button } from '../components/Button.jsx'
import { Card } from '../components/Card.jsx'
import { ChessBoard } from '../components/ChessBoard.jsx'
const DUMMY_HISTORY = [
  'e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'd6', 'c3', 'O-O', 'h3', 'Nb8', 'd4', 'Nbd7',
]

export default function GamePage() {
  const { gameId } = useParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(true)
  const [myTurn, setMyTurn] = useState(true)
  const [drawOffered, setDrawOffered] = useState(false)
  const [game, setGame] = useState(() => new Chess())
  const [selectedSquare, setSelectedSquare] = useState(null)
  const [lastMove, setLastMove] = useState(null)
  const [moveHistory, setMoveHistory] = useState([])

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(false)
      const c = new Chess()
      c.load('r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3')
      setGame(c)
      setLastMove({ from: 'g8', to: 'f6' })
      setMoveHistory(DUMMY_HISTORY.map((san) => ({ san })))
    }, 1500)
    return () => clearTimeout(t)
  }, [gameId])

  const legalSquares = selectedSquare
    ? game.moves({ square: selectedSquare, verbose: true }).map((m) => m.to)
    : []

  const handleSquareClick = (sq) => {
    if (game.get(sq)?.color === 'w') {
      setSelectedSquare(sq)
      return
    }
    if (selectedSquare && legalSquares.includes(sq)) {
      const move = game.move({ from: selectedSquare, to: sq })
      if (move) {
        setLastMove({ from: move.from, to: move.to })
        setMoveHistory((h) => [...h, { san: move.san }])
        setSelectedSquare(null)
        setMyTurn(false)
      }
      return
    }
    setSelectedSquare(null)
  }

  const moveListFormatted = []
  let i = 0
  while (i < moveHistory.length) {
    const white = moveHistory[i]?.san
    const black = moveHistory[i + 1]?.san
    moveListFormatted.push(
      <span key={i} className="flex gap-1 flex-wrap">
        <span className="text-white/50">{Math.floor(i / 2) + 1}.</span>
        {white && <span>{white}</span>}
        {black && <span>{black}</span>}
      </span>
    )
    i += 2
  }

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
          <div className="relative">
            <ChessBoard
              fen={game.fen()}
              orientation="white"
              selectedSquare={selectedSquare}
              lastMove={lastMove}
              legalMoves={legalSquares}
              onSquareClick={handleSquareClick}
              disabled={!myTurn}
            />
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-xl bg-slate-900/80 backdrop-blur-md border border-emerald-500/20">
                <svg className="animate-spin h-10 w-10 text-emerald-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-white font-medium">Loading game...</p>
              </div>
            )}
          </div>
        </div>

        <aside className="w-full lg:w-80 xl:w-96 flex flex-col gap-4 shrink-0">
          <Card className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-600 flex items-center justify-center text-white/80 text-lg font-bold">
              O
            </div>
            <div>
              <p className="font-bold text-white">Opponent123</p>
              <p className="text-sm text-emerald-400">Rating: 1350</p>
            </div>
          </Card>

          {myTurn && (
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

          <div className="grid grid-cols-2 gap-2">
            <Button variant="danger" className="rounded-xl py-3 flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>
              Resign
            </Button>
            <Button variant="primary" className="rounded-xl py-3 flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a7.5 7.5 0 0115 0v1m-15 0h15" /></svg>
              Offer Draw
            </Button>
            {drawOffered && (
              <>
                <Button variant="primary" className="rounded-xl py-3">Accept Draw</Button>
                <Button variant="danger" className="rounded-xl py-3">Decline Draw</Button>
              </>
            )}
          </div>
        </aside>
      </main>
    </div>
  )
}
