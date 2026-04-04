import { encrypt, decrypt } from '../../shared/utils/crypto';
import { findOrCreateProfile, createSavings, updateSavings, deleteSavings, findSavingsById } from '../models/finance.model';

const encKey = () => process.env.ENCRYPTION_KEY!;

export async function addSavings(userId: string, input: {
  type: string; description?: string; currentBalance: number; monthlySavings: number;
}) {
  const profile = await findOrCreateProfile(userId);
  return createSavings(profile.id, {
    type: input.type as any,
    description: input.description,
    currentBalanceEnc: encrypt(input.currentBalance.toString(), encKey()),
    currentBalance: input.currentBalance,
    monthlySavingsEnc: encrypt(input.monthlySavings.toString(), encKey()),
    monthlySavings: input.monthlySavings,
  });
}

export async function editSavings(id: string, userId: string, input: Record<string, any>) {
  const item = await findSavingsById(id);
  if (!item) throw Object.assign(new Error('Savings item not found'), { status: 404 });

  const profile = await findOrCreateProfile(userId);
  if (item.profileId !== profile.id) throw Object.assign(new Error('Forbidden'), { status: 403 });

  const data: Record<string, any> = {};
  if (input.type !== undefined) data.type = input.type;
  if (input.description !== undefined) data.description = input.description;
  if (input.currentBalance !== undefined) {
    data.currentBalanceEnc = encrypt(input.currentBalance.toString(), encKey());
    data.currentBalance = input.currentBalance;
  }
  if (input.monthlySavings !== undefined) {
    data.monthlySavingsEnc = encrypt(input.monthlySavings.toString(), encKey());
    data.monthlySavings = input.monthlySavings;
  }
  return updateSavings(id, data);
}

export async function removeSavings(id: string, userId: string) {
  const item = await findSavingsById(id);
  if (!item) throw Object.assign(new Error('Savings item not found'), { status: 404 });

  const profile = await findOrCreateProfile(userId);
  if (item.profileId !== profile.id) throw Object.assign(new Error('Forbidden'), { status: 403 });

  return deleteSavings(id);
}

export function decryptBalance(enc: string): number {
  return parseFloat(decrypt(enc, encKey()));
}
