import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { verifyUser } from "../../utils/jwt";
import type { AuthedRequest, AuthUser } from "../types/auth.types";

const JWT_COOKIE_NAME = "maft_jwt";

const readToken = (req: AuthedRequest): string | null => {
  const cookie = req.cookies?.[JWT_COOKIE_NAME];
  if (typeof cookie === "string" && cookie.length > 0) return cookie;
  const auth = req.headers.authorization;
  if (typeof auth === "string" && auth.startsWith("Bearer ")) {
    return auth.slice(7);
  }
  return null;
};

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const token = readToken(req);
    const user: AuthUser | null = token ? verifyUser(token) : null;
    if (user) req.user = user;
    return true;
  }
}
