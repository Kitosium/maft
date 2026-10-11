"use client";

import dynamic from "next/dynamic";
import { useApp } from "../ui/Providers";

const MaftCanvas = dynamic(
  () =>
    import("@maft/canvas").then((m) => ({
      default: m.MaftCanvas,
    })),
  { ssr: false },
);

type P = { txt: string; fs?: number; className?: string };

export const MaftTex = ({ txt, fs = 16, className }: P) => {
  const { thm } = useApp();
  return (
    <div className={className ?? ""}>
      <MaftCanvas vew="stat" txt={txt} fs={fs} thm={thm} />
    </div>
  );
};
