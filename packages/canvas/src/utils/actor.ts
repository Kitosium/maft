import { ARC_D, CFG, FS } from "../config/animation";
import type { Act, Bse, Cfg, Frm, Gly, Mea, Mm, Ndx, Op, Pose, Rct, Seq } from "../types/glyph";
import { bmp, clmp, EZ, lrp, sstp } from "../math/easing";

const lpc = (g: Gly, r: Rct): [number, number] => [
  (r.x + r.w / 2) / (g.sx * FS * g.sc),
  (r.y + r.h / 2) / (FS * g.sc),
];

const dst = (a: Pose, b: Pose): number => Math.hypot(b.x - a.x, b.y - a.y);

const bse = (
  c: Cfg,
  a: Pose,
  b: Pose,
  d0: number,
  dur: number,
  v: [number, number],
): Bse => ({
  d0,
  dur,
  a,
  b,
  v,
  ar: c.arc * clmp(dst(a, b) / ARC_D, 0, 1),
  o: [1, 1],
  w: [0, 1],
  m: [1, 1],
  ez: c.ez,
});

const opAct = (
  a: Mea,
  b: Mea,
  op: Op,
  d0: number,
  v: [number, number],
  c: Cfg,
  k: string,
): Act[] => {
  const p = a.ps[op.si];

  if (op.kd === "vs") {
    return [
      {
        ...bse(c, p, p, d0, c.move, v),
        k,
        ch: a.gs[op.si].ch,
        bd: a.gs[op.si].bd,
        it: a.gs[op.si].it,
        lp: lpc(a.gs[op.si], a.ly.rs[op.si]),
        o: [1, 0],
        w: c.mw,
        m: c.mo,
      },
    ];
  }

  const q = b.ps[op.ti];
  if (op.kd === "mv") {
    return [
      {
        ...bse(c, p, q, d0, c.move, v),
        k,
        ch: b.gs[op.ti].ch,
        bd: b.gs[op.ti].bd,
        it: b.gs[op.ti].it,
        lp: lpc(b.gs[op.ti], b.ly.rs[op.ti]),
      },
    ];
  }

  return [
    {
      ...bse(c, p, q, d0, c.move, v),
      k,
      ch: a.gs[op.si].ch,
      bd: a.gs[op.si].bd,
      it: a.gs[op.si].it,
      lp: lpc(a.gs[op.si], a.ly.rs[op.si]),
      o: [1, 0],
      w: c.mw,
      m: c.mo,
    },
    {
      ...bse(c, p, q, d0, c.move, v),
      k: `${k}i`,
      ch: b.gs[op.ti].ch,
      bd: b.gs[op.ti].bd,
      it: b.gs[op.ti].it,
      lp: lpc(b.gs[op.ti], b.ly.rs[op.ti]),
      o: [0, 1],
      w: c.mw,
      m: c.mi,
    },
  ];
};

const bnAct = (
  a: Mea,
  b: Mea,
  pr: Ndx,
  d0: number,
  v: [number, number],
  c: Cfg,
  k: string,
): Act => {
  const q = b.ps[pr.ti];
  const an = pr.si >= 0 ? a.ps[pr.si] : q;
  const p: Pose = {
    x: q.x + (an.x - q.x) * c.pul,
    y: q.y + (an.y - q.y) * c.pul,
    s: q.s,
    sx: q.sx,
  };
  return {
    ...bse(c, p, q, d0, c.born, v),
    k,
    ch: b.gs[pr.ti].ch,
    bd: b.gs[pr.ti].bd,
    it: b.gs[pr.ti].it,
    lp: lpc(b.gs[pr.ti], b.ly.rs[pr.ti]),
    o: [0, 1],
    w: c.nw,
    m: c.bs,
  };
};

const frz = (m: Mea, i: number, v: [number, number], key: string): Act => ({
  d0: 0,
  dur: 1,
  a: m.ps[i],
  b: m.ps[i],
  v,
  ar: 0,
  o: [1, 1],
  w: [0, 1],
  m: [1, 1],
  ez: CFG.ez,
  k: key,
  ch: m.gs[i].ch,
  bd: m.gs[i].bd,
  it: m.gs[i].it,
  lp: lpc(m.gs[i], m.ly.rs[i]),
});

export const bldStat = (m: Mea): Act[] => m.gs.map((_, i) => frz(m, i, [0, 1], `s${i}`));

export const bldAct = (mes: Mea[], mms: Mm[], sq: Seq, c: Cfg): Act[] => {
  const out: Act[] = [];
  mes.forEach((m, i) => {
    const t0 = i > 0 ? sq.sg[i - 1].e : 0;
    m.gs.forEach((_, n) => out.push(frz(m, n, [t0, sq.tot], `f${i}_${n}`)));
  });
  mms.forEach((m, i) => {
    const a = mes[i];
    const b = mes[i + 1];
    const g = sq.sg[i];
    const v: [number, number] = [g.b, g.e];
    m.op.forEach((op, n) => {
      out.push(...opAct(a, b, op, g.mv + n * c.stg, v, c, `${i}o${n}`));
    });
    m.bn.forEach((pr, n) => {
      out.push(bnAct(a, b, pr, g.bn + n * c.bstg, v, c, `${i}b${n}`));
    });
  });
  return out;
};

export const frmAt = (a: Act, t: number): Frm => {
  if (t < a.v[0] || t > a.v[1]) return { x: 0, y: 0, s: 1, sx: 1, o: 0 };
  const u = clmp((t - a.d0) / a.dur, 0, 1);
  const e = EZ[a.ez](u);
  const w = sstp(a.w[0], a.w[1], u);
  return {
    x: lrp(a.a.x, a.b.x, e),
    y: lrp(a.a.y, a.b.y, e) - a.ar * bmp(e),
    s: lrp(a.a.s, a.b.s, e) * lrp(a.m[0], a.m[1], w),
    sx: lrp(a.a.sx, a.b.sx, e),
    o: lrp(a.o[0], a.o[1], w),
  };
};

export const stepOf = (sq: Seq, t: number): number => {
  let i = 0;
  sq.sg.forEach((g, n) => {
    if (t >= g.dn) i = n + 1;
  });
  return i;
};
