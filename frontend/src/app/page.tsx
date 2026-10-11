"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { IcSearch } from "../components/ui/Icons";
import { useApp } from "../components/ui/Providers";
import { CatSk } from "../components/ui/Skeleton";
import { useDocTitle } from "../lib/title";

export default function HomePage() {
  const { tree, treeLoading } = useApp();
  const [q, setQ] = useState("");
  const router = useRouter();
  useDocTitle("Trang chủ");

  const flat = useMemo(() => {
    const out: typeof tree = [];
    const walk = (ns: typeof tree): void => {
      for (const n of ns) {
        out.push(n);
        walk(n.children);
      }
    };
    walk(tree);
    return out;
  }, [tree]);

  const submit = (): void => {
    const term = q.trim();
    if (!term) return;
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  const featured = flat.filter((n) => n.count > 0).slice(0, 6);

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 py-8 px-2">
      <section className="text-center flex flex-col items-center gap-4">
        <span
          className="text-xs tracking-[0.25em] uppercase px-3 py-1 border"
          style={{ borderColor: "var(--line)", color: "var(--lite)" }}
        >
          Maft · Math Formula Library
        </span>
        <h1
          className="text-4xl md:text-5xl font-bold m-0 leading-tight"
          style={{ color: "var(--cnt)" }}
        >
          Thư viện công thức <span style={{ color: "var(--spc)" }}>Toán học</span>
        </h1>
        <p className="text-base m-0 max-w-2xl" style={{ color: "var(--lite)" }}>
          Tra cứu nhanh công thức đại số, hàm số, giải tích, hình học...
        </p>

        <div
          className="flex items-center gap-2 w-full max-w-xl border px-2 h-12"
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
      </section>

      <section className="flex flex-col gap-4">
        <h2
          className="flex items-center gap-3 text-lg font-semibold m-0"
          style={{ color: "var(--cnt)" }}
        >
          Danh mục
          <span className="flex-1 h-px" style={{ background: "var(--line)" }} />
          <span className="text-sm font-normal" style={{ color: "var(--lite)" }}>
            {flat.length} danh mục
          </span>
        </h2>
        <div className="masonry columns-1 sm:columns-2 lg:columns-3">
          {treeLoading
            ? Array.from({ length: 6 }, (_, i) => <CatSk key={`csk-${i}`} />)
            : tree.map((n) => (
            <Link
              key={n.slug}
              href={`/c/${n.slug}`}
              className="border p-4 flex flex-col gap-2 no-underline transition-colors"
              style={{ background: "var(--surface)", borderColor: "var(--line)" }}
            >
              <div className="flex items-center gap-3">
                <span
                  className={
                    "grid place-items-center w-10 h-10 " +
                      "text-base font-bold shrink-0"
                  }
                  style={{
                    background: `color-mix(in srgb, ${n.color} 22%, transparent)`,
                    color: n.color,
                  }}
                >
                  {n.icon}
                </span>
                <span
                  className="text-[15px] font-semibold flex-1"
                  style={{ color: "var(--cnt)" }}
                >
                  {n.name}
                </span>
                <span
                  className="text-xs px-2 py-0.5"
                  style={{ background: "var(--hover)", color: "var(--lite)" }}
                >
                  {n.count}
                </span>
              </div>
              {n.description && (
                <p className="text-[13px] m-0 line-clamp-2" style={{ color: "var(--lite)" }}>
                  {n.description}
                </p>
              )}
              {n.children.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {n.children.slice(0, 5).map((c) => (
                    <span
                      key={c.slug}
                      className="text-[11px] px-2 py-0.5"
                      style={{ background: "var(--hover)", color: "var(--lite)" }}
                    >
                      {c.name}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2
            className="flex items-center gap-3 text-lg font-semibold m-0"
            style={{ color: "var(--cnt)" }}
          >
            Bắt đầu với
            <span className="flex-1 h-px" style={{ background: "var(--line)" }} />
          </h2>
          <div className="flex flex-wrap gap-3">
            {featured.map((n) => (
              <Link key={n.slug} href={`/c/${n.slug}`} className="tag">
                <span
                  className="w-2 h-2"
                  style={{ background: n.color }}
                />
                {n.name} · {n.count}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
