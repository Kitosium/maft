import { STK } from "../config/symbol";
import { BAR, HED, SFT } from "../config/tex";
import type { Rct } from "../types/glyph";

type Nat = (ch: string, size: number) => Rct;
type Emit = (ch: string, size: number, x: number, y: number, sx: number) => number;

const hlf = STK / 2;

const span = (n: Rct, size: number): number => n.w - STK * size;

export const barRow = (
  w: number,
  x: number,
  yc: number,
  size: number,
  nat: Nat,
  emit: Emit,
): void => {
  const n = nat(BAR, size);
  const sx = w > 0 && span(n, size) > 0 ? w / span(n, size) : 1;
  emit(BAR, size, x - (n.x + hlf * size) * sx, yc - (n.y + n.h / 2), sx);
};

export const vecRow = (
  w: number,
  x: number,
  ct: number,
  size: number,
  nat: Nat,
  emit: Emit,
): void => {
  const h = nat(HED, size);
  const ey = ct - h.y - h.h;
  const n = nat(SFT, size);
  const sx = w > 0 && span(n, size) > 0 ? w / span(n, size) : 1;
  emit(SFT, size, x - (n.x + hlf * size) * sx, ey, sx);
  emit(HED, size, x + w - (h.x + h.w - hlf * size), ey, 1);
};
