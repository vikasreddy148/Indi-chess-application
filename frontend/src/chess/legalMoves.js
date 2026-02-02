/**
 * Legal move generation and validation using chess.js
 */
import { Chess } from 'chess.js';

/**
 * Get all legal moves for the current position.
 * @param {string} fen - FEN string
 * @returns {Array<{ from: string, to: string, san?: string }>}
 */
export function getLegalMoves(fen) {
  try {
    const chess = new Chess(fen);
    const moves = chess.moves({ verbose: true });
    return moves.map((m) => ({ from: m.from, to: m.to, san: m.san }));
  } catch (_) {
    return [];
  }
}

/**
 * Validate and apply a move in UCI format (e.g. "e2e4").
 * @param {string} fen - Current FEN
 * @param {string} uci - Move in UCI format (from+to, e.g. "e2e4")
 * @returns {{ ok: boolean, fen?: string, san?: string, error?: string }}
 */
export function applyMove(fen, uci) {
  try {
    const chess = new Chess(fen);
    const from = uci.slice(0, 2);
    const to = uci.slice(2, 4);
    const promotion = uci.length >= 5 ? uci[4] : undefined;
    const move = chess.move({ from, to, promotion });
    if (!move) {
      return { ok: false, error: 'Invalid move' };
    }
    return { ok: true, fen: chess.fen(), san: move.san };
  } catch (e) {
    return { ok: false, error: e.message || 'Invalid move' };
  }
}

/**
 * Check if a move is legal.
 */
export function isLegalMove(fen, uci) {
  const result = applyMove(fen, uci);
  return result.ok;
}

/**
 * Check if the game is over (checkmate, stalemate, draw).
 */
export function getGameOutcome(fen) {
  try {
    const chess = new Chess(fen);
    if (chess.isCheckmate()) {
      return { gameOver: true, winner: chess.turn() === 'w' ? 'b' : 'w', reason: 'checkmate' };
    }
    if (chess.isStalemate()) return { gameOver: true, reason: 'stalemate' };
    if (chess.isDraw()) {
      if (chess.isThreefoldRepetition()) return { gameOver: true, reason: 'repetition' };
      if (chess.isFiftyMoveRule()) return { gameOver: true, reason: '50-move' };
      if (chess.isInsufficientMaterial()) return { gameOver: true, reason: 'insufficient material' };
      return { gameOver: true, reason: 'draw' };
    }
    return { gameOver: false };
  } catch (_) {
    return { gameOver: false };
  }
}

export const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
