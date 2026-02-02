export function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`rounded-xl bg-white/5 backdrop-blur-md border border-emerald-500/20 shadow-xl shadow-black/20 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className = '', children, ...props }) {
  return (
    <div className={`border-b border-white/10 px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ className = '', children, ...props }) {
  return (
    <h2 className={`text-lg font-bold text-white ${className}`} {...props}>
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
