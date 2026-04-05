import { encrypt, decrypt } from '../../../shared/utils/crypto';
import { findOrCreateProfile, createAsset, updateAsset, deleteAsset, findAssetById } from '../models/finance.model';

const encKey = () => process.env.ENCRYPTION_KEY!;

export async function addAsset(userId: string, input: {
  name: string; type: string; estimatedValue: number;
  purchaseDate?: string; description?: string;
}) {
  const profile = await findOrCreateProfile(userId);
  return createAsset(profile.id, {
    name: input.name,
    type: input.type as any,
    estimatedValueEnc: encrypt(input.estimatedValue.toString(), encKey()),
    estimatedValue: input.estimatedValue,
    purchaseDate: input.purchaseDate ? new Date(input.purchaseDate) : null,
    description: input.description,
  });
}

export async function editAsset(id: string, userId: string, input: Record<string, any>) {
  const item = await findAssetById(id);
  if (!item) throw Object.assign(new Error('Asset not found'), { status: 404 });

  const profile = await findOrCreateProfile(userId);
  if (item.profileId !== profile.id) throw Object.assign(new Error('Forbidden'), { status: 403 });

  const data: Record<string, any> = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.type !== undefined) data.type = input.type;
  if (input.description !== undefined) data.description = input.description;
  if (input.purchaseDate !== undefined) data.purchaseDate = input.purchaseDate ? new Date(input.purchaseDate) : null;
  if (input.estimatedValue !== undefined) {
    data.estimatedValueEnc = encrypt(input.estimatedValue.toString(), encKey());
    data.estimatedValue = input.estimatedValue;
  }
  return updateAsset(id, data);
}

export async function removeAsset(id: string, userId: string) {
  const item = await findAssetById(id);
  if (!item) throw Object.assign(new Error('Asset not found'), { status: 404 });

  const profile = await findOrCreateProfile(userId);
  if (item.profileId !== profile.id) throw Object.assign(new Error('Forbidden'), { status: 403 });

  return deleteAsset(id);
}
