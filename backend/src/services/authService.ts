import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { repo } from "../db/repositories";
import { RefreshTokenRecord, Role } from "../types/models";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";
const ACCESS_EXPIRES = "1h";
const REFRESH_EXPIRES_SECONDS = 7 * 24 * 60 * 60;

export const hashPassword = (password: string) => bcrypt.hash(password, 12);
export const comparePassword = (password: string, hash: string) => bcrypt.compare(password, hash);

export const signAccessToken = (userId: string, role: Role) =>
  jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: ACCESS_EXPIRES });

export const signRefreshToken = (userId: string, role: Role) =>
  jwt.sign({ userId, role, tokenType: "refresh" }, JWT_SECRET, { expiresIn: REFRESH_EXPIRES_SECONDS });

export const verifyToken = <T>(token: string): T => jwt.verify(token, JWT_SECRET) as T;

const sha256 = (value: string) => crypto.createHash("sha256").update(value).digest("hex");

export const persistRefreshToken = async (token: string, userId: string, role: Role): Promise<void> => {
  const records = await repo.refreshTokens.all();
  const record: RefreshTokenRecord = {
    id: uuid(),
    userId,
    role,
    tokenHash: sha256(token),
    expiresAt: new Date(Date.now() + REFRESH_EXPIRES_SECONDS * 1000).toISOString()
  };
  records.push(record);
  await repo.refreshTokens.save(records);
};

export const invalidateRefreshToken = async (token: string): Promise<void> => {
  const records = await repo.refreshTokens.all();
  const tokenHash = sha256(token);
  await repo.refreshTokens.save(records.filter((r) => r.tokenHash !== tokenHash));
};
