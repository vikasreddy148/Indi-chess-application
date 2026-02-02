import { API_ENDPOINTS } from '../config/api.js';
import { apiJson, setToken } from './client.js';

export async function register({ username, email, password, country }) {
  const data = await apiJson(API_ENDPOINTS.AUTH.REGISTER, {
    method: 'POST',
    body: JSON.stringify({ username, email, password, country: country || null }),
  });
  if (data?.token) {
    setToken(data.token);
  }
  return data;
}

export async function login({ usernameOrEmail, password }) {
  const data = await apiJson(API_ENDPOINTS.AUTH.LOGIN, {
    method: 'POST',
    body: JSON.stringify({ usernameOrEmail, password }),
  });
  if (data?.token) {
    setToken(data.token);
  }
  return data;
}

export async function logout() {
  try {
    await apiJson(API_ENDPOINTS.AUTH.LOGOUT, { method: 'POST' });
  } finally {
    setToken(null);
  }
}

export default { register, login, logout };
