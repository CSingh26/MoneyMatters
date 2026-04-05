import { apiFetch } from './client';

const BASE = process.env.EXPO_PUBLIC_POLICY_API || 'http://localhost:3003';

export async function uploadPolicy(file, type, renewalDate) {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name || 'policy.pdf',
    type: file.mimeType || 'application/pdf',
  });
  formData.append('type', type);
  if (renewalDate) formData.append('renewalDate', renewalDate);

  const json = await apiFetch(BASE, '/api/policies/', {
    method: 'POST',
    body: formData,
  });
  return json.data;
}

export async function listPolicies(params = {}) {
  const query = new URLSearchParams(params).toString();
  const path = query ? `/api/policies/?${query}` : '/api/policies/';
  const json = await apiFetch(BASE, path);
  return json.data;
}

export async function getPolicy(id) {
  const json = await apiFetch(BASE, `/api/policies/${id}`);
  return json.data;
}

export async function deletePolicy(id) {
  await apiFetch(BASE, `/api/policies/${id}`, { method: 'DELETE' });
}

export async function runWatchdog() {
  const json = await apiFetch(BASE, '/api/policies/watchdog', { method: 'POST' });
  return json.data;
}

export async function runScenario(query) {
  const json = await apiFetch(BASE, '/api/policies/scenario', {
    method: 'POST',
    body: JSON.stringify({ query }),
  });
  return json.data;
}

export async function listScenarios() {
  const json = await apiFetch(BASE, '/api/policies/scenarios');
  return json.data;
}

export async function getScenario(id) {
  const json = await apiFetch(BASE, `/api/policies/scenario/${id}`);
  return json.data;
}
