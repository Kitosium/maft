"use client";

import Link from "next/link";
import { useState } from "react";
import { IcPlus, IcTrash } from "../../components/ui/Icons";
import { useApp } from "../../components/ui/Providers";
import { delJson, getJson } from "../../lib/api";
import type { CategoryDetail, CategoryNode } from "../../types";
import { useDocTitle } from "../../lib/title";
import { CategoryForm, type CategoryRow } from "../../components/admin/Form";

const flatten = (
  ns: CategoryNode[],
  depth = 0,
): { n: CategoryNode; depth: number }[] =>
  ns.flatMap((n) => [{ n, depth }, ...flatten(n.children, depth + 1)]);

const actBtn =
  "flex items-center gap-1.5 text-sm px-3 py-2 border cursor-pointer";

const actStyle = {
  borderColor: "color-mix(in srgb, var(--spc) 60%, transparent)",
  color: "var(--spc)",
  background: "color-mix(in srgb, var(--spc) 14%, transparent)",
};

export default function AdminPage() {
  const { user, booting, tree, reloadTree } = useApp();
  const admin = user?.role === "ADMIN";
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [detail, setDetail] = useState<CategoryDetail | null>(null);
  useDocTitle("Quản trị danh mục");

  if (booting) {
    return (
      <div className="text-sm py-8" style={{ color: "var(--lite)" }}>
        ...
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="max-w-xl mx-auto text-center flex flex-col gap-4 py-16">
        <h1 className="text-2xl font-bold m-0" style={{ color: "var(--cnt)" }}>
          Quản trị
        </h1>
        <p className="text-sm m-0" style={{ color: "var(--lite)" }}>
          Trang này dành cho tài khoản admin. Đăng nhập Google với email đã cấp
          quyền để sửa/xóa công thức và danh mục trực tiếp trên web.
        </p>
        <Link href="/login" className={actBtn + " no-underline self-center"} style={actStyle}>
          Đăng nhập
        </Link>
      </div>
    );
  }

  const rows = flatten(tree);

  const loadDetail = async (n: CategoryNode): Promise<void> => {
    try {
      const d = await getJson<CategoryDetail>(`/categories/${n.slug}`);
      setDetail(d);
    } catch {
      setDetail(null);
    }
    setEditing({
      id: n.id,
      slug: n.slug,
      name: n.name,
      icon: n.icon,
      color: n.color,
      description: n.description ?? "",
      order: 0,
      parentId: n.parentId,
    });
  };

  const startNew = (): void => {
    setDetail(null);
    setEditing({
      id: "",
      slug: "",
      name: "",
      icon: "M",
      color: "#89b4fa",
      description: "",
      order: rows.length + 1,
      parentId: null,
    });
  };

  const remove = async (r: CategoryRow): Promise<void> => {
    if (!window.confirm(`Xóa danh mục "${r.name}" (kèm công thức con)?`)) return;
    try {
      await delJson(`/categories/${r.id}`);
      reloadTree();
    } catch {
      window.alert("Xóa thất bại.");
    }
  };

  return (
    <div className="max-w-4xl flex flex-col gap-5">
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold m-0" style={{ color: "var(--cnt)" }}>
          Quản trị danh mục
        </h1>
        <button type="button" onClick={startNew} className={actBtn + " ml-auto"} style={actStyle}>
          <IcPlus className="w-4 h-4" />
          Danh mục mới
        </button>
      </header>

      <p className="text-sm m-0" style={{ color: "var(--lite)" }}>
        Sửa công thức: mở danh mục và bấm nút bút chì trên thẻ công thức. Sửa
        danh mục + công thức liên quan: làm ngay tại đây.
      </p>

      {editing && (
        <CategoryForm
          key={editing.id || "new"}
          editing={editing}
          detail={detail}
          rows={rows}
          onCancel={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            setDetail(null);
            reloadTree();
          }}
        />
      )}

      <div className="flex flex-col gap-1.5">
        {rows.map(({ n, depth }) => (
          <div
            key={n.slug}
            className="flex items-center gap-2 border px-3 py-2"
            style={{
              background: "var(--surface)",
              borderColor: "var(--line)",
              marginLeft: depth * 18,
            }}
          >
            <span
              className={
                "grid place-items-center w-7 h-7 text-[11px] " +
                "font-semibold shrink-0"
              }
              style={{
                background: `color-mix(in srgb, ${n.color} 20%, transparent)`,
                color: n.color,
              }}
            >
              {n.icon}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm truncate" style={{ color: "var(--cnt)" }}>
                {n.name}
              </div>
              <div className="text-xs truncate" style={{ color: "var(--lite)" }}>
                {n.slug} · {n.count} công thức
              </div>
            </div>
            <Link href={`/c/${n.slug}`} className="tag text-xs">
              Mở
            </Link>
            <button
              type="button"
              onClick={() => void loadDetail(n)}
              className="text-xs px-3 py-1.5 border cursor-pointer"
              style={{ borderColor: "var(--line)", color: "var(--lite)" }}
            >
              Sửa
            </button>
            <button
              type="button"
              onClick={() =>
                void remove({
                  id: n.id,
                  slug: n.slug,
                  name: n.name,
                  icon: n.icon,
                  color: n.color,
                  description: n.description ?? "",
                  order: 0,
                  parentId: n.parentId,
                })
              }
              aria-label="Xóa danh mục"
              className="grid place-items-center w-8 h-8 border cursor-pointer"
              style={{ borderColor: "var(--line)", color: "#f38ba8" }}
            >
              <IcTrash className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
