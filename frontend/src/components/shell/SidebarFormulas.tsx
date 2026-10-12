"use client";

import Link from "next/link";
import { useCachedGet } from "../../hooks/useCachedGet";
import type { Formula } from "../../types";

type P = { slug: string };

export const SidebarFormulas = ({ slug }: P) => {
  const { data, loading } = useCachedGet<Formula[]>(`/formulas?category=${slug}`);
  if (loading || !data || data.length === 0) return null;
  return (
    <div>
      {data.map((f, i) => {
        const last = i === data.length - 1;
        return (
          <Link
            key={f.id}
            href={`/c/${slug}#${f.id}`}
            className="relative flex items-center gap-2 py-1.5 pl-9 pr-1 text-[13px] no-underline"
            style={{ color: "var(--lite)" }}
          >
            <span
              aria-hidden
              className="absolute w-px"
              style={{
                left: 12,
                top: 0,
                height: last ? "50%" : "100%",
                background: "var(--line)",
              }}
            />
            <span
              aria-hidden
              className="absolute h-px"
              style={{
                left: 12,
                width: 20,
                top: "50%",
                background: "var(--line)",
              }}
            />
            <span className="flex-1 truncate">{f.title}</span>
          </Link>
        );
      })}
    </div>
  );
};
