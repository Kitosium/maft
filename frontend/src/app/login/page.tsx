"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useApp } from "../../components/ui/Providers";
import { useDocTitle } from "../../hooks/useDocTitle";

const ERROR_TEXT: Record<string, string> = {
  state: "Phiên đăng nhập hết hạn hoặc không hợp lệ, vui lòng thử lại.",
  exchange: "Đăng nhập Google thất bại, vui lòng thử lại.",
};

function LoginInner() {
  const sp = useSearchParams();
  const err = sp.get("error");
  const { user, reloadAuth } = useApp();
  useDocTitle("Đăng nhập");

  return (
    <div className="max-w-md mx-auto flex flex-col gap-5 py-16 px-4">
      <div className="text-center flex flex-col gap-2">
        <span
          className="text-3xl font-bold"
          style={{ color: "var(--spc)" }}
        >
          Σ
        </span>
        <h1 className="text-2xl font-bold m-0" style={{ color: "var(--cnt)" }}>
          Đăng nhập
        </h1>
        <p className="text-sm m-0" style={{ color: "var(--lite)" }}>
          Dùng tài khoản Google để lưu công thức yêu thích, xem lịch sử và (nếu
          là admin) sửa công thức trực tiếp trên web.
        </p>
      </div>

      {err && (
        <div
          className="text-sm border px-3 py-2.5 text-center"
          style={{
            borderColor: "color-mix(in srgb, #f38ba8 50%, transparent)",
            color: "#f38ba8",
            background: "rgba(243,139,168,0.08)",
          }}
        >
          {ERROR_TEXT[err] ?? "Có lỗi xảy ra khi đăng nhập."}
        </div>
      )}

      {user ? (
        <div
          className="card p-4 text-sm flex flex-col gap-3"
          style={{ color: "var(--lite)" }}
        >
          <div>
            Đã đăng nhập:{" "}
            <span style={{ color: "var(--cnt)" }}>{user.email}</span>
          </div>
          <div className="flex gap-2 justify-center">
            <button
              type="button"
              onClick={() => reloadAuth()}
              className="tag"
            >
              Tải lại trạng thái
            </button>
            <Link href="/" className="tag">
              Về trang chủ
            </Link>
          </div>
        </div>
      ) : (
        <a
          href="/api/auth/google"
          className={
            "flex items-center justify-center gap-3 text-sm font-medium " +
              "px-5 py-3 border no-underline"
          }
          style={{
            borderColor: "color-mix(in srgb, var(--spc) 60%, transparent)",
            color: "var(--spc)",
            background: "color-mix(in srgb, var(--spc) 14%, transparent)",
          }}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              fill="currentColor"
              d={
                "M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3 " +
                  "v2.5h3.2c1.9-1.7 3-4.3 3-7.4z"
              }
            />
            <path
              fill="currentColor"
              opacity="0.85"
              d={
                "M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1 " +
                  "-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z"
              }
            />
            <path
              fill="currentColor"
              opacity="0.7"
              d={
                "M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1 " +
                  "a10 10 0 0 0 0 9.2L6.4 14z"
              }
            />
            <path
              fill="currentColor"
              opacity="0.9"
              d={
                "M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 2.9 14.7 2 12 2 " +
                  "a10 10 0 0 0-8.9 5.4L6.4 10c.8-2.3 3-4.1 5.6-4.1z"
              }
            />
          </svg>
          Tiếp tục với Google
        </a>
      )}

      <Link
        href="/"
        className="text-center text-sm no-underline"
        style={{ color: "var(--lite)" }}
      >
        ← Quay lại thư viện
      </Link>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}
