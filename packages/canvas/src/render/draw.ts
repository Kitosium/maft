import type { Drw, Lyr, Vew } from "../types/glyph";
import { g3d } from "./spatial";
import { oxy } from "./coordinate";
import { trf } from "../math/transform";

const LYR: Record<Vew, Lyr> = { trf, oxy, g3d, stat: trf };

export const drw = (cv: HTMLCanvasElement, st: Drw): void => {
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  if (w <= 0 || h <= 0) return;
  const dpr = window.devicePixelRatio || 1;
  const pw = Math.round(w * dpr);
  const ph = Math.round(h * dpr);
  if (cv.width !== pw || cv.height !== ph) {
    cv.width = pw;
    cv.height = ph;
  }
  const c = cv.getContext("2d");
  if (!c) throw new Error("drw: ctx missing");
  c.setTransform(pw / w, 0, 0, ph / h, 0, 0);
  c.clearRect(0, 0, w, h);
  c.save();
  c.translate(st.cam.x, st.cam.y);
  c.scale(st.cam.k, st.cam.k);
  LYR[st.vew](c, w, h, st);
  c.restore();
};
