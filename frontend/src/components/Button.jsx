export function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  className = '',
  children,
  disabled,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]'
  const variants = {
    primary:
      'bg-indigo-600 text-white hover:bg-indigo-500 focus:ring-indigo-500/50 shadow-sm',
    secondary:
      'bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-300',
    outline:
      'border-2 border-slate-200 bg-transparent text-slate-700 hover:border-slate-300 hover:bg-slate-50 focus:ring-slate-300',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-200',
    danger: 'bg-red-600 text-white hover:bg-red-500 focus:ring-red-500/50',
  }
  const sizes = {
    sm: 'h-9 px-4 rounded-lg text-sm',
    md: 'h-11 px-6 rounded-xl text-sm',
    lg: 'h-12 px-8 rounded-xl text-base',
    xl: 'h-14 px-10 rounded-2xl text-base',
  }
  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
