import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { API_ENDPOINTS } from '../config/api.js';
import { getToken } from '../api/client.js';

/**
 * Create a STOMP client for the game WebSocket.
 * Connect with: client.activate()
 * Optional callbacks: createStompClient({ onConnect, onDisconnect }) for connection state.
 * Subscribe: client.subscribe('/topic/game/' + matchId, callback)
 * Send move: client.publish({ destination: '/app/game/' + matchId + '/move', body: JSON.stringify({ moveUci: 'e2e4' }) })
 */
export function createStompClient(callbacks = {}) {
  const { onConnect, onDisconnect } = callbacks;
  const wsUrl = API_ENDPOINTS.WEBSOCKET.ENDPOINT.replace(/^ws/, 'http');
  const token = getToken();
  const url = token ? `${wsUrl}?token=${encodeURIComponent(token)}` : wsUrl;

  const client = new Client({
    webSocketFactory: () => new SockJS(url),
    connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    onConnect: (frame) => {
      onConnect?.(frame);
    },
    onWebSocketClose: () => {
      onDisconnect?.();
    },
    onStompError: () => {
      onDisconnect?.();
    },
  });

  return client;
}

/**
 * Subscribe to game updates for a match.
 * @param {Client} stompClient - activated STOMP client
 * @param {number} matchId - match id
 * @param {(message: { type: string, match?: object, moveUci?: string, error?: string }) => void} onMessage
 * @returns unsubscribe function
 */
export function subscribeToGame(stompClient, matchId, onMessage) {
  const sub = stompClient.subscribe(`/topic/game/${matchId}`, (message) => {
    try {
      const body = JSON.parse(message.body);
      onMessage(body);
    } catch (e) {
      onMessage({ type: 'ERROR', error: 'Invalid message' });
    }
  });
  return () => sub.unsubscribe();
}

/**
 * Subscribe to matchmaking: when a match is found, onMatch(matchResponse) is called.
 * @param {Client} stompClient - activated STOMP client
 * @param {number} userId - current user id
 * @param {(match: { id: number }) => void} onMatch
 * @returns unsubscribe function
 */
export function subscribeToMatchmaking(stompClient, userId, onMatch) {
  const sub = stompClient.subscribe(`/topic/matchmaking/${userId}`, (message) => {
    try {
      const body = JSON.parse(message.body);
      if (body?.id) onMatch(body);
    } catch (_) {}
  });
  return () => sub.unsubscribe();
}

/**
 * Send a move via WebSocket.
 */
export function sendMove(stompClient, matchId, moveUci) {
  stompClient.publish({
    destination: `/app/game/${matchId}/move`,
    body: JSON.stringify({ moveUci }),
  });
}

/**
 * Send resign via WebSocket.
 */
export function sendResign(stompClient, matchId) {
  stompClient.publish({
    destination: `/app/game/${matchId}/resign`,
    body: JSON.stringify({}),
  });
}

/**
 * Send draw offer via WebSocket.
 */
export function sendDrawOffer(stompClient, matchId) {
  stompClient.publish({
    destination: `/app/game/${matchId}/draw`,
    body: JSON.stringify({}),
  });
}

/**
 * Accept draw offer via WebSocket.
 */
export function sendDrawAccept(stompClient, matchId) {
  stompClient.publish({
    destination: `/app/game/${matchId}/draw/accept`,
    body: JSON.stringify({}),
  });
}

/**
 * Decline draw offer via WebSocket.
 */
export function sendDrawDecline(stompClient, matchId) {
  stompClient.publish({
    destination: `/app/game/${matchId}/draw/decline`,
    body: JSON.stringify({}),
  });
}

export default {
  createStompClient,
  subscribeToGame,
  subscribeToMatchmaking,
  sendMove,
  sendResign,
  sendDrawOffer,
  sendDrawAccept,
  sendDrawDecline,
};
