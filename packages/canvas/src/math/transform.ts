import { BWT, FLEX, FS } from "../config/animation";
import type { Drw } from "../types/glyph";
import { frmAt } from "../utils/actor";
import { symDrw, symOf } from "../symbols/table";

export const trf = (
  c: CanvasRenderingContext2D,
  _w: number,
  _h: number,
  st: Drw,
): void => {
  c.fillStyle = st.ink;
  c.strokeStyle = st.ink;
  for (const a of st.ac) {
    const f = frmAt(a, st.t);
    if (f.o <= 0) continue;
    const fs = FS * f.s;
    c.save();
    c.globalAlpha = f.o;
    c.font = `${a.it ? "italic " : ""}${a.bd ? `${BWT} ` : ""}${fs}px ${FLEX}`;
    c.translate(f.x - a.lp[0] * f.sx * fs, f.y - a.lp[1] * fs);
    const s = symOf(a.ch);
    if (s) symDrw(c, s, fs, st.fs, f.sx, a.bd);
    else {
      if (f.sx !== 1) c.scale(f.sx, 1);
      c.fillText(a.ch, 0, 0);
    }
    c.restore();
  }
};
