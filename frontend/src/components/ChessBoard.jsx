import { PIECE_SYMBOLS, FILES, RANKS, SQUARES } from '../chess/board.js';
import { getBoardState } from '../chess/state.js';

function ChessBoard({ fen, orientation = 'white', lastMoveUci, selectedSquare, legalTargets, onSquareClick }) {
  const state = getBoardState(fen);
  const pieceMap = state?.pieceMap ?? {};
  const isFlipped = orientation === 'black';
  const displayRanks = isFlipped ? [...RANKS].reverse() : RANKS;
  const displayFiles = isFlipped ? [...FILES].reverse() : FILES;

  function getSquareColor(fileIdx, rankIdx) {
    const isLight = (fileIdx + rankIdx) % 2 === 0;
    return isLight ? 'bg-amber-100' : 'bg-emerald-800';
  }

  function isHighlighted(square) {
    if (selectedSquare === square) return true;
    if (legalTargets?.includes(square)) return true;
    if (!lastMoveUci) return false;
    const from = lastMoveUci.slice(0, 2);
    const to = lastMoveUci.slice(2, 4);
    return square === from || square === to;
  }

  return (
    <div className="inline-block border-4 border-stone-800 rounded-lg overflow-hidden shadow-xl">
      <div className="grid grid-cols-8 gap-0" style={{ width: 'min(80vw, 480px)' }}>
        {displayRanks.map((rank) =>
          displayFiles.map((file) => {
            const square = file + rank;
            const fileIdx = FILES.indexOf(file);
            const rankIdx = RANKS.indexOf(rank);
            const piece = pieceMap[square];
            const baseColor = getSquareColor(fileIdx, rankIdx);
            const highlight = isHighlighted(square);
            const isSelected = selectedSquare === square;
            const isLegalTarget = legalTargets?.includes(square);

            let bgClass = baseColor;
            if (isSelected) bgClass = 'bg-amber-300';
            else if (isLegalTarget) bgClass = piece ? 'bg-rose-400' : 'bg-amber-200/80';
            else if (highlight && !isSelected) bgClass = `${baseColor} ring-2 ring-inset ring-amber-500/50`;

            return (
              <button
                key={square}
                type="button"
                className={`aspect-square flex items-center justify-center text-4xl md:text-5xl font-chess select-none transition ${bgClass} hover:opacity-90`}
                onClick={() => onSquareClick?.(square)}
                data-square={square}
              >
                {piece ? (
                  <span className={piece.color === 'w' ? 'text-stone-800' : 'text-stone-900'}>
                    {PIECE_SYMBOLS[piece.color]?.[piece.type]}
                  </span>
                ) : isLegalTarget ? (
                  <span className="w-3 h-3 rounded-full bg-stone-500/50" />
                ) : null}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ChessBoard;
