import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { TokenPayload } from "../types/index";

// Extend Express Request to include authenticated user info
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Shared JWT verification middleware.
 * Verifies the access token from the Authorization header and attaches
 * the decoded payload to req.user.
 *
 * Usage: import { createAuthMiddleware } from "../../shared/middleware/auth";
 *        const authenticate = createAuthMiddleware(process.env.JWT_SECRET);
 *        router.get("/protected", authenticate, handler);
 */
export function createAuthMiddleware(jwtSecret: string) {
  return function authenticate(req: Request, res: Response, next: NextFunction): void {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Missing or invalid authorization header" });
        return;
      }

      const token = authHeader.slice(7);
      const payload = jwt.verify(token, jwtSecret) as TokenPayload;

      if (payload.type !== "access") {
        res.status(401).json({ error: "Invalid token type" });
        return;
      }

      req.user = payload;
      next();
    } catch {
      res.status(401).json({ error: "Invalid or expired token" });
    }
  };
}
