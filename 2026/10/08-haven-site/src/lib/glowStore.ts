import { useEffect, useState } from "react";
import { glows, type GlowId, type GlowValues } from "@/content/glows";
import { tuningEnabled } from "./tuning";

// Live edits to the section glows, shared between the editor panel and the sections themselves.
// Only active where tuning is (dev, or ?tune); visitors always get the values in src/content/glows.ts.

const storageKey = (id: GlowId) => (id === "closing" ? "haven-cta-glow-tool" : `haven-glow-${id}`);
const listeners = new Set<() => void>();
const overrides: Partial<Record<GlowId, GlowValues>> = {};
let editing: GlowId | null = null;
const loaded = new Set<GlowId>();

function load(id: GlowId) {
  if (loaded.has(id)) return;
  loaded.add(id);
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(id)) ?? "null");
    if (saved && typeof saved === "object") overrides[id] = { ...glows[id], ...saved };
  } catch {
    // Unreadable or blocked storage: start from the site values.
  }
}

function emit() {
  listeners.forEach((listener) => listener());
}

export function setGlow(id: GlowId, patch: Partial<GlowValues>) {
  overrides[id] = { ...(overrides[id] ?? glows[id]), ...patch };
  try {
    localStorage.setItem(storageKey(id), JSON.stringify(overrides[id]));
  } catch {
    // Storage blocked: edits still apply for this visit.
  }
  emit();
}

export function resetGlow(id: GlowId) {
  delete overrides[id];
  try {
    localStorage.removeItem(storageKey(id));
  } catch {
    // Nothing saved to clear.
  }
  emit();
}

/** Which glow the editor has open (that section shows its drag layer), or null. */
export function setGlowEditing(next: GlowId | null) {
  editing = next;
  emit();
}

/**
 * One glow's values to draw, plus whether the editor has it open. The first render always returns the site
 * values (so server and browser HTML match); saved edits arrive after mount, and only where tuning is enabled.
 */
export function useGlow(id: GlowId) {
  const [state, setState] = useState<{ values: GlowValues; editing: boolean }>({ values: glows[id], editing: false });

  useEffect(() => {
    if (!tuningEnabled()) return;
    load(id);
    const sync = () => setState({ values: overrides[id] ?? glows[id], editing: editing === id });
    sync();
    listeners.add(sync);
    return () => {
      listeners.delete(sync);
    };
  }, [id]);

  return state;
}
