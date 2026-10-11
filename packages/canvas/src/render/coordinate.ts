import {
  AL_AXS,
  AL_GRD,
  AL_LB,
  AXW,
  FLEX,
  GRD,
  LBFS,
  LBG,
  TKL,
  TKW,
  UNT,
} from "../config/animation";
import type { Drw } from "../types/glyph";
import { curve } from "./curve";

const uOf = (k: number): number => {
  for (const n of [1, 2, 5, 10, 20, 50, 100, 200]) if (UNT * n * k >= GRD) return UNT * n;
  return UNT * 200;
};

export const oxy = (
  c: CanvasRenderingContext2D,
  w: number,
  h: number,
  st: Drw,
): void => {
  const cam = st.cam;
  const lite = st.lite;
  const ox = w / 2;
  const oy = h / 2;
  const u = uOf(cam.k);
  const x0 = -cam.x / cam.k;
  const x1 = (w - cam.x) / cam.k;
  const y0 = -cam.y / cam.k;
  const y1 = (h - cam.y) / cam.k;
  const i0 = Math.ceil((x0 - ox) / u);
  const i1 = Math.floor((x1 - ox) / u);
  const j0 = Math.ceil((y0 - oy) / u);
  const j1 = Math.floor((y1 - oy) / u);
  c.strokeStyle = lite;
  c.globalAlpha = AL_GRD;
  c.lineWidth = 1 / cam.k;
  c.beginPath();
  for (let i = i0; i <= i1; i++) {
    const x = ox + i * u;
    c.moveTo(x, y0);
    c.lineTo(x, y1);
  }
  for (let j = j0; j <= j1; j++) {
    const y = oy + j * u;
    c.moveTo(x0, y);
    c.lineTo(x1, y);
  }
  c.stroke();
  c.globalAlpha = 1;
  curve(c, w, h, st);
  c.globalAlpha = AL_AXS;
  c.lineWidth = AXW / cam.k;
  c.beginPath();
  c.moveTo(x0, oy);
  c.lineTo(x1, oy);
  c.moveTo(ox, y0);
  c.lineTo(ox, y1);
  c.stroke();
  c.lineWidth = TKW / cam.k;
  c.beginPath();
  for (let i = i0; i <= i1; i++) {
    const x = ox + i * u;
    c.moveTo(x, oy);
    c.lineTo(x, oy + TKL / cam.k);
  }
  for (let j = j0; j <= j1; j++) {
    const y = oy + j * u;
    c.moveTo(ox, y);
    c.lineTo(ox - TKL / cam.k, y);
  }
  c.stroke();
  const uf = u / UNT;
  c.fillStyle = lite;
  c.globalAlpha = AL_LB;
  c.font = `${LBFS / cam.k}px ${FLEX}`;
  c.textAlign = "center";
  c.textBaseline = "top";
  for (let i = i0; i <= i1; i++) {
    const v = i * uf;
    if (v === 0) continue;
    c.fillText(String(v), ox + i * u, oy + (TKL + LBG) / cam.k);
  }
  c.textAlign = "right";
  c.textBaseline = "middle";
  for (let j = j0; j <= j1; j++) {
    const v = -j * uf;
    if (v === 0) continue;
    c.fillText(String(v), ox - (TKL + LBG) / cam.k, oy + j * u);
  }
  c.globalAlpha = 1;
  c.textAlign = "left";
  c.textBaseline = "alphabetic";
};
