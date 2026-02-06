export function Card({ className = '', hover = false, children, ...props }) {
  return (
    <div
      className={`
        rounded-2xl bg-white border border-slate-200/80
        shadow-sm
        ${hover ? 'transition-all duration-300 hover:shadow-lg hover:border-slate-300/80 hover:-translate-y-0.5' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className = '', children, ...props }) {
  return (
    <div className={`px-6 py-5 border-b border-slate-100 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ className = '', children, ...props }) {
  return (
    <h2 className={`text-lg font-semibold text-slate-900 tracking-tight ${className}`} {...props}>
      {children}
    </h2>
  )
}

export function CardBody({ className = '', children, ...props }) {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  )
}
