"use client";

import { useState } from "react";
import { patchJson, postJson } from "../../lib/api";
import type { Formula, FormulaInput } from "../../types";
import { MaftTex } from "./Render";

type P = {
  categoryId: string;
  groups: string[];
  initial?: Formula | null;
  onSaved: () => void;
  onCancel: () => void;
};

const field =
  "w-full border px-3 py-2 text-sm outline-none bg-transparent";

const fieldStyle = { borderColor: "var(--line)", color: "var(--cnt)" };

export const FormulaEditor = ({ categoryId, groups, initial, onSaved, onCancel }: P) => {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [group, setGroup] = useState(initial?.group ?? groups[0] ?? "Cơ bản");
  const [lines, setLines] = useState((initial?.lines ?? [""]).join("\n"));
  const [note, setNote] = useState(initial?.note ?? "");
  const [condition, setCondition] = useState(initial?.condition ?? "");
  const [example, setExample] = useState(initial?.example ?? "");
  const [order, setOrder] = useState(String(initial?.order ?? 0));
  const [published, setPublished] = useState(initial?.published ?? true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const preview = lines
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const save = async (): Promise<void> => {
    const ls = preview;
    if (!title.trim() || ls.length === 0) {
      setErr("Cần ít nhất tiêu đề và một dòng công thức.");
      return;
    }
    setBusy(true);
    setErr("");
    const body: FormulaInput = {
      categoryId,
      title: title.trim(),
      group: group.trim() || "Cơ bản",
      lines: ls,
      note: note.trim() || null,
      condition: condition.trim() || null,
      example: example.trim() || null,
      order: Number(order) || 0,
      published,
    };
    try {
      if (initial) await patchJson(`/formulas/${initial.id}`, body);
      else await postJson("/formulas", body);
      onSaved();
    } catch {
      setErr("Lưu thất bại — kiểm tra kết nối API hoặc quyền admin.");
      setBusy(false);
    }
  };

  const allGroups = Array.from(new Set([group, ...groups]));

  return (
    <div
      className="border p-4 flex flex-col gap-3"
      style={{
        background: "var(--surface)",
        borderColor: "color-mix(in srgb, var(--spc) 45%, transparent)",
      }}
    >
      <div className="text-sm font-semibold" style={{ color: "var(--spc)" }}>
        {initial ? "Sửa công thức" : "Thêm công thức"}
      </div>

      <label className="text-xs" style={{ color: "var(--lite)" }}>
        Tiêu đề
        <input
          className={field}
          style={fieldStyle}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ví dụ: Tính chất logarit 1"
        />
      </label>

      <div className="flex gap-3 flex-wrap">
        <label className="text-xs flex-1 min-w-40" style={{ color: "var(--lite)" }}>
          Nhóm (tab)
          <input
            className={field}
            style={fieldStyle}
            value={group}
            list="maft-groups"
            onChange={(e) => setGroup(e.target.value)}
          />
          <datalist id="maft-groups">
            {allGroups.map((g) => (
              <option key={g} value={g} />
            ))}
          </datalist>
        </label>
        <label className="text-xs w-24" style={{ color: "var(--lite)" }}>
          Thứ tự
          <input
            className={field}
            style={fieldStyle}
            value={order}
            inputMode="numeric"
            onChange={(e) => setOrder(e.target.value)}
          />
        </label>
        <label
          className="text-xs flex items-center gap-2 self-end pb-2"
          style={{ color: "var(--lite)" }}
        >
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          Công bố
        </label>
      </div>

      <label className="text-xs" style={{ color: "var(--lite)" }}>
        Công thức (mỗi dòng một biểu thức)
        <textarea
          className={field}
          style={{ ...fieldStyle, minHeight: 96, fontFamily: "monospace" }}
          value={lines}
          onChange={(e) => setLines(e.target.value)}
          placeholder={"\\log_a (xy) = \\log_a x + \\log_a y"}
        />
      </label>

      <div className="flex gap-3 flex-wrap">
        <label className="text-xs flex-1 min-w-40" style={{ color: "var(--lite)" }}>
          Điều kiện (latex, có thể bỏ trống)
          <input
            className={field}
            style={fieldStyle}
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          />
        </label>
        <label className="text-xs flex-1 min-w-40" style={{ color: "var(--lite)" }}>
          Ví dụ (latex)
          <input
            className={field}
            style={fieldStyle}
            value={example}
            onChange={(e) => setExample(e.target.value)}
          />
        </label>
      </div>

      <label className="text-xs" style={{ color: "var(--lite)" }}>
        Ghi chú
        <input
          className={field}
          style={fieldStyle}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </label>

      <div
        className="border p-3"
        style={{ borderColor: "var(--line)", background: "var(--bg)" }}
      >
        <div className="text-[11px] uppercase tracking-wider mb-2" style={{ color: "var(--lite)" }}>
          Xem trước
        </div>
        <div className="flex flex-col gap-1">
          {preview.length === 0 && (
            <span className="text-sm" style={{ color: "var(--lite)" }}>
              Chưa có công thức.
            </span>
          )}
          {preview.length > 0 && <MaftTex txt={preview.join("\n")} fs={16} />}
        </div>
        {example.trim() && (
          <div className="mt-2 flex items-start gap-2 text-xs" style={{ color: "var(--lite)" }}>
            <span className="leading-6">Ví dụ:</span>
            <MaftTex txt={example.trim()} fs={14} className="flex-1 min-w-0" />
          </div>
        )}
      </div>

      {err && (
        <div className="text-xs" style={{ color: "#f38ba8" }}>
          {err}
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm px-4 py-2 border cursor-pointer"
          style={{ borderColor: "var(--line)", color: "var(--lite)", background: "transparent" }}
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={() => void save()}
          disabled={busy}
          className="text-sm px-4 py-2 border cursor-pointer"
          style={{
            borderColor: "color-mix(in srgb, var(--spc) 60%, transparent)",
            color: "var(--spc)",
            background: "color-mix(in srgb, var(--spc) 14%, transparent)",
            opacity: busy ? 0.6 : 1,
          }}
        >
          {busy ? "Đang lưu..." : "Lưu"}
        </button>
      </div>
    </div>
  );
};
