"use client";

import { useCallback, useEffect, useState, type PointerEvent } from "react";
import { useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";

const SPRING = { stiffness: 50, damping: 16, mass: 0.8 };

/**
 * Tips the scene a couple of degrees toward the mouse, like a model on a table. Mouse only (touch and pens
 * leave it flat), and off for reduced motion. Spread `handlers` on the element that tracks the pointer.
 */
export function useTilt(maxDegrees = 2) {
  const reduce = useReducedMotion();
  const [finePointer, setFinePointer] = useState(false);
  useEffect(() => setFinePointer(window.matchMedia("(hover: hover) and (pointer: fine)").matches), []);
  const enabled = finePointer && !reduce;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateY = useTransform(useSpring(x, SPRING), (v) => v * maxDegrees);
  const rotateX = useTransform(useSpring(y, SPRING), (v) => v * -maxDegrees * 0.6);

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (!enabled || event.pointerType !== "mouse") return;
      const rect = event.currentTarget.getBoundingClientRect();
      x.set(((event.clientX - rect.left) / rect.width) * 2 - 1);
      y.set(((event.clientY - rect.top) / rect.height) * 2 - 1);
    },
    [enabled, x, y],
  );
  const onPointerLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return { rotateX, rotateY, handlers: { onPointerMove, onPointerLeave } };
}
