import { useEffect, useRef, type RefObject } from "react";

export type PointerState = {
  x: number;
  y: number;
  intensity: number;
};

export function usePointerTilt(
  containerRef: RefObject<HTMLElement | null>,
  reducedMotion: RefObject<boolean>,
) {
  const pointer = useRef<PointerState>({ x: 0, y: 0, intensity: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onMove = (event: PointerEvent) => {
      if (reducedMotion.current) return;

      const rect = el.getBoundingClientRect();
      const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      pointer.current.x = Math.max(-1, Math.min(1, nx));
      pointer.current.y = Math.max(-1, Math.min(1, ny));
      pointer.current.intensity = 1;
    };

    const onLeave = () => {
      pointer.current.intensity = 0;
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);

    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [containerRef, reducedMotion]);

  return pointer;
}

export function useReducedMotion() {
  const reduced = useRef(
    typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduced.current = mq.matches;

    const onChange = (event: MediaQueryListEvent) => {
      reduced.current = event.matches;
    };

    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
