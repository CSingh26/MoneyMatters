import { apiFetch, setTokens, clearTokens } from './client';

const BASE = process.env.EXPO_PUBLIC_AUTH_API || 'http://localhost:3001';

export async function register({ email, password, confirmPassword, firstName, lastName, age, gender, occupation, employmentStatus, incomeRange }) {
  const json = await apiFetch(BASE, '/api/auth/register', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ email, password, confirmPassword, firstName, lastName, age, gender, occupation, employmentStatus, incomeRange }),
  });
  await setTokens(json.data.accessToken, json.data.refreshToken);
  return json.data.user;
}

export async function login({ email, password }) {
  const json = await apiFetch(BASE, '/api/auth/login', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ email, password }),
  });
  await setTokens(json.data.accessToken, json.data.refreshToken);
  return json.data.user;
}

export async function getProfile() {
  const json = await apiFetch(BASE, '/api/auth/profile');
  return json.data;
}

export async function updateProfile(data) {
  const json = await apiFetch(BASE, '/api/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return json.data;
}

export async function logout() {
  try {
    await apiFetch(BASE, '/api/auth/logout', { method: 'POST' });
  } finally {
    await clearTokens();
  }
}

export async function deleteAccount() {
  try {
    await apiFetch(BASE, '/api/auth/account', { method: 'DELETE' });
  } finally {
    await clearTokens();
  }
}
