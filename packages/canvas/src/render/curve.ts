import {
  AL_SHD,
  BIT,
  BRK,
  BSC,
  CLW,
  EXT,
  MSC,
  PXS,
  PLN,
  PSZ,
  SMN,
  SMX,
  TMRX,
  UNT,
} from "../config/animation";
import type { Drw, Env, Gr, Pt, Rd } from "../types/glyph";
import { evl, okRd } from "../math/expression";

const nOf = (w: number): number =>
  Math.min(SMX, Math.max(SMN, Math.ceil(w / PXS)));

const cl = (v: number, lo: number, hi: number): number =>
  Math.min(Math.max(v, lo - EXT * (hi - lo)), hi + EXT * (hi - lo));

export const curve = (
  c: CanvasRenderingContext2D,
  w: number,
  h: number,
  st: Drw,
): void => {
  if (st.grf.length === 0) return;
  const cam = st.cam;
  const ox = w / 2;
  const oy = h / 2;
  const xa = (-cam.x / cam.k - ox) / UNT;
  const xb = ((w - cam.x) / cam.k - ox) / UNT;
  const ya = (oy - (h - cam.y) / cam.k) / UNT;
  const yb = (oy + cam.y / cam.k) / UNT;
  const X = (x: number): number => ox + x * UNT;
  const Y = (y: number): number => oy - y * UNT;
  const brk = BRK * Math.hypot(xb - xa, yb - ya);
  const env: Env = { ...st.prm, x: 0, y: 0, t: 0, "θ": 0 };

  const bands = (ins: (y: number) => boolean): Pt[] => {
    const n = Math.max(4, Math.ceil(h / BSC));
    const out: Pt[] = [];
    let prev = yb;
    let cur = ins(yb);
    let top: number | null = cur ? yb : null;
    for (let s = 1; s <= n; s++) {
      const y = yb - ((yb - ya) * s) / n;
      const v = ins(y);
      if (v !== cur) {
        let lo = prev;
        let hi = y;
        for (let it = 0; it < BIT; it++) {
          const m = (lo + hi) / 2;
          if (ins(m) === cur) lo = m;
          else hi = m;
        }
        const r = (lo + hi) / 2;
        if (cur) {
          if (top !== null) out.push([top, r]);
          top = null;
        } else top = r;
        cur = v;
      }
      prev = y;
    }
    if (cur && top !== null) out.push([top, ya]);
    return out;
  };

  const reg = (ins: (x: number, y: number) => boolean): void => {
    const cols = Math.max(8, Math.ceil(w / PXS));
    const dx = (xb - xa) / cols;
    for (let i = 0; i < cols; i++) {
      const x = xa + i * dx;
      for (const sg of bands((y) => ins(x, y))) {
        c.moveTo(X(x), Y(sg[0]));
        c.lineTo(X(x + dx), Y(sg[0]));
        c.lineTo(X(x + dx), Y(sg[1]));
        c.lineTo(X(x), Y(sg[1]));
        c.closePath();
      }
    }
  };

  const ms = (f: (x: number, y: number) => number): void => {
    const cols = Math.max(8, Math.ceil(w / MSC));
    const rows = Math.max(4, Math.ceil(h / MSC));
    const dx = (xb - xa) / cols;
    const dy = (yb - ya) / rows;
    const v = new Float64Array((cols + 1) * (rows + 1));
    for (let j = 0; j <= rows; j++)
      for (let i = 0; i <= cols; i++)
        v[j * (cols + 1) + i] = f(xa + i * dx, yb - j * dy);
    const eg = (
      a: number,
      b: number,
      x0: number,
      y0: number,
      x1: number,
      y1: number,
    ): Pt | null =>
      (a < 0) !== (b < 0)
        ? [x0 + ((x1 - x0) * a) / (a - b), y0 + ((y1 - y0) * a) / (a - b)]
        : null;
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const x0 = xa + i * dx;
        const x1 = x0 + dx;
        const y1 = yb - j * dy;
        const y0 = y1 - dy;
        const a = v[j * (cols + 1) + i];
        const b = v[j * (cols + 1) + i + 1];
        const d = v[(j + 1) * (cols + 1) + i + 1];
        const e = v[(j + 1) * (cols + 1) + i];
        const eg0 = eg(a, b, x0, y1, x1, y1);
        const eg1 = eg(b, d, x1, y1, x1, y0);
        const eg2 = eg(e, d, x0, y0, x1, y0);
        const eg3 = eg(a, e, x0, y1, x0, y0);
        const ps: Pt[] = [eg0, eg1, eg2, eg3].filter(
          (q): q is Pt => q !== null,
        );
        if (ps.length === 2) {
          c.moveTo(X(ps[0][0]), Y(ps[0][1]));
          c.lineTo(X(ps[1][0]), Y(ps[1][1]));
        } else if (ps.length === 4) {
          const md = (a + b + d + e) / 4;
          const pr: number[][] =
            md < 0 ? [[0, 1], [2, 3]] : [[1, 2], [3, 0]];
          for (const [u, z] of pr) {
            c.moveTo(X(ps[u][0]), Y(ps[u][1]));
            c.lineTo(X(ps[z][0]), Y(ps[z][1]));
          }
        }
      }
    }
  };

  const clipTo = (rd: Rd[], fn: () => void): void => {
    if (rd.length === 0) {
      fn();
      return;
    }
    c.save();
    c.beginPath();
    reg((x, y) => {
      env.x = x;
      env.y = y;
      return okRd(rd, env);
    });
    c.clip();
    fn();
    c.restore();
  };

  const runs = (
    n: number,
    u0: number,
    u1: number,
    pt: (u: number) => Pt | null,
  ): void => {
    let cur: Pt[] = [];
    let last: Pt | null = null;
    c.beginPath();
    const flush = (): void => {
      if (cur.length > 1) {
        c.moveTo(X(cur[0][0]), Y(cur[0][1]));
        for (let j = 1; j < cur.length; j++)
          c.lineTo(X(cur[j][0]), Y(cur[j][1]));
      }
      cur = [];
    };
    for (let i = 0; i <= n; i++) {
      const u = u0 + ((u1 - u0) * i) / n;
      const p = pt(u);
      if (!p || !isFinite(p[0]) || !isFinite(p[1])) {
        flush();
        last = null;
        continue;
      }
      if (last && Math.hypot(p[0] - last[0], p[1] - last[1]) > brk) {
        flush();
        last = null;
      }
      cur.push(p);
      last = p;
    }
    flush();
    c.stroke();
  };

  c.save();
  c.lineWidth = CLW / cam.k;
  c.lineJoin = "round";
  c.lineCap = "round";
  const cols = [st.spc, st.ink, st.lite];
  st.grf.forEach((g: Gr, i: number) => {
    const col = cols[i % 3];
    c.strokeStyle = col;
    c.fillStyle = col;
    if (g.kd === "fn" && g.dv === "y") {
      const { f, rd } = g;
      runs(nOf(w), xa, xb, (x) => {
        env.x = x;
        const y = evl(f, env);
        env.y = y;
        return okRd(rd, env) ? [x, cl(y, ya, yb)] : null;
      });
    } else if (g.kd === "fn") {
      const { f, rd } = g;
      runs(nOf(w), ya, yb, (y) => {
        env.y = y;
        const x = evl(f, env);
        env.x = x;
        return okRd(rd, env) ? [cl(x, xa, xb), y] : null;
      });
    } else if (g.kd === "pol") {
      const { f, rd } = g;
      runs(PLN, 0, Math.PI * 2, (t) => {
        env["θ"] = t;
        const r = evl(f, env);
        const x = r * Math.cos(t);
        const y = r * Math.sin(t);
        env.x = x;
        env.y = y;
        return okRd(rd, env) ? [cl(x, xa, xb), cl(y, ya, yb)] : null;
      });
    } else if (g.kd === "par") {
      const { a, b, rd } = g;
      runs(PLN, 0, TMRX, (t) => {
        env.t = t;
        const x = evl(a, env);
        const y = evl(b, env);
        env.x = x;
        env.y = y;
        return okRd(rd, env) ? [cl(x, xa, xb), cl(y, ya, yb)] : null;
      });
    } else if (g.kd === "pts") {
      const rr = PSZ / cam.k;
      c.beginPath();
      for (const p of g.p) {
        const x = evl(p[0], env);
        const y = evl(p[1], env);
        if (!isFinite(x) || !isFinite(y)) continue;
        c.moveTo(X(x) + rr, Y(y));
        c.arc(X(x), Y(y), rr, 0, Math.PI * 2);
      }
      c.fill();
    } else if (g.kd === "imp") {
      const { a, b, rd } = g;
      const F = (x: number, y: number): number => {
        env.x = x;
        env.y = y;
        return evl(a, env) - evl(b, env);
      };
      clipTo(rd, () => {
        c.beginPath();
        ms(F);
        c.stroke();
      });
    } else if (g.kd === "ine") {
      const { a, b, rl, bd, rd } = g;
      const neg = rl === "<" || rl === "<=";
      const G = (x: number, y: number): number => {
        env.x = x;
        env.y = y;
        return evl(a, env) - evl(b, env);
      };
      c.globalAlpha = AL_SHD;
      c.beginPath();
      reg((x, y) => {
        const d = G(x, y);
        return okRd(rd, env) && (neg ? d <= 0 : d >= 0);
      });
      c.fill();
      c.globalAlpha = 1;
      if (bd)
        clipTo(rd, () => {
          c.beginPath();
          ms(G);
          c.stroke();
        });
    }
  });
  c.restore();
};
