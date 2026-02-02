import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { getMatch, makeMove as makeMoveApi, resign as resignApi, offerDraw as offerDrawApi, acceptDraw as acceptDrawApi, declineDraw as declineDrawApi } from '../api/match.js';
import ChessBoard from '../components/ChessBoard.jsx';
import { createStompClient, subscribeToGame, sendMove, sendResign, sendDrawOffer, sendDrawAccept, sendDrawDecline } from '../ws/stompClient.js';
import { getBoardState } from '../chess/state.js';

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

function GamePage() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [match, setMatch] = useState(null);
  const [fen, setFen] = useState(STARTING_FEN);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalTargets, setLegalTargets] = useState([]);
  const [stompClient, setStompClient] = useState(null);
  const [connectionState, setConnectionState] = useState('disconnected'); // 'connected' | 'reconnecting' | 'disconnected'
  const [movePending, setMovePending] = useState(false);

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
    const client = createStompClient({
      onConnect: () => {
        setConnectionState('connected');
        setStompClient(client);
      },
      onDisconnect: () => {
        setConnectionState('reconnecting');
      },
    });
    client.activate();
    return () => {
      client.deactivate?.();
      setConnectionState('disconnected');
    };
  }, [isAuthenticated, match?.id, gameOver]);

  useEffect(() => {
    if (!stompClient || !matchId) return;
    const unsub = subscribeToGame(stompClient, Number(matchId), (msg) => {
      if (msg.type === 'MOVE_MADE' && msg.match) {
        setMatch(msg.match);
        setFen(msg.match.fenCurrent || fen);
        setError(null);
        setMovePending(false);
      } else if (msg.type === 'RESIGNED' && msg.match) {
        setMatch(msg.match);
        setError(null);
      } else if (msg.type === 'DRAW' && msg.match) {
        setMatch(msg.match);
        setError(null);
      } else if (msg.type === 'DRAW_OFFERED' && msg.match) {
        setMatch(msg.match);
        setError(null);
      } else if (msg.type === 'DRAW_DECLINED' && msg.match) {
        setMatch(msg.match);
        setError(null);
      } else if (msg.type === 'ERROR' && msg.error) {
        setError(msg.error);
        setMovePending(false);
      }
    });
    return unsub;
  }, [stompClient, matchId, fen]);

  const handleSquareClick = async (square) => {
    if (!state || gameOver || movePending) return;
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
      setSelectedSquare(null);
      setLegalTargets([]);
      if (stompClient?.connected) {
        sendMove(stompClient, Number(matchId), moveUci);
        setMovePending(true);
      } else {
        setMovePending(true);
        setError(null);
        try {
          const updated = await makeMoveApi(matchId, moveUci);
          setMatch(updated);
          setFen(updated?.fenCurrent || fen);
        } catch (e) {
          setError(e.message || 'Move failed');
        } finally {
          setMovePending(false);
        }
      }
    }
  };

  const handleResign = async () => {
    if (!matchId || !(isPlayer1 || isPlayer2)) return;
    if (stompClient?.connected) {
      sendResign(stompClient, Number(matchId));
      return;
    }
    setError(null);
    try {
      const updated = await resignApi(matchId);
      setMatch(updated);
    } catch (e) {
      setError(e.message || 'Resign failed');
    }
  };

  const drawOfferedByOpponent = match?.drawOfferedByPlayerId != null && Number(match.drawOfferedByPlayerId) !== Number(user?.userId);
  const iOfferedDraw = match?.drawOfferedByPlayerId != null && Number(match.drawOfferedByPlayerId) === Number(user?.userId);

  const handleDrawOffer = async () => {
    if (!matchId || !(isPlayer1 || isPlayer2)) return;
    if (stompClient?.connected) {
      sendDrawOffer(stompClient, Number(matchId));
      return;
    }
    setError(null);
    try {
      const updated = await offerDrawApi(matchId);
      setMatch(updated);
    } catch (e) {
      setError(e.message || 'Draw offer failed');
    }
  };

  const handleAcceptDraw = async () => {
    if (!matchId || !(isPlayer1 || isPlayer2)) return;
    if (stompClient?.connected) {
      sendDrawAccept(stompClient, Number(matchId));
      return;
    }
    setError(null);
    try {
      const updated = await acceptDrawApi(matchId);
      setMatch(updated);
    } catch (e) {
      setError(e.message || 'Accept draw failed');
    }
  };

  const handleDeclineDraw = async () => {
    if (!matchId || !(isPlayer1 || isPlayer2)) return;
    if (stompClient?.connected) {
      sendDrawDecline(stompClient, Number(matchId));
      return;
    }
    setError(null);
    try {
      const updated = await declineDrawApi(matchId);
      setMatch(updated);
    } catch (e) {
      setError(e.message || 'Decline draw failed');
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
      <header className="w-full max-w-2xl flex justify-between items-center mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/home')}
            className="text-stone-400 hover:text-white transition"
          >
            ← Home
          </button>
          <button
            type="button"
            onClick={() => logout().then(() => navigate('/'))}
            className="text-stone-400 hover:text-white transition text-sm"
          >
            Log out
          </button>
        </div>
        <span className="font-semibold">{statusText}</span>
        <div className="flex items-center gap-2">
          {connectionState === 'connected' && (
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-600/80 text-white">Live</span>
          )}
          {connectionState === 'reconnecting' && (
            <span className="text-xs px-2 py-0.5 rounded bg-amber-600/80 text-white animate-pulse">Reconnecting…</span>
          )}
          {movePending && (
            <span className="text-xs text-stone-400">Sending move…</span>
          )}
          <span className="text-stone-400">Game {matchId}</span>
        </div>
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

      {drawOfferedByOpponent && (
        <div className="mt-4 p-4 rounded-lg bg-amber-900/40 border border-amber-600/60 flex flex-col sm:flex-row gap-3 items-center justify-center">
          <span className="text-amber-200 font-medium">Opponent offers a draw</span>
          <div className="flex gap-2">
            <button
              onClick={handleAcceptDraw}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition"
            >
              Accept
            </button>
            <button
              onClick={handleDeclineDraw}
              className="px-4 py-2 rounded-lg border border-stone-500 text-stone-300 hover:bg-stone-700 transition"
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {iOfferedDraw && !gameOver && (
        <p className="mt-4 text-amber-300/90 text-sm">Draw offered. Waiting for opponent.</p>
      )}

      <div className="flex gap-4 mt-6">
        {(isPlayer1 || isPlayer2) && !gameOver && !drawOfferedByOpponent && (
          <>
            <button
              onClick={handleResign}
              className="px-6 py-2 rounded-lg border border-rose-500 text-rose-400 hover:bg-rose-500/20 transition"
            >
              Resign
            </button>
            <button
              onClick={handleDrawOffer}
              disabled={!!match?.drawOfferedByPlayerId}
              className="px-6 py-2 rounded-lg border border-stone-400 text-stone-300 hover:bg-stone-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
