import { PrismaClient } from "@prisma/client";
import { CATS, LOGA } from "./dataset.mjs";

const prisma = new PrismaClient();

const upsertCat = async (c, parentId = null) => {
  const data = {
    name: c.name,
    icon: c.icon,
    color: c.color,
    description: c.description ?? "",
    order: c.order,
    parentId,
  };
  return prisma.category.upsert({
    where: { slug: c.slug },
    update: data,
    create: { slug: c.slug, ...data },
  });
};

const clearFormulas = async (categoryId) => {
  await prisma.formula.deleteMany({ where: { categoryId } });
  await prisma.relatedFormula.deleteMany({ where: { categoryId } });
  await prisma.application.deleteMany({ where: { categoryId } });
};

const seedLoga = async (cat) => {
  await clearFormulas(cat.id);
  for (const f of LOGA.formulas) {
    const formula = await prisma.formula.create({
      data: {
        categoryId: cat.id,
        title: f.title,
        group: f.group,
        note: f.note ?? null,
        condition: f.condition ?? null,
        example: f.example ?? null,
        order: f.order,
        published: true,
      },
    });
    for (let i = 0; i < f.lines.length; i++) {
      await prisma.formulaLine.create({
        data: { formulaId: formula.id, latex: f.lines[i], order: i },
      });
    }
  }
  for (let i = 0; i < LOGA.related.length; i++) {
    await prisma.relatedFormula.create({
      data: { categoryId: cat.id, latex: LOGA.related[i], order: i },
    });
  }
  for (let i = 0; i < LOGA.applications.length; i++) {
    await prisma.application.create({
      data: { categoryId: cat.id, title: LOGA.applications[i], order: i },
    });
  }
  console.log(`seeded ${LOGA.formulas.length} formulas -> ${cat.slug}`);
};

const main = async () => {
  for (const c of CATS) {
    const parent = await upsertCat(c);
    for (const ch of c.children) await upsertCat(ch, parent.id);
  }
  const valid = new Set(
    CATS.flatMap((c) => [c.slug, ...c.children.map((ch) => ch.slug)]),
  );
  const stale = await prisma.category.findMany({
    where: { slug: { notIn: [...valid] } },
  });
  for (const c of stale) await prisma.category.delete({ where: { id: c.id } });

  const loga = await prisma.category.findUnique({ where: { slug: LOGA.slug } });
  await seedLoga(loga);
  const total = await prisma.category.count();
  const fml = await prisma.formula.count();
  console.log(`DONE categories=${total} formulas=${fml}`);
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
