"use client";

import dynamic from "next/dynamic";

/** Agentation feedback toolbar, dev only: the import is stripped from production builds. */
const Toolbar =
  process.env.NODE_ENV === "development"
    ? dynamic(() => import("agentation").then((m) => m.Agentation), { ssr: false })
    : () => null;

export function DevAgentation() {
  return <Toolbar appName="Haven site" />;
}
