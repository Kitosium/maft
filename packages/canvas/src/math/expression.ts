import type { Env, Ex, Gr, Rd } from "../types/glyph";

export const RSV = ["x", "y", "t", "θ"];

type Fn = { n: number; f: (a: number[]) => number };

const M = Math;

const FN: Record<string, Fn> = {
  sin: { n: 1, f: (a) => M.sin(a[0]) },
  cos: { n: 1, f: (a) => M.cos(a[0]) },
  tan: { n: 1, f: (a) => M.tan(a[0]) },
  cot: { n: 1, f: (a) => 1 / M.tan(a[0]) },
  sec: { n: 1, f: (a) => 1 / M.cos(a[0]) },
  csc: { n: 1, f: (a) => 1 / M.sin(a[0]) },
  asin: { n: 1, f: (a) => M.asin(a[0]) },
  acos: { n: 1, f: (a) => M.acos(a[0]) },
  atan: { n: 1, f: (a) => M.atan(a[0]) },
  arcsin: { n: 1, f: (a) => M.asin(a[0]) },
  arccos: { n: 1, f: (a) => M.acos(a[0]) },
  arctan: { n: 1, f: (a) => M.atan(a[0]) },
  sinh: { n: 1, f: (a) => M.sinh(a[0]) },
  cosh: { n: 1, f: (a) => M.cosh(a[0]) },
  tanh: { n: 1, f: (a) => M.tanh(a[0]) },
  asinh: { n: 1, f: (a) => M.asinh(a[0]) },
  acosh: { n: 1, f: (a) => M.acosh(a[0]) },
  atanh: { n: 1, f: (a) => M.atanh(a[0]) },
  ln: { n: 1, f: (a) => M.log(a[0]) },
  log: { n: 1, f: (a) => M.log10(a[0]) },
  lg: { n: 1, f: (a) => M.log10(a[0]) },
  exp: { n: 1, f: (a) => M.exp(a[0]) },
  sqrt: { n: 1, f: (a) => M.sqrt(a[0]) },
  cbrt: { n: 1, f: (a) => M.cbrt(a[0]) },
  abs: { n: 1, f: (a) => M.abs(a[0]) },
  floor: { n: 1, f: (a) => M.floor(a[0]) },
  ceil: { n: 1, f: (a) => M.ceil(a[0]) },
  round: { n: 1, f: (a) => M.round(a[0]) },
  sign: { n: 1, f: (a) => M.sign(a[0]) },
  mod: { n: 2, f: (a) => a[0] - a[1] * M.floor(a[0] / a[1]) },
  nroot: { n: 2, f: (a) => a[0] ** (1 / a[1]) },
  frac: { n: 2, f: (a) => a[0] / a[1] },
  min: { n: -1, f: (a) => M.min(...a) },
  max: { n: -1, f: (a) => M.max(...a) },
};

export const arOf = (f: string): number => (FN[f] ? FN[f].n : -2);

export const evl = (e: Ex, v: Env): number => {
  switch (e.kd) {
    case "num":
      return e.v;
    case "var":
      return v[e.s];
    case "neg":
      return -evl(e.a, v);
    case "fn": {
      if (e.f === "log" && e.bs) return M.log(evl(e.a[0], v)) / M.log(evl(e.bs, v));
      const g = FN[e.f];
      return g ? g.f(e.a.map((q) => evl(q, v))) : NaN;
    }
    case "op": {
      const a = evl(e.a, v);
      const b = evl(e.b, v);
      if (e.o === "+") return a + b;
      if (e.o === "-") return a - b;
      if (e.o === "*") return a * b;
      if (e.o === "/") return a / b;
      return a ** b;
    }
    default:
      return NaN;
  }
};

export const vr = (e: Ex, out: Set<string>): void => {
  if (e.kd === "var") out.add(e.s);
  else if (e.kd === "neg") vr(e.a, out);
  else if (e.kd === "op") {
    vr(e.a, out);
    vr(e.b, out);
  } else if (e.kd === "fn") {
    e.a.forEach((q) => vr(q, out));
    if (e.bs) vr(e.bs, out);
  } else if (e.kd === "tup" || e.kd === "lst") e.a.forEach((q) => vr(q, out));
};

export const prmOf = (g: Gr): string[] => {
  const s = new Set<string>();
  const w = (e: Ex): void => vr(e, s);
  const wd = (q: Rd[]): void => q.forEach((r) => { w(r.a); w(r.b); });
  if (g.kd === "fn" || g.kd === "pol") { w(g.f); wd(g.rd); }
  else if (g.kd === "pts") g.p.forEach(([a, b]) => { w(a); w(b); });
  else { w(g.a); w(g.b); wd(g.rd); }
  return [...s].filter((v) => !RSV.includes(v));
};

export const NMS = [
  "arcsin", "arccos", "arctan", "asinh", "acosh", "atanh", "nroot", "floor",
  "round", "theta", "sinh", "cosh", "tanh", "sqrt", "cbrt", "frac", "ceil",
  "sign", "asin", "acos", "atan", "sin", "cos", "tan", "cot", "sec", "csc",
  "exp", "mod", "min", "max", "abs", "log", "ln", "lg", "pi",
];
export const RLT: Record<string, string> = { le: "<=", leq: "<=", ge: ">=", geq: ">=" };
export const CMD: Record<string, string> = { cdot: "*", times: "*", div: "/", left: "", right: "" };
export const IDS: Record<string, string> = { theta: "θ" };
export const OPS = [
  "<=", ">=", "≤", "≥", "+", "-", "*", "/", "^", "(", ")", "{", "}", ",", "_", "=", "<", ">",
];
export const REL = ["=", "<", ">", "<=", ">="];
export const CNST: Record<string, number> = { pi: Math.PI, e: Math.E, "π": Math.PI };

const SGN: Record<string, (a: number, b: number) => boolean> = {
  "<": (a, b) => a < b,
  "<=": (a, b) => a <= b,
  ">": (a, b) => a > b,
  ">=": (a, b) => a >= b,
  "=": (a, b) => a === b,
};

export const okRd = (rd: Rd[], v: Env): boolean =>
  rd.every((r) => SGN[r.rl](evl(r.a, v), evl(r.b, v)));
