import { API_ENDPOINTS } from '../config/api.js';
import { apiJson } from './client.js';

const GAME_TYPES = ['CLASSICAL', 'RAPID', 'BLITZ', 'BULLET'];

/**
 * Create a match (for direct play when you have player2).
 */
export async function createMatch(player2Id, gameType = 'RAPID') {
  return apiJson(API_ENDPOINTS.MATCH.CREATE, {
    method: 'POST',
    body: JSON.stringify({ player2Id, gameType }),
  });
}

/**
 * Get match by ID.
 */
export async function getMatch(matchId) {
  return apiJson(API_ENDPOINTS.MATCH.BY_ID(matchId));
}

/**
 * Join matchmaking queue. Returns { match } if matched, or { status: 'waiting' }.
 */
export async function joinMatchmaking(gameType) {
  const url = `${API_ENDPOINTS.MATCHMAKING.JOIN}?gameType=${gameType}`;
  return apiJson(url, { method: 'POST' });
}

/**
 * Leave matchmaking queue.
 */
export async function leaveMatchmaking() {
  return apiJson(API_ENDPOINTS.MATCHMAKING.LEAVE, { method: 'POST' });
}

/**
 * Get user's match history.
 */
export async function getUserMatches(userId) {
  return apiJson(`${API_ENDPOINTS.MATCH.USER_HISTORY}/${userId}`);
}

/**
 * Get move history for a match.
 */
export async function getMoveHistory(matchId) {
  return apiJson(API_ENDPOINTS.MATCH.MOVE_HISTORY(matchId));
}

/**
 * Make a move via REST (fallback when WebSocket not used).
 */
export async function makeMove(matchId, moveUci) {
  return apiJson(API_ENDPOINTS.MATCH.MOVE(matchId), {
    method: 'POST',
    body: JSON.stringify({ moveUci }),
  });
}

/**
 * Resign via REST.
 */
export async function resign(matchId) {
  return apiJson(API_ENDPOINTS.MATCH.RESIGN(matchId), { method: 'POST' });
}

/**
 * Offer/accept draw via REST.
 */
export async function offerDraw(matchId) {
  return apiJson(API_ENDPOINTS.MATCH.DRAW(matchId), { method: 'POST' });
}

export { GAME_TYPES };
export default {
  createMatch,
  getMatch,
  joinMatchmaking,
  leaveMatchmaking,
  getUserMatches,
  getMoveHistory,
  makeMove,
  resign,
  offerDraw,
  GAME_TYPES,
};
