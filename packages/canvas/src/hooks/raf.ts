import { useCallback, useEffect, useRef, useState } from "react";
import { clmp } from "../math/easing";

export type Raf = {
  t: number;
  run: boolean;
  play: () => void;
  pause: () => void;
  repl: () => void;
  seek: (p: number) => void;
};

export const useRaf = (tot: number): Raf => {
  const [t, setT] = useState(0);
  const [run, setRun] = useState(false);
  const tr = useRef(0);
  const t0 = useRef(0);
  const id = useRef(0);

  const set = useCallback((v: number): void => {
    tr.current = v;
    setT(v);
  }, []);

  const step = useCallback(
    (now: number): void => {
      const v = clmp((now - t0.current) / 1000, 0, tot);
      set(v);
      if (v >= tot) {
        id.current = 0;
        setRun(false);
        return;
      }
      id.current = requestAnimationFrame(step);
    },
    [set, tot],
  );

  const play = useCallback((): void => {
    if (id.current) return;
    if (tr.current >= tot) set(0);
    t0.current = performance.now() - tr.current * 1000;
    setRun(true);
    id.current = requestAnimationFrame(step);
  }, [set, step, tot]);

  const pause = useCallback((): void => {
    if (id.current) cancelAnimationFrame(id.current);
    id.current = 0;
    setRun(false);
  }, []);

  const repl = useCallback((): void => {
    if (id.current) cancelAnimationFrame(id.current);
    set(0);
    t0.current = performance.now();
    setRun(true);
    id.current = requestAnimationFrame(step);
  }, [set, step]);

  const seek = useCallback(
    (p: number): void => {
      const v = clmp(p, 0, 1) * tot;
      set(v);
      if (id.current) t0.current = performance.now() - v * 1000;
    },
    [set, tot],
  );

  useEffect(
    () => () => {
      if (id.current) cancelAnimationFrame(id.current);
    },
    [],
  );

  return { t, run, play, pause, repl, seek };
};
