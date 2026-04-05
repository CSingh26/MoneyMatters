import { apiFetch } from './client';

const BASE = process.env.EXPO_PUBLIC_DASHBOARD_API || 'http://localhost:3005';

export async function getDashboard() {
  const json = await apiFetch(BASE, '/api/dashboard/');
  return json.data;
}
