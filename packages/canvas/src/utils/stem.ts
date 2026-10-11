import { BWT, FLEX } from "../config/animation";
import { STK } from "../config/symbol";

const REF = 96;
const cch = new Map<string, number>();

const scan = (bd?: boolean): number => {
  try {
    const cv = document.createElement("canvas");
    cv.width = REF * 2;
    cv.height = REF * 2;
    const c = cv.getContext("2d", { willReadFrequently: true });
    if (!c) return 0;
    c.fillStyle = "#fff";
    c.fillRect(0, 0, REF * 2, REF * 2);
    c.fillStyle = "#000";
    c.font = `${bd ? `${BWT} ` : ""}${REF}px ${FLEX}`;
    c.textBaseline = "alphabetic";
    c.fillText("I", REF / 2, (REF * 3) / 2);
    const d = c.getImageData(0, 0, REF * 2, REF * 2).data;
    const cov: number[] = [];
    for (let y = 0; y < REF * 2; y++) {
      let s = 0;
      for (let x = 0; x < REF * 2; x++) s += (255 - d[(y * REF * 2 + x) * 4]) / 255;
      if (s > 2) cov.push(s);
    }
    if (cov.length === 0) return 0;
    cov.sort((a, b) => a - b);
    return cov[cov.length >> 1] / REF;
  } catch {
    return 0;
  }
};

export const stemRt = (bd?: boolean): number => {
  if (!document.fonts.check(`${REF}px ${FLEX}`)) return STK;
  const key = bd ? "b" : "n";
  let v = cch.get(key);
  if (v === undefined) {
    v = scan(bd);
    cch.set(key, v);
  }
  return v > 0 ? v : STK;
};

export const stemWarm = (): void => {
  cch.clear();
  stemRt();
  stemRt(true);
};
