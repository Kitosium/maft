export type Gly = { ch: string; sc: number; sx: number; bd?: boolean; it?: boolean };

export type Rct = { x: number; y: number; w: number; h: number };

export type Pt = [number, number];

export type Dt = { p: Pt; r: number };

export type Ssp = { g: number; l?: Pt[][]; c?: Pt[][]; d?: Dt[] };

export type Shp = { l: Pt[][]; c: Pt[][]; d: Dt[]; bx: Rct; ad: number };

export type Box = { up: number; dn: number };

export type Lay = {
  os: number[];
  ys: number[];
  rs: Rct[];
  bx: number;
  bw: number;
  yt: number;
  yb: number;
};

export type Pose = { x: number; y: number; s: number; sx: number };

export type Lin = { gs: Gly[]; ly: Lay };

export type Geo = { k: number; by: number[]; h: number; eqx?: number };

export type Mea = { gs: Gly[]; ly: Lay; ps: Pose[] };

export type St = { s: string; i: number; bb: boolean; bd?: boolean; it?: boolean };

export type Atm = { kd: "atm"; ch: string; bd?: boolean; it?: boolean };

export type Lst = { kd: "lst"; nd: Nod[] };

export type Scr = { kd: "scr"; ba: Nod; up: Nod | null; dn: Nod | null };

export type Frc = { kd: "frc"; nu: Nod; de: Nod };

export type Sqt = { kd: "sqt"; ix: Nod | null; nd: Nod };

export type Ovr = { kd: "ovr"; nd: Nod; vc: boolean };

export type Dlm = { kd: "dlm"; lc: string; rc: string; nd: Nod };

export type Spc = { kd: "spc"; em: number };

export type Mtx = { kd: "mtx"; lc: string; rc: string; rows: Nod[][] };

export type Nod = Atm | Lst | Scr | Frc | Sqt | Ovr | Dlm | Spc | Mtx;

export type Ndx = { si: number; ti: number };

export type Kd = "mv" | "mo" | "vs";

export type Op = { kd: Kd; si: number; ti: number };

export type Mm = { op: Op[]; bn: Ndx[] };

export type Cnt = { mv: number; bn: number };

export type Sgn = { b: number; mv: number; bn: number; dn: number; e: number };

export type Seq = { sg: Sgn[]; tot: number };

export type Cfg = {
  hold: number;
  move: number;
  stg: number;
  grow: number;
  bstg: number;
  born: number;
  setl: number;
  arc: number;
  pul: number;
  ez: string;
  mw: [number, number];
  nw: [number, number];
  mo: [number, number];
  mi: [number, number];
  bs: [number, number];
};

export type Act = {
  k: string;
  ch: string;
  bd?: boolean;
  it?: boolean;
  d0: number;
  dur: number;
  a: Pose;
  b: Pose;
  ar: number;
  o: [number, number];
  w: [number, number];
  m: [number, number];
  ez: string;
  lp: [number, number];
  v: [number, number];
};

export type Bse = Omit<Act, "k" | "ch" | "lp">;

export type Frm = { x: number; y: number; s: number; sx: number; o: number };

export type Thm = { bg: string; lite: string; cnt: string; spc: string };

export type Fig = { A: Pt; B: Pt; C: Pt };

export type Tps = { A: Pt; B: Pt; C: Pt; I: Pt; D: Pt; M: Pt; E: Pt; K: Pt };

export type Sid = { a: number; b: number; c: number };

export type Col = { ink: string; lite: string; blu: string; red: string };

export type Cam = { x: number; y: number; k: number };

export type Drg = { x: number; y: number; cx: number; cy: number };

export type Vew = "trf" | "oxy" | "g3d" | "stat";

export type Aln = "ctr" | "lft" | "rgt" | "eq";

export type Ex =
  | { kd: "num"; v: number }
  | { kd: "var"; s: string }
  | { kd: "neg"; a: Ex }
  | { kd: "op"; o: "+" | "-" | "*" | "/" | "^"; a: Ex; b: Ex }
  | { kd: "fn"; f: string; a: Ex[]; bs?: Ex }
  | { kd: "tup"; a: Ex[] }
  | { kd: "lst"; a: Ex[] };

export type Rd = { a: Ex; b: Ex; rl: string };

export type Rng = [number, number, number?];

export type Gr =
  | { kd: "fn"; dv: "x" | "y"; f: Ex; rd: Rd[] }
  | { kd: "pol"; f: Ex; rd: Rd[] }
  | { kd: "par"; a: Ex; b: Ex; rd: Rd[] }
  | { kd: "pts"; p: [Ex, Ex][] }
  | { kd: "imp"; a: Ex; b: Ex; rd: Rd[] }
  | { kd: "ine"; a: Ex; b: Ex; rl: string; bd: boolean; rd: Rd[] };

export type Env = Record<string, number>;

export type Drw = {
  ac: Act[];
  t: number;
  fs: number;
  ink: string;
  lite: string;
  spc: string;
  cam: Cam;
  vew: Vew;
  grf: Gr[];
  prm: Record<string, number>;
};

export type Lyr = (
  c: CanvasRenderingContext2D,
  w: number,
  h: number,
  st: Drw,
) => void;

export type Pr = {
  txt?: string;
  cfg?: Partial<Cfg>;
  fs?: number;
  pad?: number;
  thm?: Partial<Thm>;
  vew?: Vew;
  aln?: Aln;
  rg?: Record<string, Rng>;
};
