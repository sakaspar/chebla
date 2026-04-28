import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { repo } from "../db/repositories";
import { comparePassword, hashPassword, invalidateRefreshToken, persistRefreshToken, signAccessToken, signRefreshToken } from "../services/authService";
import { fail, ok } from "../services/http";

export const register = async (req: Request, res: Response) => {
  const { name, email, password, phone, company } = req.body as Record<string, string>;
  if (!name || !email || !password) return fail(res, "Missing required fields");
  const clients = await repo.clients.all();
  if (clients.some((c) => c.email === email)) return fail(res, "Email already exists");
  const created = {
    id: uuid(),
    name,
    email,
    passwordHash: await hashPassword(password),
    phone,
    company,
    createdAt: new Date().toISOString()
  };
  clients.push(created);
  await repo.clients.save(clients);
  return ok(res, { id: created.id, email: created.email }, 201);
};

export const login = async (req: Request, res: Response, admin = false) => {
  const { email, password } = req.body as Record<string, string>;
  if (!email || !password) return fail(res, "Missing credentials");
  if (admin) {
    const admins = await repo.admin.all();
    const user = admins.find((a) => a.email === email);
    if (!user || !(await comparePassword(password, user.passwordHash))) return fail(res, "Invalid credentials", 401);
    const accessToken = signAccessToken(user.id, "admin");
    const refreshToken = signRefreshToken(user.id, "admin");
    await persistRefreshToken(refreshToken, user.id, "admin");
    return ok(res, { accessToken, refreshToken, role: "admin" });
  }
  const clients = await repo.clients.all();
  const user = clients.find((c) => c.email === email);
  if (!user || !(await comparePassword(password, user.passwordHash))) return fail(res, "Invalid credentials", 401);
  const accessToken = signAccessToken(user.id, "client");
  const refreshToken = signRefreshToken(user.id, "client");
  await persistRefreshToken(refreshToken, user.id, "client");
  return ok(res, { accessToken, refreshToken, role: "client" });
};

export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (!refreshToken) return fail(res, "Refresh token required");
  await invalidateRefreshToken(refreshToken);
  return ok(res, { message: "Logged out" });
};
