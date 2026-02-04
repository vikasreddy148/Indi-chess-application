import { getApiBase } from '../config/api.js'

function getAuthHeaders() {
  const token = localStorage.getItem('indichess_token')
  const userId = localStorage.getItem('indichess_user_id')
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (userId) headers['X-User-Id'] = userId
  return headers
}

export async function apiRequest(path, options = {}) {
  const base = getApiBase()
  const url = `${base}${path}`
  const res = await fetch(url, {
    ...options,
    headers: { ...getAuthHeaders(), ...options.headers },
  })
  if (!res.ok) {
    const text = await res.text()
    let body
    try {
      body = JSON.parse(text)
    } catch {
      body = { message: text || res.statusText }
    }
    const message = body.message || body.error || `Request failed: ${res.status}`
    const err = new Error(
      body.errors && typeof body.errors === 'object'
        ? `${message}: ${Object.values(body.errors).join(' ')}`
        : message
    )
    err.errors = body.errors
    throw err
  }
  const contentType = res.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return res.json()
  }
  return res.text()
}

export const api = {
  get: (path) => apiRequest(path, { method: 'GET' }),
  post: (path, body) => apiRequest(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: (path, body) => apiRequest(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  delete: (path) => apiRequest(path, { method: 'DELETE' }),
}
