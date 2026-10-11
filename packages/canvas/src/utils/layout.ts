import { BWT, FLEX, FS } from "../config/animation";
import { BIG, DMX, EQL, FGP, MGP, RAD, ROWG, RUL, SCF, SPD, SPR } from "../config/tex";
import { barRow, vecRow } from "../symbols/rule";
import type { Box, Gly, Lay, Lin, Mtx, Nod, Rct, Sqt, Dlm, Ovr } from "../types/glyph";
import { symAd, symBx, symOf } from "../symbols/table";

export { eqOf, geoOf, rowY, wldPos } from "../math/geometry";

let CT: CanvasRenderingContext2D | null = null;

const ctx = (): CanvasRenderingContext2D => {
  if (!CT) {
    const cv = document.createElement("canvas");
    const c = cv.getContext("2d");
    if (!c) throw new Error("layNod: ctx missing");
    CT = c;
  }
  return CT;
};

const ink = (m: TextMetrics): Rct => ({
  x: -m.actualBoundingBoxLeft,
  y: -m.actualBoundingBoxAscent,
  w: m.actualBoundingBoxLeft + m.actualBoundingBoxRight,
  h: m.actualBoundingBoxAscent + m.actualBoundingBoxDescent,
});

export const layNod = (nd: Nod, fs: number): Lin => {
  const c = ctx();
  const gs: Gly[] = [];
  const os: number[] = [];
  const ys: number[] = [];
  const rs: Rct[] = [];

  const fnt = (size: number, bd?: boolean, it?: boolean): void => {
    c.font = `${it ? "italic " : ""}${bd ? `${BWT} ` : ""}${size}px ${FLEX}`;
  };

  const nat = (ch: string, size: number, bd?: boolean, it?: boolean): Rct => {
    const s = symOf(ch);
    return s ? symBx(s, size) : (fnt(size, bd, it), ink(c.measureText(ch)));
  };

  const adv = (ch: string, size: number, bd?: boolean, it?: boolean): number => {
    const s = symOf(ch);
    return s ? symAd(s, size) : (fnt(size, bd, it), c.measureText(ch).width);
  };

  const emit = (
    ch: string, size: number, x: number, y: number, sx: number,
    bd?: boolean, it?: boolean,
  ): number => {
    const n = nat(ch, size, bd, it);
    gs.push({ ch, sc: size / FS, sx, bd, it });
    os.push(x);
    ys.push(y);
    rs.push({ x: n.x * sx, y: n.y, w: n.w * sx, h: n.h });
    return adv(ch, size, bd, it) * sx;
  };

  const boxR = (a: number, b: number, y = 0): Box => {
    let up = 0;
    let dn = 0;
    for (let j = a; j < b; j++) {
      const t = ys[j] + rs[j].y - y;
      up = Math.max(up, -t);
      dn = Math.max(dn, t + rs[j].h);
    }
    return { up, dn };
  };

  const shift = (a: number, b: number, dx: number, dy: number): void => {
    for (let j = a; j < b; j++) {
      os[j] += dx;
      ys[j] += dy;
    }
  };

  const bar = (w: number, x: number, yc: number, size: number): void =>
    barRow(w, x, yc, size, nat, emit);

  const szOf = (ch: string, fs: number, need: number): number => {
    const n = nat(ch, fs);
    return n.h > 0 ? Math.min(Math.max(need / n.h, 1), DMX) : 1;
  };

  function lay(nd: Nod, fs: number, x: number, y: number): number {
    switch (nd.kd) {
      case "atm":
        return nd.ch === "" ? 0 : emit(nd.ch, fs, x, y, 1, nd.bd, nd.it);
      case "spc":
        return nd.em * fs;
      case "lst": {
        let cx = x;
        for (const n of nd.nd) cx += lay(n, fs, cx, y);
        return cx - x;
      }
      case "scr": {
        const s0 = gs.length;
        const w0 = lay(nd.ba, fs, x, y);
        if (!(nd.ba.kd === "atm" && BIG.includes(nd.ba.ch))) {
          let wu = 0;
          let wd = 0;
          if (nd.up) wu = lay(nd.up, fs * SCF, x + w0, y - SPR * fs);
          if (nd.dn) wd = lay(nd.dn, fs * SCF, x + w0, y + SPD * fs);
          return w0 + Math.max(wu, wd);
        }
        const bb = boxR(s0, gs.length, y);
        const u0 = gs.length;
        const wu = nd.up ? lay(nd.up, fs * SCF, x, y) : 0;
        const ub = boxR(u0, gs.length, y);
        const d0 = gs.length;
        const wd = nd.dn ? lay(nd.dn, fs * SCF, x, y) : 0;
        const db = boxR(d0, gs.length, y);
        const W = Math.max(w0, wu, wd);
        shift(s0, u0, (W - w0) / 2, 0);
        shift(u0, d0, (W - wu) / 2, -(bb.up + FGP * fs + ub.dn));
        shift(d0, gs.length, (W - wd) / 2, bb.dn + FGP * fs + db.up);
        return W;
      }
      case "frc":
        return frc(nd.nu, nd.de, fs, x, y);
      case "sqt":
        return sqt(nd, fs, x, y);
      case "ovr":
        return ovr(nd, fs, x, y);
      case "dlm":
        return dlm(nd, fs, x, y);
      case "mtx":
        return mtx(nd, fs, x, y);
    }
  }

  function frc(nu: Nod, de: Nod, fs: number, x: number, y: number): number {
    const s0 = gs.length;
    const wn = lay(nu, fs, x, y);
    const s1 = gs.length;
    const wd = lay(de, fs, x, y);
    const s2 = gs.length;
    const w = Math.max(wn, wd);
    const bn = boxR(s0, s1);
    const bd = boxR(s1, s2);
    const gap = FGP * fs;
    const rh = RUL * fs;
    const eq = nat(EQL, fs);
    const ry = y + eq.y + eq.h / 2;
    const yn = ry - rh / 2 - gap - bn.dn;
    const yd = ry + rh / 2 + gap + bd.up;
    shift(s0, s1, (w - wn) / 2, yn - y);
    shift(s1, s2, (w - wd) / 2, yd - y);
    bar(w, x, ry, fs);
    return w;
  }

  function sqt(nd: Sqt, fs: number, x: number, y: number): number {
    let cx = x;
    if (nd.ix) cx += lay(nd.ix, fs * SCF, cx, y - SPR * fs);
    const s0 = gs.length;
    const wc = lay(nd.nd, fs, cx, y);
    const s1 = gs.length;
    const bc = boxR(s0, s1);
    const gap = FGP * fs;
    const rn = nat(RAD, fs);
    const rt = y - bc.up - gap - RUL * fs;
    const need = bc.up + bc.dn + gap + RUL * fs;
    const k = rn.h > 0 ? Math.min(Math.max(need / rn.h, 1), DMX) : 1;
    const fr = nat(RAD, fs * k);
    const wr = adv(RAD, fs * k);
    emit(RAD, fs * k, cx, rt - fr.y, 1);
    shift(s0, s1, wr, 0);
    bar(wc, cx + fr.x + fr.w, rt + RUL * fs / 2, fs);
    return wr + wc;
  }

  function ovr(nd: Ovr, fs: number, x: number, y: number): number {
    const s0 = gs.length;
    const w = lay(nd.nd, fs, x, y);
    const b = boxR(s0, gs.length);
    const gap = FGP * fs;
    if (nd.vc) {
      vecRow(w, x, y - b.up - gap, fs * SCF, nat, emit);
    } else {
      bar(w, x, y - b.up - gap - RUL * fs / 2, fs);
    }
    return w;
  }

  function dlm(nd: Dlm, fs: number, x: number, y: number): number {
    const s0 = gs.length;
    const wc = lay(nd.nd, fs, x, y);
    const s1 = gs.length;
    const bc = boxR(s0, s1);
    const gap = FGP * fs;
    const need = bc.up + bc.dn + gap;
    const yc = y + (bc.dn - bc.up) / 2;
    const kl = szOf(nd.lc, fs, need);
    const kr = szOf(nd.rc, fs, need);
    const wl = adv(nd.lc, fs);
    const wr = adv(nd.rc, fs);
    const nl = nat(nd.lc, fs * kl);
    const nr = nat(nd.rc, fs * kr);
    shift(s0, s1, wl, 0);
    if (nd.lc) emit(nd.lc, fs * kl, x, yc - (nl.y + nl.h / 2), 1 / kl);
    if (nd.rc) emit(nd.rc, fs * kr, x + wl + wc, yc - (nr.y + nr.h / 2), 1 / kr);
    return wl + wc + wr;
  }

  function mtx(nd: Mtx, fs: number, x: number, y: number): number {
    if (nd.rows.length === 0) return 0;
    const md: { s: number; e: number; w: number; c: number; r: number }[] = [];
    nd.rows.forEach((row, r) =>
      row.forEach((n, c) => {
        const s = gs.length;
        const w = lay(n, fs, 0, 0);
        md.push({ s, e: gs.length, w, c, r });
      }),
    );
    const nc = nd.rows.reduce((m, row) => Math.max(m, row.length), 0);
    const cw = new Array<number>(nc).fill(0);
    const ub: number[] = [];
    const db: number[] = [];
    const dg = nat("0", fs);
    const yd = nat("y", fs);
    nd.rows.forEach((_, r) => {
      let u = -dg.y;
      let d = Math.max(0, yd.y + yd.h);
      for (const m of md) {
        if (m.r !== r) continue;
        const b = boxR(m.s, m.e);
        cw[m.c] = Math.max(cw[m.c], m.w);
        u = Math.max(u, b.up);
        d = Math.max(d, b.dn);
      }
      ub.push(u); db.push(d);
    });
    const gy = ROWG * fs;
    const bl: number[] = [];
    let acc = 0;
    ub.forEach((u, r) => {
      if (r > 0) acc += db[r - 1] + gy + u;
      bl.push(acc);
    });
    const up = ub[0];
    const dn = acc + db[db.length - 1];
    const eq = nat(EQL, fs); const ax = eq.y + eq.h / 2;
    const dy = y + ax - (dn - up) / 2;
    const gx = MGP * fs;
    const xs: number[] = [];
    let cx = gx;
    cw.forEach((w) => {
      xs.push(cx);
      cx += w + gx;
    });
    const tw = cx;
    const gap = FGP * fs;
    const need = up + dn + gap;
    const kl = nd.lc ? szOf(nd.lc, fs, need) : 1;
    const kr = nd.rc ? szOf(nd.rc, fs, need) : 1;
    const wl = nd.lc ? adv(nd.lc, fs) : 0;
    const wr = nd.rc ? adv(nd.rc, fs) : 0;
    const nl = nd.lc ? nat(nd.lc, fs * kl) : null;
    const nr = nd.rc ? nat(nd.rc, fs * kr) : null;
    md.forEach((m) => shift(m.s, m.e, x + wl + xs[m.c] + (cw[m.c] - m.w) / 2, dy + bl[m.r]));
    if (nl) emit(nd.lc, fs * kl, x, y + ax - (nl.y + nl.h / 2), 1 / kl);
    if (nr) emit(nd.rc, fs * kr, x + wl + tw, y + ax - (nr.y + nr.h / 2), 1 / kr);
    return wl + tw + wr;
  }

  lay(nd, fs, 0, 0);

  let x0 = Infinity;
  let x1 = -Infinity;
  let yt = 0;
  let yb = 0;
  for (let j = 0; j < gs.length; j++) {
    const r = rs[j];
    if (r.w <= 0 && r.h <= 0) continue;
    yt = Math.min(yt, ys[j] + r.y);
    yb = Math.max(yb, ys[j] + r.y + r.h);
    x0 = Math.min(x0, os[j] + r.x);
    x1 = Math.max(x1, os[j] + r.x + r.w);
  }
  const has = x1 > x0;
  const ly: Lay = {
    os,
    ys,
    rs,
    bx: has ? x0 : 0,
    bw: has ? x1 - x0 : 0,
    yt,
    yb,
  };
  return { gs, ly };
};

