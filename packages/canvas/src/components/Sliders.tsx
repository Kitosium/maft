import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { PTK, PSW, SLDV, SLMN, SLMX, SLST } from "../config/animation";
import type { Rng } from "../types/glyph";

type SlProps = {
  prm: string[];
  rg?: Record<string, Rng>;
  onPv: (v: Record<string, number>) => void;
};

export const Sliders = ({ prm, rg, onPv }: SlProps): ReactElement => {
  const [pv, setPv] = useState<Record<string, number>>({});
  const [sw, setSw] = useState<string | null>(null);
  const [cs, setCs] = useState(false);
  const rng = (k: string): Rng => rg?.[k] ?? [SLMN, SLMX];
  const vOf = (k: string): number => {
    const v = pv[k];
    if (v !== undefined) return v;
    const [lo, hi, d0] = rng(k);
    return Math.min(Math.max(d0 ?? SLDV, lo), hi);
  };
  const pc = (k: string): number => {
    const [lo, hi] = rng(k);
    return hi > lo ? Math.min(Math.max((vOf(k) - lo) / (hi - lo), 0), 1) : 1;
  };
  const lab = (s: string): ReactElement => {
    const i = s.search(/[\d_]/);
    if (i < 1) return <>{s}</>;
    return (
      <>
        {s.slice(0, i)}
        <sub>{s.slice(i).replace(/^_/, "")}</sub>
      </>
    );
  };
  useEffect(() => {
    const o: Record<string, number> = {};
    for (const k of prm) o[k] = vOf(k);
    onPv(o);
  }, [pv, prm, rg]);
  useEffect(() => {
    if (!sw) return;
    const [lo, hi] = rng(sw);
    let x = lo;
    setPv((v) => ({ ...v, [sw]: lo }));
    const stp = ((hi - lo) * PTK) / (PSW * 1000);
    const id = setInterval(() => {
      x = Math.min(Math.round((x + stp) * 100) / 100, hi);
      setPv((v) => ({ ...v, [sw]: x }));
      if (x >= hi) setSw(null);
    }, PTK);
    return () => clearInterval(id);
  }, [sw]);
  return (
    <div className="sls absolute top-[8px] right-[8px] flex gap-[4px] items-start">
      <button
        type="button"
        className="slt grid place-items-center w-[20px] h-[20px] p-0 mt-[3px] border
          [border-color:color-mix(in_srgb,#eba0ac_55%,transparent)] [color:#eba0ac]
          [background-color:#45475a] cursor-pointer
          hover:[border-color:#eba0ac]
          hover:[background-color:color-mix(in_srgb,#eba0ac_20%,#45475a)]
          focus-visible:[outline:2px_solid_#eba0ac] focus-visible:outline-offset-[2px]"
        aria-label={cs ? "Mở thanh trượt" : "Thu thanh trượt"}
        aria-expanded={!cs}
        onClick={() => setCs((v) => !v)}
      >
        {cs ? (
          <svg viewBox="0 0 16 16" width="10" height="10" aria-hidden="true">
            <path d="M5 3.2 12.4 8 5 12.8Z" fill="currentColor" />
          </svg>
        ) : (
          <svg viewBox="0 0 16 16" width="10" height="10" aria-hidden="true">
            <path d="M11 3.2 3.6 8 11 12.8Z" fill="currentColor" />
          </svg>
        )}
      </button>
      {!cs && (
        <div className="slk flex flex-col gap-[4px] items-end">
          {prm.map((k) => {
            return (
              <div className="sld flex items-center gap-[6px] py-[3px] pl-[9px] pr-[3px] border
                [border-color:#585b70] font-ui [color:#cdd6f4]
                [background-color:#313244]
                text-[12px] leading-[1.2]" key={k}>
                <span className="slb [color:#eba0ac] font-semibold min-w-[2.2em] text-left
                  [&_sub]:text-[0.7em] [&_sub]:leading-[0] [&_sub]:bottom-auto
                  [&_sub]:[vertical-align:sub]">{lab(k)}</span>
                <span className="slc relative w-[132px] h-[9px] before:content-['']
                  before:absolute before:left-0 before:right-0 before:top-1/2
                  before:h-[2px] before:-translate-y-1/2
                  before:[background-color:#6c7086]
                  [&>b]:[background-color:#eba0ac] [&>b]:absolute [&>b]:left-0
                  [&>b]:top-0 [&>b]:h-full
                  has-[.slr:focus-visible]:[outline:2px_solid_#eba0ac]
                  has-[.slr:focus-visible]:outline-offset-[3px]">
                  <b style={{ width: `${pc(k) * 100}%` }} />
                  <input
                    type="range"
                    className="slr absolute inset-0 w-full h-full m-0 opacity-0 cursor-pointer"
                    min={rng(k)[0]}
                    max={rng(k)[1]}
                    step={SLST}
                    value={vOf(k)}
                    aria-label={`Tham số ${k}`}
                    onChange={(e) => {
                      setSw(null);
                      setPv((v) => ({ ...v, [k]: Number(e.target.value) }));
                    }}
                  />
                </span>
                <span
                  className="slv [color:#bac2de] min-w-[3em] text-right tabular-nums"
                >{Math.round(vOf(k) * 100) / 100}</span>
                <button
                  type="button"
                  className="slp grid place-items-center w-[20px] h-[20px] p-0 border
                    [border-color:color-mix(in_srgb,#eba0ac_55%,transparent)] [color:#eba0ac]
                    [background-color:#45475a] cursor-pointer
                    hover:[border-color:#eba0ac]
                    hover:[background-color:color-mix(in_srgb,#eba0ac_20%,#45475a)]
                    focus-visible:[outline:2px_solid_#eba0ac] focus-visible:outline-offset-[2px]"
                  aria-label={sw === k ? `Dừng ${k}` : `Chạy ${k}`}
                  onClick={() => setSw((s) => (s === k ? null : k))}
                >
                  {sw === k ? (
                    <svg viewBox="0 0 16 16" width="10" height="10" aria-hidden="true">
                      <rect x="4" y="3.5" width="3" height="9" fill="currentColor" />
                      <rect x="9" y="3.5" width="3" height="9" fill="currentColor" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 16 16" width="10" height="10" aria-hidden="true">
                      <path d="M5 3.2 12.4 8 5 12.8Z" fill="currentColor" />
                    </svg>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
