import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const roots = [
  join(import.meta.dirname, "..", "backend", "src"),
  join(import.meta.dirname, "..", "frontend", "src"),
  join(import.meta.dirname, "..", "packages", "canvas", "src"),
  join(import.meta.dirname, "..", "scripts"),
];

let bad = 0;

const walk = (d) =>
  readdirSync(d).flatMap((f) => {
    const p = join(d, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const flag = (msg) => {
  console.log(msg);
  bad++;
};

for (const root of roots) {
  let files = [];
  try {
    files = walk(root);
  } catch {
    continue;
  }
  for (const p of files) {
    if (!/\.(ts|tsx|css|mjs)$/.test(p)) continue;
    const ls = readFileSync(p, "utf8").split("\n");
    if (ls.length > 300) flag(`FILE>300 ${p} ${ls.length}`);
    ls.forEach((l, i) => {
      if (l.length > 100) flag(`LINE>100 ${p}:${i + 1} (${l.length})`);
      if (/^\s*(\/\/|\/\*)/.test(l)) flag(`COMMENT ${p}:${i + 1}`);
      if (/\bany\b/.test(l) && !/\/\*/.test(l)) flag(`ANY ${p}:${i + 1}: ${l.trim()}`);
      if (/\t/.test(l)) flag(`TAB ${p}:${i + 1}`);
      if (/ +$/.test(l)) flag(`TRAIL-WS ${p}:${i + 1}`);
    });
    const base = p.split("/").pop();
    const validName = /^[A-Za-z0-9]+([.-][a-z0-9]+)*\.(ts|tsx)$/;
    if (/\.(ts|tsx)$/.test(base) && !validName.test(base)) {
      flag(`KEBAB ${p}`);
    }
  }
}

console.log(bad === 0 ? "AUDIT_OK" : `AUDIT_BAD=${bad}`);
process.exit(bad === 0 ? 0 : 1);
