import { THM } from "../config/animation";
import type { Thm } from "../types/glyph";

export const thmOf = (t: Partial<Thm> | null): Thm => ({
  ...THM,
  ...(t ?? {}),
});
