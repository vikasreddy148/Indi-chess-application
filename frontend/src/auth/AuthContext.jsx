import { createContext, useContext, useState, useEffect } from 'react';
import { getToken, setToken } from '../api/client.js';
import * as authApi from '../api/auth.js';
import * as userApi from '../api/user.js';
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

  const fetchProfile = async () => {
    const data = await fetch(API_ENDPOINTS.USER.PROFILE, {
      headers: { Authorization: `Bearer ${getToken()}` },
    }).then((res) => (res.ok ? res.json() : Promise.reject(new Error('Invalid token'))));
    setUser({
      userId: data.userId,
      username: data.username,
      email: data.email,
      pfpUrl: data.pfpUrl,
      country: data.country,
      rating: data.rating,
    });
    return data;
  };

  const login = async (usernameOrEmail, password) => {
    const data = await authApi.login({ usernameOrEmail, password });
    setUser({
      userId: data.userId,
      username: data.username,
      email: data.email,
    });
    await fetchProfile().catch(() => {});
    return data;
  };

  const register = async (username, email, password, country) => {
    const data = await authApi.register({ username, email, password, country });
    setUser({
      userId: data.userId,
      username: data.username,
      email: data.email,
    });
    await fetchProfile().catch(() => {});
    return data;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const updateProfile = async (updates) => {
    const data = await userApi.updateProfile(updates);
    setUser({
      userId: data.userId,
      username: data.username,
      email: data.email,
      pfpUrl: data.pfpUrl,
      country: data.country,
      rating: data.rating,
    });
    return data;
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    fetchProfile,
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
