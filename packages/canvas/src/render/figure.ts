import { FLEX, FS_GEO } from "../config/animation";
import { LABK, labPos } from "../utils/palette";
import type { Col, Pt, Tps } from "../types/glyph";

const dL = (c: CanvasRenderingContext2D, a: Pt, b: Pt): void => {
  c.beginPath();
  c.moveTo(a[0], a[1]);
  c.lineTo(b[0], b[1]);
  c.stroke();
};

const dT = (
  c: CanvasRenderingContext2D,
  txt: string,
  x: number,
  y: number,
  al: CanvasTextAlign = "center",
  bl: CanvasTextBaseline = "middle",
): void => {
  c.textAlign = al;
  c.textBaseline = bl;
  c.fillText(txt, x, y);
};

const dC = (c: CanvasRenderingContext2D, p: Pt, r: number): void => {
  c.beginPath();
  c.arc(p[0], p[1], r, 0, 2 * Math.PI);
  c.stroke();
};

const dPt = (c: CanvasRenderingContext2D, p: Pt): void => {
  c.beginPath();
  c.arc(p[0], p[1], 3.5, 0, 2 * Math.PI);
  c.fill();
};

export const figDrw = (
  c: CanvasRenderingContext2D,
  w: number,
  h: number,
  tps: Tps,
  col: Col,
): void => {
  const fs = FS_GEO;
  c.font = `${fs}px ${FLEX}`;
  c.fillStyle = col.ink;
  c.strokeStyle = col.ink;
  c.lineWidth = 2;

  dL(c, tps.A, tps.B);
  dL(c, tps.B, tps.C);
  dL(c, tps.C, tps.A);

  c.strokeStyle = col.lite;
  c.lineWidth = 1;
  c.setLineDash([6, 4]);
  dC(c, tps.I, Math.hypot(tps.I[0] - tps.D[0], tps.I[1] - tps.D[1]));
  c.setLineDash([]);

  c.strokeStyle = col.lite;
  c.lineWidth = 1;
  dL(c, tps.A, tps.I);
  dL(c, tps.I, tps.C);
  dL(c, tps.K, tps.E);
  dL(c, tps.I, tps.D);

  c.strokeStyle = col.blu;
  c.lineWidth = 2.5;
  dL(c, tps.I, tps.M);

  c.strokeStyle = col.red;
  c.lineWidth = 2.5;
  dL(c, tps.D, tps.K);

  c.fillStyle = col.ink;
  for (const k of LABK) dPt(c, tps[k]);

  const lb = labPos(tps, w, h, (s) => {
    const m = c.measureText(s);
    return {
      w: m.width,
      h: Math.max(1, m.actualBoundingBoxAscent + m.actualBoundingBoxDescent),
    };
  });
  for (const k of LABK) dT(c, k, lb[k][0], lb[k][1]);

  c.beginPath();
  c.moveTo(tps.D[0], tps.D[1] - 6);
  c.lineTo(tps.D[0] + 6, tps.D[1] - 6);
  c.lineTo(tps.D[0] + 6, tps.D[1]);
  c.strokeStyle = col.ink;
  c.lineWidth = 1.5;
  c.stroke();
};