import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { getApiBase } from '../config/api.js'

// SockJS requires http/https URL, not ws/wss
function getWsUrl() {
  const base = getApiBase()
  const origin = base || (typeof window !== 'undefined' ? window.location.origin : '')
  const protocol = origin.startsWith('https') ? 'https' : 'http'
  const host = origin.replace(/^https?:\/\//, '')
  return `${protocol}://${host}/ws-indichess`
}

/**
 * Create a STOMP client that connects with JWT.
 * tokenGetter() is called at connect time.
 */
export function createStompClient(tokenGetter) {
  const wsUrl = getWsUrl()
  if (!wsUrl) return null

  const client = new Client({
    webSocketFactory: () => {
      const token = tokenGetter()
      const sep = wsUrl.includes('?') ? '&' : '?'
      const url = token ? `${wsUrl}${sep}token=${encodeURIComponent(token)}` : wsUrl
      return new SockJS(url)
    },
    reconnectDelay: 3000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  })

  return client
}

/**
 * Subscribe to matchmaking topic; callback receives match object when matched.
 */
export function subscribeMatchmaking(client, userId, onMatch) {
  if (!client || userId == null) return () => {}
  const sub = client.subscribe(`/topic/matchmaking/${userId}`, (message) => {
    const body = JSON.parse(message.body)
    if (body && body.id) onMatch(body)
  })
  return () => sub.unsubscribe()
}

/**
 * Subscribe to game topic; callback receives game update messages.
 */
export function subscribeGame(client, matchId, onMessage) {
  if (!client || matchId == null) return () => {}
  const sub = client.subscribe(`/topic/game/${matchId}`, (message) => {
    const body = JSON.parse(message.body)
    onMessage(body)
  })
  return () => sub.unsubscribe()
}

/**
 * Send a move via WebSocket.
 */
export function sendMove(client, matchId, moveUci) {
  if (!client || !matchId) return
  client.publish({
    destination: `/app/game/${matchId}/move`,
    body: JSON.stringify({ moveUci }),
  })
}

/**
 * Send resign via WebSocket.
 */
export function sendResign(client, matchId) {
  if (!client || !matchId) return
  client.publish({
    destination: `/app/game/${matchId}/resign`,
    body: JSON.stringify({}),
  })
}

/**
 * Send offer draw via WebSocket.
 */
export function sendOfferDraw(client, matchId) {
  if (!client || !matchId) return
  client.publish({
    destination: `/app/game/${matchId}/draw`,
    body: JSON.stringify({}),
  })
}

/**
 * Send accept draw via WebSocket.
 */
export function sendAcceptDraw(client, matchId) {
  if (!client || !matchId) return
  client.publish({
    destination: `/app/game/${matchId}/draw/accept`,
    body: JSON.stringify({}),
  })
}

/**
 * Send decline draw via WebSocket.
 */
export function sendDeclineDraw(client, matchId) {
  if (!client || !matchId) return
  client.publish({
    destination: `/app/game/${matchId}/draw/decline`,
    body: JSON.stringify({}),
  })
}
