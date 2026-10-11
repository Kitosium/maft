import { STK } from "../config/symbol";
import type { Dt, Pt, Shp, Ssp } from "../types/glyph";

const hlf = STK / 2;
const KK = 0.5523;

export const cir = (x: number, y: number, r: number): Dt => ({ p: [x, y], r });

export const ovl = (x: number, y: number, ax: number, ay: number): Pt[] => {
  const k = ay * KK;
  const h = ax * KK;
  return [
    [x + ax, y],
    [x + ax, y + k],
    [x + h, y + ay],
    [x, y + ay],
    [x - h, y + ay],
    [x - ax, y + k],
    [x - ax, y],
    [x - ax, y - k],
    [x - h, y - ay],
    [x, y - ay],
    [x + h, y - ay],
    [x + ax, y - k],
    [x + ax, y],
  ];
};

export const shp = (s: Ssp): Shp => {
  const l = s.l ?? [];
  const c = s.c ?? [];
  const d = s.d ?? [];
  let x0 = Infinity;
  let x1 = -Infinity;
  let y0 = Infinity;
  let y1 = -Infinity;
  const add = (x: number, y: number, r: number): void => {
    if (x - r < x0) x0 = x - r;
    if (x + r > x1) x1 = x + r;
    if (y - r < y0) y0 = y - r;
    if (y + r > y1) y1 = y + r;
  };
  for (const p of l.flat()) add(p[0], p[1], hlf);
  for (const p of c.flat()) add(p[0], p[1], hlf);
  for (const t of d) add(t.p[0], t.p[1], t.r);
  const dx = s.g - x0;
  const mv = (p: Pt): Pt => [p[0] + dx, p[1]];
  return {
    l: l.map((p) => p.map(mv)),
    c: c.map((p) => p.map(mv)),
    d: d.map((t) => ({ p: mv(t.p), r: t.r })),
    bx: { x: s.g, y: y0, w: x1 - x0, h: y1 - y0 },
    ad: x1 - x0 + 2 * s.g,
  };
};
