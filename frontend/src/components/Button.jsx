export function Button({
  variant = 'primary',
  type = 'button',
  className = '',
  children,
  disabled,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none'
  const variants = {
    primary:
      'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 border border-emerald-400/50 hover:bg-emerald-400 hover:shadow-emerald-500/30',
    secondary:
      'bg-white/5 text-white border border-emerald-500/50 hover:bg-white/10 hover:border-emerald-400/70',
    danger:
      'bg-red-500 text-white border border-red-400/50 shadow-lg shadow-red-500/20 hover:bg-red-400',
    ghost: 'bg-transparent text-white hover:bg-white/5 border border-transparent',
  }
  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
