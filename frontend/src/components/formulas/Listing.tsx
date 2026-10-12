"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { FormulaCard } from "./Card";
import { useApp } from "../ui/Providers";
import { delJson } from "../../lib/api";
import { cacheDrop } from "../../lib/cache";
import { useCachedGet } from "../../hooks/useCachedGet";
import type { FavoriteItem, HistoryItem } from "../../types";
import { useDocTitle } from "../../hooks/useDocTitle";
import { CardSk, Sk } from "../ui/Skeleton";

type P = { kind: "favorites" | "history" };

export function ListPage({ kind }: P) {
  const router = useRouter();
  const { user, booting, favIds, toggleFav } = useApp();
  const admin = user?.role === "ADMIN";
  const [tick, setTick] = useState(0);

  const path = kind === "favorites" ? "/favorites" : "/history";
  const title = kind === "favorites" ? "Yêu thích" : "Lịch sử";
  useDocTitle(title);

  const { data, loading } = useCachedGet<(FavoriteItem | HistoryItem)[]>(
    path,
    tick,
    !!user
  );
  const rows = data ?? [];

  const reload = useCallback(() => {
    cacheDrop(path);
    setTick((n) => n + 1);
  }, [path]);

  const remove = async (id: string, name: string): Promise<void> => {
    if (!window.confirm(`Xóa "${name}"?`)) return;
    try {
      await delJson(`/formulas/${id}`);
      reload();
    } catch {
      window.alert("Xóa thất bại.");
    }
  };

  if (booting) {
    return (
      <div className="max-w-7xl flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <Sk className="h-7 w-28" />
        </div>
        <div className="masonry columns-1 md:columns-2 xl:columns-3">
          {Array.from({ length: 6 }, (_, i) => (
            <CardSk key={`boot-${i}`} admin={admin} />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto text-center flex flex-col gap-4 py-16">
        <h1 className="text-2xl font-bold m-0" style={{ color: "var(--cnt)" }}>
          {title}
        </h1>
        <p className="text-sm m-0" style={{ color: "var(--lite)" }}>
          Đăng nhập bằng Google để lưu công thức yêu thích và xem lịch sử tra cứu.
        </p>
        <Link
          href="/login"
          className="text-sm px-5 py-2.5 border no-underline self-center"
          style={{
            borderColor: "color-mix(in srgb, var(--spc) 60%, transparent)",
            color: "var(--spc)",
            background: "color-mix(in srgb, var(--spc) 14%, transparent)",
          }}
        >
          Đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl flex flex-col gap-5">
      <header className="flex items-center gap-3">
        <h1 className="text-2xl font-bold m-0" style={{ color: "var(--cnt)" }}>
          {title}
        </h1>
        <span className="text-sm" style={{ color: "var(--lite)" }}>
          {loading ? "" : `${rows.length} công thức`}
        </span>
      </header>

      <div className="masonry columns-1 md:columns-2 xl:columns-3">
        {loading
          ? Array.from({ length: 6 }, (_, i) => <CardSk key={`lsk-${i}`} admin={admin} />)
          : rows.map((f, i) => (
              <FormulaCard
                key={f.id}
                f={f}
                n={i + 1}
                favorited={favIds.has(f.id)}
                onFav={() => void toggleFav(f.id)}
                onEdit={() => router.push(`/c/${f.category.slug}`)}
                onDelete={() => void remove(f.id, f.title)}
              />
            ))}
      </div>

      {!loading && rows.length === 0 && (
        <div className="text-sm py-8 text-center" style={{ color: "var(--lite)" }}>
          {kind === "favorites"
            ? "Chưa có công thức yêu thích — bấm ngôi sao trên thẻ công thức."
            : "Chưa có lịch sử — lịch sử được ghi khi bạn sao chép công thức."}
        </div>
      )}
    </div>
  );
}

