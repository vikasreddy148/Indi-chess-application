/**
 * Game state utilities: parse FEN, derive board and turn.
 */
import { Chess } from 'chess.js';
import { SQUARES } from './board.js';
import { getLegalMoves } from './legalMoves.js';

/**
 * Parse FEN and return board state.
 * @param {string} fen - FEN string
 * @returns {{ pieceMap: Record<string, { type: string, color: string }>, turn: 'w'|'b' } | null}
 */
export function parseFen(fen) {
  try {
    const chess = new Chess(fen);
    const pieceMap = {};
    for (const sq of SQUARES) {
      const piece = chess.get(sq);
      if (piece) pieceMap[sq] = { type: piece.type, color: piece.color };
    }
    return {
      pieceMap,
      turn: chess.turn(),
    };
  } catch (_) {
    return null;
  }
}

/**
 * Get board state plus legal moves for a square.
 */
export function getBoardState(fen) {
  const parsed = parseFen(fen);
  if (!parsed) return null;
  const legalMoves = getLegalMoves(fen);
  return {
    ...parsed,
    legalMoves,
    legalTargetsFrom: (from) =>
      legalMoves.filter((m) => m.from === from).map((m) => m.to),
  };
}
