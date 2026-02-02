import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { getMatch } from '../api/match.js';
import ChessBoard from '../components/ChessBoard.jsx';
import { createStompClient, subscribeToGame, sendMove, sendResign, sendDrawOffer } from '../ws/stompClient.js';
import { getBoardState } from '../chess/state.js';
import { applyMove } from '../chess/legalMoves.js';

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

function GamePage() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [match, setMatch] = useState(null);
  const [fen, setFen] = useState(STARTING_FEN);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalTargets, setLegalTargets] = useState([]);
  const [stompClient, setStompClient] = useState(null);

  const isPlayer1 = match && user && Number(match.player1Id) === Number(user.userId);
  const isPlayer2 = match && user && Number(match.player2Id) === Number(user.userId);
  const myColor = isPlayer1 ? 'w' : isPlayer2 ? 'b' : null;
  const orientation = myColor === 'w' ? 'white' : 'black';
  const state = getBoardState(fen);
  const isMyTurn = state && myColor && state.turn === myColor;
  const gameOver = ['PLAYER1_WON', 'PLAYER2_WON', 'DRAW', 'ABANDONED'].includes(match?.status);

  const loadMatch = useCallback(async () => {
    try {
      const m = await getMatch(matchId);
      setMatch(m);
      setFen(m.fenCurrent || STARTING_FEN);
    } catch (e) {
      setError(e.message || 'Failed to load game');
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    loadMatch();
  }, [loadMatch]);

  useEffect(() => {
    if (!isAuthenticated || !match || gameOver) return;
    const client = createStompClient();
    client.onConnect = () => {
      setStompClient(client);
    };
    client.activate();
    return () => {
      client.deactivate?.();
    };
  }, [isAuthenticated, match?.id, gameOver]);

  useEffect(() => {
    if (!stompClient || !matchId) return;
    const unsub = subscribeToGame(stompClient, Number(matchId), (msg) => {
      if (msg.type === 'MOVE_MADE' && msg.match) {
        setMatch(msg.match);
        setFen(msg.match.fenCurrent || fen);
      } else if (msg.type === 'RESIGNED' && msg.match) {
        setMatch(msg.match);
      } else if (msg.type === 'DRAW' && msg.match) {
        setMatch(msg.match);
      } else if (msg.type === 'ERROR' && msg.error) {
        setError(msg.error);
      }
    });
    return unsub;
  }, [stompClient, matchId, fen]);

  const handleSquareClick = (square) => {
    if (!state || gameOver) return;
    const piece = state.pieceMap[square];
    const targets = state.legalTargetsFrom?.(square) ?? [];

    if (selectedSquare === square) {
      setSelectedSquare(null);
      setLegalTargets([]);
      return;
    }
    if (piece && piece.color === state.turn && myColor === state.turn) {
      setSelectedSquare(square);
      setLegalTargets(targets);
      return;
    }
    if (legalTargets.includes(square) && selectedSquare) {
      const moveUci = selectedSquare + square;
      if (stompClient && stompClient.connected) {
        sendMove(stompClient, Number(matchId), moveUci);
      }
      setSelectedSquare(null);
      setLegalTargets([]);
    }
  };

  const handleResign = () => {
    if (stompClient?.connected && matchId && (isPlayer1 || isPlayer2)) {
      sendResign(stompClient, Number(matchId));
    }
  };

  const handleDrawOffer = () => {
    if (stompClient?.connected && matchId && (isPlayer1 || isPlayer2)) {
      sendDrawOffer(stompClient, Number(matchId));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <p>Please log in to play.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <p>Loading game...</p>
      </div>
    );
  }

  if (error && !match) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-rose-400 mb-4">{error}</p>
          <button
            onClick={() => navigate('/home')}
            className="px-4 py-2 rounded bg-amber-500 text-stone-900 font-medium"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const statusText =
    match?.status === 'ONGOING'
      ? isMyTurn
        ? 'Your turn'
        : 'Opponent\'s turn'
      : match?.status === 'PLAYER1_WON'
        ? 'White wins'
        : match?.status === 'PLAYER2_WON'
          ? 'Black wins'
          : match?.status === 'DRAW' || match?.status === 'ABANDONED'
            ? 'Game over'
            : match?.status ?? '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 flex flex-col items-center">
      <header className="w-full max-w-2xl flex justify-between items-center mb-4">
        <button
          onClick={() => navigate('/home')}
          className="text-stone-400 hover:text-white transition"
        >
          ← Home
        </button>
        <span className="font-semibold">{statusText}</span>
        <span className="text-stone-400">Game {matchId}</span>
      </header>

      {error && (
        <p className="text-rose-400 text-sm mb-2">{error}</p>
      )}

      <ChessBoard
        fen={fen}
        orientation={orientation}
        lastMoveUci={match?.lastMoveUci}
        selectedSquare={selectedSquare}
        legalTargets={legalTargets}
        onSquareClick={handleSquareClick}
      />

      <div className="flex gap-4 mt-6">
        {(isPlayer1 || isPlayer2) && !gameOver && (
          <>
            <button
              onClick={handleResign}
              className="px-6 py-2 rounded-lg border border-rose-500 text-rose-400 hover:bg-rose-500/20 transition"
            >
              Resign
            </button>
            <button
              onClick={handleDrawOffer}
              className="px-6 py-2 rounded-lg border border-stone-400 text-stone-300 hover:bg-stone-700 transition"
            >
              Offer Draw
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default GamePage;
