import jwt from "jsonwebtoken";
import prismaPkg from "@prisma/client";

const { sign } = jwt;
const { PrismaClient } = prismaPkg;

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8000";
const SECRET = process.env.JWT_SECRET ?? "maft-dev-secret";
const COOKIE = "maft_jwt";

let bad = 0;
const ok = (name, cond, extra = "") => {
  if (cond) console.log(`SMOKE_OK ${name}`);
  else {
    bad++;
    console.log(`SMOKE_BAD ${name} ${extra}`);
  }
};

const token = (u) =>
  sign({ sub: u.id, email: u.email, name: u.name, role: u.role }, SECRET, {
    expiresIn: "1h",
  });

const call = async (path, opts = {}) => {
  const init = {
    ...opts,
    headers: { "content-type": "application/json", ...(opts.headers ?? {}) },
  };
  let r = null;
  for (let i = 0; i < 2; i++) {
    try {
      const url = path === "/" ? `${BACKEND}/` : `${BACKEND}/api${path}`;
      r = await fetch(url, init);
      break;
    } catch (e) {
      if (i === 1) throw e;
    }
  }
  let body = null;
  try {
    body = await r.json();
  } catch {
    body = null;
  }
  return { status: r.status, body };
};

const USER = {
  id: "smoke-user-1",
  email: "smoke@example.com",
  name: "Smoke Tester",
  role: "USER",
};
const ADMIN = {
  id: "smoke-admin-1",
  email: "smoke-admin@example.com",
  name: "Smoke Admin",
  role: "ADMIN",
};
const asUser = { cookie: `${COOKIE}=${token(USER)}` };
const asAdmin = { cookie: `${COOKIE}=${token(ADMIN)}` };

const prisma = new PrismaClient();
const cleanup = async () => {
  await prisma.formula.deleteMany({ where: { title: "SMOKE formula" } });
  await prisma.category.deleteMany({ where: { slug: "smoke-test" } });
  await prisma.favorite.deleteMany({ where: { userId: USER.id } });
  await prisma.history.deleteMany({ where: { userId: USER.id } });
  await prisma.user.deleteMany({ where: { id: USER.id } });
};

const root = await call("/");
ok("root", root.status === 200 && root.body?.ok === true);

const hlth = await call("/health");
ok(
  "health",
  hlth.status === 200 &&
    (hlth.body?.status === "ok" || hlth.body?.status === "degraded") &&
    typeof hlth.body?.cpu?.usagePct === "number",
  JSON.stringify(hlth.body?.cpu),
);

const cats = await call("/categories");
const roots = Array.isArray(cats.body) ? cats.body : [];
const dai = roots.find((c) => c.slug === "dai-so");
ok("categories tree", roots.length === 10 && dai?.count === 14, `roots=${roots.length}`);
ok("count rollup", dai?.children?.find((c) => c.slug === "logarit")?.count === 14);

const list = await call("/formulas?category=logarit");
ok("formulas by category", list.status === 200 && list.body?.length === 14);

const search = await call("/formulas?q=" + encodeURIComponent("thap phan"));
ok("search", search.status === 200 && search.body?.length >= 1);

const catDetail = await call("/categories/logarit");
ok(
  "category detail strips",
  catDetail.body?.related?.length === 4 && catDetail.body?.applications?.length === 5,
);

ok("favorites anonymous 401", (await call("/favorites")).status === 401);
ok("create formula anonymous 401", (await call("/formulas", { method: "POST" })).status === 401);

await cleanup();
await prisma.user.upsert({
  where: { id: USER.id },
  update: {},
  create: {
    id: USER.id,
    email: USER.email,
    name: USER.name,
    role: "USER",
    googleId: "smoke-google-id",
  },
});

const firstId = list.body[0].id;
const fav1 = await call("/favorites", {
  method: "POST",
  headers: asUser,
  body: JSON.stringify({ formulaId: firstId }),
});
ok("favorite add", fav1.status === 201 && fav1.body?.favorited === true);
const favList = await call("/favorites", { headers: asUser });
ok("favorite list", favList.status === 200 && favList.body?.length === 1);
const fav2 = await call("/favorites", {
  method: "POST",
  headers: asUser,
  body: JSON.stringify({ formulaId: firstId }),
});
ok("favorite toggle off", fav2.body?.favorited === false);

const hist = await call("/history", {
  method: "POST",
  headers: asUser,
  body: JSON.stringify({ formulaId: firstId }),
});
ok("history record", hist.status === 201);
ok(
  "history list",
  (await call("/history", { headers: asUser })).body?.length === 1,
);

ok(
  "user cannot create formula",
  (await call("/formulas", { method: "POST", headers: asUser })).status === 403,
);

const loga = await call("/categories/logarit");
const categoryId = loga.body.id;
const made = await call("/formulas", {
  method: "POST",
  headers: asAdmin,
  body: JSON.stringify({
    categoryId,
    title: "SMOKE formula",
    group: "Basic",
    lines: ["\\log_a a = 1"],
    order: 99,
    published: true,
  }),
});
ok("admin creates formula", made.status === 201 && made.body.id, `status=${made.status}`);
ok(
  "list after create",
  (await call("/formulas?category=logarit")).body?.length === 15,
);
const patched = await call(`/formulas/${made.body.id}`, {
  method: "PATCH",
  headers: asAdmin,
  body: JSON.stringify({ title: "SMOKE formula (edited)", lines: ["\\log_a 1 = 0"] }),
});
ok(
  "admin updates formula",
  patched.status === 200 && patched.body.title === "SMOKE formula (edited)",
);
ok(
  "admin deletes formula",
  (await call(`/formulas/${made.body.id}`, { method: "DELETE", headers: asAdmin })).status === 200,
);
ok("list after delete", (await call("/formulas?category=logarit")).body?.length === 14);

const cat = await call("/categories", {
  method: "POST",
  headers: asAdmin,
  body: JSON.stringify({ slug: "smoke-test", name: "Smoke", icon: "S", color: "#a6e3a1" }),
});
ok("admin creates category", cat.status === 201 || cat.status === 200, `status=${cat.status}`);
const catPatch = await call(`/categories/${cat.body.id}`, {
  method: "PATCH",
  headers: asAdmin,
  body: JSON.stringify({
    name: "Smoke 2",
    related: ["\\log_a a = 1"],
    applications: ["Smoke app"],
  }),
});
ok("admin updates category", catPatch.status === 200 && catPatch.body.name === "Smoke 2");
ok(
  "admin deletes category",
  (await call(`/categories/${cat.body.id}`, { method: "DELETE", headers: asAdmin })).status === 200,
);

await cleanup();
await prisma.$disconnect();

console.log(bad === 0 ? "SMOKE_ALL_OK" : `SMOKE_BAD=${bad}`);
process.exit(bad === 0 ? 0 : 1);
