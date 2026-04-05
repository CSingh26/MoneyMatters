import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getAccessToken, clearTokens, onSessionExpired } from '../api/client';
import * as authAPI from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check if we have a valid token and restore session
  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessToken();
        if (token) {
          const profile = await authAPI.getProfile();
          setUser(profile);
        }
      } catch {
        // Token expired or invalid — start fresh
        await clearTokens();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Listen for session expiry events from the API client
  useEffect(() => {
    return onSessionExpired(() => {
      setUser(null);
    });
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const userData = await authAPI.login({ email, password });
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async ({ email, password, firstName, lastName, age, gender }) => {
    const userData = await authAPI.register({ email, password, firstName, lastName, age, gender });
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    const profile = await authAPI.getProfile();
    setUser(profile);
    return profile;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
