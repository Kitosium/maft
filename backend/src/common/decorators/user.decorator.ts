import { createParamDecorator, ExecutionContext, SetMetadata } from "@nestjs/common";
import type { AuthUser } from "../types/auth.types";

export const ROLES_KEY = "maft_roles";

export const Roles = (...roles: string[]): ClassDecorator & MethodDecorator =>
  SetMetadata(ROLES_KEY, roles);

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser | null => {
    const req = ctx.switchToHttp().getRequest<{ user?: AuthUser }>();
    return req.user ?? null;
  },
);
