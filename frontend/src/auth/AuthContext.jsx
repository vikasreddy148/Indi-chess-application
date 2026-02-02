import { createContext, useContext, useState, useEffect } from 'react';
import { getToken, setToken } from '../api/client.js';
import * as authApi from '../api/auth.js';
import { API_ENDPOINTS } from '../config/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    fetch(API_ENDPOINTS.USER.PROFILE, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Invalid token'))))
      .then((data) => {
        setUser({
          userId: data.userId,
          username: data.username,
          email: data.email,
          pfpUrl: data.pfpUrl,
          country: data.country,
          rating: data.rating,
        });
      })
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (usernameOrEmail, password) => {
    const data = await authApi.login({ usernameOrEmail, password });
    setUser({
      userId: data.userId,
      username: data.username,
      email: data.email,
    });
    return data;
  };

  const register = async (username, email, password, country) => {
    const data = await authApi.register({ username, email, password, country });
    setUser({
      userId: data.userId,
      username: data.username,
      email: data.email,
    });
    return data;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    token: getToken(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

export default AuthContext;
