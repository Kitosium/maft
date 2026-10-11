import { WRAP } from "../config/tex";
import { relOf } from "./wrap";

const DCM = "\\begin{document}";
const DCE = "\\end{document}";
const TKZ = /\\begin\{tikzpicture\}[\s\S]*?\\end\{tikzpicture\}/g;
const CMT = /(^|[^\\])%[^\n]*/g;
const PRB =
  /^(\\usepackage|\\documentclass|\\setlength|\\babel|\\babelfont|\\setlist)/;
const MTH = /\\\[([\s\S]*?)\\\]/g;
const OPN = /\\(?:begin|end)\{[a-zA-Z*]+\}/g;
const SEP = "\u0001";
const IND = "\\quad ";
const HNG = "\\quad\\quad ";

const mthRow = (r: string): string => {
  const b0 = r.replace(/^\[[^\]]*\]/, "");
  const hd = /^\s*&/.test(b0);
  const b = b0.replace(/&/g, " ").replace(/\s+/g, " ").trim();
  if (!b) return "";
  if (b.startsWith("\\quad") && !hd) return b;
  return (hd ? HNG : IND) + b;
};

const rowsOf = (b: string): string[] => {
  const rs = b.split(/\\\\/);
  if (rs.length > 1 && (rs[rs.length - 1] ?? "").trim() === "") rs.pop();
  return rs.map(mthRow);
};

const envRw = (s: string, n: string): string => {
  const re = new RegExp(
    `\\\\begin\\{${n}\\*?\\}([\\s\\S]*?)\\\\end\\{${n}\\*?\\}`,
    "g",
  );
  return s.replace(re, (_m: string, b: string) => rowsOf(b).join(SEP));
};

const itmRw = (s: string): string =>
  s.replace(/\\begin\{itemize\}([\s\S]*?)\\end\{itemize\}/g, (_m: string, b: string) =>
    b
      .split("\\item")
      .map((r) => r.trim())
      .filter((r) => r.length > 0)
      .map((r) => `• ${r}`)
      .join("\n"),
  );

const dspRw = (s: string): string =>
  s.replace(MTH, (_m: string, b: string) =>
    b.split(SEP).flatMap(rowsOf).join("\n"),
  );

const cnt = (s: string, k: string): number => s.split(k).length - 1;

const wrpOf = (s: string, n: number): string[] => {
  const out: string[] = [];
  let cur = "";
  let d = 0;
  for (const w of s.split(" ")) {
    if (cur && d === 0 && cur.length + w.length + 1 > n && !relOf(cur, w)) {
      out.push(cur);
      cur = w;
    } else {
      cur = cur ? `${cur} ${w}` : w;
    }
    d += cnt(w, "\\left") - cnt(w, "\\right");
    for (const c of w) d += c === "{" ? 1 : c === "}" ? -1 : 0;
  }
  if (cur) out.push(cur);
  if (!s.startsWith(IND)) return out;
  return out.map((r, i) => (i > 0 ? IND + r : r));
};

export function lnsOf(src: string): string[] {
  let s = src;
  const d = s.indexOf(DCM);
  if (d >= 0) s = s.slice(d + DCM.length);
  const e = s.indexOf(DCE);
  if (e >= 0) s = s.slice(0, e);
  s = s.replace(TKZ, "\n").replace(CMT, "$1");
  s = envRw(s, "align");
  s = envRw(s, "aligned");
  s = envRw(s, "gather");
  s = itmRw(s);
  s = dspRw(s);
  s = s.split(SEP).join("\n");
  return s
    .split("\n")
    .map((l) => l.trim().replace(OPN, ""))
    .flatMap((l) =>
      l.length === 0 ? ["\\quad"]
      : PRB.test(l) ? []
      : wrpOf(l.replace(/\$/g, "").trim(), WRAP),
    );
}
