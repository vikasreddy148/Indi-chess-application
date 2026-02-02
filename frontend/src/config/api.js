const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
    REFRESH: `${API_BASE_URL}/api/auth/refresh`,
  },
  USER: {
    PROFILE: `${API_BASE_URL}/api/users/profile`,
    BY_ID: (id) => `${API_BASE_URL}/api/users/${id}`,
  },
  MATCH: {
    CREATE: `${API_BASE_URL}/api/matches/create`,
    BY_ID: (id) => `${API_BASE_URL}/api/matches/${id}`,
    USER_HISTORY: `${API_BASE_URL}/api/matches/user`,
    MOVE_HISTORY: (id) => `${API_BASE_URL}/api/matches/${id}/history`,
    MOVE: (id) => `${API_BASE_URL}/api/matches/${id}/move`,
    RESIGN: (id) => `${API_BASE_URL}/api/matches/${id}/resign`,
    DRAW: (id) => `${API_BASE_URL}/api/matches/${id}/draw`,
    DRAW_ACCEPT: (id) => `${API_BASE_URL}/api/matches/${id}/draw/accept`,
    DRAW_DECLINE: (id) => `${API_BASE_URL}/api/matches/${id}/draw/decline`,
  },
  MATCHMAKING: {
    JOIN: `${API_BASE_URL}/api/matchmaking/join`,
    LEAVE: `${API_BASE_URL}/api/matchmaking/leave`,
  },
  WEBSOCKET: {
    ENDPOINT: import.meta.env.VITE_WS_ENDPOINT || 'ws://localhost:8080/ws-indichess',
  },
};

export default API_BASE_URL;
