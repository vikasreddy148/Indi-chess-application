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
      if (move?.promotion) {
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
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      <header className="flex items-center justify-between px-6 lg:px-12 py-4 bg-white border-b border-slate-200">
        <Link to="/"><Logo compact /></Link>
        <p className="text-lg font-semibold text-slate-900">{turn}'s turn</p>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-8 gap-10">
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
            <GameOverModal winner={gameOver.winner} reason={gameOver.reason} onRestart={resetGame} />
          )}
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="primary" size="lg" onClick={resetGame}>
            Reset game
          </Button>
          <Link to="/">
            <Button variant="outline" size="lg">Back to home</Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
