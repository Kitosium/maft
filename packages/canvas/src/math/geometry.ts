import { FS } from "../config/animation";
import { EQL, ROWG } from "../config/tex";
import type { Aln, Geo, Gly, Lay, Pose } from "../types/glyph";

export const rowY = (ls: Lay[]): number[] => {
  const ys: number[] = [];
  let b = 0;
  ls.forEach((l, i) => {
    if (i > 0) b += ls[i - 1].yb + ROWG * FS - l.yt;
    ys.push(b);
  });
  return ys;
};

export const eqOf = (gs: Gly[], l: Lay): number | null => {
  const i = gs.findIndex((g) => g.ch === EQL);
  return i < 0 ? null : l.os[i] + l.rs[i].x + l.rs[i].w / 2;
};

export const geoOf = (
  ls: Lay[],
  fs: number,
  pad: number,
  w: number,
  eqs?: (number | null)[],
): Geo => {
  const ys = rowY(ls);
  let bw = 0;
  let top = 0;
  let bot = 0;
  ls.forEach((l, i) => {
    bw = Math.max(bw, l.bw);
    top = Math.min(top, ys[i] + l.yt);
    bot = Math.max(bot, ys[i] + l.yb);
  });
  let lp = 0;
  let span = bw;
  if (eqs) {
    let rp = 0;
    for (let i = 0; i < ls.length; i++) {
      const e = eqs[i] ?? ls[i].bx;
      lp = Math.max(lp, e - ls[i].bx);
      rp = Math.max(rp, ls[i].bx + ls[i].bw - e);
    }
    span = lp + rp;
  }
  const k = Math.min(fs / FS, span > 0 && w > 2 * pad ? (w - 2 * pad) / span : Infinity);
  const by = ys.map((y) => pad + (y - top) * k);
  const g: Geo = { k, by, h: 2 * pad + (bot - top) * k };
  if (eqs) g.eqx = pad + lp * k;
  return g;
};

export const wldPos = (
  g: Gly[],
  l: Lay,
  k: number,
  by: number,
  pad: number,
  w: number,
  aln?: Aln,
  eq?: number | null,
  eqx?: number,
): Pose[] => {
  let ox: number;
  if (aln === "lft") ox = pad - l.bx * k;
  else if (aln === "rgt") ox = w - pad - (l.bx + l.bw) * k;
  else if (aln === "eq") ox = (eqx ?? pad) - (eq ?? l.bx) * k;
  else ox = pad + (w - 2 * pad - l.bw * k) / 2 - l.bx * k;
  return l.os.map((o, i) => {
    const r = l.rs[i];
    return {
      x: ox + (o + r.x + r.w / 2) * k,
      y: by + (l.ys[i] + r.y + r.h / 2) * k,
      s: k * g[i].sc,
      sx: g[i].sx,
    };
  });
};
