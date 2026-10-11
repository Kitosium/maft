import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { Category, Formula, FormulaLine } from "@prisma/client";

type Row = Formula & { lines: FormulaLine[]; category: Category };

const include = {
  lines: { orderBy: { order: "asc" as const } },
  category: true,
};

const shape = (f: Row) => ({
  id: f.id,
  title: f.title,
  group: f.group,
  note: f.note,
  condition: f.condition,
  example: f.example,
  order: f.order,
  lines: [...f.lines]
    .sort((a, b) => a.order - b.order)
    .map((l) => l.latex),
  category: {
    slug: f.category.slug,
    name: f.category.name,
    icon: f.category.icon,
    color: f.category.color,
  },
});

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    const rows = await this.prisma.favorite.findMany({
      where: { userId },
      include: { formula: { include } },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((r) => ({ ...shape(r.formula), favoritedAt: r.createdAt }));
  }

  async toggle(userId: string, formulaId: string) {
    if (!formulaId) return { favorited: false };
    const key = { userId_formulaId: { userId, formulaId } };
    const found = await this.prisma.favorite.findUnique({ where: key });
    if (found) {
      await this.prisma.favorite.delete({ where: key });
      return { favorited: false };
    }
    await this.prisma.favorite.create({ data: { userId, formulaId } });
    return { favorited: true };
  }

  async remove(userId: string, formulaId: string): Promise<{ ok: true }> {
    await this.prisma.favorite.deleteMany({ where: { userId, formulaId } });
    return { ok: true };
  }
}
