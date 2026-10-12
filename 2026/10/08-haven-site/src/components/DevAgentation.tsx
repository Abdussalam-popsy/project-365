"use client";

import dynamic from "next/dynamic";
import { useDevToolsVisible } from "@/lib/devTools";

/** Agentation feedback toolbar, dev only: the import is stripped from production builds. */
const Toolbar =
  process.env.NODE_ENV === "development"
    ? dynamic(() => import("agentation").then((m) => m.Agentation), { ssr: false })
    : () => null;

export function DevAgentation() {
  const visible = useDevToolsVisible();
  return visible ? <Toolbar appName="Haven site" /> : null;
}
