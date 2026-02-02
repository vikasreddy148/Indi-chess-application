import { useState } from 'react';
import { Link } from 'react-router-dom';
import ChessBoard from '../components/ChessBoard.jsx';
import { getBoardState } from '../chess/state.js';
import { applyMove, getGameOutcome, STARTING_FEN } from '../chess/legalMoves.js';

function LocalGamePage() {
  const [fen, setFen] = useState(STARTING_FEN);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalTargets, setLegalTargets] = useState([]);

  const state = getBoardState(fen);
  const outcome = getGameOutcome(fen);
  const isWhiteTurn = state?.turn === 'w';

  const handleSquareClick = (square) => {
    if (outcome.gameOver) return;
    const piece = state?.pieceMap?.[square];
    const targets = state?.legalTargetsFrom?.(square) ?? [];

    if (selectedSquare === square) {
      setSelectedSquare(null);
      setLegalTargets([]);
      return;
    }
    if (piece && piece.color === state.turn) {
      setSelectedSquare(square);
      setLegalTargets(targets);
      return;
    }
    if (legalTargets.includes(square) && selectedSquare) {
      const result = applyMove(fen, selectedSquare + square);
      if (result.ok) {
        setFen(result.fen);
      }
      setSelectedSquare(null);
      setLegalTargets([]);
    }
  };

  const resetGame = () => {
    setFen(STARTING_FEN);
    setSelectedSquare(null);
    setLegalTargets([]);
  };

  const statusText = outcome.gameOver
    ? outcome.winner
      ? `${outcome.winner === 'w' ? 'White' : 'Black'} wins`
      : 'Draw'
    : isWhiteTurn
      ? 'White to move'
      : 'Black to move';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 flex flex-col items-center">
      <header className="w-full max-w-2xl flex justify-between items-center mb-4">
        <Link to="/home" className="text-stone-400 hover:text-white transition">
          ← Home
        </Link>
        <span className="font-semibold">{statusText}</span>
        <button
          onClick={resetGame}
          className="px-3 py-1 rounded bg-stone-700 hover:bg-stone-600 transition text-sm"
        >
          New Game
        </button>
      </header>

      <ChessBoard
        fen={fen}
        orientation="white"
        selectedSquare={selectedSquare}
        legalTargets={legalTargets}
        onSquareClick={handleSquareClick}
      />

      <p className="mt-4 text-stone-400 text-sm">Local 2-player · White plays first</p>
    </div>
  );
}

export default LocalGamePage;
