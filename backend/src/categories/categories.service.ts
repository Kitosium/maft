import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type {
  Application,
  Category,
  Prisma,
  RelatedFormula,
} from "@prisma/client";

export type CategoryDetail = Category & {
  related: RelatedFormula[];
  applications: Application[];
};

export type CategoryNode = Category & {
  count: number;
  children: CategoryNode[];
};

export type CategoryInput = {
  slug?: string;
  name?: string;
  icon?: string;
  color?: string;
  description?: string;
  order?: number;
  parentId?: string | null;
  related?: string[];
  applications?: string[];
};

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async tree(): Promise<CategoryNode[]> {
    const cats = await this.prisma.category.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      include: {
        _count: { select: { formulas: { where: { published: true } } } },
      },
    });
    const nodes: CategoryNode[] = cats.map((c) => ({
      ...c,
      count: c._count.formulas,
      children: [],
    }));
    const byId = new Map(nodes.map((n) => [n.id, n]));
    const roots: CategoryNode[] = [];
    for (const n of nodes) {
      const parent = n.parentId ? byId.get(n.parentId) : undefined;
      if (parent) parent.children.push(n);
      else roots.push(n);
    }
    const roll = (n: CategoryNode): number => {
      n.count += n.children.reduce((s, c) => s + roll(c), 0);
      return n.count;
    };
    roots.forEach(roll);
    return roots;
  }

  async bySlug(slug: string): Promise<CategoryDetail> {
    const c = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        related: { orderBy: { order: "asc" } },
        applications: { orderBy: { order: "asc" } },
      },
    });
    if (!c) throw new NotFoundException(`category ${slug}`);
    return c;
  }

  async create(input: CategoryInput): Promise<Category> {
    const name = input.name?.trim() ?? "";
    const slug = (input.slug ?? name)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    if (!name || !slug) throw new NotFoundException("thieu ten danh muc");
    return this.prisma.category.create({
      data: {
        name,
        slug,
        icon: input.icon ?? "M",
        color: input.color ?? "#89b4fa",
        description: input.description ?? "",
        order: input.order ?? 0,
        parentId: input.parentId ?? null,
      },
    });
  }

  async update(id: string, input: CategoryInput): Promise<Category> {
    await this.byId(id);
    const data: Prisma.CategoryUpdateInput = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.slug !== undefined) data.slug = input.slug;
    if (input.icon !== undefined) data.icon = input.icon;
    if (input.color !== undefined) data.color = input.color;
    if (input.description !== undefined) data.description = input.description;
    if (input.order !== undefined) data.order = input.order;
    if (input.parentId !== undefined) {
      data.parent = input.parentId
        ? { connect: { id: input.parentId } }
        : { disconnect: true };
    }
    if (input.related !== undefined) {
      data.related = {
        deleteMany: {},
        create: input.related.map((latex, i) => ({ latex, order: i })),
      };
    }
    if (input.applications !== undefined) {
      data.applications = {
        deleteMany: {},
        create: input.applications.map((title, i) => ({ title, order: i })),
      };
    }
    return this.prisma.category.update({ where: { id }, data });
  }

  async remove(id: string): Promise<{ ok: true }> {
    await this.byId(id);
    await this.prisma.category.delete({ where: { id } });
    return { ok: true };
  }

  private async byId(id: string): Promise<Category> {
    const c = await this.prisma.category.findUnique({ where: { id } });
    if (!c) throw new NotFoundException(`category ${id}`);
    return c;
  }
}
