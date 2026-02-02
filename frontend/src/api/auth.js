import { api } from './client.js'

export async function login(usernameOrEmail, password) {
  const data = await api.post('/api/auth/login', {
    usernameOrEmail,
    password,
  })
  return data
}

export async function register(username, email, password, country) {
  const data = await api.post('/api/auth/register', {
    username,
    email,
    password,
    country: country || undefined,
  })
  return data
}

export async function logout() {
  try {
    await api.post('/api/auth/logout')
  } catch {
    // ignore
  }
}
