import { useEffect, useState } from "react";

// One switch for every floating dev overlay (hero picker, perf meter, Tune, feedback toolbar).
// Hidden by default so the page reads like the real site; press ` (backtick) to show or hide them.

const STORAGE_KEY = "haven-dev-tools";
const TOGGLE_KEY = "`";
const listeners = new Set<() => void>();
let visible: boolean | null = null;
let keyListenerInstalled = false;

function readVisible(): boolean {
  if (visible !== null) return visible;
  try {
    // `?tools` in the URL always shows them, e.g. for a shared comparison link.
    visible = new URLSearchParams(window.location.search).has("tools") || localStorage.getItem(STORAGE_KEY) === "shown";
  } catch {
    visible = false;
  }
  return visible;
}

function setVisible(next: boolean) {
  visible = next;
  try {
    localStorage.setItem(STORAGE_KEY, next ? "shown" : "hidden");
  } catch {
    // Storage blocked (private mode): the toggle still works for this page view.
  }
  listeners.forEach((listener) => listener());
}

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

function installKeyListener() {
  if (keyListenerInstalled) return;
  keyListenerInstalled = true;
  window.addEventListener("keydown", (e) => {
    if (e.key !== TOGGLE_KEY || e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
    setVisible(!readVisible());
  });
}

/** True when dev overlays should show. Always false on the server and first render, so hydration matches. */
export function useDevToolsVisible(): boolean {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    installKeyListener();
    const sync = () => setShown(readVisible());
    sync();
    listeners.add(sync);
    return () => {
      listeners.delete(sync);
    };
  }, []);

  return shown;
}
