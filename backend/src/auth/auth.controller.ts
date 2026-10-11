import { Controller, Get, Post, Query, Req, Res } from "@nestjs/common";
import type { Response } from "express";
import { randomBytes } from "node:crypto";
import { AuthService } from "./auth.service";
import { googleAuthUrl, googleExchange } from "../utils/google";
import { JWT_COOKIE, JWT_MAX_AGE, signUser } from "../utils/jwt";
import { CurrentUser } from "../common/decorators/user.decorator";
import type { AuthedRequest, AuthUser } from "../common/types/auth.types";

const STATE_COOKIE = "maft_state";
const TEN_MIN = 10 * 60 * 1000;

const frontendUrl = (): string => process.env.FRONTEND_URL ?? "http://localhost:3000";

@Controller()
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Get("auth/google")
  google(@Res() res: Response): void {
    const state = randomBytes(16).toString("hex");
    res.cookie(STATE_COOKIE, state, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: TEN_MIN,
    });
    res.redirect(googleAuthUrl(state));
  }

  @Get("auth/callback")
  async callback(
    @Query("code") code: string | undefined,
    @Query("state") state: string | undefined,
    @Req() req: AuthedRequest,
    @Res() res: Response,
  ): Promise<void> {
    if (!code) {
      res.status(200).json({ name: "maft-api", ok: true });
      return;
    }
    const saved = req.cookies?.[STATE_COOKIE];
    if (!state || !saved || state !== saved) {
      res.redirect(`${frontendUrl()}/login?error=state`);
      return;
    }
    res.clearCookie(STATE_COOKIE);
    try {
      const profile = await googleExchange(code);
      const user = await this.auth.syncGoogle(profile);
      res.cookie(JWT_COOKIE, signUser(user), {
        httpOnly: true,
        sameSite: "lax",
        maxAge: JWT_MAX_AGE,
      });
      res.redirect(`${frontendUrl()}/?login=1`);
    } catch {
      res.redirect(`${frontendUrl()}/login?error=exchange`);
    }
  }

  @Get("auth/me")
  async me(@CurrentUser() user: AuthUser | null): Promise<AuthUser | null> {
    if (!user) return null;
    return this.auth.byId(user.id);
  }

  @Post("auth/logout")
  logout(@Res() res: Response): void {
    res.clearCookie(JWT_COOKIE);
    res.json({ ok: true });
  }
}
