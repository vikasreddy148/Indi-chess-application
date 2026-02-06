export function Badge({ variant = 'default', className = '', children, ...props }) {
  const base = 'inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium'
  const variants = {
    default: 'bg-slate-100 text-slate-600',
    live: 'bg-emerald-50 text-emerald-700',
    success: 'bg-emerald-50 text-emerald-700',
    danger: 'bg-red-50 text-red-700',
    draw: 'bg-slate-100 text-slate-600',
  }
  return (
    <span className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  )
}
