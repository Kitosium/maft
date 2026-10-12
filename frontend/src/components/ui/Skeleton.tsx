import type { CSSProperties } from "react";

type SkP = { className?: string; style?: CSSProperties };

export const Sk = ({ className = "", style }: SkP) => (
  <span className={`maft-sk ${className}`} style={style} />
);

export const CardSk = ({ admin = false }: { admin?: boolean }) => (
  <article
    className="border p-4 flex flex-col gap-3"
    style={{ background: "var(--surface)", borderColor: "var(--line)" }}
  >
    <div className="flex items-start gap-3">
      <Sk className="w-7 h-7 shrink-0" />
      <div className="flex-1 min-w-0 flex flex-col gap-1.5 pt-0.5">
        <Sk className="h-4 w-11/12" />
        <Sk className="h-4 w-7/12" />
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {admin && (
          <>
            <Sk className="w-7 h-7" />
            <Sk className="w-7 h-7" />
          </>
        )}
        <Sk className="w-7 h-7" />
      </div>
    </div>
    <Sk className="h-9 w-full" />
    <div
      className="border-l-2 px-3 py-2"
      style={{ background: "var(--hover)", borderLeftColor: "var(--line)" }}
    >
      <Sk className="h-3 w-5/6" />
    </div>
    <div className="flex items-center justify-between gap-2 mt-auto pt-1">
      <Sk className="w-24 h-8 ml-auto" />
    </div>
  </article>
);

export const SubcatSk = () => (
  <div
    className="flex items-center gap-3 p-3 border"
    style={{ background: "var(--surface)", borderColor: "var(--line)" }}
  >
    <Sk className="w-9 h-9 shrink-0" />
    <div className="min-w-0 flex flex-col gap-1.5">
      <Sk className="h-3.5 w-24" />
      <Sk className="h-3 w-16" />
    </div>
  </div>
);

export const CatSk = () => (
  <div
    className="border p-4 flex flex-col gap-2"
    style={{ background: "var(--surface)", borderColor: "var(--line)" }}
  >
    <div className="flex items-center gap-3">
      <Sk className="w-10 h-10 shrink-0" />
      <Sk className="h-4 flex-1" />
      <Sk className="w-8 h-4 shrink-0" />
    </div>
    <Sk className="h-3 w-full" />
    <Sk className="h-3 w-2/3" />
  </div>
);

export const SidebarSk = () => (
  <div className="flex flex-col gap-0.5">
    {Array.from({ length: 8 }, (_, i) => (
      <div key={i}>
        <div className="flex items-center gap-1">
          <span className="w-6 h-6 shrink-0" />
          <div className="flex flex-1 items-center gap-2.5 px-1.5 py-2 min-w-0">
            <Sk className="w-7 h-7 shrink-0" />
            <Sk className="h-3.5 flex-1" />
            <Sk className="w-4 h-3 shrink-0" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

type CatSkP = { kids: number | null; expected: number; admin: boolean };

export const CatPageSk = ({ kids, expected, admin }: CatSkP) => (
  <div className="flex flex-col gap-5 max-w-7xl">
    <nav className="text-[13px] flex items-center gap-1.5">
      <Sk className="h-3.5 w-16" />
      <Sk className="h-3.5 w-8" />
      <Sk className="h-3.5 w-24" />
    </nav>

    <header className="flex items-start gap-4">
      <Sk className="w-12 h-12 shrink-0" />
      <div className="flex flex-col gap-2 flex-1 min-w-0 pt-0.5">
        <Sk className="h-6 w-48" />
        <Sk className="h-4 w-64 max-w-full" />
      </div>
      {admin && <Sk className="w-36 h-9 ml-auto shrink-0" />}
    </header>

    {kids !== null && kids > 0 && (
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Sk className="h-5 w-28" />
          <span className="flex-1 h-px" style={{ background: "var(--line)" }} />
        </div>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: kids }, (_, i) => (
            <SubcatSk key={i} />
          ))}
        </div>
      </section>
    )}

    {kids === 0 && (
      <div
        className="flex items-center gap-4 border-b"
        style={{ borderColor: "var(--line)" }}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Sk className="h-4 w-14 mb-2" />
          <Sk className="h-4 w-16 mb-2" />
          <Sk className="h-4 w-20 mb-2" />
        </div>
        <div className="flex items-center gap-1 pb-1.5 shrink-0">
          <Sk className="w-8 h-8" />
          <Sk className="w-8 h-8" />
        </div>
      </div>
    )}

    {expected > 0 && (
      <div className="masonry columns-1 md:columns-2 xl:columns-3">
        {Array.from({ length: expected }, (_, i) => (
          <CardSk key={i} admin={admin} />
        ))}
      </div>
    )}
  </div>
);
