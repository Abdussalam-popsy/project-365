import { useState, useEffect, useCallback } from "react";
import { useDrawing } from "./useDrawing";
import { useAnimation } from "./useAnimation";

export default function FollowDraw() {
  const [showInstructions, setShowInstructions] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [animDone, setAnimDone] = useState(false);

  const {
    canvasRef,
    strokesRef,
    dprRef,
    getCtx,
    setupCanvas,
    redrawAll,
    startStroke,
    continueStroke,
    endStroke,
    resetStrokes,
  } = useDrawing();

  const onAnimStart = useCallback(() => {
    setIsPlaying(true);
    setAnimDone(false);
  }, []);

  const onAnimEnd = useCallback(() => {
    setIsPlaying(false);
    setAnimDone(true);
  }, []);

  const { play, cancel: cancelAnim, animFrameRef } = useAnimation({
    getCtx,
    strokesRef,
    dprRef,
    onStart: onAnimStart,
    onEnd: onAnimEnd,
  });

  // --- Pointer handlers ---
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (isPlaying) return;
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      if (showInstructions) setShowInstructions(false);

      const rect = canvasRef.current!.getBoundingClientRect();
      startStroke(e.clientX - rect.left, e.clientY - rect.top);
    },
    [isPlaying, showInstructions, canvasRef, startStroke]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      const rect = canvasRef.current!.getBoundingClientRect();
      continueStroke(e.clientX - rect.left, e.clientY - rect.top);
    },
    [canvasRef, continueStroke]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      if (endStroke()) {
        if (!hasDrawn) setHasDrawn(true);
        setAnimDone(false);
      }
    },
    [endStroke, hasDrawn]
  );

  // --- Reset ---
  const resetCanvas = useCallback(() => {
    cancelAnim();
    resetStrokes();
    setHasDrawn(false);
    setIsPlaying(false);
    setAnimDone(false);
    setShowInstructions(true);
  }, [cancelAnim, resetStrokes]);

  // --- Keyboard: Enter to play ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !isPlaying && strokesRef.current && strokesRef.current.length > 0) {
        e.preventDefault();
        play();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, play, strokesRef]);

  // --- Resize ---
  useEffect(() => {
    const handleResize = () => {
      setupCanvas();
      if (!isPlaying) redrawAll();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setupCanvas, redrawAll, isPlaying]);

  // --- Initial setup + cleanup ---
  useEffect(() => {
    setupCanvas();
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [setupCanvas, animFrameRef]);

  // --- Prevent touch scrolling ---
  useEffect(() => {
    const prevent = (e: TouchEvent) => e.preventDefault();
    document.addEventListener("touchmove", prevent, { passive: false });
    return () => document.removeEventListener("touchmove", prevent);
  }, []);

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{
        background: "#faf9f6",
        backgroundImage:
          "radial-gradient(circle at 20% 50%, rgba(0,0,0,0.015) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(0,0,0,0.01) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(0,0,0,0.012) 0%, transparent 40%)",
      }}
    >
      {/* Paper noise texture */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          opacity: 0.03,
          mixBlendMode: "multiply",
        }}
      />

      <canvas
        ref={canvasRef}
        className="fixed inset-0 cursor-crosshair"
        style={{ touchAction: "none" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />

      {/* Instructions */}
      <div
        className="fixed inset-0 flex items-center justify-center pointer-events-none select-none"
        style={{
          opacity: showInstructions ? 1 : 0,
          transition: "opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <p
          className="text-base tracking-wide"
          style={{ color: "rgba(0,0,0,0.25)", fontFamily: "system-ui, sans-serif" }}
        >
          Draw anything, then press Enter
        </p>
      </div>

      {/* Clear button */}
      {hasDrawn && !isPlaying && (
        <button
          onClick={resetCanvas}
          className="fixed top-5 right-5 px-3 py-1.5 rounded-full text-xs tracking-wide cursor-pointer"
          style={{
            background: "rgba(0,0,0,0.06)",
            color: "rgba(0,0,0,0.4)",
            fontFamily: "system-ui, sans-serif",
            border: "none",
            transition: "background 0.2s, color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(0,0,0,0.1)";
            e.currentTarget.style.color = "rgba(0,0,0,0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(0,0,0,0.06)";
            e.currentTarget.style.color = "rgba(0,0,0,0.4)";
          }}
        >
          Clear
        </button>
      )}

      {/* Status badge */}
      {(isPlaying || animDone) && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 pointer-events-none">
          <div
            className="px-4 py-1.5 rounded-full text-xs tracking-wide"
            style={{
              background: "rgba(0,0,0,0.06)",
              color: "rgba(0,0,0,0.4)",
              fontFamily: "system-ui, sans-serif",
              animation: isPlaying ? "pulse-badge 2s ease-in-out infinite" : "none",
            }}
          >
            {isPlaying ? "Playing..." : "Press Enter to replay"}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse-badge {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
