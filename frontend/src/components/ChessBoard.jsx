import { Chess } from 'chess.js'
import { FILES, RANKS, PIECE_SYMBOLS } from '../lib/chessConstants.js'

const LIGHT_SQ = 'bg-amber-100'
const DARK_SQ = 'bg-amber-900'

export function ChessBoard({
  fen,
  orientation = 'white',
  selectedSquare = null,
  lastMove = null,
  legalMoves = [],
  onSquareClick,
  disabled = false,
  className = '',
}) {
  const game = new Chess(fen)
  const board = []
  const ranks = orientation === 'white' ? [...RANKS] : RANKS.slice().reverse()
  const files = orientation === 'white' ? [...FILES] : FILES.slice().reverse()

  for (let ri = 0; ri < 8; ri++) {
    const rank = ranks[ri]
    for (let fi = 0; fi < 8; fi++) {
      const file = files[fi]
      const sq = file + rank
      const isLight = (ri + fi) % 2 === 0
      const piece = game.get(sq)
      const isSelected = selectedSquare === sq
      const isLastFrom = lastMove?.from === sq
      const isLastTo = lastMove?.to === sq
      const isLegal = legalMoves.includes(sq)

      board.push({
        sq,
        isLight,
        piece,
        isSelected,
        isLastFrom,
        isLastTo,
        isLegal,
      })
    }
  }

  return (
    <div className={`inline-flex flex-col rounded-xl overflow-hidden shadow-2xl border border-emerald-500/20 ${className}`}>
      <div className="flex">
        <div className="flex flex-col justify-around py-1 pr-1 bg-slate-800/90 text-white/80 text-sm font-medium shrink-0 w-6">
          {ranks.map((r) => (
            <span key={r} className="text-center">{r}</span>
          ))}
        </div>
        <div className="grid grid-cols-8" style={{ aspectRatio: '1', width: 'min(70vmin, 480px)' }}>
          {board.map(({ sq, isLight, piece, isSelected, isLastFrom, isLastTo, isLegal }) => {
            let bg = isLight ? LIGHT_SQ : DARK_SQ
            if (isLastTo) bg = 'bg-emerald-400/40'
            else if (isLastFrom) bg = 'bg-emerald-500/30'
            else if (isSelected) bg = 'bg-emerald-500/50'

            return (
              <button
                key={sq}
                type="button"
                onClick={() => !disabled && onSquareClick?.(sq)}
                disabled={disabled}
                className={`
                  relative w-full aspect-square flex items-center justify-center
                  ${bg} border-2 transition-colors
                  ${isSelected ? 'border-emerald-400 shadow-lg shadow-emerald-500/30' : 'border-transparent'}
                  ${!disabled ? 'hover:brightness-95 cursor-pointer' : 'cursor-default'}
                `}
              >
                {piece && (
                  <span
                    className={`text-3xl sm:text-4xl md:text-5xl select-none pointer-events-none ${
                      piece.color === 'w' ? 'text-slate-800 drop-shadow' : 'text-slate-900'
                    }`}
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    {PIECE_SYMBOLS[piece.color][piece.type.toUpperCase()]}
                  </span>
                )}
                {isLegal && !piece && (
                  <span className="absolute w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500/80 pointer-events-none" />
                )}
                {isLegal && piece && (
                  <span className="absolute inset-0 rounded-sm ring-2 ring-emerald-400/60 ring-inset pointer-events-none" />
                )}
              </button>
            )
          })}
        </div>
      </div>
      <div className="flex">
        <div className="w-6 shrink-0 bg-slate-800/90" />
        <div className="grid grid-cols-8 py-1 bg-slate-800/90 text-white/80 text-sm font-medium" style={{ width: 'min(70vmin, 480px)' }}>
          {files.map((f) => (
            <span key={f} className="text-center">{f}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
