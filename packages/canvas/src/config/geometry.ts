import type { Col, Fig, Pt, Sid, Tps } from "../types/glyph";

export const GW = 1000;
export const GH = 790;
export const PAD = 20;
export const HITR = 18;
export const GQMIN = 1e-3;

export const COL: Col = {
  ink: "#cdd6f4",
  lite: "#a6adc8",
  blu: "#89b4fa",
  red: "#f38ba8",
};

const FBK: Fig = { A: [5, 12], B: [0, 0], C: [14, 0] };
const CRS =
  /\\coordinate\s*\(([A-Za-z]+)\)\s*at\s*\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)/g;

const dst = (p: Pt, q: Pt): number => Math.hypot(q[0] - p[0], q[1] - p[1]);

const crs = (o: Pt, p: Pt, q: Pt): number =>
  (p[0] - o[0]) * (q[1] - o[1]) - (p[1] - o[1]) * (q[0] - o[0]);

const clmp = (v: number, lo: number, hi: number): number =>
  Math.max(lo, Math.min(hi, v));

const foo = (p: Pt, a: Pt, b: Pt): Pt => {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const l = dx * dx + dy * dy;
  if (l < GQMIN) return a;
  const t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l;
  return [a[0] + dx * t, a[1] + dy * t];
};

export const crdOf = (src: string): Fig => {
  const m: Record<string, Pt> = {};
  for (const r of src.matchAll(CRS)) m[r[1]] = [Number(r[2]), Number(r[3])];
  return {
    A: m.A ?? FBK.A,
    B: m.B ?? FBK.B,
    C: m.C ?? FBK.C,
  };
};

export const sidOf = (t: Tps): Sid => ({
  a: dst(t.B, t.C),
  b: dst(t.C, t.A),
  c: dst(t.A, t.B),
});

export const figOf = (f: Fig): Tps => {
  const { A, B, C } = f;
  const a = dst(B, C);
  const b = dst(C, A);
  const c = dst(A, B);
  const s = (a + b + c) / 2;
  const ar = Math.abs(crs(A, B, C)) / 2;
  const d = a + b + c;
  const I: Pt = [
    (a * A[0] + b * B[0] + c * C[0]) / d,
    (a * A[1] + b * B[1] + c * C[1]) / d,
  ];
  const r = ar / s;
  const D = foo(I, B, C);
  const M: Pt = [(B[0] + C[0]) / 2, (B[1] + C[1]) / 2];
  const u = (s - c) / b;
  const E: Pt = [C[0] + (A[0] - C[0]) * u, C[1] + (A[1] - C[1]) * u];
  const cb = (a * a + c * c - b * b) / (2 * a * c);
  const tb = Math.sqrt(Math.max(0, (1 - cb) / (1 + cb)));
  const q = (b * tb) / r;
  const K: Pt = [I[0] + (I[0] - E[0]) * q, I[1] + (I[1] - E[1]) * q];
  return { A, B, C, I, D, M, E, K };
};

const vld = (t: Tps): boolean => {
  const g = sidOf(t);
  const ar = Math.abs(crs(t.A, t.B, t.C)) / 2;
  const s = (g.a + g.b + g.c) / 2;
  return (
    g.a > GQMIN &&
    g.b > GQMIN &&
    g.c > GQMIN &&
    ar / s > GQMIN &&
    Number.isFinite(t.I[0]) &&
    Number.isFinite(t.K[0])
  );
};

export const mvOf = (
  t: Tps,
  key: keyof Fig,
  x: number,
  y: number,
  pad: number,
  w: number,
  h: number,
): Tps => {
  const f: Fig = { A: t.A, B: t.B, C: t.C };
  f[key] = [clmp(x, pad, w - pad), clmp(y, pad, h - pad)];
  const o = figOf(f);
  return vld(o) ? o : t;
};

const all = (t: Tps): Pt[] => [t.A, t.B, t.C, t.I, t.D, t.M, t.E, t.K];

const fit = (t: Tps, w: number, h: number, pad: number): Tps => {
  const ps = all(t);
  const xs = ps.map((p) => p[0]);
  const ys = ps.map((p) => p[1]);
  const x0 = Math.min(...xs);
  const x1 = Math.max(...xs);
  const y0 = Math.min(...ys);
  const y1 = Math.max(...ys);
  const k = Math.min(
    (w - 2 * pad) / Math.max(x1 - x0, GQMIN),
    (h - 2 * pad) / Math.max(y1 - y0, GQMIN),
  );
  const mv = (p: Pt): Pt => [pad + (p[0] - x0) * k, pad + (y1 - p[1]) * k];
  const [A, B, C, I, D, M, E, K] = ps.map(mv);
  return { A, B, C, I, D, M, E, K };
};

export const iniOf = (src: string, w: number, h: number, pad: number): Tps =>
  fit(figOf(crdOf(src)), w, h, pad);

export const hitOf = (t: Tps, x: number, y: number): keyof Fig | null => {
  const ks: (keyof Fig)[] = ["A", "B", "C"];
  let bs: number | null = null;
  let bk: keyof Fig | null = null;
  for (const k of ks) {
    const d = dst(t[k], [x, y]);
    if (d <= HITR && (bs === null || d < bs)) {
      bs = d;
      bk = k;
    }
  }
  return bk;
};
