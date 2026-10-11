import Link from "next/link";
import type { CategoryNode } from "../../types";

type Props = { kids: CategoryNode[] };

export const ChildCats = ({ kids }: Props) => (
  <section className="flex flex-col gap-3">
    <h2
      className="flex items-center gap-3 text-lg font-semibold m-0"
      style={{ color: "var(--cnt)" }}
    >
      Danh mục con
      <span className="flex-1 h-px" style={{ background: "var(--line)" }} />
    </h2>
    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
      {kids.map((c) => (
        <Link
          key={c.slug}
          href={`/c/${c.slug}`}
          className="flex items-center gap-3 p-3 border no-underline"
          style={{ background: "var(--surface)", borderColor: "var(--line)" }}
        >
          <span
            className="grid place-items-center w-9 h-9 text-sm font-bold shrink-0"
            style={{
              background: `color-mix(in srgb, ${c.color} 24%, transparent)`,
              color: c.color,
            }}
          >
            {c.icon}
          </span>
          <span className="min-w-0 flex flex-col">
            <span
              className="text-sm font-semibold truncate"
              style={{ color: "var(--cnt)" }}
            >
              {c.name}
            </span>
            <span className="text-xs truncate" style={{ color: "var(--lite)" }}>
              {c.count} công thức
            </span>
          </span>
        </Link>
      ))}
    </div>
  </section>
);
