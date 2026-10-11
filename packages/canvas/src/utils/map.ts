import type { Cnt, Mea, Mm, Ndx, Op } from "../types/glyph";

const nx = (m: Mea, i: number): number => {
  const l = m.ly;
  const sc = m.gs[i].sc;
  if (l.bw <= 0 || sc <= 0) return 0;
  const d = l.os[i] + l.rs[i].x + l.rs[i].w / 2 - l.bx;
  return (2 * d) / l.bw / sc - 1 / sc;
};

const dst = (a: Mea, b: Mea, p: Ndx): number =>
  Math.abs(nx(a, p.si) - nx(b, p.ti));

const nsp = (m: Mea): number[] => {
  const o: number[] = [];
  m.gs.forEach((g, i) => {
    if (g.ch !== " ") o.push(i);
  });
  return o;
};

const near = (a: Mea, b: Mea, s: number[], t: number): number => {
  let bi = -1;
  let bd = Infinity;
  for (const i of s) {
    const d = dst(a, b, { si: i, ti: t });
    if (d < bd) {
      bd = d;
      bi = i;
    }
  }
  return bi;
};

export const bldMap = (a: Mea, b: Mea): Mm => {
  const as = nsp(a);
  const bs = nsp(b);
  const ra = new Set(as);
  const rb = new Set(bs);
  const all: Ndx[] = [];
  for (const i of as)
    for (const j of bs)
      if (a.gs[i].ch === b.gs[j].ch)
        all.push({ si: i, ti: j });
  all.sort((p, q) => dst(a, b, p) - dst(a, b, q));
  const mv: Op[] = [];
  for (const p of all)
    if (ra.has(p.si) && rb.has(p.ti)) {
      ra.delete(p.si);
      rb.delete(p.ti);
      mv.push({ kd: "mv", si: p.si, ti: p.ti });
    }
  const sa = as.filter((i) => ra.has(i));
  const sb = bs.filter((j) => rb.has(j));
  const eq = sa.length === sb.length;
  const rest: Op[] = sa.map((i, n) => ({
    kd: eq ? "mo" : "vs",
    si: i,
    ti: eq ? sb[n] : i,
  }));
  const op = [...mv, ...rest].sort((p, q) => p.si - q.si);
  const bn = eq ? [] : sb.map((j) => ({ si: near(a, b, as, j), ti: j }));
  return { op, bn };
};

export const cntOf = (m: Mm): Cnt => ({ mv: m.op.length, bn: m.bn.length });
