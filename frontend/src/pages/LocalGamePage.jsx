import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Chess } from 'chess.js'
import { Logo } from '../components/Logo.jsx'
import { Button } from '../components/Button.jsx'
import { ChessBoard } from '../components/ChessBoard.jsx'
import { GameOverModal } from '../components/GameOverModal.jsx'
import { PromotionModal } from '../components/PromotionModal.jsx'

export default function LocalGamePage() {
  const [game, setGame] = useState(() => new Chess())
  const [selectedSquare, setSelectedSquare] = useState(null)
  const [lastMove, setLastMove] = useState(null)
  const [gameOver, setGameOver] = useState(null)
  const [promotionMove, setPromotionMove] = useState(null)

  const turn = game.turn() === 'w' ? 'White' : 'Black'
  const legalSquares = selectedSquare
    ? game.moves({ square: selectedSquare, verbose: true }).map((m) => m.to)
    : []

  const checkGameOver = (chess) => {
    if (chess.isGameOver()) {
      let winner = null
      let reason = null

      if (chess.isCheckmate()) {
        winner = chess.turn() === 'w' ? 'Black' : 'White'
        reason = 'Checkmate'
      } else if (chess.isDraw()) {
        winner = 'Draw'
        if (chess.isStalemate()) reason = 'Stalemate'
        else if (chess.isThreefoldRepetition()) reason = 'Threefold Repetition'
        else if (chess.isInsufficientMaterial()) reason = 'Insufficient Material'
        else reason = 'Draw'
      }
      
      setGameOver({ winner, reason })
    }
  }

  const handleSquareClick = (sq) => {
    if (gameOver || promotionMove) return

    const piece = game.get(sq)
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(sq)
      return
    }
    if (selectedSquare && legalSquares.includes(sq)) {
      const moves = game.moves({ square: selectedSquare, verbose: true })
      const move = moves.find((m) => m.to === sq)
      
      // Check for promotion
      if (move && move.promotion) {
        setPromotionMove({ from: selectedSquare, to: sq })
        return
      }

      makeMove({ from: selectedSquare, to: sq })
      return
    }
    setSelectedSquare(null)
  }

  const makeMove = (moveObj) => {
    const gameCopy = new Chess(game.fen())
    const result = gameCopy.move(moveObj)
    
    if (result) {
      setGame(gameCopy)
      setLastMove({ from: result.from, to: result.to })
      setSelectedSquare(null)
      setPromotionMove(null)
      checkGameOver(gameCopy)
    }
  }

  const resetGame = () => {
    setGame(new Chess())
    setSelectedSquare(null)
    setLastMove(null)
    setGameOver(null)
    setPromotionMove(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 bg-slate-900/90 backdrop-blur-md border-b border-white/5 shrink-0">
        <Link to="/" className="flex items-center gap-2">
          <Logo compact />
        </Link>
        <h1 className="text-xl font-bold text-white">{turn}'s turn</h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
        <div className="relative">
          <ChessBoard
            fen={game.fen()}
            orientation="white"
            selectedSquare={selectedSquare}
            lastMove={lastMove}
            legalMoves={legalSquares}
            onSquareClick={handleSquareClick}
          />
          {promotionMove && (
            <PromotionModal
              color={game.turn()}
              onSelect={(p) => makeMove({ ...promotionMove, promotion: p })}
            />
          )}
          {gameOver && (
            <GameOverModal
              winner={gameOver.winner}
              reason={gameOver.reason}
              onRestart={resetGame}
            />
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button
            variant="primary"
            className="rounded-xl px-6 py-3 flex items-center gap-2 border border-emerald-400/50 shadow-emerald-500/20"
            onClick={resetGame}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset Game
          </Button>
          <Link to="/">
            <Button
              variant="primary"
              className="rounded-xl px-6 py-3 flex items-center gap-2 border border-emerald-400/50 shadow-emerald-500/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}

