"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { getJson, postJson } from "../../lib/api";
import type { CategoryNode, User } from "../../types";

export type Thm = { bg: string; lite: string; cnt: string; spc: string };

const DARK: Thm = { bg: "#1e1e2e", lite: "#a6adc8", cnt: "#cdd6f4", spc: "#eba0ac" };
const LIGHT: Thm = { bg: "#ffffff", lite: "#6c6f85", cnt: "#1e1e2e", spc: "#c0455c" };

type AppCtx = {
  mode: string;
  setMode: (m: string) => void;
  thm: Thm;
  user: User | null;
  booting: boolean;
  reloadAuth: () => void;
  logout: () => Promise<void>;
  tree: CategoryNode[];
  treeLoading: boolean;
  reloadTree: () => void;
  favIds: Set<string>;
  toggleFav: (id: string) => Promise<boolean>;
};

const Ctx = createContext<AppCtx | null>(null);

export const useApp = (): AppCtx => {
  const v = useContext(Ctx);
  if (!v) throw new Error("app ctx missing");
  return v;
};

export const Providers = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState("dark");
  const [user, setUser] = useState<User | null>(null);
  const [booting, setBooting] = useState(true);
  const [tree, setTree] = useState<CategoryNode[]>([]);
  const [treeLoading, setTreeLoading] = useState(true);
  const [favIds, setFavIds] = useState<Set<string>>(new Set());
  const [authTick, setAuthTick] = useState(0);
  const [treeTick, setTreeTick] = useState(0);

  useEffect(() => {
    const cur = document.documentElement.dataset.theme;
    setMode(cur === "light" ? "light" : "dark");
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
    try {
      window.localStorage.setItem("maft-theme", mode);
    } catch {
      setMode(mode);
    }
  }, [mode]);

  useEffect(() => {
    let live = true;
    getJson<User | null>("/auth/me")
      .then((u) => {
        if (live) setUser(u);
      })
      .catch(() => {
        if (live) setUser(null);
      })
      .finally(() => {
        if (live) setBooting(false);
      });
    return () => {
      live = false;
    };
  }, [authTick]);

  useEffect(() => {
    let live = true;
    setTreeLoading(true);
    getJson<CategoryNode[]>("/categories")
      .then((t) => {
        if (live) setTree(t);
      })
      .catch(() => setTree([]))
      .finally(() => {
        if (live) setTreeLoading(false);
      });
    return () => {
      live = false;
    };
  }, [treeTick]);

  useEffect(() => {
    if (!user) {
      setFavIds(new Set());
      return;
    }
    let live = true;
    getJson<{ id: string }[]>("/favorites")
      .then((rows) => {
        if (live) setFavIds(new Set(rows.map((r) => r.id)));
      })
      .catch(() => setFavIds(new Set()));
    return () => {
      live = false;
    };
  }, [user, treeTick]);

  const reloadAuth = useCallback(() => setAuthTick((n) => n + 1), []);
  const reloadTree = useCallback(() => setTreeTick((n) => n + 1), []);

  const logout = useCallback(async () => {
    await postJson("/auth/logout");
    setUser(null);
  }, []);

  const toggleFav = useCallback(async (id: string) => {
    try {
      const r = await postJson<{ favorited: boolean }>("/favorites", {
        formulaId: id,
      });
      setFavIds((prev) => {
        const next = new Set(prev);
        if (r.favorited) next.add(id);
        else next.delete(id);
        return next;
      });
      return r.favorited;
    } catch {
      return false;
    }
  }, []);

  const thm = mode === "light" ? LIGHT : DARK;

  const value = useMemo<AppCtx>(
    () => ({
      mode,
      setMode,
      thm,
      user,
      booting,
      reloadAuth,
      logout,
      tree,
      treeLoading,
      reloadTree,
      favIds,
      toggleFav,
    }),
    [
      mode,
      thm,
      user,
      booting,
      reloadAuth,
      logout,
      tree,
      treeLoading,
      reloadTree,
      favIds,
      toggleFav,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};
