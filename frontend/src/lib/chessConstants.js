export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
export const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1']

export const PIECE_SYMBOLS = {
  w: { K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙' },
  b: { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' },
}

export const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

export function squareToIndices(sq) {
  const file = sq.charCodeAt(0) - 97
  const rank = 8 - parseInt(sq[1], 10)
  return { file, rank }
}

export function indicesToSquare(file, rank) {
  return String.fromCharCode(97 + file) + (8 - rank)
}
