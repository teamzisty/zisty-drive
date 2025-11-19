"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function TitleSetter() {
  const pathname = usePathname();

  useEffect(() => {
    const titles: Record<string, string> = {
      "/files": "Files - Zisty Drive",
      "/favorites": "Favorites - Zisty Drive",
    };

    document.title = titles[pathname] || "Zisty Drive";
  }, [pathname]);

  return null;
}