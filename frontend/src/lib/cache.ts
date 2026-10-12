type Entry = { data: unknown; at: number };

const mem = new Map<string, Entry>();
const KEY = "maft-cache-v1";
const TTL = 7 * 24 * 60 * 60 * 1000;

let hydrated = false;

export const cacheHydrate = (): void => {
  if (hydrated) return;
  hydrated = true;
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return;
    const pairs = JSON.parse(raw) as [string, Entry][];
    const now = Date.now();
    for (const [k, v] of pairs) {
      if (typeof v?.at === "number" && now - v.at < TTL) mem.set(k, v);
    }
  } catch {}
};

const persist = (): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(Array.from(mem.entries())));
  } catch {}
};

export const cacheRead = <T>(path: string): T | undefined =>
  mem.get(path)?.data as T | undefined;

export const cacheWrite = <T>(path: string, data: T): void => {
  mem.set(path, { data, at: Date.now() });
  persist();
};

export const cacheDrop = (path: string): void => {
  mem.delete(path);
  persist();
};

export const cacheDropPrefix = (prefix: string): void => {
  for (const key of Array.from(mem.keys())) {
    if (key.startsWith(prefix)) mem.delete(key);
  }
  persist();
};
