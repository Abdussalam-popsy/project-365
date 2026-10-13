"use client";

import { useEffect, useState } from "react";

/** How often Haven "picks up" a new house, and how long its card stays (long enough to play out) before the gap. */
const CYCLE_MS = 7000;
const SHOW_MS = 6000;
const FIRST_DELAY_MS = 1400;

/**
 * Steps through the houses one at a time while `running`, skipping any that are cropped off screen
 * (on phones the art is cut to its right-hand side). Returns the house currently showing, or null.
 */
export function useHouseCycle(ids: readonly string[], running: boolean, isOnScreen: (id: string) => boolean) {
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    if (!running) {
      setCurrent(null);
      return;
    }
    let next = 0;
    let hide: ReturnType<typeof setTimeout> | undefined;
    const tick = () => {
      const visible = ids.findIndex((_, k) => isOnScreen(ids[(next + k) % ids.length]));
      if (visible === -1) return;
      const index = (next + visible) % ids.length;
      next = index + 1;
      setCurrent(ids[index]);
      hide = setTimeout(() => setCurrent(null), SHOW_MS);
    };
    let interval: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      tick();
      interval = setInterval(tick, CYCLE_MS);
    }, FIRST_DELAY_MS);
    return () => {
      clearTimeout(start);
      clearTimeout(hide);
      clearInterval(interval);
    };
  }, [ids, running, isOnScreen]);

  return current;
}
