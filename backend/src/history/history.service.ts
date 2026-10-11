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
export class HistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    const rows = await this.prisma.history.findMany({
      where: { userId },
      include: { formula: { include } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    const seen = new Set<string>();
    const out: (ReturnType<typeof shape> & { viewedAt: Date })[] = [];
    for (const r of rows) {
      if (seen.has(r.formulaId)) continue;
      seen.add(r.formulaId);
      out.push({ ...shape(r.formula), viewedAt: r.createdAt });
    }
    return out;
  }

  async record(userId: string, formulaId: string): Promise<{ ok: true }> {
    if (!formulaId) return { ok: true };
    const formula = await this.prisma.formula.findUnique({
      where: { id: formulaId },
    });
    if (!formula) return { ok: true };
    await this.prisma.$transaction([
      this.prisma.history.deleteMany({ where: { userId, formulaId } }),
      this.prisma.history.create({ data: { userId, formulaId } }),
    ]);
    return { ok: true };
  }
}
