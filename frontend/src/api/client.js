const TOKEN_KEY = 'indichess_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function refreshToken() {
  const token = getToken();
  if (!token) return null;
  const { API_ENDPOINTS } = await import('../config/api.js');
  const res = await fetch(API_ENDPOINTS.AUTH.REFRESH, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (data?.token) {
    setToken(data.token);
    return data.token;
  }
  return null;
}

/**
 * Authenticated fetch: adds Bearer token, on 401 tries refresh once and retries.
 */
export async function apiRequest(url, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  let res = await fetch(url, { ...options, headers });
  if (res.status === 401 && !options._retried) {
    const newToken = await refreshToken();
    if (newToken) {
      const retryHeaders = { ...headers, Authorization: `Bearer ${newToken}` };
      res = await fetch(url, { ...options, headers: retryHeaders, _retried: true });
    }
    if (res.status === 401) {
      setToken(null);
      throw new Error('Unauthorized');
    }
  } else if (res.status === 401) {
    setToken(null);
    throw new Error('Unauthorized');
  }
  return res;
}

export async function apiJson(url, options = {}) {
  const res = await apiRequest(url, options);
  const text = await res.text();
  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = text ? JSON.parse(text) : {};
      message = data.message || data.error || message;
    } catch (_) {}
    throw new Error(message);
  }
  return text ? JSON.parse(text) : null;
}

export default { getToken, setToken, apiRequest, apiJson };
