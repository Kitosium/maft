import { layNod } from "./layout";
import { tex } from "./tex";

const NAM =
  "le|leq|ge|geq|ne|neq|approx|equiv|sim|simeq|cong|perp|parallel|" +
  "subset|subseteq|supset|supseteq|in|notin";
const OP = "=|<|>|≤|≥|≠|⊥|∥|≈|≡|∼|≅|∈|⊂|⊆|⊃|⊇";
const RL = new RegExp(`(${OP}|\\\\(${NAM})(?![a-zA-Z]))$`);
const RS = new RegExp(`^(${OP}|\\\\(${NAM})(?![a-zA-Z]))`);
const BUL = "• ";
const IND = "\\quad ";
const MWD = 60;

export const relOf = (a: string, b: string): boolean =>
  RL.test(a.trimEnd()) || RS.test(b);

export const brkOf = (s: string): number[] => {
  const out: number[] = [];
  let d = 0;
  let e = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "\\") {
      if (s.startsWith("\\left", i)) {
        d++;
        i += 4;
        continue;
      }
      if (s.startsWith("\\right", i)) {
        d--;
        i += 5;
        continue;
      }
      if (s.startsWith("\\begin", i)) {
        e += 1;
        i += 5;
        continue;
      }
      if (s.startsWith("\\end", i)) {
        e = Math.max(0, e - 1);
        i += 3;
        continue;
      }
    }
    if (c === "{") d++;
    else if (c === "}") d--;
    else if (c === " " && d === 0 && e === 0 && !relOf(s.slice(0, i), s.slice(i + 1)))
      out.push(i);
  }
  return out;
};

const wdOf = (s: string, fs: number): number => layNod(tex(s), fs).ly.bw;

const wrpW = (s: string, fs: number, max: number): string[] => {
  const out: string[] = [];
  let pre = "";
  let rest = s;
  for (;;) {
    if (rest.length === 0 || wdOf(pre + rest, fs) <= max) {
      out.push(pre + rest);
      break;
    }
    let cut = -1;
    for (const i of brkOf(rest)) {
      if (wdOf(pre + rest.slice(0, i), fs) > max) break;
      cut = i;
    }
    if (cut < 0) {
      out.push(pre + rest);
      break;
    }
    out.push(pre + rest.slice(0, cut));
    rest = rest.slice(cut + 1);
    pre = IND;
  }
  return out;
};

export const rowOf = (ls: string[], fs: number, max: number): string[] => {
  const out: string[] = [];
  for (const l of ls) {
    const b = /^\\item\s+/.test(l) || /^[-–—]\s+/.test(l);
    const s = l.replace(/^\\item\s+/, "").replace(/^[-–—]\s+/, "").trim();
    if (!s) continue;
    out.push(...wrpW((b ? BUL : "") + s, fs, Math.max(MWD, max)));
  }
  return out;
};
