import bcrypt from 'bcrypt';
import { encrypt, decrypt } from '../../../shared/utils/crypto';
import {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  deactivateUser,
} from '../models/user.model';
import { generateTokenPair, rotateRefreshToken, revokeTokensForUser } from './token.service';
import type { RegisterInput, LoginInput, UpdateProfileInput } from '../validators/auth.validator';
import type { Gender, EmploymentStatus, IncomeRange } from '../generated/prisma/client.js';

const SALT_ROUNDS = 12;

export async function register(input: RegisterInput) {
  const existing = await findUserByEmail(input.email);
  if (existing) throw Object.assign(new Error('Email already registered'), { status: 409 });

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const encKey = process.env.ENCRYPTION_KEY!;
  const lastNameEnc = encrypt(input.lastName, encKey);

  const user = await createUser({
    email: input.email,
    passwordHash,
    firstName: input.firstName,
    lastNameEnc,
    age: input.age,
    gender: input.gender as Gender,
    occupation: input.occupation,
    employmentStatus: input.employmentStatus as EmploymentStatus | undefined,
    incomeRange: input.incomeRange as IncomeRange | undefined,
  });

  const tokens = await generateTokenPair(user.id, user.email);

  return {
    user: sanitizeUser(user, encKey),
    ...tokens,
  };
}

export async function login(input: LoginInput) {
  const user = await findUserByEmail(input.email);
  if (!user || !user.isActive) {
    throw Object.assign(new Error('Invalid email or password'), { status: 401 });
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw Object.assign(new Error('Invalid email or password'), { status: 401 });
  }

  await updateUser(user.id, { lastLoginAt: new Date() });
  const tokens = await generateTokenPair(user.id, user.email);
  const encKey = process.env.ENCRYPTION_KEY!;

  return {
    user: sanitizeUser(user, encKey),
    ...tokens,
  };
}

export async function refresh(refreshToken: string) {
  return rotateRefreshToken(refreshToken);
}

export async function getProfile(userId: string) {
  const user = await findUserById(userId);
  if (!user || !user.isActive) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }
  const encKey = process.env.ENCRYPTION_KEY!;
  return sanitizeUser(user, encKey);
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const encKey = process.env.ENCRYPTION_KEY!;
  const data: Record<string, unknown> = {};

  if (input.firstName !== undefined) data.firstName = input.firstName;
  if (input.lastName !== undefined) data.lastNameEnc = encrypt(input.lastName, encKey);
  if (input.age !== undefined) data.age = input.age;
  if (input.gender !== undefined) data.gender = input.gender;
  if (input.occupation !== undefined) data.occupation = input.occupation;
  if (input.employmentStatus !== undefined) data.employmentStatus = input.employmentStatus;
  if (input.incomeRange !== undefined) data.incomeRange = input.incomeRange;

  const user = await updateUser(userId, data as any);
  return sanitizeUser(user, encKey);
}

export async function logout(userId: string) {
  await revokeTokensForUser(userId);
}

export async function deleteAccount(userId: string) {
  await revokeTokensForUser(userId);
  await deactivateUser(userId);
}

function sanitizeUser(user: any, encKey: string) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: decrypt(user.lastNameEnc, encKey),
    age: user.age,
    gender: user.gender,
    occupation: user.occupation,
    employmentStatus: user.employmentStatus,
    incomeRange: user.incomeRange,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
