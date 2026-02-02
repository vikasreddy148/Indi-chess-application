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

/**
 * Authenticated fetch: adds Bearer token and handles 401.
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
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
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
