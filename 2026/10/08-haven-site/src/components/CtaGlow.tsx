"use client";

import { useRef } from "react";
import { glowBackground } from "@/content/ctaGlow";
import { setGlow, useGlow } from "@/lib/glowStore";

/**
 * The closing section's background glow. Visitors get the values in src/content/ctaGlow.ts. In dev, the
 * "Closing glow" editor (dev tools, § or `) edits it live, and while that editor is open you can click or drag
 * on the section itself to move the glow.
 */
export function CtaGlow() {
  const { values, editing } = useGlow();
  const layer = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const moveTo = (clientX: number, clientY: number) => {
    const rect = layer.current?.getBoundingClientRect();
    if (!rect) return;
    setGlow({
      x: Math.round(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))),
      y: Math.round(Math.min(130, Math.max(-20, ((clientY - rect.top) / rect.height) * 100))),
    });
  };

  return (
    <>
      <div
        className="absolute inset-0"
        aria-hidden
        style={{ backgroundColor: values.background, backgroundImage: glowBackground(values) }}
      />
      {editing && (
        // Sits above the section's text and buttons while editing, so a drag anywhere moves the glow.
        <div
          ref={layer}
          className="absolute inset-0 z-20 cursor-crosshair touch-none outline-2 -outline-offset-2 outline-lilac/40 outline-dashed"
          onPointerDown={(e) => {
            dragging.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            moveTo(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => dragging.current && moveTo(e.clientX, e.clientY)}
          onPointerUp={() => (dragging.current = false)}
          aria-hidden
        >
          <span
            className="pointer-events-none absolute size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-white/20 shadow-[0_0_0_4px_rgba(0,0,0,0.25)]"
            style={{ left: `${values.x}%`, top: `${values.y}%` }}
          />
        </div>
      )}
    </>
  );
}
