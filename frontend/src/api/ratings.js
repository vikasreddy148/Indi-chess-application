import { api } from './client.js'

const GAME_TYPE_MAP = { rapid: 'RAPID', blitz: 'BLITZ', classical: 'CLASSICAL' }

/**
 * Get all ratings for the current user (from match-service).
 * @returns {Promise<Array<{ gameType: string, rating: number }>>}
 */
export async function getMyRatings() {
  return api.get('/api/ratings/me')
}

/**
 * Get all ratings for a user by id.
 * @param {number} userId
 * @returns {Promise<Array<{ gameType: string, rating: number }>>}
 */
export async function getUserRatings(userId) {
  return api.get(`/api/ratings/user/${userId}`)
}

/**
 * Get rating for a specific game type from a ratings list.
 * @param {Array<{ gameType: string, rating: number }>} ratings
 * @param {string} gameType - e.g. 'RAPID', 'BLITZ'
 * @returns {number}
 */
export function ratingForGameType(ratings, gameType) {
  if (!Array.isArray(ratings)) return 1200
  const r = ratings.find((x) => x.gameType === gameType)
  return r?.rating ?? 1200
}

export { GAME_TYPE_MAP }
