const API_BASE = import.meta.env.VITE_API_BASE ?? ''

export function getApiBase() {
  return API_BASE || ''
}

/** Base URL for OAuth (must be gateway/public URL, not proxy). Fallback for dev when VITE_API_BASE is unset. */
export function getOAuthBase() {
  const base = getApiBase()
  if (base) return base.replace(/\/$/, '')
  if (typeof window !== 'undefined' && window.location.port === '5173') return 'http://localhost:8080'
  return typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : ''
}

export function getWsBase() {
  const base = getApiBase()
  if (!base) return ''
  return base.replace(/^http/, 'ws')
}
