"use client";

import { useState } from "react";
import { MaftTex } from "../formulas/Render";
import { patchJson, postJson } from "../../lib/api";
import type { CategoryDetail, CategoryInput, CategoryNode } from "../../types";

export type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  order: number;
  parentId: string | null;
};

const inp = "w-full border px-2.5 py-1.5 text-sm outline-none bg-transparent";
const st = { borderColor: "var(--line)", color: "var(--cnt)" };
const lbl = "text-xs flex flex-col gap-1";
const grid = "grid gap-3 grid-cols-1 md:grid-cols-2";

type P = {
  editing: CategoryRow;
  detail: CategoryDetail | null;
  rows: { n: CategoryNode; depth: number }[];
  onCancel: () => void;
  onSaved: () => void;
};

export const CategoryForm = ({ editing, detail, rows, onCancel, onSaved }: P) => {
  const [row, setRow] = useState<CategoryRow>(editing);
  const [related, setRelated] = useState(
    detail?.related.map((x) => x.latex).join("\n") ?? "",
  );
  const [msg, setMsg] = useState("");

  const set = (patch: Partial<CategoryRow>): void => setRow({ ...row, ...patch });

  const lines = (s: string): string[] =>
    s.split("\n").map((x) => x.trim()).filter(Boolean);

  const save = async (): Promise<void> => {
    if (!row.name.trim()) {
      setMsg("Tên danh mục không được để trống.");
      return;
    }
    const body: CategoryInput = {
      name: row.name.trim(),
      icon: row.icon,
      color: row.color,
      description: row.description,
      order: Number(row.order) || 0,
      parentId: row.parentId,
      related: lines(related),
    };
    setMsg("");
    try {
      if (row.id) await patchJson(`/categories/${row.id}`, body);
      else await postJson("/categories", body);
      onSaved();
    } catch {
      setMsg("Lưu thất bại — dữ liệu không hợp lệ hoặc bạn không có quyền.");
    }
  };

  const previews = lines(related);

  return (
    <div
      className="border p-4 flex flex-col gap-3"
      style={{
        background: "var(--surface)",
        borderColor: "color-mix(in srgb, var(--spc) 45%, transparent)",
      }}
    >
      <div className="text-sm font-semibold" style={{ color: "var(--spc)" }}>
        {row.id ? `Sửa: ${row.name || row.slug}` : "Danh mục mới"}
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <label className={lbl} style={{ color: "var(--lite)" }}>
          Tên
          <input
            className={inp}
            style={st}
            value={row.name}
            onChange={(e) => set({ name: e.target.value })}
          />
        </label>
        <label className={lbl} style={{ color: "var(--lite)" }}>
          Icon (1-2 ký tự)
          <input
            className={inp}
            style={st}
            value={row.icon}
            maxLength={2}
            onChange={(e) => set({ icon: e.target.value })}
          />
        </label>
        <label className={lbl} style={{ color: "var(--lite)" }}>
          Màu
          <input
            className={inp}
            style={{ ...st, height: 34 }}
            type="color"
            value={row.color}
            onChange={(e) => set({ color: e.target.value })}
          />
        </label>
        <label className={lbl} style={{ color: "var(--lite)" }}>
          Thứ tự
          <input
            className={inp}
            style={st}
            inputMode="numeric"
            value={String(row.order)}
            onChange={(e) => set({ order: Number(e.target.value) || 0 })}
          />
        </label>
      </div>

      <div className={grid}>
        <label className={lbl} style={{ color: "var(--lite)" }}>
          Mô tả
          <input
            className={inp}
            style={st}
            value={row.description}
            onChange={(e) => set({ description: e.target.value })}
          />
        </label>
        <label className={lbl} style={{ color: "var(--lite)" }}>
          Danh mục cha
          <select
            className={inp}
            style={st}
            value={row.parentId ?? ""}
            onChange={(e) => set({ parentId: e.target.value || null })}
          >
            <option value="">— Cấp trên (root)</option>
            {rows
              .filter((r) => r.n.id !== row.id)
              .map((r) => (
                <option key={r.n.id} value={r.n.id}>
                  {"· ".repeat(r.depth)}
                  {r.n.name}
                </option>
              ))}
          </select>
        </label>
      </div>

      <div className={grid}>
        <label className={lbl} style={{ color: "var(--lite)" }}>
          Công thức liên quan (mỗi dòng một latex)
          <textarea
            className={inp}
            style={{ ...st, minHeight: 80, fontFamily: "monospace" }}
            value={related}
            onChange={(e) => setRelated(e.target.value)}
          />
        </label>
      </div>

      {previews.length > 0 && (
        <div
          className="border p-3 flex flex-wrap gap-3"
          style={{ borderColor: "var(--line)", background: "var(--bg)" }}
        >
          {previews.length > 0 && <MaftTex txt={previews.join("\n")} fs={14} />}
        </div>
      )}

      {msg && (
        <div className="text-xs" style={{ color: "#f38ba8" }}>
          {msg}
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm px-4 py-2 border cursor-pointer"
          style={{ borderColor: "var(--line)", color: "var(--lite)" }}
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={() => void save()}
          className="text-sm px-4 py-2 border cursor-pointer"
          style={{
            borderColor: "color-mix(in srgb, var(--spc) 60%, transparent)",
            color: "var(--spc)",
            background: "color-mix(in srgb, var(--spc) 14%, transparent)",
          }}
        >
          Lưu
        </button>
      </div>
    </div>
  );
};
