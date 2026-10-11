"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getJson } from "../../lib/api";
import type { Formula } from "../../types";
import { IcSearch, IcX } from "../ui/Icons";
import { MaftTex } from "../formulas/Render";

type P = { onClose: () => void };

export const SearchDialog = ({ onClose }: P) => {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Formula[]>([]);
  const [busy, setBusy] = useState(false);
  const inp = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    inp.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const term = q.trim();
    if (!term) {
      setRows([]);
      return;
    }
    setBusy(true);
    const t = window.setTimeout(() => {
      getJson<Formula[]>(`/formulas?q=${encodeURIComponent(term)}`)
        .then((r) => setRows(r.slice(0, 8)))
        .catch(() => setRows([]))
        .finally(() => setBusy(false));
    }, 220);
    return () => window.clearTimeout(t);
  }, [q]);

  const openFormula = (f: Formula): void => {
    onClose();
    router.push(`/c/${f.category.slug}#${f.id}`);
  };

  const submit = (): void => {
    const term = q.trim();
    if (!term) return;
    onClose();
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <div
      className={
        "fixed inset-0 z-50 h-dvh flex items-center justify-center p-4"
      }
      style={{ background: "rgba(0,0,0,0.55)" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        className={
          "w-full max-w-2xl border overflow-hidden flex flex-col " +
            "max-h-[85dvh]"
        }
        style={{ background: "var(--surface)", borderColor: "var(--line)" }}
        role="dialog"
        aria-label="Tìm kiếm công thức"
      >
        <div
          className="flex items-center gap-3 pl-4 pr-3 h-14 border-b"
          style={{ borderColor: "var(--line)" }}
        >
          <IcSearch className="w-5 h-5 shrink-0" style={{ color: "var(--lite)" }} />
          <input
            ref={inp}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            placeholder="Tìm kiếm công thức, ví dụ... (VD: đạo hàm, tan giác, ...)"
            className="flex-1 bg-transparent border-0 outline-none text-sm"
            style={{ color: "var(--cnt)" }}
          />
          {busy && (
            <span className="text-xs" style={{ color: "var(--lite)" }}>
              ...
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="grid place-items-center w-8 h-8 border cursor-pointer"
            style={{ borderColor: "var(--line)", color: "var(--lite)" }}
            aria-label="Đóng"
          >
            <IcX className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {rows.length === 0 && (
            <div className="px-4 py-6 text-sm" style={{ color: "var(--lite)" }}>
              {q.trim() ? "Không tìm thấy công thức phù hợp." : "Nhập từ khóa để tìm kiếm."}
            </div>
          )}
          {rows.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => openFormula(f)}
              className="w-full text-left px-4 py-3 border-0 border-b cursor-pointer"
              style={{
                background: "transparent",
                borderColor: "var(--line)",
                borderBottomStyle: "solid",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={
                    "grid place-items-center w-6 h-6 text-[10px] " +
                      "font-semibold shrink-0"
                  }
                  style={{
                    background: `color-mix(in srgb, ${f.category.color} 18%, transparent)`,
                    color: f.category.color,
                  }}
                >
                  {f.category.icon}
                </span>
                <span className="text-sm font-medium" style={{ color: "var(--cnt)" }}>
                  {f.title}
                </span>
                <span className="text-xs ml-auto" style={{ color: "var(--lite)" }}>
                  {f.category.name}
                </span>
              </div>
              <MaftTex txt={f.lines[0] ?? ""} fs={14} className="opacity-90" />
            </button>
          ))}
        </div>

        <div
          className="px-4 py-2.5 text-xs border-t flex gap-4"
          style={{ borderColor: "var(--line)", color: "var(--lite)" }}
        >
          <span>Enter: xem tất cả kết quả</span>
          <span>Esc: đóng</span>
        </div>
      </div>
    </div>
  );
};
