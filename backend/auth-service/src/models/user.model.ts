import { User, UserPublic } from "../../../shared/types/index";

// In-memory store — swap this file for Prisma/PostgreSQL later
const users = new Map<string, User>();
const emailIndex = new Map<string, string>(); // email → userId for fast lookup

export function findUserById(id: string): User | undefined {
  return users.get(id);
}

export function findUserByEmail(email: string): User | undefined {
  const userId = emailIndex.get(email.toLowerCase());
  if (!userId) return undefined;
  return users.get(userId);
}

export function emailExists(email: string): boolean {
  return emailIndex.has(email.toLowerCase());
}

export function createUser(user: User): User {
  users.set(user.id, user);
  emailIndex.set(user.email.toLowerCase(), user.id);
  return user;
}

export function toPublicUser(user: User): UserPublic {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    age: user.age,
    gender: user.gender,
    email: user.email,
    createdAt: user.createdAt,
  };
}
