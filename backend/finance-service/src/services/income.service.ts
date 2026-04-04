import { encrypt, decrypt } from '../../shared/utils/crypto';
import { findOrCreateProfile, createIncome, updateIncome, deleteIncome, findIncomeById } from '../models/finance.model';

const encKey = () => process.env.ENCRYPTION_KEY!;

function toMonthly(amount: number, frequency: string): number {
  return frequency === 'biweekly' ? amount * (26 / 12) : amount;
}

export async function addIncome(userId: string, input: { name: string; amount: number; frequency: string }) {
  const profile = await findOrCreateProfile(userId);
  const monthlyAmount = toMonthly(input.amount, input.frequency);
  return createIncome(profile.id, {
    name: input.name,
    amountEnc: encrypt(input.amount.toString(), encKey()),
    frequency: input.frequency as any,
    monthlyAmount,
  });
}

export async function editIncome(id: string, userId: string, input: Record<string, any>) {
  const item = await findIncomeById(id);
  if (!item) throw Object.assign(new Error('Income item not found'), { status: 404 });

  const profile = await findOrCreateProfile(userId);
  if (item.profileId !== profile.id) throw Object.assign(new Error('Forbidden'), { status: 403 });

  const data: Record<string, any> = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.frequency !== undefined) data.frequency = input.frequency;
  if (input.amount !== undefined) {
    data.amountEnc = encrypt(input.amount.toString(), encKey());
    data.monthlyAmount = toMonthly(input.amount, input.frequency ?? item.frequency);
  }
  return updateIncome(id, data);
}

export async function removeIncome(id: string, userId: string) {
  const item = await findIncomeById(id);
  if (!item) throw Object.assign(new Error('Income item not found'), { status: 404 });

  const profile = await findOrCreateProfile(userId);
  if (item.profileId !== profile.id) throw Object.assign(new Error('Forbidden'), { status: 403 });

  return deleteIncome(id);
}

export function decryptIncomeAmount(amountEnc: string): number {
  return parseFloat(decrypt(amountEnc, encKey()));
}
