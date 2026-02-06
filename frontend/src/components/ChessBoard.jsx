import { Chess } from 'chess.js'
import { FILES, RANKS, PIECE_SYMBOLS } from '../lib/chessConstants.js'

const LIGHT_SQ = 'bg-[#f0d9b5]'
const DARK_SQ = 'bg-[#b58863]'

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

      board.push({ sq, isLight, piece, isSelected, isLastFrom, isLastTo, isLegal })
    }
  }

  return (
    <div className={`inline-flex flex-col overflow-hidden rounded-lg ${className}`}>
      <div className="flex">
        <div className="flex flex-col justify-around py-1.5 pr-1.5 bg-[#2d3748] text-slate-400 text-xs font-medium shrink-0 w-5">
          {ranks.map((r) => (
            <span key={r} className="text-center">{r}</span>
          ))}
        </div>
        <div className="grid grid-cols-8" style={{ aspectRatio: '1', width: 'min(70vmin, 480px)' }}>
          {board.map(({ sq, isLight, piece, isSelected, isLastFrom, isLastTo, isLegal }) => {
            let bg = isLight ? LIGHT_SQ : DARK_SQ
            if (isLastTo) bg = 'bg-amber-400/50'
            else if (isLastFrom) bg = 'bg-amber-500/40'
            else if (isSelected) bg = 'bg-indigo-400/60'

            return (
              <button
                key={sq}
                type="button"
                onClick={() => !disabled && onSquareClick?.(sq)}
                disabled={disabled}
                className={`
                  relative w-full aspect-square flex items-center justify-center
                  ${bg} transition-all duration-150
                  ${isSelected ? 'ring-2 ring-indigo-500 ring-inset' : ''}
                  ${!disabled ? 'hover:brightness-95 cursor-pointer' : 'cursor-default'}
                `}
              >
                {piece && (
                  <span
                    className={`text-3xl sm:text-4xl md:text-5xl select-none pointer-events-none ${
                      piece.color === 'w' ? 'text-slate-800 drop-shadow-md' : 'text-slate-900 drop-shadow'
                    }`}
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    {PIECE_SYMBOLS[piece.color][piece.type.toUpperCase()]}
                  </span>
                )}
                {isLegal && !piece && (
                  <span className="absolute w-2.5 h-2.5 rounded-full bg-indigo-500/70 pointer-events-none" />
                )}
                {isLegal && piece && (
                  <span className="absolute inset-0.5 rounded-sm ring-2 ring-amber-400/80 pointer-events-none" />
                )}
              </button>
            )
          })}
        </div>
      </div>
      <div className="flex">
        <div className="w-5 shrink-0 bg-[#2d3748]" />
        <div className="grid grid-cols-8 py-1.5 bg-[#2d3748] text-slate-400 text-xs font-medium" style={{ width: 'min(70vmin, 480px)' }}>
          {files.map((f) => (
            <span key={f} className="text-center">{f}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
