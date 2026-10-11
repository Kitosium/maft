import type { Ex, Gr, Rd } from "../types/glyph";
import { CNST, CMD, IDS, NMS, OPS, RLT, REL, RSV, arOf, vr } from "../math/expression";

type Tkn = { kd: "n"; v: number } | { kd: "i"; v: string } | { kd: "o"; v: string };
type St = { t: Tkn[]; i: number };
type Top = { a: Ex; rl: string | null; b: Ex | null };

const lex = (s: string): Tkn[] | null => {
  const o: Tkn[] = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (ch === "\\") {
      const m = /^\\([a-zA-Z]+)/.exec(s.slice(i));
      if (!m) return null;
      const nm = m[1];
      i += m[0].length;
      if (nm in RLT) o.push({ kd: "o", v: RLT[nm] });
      else if (nm in CMD) {
        if (CMD[nm]) o.push({ kd: "o", v: CMD[nm] });
      } else if (nm in IDS) o.push({ kd: "i", v: IDS[nm] });
      else if (NMS.includes(nm)) o.push({ kd: "i", v: nm });
      else return null;
      continue;
    }
    if (/[0-9.]/.test(ch)) {
      const m = /^(?:\d+\.\d*|\.\d+|\d+)/.exec(s.slice(i));
      if (!m) return null;
      const v = Number(m[0]);
      if (!isFinite(v)) return null;
      o.push({ kd: "n", v });
      i += m[0].length;
      continue;
    }
    if (/\p{L}/u.test(ch)) {
      const nm = NMS.find((n) => s.startsWith(n, i));
      if (nm) {
        o.push({ kd: "i", v: IDS[nm] ?? nm });
        i += nm.length;
      } else {
        const m = /^\p{L}\d+/u.exec(s.slice(i));
        const w = m ? m[0] : ch;
        o.push({ kd: "i", v: w });
        i += w.length;
      }
      continue;
    }
    const op = OPS.find((p) => s.startsWith(p, i));
    if (op) {
      o.push({ kd: "o", v: op === "≤" ? "<=" : op === "≥" ? ">=" : op });
      i += op.length;
      continue;
    }
    return null;
  }
  return o;
};

const tk = (s: St): Tkn => s.t[s.i];
const op = (s: St, v: string): boolean => {
  const t = s.t[s.i];
  if (t && t.kd === "o" && t.v === v) {
    s.i++;
    return true;
  }
  return false;
};
const rel = (s: St): string | null => {
  const t = s.t[s.i];
  if (t && t.kd === "o" && REL.includes(t.v)) {
    s.i++;
    return t.v;
  }
  return null;
};
const prims = (s: St): boolean => {
  const t = s.t[s.i];
  return !!t && (t.kd === "n" || t.kd === "i" || (t.kd === "o" && t.v === "("));
};
const arg = (s: St): Ex[] | null => {
  const f = ex(s);
  if (!f) return null;
  const xs = [f];
  while (op(s, ",")) {
    const q = ex(s);
    if (!q) return null;
    xs.push(q);
  }
  return xs;
};

const sfx = (s: St, nm: string): Ex | null => {
  if (!op(s, "_")) return { kd: "var", s: nm };
  const t = tk(s);
  if (t && (t.kd === "i" || t.kd === "n")) { s.i++; return { kd: "var", s: `${nm}_${t.v}` }; }
  const q = at(s);
  if (q && (q.kd === "var" || q.kd === "num")) {
    return { kd: "var", s: `${nm}_${q.kd === "var" ? q.s : q.v}` };
  }
  return null;
};

const idf = (s: St, nm: string): Ex | null => {
  if (nm in CNST) return { kd: "num", v: CNST[nm] };
  const ar = arOf(nm);
  if (ar === -2) return sfx(s, nm);
  let bs: Ex | null = null;
  if (op(s, "_")) {
    if (nm !== "log") return null;
    bs = tk(s) ? at(s) : null;
    if (!bs) return null;
  }
  if (nm === "frac") {
    const p1 = at(s);
    const p2 = at(s);
    if (!p1 || !p2) return null;
    return { kd: "fn", f: "frac", a: [p1, p2] };
  }
  let a: Ex[];
  if (op(s, "(")) {
    const xs = arg(s);
    if (!xs || !op(s, ")")) return null;
    a = xs;
  } else {
    const q = at(s);
    if (!q) return null;
    a = [q];
  }
  if (ar >= 0 && a.length !== ar) return null;
  if (ar === -1 && a.length < 2) return null;
  return bs ? { kd: "fn", f: nm, a, bs } : { kd: "fn", f: nm, a };
};

const at = (s: St): Ex | null => {
  const t = tk(s);
  if (!t) return null;
  if (t.kd === "n") {
    s.i++;
    return { kd: "num", v: t.v };
  }
  if (t.kd === "i") {
    s.i++;
    return idf(s, t.v);
  }
  if (t.kd === "o" && (t.v === "(" || t.v === "{")) {
    const cl = t.v;
    s.i++;
    const xs = arg(s);
    if (!xs || !op(s, cl === "(" ? ")" : "}")) return null;
    if (xs.length === 1) return xs[0];
    return { kd: cl === "(" ? "tup" : "lst", a: xs };
  }
  return null;
};

const pw = (s: St): Ex | null => {
  const a = at(s);
  if (!a) return null;
  if (op(s, "^")) {
    const b = un(s);
    return b ? { kd: "op", o: "^", a, b } : null;
  }
  return a;
};

const un = (s: St): Ex | null => {
  if (op(s, "-")) {
    const a = un(s);
    return a ? { kd: "neg", a } : null;
  }
  if (op(s, "+")) return un(s);
  return pw(s);
};

const tm = (s: St): Ex | null => {
  let a = un(s);
  if (!a) return null;
  for (;;) {
    if (op(s, "*")) {
      const b = un(s);
      if (!b) return null;
      a = { kd: "op", o: "*", a, b };
    } else if (op(s, "/")) {
      const b = un(s);
      if (!b) return null;
      a = { kd: "op", o: "/", a, b };
    } else if (prims(s)) {
      const b = un(s);
      if (!b) return null;
      a = { kd: "op", o: "*", a, b };
    } else return a;
  }
};

const ex = (s: St): Ex | null => {
  let a = tm(s);
  if (!a) return null;
  for (;;) {
    if (op(s, "+")) {
      const b = tm(s);
      if (!b) return null;
      a = { kd: "op", o: "+", a, b };
    } else if (op(s, "-")) {
      const b = tm(s);
      if (!b) return null;
      a = { kd: "op", o: "-", a, b };
    } else return a;
  }
};

const top = (s: St): Top | null => {
  const a = ex(s);
  if (!a) return null;
  const r = rel(s);
  if (r === null) return { a, rl: null, b: null };
  const b = ex(s);
  if (!b) return null;
  return { a, rl: r, b };
};

const hit = (s: Set<string>, xs: string[]): boolean => xs.some((x) => s.has(x));
const XY = ["x", "y"];
const vsOf = (e: Ex): Set<string> => {
  const o = new Set<string>();
  vr(e, o);
  return o;
};

const pt2 = (e: Ex): [Ex, Ex] | null => {
  if (e.kd !== "tup" || e.a.length !== 2 || hit(vsOf(e), RSV)) return null;
  return [e.a[0], e.a[1]];
};

const cls = (t: Top, rd: Rd[]): Gr | null => {
  const va = vsOf(t.a);
  const vb = t.b ? vsOf(t.b) : new Set<string>();
  const all = new Set([...va, ...vb]);
  if (t.rl !== null && t.b) {
    if ([t.a, t.b].some((e) => e.kd === "tup" || e.kd === "lst")) return null;
    if (t.rl !== "=") {
      if (!hit(all, XY) || hit(all, ["t", "θ"])) return null;
      return { kd: "ine", a: t.a, b: t.b, rl: t.rl, bd: t.rl === "<=" || t.rl === ">=", rd };
    }
    const lv = t.a.kd === "var" ? t.a.s : "";
    if (lv === "y" && !hit(vb, ["y", "t", "θ"])) return { kd: "fn", dv: "y", f: t.b, rd };
    if (lv === "x" && !hit(vb, ["x", "t", "θ"])) return { kd: "fn", dv: "x", f: t.b, rd };
    if (lv === "r" && !hit(vb, ["r", "x", "y"])) return { kd: "pol", f: t.b, rd };
    if (t.a.kd === "var" && !hit(vb, XY)) return null;
    if (hit(all, XY) && !hit(all, ["t", "θ"])) return { kd: "imp", a: t.a, b: t.b, rd };
    return null;
  }
  if (t.a.kd === "lst") {
    if (rd.length > 0) return null;
    const p: [Ex, Ex][] = [];
    for (const e of t.a.a) {
      const q = pt2(e);
      if (!q) return null;
      p.push(q);
    }
    return { kd: "pts", p };
  }
  if (t.a.kd === "tup") {
    const v2 = vsOf(t.a);
    if (v2.has("t")) {
      if (t.a.a.length !== 2 || hit(v2, ["x", "y", "θ"])) return null;
      return { kd: "par", a: t.a.a[0], b: t.a.a[1], rd };
    }
    if (rd.length > 0) return null;
    const q = pt2(t.a);
    return q ? { kd: "pts", p: [q] } : null;
  }
  if (hit(va, ["t", "θ"]) || va.has("x") === va.has("y")) return null;
  return { kd: "fn", dv: va.has("y") ? "x" : "y", f: t.a, rd };
};

export const grfOf = (s: string): Gr | null => {
  const t = lex(s);
  if (!t || t.length === 0) return null;
  const st: St = { t, i: 0 };
  const r = top(st);
  if (!r) return null;
  const rd: Rd[] = [];
  while (op(st, "{")) {
    const a = ex(st);
    if (!a) return null;
    const rl = rel(st);
    if (!rl) return null;
    const b = ex(st);
    if (!b) return null;
    if (!op(st, "}")) return null;
    rd.push({ a, b, rl });
  }
  if (st.i !== st.t.length) return null;
  return cls(r, rd);
};
