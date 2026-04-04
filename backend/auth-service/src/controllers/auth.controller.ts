import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { registerSchema, loginSchema, refreshSchema } from "../utils/validation";
import { createUser, emailExists, findUserByEmail, findUserById, toPublicUser } from "../models/user.model";
import { config } from "../utils/config";
import { User } from "../../../shared/types/index";
import { formatZodErrors } from "../utils/errors";
import { generateAccessToken, generateRefreshToken, verifyToken } from "../utils/jwt";

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

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ errors: formatZodErrors(parsed.error) });
      return;
    }

    const { email, password } = parsed.data;
    const user = findUserByEmail(email);

    // Generic error to avoid leaking whether email exists
    const invalidMsg = "Invalid email or password";

    if (!user) {
      res.status(401).json({ error: invalidMsg });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      res.status(401).json({ error: invalidMsg });
      return;
    }

    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.email);

    res.status(200).json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error instanceof Error ? error.message : error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    const parsed = refreshSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ errors: formatZodErrors(parsed.error) });
      return;
    }

    const { refreshToken } = parsed.data;

    let payload;
    try {
      payload = verifyToken(refreshToken);
    } catch {
      res.status(401).json({ error: "Invalid or expired refresh token" });
      return;
    }

    if (payload.type !== "refresh") {
      res.status(401).json({ error: "Invalid token type — expected refresh token" });
      return;
    }

    const user = findUserById(payload.sub);
    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    const accessToken = generateAccessToken(user.id, user.email);

    res.status(200).json({ accessToken });
  } catch (error) {
    console.error("Refresh error:", error instanceof Error ? error.message : error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function me(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = findUserById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json(toPublicUser(user));
  } catch (error) {
    console.error("Me error:", error instanceof Error ? error.message : error);
    res.status(500).json({ error: "Internal server error" });
  }
}
