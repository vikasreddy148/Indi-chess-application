import { api } from './client.js'

const GAME_TYPE_MAP = { rapid: 'RAPID', blitz: 'BLITZ', classical: 'CLASSICAL' }

export async function joinMatchmaking(gameType) {
  const param = GAME_TYPE_MAP[gameType] || 'RAPID'
  const data = await api.post(`/api/matchmaking/join?gameType=${param}`)
  return data
}

export async function leaveMatchmaking() {
  await api.post('/api/matchmaking/leave')
}

export async function getMatch(matchId) {
  const data = await api.get(`/api/matches/${matchId}`)
  return data
}

export async function getUserMatches(userId) {
  const data = await api.get(`/api/matches/user/${userId}`)
  return data
}

export async function getMoveHistory(matchId) {
  const data = await api.get(`/api/matches/${matchId}/history`)
  return data
}

export async function makeMove(matchId, moveUci) {
  const data = await api.post(`/api/matches/${matchId}/move`, { moveUci })
  return data
}

export async function resign(matchId) {
  const data = await api.post(`/api/matches/${matchId}/resign`)
  return data
}

export async function offerDraw(matchId) {
  const data = await api.post(`/api/matches/${matchId}/draw`)
  return data
}

export async function acceptDraw(matchId) {
  const data = await api.post(`/api/matches/${matchId}/draw/accept`)
  return data
}

export async function declineDraw(matchId) {
  const data = await api.post(`/api/matches/${matchId}/draw/decline`)
  return data
}
