"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { delJson, getJson } from "../../../lib/api";
import { useDocTitle } from "../../../lib/title";
import type { CategoryDetail, Formula } from "../../../types";
import { FormulaCard } from "../../../components/formulas/Card";
import { FormulaEditor } from "../../../components/formulas/Editor";
import { IcGrid, IcList } from "../../../components/ui/Icons";
import { Strips } from "../../../components/formulas/Strips";
import { ChildCats } from "../../../components/categories/Subcategories";
import { useApp } from "../../../components/ui/Providers";
import { CatPageSk } from "../../../components/ui/Skeleton";
import { CatHead } from "../../../components/categories/Head";

type EditorState = { mode: "create" } | { mode: "edit"; f: Formula } | null;

const actBorder = (on: boolean): string =>
  on ? "color-mix(in srgb, var(--spc) 55%, transparent)" : "var(--line)";

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { user, favIds, toggleFav, tree, treeLoading } = useApp();
  const admin = user?.role === "ADMIN";

  const [cat, setCat] = useState<CategoryDetail | null>(null);
  const [rows, setRows] = useState<Formula[]>([]);
  const [tab, setTab] = useState("Tất cả");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [editor, setEditor] = useState<EditorState>(null);
  const [tick, setTick] = useState(0);
  const [missing, setMissing] = useState(false);
  const [loadCat, setLoadCat] = useState(true);
  const [loadRows, setLoadRows] = useState(true);
  useDocTitle(cat ? cat.name : null);

  useEffect(() => {
    setTab("Tất cả");
    setEditor(null);
    setCat(null);
    setMissing(false);
    setLoadCat(true);
    setLoadRows(true);
    let live = true;
    getJson<CategoryDetail>(`/categories/${slug}`)
      .then((c) => {
        if (live) setCat(c);
      })
      .catch(() => {
        if (live) setMissing(true);
      })
      .finally(() => {
        if (live) setLoadCat(false);
      });
    getJson<Formula[]>(`/formulas?category=${slug}`)
      .then((r) => {
        if (live) setRows(r);
      })
      .catch(() => {
        if (live) setRows([]);
      })
      .finally(() => {
        if (live) setLoadRows(false);
      });
    return () => {
      live = false;
    };
  }, [slug, tick]);

  const reload = useCallback(() => setTick((n) => n + 1), []);
  const parent = useMemo(() => {
    for (const r of tree) {
      if (r.children.some((c) => c.slug === slug)) return r;
      if (r.slug === slug) return null;
    }
    return null;
  }, [tree, slug]);

  const node = useMemo(() => {
    const walk = (ns: typeof tree): (typeof tree)[number] | null => {
      for (const r of ns) {
        if (r.slug === slug) return r;
        const hit = walk(r.children);
        if (hit) return hit;
      }
      return null;
    };
    return walk(tree);
  }, [tree, slug]);
  const kids = node?.children ?? [];

  const tabs = useMemo(() => {
    const counts = new Map<string, number>();
    for (const f of rows) counts.set(f.group, (counts.get(f.group) ?? 0) + 1);
    return [
      { name: "Tất cả", count: rows.length },
      ...Array.from(counts, ([name, count]) => ({ name, count })),
    ];
  }, [rows]);

  const shown = useMemo(
    () => (tab === "Tất cả" ? rows : rows.filter((f) => f.group === tab)),
    [rows, tab],
  );
  const expected = kids.length === 0 ? Math.min(node?.count ?? 0, 6) : 0;
  const loading = loadCat || treeLoading || loadRows;

  const remove = async (f: Formula): Promise<void> => {
    if (!window.confirm(`Xóa "${f.title}"?`)) return;
    try {
      await delJson(`/formulas/${f.id}`);
      reload();
    } catch {
      window.alert("Xóa thất bại.");
    }
  };

  if (missing) {
    return (
      <div className="p-6 text-sm" style={{ color: "var(--lite)" }}>
        Không tìm thấy danh mục.{" "}
        <Link href="/" style={{ color: "var(--spc)" }}>Về trang chủ</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <CatPageSk
        kids={treeLoading ? null : kids.length}
        expected={expected}
        admin={admin}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-7xl">
      <CatHead
        cat={cat}
        load={loadCat}
        parent={parent}
        admin={admin}
        onAdd={() => setEditor({ mode: "create" })}
      />

      {kids.length > 0 && <ChildCats kids={kids} />}

      {(rows.length > 0 || kids.length === 0 || !!editor) && (
      <div
        className="flex items-center gap-4 border-b"
        style={{ borderColor: "var(--line)" }}
      >
        <div
          className={
            "flex items-center gap-4 flex-1 min-w-0 overflow-x-auto " +
              "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          }
        >
          {tabs.map((t) => {
            const active = t.name === tab;
            return (
              <button
                key={t.name}
                type="button"
                onClick={() => setTab(t.name)}
                className={
                  "px-1 pb-2.5 pt-1 text-sm border-0 bg-transparent " +
                    "cursor-pointer whitespace-nowrap border-b-2"
                }
                style={{
                  color: active ? "var(--cnt)" : "var(--lite)",
                  borderBottomColor: active ? "var(--spc)" : "transparent",
                  fontWeight: active ? 600 : 400,
                }}
              >
                {t.name} ({t.count})
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-1 pb-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setView("grid")}
            aria-label="Xem dạng lưới"
            className="grid place-items-center w-8 h-8 border cursor-pointer"
            style={{
              borderColor: actBorder(view === "grid"),
              color: view === "grid" ? "var(--spc)" : "var(--lite)",
            }}
          >
            <IcGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            aria-label="Xem dạng danh sách"
            className="grid place-items-center w-8 h-8 border cursor-pointer"
            style={{
              borderColor: actBorder(view === "list"),
              color: view === "list" ? "var(--spc)" : "var(--lite)",
            }}
          >
            <IcList className="w-4 h-4" />
          </button>
        </div>
      </div>
      )}

      <div
        className={
          view === "grid"
            ? "masonry columns-1 md:columns-2 xl:columns-3"
            : "grid gap-4 grid-cols-1"
        }
      >
        {editor?.mode === "create" && cat && (
          <FormulaEditor
            categoryId={cat.id}
            groups={tabs.slice(1).map((t) => t.name)}
            onSaved={() => {
              setEditor(null);
              reload();
            }}
            onCancel={() => setEditor(null)}
          />
        )}

                {shown.map((f, i) =>
          editor?.mode === "edit" && editor.f.id === f.id && cat ? (
            <FormulaEditor
              key={`${f.id}-edit`}
              categoryId={cat.id}
              groups={tabs.slice(1).map((t) => t.name)}
              initial={f}
              onSaved={() => {
                setEditor(null);
                reload();
              }}
              onCancel={() => setEditor(null)}
            />
          ) : (
            <FormulaCard
              key={f.id}
              f={f}
              n={i + 1}
              favorited={favIds.has(f.id)}
              onFav={() => void toggleFav(f.id)}
              onEdit={() => setEditor({ mode: "edit", f })}
              onDelete={() => void remove(f)}
            />
          ),
        )}
      </div>

      {shown.length === 0 && !editor && kids.length === 0 && (
        <div className="text-sm py-8 text-center" style={{ color: "var(--lite)" }}>
          Chưa có công thức nào trong tab này.
        </div>
      )}

      {cat && <Strips cat={cat} />}

    </div>
  );
}
