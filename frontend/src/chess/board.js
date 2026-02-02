/**
 * Chess board utilities: file/rank to square, piece mapping, etc.
 */

export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
export const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

/** Square names in board order (a8..h1) */
export const SQUARES = FILES.flatMap((f) => RANKS.map((r) => f + r));

/** Index 0..63 (a8=0, h1=63) */
export function squareToIndex(square) {
  const file = square.charCodeAt(0) - 97;
  const rank = 8 - parseInt(square[1], 10);
  return rank * 8 + file;
}

export function indexToSquare(index) {
  const file = index % 8;
  const rank = Math.floor(index / 8);
  return FILES[file] + RANKS[rank];
}

/** Unicode piece symbols for display */
export const PIECE_SYMBOLS = {
  w: { K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙' },
  b: { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' },
};

export function getPieceSymbol(piece) {
  if (!piece) return null;
  return PIECE_SYMBOLS[piece.color]?.[piece.type] ?? null;
}

/** Standard piece names for img/assets */
export function pieceName(piece) {
  if (!piece) return null;
  const color = piece.color === 'w' ? 'white' : 'black';
  const type = piece.type.toLowerCase();
  return `${color}-${type}`;
}
