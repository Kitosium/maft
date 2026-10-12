import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "../components/ui/Providers";
import { Shell } from "../components/shell/Shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maft",
  description: "Maft - Project No.1 - Dự án MA"
};

const bootScript = `try{
var q=new URLSearchParams(location.search).get("theme");
var t=q||localStorage.getItem("maft-theme");
var v=t==="light"?"light":"dark";
document.documentElement.dataset.theme=t?v:"dark";
}catch(e){document.documentElement.dataset.theme="dark";}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        <Providers>
          <Shell>{children}</Shell>
        </Providers>
      </body>
    </html>
  );
}
