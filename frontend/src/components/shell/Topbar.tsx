"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IcMenu, IcMoon, IcSearch, IcSun } from "../ui/Icons";
import { useApp } from "../ui/Providers";

type P = { onMenu: () => void; onSearch: () => void };

export const Topbar = ({ onMenu, onSearch }: P) => {
  const { mode, setMode, user, logout, booting } = useApp();
  const [menu, setMenu] = useState(false);
  const box = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const onDoc = (e: MouseEvent): void => {
      if (box.current && !box.current.contains(e.target as Node)) {
        setMenu(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const signOut = async (): Promise<void> => {
    setMenu(false);
    await logout();
    router.push("/");
  };

  const initial = user ? user.name.slice(0, 1).toUpperCase() : "?";

  return (
    <header
      className={
        "relative z-40 flex items-center gap-2 sm:gap-4 px-3 sm:px-4 " +
          "h-16 border-b shrink-0"
      }
      style={{ borderColor: "var(--line)", background: "var(--surface)" }}
    >
      <button
        type="button"
        onClick={onMenu}
        aria-label="Mở menu"
        className={
          "grid place-items-center w-9 h-9 border cursor-pointer shrink-0 " +
            "md:hidden"
        }
        style={{ borderColor: "var(--line)", color: "var(--lite)" }}
      >
        <IcMenu className="w-5 h-5" />
      </button>

      <Link href="/" className="flex items-center gap-3 shrink-0 no-underline">
        <span
          className="grid place-items-center w-9 h-9 border text-lg"
          style={{ borderColor: "var(--line)", color: "var(--spc)" }}
        >
          Σ
        </span>
        <span className="leading-tight hidden sm:block">
          <span className="block font-semibold" style={{ color: "var(--cnt)" }}>
            Maft
          </span>
          <span className="block text-xs" style={{ color: "var(--lite)" }}>
            Tôi ngu bạn cũng thế
          </span>
        </span>
      </Link>

      <button
        type="button"
        onClick={onSearch}
        className={
          "flex-1 min-w-0 max-w-3xl mx-auto flex items-center gap-2 h-10 px-2.5 " +
            "border text-left cursor-pointer"
        }
        style={{
          borderColor: "var(--line)",
          background: "var(--bg)",
          color: "var(--lite)",
        }}
      >
        <IcSearch className="w-4 h-4 shrink-0" />
        <span className="flex-1 truncate text-sm">
          Tìm kiếm công thức, ví dụ... (VD: đạo hàm, tan giác, ...)
        </span>
        <span
          className="text-xs px-1.5 py-0.5 border shrink-0 hidden sm:block"
          style={{ borderColor: "var(--line)" }}
        >
          Ctrl + K
        </span>
      </button>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          aria-label="Đổi giao diện"
          onClick={() => setMode(mode === "dark" ? "light" : "dark")}
          className="grid place-items-center w-10 h-10 border cursor-pointer"
          style={{ borderColor: "var(--line)", color: "var(--lite)" }}
        >
          {mode === "dark" ? (
            <IcSun className="w-5 h-5" />
          ) : (
            <IcMoon className="w-5 h-5" />
          )}
        </button>

        <div ref={box} className="relative">
          <button
            type="button"
            onClick={() => setMenu((v) => !v)}
            className="flex items-center gap-2 h-10 px-2 border cursor-pointer"
            style={{ borderColor: "var(--line)", color: "var(--cnt)" }}
          >
            <span
              className="grid place-items-center w-7 h-7 text-sm font-semibold"
              style={{
                background: "color-mix(in srgb, var(--spc) 20%, transparent)",
                color: "var(--spc)",
              }}
            >
              {initial}
            </span>
            <span className="text-sm hidden md:block">
              {booting ? "..." : user ? user.name : "Tài khoản"}
            </span>
            <span className="text-xs" style={{ color: "var(--lite)" }}>
              ▾
            </span>
          </button>

          {menu && (
            <div
              className="absolute right-0 top-12 w-60 border p-2 z-50 shadow-xl"
              style={{ background: "var(--surface)", borderColor: "var(--line)" }}
            >
              {user ? (
                <>
                  <div
                    className="px-2 py-1.5 text-sm font-medium"
                    style={{ color: "var(--cnt)" }}
                  >
                    {user.name}
                  </div>
                  <div
                    className="px-2 pb-2 text-xs break-all"
                    style={{ color: "var(--lite)" }}
                  >
                    {user.email}
                  </div>
                  {user.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={() => setMenu(false)}
                      className="block px-2 py-2 text-sm no-underline"
                      style={{ color: "var(--cnt)" }}
                    >
                      Quản trị danh mục
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => void signOut()}
                    className="w-full text-left px-2 py-2 text-sm cursor-pointer border-0"
                    style={{ background: "transparent", color: "var(--spc)" }}
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenu(false)}
                  className="block px-2 py-2 text-sm no-underline"
                  style={{ color: "var(--cnt)" }}
                >
                  Đăng nhập bằng Google
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
