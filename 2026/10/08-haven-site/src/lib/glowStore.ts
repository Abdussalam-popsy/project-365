import { useEffect, useState } from "react";
import { ctaGlow, type GlowValues } from "@/content/ctaGlow";
import { tuningEnabled } from "./tuning";

// Live edits to the closing section's glow, shared between the editor panel and the section itself.
// Only active where tuning is (dev, or ?tune); visitors always get the values in src/content/ctaGlow.ts.

const STORAGE_KEY = "haven-cta-glow-tool";
const listeners = new Set<() => void>();
let override: GlowValues | null = null;
let editing = false;
let loaded = false;

function load() {
  if (loaded) return;
  loaded = true;
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (saved && typeof saved === "object") override = { ...ctaGlow, ...saved };
  } catch {
    // Unreadable or blocked storage: start from the site values.
  }
}

function emit() {
  listeners.forEach((listener) => listener());
}

export function setGlow(patch: Partial<GlowValues>) {
  override = { ...(override ?? ctaGlow), ...patch };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(override));
  } catch {
    // Storage blocked: edits still apply for this visit.
  }
  emit();
}

export function resetGlow() {
  override = null;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing saved to clear.
  }
  emit();
}

/** Whether the editor panel is open (the section shows its drag layer while it is). */
export function setGlowEditing(next: boolean) {
  editing = next;
  emit();
}

/**
 * The glow values to draw, plus whether the editor is open. The first render always returns the site values
 * (so server and browser HTML match); saved edits arrive after mount, and only where tuning is enabled.
 */
export function useGlow() {
  const [state, setState] = useState<{ values: GlowValues; editing: boolean }>({ values: ctaGlow, editing: false });

  useEffect(() => {
    if (!tuningEnabled()) return;
    load();
    const sync = () => setState({ values: override ?? ctaGlow, editing });
    sync();
    listeners.add(sync);
    return () => {
      listeners.delete(sync);
    };
  }, []);

  return state;
}
