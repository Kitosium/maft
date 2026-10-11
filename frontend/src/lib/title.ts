import { useEffect } from "react";

export const useDocTitle = (name: string | null): void => {
  useEffect(() => {
    document.title = name ? `Maft / ${name}` : "Maft";
  }, [name]);
};
