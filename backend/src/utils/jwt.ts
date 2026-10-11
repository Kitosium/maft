import { sign, verify } from "jsonwebtoken";
import type { AuthUser } from "../common/types/auth.types";

const SECRET = (): string => process.env.JWT_SECRET ?? "maft-dev-secret";

const COOKIE = "maft_jwt";
const WEEK = 7 * 24 * 60 * 60 * 1000;

export const JWT_COOKIE = COOKIE;
export const JWT_MAX_AGE = WEEK;

export const signUser = (u: AuthUser): string =>
  sign({ sub: u.id, email: u.email, name: u.name, role: u.role }, SECRET(), {
    expiresIn: "7d",
  });

export const verifyUser = (token: string): AuthUser | null => {
  try {
    const p = verify(token, SECRET());
    if (typeof p !== "object" || p === null) return null;
    const { sub, email, name, role } = p;
    if (
      typeof sub !== "string" ||
      typeof email !== "string" ||
      typeof name !== "string" ||
      typeof role !== "string"
    ) {
      return null;
    }
    return { id: sub, email, name, role };
  } catch {
    return null;
  }
};
