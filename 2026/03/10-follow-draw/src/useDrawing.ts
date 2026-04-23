import { useRef, useCallback } from "react";
import type { Point, Stroke } from "./types";
import { interpolateStroke, computeLengths } from "./math";
import { setStrokeStyle, drawStrokeFull } from "./drawing";

export function useDrawing() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const currentPointsRef = useRef<Point[]>([]);
  const isDrawingRef = useRef(false);
  const dprRef = useRef(window.devicePixelRatio || 1);

  const getCtx = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext("2d");
  }, []);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    dprRef.current = dpr;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);
  }, []);

  const clearCanvas = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    const canvas = canvasRef.current!;
    ctx.clearRect(0, 0, canvas.width / dprRef.current, canvas.height / dprRef.current);
  }, [getCtx]);

  const redrawAll = useCallback(() => {
    clearCanvas();
    const ctx = getCtx();
    if (!ctx) return;
    setStrokeStyle(ctx);
    for (const stroke of strokesRef.current) {
      drawStrokeFull(ctx, stroke.points);
    }
  }, [getCtx, clearCanvas]);

  const startStroke = useCallback((x: number, y: number) => {
    isDrawingRef.current = true;
    currentPointsRef.current = [{ x, y, timestamp: performance.now() }];
    const ctx = getCtx()!;
    setStrokeStyle(ctx);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }, [getCtx]);

  const continueStroke = useCallback((x: number, y: number) => {
    if (!isDrawingRef.current) return false;

    const pts = currentPointsRef.current;
    const last = pts[pts.length - 1];
    const dx = x - last.x;
    const dy = y - last.y;
    if (dx * dx + dy * dy < 1) return false;

    pts.push({ x, y, timestamp: performance.now() });

    const ctx = getCtx()!;
    setStrokeStyle(ctx);

    if (pts.length >= 3) {
      const p0 = pts[pts.length - 3];
      const p1 = pts[pts.length - 2];
      const p2 = pts[pts.length - 1];
      const mx = (p0.x + p1.x) / 2;
      const my = (p0.y + p1.y) / 2;
      const mx2 = (p1.x + p2.x) / 2;
      const my2 = (p1.y + p2.y) / 2;

      ctx.beginPath();
      ctx.moveTo(mx, my);
      ctx.quadraticCurveTo(p1.x, p1.y, mx2, my2);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    return true;
  }, [getCtx]);

  // Finalize a stroke: interpolate, compute lengths, store it.
  // Returns true if a stroke was added.
  const endStroke = useCallback((): boolean => {
    if (!isDrawingRef.current) return false;
    isDrawingRef.current = false;

    const raw = currentPointsRef.current;
    if (raw.length < 2) {
      currentPointsRef.current = [];
      return false;
    }

    const interpolated = interpolateStroke(raw, 3);
    const { lengths, totalLength } = computeLengths(interpolated);
    strokesRef.current.push({ points: interpolated, lengths, totalLength });
    currentPointsRef.current = [];

    redrawAll();
    return true;
  }, [redrawAll]);

  const resetStrokes = useCallback(() => {
    strokesRef.current = [];
    currentPointsRef.current = [];
    isDrawingRef.current = false;
    clearCanvas();
  }, [clearCanvas]);

  return {
    canvasRef,
    strokesRef,
    dprRef,
    isDrawingRef,
    getCtx,
    setupCanvas,
    clearCanvas,
    redrawAll,
    startStroke,
    continueStroke,
    endStroke,
    resetStrokes,
  };
}
