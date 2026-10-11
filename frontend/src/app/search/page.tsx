"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useDocTitle } from "../../lib/title";
import { FormulaCard } from "../../components/formulas/Card";
import { IcSearch } from "../../components/ui/Icons";
import { useApp } from "../../components/ui/Providers";
import { CardSk } from "../../components/ui/Skeleton";
import { delJson, getJson } from "../../lib/api";
import type { Formula } from "../../types";

function SearchInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const { user, favIds, toggleFav } = useApp();
  const admin = user?.role === "ADMIN";
  const initial = sp.get("q") ?? "";
  const [q, setQ] = useState(initial);
  const [rows, setRows] = useState<Formula[]>([]);
  const [tick, setTick] = useState(0);
  const [loading, setLoading] = useState(false);
  useDocTitle("Tìm kiếm");

  useEffect(() => {
    setQ(initial);
    let live = true;
    const term = initial.trim();
    if (!term) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    getJson<Formula[]>(`/formulas?q=${encodeURIComponent(term)}`)
      .then((r) => {
        if (live) setRows(r);
      })
      .catch(() => {
        if (live) setRows([]);
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [initial, tick]);

  const reload = useCallback(() => setTick((n) => n + 1), []);

  const remove = async (f: Formula): Promise<void> => {
    if (!window.confirm(`Xóa "${f.title}"?`)) return;
    try {
      await delJson(`/formulas/${f.id}`);
      reload();
    } catch {
      window.alert("Xóa thất bại.");
    }
  };

  const submit = (): void => {
    const term = q.trim();
    router.push(term ? `/search?q=${encodeURIComponent(term)}` : "/search");
  };

  return (
    <div className="max-w-7xl flex flex-col gap-5">
      <div
        className="flex items-center gap-2 border px-4 h-12"
        style={{ background: "var(--surface)", borderColor: "var(--line)" }}
      >
        <IcSearch className="w-5 h-5 shrink-0" style={{ color: "var(--lite)" }} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder="Tìm kiếm công thức, ví dụ... (VD: đạo hàm, tan giác...)"
          className="flex-1 bg-transparent border-0 outline-none text-sm"
          style={{ color: "var(--cnt)" }}
        />
        <button
          type="button"
          onClick={submit}
          className="text-sm px-4 py-1.5 border cursor-pointer shrink-0"
          style={{
            borderColor: "color-mix(in srgb, var(--spc) 60%, transparent)",
            color: "var(--spc)",
            background: "color-mix(in srgb, var(--spc) 14%, transparent)",
          }}
        >
          Tìm
        </button>
      </div>

      <div className="text-sm" style={{ color: "var(--lite)" }}>
        {initial.trim()
          ? loading
            ? "Đang tìm..."
            : `${rows.length} kết quả cho "${initial.trim()}"`
          : "Nhập từ khóa để tìm kiếm công thức."}
      </div>

      <div className="masonry columns-1 md:columns-2 xl:columns-3">
        {loading
          ? Array.from({ length: 6 }, (_, i) => <CardSk key={`ssk-${i}`} admin={admin} />)
          : rows.map((f, i) => (
              <FormulaCard
                key={f.id}
                f={f}
                n={i + 1}
                favorited={favIds.has(f.id)}
                onFav={() => void toggleFav(f.id)}
                onEdit={() => router.push(`/c/${f.category.slug}`)}
                onDelete={() => void remove(f)}
              />
            ))}
      </div>

      {!loading && initial.trim() && rows.length === 0 && (
        <div className="text-sm py-8 text-center" style={{ color: "var(--lite)" }}>
          Không tìm thấy công thức phù hợp.{" "}
          <Link href="/" style={{ color: "var(--spc)" }}>
            Về trang chủ
          </Link>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchInner />
    </Suspense>
  );
}
