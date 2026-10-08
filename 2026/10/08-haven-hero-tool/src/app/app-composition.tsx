import { composeToolcraftApp } from "@/toolcraft/runtime/react";

import { HavenFieldCanvas } from "./haven-canvas";
import { getHavenSceneRect, havenExportRenderer } from "./haven-export";
import { appRendererPipelineRegistration } from "./haven-pipeline";
import { appSchema } from "./app-schema";

export const appComposition = composeToolcraftApp(appSchema, {
  renderer: { pipelineRegistration: appRendererPipelineRegistration },
  scene: {
    canvasContent: <HavenFieldCanvas />,
    rasterFrameRenderer: havenExportRenderer,
    renderDefaultCanvasMedia: false,
    sceneBoundsProvider: ({ state }) => [getHavenSceneRect(state)],
  },
});
