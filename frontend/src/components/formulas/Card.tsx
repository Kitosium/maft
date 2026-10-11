"use client";

import { useState } from "react";
import type { Formula } from "../../types";
import { IcCopy, IcEdit, IcStar, IcTrash } from "../ui/Icons";
import { MaftTex } from "./Render";
import { useApp } from "../ui/Providers";

type P = {
  f: Formula;
  n: number;
  favorited: boolean;
  onFav: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export const FormulaCard = ({ f, n, favorited, onFav, onEdit, onDelete }: P) => {
  const { user } = useApp();
  const admin = user?.role === "ADMIN";
  const [copied, setCopied] = useState(false);

  const copy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(f.lines.join("\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <article
      id={f.id}
      className="relative border p-4 flex flex-col gap-3 scroll-mt-24 maft-in"
      style={{
        background: "var(--surface)",
        borderColor: "var(--line)",
        animationDelay: `${Math.min(n - 1, 8) * 30}ms`,
      }}
    >
      <div className="flex items-start gap-3">
        <span
          className="grid place-items-center w-7 h-7 text-sm font-semibold shrink-0"
          style={{
            background: `color-mix(in srgb, ${f.category.color} 22%, transparent)`,
            color: f.category.color,
          }}
        >
          {n}
        </span>
        <h3
          className="flex-1 text-[15px] font-semibold leading-snug m-0"
          style={{ color: "var(--cnt)" }}
        >
          {f.title}
        </h3>
        <div className="flex items-center gap-1 shrink-0">
          {admin && (
            <>
              <button
                type="button"
                onClick={onEdit}
                aria-label="Sửa công thức"
                className="grid place-items-center w-7 h-7 border cursor-pointer"
                style={{ borderColor: "var(--line)", color: "var(--lite)" }}
              >
                <IcEdit className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onDelete}
                aria-label="Xóa công thức"
                className="grid place-items-center w-7 h-7 border cursor-pointer"
                style={{ borderColor: "var(--line)", color: "#f38ba8" }}
              >
                <IcTrash className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={onFav}
            aria-label={favorited ? "Bỏ yêu thích" : "Thêm yêu thích"}
            className="grid place-items-center w-7 h-7 border cursor-pointer"
            style={{
              borderColor: favorited
                ? "color-mix(in srgb, var(--spc) 55%, transparent)"
                : "var(--line)",
              color: favorited ? "var(--spc)" : "var(--lite)",
            }}
          >
            <IcStar className="w-4 h-4" filled={favorited} />
          </button>
        </div>
      </div>

      <MaftTex txt={f.lines.join("\n")} fs={16} />

      {f.condition && (
        <div
          className="border px-3 py-2 text-xs"
          style={{
            borderColor: "color-mix(in srgb, var(--spc) 35%, transparent)",
            color: "var(--lite)",
          }}
        >
          <MaftTex txt={f.condition} fs={14} />
        </div>
      )}

      {f.note && (
        <div
          className="border-l-2 px-3 py-2 text-[13px]"
          style={{
            background: "var(--hover)",
            borderLeftColor: f.category.color,
            color: "var(--lite)",
          }}
        >
          {f.note}
        </div>
      )}

      {f.example && (
        <div className="flex items-start gap-2 text-[13px]" style={{ color: "var(--lite)" }}>
          <span className="shrink-0 leading-7">Ví dụ:</span>
          <MaftTex txt={f.example} fs={14} className="flex-1 min-w-0" />
        </div>
      )}

      <div className="flex items-center justify-between gap-2 mt-auto pt-1">
        {!f.published && (
          <span
            className="text-[11px] px-2 py-0.5"
            style={{ background: "var(--hover)", color: "var(--lite)" }}
          >
            Nháp
          </span>
        )}
        <button
          type="button"
          onClick={() => void copy()}
          className={
            "ml-auto flex items-center gap-1.5 text-[13px] px-3 py-1.5 " +
              "border cursor-pointer"
          }
          style={{
            borderColor: copied
              ? "color-mix(in srgb, var(--spc) 55%, transparent)"
              : "var(--line)",
            color: copied ? "var(--spc)" : "var(--lite)",
            background: "transparent",
          }}
        >
          <IcCopy className="w-4 h-4" />
          {copied ? "Đã sao chép" : "Sao chép"}
        </button>
      </div>
    </article>
  );
};
