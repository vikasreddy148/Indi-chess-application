import { api } from './client.js'

export async function getProfile() {
  return api.get('/api/users/profile')
}

export async function updateProfile(payload) {
  return api.put('/api/users/profile', payload)
}

export async function getUserById(userId) {
  return api.get(`/api/users/${userId}`)
}
