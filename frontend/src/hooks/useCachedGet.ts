import { useEffect, useState } from "react";
import { getJson } from "../lib/api";
import { cacheHydrate, cacheRead, cacheWrite } from "../lib/cache";

type Cached<T> = { data: T | null; loading: boolean; error: boolean };

export const useCachedGet = <T>(
  path: string,
  version = 0,
  enabled = true
): Cached<T> => {
  const [data, setData] = useState<T | null>(() =>
    enabled ? (cacheRead<T>(path) ?? null) : null
  );
  const [loading, setLoading] = useState(() =>
    enabled ? cacheRead<T>(path) === undefined : false
  );
  const [error, setError] = useState(false);

  useEffect(() => {
    cacheHydrate();
    if (!enabled) {
      setData(null);
      setLoading(false);
      setError(false);
      return;
    }
    const hit = cacheRead<T>(path);
    setData(hit ?? null);
    setLoading(hit === undefined);
    setError(false);
    let live = true;
    getJson<T>(path)
      .then((r) => {
        cacheWrite(path, r);
        if (live) {
          setData(r);
          setLoading(false);
        }
      })
      .catch(() => {
        if (live) {
          setError(true);
          setLoading(false);
        }
      });
    return () => {
      live = false;
    };
  }, [path, version, enabled]);

  return { data, loading, error };
};
