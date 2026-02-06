export function Logo({ className = '', showTagline = false, compact = false }) {
  return (
    <div className={`flex flex-col ${compact ? 'flex-row items-center gap-2' : 'items-center gap-1'} ${className}`}>
      <div className="flex items-center gap-2">
        <div
          className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold text-lg"
          aria-hidden
        >
          ♞
        </div>
        <span className="font-bold text-slate-900 text-xl tracking-tight">
          Indi<span className="text-indigo-600">Chess</span>
        </span>
      </div>
      {showTagline && !compact && (
        <p className="text-sm text-slate-500">Play chess online</p>
      )}
    </div>
  )
}
