import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { AuthUser } from "../common/types/auth.types";
import type { GoogleProfile } from "../utils/google";

const adminEmails = (): string[] =>
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 0);

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  roleFor(email: string): string {
    return adminEmails().includes(email.toLowerCase()) ? "ADMIN" : "USER";
  }

  async syncGoogle(p: GoogleProfile): Promise<AuthUser> {
    const role = this.roleFor(p.email);
    const data = { email: p.email, name: p.name, avatar: p.picture ?? null, role };
    const user = await this.prisma.user.upsert({
      where: { googleId: p.sub },
      update: data,
      create: { googleId: p.sub, ...data },
    });
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }

  async byId(id: string): Promise<AuthUser | null> {
    const u = await this.prisma.user.findUnique({ where: { id } });
    if (!u) return null;
    return { id: u.id, email: u.email, name: u.name, role: u.role };
  }
}
