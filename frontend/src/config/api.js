const API_BASE = import.meta.env.VITE_API_BASE ?? ''

export function getApiBase() {
  return API_BASE || ''
}

export function getWsBase() {
  const base = getApiBase()
  if (!base) return ''
  return base.replace(/^http/, 'ws')
}
