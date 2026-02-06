import { useState } from 'react'

function EyeIcon({ show }) {
  return show ? (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242" />
    </svg>
  )
}

export function Input({
  type: initialType = 'text',
  label,
  error,
  className = '',
  containerClassName = '',
  ...props
}) {
  const isPassword = initialType === 'password'
  const [showPassword, setShowPassword] = useState(false)
  const type = isPassword && showPassword ? 'text' : initialType

  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
      )}
      <div className="relative">
        <input
          type={type}
          className={`
            w-full h-12 px-4 rounded-xl border bg-white
            text-slate-900 placeholder-slate-400
            focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400
            disabled:opacity-50 disabled:bg-slate-50
            transition-all
            ${error ? 'border-red-300' : 'border-slate-200'}
            ${isPassword ? 'pr-12' : ''}
            ${className}
          `}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <EyeIcon show={showPassword} />
          </button>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
