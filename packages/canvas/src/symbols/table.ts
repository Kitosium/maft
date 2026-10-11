import { stemRt } from "../utils/stem";
import type { Rct, Shp } from "../types/glyph";
import { ARR } from "./arrow";
import { BRK } from "./brackets";
import { CAL } from "./calculus";
import { LOG } from "./logic";
import { MIS } from "./misc";
import { OPS, OPR } from "./operators";
import { REL } from "./relation";

const TBL: Record<string, Shp> = {
  ...BRK,
  ...OPR,
  ...MIS,
  ...ARR,
  ...OPS,
  ...LOG,
  ...REL,
  ...CAL,
};

export const symOf = (ch: string): Shp | undefined => TBL[ch];

export const symBx = (s: Shp, size: number): Rct => ({
  x: s.bx.x * size,
  y: s.bx.y * size,
  w: s.bx.w * size,
  h: s.bx.h * size,
});

export const symAd = (s: Shp, size: number): number => s.ad * size;

export const symDrw = (
  c: CanvasRenderingContext2D,
  s: Shp,
  u: number,
  b = u,
  sx = 1,
  bd?: boolean,
): void => {
  c.save();
  c.scale(u, u);
  c.lineWidth = stemRt(bd) * Math.min(1, b / u);
  c.lineCap = "butt";
  c.lineJoin = "miter";
  const X = (v: number): number => v * sx;
  c.beginPath();
  for (const p of s.l) {
    c.moveTo(X(p[0][0]), p[0][1]);
    for (let i = 1; i < p.length; i++) c.lineTo(X(p[i][0]), p[i][1]);
  }
  for (const p of s.c) {
    c.moveTo(X(p[0][0]), p[0][1]);
    for (let i = 1; i + 2 < p.length; i += 3) {
      c.bezierCurveTo(
        X(p[i][0]), p[i][1], X(p[i + 1][0]),
        p[i + 1][1], X(p[i + 2][0]), p[i + 2][1],
      );
    }
  }
  c.stroke();
  if (s.d.length > 0) {
    c.beginPath();
    for (const t of s.d) {
      c.moveTo(X(t.p[0]) + t.r, t.p[1]);
      c.arc(X(t.p[0]), t.p[1], t.r, 0, Math.PI * 2);
    }
    c.fill();
  }
  c.restore();
};
