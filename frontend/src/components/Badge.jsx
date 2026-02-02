export function Badge({ variant = 'default', className = '', children, ...props }) {
  const base = 'inline-flex items-center rounded-xl px-2.5 py-0.5 text-xs font-medium'
  const variants = {
    default: 'bg-slate-600/80 text-white border border-slate-500/50',
    live: 'bg-emerald-500/90 text-white border border-emerald-400/50',
    success: 'bg-emerald-600/80 text-white border border-emerald-500/50',
    danger: 'bg-red-500/80 text-white border border-red-400/50',
    draw: 'bg-slate-600/80 text-white border border-slate-500/50',
  }
  return (
    <span className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  )
}
