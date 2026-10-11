import type { Cfg, Cnt, Seq, Sgn, Thm } from "../types/glyph";

export const FLEX = [
  "'Google Sans Flex'",
  "'DejaVu Sans','Liberation Sans','Noto Sans'",
  "system-ui,sans-serif",
].join(",");
export const BWT = 700;
export const FS = 120;
export const FS_GEO = 16;
export const FS_D = FS_GEO;
export const FS_MN = 12;
export const VW = 1000;
export const PAD = 40;
export const PAD_F = 20;
export const ARC_D = VW / 4;
export const DEB = 320;
export const TXT_R = 4;
export const THM: Thm = { bg: "#1e1e2e", lite: "#a6adc8", cnt: "#cdd6f4", spc: "#eba0ac" };
export const UNT = 40;
export const GRD = 34;
export const LBFS = 11;
export const AL_GRD = 0.09;
export const AL_AXS = 0.28;
export const AL_LB = 0.85;
export const AXW = 1.4;
export const TKW = 1.2;
export const TKL = 6;
export const LBG = 2;
export const DEF = "x - 1 = 0\nx = 0 + 1\nx = 1";
export const CLW = 1.7;
export const AL_SHD = 0.22;
export const PSZ = 3.5;
export const TMRX = 12;
export const PLN = 900;
export const PXS = 1.5;
export const SMN = 64;
export const SMX = 2000;
export const MSC = 2;
export const BSC = 6;
export const BIT = 14;
export const EXT = 64;
export const BRK = 2;
export const SLMN = -10;
export const SLMX = 10;
export const SLST = 0.01;
export const SLDV = 1;
export const PSW = 3;
export const PTK = 50;

export const CFG: Cfg = {
  hold: 0.45,
  move: 1.3,
  stg: 0.07,
  grow: 0.45,
  bstg: 0.09,
  born: 0.72,
  setl: 0.45,
  arc: 22,
  pul: 0.25,
  ez: "smo",
  mw: [0.3, 0.78],
  nw: [0.1, 0.55],
  mo: [1, 0.55],
  mi: [0.6, 1],
  bs: [0.3, 1],
};

export const seqOf = (cs: Cnt[], c: Cfg): Seq => {
  const sg: Sgn[] = [];
  let b = 0;
  for (const n of cs) {
    const mv = b + c.hold;
    const em = n.mv > 0 ? (n.mv - 1) * c.stg + c.move : 0;
    const en = n.bn > 0 ? c.grow + (n.bn - 1) * c.bstg + c.born : 0;
    const e = b + c.hold + Math.max(em, en) + c.setl;
    sg.push({ b, mv, bn: mv + c.grow, dn: e - c.setl, e });
    b = e;
  }
  return { sg, tot: b };
};
