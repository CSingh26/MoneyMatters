import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'synaxis_access_token';
const REFRESH_KEY = 'synaxis_refresh_token';

const AUTH_API = process.env.EXPO_PUBLIC_AUTH_API || 'http://localhost:3001';

// ─── Token Storage ───
// SecureStore works on native; fallback to in-memory for web
let memoryTokens = { access: null, refresh: null };

export async function getAccessToken() {
  if (Platform.OS === 'web') return memoryTokens.access;
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function getRefreshToken() {
  if (Platform.OS === 'web') return memoryTokens.refresh;
  return SecureStore.getItemAsync(REFRESH_KEY);
}

export async function setTokens(accessToken, refreshToken) {
  if (Platform.OS === 'web') {
    memoryTokens = { access: accessToken, refresh: refreshToken };
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_KEY, refreshToken);
}

export async function clearTokens() {
  if (Platform.OS === 'web') {
    memoryTokens = { access: null, refresh: null };
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
}

// ─── Token Refresh ───
let refreshPromise = null;

async function refreshAccessToken() {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token available');

  const res = await fetch(`${AUTH_API}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    await clearTokens();
    throw new Error('Session expired');
  }

  const json = await res.json();
  if (!json.success) {
    await clearTokens();
    throw new Error('Session expired');
  }

  await setTokens(json.data.accessToken, json.data.refreshToken);
  return json.data.accessToken;
}

// ─── Session Event Emitter ───
// AuthContext subscribes to this to force logout on session expiry
const sessionListeners = new Set();
export function onSessionExpired(fn) {
  sessionListeners.add(fn);
  return () => sessionListeners.delete(fn);
}
function emitSessionExpired() {
  sessionListeners.forEach(fn => fn());
}

// ─── Core Fetch Wrapper ───
// All API responses follow: { success: boolean, data?: T, message?: string, error?: string }

export async function apiFetch(baseUrl, path, options = {}) {
  const { auth = true, ...fetchOptions } = options;
  const url = `${baseUrl}${path}`;

  const headers = {
    ...fetchOptions.headers,
  };

  // Don't set Content-Type for FormData (let browser set multipart boundary)
  if (!(fetchOptions.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = await getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  let res;
  try {
    res = await fetch(url, { ...fetchOptions, headers });
  } catch (networkErr) {
    const err = new Error('Network error — check your connection');
    err.isNetworkError = true;
    throw err;
  }

  // Auto-refresh on 401
  if (res.status === 401 && auth) {
    try {
      // Deduplicate concurrent refresh attempts
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken();
      }
      const newToken = await refreshPromise;
      refreshPromise = null;

      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(url, { ...fetchOptions, headers });
    } catch {
      refreshPromise = null;
      emitSessionExpired();
      throw new Error('Session expired');
    }
  }

  const json = await res.json();

  if (!json.success) {
    const err = new Error(json.error || 'API request failed');
    err.status = res.status;
    throw err;
  }

  return json;
}

// ─── Health Check ───
export async function checkHealth(baseUrl) {
  try {
    const res = await fetch(`${baseUrl}/health`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}
