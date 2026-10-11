import Link from "next/link";
import type { CategoryDetail, CategoryNode } from "../../types";
import { IcPlus } from "../ui/Icons";
import { Sk } from "../ui/Skeleton";

type P = {
  cat: CategoryDetail | null;
  load: boolean;
  parent: CategoryNode | null;
  admin: boolean;
  onAdd: () => void;
};

export const CatHead = ({ cat, load, parent, admin, onAdd }: P) => (
  <>
    <nav className="text-[13px]" style={{ color: "var(--lite)" }}>
      <Link href="/" style={{ color: "var(--lite)" }}>
        Trang chủ
      </Link>
      {parent && (
        <>
          <span className="mx-1.5">/</span>
          <Link href={`/c/${parent.slug}`} style={{ color: "var(--lite)" }}>
            {parent.name}
          </Link>
        </>
      )}
      <span className="mx-1.5">/</span>
      <span style={{ color: "var(--cnt)" }}>{cat?.name ?? "..."}</span>
    </nav>

    <header className="flex items-start gap-4">
      {load ? (
        <>
          <Sk className="w-12 h-12 shrink-0" />
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            <Sk className="h-6 w-44" />
            <Sk className="h-4 w-64 max-w-full" />
          </div>
        </>
      ) : (
        <>
          <span
            className="grid place-items-center w-12 h-12 text-lg font-bold shrink-0"
            style={{
              background: `color-mix(in srgb, ${cat?.color ?? "var(--spc)"} 24%, transparent)`,
              color: cat?.color ?? "var(--spc)",
            }}
          >
            {cat?.icon ?? "Σ"}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold m-0" style={{ color: "var(--cnt)" }}>
              {cat?.name ?? "..."}
            </h1>
            {cat?.description && (
              <p className="text-sm mt-1 m-0" style={{ color: "var(--lite)" }}>
                {cat.description}
              </p>
            )}
          </div>
        </>
      )}
      {admin && cat && (
        <button
          type="button"
          onClick={onAdd}
          className={
            "ml-auto flex items-center gap-1.5 text-sm px-3.5 py-2 " +
              "border cursor-pointer shrink-0"
          }
          style={{
            borderColor: "color-mix(in srgb, var(--spc) 60%, transparent)",
            color: "var(--spc)",
            background: "color-mix(in srgb, var(--spc) 14%, transparent)",
          }}
        >
          <IcPlus className="w-4 h-4" />
          Thêm công thức
        </button>
      )}
    </header>
  </>
);
