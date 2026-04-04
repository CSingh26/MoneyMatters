import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { registerSchema } from "../utils/validation";
import { createUser, emailExists, toPublicUser } from "../models/user.model";
import { config } from "../utils/config";
import { User } from "../../../shared/types/index";
import { formatZodErrors } from "../utils/errors";

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ errors: formatZodErrors(parsed.error) });
      return;
    }

    const { firstName, lastName, age, gender, email, password } = parsed.data;

    if (emailExists(email)) {
      res.status(409).json({ error: "An account with this email already exists" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, config.bcryptSaltRounds);
    const now = new Date().toISOString();

    const user: User = {
      id: uuidv4(),
      firstName,
      lastName,
      age,
      gender,
      email,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    };

    createUser(user);

    res.status(201).json(toPublicUser(user));
  } catch (error) {
    console.error("Registration error:", error instanceof Error ? error.message : error);
    res.status(500).json({ error: "Internal server error" });
  }
}
