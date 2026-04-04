import { encrypt, decrypt } from '../../shared/utils/crypto';
import {
  findOrCreateProfile,
  createFixed, updateFixed, deleteFixed, findFixedById,
  createVariable, updateVariable, deleteVariable, findVariableById,
} from '../models/finance.model';

const encKey = () => process.env.ENCRYPTION_KEY!;

function fixedToMonthly(amount: number, frequency: string): number {
  if (frequency === 'biweekly') return amount * (26 / 12);
  if (frequency === 'annual') return amount / 12;
  return amount;
}

/* ── Fixed Expenditure ── */

export async function addFixed(userId: string, input: {
  name: string; category: string; amount: number; frequency: string;
}) {
  const profile = await findOrCreateProfile(userId);
  const monthlyAmount = fixedToMonthly(input.amount, input.frequency);
  return createFixed(profile.id, {
    name: input.name,
    category: input.category as any,
    amountEnc: encrypt(input.amount.toString(), encKey()),
    frequency: input.frequency as any,
    monthlyAmount,
  });
}

export async function editFixed(id: string, userId: string, input: Record<string, any>) {
  const item = await findFixedById(id);
  if (!item) throw Object.assign(new Error('Fixed expenditure not found'), { status: 404 });

  const profile = await findOrCreateProfile(userId);
  if (item.profileId !== profile.id) throw Object.assign(new Error('Forbidden'), { status: 403 });

  const data: Record<string, any> = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.category !== undefined) data.category = input.category;
  if (input.frequency !== undefined) data.frequency = input.frequency;
  if (input.amount !== undefined) {
    data.amountEnc = encrypt(input.amount.toString(), encKey());
    data.monthlyAmount = fixedToMonthly(input.amount, input.frequency ?? item.frequency);
  }
  return updateFixed(id, data);
}

export async function removeFixed(id: string, userId: string) {
  const item = await findFixedById(id);
  if (!item) throw Object.assign(new Error('Fixed expenditure not found'), { status: 404 });

  const profile = await findOrCreateProfile(userId);
  if (item.profileId !== profile.id) throw Object.assign(new Error('Forbidden'), { status: 403 });

  return deleteFixed(id);
}

/* ── Variable Expenditure ── */

export async function addVariable(userId: string, input: {
  name: string; category: string; estimatedMonthly: number;
}) {
  const profile = await findOrCreateProfile(userId);
  return createVariable(profile.id, {
    name: input.name,
    category: input.category as any,
    estimatedMonthlyEnc: encrypt(input.estimatedMonthly.toString(), encKey()),
    estimatedMonthly: input.estimatedMonthly,
  });
}

export async function editVariable(id: string, userId: string, input: Record<string, any>) {
  const item = await findVariableById(id);
  if (!item) throw Object.assign(new Error('Variable expenditure not found'), { status: 404 });

  const profile = await findOrCreateProfile(userId);
  if (item.profileId !== profile.id) throw Object.assign(new Error('Forbidden'), { status: 403 });

  const data: Record<string, any> = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.category !== undefined) data.category = input.category;
  if (input.estimatedMonthly !== undefined) {
    data.estimatedMonthlyEnc = encrypt(input.estimatedMonthly.toString(), encKey());
    data.estimatedMonthly = input.estimatedMonthly;
  }
  return updateVariable(id, data);
}

export async function removeVariable(id: string, userId: string) {
  const item = await findVariableById(id);
  if (!item) throw Object.assign(new Error('Variable expenditure not found'), { status: 404 });

  const profile = await findOrCreateProfile(userId);
  if (item.profileId !== profile.id) throw Object.assign(new Error('Forbidden'), { status: 403 });

  return deleteVariable(id);
}

export function decryptFixedAmount(amountEnc: string): number {
  return parseFloat(decrypt(amountEnc, encKey()));
}

export function decryptVariableAmount(estimatedMonthlyEnc: string): number {
  return parseFloat(decrypt(estimatedMonthlyEnc, encKey()));
}
