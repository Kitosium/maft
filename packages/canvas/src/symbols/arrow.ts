import { GAP_R } from "../config/symbol";
import type { Pt, Shp } from "../types/glyph";
import { shp } from "./shape";

const hd = (tx: number, ty: number, d: number): Pt[] => [
  [tx - 0.2 * d, ty - 0.16],
  [tx, ty],
  [tx - 0.2 * d, ty + 0.16],
];

const hv = (tx: number, ty: number, d: number): Pt[] => [
  [tx - 0.16, ty - 0.2 * d],
  [tx, ty],
  [tx + 0.16, ty - 0.2 * d],
];

const dbl = (w: number): Pt[][] => [
  [[0, -0.39], [w, -0.39]],
  [[0, -0.21], [w, -0.21]],
];

export const ARR: Record<string, Shp> = {
  "↔": shp({ g: GAP_R, l: [[[0, -0.3], [0.6, -0.3]], hd(0, -0.3, -1), hd(0.6, -0.3, 1)] }),
  "↑": shp({ g: GAP_R, l: [[[0.3, -0.74], [0.3, 0.1]], hv(0.3, -0.74, -1)] }),
  "↓": shp({ g: GAP_R, l: [[[0.3, -0.72], [0.3, 0.12]], hv(0.3, 0.12, 1)] }),
  "↕": shp({
    g: GAP_R,
    l: [[[0.3, -0.74], [0.3, 0.12]], hv(0.3, -0.74, -1), hv(0.3, 0.12, 1)],
  }),
  "⇒": shp({ g: GAP_R, l: [...dbl(0.56), hd(0.58, -0.3, 1)] }),
  "⇐": shp({ g: GAP_R, l: [...dbl(0.6), hd(0.02, -0.3, -1)] }),
  "⇔": shp({ g: GAP_R, l: [...dbl(0.6), hd(0, -0.3, -1), hd(0.6, -0.3, 1)] }),
  "↦": shp({
    g: GAP_R,
    l: [[[0, -0.3], [0.56, -0.3]], [[0.56, -0.56], [0.56, -0.04]]],
  }),
  "⟶": shp({ g: GAP_R, l: [[[0, -0.3], [0.72, -0.3]], hd(0.72, -0.3, 1)] }),
  "⟵": shp({ g: GAP_R, l: [[[0, -0.3], [0.72, -0.3]], hd(0, -0.3, -1)] }),
  "⟹": shp({ g: GAP_R, l: [...dbl(0.72), hd(0.72, -0.3, 1)] }),
  "⟸": shp({ g: GAP_R, l: [...dbl(0.72), hd(0, -0.3, -1)] }),
  "⟺": shp({ g: GAP_R, l: [...dbl(0.72), hd(0, -0.3, -1), hd(0.72, -0.3, 1)] }),
};
