import { apiFetch } from './client';

const BASE = process.env.EXPO_PUBLIC_FINANCE_API || 'http://localhost:3002';

// ─── Income ───
export async function listIncome() {
  const json = await apiFetch(BASE, '/api/finance/income');
  return json.data;
}

export async function addIncome(data) {
  const json = await apiFetch(BASE, '/api/finance/income', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return json.data;
}

export async function updateIncome(id, data) {
  const json = await apiFetch(BASE, `/api/finance/income/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return json.data;
}

export async function deleteIncome(id) {
  await apiFetch(BASE, `/api/finance/income/${id}`, { method: 'DELETE' });
}

// ─── Fixed Expenditure ───
export async function listFixedExpenses() {
  const json = await apiFetch(BASE, '/api/finance/expenditure/fixed');
  return json.data;
}

export async function addFixedExpense(data) {
  const json = await apiFetch(BASE, '/api/finance/expenditure/fixed', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return json.data;
}

export async function updateFixedExpense(id, data) {
  const json = await apiFetch(BASE, `/api/finance/expenditure/fixed/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return json.data;
}

export async function deleteFixedExpense(id) {
  await apiFetch(BASE, `/api/finance/expenditure/fixed/${id}`, { method: 'DELETE' });
}

// ─── Variable Expenditure ───
export async function listVariableExpenses() {
  const json = await apiFetch(BASE, '/api/finance/expenditure/variable');
  return json.data;
}

export async function addVariableExpense(data) {
  const json = await apiFetch(BASE, '/api/finance/expenditure/variable', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return json.data;
}

export async function updateVariableExpense(id, data) {
  const json = await apiFetch(BASE, `/api/finance/expenditure/variable/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return json.data;
}

export async function deleteVariableExpense(id) {
  await apiFetch(BASE, `/api/finance/expenditure/variable/${id}`, { method: 'DELETE' });
}

// ─── Savings ───
export async function listSavings() {
  const json = await apiFetch(BASE, '/api/finance/savings');
  return json.data;
}

export async function addSavings(data) {
  const json = await apiFetch(BASE, '/api/finance/savings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return json.data;
}

export async function updateSavings(id, data) {
  const json = await apiFetch(BASE, `/api/finance/savings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return json.data;
}

export async function deleteSavings(id) {
  await apiFetch(BASE, `/api/finance/savings/${id}`, { method: 'DELETE' });
}

// ─── Goals ───
export async function listGoals() {
  const json = await apiFetch(BASE, '/api/finance/goals');
  return json.data;
}

export async function addGoal(data) {
  const json = await apiFetch(BASE, '/api/finance/goals', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return json.data;
}

export async function updateGoal(id, data) {
  const json = await apiFetch(BASE, `/api/finance/goals/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return json.data;
}

export async function deleteGoal(id) {
  await apiFetch(BASE, `/api/finance/goals/${id}`, { method: 'DELETE' });
}

// ─── Summary ───
export async function getFinanceSummary() {
  const json = await apiFetch(BASE, '/api/finance/summary');
  return json.data;
}
