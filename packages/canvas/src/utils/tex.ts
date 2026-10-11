import { BB, DLM, ENV, ESC, FUN, GPK, SPA, SPW, SYM } from "../config/tex";
import type { Atm, Nod, St } from "../types/glyph";

const RGHT = "\\right";

const EMPTY: Nod = { kd: "lst", nd: [] };

export function tex(s: string): Nod {
  const st: St = { s, i: 0, bb: false };
  return { kd: "lst", nd: seq(st, "") };
}

function spc(st: St): void {
  while (st.i < st.s.length && /\s/.test(st.s[st.i])) st.i += 1;
}

function cmd(st: St): string {
  st.i += 1;
  const m = /^[a-zA-Z]+/.exec(st.s.slice(st.i));
  if (m) {
    st.i += m[0].length;
    return m[0];
  }
  const c = st.s[st.i] ?? "";
  if (c) st.i += 1;
  return c;
}

function at(st: St, ch: string): Atm {
  return { kd: "atm", ch: st.bb ? BB[ch] ?? ch : ch, bd: st.bd, it: st.it };
}

function rom(st: St, s: string): Nod {
  return { kd: "lst", nd: [...s].map((ch) => ({ kd: "atm", ch, bd: st.bd, it: st.it })) };
}

function sty(st: St, it?: boolean, bd?: boolean): Nod {
  const ti = st.it;
  const tb = st.bd;
  if (it !== undefined) st.it = it;
  if (bd !== undefined) st.bd = bd;
  const nd = grp(st);
  st.it = ti;
  st.bd = tb;
  return nd;
}

function grp(st: St): Nod {
  spc(st);
  if (st.s[st.i] === "{") {
    st.i += 1;
    return { kd: "lst", nd: seq(st, "}") };
  }
  return prim(st) ?? EMPTY;
}

function bbm(st: St): Nod {
  const o = st.bb;
  st.bb = true;
  const nd = grp(st);
  st.bb = o;
  return nd;
}

function dtok(st: St): string {
  spc(st);
  const c = st.s[st.i];
  if (c === undefined) return "";
  if (c !== "\\") {
    st.i += 1;
    return c === "." ? "" : c;
  }
  const k = cmd(st);
  if (k in DLM) return DLM[k];
  if (k in ESC) return ESC[k];
  if (k === "\\") return "";
  return k;
}

function side(st: St): Nod {
  const lc = dtok(st);
  const nd: Nod[] = [];
  let rc = lc;
  for (;;) {
    const q = st.i;
    spc(st);
    if (st.i > q && !st.s.startsWith(RGHT, st.i)) {
      st.i = q;
      spc(st);
      nd.push({ kd: "spc", em: SPW });
      continue;
    }
    if (st.i >= st.s.length) break;
    const hi = st.i + RGHT.length;
    if (st.s.startsWith(RGHT, st.i) && !/^[a-zA-Z]/.test(st.s[hi] ?? "")) {
      st.i = hi;
      rc = dtok(st);
      break;
    }
    const p = st.i;
    const it = item(st);
    if (it) nd.push(it);
    if (st.i === p) st.i += 1;
  }
  return { kd: "dlm", lc, rc, nd: { kd: "lst", nd } };
}

function tok(st: St): string {
  spc(st);
  if (st.s[st.i] === "{") {
    st.i += 1;
    const j = st.s.indexOf("}", st.i);
    const name = st.s.slice(st.i, j < 0 ? st.s.length : j);
    st.i = j < 0 ? st.s.length : j + 1;
    return name;
  }
  const m = /^[a-zA-Z]+/.exec(st.s.slice(st.i));
  if (m) {
    st.i += m[0].length;
    return m[0];
  }
  return "";
}

function env(st: St): Nod {
  const name = tok(st);
  if (st.s[st.i] === "*") st.i += 1;
  const close = `\\end{${name}`;
  const j = st.s.indexOf(close, st.i);
  const body = st.s.slice(st.i, j < 0 ? st.s.length : j);
  st.i = j < 0 ? st.s.length : j + close.length;
  if (st.s[st.i] === "*") st.i += 1;
  if (st.s[st.i] === "}") st.i += 1;
  const dl = ENV[name];
  if (!dl) return EMPTY;
  const rows = body
    .split(/\\\\/)
    .map((r) => r.replace(/^\s*\[[^\]]*\]/, "").trim())
    .filter((r) => r.length > 0)
    .map((r): Nod[] =>
      r.split("&").map((c): Nod => {
        const s2: St = { s: c, i: 0, bb: st.bb, bd: st.bd, it: st.it };
        return { kd: "lst", nd: seq(s2, "") };
      }),
    );
  return { kd: "mtx", lc: dl[0], rc: dl[1], rows };
}

function cmdN(st: St): Nod | null {
  const k = cmd(st);
  if (k === "frac") return { kd: "frc", nu: grp(st), de: grp(st) };
  if (k === "begin") return env(st);
  if (k === "sqrt") {
    spc(st);
    let ix: Nod | null = null;
    if (st.s[st.i] === "[") {
      st.i += 1;
      ix = { kd: "lst", nd: seq(st, "]") };
    }
    return { kd: "sqt", ix, nd: grp(st) };
  }
  if (k === "cbrt") return { kd: "sqt", ix: rom(st, "3"), nd: grp(st) };
  if (k === "vec" || k === "overrightarrow" || k === "overleftrightarrow")
    return { kd: "ovr", nd: grp(st), vc: true };
  if (k === "overline" || k === "bar" || k === "hat" || k === "widehat" || k === "tilde")
    return { kd: "ovr", nd: grp(st), vc: false };
  if (k === "left") return side(st);
  if (/^[Bb](?:igg|ig)[lr]?$/.test(k)) {
    const d = dtok(st);
    return d ? at(st, d) : EMPTY;
  }
  if (k === "text" || k === "textrm" || k === "mathrm") return sty(st, false);
  if (k === "operatorname" || k === "texttt") return grp(st);
  if (k === "mathbf" || k === "textbf" || k === "boldsymbol")
    return sty(st, undefined, true);
  if (k === "textit" || k === "emph" || k === "mathit") return sty(st, true);
  if (k === "mathbb") return bbm(st);
  if (k in SPA) return { kd: "spc", em: SPA[k] };
  if (k in FUN) return rom(st, FUN[k]);
  if (k in GPK) return at(st, GPK[k]);
  if (k in SYM) return { kd: "atm", ch: SYM[k], bd: st.bd, it: st.it };
  if (k in ESC) return { kd: "atm", ch: ESC[k], bd: st.bd, it: st.it };
  if (k === " " || k === "\\") return k === " " ? { kd: "atm", ch: " " } : null;
  return rom(st, k);
}

function prim(st: St): Nod | null {
  spc(st);
  const c = st.s[st.i];
  if (c === undefined || c === "}") return null;
  if (c === "^" || c === "_") return EMPTY;
  if (c === "{") {
    st.i += 1;
    return { kd: "lst", nd: seq(st, "}") };
  }
  if (c === "\\") return cmdN(st);
  st.i += 1;
  return at(st, c);
}

function item(st: St): Nod | null {
  const b = prim(st);
  if (!b) return null;
  let up: Nod | null = null;
  let dn: Nod | null = null;
  for (;;) {
    const p = st.i;
    spc(st);
    const c = st.s[st.i];
    if (c !== "^" && c !== "_") {
      st.i = p;
      break;
    }
    st.i += 1;
    const o = grp(st);
    if (c === "^") up = o;
    else dn = o;
  }
  if (!up && !dn) return b;
  return { kd: "scr", ba: b, up, dn };
}

function seq(st: St, end: string): Nod[] {
  const nd: Nod[] = [];
  for (;;) {
    if (st.s[st.i] === " ") {
      while (st.s[st.i] === " ") st.i += 1;
      nd.push({ kd: "spc", em: SPW });
      continue;
    }
    spc(st);
    const c = st.s[st.i];
    if (c === undefined) break;
    if (c === "}") {
      st.i += 1;
      if (end === "}") break;
      continue;
    }
    if (c === "]" && end === "]") {
      st.i += 1;
      break;
    }
    const p = st.i;
    const it = item(st);
    if (it) nd.push(it);
    if (st.i === p) st.i += 1;
  }
  return nd;
}
