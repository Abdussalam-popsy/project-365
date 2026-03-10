import { useRef, useCallback } from "react";
import type { Stroke } from "./types";
import { cubicBezierEase, findPointAtDistance } from "./math";
import { setStrokeStyle, drawStrokeFull, drawStrokeWithTaper, STROKE_WIDTH } from "./drawing";

interface UseAnimationOptions {
  getCtx: () => CanvasRenderingContext2D | null;
  strokesRef: React.RefObject<Stroke[]>;
  dprRef: React.RefObject<number>;
  onStart: () => void;
  onEnd: () => void;
}

export function useAnimation({ getCtx, strokesRef, dprRef, onStart, onEnd }: UseAnimationOptions) {
  const animFrameRef = useRef<number>(0);

  const cancel = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }
  }, []);

  const play = useCallback(() => {
    const strokes = strokesRef.current;
    if (!strokes || strokes.length === 0) return;

    const ctx = getCtx();
    const canvas = ctx?.canvas;
    if (!ctx || !canvas) return;

    onStart();

    const w = canvas.width / dprRef.current;
    const h = canvas.height / dprRef.current;

    const MIN_DUR = 800;
    const MAX_DUR = 2400;
    const PAUSE = 120;

    const durations = strokes.map((s) => {
      const dur = (s.totalLength / 200) * 800;
      return Math.max(MIN_DUR, Math.min(MAX_DUR, dur));
    });

    const timeline: { strokeIndex: number; startTime: number; duration: number }[] = [];
    let t = 0;
    for (let i = 0; i < strokes.length; i++) {
      timeline.push({ strokeIndex: i, startTime: t, duration: durations[i] });
      t += durations[i] + PAUSE;
    }
    const totalDuration = t - PAUSE;

    const startTime = performance.now();

    const frame = () => {
      const elapsed = performance.now() - startTime;

      ctx.clearRect(0, 0, w, h);
      setStrokeStyle(ctx);

      for (const entry of timeline) {
        const stroke = strokes[entry.strokeIndex];
        const localElapsed = elapsed - entry.startTime;

        if (localElapsed <= 0) continue;

        if (localElapsed >= entry.duration) {
          drawStrokeFull(ctx, stroke.points);
          continue;
        }

        const rawT = localElapsed / entry.duration;
        const easedT = cubicBezierEase(rawT);
        const dist = easedT * stroke.totalLength;
        const { index, frac } = findPointAtDistance(stroke.lengths, dist);

        drawStrokeWithTaper(ctx, stroke.points, index, frac, stroke.lengths, dist, STROKE_WIDTH);
      }

      if (elapsed < totalDuration) {
        animFrameRef.current = requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, w, h);
        setStrokeStyle(ctx);
        for (const stroke of strokes) {
          drawStrokeFull(ctx, stroke.points);
        }
        onEnd();
      }
    };

    animFrameRef.current = requestAnimationFrame(frame);
  }, [getCtx, strokesRef, dprRef, onStart, onEnd]);

  return { play, cancel, animFrameRef };
}
