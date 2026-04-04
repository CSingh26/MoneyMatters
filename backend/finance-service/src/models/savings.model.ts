import { SavingsEntry } from "../../../shared/types/index";

// In-memory store — swap for Prisma/PostgreSQL later
const savingsEntries = new Map<string, SavingsEntry[]>(); // userId → SavingsEntry[]

export function getSavingsByUserId(userId: string): SavingsEntry[] {
  return savingsEntries.get(userId) || [];
}

export function addSavingsEntry(entry: SavingsEntry): SavingsEntry {
  const existing = savingsEntries.get(entry.userId) || [];
  existing.push(entry);
  savingsEntries.set(entry.userId, existing);
  return entry;
}
