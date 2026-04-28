import { NextFunction, Request, Response } from "express";
import { fail } from "../services/http";
import { verifyToken } from "../services/authService";
import { Role } from "../types/models";

interface Claims {
  userId: string;
  role: Role;
  iat: number;
  exp: number;
}

export const requireAuth = (roles?: Role[]) => (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return fail(res, "Unauthorized", 401);
  const token = header.slice(7);
  try {
    const claims = verifyToken<Claims>(token);
    if (roles && !roles.includes(claims.role)) return fail(res, "Forbidden", 403);
    req.auth = { userId: claims.userId, role: claims.role };
    next();
  } catch {
    return fail(res, "Invalid token", 401);
  }
};
