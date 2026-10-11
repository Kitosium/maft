import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { Category, Formula, FormulaLine } from "@prisma/client";

export type FormulaInput = {
  categoryId?: string;
  title?: string;
  group?: string;
  lines?: string[];
  note?: string | null;
  condition?: string | null;
  example?: string | null;
  order?: number;
  published?: boolean;
};

export type FormulaDto = Formula & {
  lines: string[];
  category: Pick<Category, "slug" | "name" | "icon" | "color">;
};

type Row = Formula & {
  lines: FormulaLine[];
  category: Category;
};

const toDto = (r: Row): FormulaDto => ({
  id: r.id,
  categoryId: r.categoryId,
  title: r.title,
  group: r.group,
  note: r.note,
  condition: r.condition,
  example: r.example,
  order: r.order,
  published: r.published,
  createdAt: r.createdAt,
  updatedAt: r.updatedAt,
  lines: [...r.lines]
    .sort((a, b) => a.order - b.order)
    .map((l) => l.latex),
  category: {
    slug: r.category.slug,
    name: r.category.name,
    icon: r.category.icon,
    color: r.category.color,
  },
});

const include = {
  lines: { orderBy: { order: "asc" as const } },
  category: true,
};

@Injectable()
export class FormulasService {
  constructor(private readonly prisma: PrismaService) {}

  async list(opts: {
    category?: string;
    q?: string;
    group?: string;
    all?: boolean;
  }): Promise<FormulaDto[]> {
    const where: Record<string, unknown> = {};
    if (!opts.all) where.published = true;
    if (opts.category) where.category = { slug: opts.category };
    if (opts.group) where.group = opts.group;
    if (opts.q) {
      const q = opts.q;
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { note: { contains: q, mode: "insensitive" } },
        { lines: { some: { latex: { contains: q, mode: "insensitive" } } } },
        { category: { name: { contains: q, mode: "insensitive" } } },
      ];
    }
    const rows = await this.prisma.formula.findMany({
      where,
      include,
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
    return rows.map(toDto);
  }

  async byId(id: string, all = false): Promise<FormulaDto> {
    const row = await this.prisma.formula.findUnique({
      where: { id },
      include,
    });
    if (!row || (!all && !row.published)) throw new NotFoundException(id);
    return toDto(row);
  }

  async create(input: FormulaInput): Promise<FormulaDto> {
    const title = input.title?.trim() ?? "";
    const categoryId = input.categoryId ?? "";
    if (!title || !categoryId) throw new NotFoundException("thieu ten/cong thuc");
    const lines = input.lines ?? [];
    const row = await this.prisma.formula.create({
      data: {
        categoryId,
        title,
        group: input.group?.trim() || "Cơ bản",
        note: input.note ?? null,
        condition: input.condition ?? null,
        example: input.example ?? null,
        order: input.order ?? 0,
        published: input.published ?? true,
        lines: {
          create: lines.map((latex, i) => ({ latex, order: i })),
        },
      },
      include,
    });
    return toDto(row);
  }

  async update(id: string, input: FormulaInput): Promise<FormulaDto> {
    await this.byId(id, true);
    const data: Record<string, unknown> = {};
    if (input.categoryId !== undefined) data.categoryId = input.categoryId;
    if (input.title !== undefined) data.title = input.title;
    if (input.group !== undefined) data.group = input.group;
    if (input.note !== undefined) data.note = input.note;
    if (input.condition !== undefined) data.condition = input.condition;
    if (input.example !== undefined) data.example = input.example;
    if (input.order !== undefined) data.order = input.order;
    if (input.published !== undefined) data.published = input.published;
    if (input.lines !== undefined) {
      data.lines = {
        deleteMany: {},
        create: input.lines.map((latex, i) => ({ latex, order: i })),
      };
    }
    const row = await this.prisma.formula.update({
      where: { id },
      data,
      include,
    });
    return toDto(row);
  }

  async remove(id: string): Promise<{ ok: true }> {
    await this.byId(id, true);
    await this.prisma.formula.delete({ where: { id } });
    return { ok: true };
  }
}
