import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { API_ENDPOINTS } from '../config/api.js';
import { getToken } from '../api/client.js';

/**
 * Create a STOMP client for the game WebSocket.
 * Connect with: client.activate()
 * Subscribe: client.subscribe('/topic/game/' + matchId, callback)
 * Send move: client.publish({ destination: '/app/game/' + matchId + '/move', body: JSON.stringify({ moveUci: 'e2e4' }) })
 */
export function createStompClient() {
  const wsUrl = API_ENDPOINTS.WEBSOCKET.ENDPOINT.replace(/^ws/, 'http');
  const token = getToken();
  const url = token ? `${wsUrl}?token=${encodeURIComponent(token)}` : wsUrl;

  const client = new Client({
    webSocketFactory: () => new SockJS(url),
    connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
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

export default {
  createStompClient,
  subscribeToGame,
  sendMove,
  sendResign,
  sendDrawOffer,
};
