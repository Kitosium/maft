"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { SearchDialog } from "./Search";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export const Shell = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [nav, setNav] = useState(false);
  const path = usePathname();

  useEffect(() => {
    setNav(false);
  }, [path]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      className="h-dvh flex flex-col overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      <Topbar onSearch={() => setOpen(true)} onMenu={() => setNav((v) => !v)} />
      <div className="flex flex-1 min-h-0">
        <Sidebar open={nav} />
        <main className="flex-1 min-w-0 overflow-y-auto p-4 md:p-5">{children}</main>
      </div>
      {nav && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: "rgba(0,0,0,.5)" }}
          onClick={() => setNav(false)}
        />
      )}
      {open && <SearchDialog onClose={() => setOpen(false)} />}
    </div>
  );
};
