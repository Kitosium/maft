"use client";

export default function CategoryError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <div className="max-w-xl mx-auto flex flex-col gap-4 py-16 px-4 text-center">
      <span
        className="text-3xl font-bold"
        style={{ color: "var(--spc)" }}
      >
        Σ
      </span>
      <h1 className="text-2xl font-bold m-0" style={{ color: "var(--cnt)" }}>
        Đã xảy ra lỗi
      </h1>
      <p className="text-sm m-0" style={{ color: "var(--lite)" }}>
        Trang danh mục gặp lỗi khi tải. Vui lòng thử lại.
      </p>
      <div
        className="border p-3 text-xs text-left break-all"
        style={{ borderColor: "var(--line)", color: "var(--lite)" }}
      >
        {error.message}
      </div>
      <a
        href="/"
        className="text-sm px-4 py-2 border no-underline self-center"
        style={{
          borderColor: "color-mix(in srgb, var(--spc) 60%, transparent)",
          color: "var(--spc)",
          background: "color-mix(in srgb, var(--spc) 14%, transparent)",
        }}
      >
        Về trang chủ
      </a>
    </div>
  );
}
