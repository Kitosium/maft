import type { Request } from "express";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export type AuthedRequest = Request & {
  user?: AuthUser;
  cookies: Record<string, string | undefined>;
};
