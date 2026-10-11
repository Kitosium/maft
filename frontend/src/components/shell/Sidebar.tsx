"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { CategoryNode } from "../../types";
import { IcChevron, IcClock, IcHeart, IcHome } from "../ui/Icons";
import { useApp } from "../ui/Providers";
import { SidebarSk } from "../ui/Skeleton";

const navItem = (active: boolean): string =>
  [
    "flex items-center gap-3 px-3 py-2 text-sm no-underline border",
    active ? "" : "border-transparent",
  ].join(" ");

const navStyle = (active: boolean) =>
  active
    ? {
        background: "color-mix(in srgb, var(--spc) 14%, transparent)",
        color: "var(--spc)",
        borderColor: "color-mix(in srgb, var(--spc) 40%, transparent)",
      }
    : { background: "transparent", color: "var(--lite)", borderColor: "transparent" };

const badgeStyle = (color: string, active: boolean) => ({
  background: `color-mix(in srgb, ${color} ${active ? 26 : 16}%, transparent)`,
  color,
});

type P = { open: boolean };

export const Sidebar = ({ open }: P) => {
  const { tree, favIds, user, treeLoading } = useApp();
  const path = usePathname();
  const [closed, setClosed] = useState<Set<string>>(new Set());
  const isAdmin = user?.role === "ADMIN";

  const toggle = (slug: string): void => {
    setClosed((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const isActive = (slug: string): boolean => path === `/c/${slug}`;

  const renderNode = (n: CategoryNode): React.ReactNode => {
    const active = isActive(n.slug);
    const hasKids = n.children.length > 0;
    const open = hasKids && !closed.has(n.slug);
    return (
      <div key={n.slug}>
        <div
          className="relative flex items-center gap-1"
          style={active ? { background: "var(--hover)" } : undefined}
        >
          {hasKids ? (
            <button
              type="button"
              onClick={() => toggle(n.slug)}
              className={
                "grid place-items-center w-6 h-6 shrink-0 cursor-pointer " +
                  "border-0 bg-transparent"
              }
              style={{ color: "var(--lite)" }}
              aria-label={open ? "Thu gọn" : "Mở rộng"}
            >
              <IcChevron
                className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-90" : ""}`}
              />
            </button>
          ) : (
            <span className="w-6 shrink-0" />
          )}
          <Link
            href={`/c/${n.slug}`}
            className="flex flex-1 items-center gap-2.5 px-1.5 py-2 text-sm no-underline min-w-0"
            style={{ color: active ? "var(--cnt)" : "var(--lite)" }}
          >
            <span
              className={
                "grid place-items-center w-7 h-7 text-[11px] " +
                  "font-semibold shrink-0"
              }
              style={badgeStyle(n.color, active)}
            >
              {n.icon}
            </span>
            <span className="flex-1 truncate">{n.name}</span>
            <span className="text-xs shrink-0" style={{ color: "var(--lite)" }}>
              {n.count}
            </span>
          </Link>
          {open && (
            <span
              aria-hidden
              className="absolute w-px"
              style={{
                left: 12,
                top: "50%",
                bottom: 0,
                background: "var(--line)",
              }}
            />
          )}
        </div>
        {open && (
          <div>
            {n.children.map((c, i) => {
              const ca = isActive(c.slug);
              const last = i === n.children.length - 1;
              return (
                <Link
                  key={c.slug}
                  href={`/c/${c.slug}`}
                  className={
                    "relative flex items-center gap-2 py-1.5 pl-9 pr-1 " +
                    "text-[13px] no-underline"
                  }
                  style={{
                    background: ca ? "var(--hover)" : "transparent",
                    color: ca ? "var(--spc)" : "var(--lite)",
                  }}
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
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="text-xs">{c.count}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const item = (
    href: string,
    icon: React.ReactNode,
    label: string,
    count?: number,
  ): React.ReactNode => {
    const active = path === href;
    return (
      <Link key={href} href={href} className={navItem(active)} style={navStyle(active)}>
        {icon}
        <span className="flex-1">{label}</span>
        {count !== undefined && count > 0 && (
          <span
            className="text-xs px-1.5 py-0.5"
            style={{
              background: "color-mix(in srgb, var(--spc) 18%, transparent)",
              color: "var(--spc)",
            }}
          >
            {count}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside
      className={
        "fixed md:static top-0 left-0 z-50 md:z-auto h-dvh md:h-auto " +
          "w-64 shrink-0 border-r overflow-y-auto p-3 flex flex-col gap-4 " +
          "transition-transform md:transition-none " +
          (open ? "translate-x-0" : "-translate-x-full md:translate-x-0")
      }
      style={{ background: "var(--surface)", borderColor: "var(--line)" }}
    >
      <nav className="flex flex-col gap-1">
        {item("/", <IcHome className="w-5 h-5" />, "Trang chủ")}
        {item(
          "/favorites",
          <IcHeart className="w-5 h-5" filled={path === "/favorites"} />,
          "Yêu thích",
          favIds.size,
        )}
        {item("/history", <IcClock className="w-5 h-5" />, "Lịch sử")}
        {isAdmin && item("/admin", <IcChevron className="w-5 h-5" />, "Quản trị")}
      </nav>

      <div>
        <div
          className="px-3 pb-2 text-[11px] font-semibold tracking-widest uppercase"
          style={{ color: "var(--lite)" }}
        >
          Danh mục
        </div>
        {treeLoading ? (
          <SidebarSk />
        ) : (
          <div className="flex flex-col gap-0.5">{tree.map((n) => renderNode(n))}</div>
        )}
      </div>

      <div
        className="mt-auto border p-4 text-sm leading-relaxed"
        style={{
          borderColor: "var(--line)",
          background: "var(--bg)",
          color: "var(--lite)",
        }}
      >
        <div className="text-2xl leading-none mb-1" style={{ color: "var(--spc)" }}>
          ❝
        </div>
        <div>Toán học là ngôn ngữ của vũ trụ.</div>
        <div className="text-right text-xs mt-2">— Galileo Galilei</div>
      </div>
    </aside>
  );
};
