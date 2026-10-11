import type { Pt, Tps } from "../types/glyph";

type Ms = (s: string) => { w: number; h: number };
type Rc = { x: number; y: number; w: number; h: number };
type Ds = {
  dx: number;
  dy: number;
  al: "left" | "center" | "right";
  bl: "top" | "middle" | "bottom";
};

const EDG = 6;
const PDL = 3;
const DOT = 6.5;
const RIN = [20, 24, 28, 34, 40];
const DIR: Pt[] = Array.from({ length: 16 }, (_, i) => {
  const a = (i * Math.PI) / 8 - Math.PI / 2;
  return [Math.cos(a), Math.sin(a)] as Pt;
});

export const LABK: (keyof Tps)[] = ["A", "B", "C", "I", "D", "E", "M", "K"];

const DFS: Record<string, Ds> = {
  A: { dx: 0, dy: -14, al: "center", bl: "bottom" },
  B: { dx: -10, dy: 14, al: "right", bl: "top" },
  C: { dx: 10, dy: 14, al: "left", bl: "top" },
  I: { dx: 10, dy: -10, al: "left", bl: "bottom" },
  D: { dx: 0, dy: 14, al: "center", bl: "top" },
  E: { dx: 10, dy: -10, al: "left", bl: "bottom" },
  M: { dx: 0, dy: 14, al: "center", bl: "top" },
  K: { dx: -10, dy: 0, al: "right", bl: "middle" },
};

const segs = (t: Tps): [Pt, Pt][] => [
  [t.A, t.B],
  [t.B, t.C],
  [t.C, t.A],
  [t.A, t.I],
  [t.I, t.C],
  [t.K, t.E],
  [t.I, t.D],
  [t.I, t.M],
  [t.D, t.K],
  [
    [t.D[0], t.D[1] - 6],
    [t.D[0] + 6, t.D[1] - 6],
  ],
  [
    [t.D[0] + 6, t.D[1] - 6],
    [t.D[0] + 6, t.D[1]],
  ],
];

const cl = (v: number, lo: number, hi: number): number =>
  Math.max(lo, Math.min(hi, v));

const inR = (p: Pt, r: Rc): boolean =>
  p[0] >= r.x && p[0] <= r.x + r.w && p[1] >= r.y && p[1] <= r.y + r.h;

const crs = (a: Pt, b: Pt, c: Pt): number =>
  (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);

const ss = (a: Pt, b: Pt, c: Pt, d: Pt): boolean =>
  crs(a, b, c) * crs(a, b, d) < 0 && crs(c, d, a) * crs(c, d, b) < 0;

const hs = (a: Pt, b: Pt, r: Rc): boolean => {
  if (inR(a, r) || inR(b, r)) return true;
  const p: Pt = [r.x, r.y];
  const q: Pt = [r.x + r.w, r.y];
  const s: Pt = [r.x + r.w, r.y + r.h];
  const u: Pt = [r.x, r.y + r.h];
  return ss(a, b, p, q) || ss(a, b, q, s) || ss(a, b, s, u) || ss(a, b, u, p);
};

const ov = (a: Rc, b: Rc): boolean =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

const near = (p: Pt, r: Rc): number => {
  const x = cl(p[0], r.x, r.x + r.w);
  const y = cl(p[1], r.y, r.y + r.h);
  return Math.hypot(p[0] - x, p[1] - y);
};

const ci = (c: Pt, rad: number, r: Rc): boolean => {
  if (near(c, r) > rad) return false;
  const cs: Pt[] = [
    [r.x, r.y],
    [r.x + r.w, r.y],
    [r.x + r.w, r.y + r.h],
    [r.x, r.y + r.h],
  ];
  const dm = Math.max(...cs.map((p) => Math.hypot(p[0] - c[0], p[1] - c[1])));
  return rad <= dm;
};

export const labPos = (
  t: Tps,
  w: number,
  h: number,
  ms: Ms,
): Record<string, Pt> => {
  const sg = segs(t);
  const rad = Math.hypot(t.I[0] - t.D[0], t.I[1] - t.D[1]);
  const dots: Pt[] = [t.A, t.B, t.C, t.I, t.D, t.M, t.E, t.K];
  const out: Record<string, Pt> = {};
  const box: Rc[] = [];
  for (const k of LABK) {
    const p = t[k];
    const m = ms(k);
    const d = DFS[k];
    const c0: Pt = [
      p[0] + d.dx + (d.al === "left" ? m.w / 2 : d.al === "right" ? -m.w / 2 : 0),
      p[1] + d.dy + (d.bl === "top" ? m.h / 2 : d.bl === "bottom" ? -m.h / 2 : 0),
    ];
    const a0 = (Math.atan2(c0[1] - p[1], c0[0] - p[0]) * 180) / Math.PI;
    const i0 = ((Math.round((a0 + 90) / 22.5) % 16) + 16) % 16;
    const cs: Pt[] = [c0];
    for (const r of RIN)
      for (let i = 0; i < 16; i++) {
        const v = DIR[(i0 + i) % 16];
        cs.push([p[0] + v[0] * r, p[1] + v[1] * r]);
      }
    let bp = Infinity;
    let bc = c0;
    for (const c of cs) {
      const q: Rc = {
        x: c[0] - m.w / 2,
        y: c[1] - m.h / 2,
        w: m.w,
        h: m.h,
      };
      const e: Rc = {
        x: q.x - PDL,
        y: q.y - PDL,
        w: q.w + 2 * PDL,
        h: q.h + 2 * PDL,
      };
      let ps = 0;
      if (q.x < EDG || q.y < EDG || q.x + q.w > w - EDG || q.y + q.h > h - EDG)
        ps += 100;
      for (const s of sg) if (hs(s[0], s[1], e)) ps += 10;
      if (ci(t.I, rad, e)) ps += 10;
      for (const b of box) if (ov(e, b)) ps += 25;
      for (const dt of dots) if (near(dt, e) < DOT) ps += 15;
      if (ps < bp) {
        bp = ps;
        bc = c;
        if (ps === 0) break;
      }
    }
    out[k] = bc;
    box.push({
      x: bc[0] - m.w / 2 - PDL,
      y: bc[1] - m.h / 2 - PDL,
      w: m.w + 2 * PDL,
      h: m.h + 2 * PDL,
    });
  }
  return out;
};
