import * as React from "react";
import {
  useToolcraftPipeline,
  useToolcraftProductSceneFrame,
  useToolcraftValue,
} from "@/toolcraft/runtime/react";

import { drawHavenField } from "./haven-field";
import { previewDrawPass } from "./haven-pipeline";
import { readHavenFieldParams, readRenderScale } from "./haven-values";

export function HavenFieldCanvas(): React.JSX.Element | null {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const sceneFrame = useToolcraftProductSceneFrame();
  const pipeline = useToolcraftPipeline();
  const renderScale = readRenderScale(useToolcraftValue("canvas.renderScale"));
  const values = {
    "field.accentColor": useToolcraftValue("field.accentColor"),
    "field.glowColor": useToolcraftValue("field.glowColor"),
    "field.glowIntensity": useToolcraftValue("field.glowIntensity"),
    "field.gridDensity": useToolcraftValue("field.gridDensity"),
    "field.horizon": useToolcraftValue("field.horizon"),
    "field.lineColor": useToolcraftValue("field.lineColor"),
    "field.lineOpacity": useToolcraftValue("field.lineOpacity"),
    "field.phase": useToolcraftValue("field.phase"),
    "field.signalCount": useToolcraftValue("field.signalCount"),
  } as Record<string, unknown>;
  const params = readHavenFieldParams((target) => values[target]);
  const paramsKey = JSON.stringify(params);
  const cssWidth = sceneFrame.kind === "ready" ? sceneFrame.rect.width : 0;
  const cssHeight = sceneFrame.kind === "ready" ? sceneFrame.rect.height : 0;
  const dpr = typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
  const backingWidth = Math.ceil(cssWidth * dpr * renderScale);
  const backingHeight = Math.ceil(cssHeight * dpr * renderScale);

  React.useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || backingWidth === 0 || backingHeight === 0) return;
    const draw = () => {
      if (canvas.width !== backingWidth) canvas.width = backingWidth;
      if (canvas.height !== backingHeight) canvas.height = backingHeight;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, backingWidth, backingHeight);
      context.scale(backingWidth / cssWidth, backingHeight / cssHeight);
      drawHavenField(context, cssWidth, cssHeight, JSON.parse(paramsKey));
    };
    if (pipeline) {
      void pipeline.runPass(previewDrawPass, undefined, draw);
    } else {
      draw();
    }
  }, [backingHeight, backingWidth, cssHeight, cssWidth, paramsKey, pipeline]);

  if (sceneFrame.kind !== "ready") return null;
  return (
    <canvas
      data-haven-backing-height={backingHeight}
      data-haven-backing-width={backingWidth}
      data-haven-field=""
      ref={canvasRef}
      style={{ display: "block", height: "100%", width: "100%" }}
    />
  );
}
