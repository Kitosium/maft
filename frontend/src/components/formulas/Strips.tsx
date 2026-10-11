"use client";

import type { CategoryDetail } from "../../types";
import { IcBulb } from "../ui/Icons";
import { MaftTex } from "./Render";

const H2 = "flex items-center gap-2 text-base font-semibold m-0";

const card = {
  background: "var(--surface)",
  borderColor: "var(--line)",
};

export const Strips = ({ cat }: { cat: CategoryDetail }) => {
  const related = cat.related ?? [];
  if (related.length === 0) return null;
  return (
    <section className="flex flex-col gap-3">
      <h2 className={H2} style={{ color: "var(--cnt)" }}>
        <IcBulb className="w-5 h-5" style={{ color: "var(--spc)" }} />
        Công thức liên quan
      </h2>
      <div className="flex flex-wrap gap-3">
        {related.map((r) => (
          <div key={r.id} className="border px-4 py-2 min-w-40" style={card}>
            <MaftTex txt={r.latex} fs={15} />
          </div>
        ))}
      </div>
    </section>
  );
};
