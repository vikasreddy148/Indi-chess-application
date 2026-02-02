export function Logo({ className = '', showTagline = false, compact = false }) {
  return (
    <div className={`flex flex-col items-center gap-0.5 ${compact ? 'flex-row gap-2' : ''} ${className}`}>
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center" aria-hidden>
          <svg
            width={compact ? 28 : 36}
            height={compact ? 28 : 36}
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0"
          >
            <path
              d="M18 6l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4l2-4z"
              fill="white"
            />
            <path
              d="M12 22v2h2v-2h-2zm0 4v2h2v-2h-2zm2 2v2h2v-2h-2zm2-2v2h2v-2h-2zm2-4v2h2v-2h-2zm-6 8v2h2v-2h-2zm8-2v2h2v-2h-2zm2 2v2h2v-2h-2z"
              fill="white"
            />
            <path
              d="M14 14h2v2h-2v-2zm6 0h2v2h-2v-2zm-4 4h2v2h-2v-2z"
              fill="#10b981"
            />
            <path
              d="M10 12h4v4h-4v-4zm12 0h4v4h-4v-4zm-8 8h4v4h-4v-4z"
              stroke="#10b981"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>
        </div>
        <span className="font-bold text-white text-xl tracking-tight">
          <span className="text-white">Indi</span>
          <span className="text-emerald-400">Chess</span>
        </span>
      </div>
      {showTagline && !compact && (
        <p className="text-sm text-white/70">Play chess online. Fast, fair, and modern.</p>
      )}
    </div>
  )
}
