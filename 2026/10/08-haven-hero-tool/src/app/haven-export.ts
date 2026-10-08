import type {
  ToolcraftProductExportRenderer,
  ToolcraftSceneRect,
} from "@/toolcraft/runtime";

import { drawHavenField } from "./haven-field";
import { exportDrawPass } from "./haven-pipeline";
import { readHavenFieldParams } from "./haven-values";

type CanvasSizeState = Readonly<{
  canvas: Readonly<{ size: Readonly<{ height: number; width: number }> }>;
}>;

export function getHavenSceneRect(state: CanvasSizeState): ToolcraftSceneRect {
  const width = state.canvas.size.width;
  const height = state.canvas.size.height;
  return { height, width, x: -width / 2, y: -height / 2 };
}

export const havenExportRenderer: ToolcraftProductExportRenderer = {
  baseFileName: "haven-hero",
  async renderFrame({ context, frame, rendererPipeline, state }) {
    const params = readHavenFieldParams((target) => state.values[target]);
    const draw = () => {
      context.save();
      try {
        context.translate(frame.x, frame.y);
        drawHavenField(context, frame.width, frame.height, params);
      } finally {
        context.restore();
      }
    };
    if (rendererPipeline) {
      await rendererPipeline.runPass(exportDrawPass, undefined, draw);
    } else {
      draw();
    }
  },
};
