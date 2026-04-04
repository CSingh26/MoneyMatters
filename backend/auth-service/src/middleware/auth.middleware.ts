import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { TokenPayload } from "../../../shared/types/index";

// Extend Express Request to include authenticated user info
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Missing or invalid authorization header" });
      return;
    }

    const token = authHeader.slice(7);
    const payload = verifyToken(token);

    if (payload.type !== "access") {
      res.status(401).json({ error: "Invalid token type" });
      return;
    }

    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
