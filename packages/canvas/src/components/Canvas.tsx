"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ReactElement } from "react";
import {
  CFG, DEF, DEB, FS, FS_D, FS_MN,
  PAD, PAD_F, seqOf,
} from "../config/animation";
import { useRaf } from "../hooks/raf";
import type { Aln, Cam, Cfg, Cnt, Drg, Gr, Mea, Mm, Pr, Seq, Thm } from "../types/glyph";
import { eqOf, geoOf, layNod, wldPos } from "../utils/layout";
import { grfOf } from "../utils/graph";
import { prmOf } from "../math/expression";
import { bldMap, cntOf } from "../utils/map";
import { bldAct, bldStat, stepOf } from "../utils/actor";
import { drw } from "../render/draw";
import { tex } from "../utils/tex";
import { thmOf } from "../utils/theme";
import { stemWarm } from "../utils/stem";
import { rowOf } from "../utils/wrap";
import { Sliders } from "./Sliders";

const spl = (s: string): string[] =>
  s
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

const bldMes = (ls: string[], fs: number, pad: number, w: number, aln: Aln) => {
  const lns = ls.map((l) => layNod(tex(l), FS));
  const lys = lns.map((n) => n.ly);
  const eqs = aln === "eq" ? lns.map((n) => eqOf(n.gs, n.ly)) : undefined;
  const g = geoOf(lys, fs, pad, w, eqs);
  const mes = lns.map((n, i) => ({
    gs: n.gs,
    ly: n.ly,
    ps: wldPos(n.gs, n.ly, g.k, g.by[i], pad, w, aln, eqs?.[i], g.eqx),
  }));
  return { mes, h: g.h };
};

export const MaftCanvas = (p: Pr): ReactElement => {
  const key = JSON.stringify(p.cfg ?? null);
  const c: Cfg = useMemo(
    () => ({ ...CFG, ...(JSON.parse(key) as Partial<Cfg> | null) }),
    [key],
  );
  const thk = JSON.stringify(p.thm ?? null);
  const thm: Thm = useMemo(
    () => thmOf(JSON.parse(thk) as Partial<Thm> | null),
    [thk],
  );
  const fs = Math.max(p.fs ?? FS_D, FS_MN);
  const vw = p.vew ?? "trf";
  const fml = vw === "trf" || vw === "stat";
  const pad = Math.max(p.pad ?? (fml ? PAD_F : PAD), 0);
  const pann = vw === "oxy" || vw === "g3d";
  const aln: Aln = p.aln ?? (fml ? "lft" : "ctr");
  const txt = p.txt ?? DEF;
  const [src, setSrc] = useState(txt);
  const [mes, setMes] = useState<Mea[] | null>(null);
  const [hh, setHh] = useState(0);
  const lss = useMemo(() => spl(src), [src]);
  const grf = useMemo(
    () => lss.map((l) => grfOf(l)).filter((g): g is Gr => g !== null),
    [lss],
  );
  const prms = useMemo(() => {
    const o: string[] = [];
    for (const g of grf) for (const v of prmOf(g)) if (!o.includes(v)) o.push(v);
    return o;
  }, [grf]);
  const [pv, setPv] = useState<Record<string, number>>({});
  const [fo, setFo] = useState(0);
  const cr = useRef<HTMLCanvasElement | null>(null);
  const [rz, setRz] = useState(0);
  const [cam, setCam] = useState<Cam>({ x: 0, y: 0, k: 1 });
  const dg = useRef<Drg | null>(null);

  useEffect(() => {
    let live = true;
    Promise.all([
      document.fonts.load(
        `${FS}px "Google Sans Flex"`,
        "Đặt là độ dài bán kính đường tròn nội tiếp, vectơ tích vô hướng",
      ),
    ])
      .catch(() => undefined)
      .then(() => {
        stemWarm();
        if (live) setFo((n) => n + 1);
      });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    const id = setTimeout(() => setSrc(txt), DEB);
    return () => clearTimeout(id);
  }, [txt]);

  useEffect(() => {
    const el = cr.current;
    if (!el) return;
    const on = (): void => setRz((n) => n + 1);
    window.addEventListener("resize", on);
    let last = el.clientWidth;
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        const w = el.clientWidth;
        if (w !== last) {
          last = w;
          setRz((n) => n + 1);
        }
      });
      ro.observe(el);
    }
    return () => {
      window.removeEventListener("resize", on);
      if (ro) ro.disconnect();
    };
  }, []);

  const sg = useRef("");
  useLayoutEffect(() => {
    const el = cr.current;
    const w = el ? el.clientWidth : 0;
    if (w <= 0) return;
    const ls =
      vw === "trf" || vw === "stat" ? rowOf(lss, fs, w - 2 * pad) : lss;
    const r = bldMes(ls, fs, pad, w, aln);
    const sig = w + "|" + r.h + "|" + r.mes.length + "|" + fo;
    if (sig === sg.current) return;
    sg.current = sig;
    setMes(r.mes);
    setHh(r.h);
  }, [lss, fo, fs, pad, rz, aln, vw]);

  const mms = useMemo<Mm[] | null>(() => {
    if (!mes || mes.length < 2) return null;
    return mes.slice(0, -1).map((a, i) => bldMap(a, mes[i + 1]));
  }, [mes]);

  const sq = useMemo<Seq | null>(() => {
    if (!mms) return null;
    const cs: Cnt[] = mms.map(cntOf);
    return seqOf(cs, c);
  }, [mms, c]);

  const ac = useMemo(() => {
    if (!mes) return null;
    if (mes.length === 1) return bldStat(mes[0]);
    if (!mms || !sq) return null;
    return bldAct(mes, mms, sq, c);
  }, [mes, mms, sq, c]);
  const tot = sq?.tot ?? 0;
  const { t, run, play, pause, repl, seek } = useRaf(tot);

  useEffect(() => {
    if (vw === "stat") {
      pause();
      seek(1);
    } else if (ac && tot > 0 && vw === "trf") repl();
    else {
      pause();
      seek(0);
    }
  }, [ac, tot, vw, repl, pause, seek]);

  useLayoutEffect(() => {
    if (cr.current)
      drw(cr.current, {
        ac: ac ?? [],
        t,
        fs,
        ink: thm.cnt,
        lite: thm.lite,
        spc: thm.spc,
        cam,
        vew: vw,
        grf,
        prm: pv,
      });
  }, [ac, t, rz, thm.cnt, thm.lite, thm.spc, cam, vw, grf, pv]);

  const n = lss.length;
  const sn = sq ? Math.min(stepOf(sq, t) + 1, n) : n === 1 ? 1 : 0;
  const pr = tot > 0 ? t / tot : 0;
  const done = tot > 0 && pr >= 1;
  const alt =
    n > 0
      ? `Bước ${sn}/${n}: ${lss[sn - 1] ?? ""}`
      : "Chưa có lời giải";

  return (
    <div className="stg relative [border-color:color-mix(in_srgb,var(--cnt)_14%,transparent)]
      border [background-color:var(--bg)] overflow-hidden">
      <canvas
        ref={cr}
        className={`cv block w-full aspect-[1000/320] ${
          pann ? "cursor-grab active:cursor-grabbing touch-none" : ""
        }`}
        style={hh > 0 ? { height: `${hh}px` } : undefined}
        role="img"
        aria-label={alt}
        onPointerDown={(e) => {
          if (!pann) return;
          dg.current = { x: e.clientX, y: e.clientY, cx: cam.x, cy: cam.y };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          const d = dg.current;
          if (!d) return;
          setCam({ x: d.cx + e.clientX - d.x, y: d.cy + e.clientY - d.y, k: cam.k });
        }}
        onPointerUp={() => {
          dg.current = null;
        }}
        onPointerCancel={() => {
          dg.current = null;
        }}
      />
      {vw === "trf" && (
        <button
          type="button"
          className="pbt absolute top-[8px] right-[8px] grid place-items-center w-[30px] h-[30px]
            p-0 border cursor-pointer [color:var(--spc)]
            [border-color:color-mix(in_srgb,var(--spc)_55%,transparent)]
            [background-color:color-mix(in_srgb,var(--spc)_10%,var(--bg))]
            transition-colors duration-150
            hover:not-disabled:[border-color:var(--spc)]
            hover:not-disabled:[background-color:color-mix(in_srgb,var(--spc)_20%,var(--bg))]
            focus-visible:[outline:2px_solid_var(--spc)] focus-visible:outline-offset-[2px]
            disabled:opacity-[0.35] disabled:cursor-not-allowed"
          onClick={run ? pause : done ? repl : play}
          disabled={tot <= 0}
          aria-label={run ? "Tạm dừng" : done ? "Phát lại" : "Phát animation"}
        >
          {run ? (
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <rect x="4" y="3.5" width="3" height="9" fill="currentColor" />
              <rect x="9" y="3.5" width="3" height="9" fill="currentColor" />
            </svg>
          ) : done ? (
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <path
                d="M13.2 8a5.2 5.2 0 1 1-1.6-3.7"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
              <path
                d="M13.4 1.6v3.4H10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <path d="M5 3.2 12.4 8 5 12.8Z" fill="currentColor" />
            </svg>
          )}
        </button>
      )}
      {vw === "oxy" && prms.length > 0 && (
        <Sliders prm={prms} rg={p.rg} onPv={setPv} />
      )}
    </div>
  );
};
