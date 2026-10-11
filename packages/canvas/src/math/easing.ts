export const clmp = (v: number, lo: number, hi: number): number =>
  v < lo ? lo : v > hi ? hi : v;

export const lrp = (a: number, b: number, u: number): number => a + (b - a) * u;

export const sstp = (lo: number, hi: number, v: number): number => {
  if (hi <= lo) return v >= hi ? 1 : 0;
  const u = clmp((v - lo) / (hi - lo), 0, 1);
  return u * u * (3 - 2 * u);
};

export const bmp = (u: number): number => 4 * u * (1 - u);

export const smo = (u: number): number => u * u * u * (u * (u * 6 - 15) + 10);

export const cub = (u: number): number =>
  u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;

export const otc = (u: number): number => 1 - Math.pow(1 - u, 3);

export const EZ: Record<string, (u: number) => number> = { smo, cub, otc };

export const r2 = (v: number): number => Math.round(v * 100) / 100;
