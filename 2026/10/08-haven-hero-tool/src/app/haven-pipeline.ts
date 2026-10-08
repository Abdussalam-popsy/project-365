import { registerToolcraftRendererPipeline } from "@/toolcraft/runtime";
import type { ToolcraftRendererPipelinePassContract } from "@/toolcraft/runtime";

type HavenRendererPasses = {
  "export-draw": ToolcraftRendererPipelinePassContract<void>;
  "preview-draw": ToolcraftRendererPipelinePassContract<void>;
};

const fieldTargets = [
  "field.glowColor",
  "field.accentColor",
  "field.lineColor",
  "field.glowIntensity",
  "field.gridDensity",
  "field.horizon",
  "field.lineOpacity",
  "field.signalCount",
  "field.phase",
] as const;

const sceneBounds = {
  kind: "intrinsic",
  reason: "The signal field is authored to exactly fill the hero artboard rectangle.",
} as const;

export const appRendererPipelineRegistration =
  registerToolcraftRendererPipeline<HavenRendererPasses>()({
    interactionInvalidation: [
      { interaction: "initial-render", invalidates: ["preview-draw"], targets: ["canvas.initial-render"] },
      {
        interaction: "control-drag",
        invalidates: ["preview-draw"],
        targets: [
          "field.glowIntensity",
          "field.gridDensity",
          "field.horizon",
          "field.lineOpacity",
          "field.signalCount",
          "field.phase",
        ],
      },
      {
        interaction: "control-change",
        invalidates: ["preview-draw"],
        targets: [
          "field.glowColor",
          "field.accentColor",
          "field.lineColor",
          "export.includeBackground",
          "appearance.background",
          "canvas.infinity",
          "canvas.aspectRatio",
          "canvas.size.width",
          "canvas.size.height",
          "canvas.renderScale",
        ],
      },
      { interaction: "viewport-drag", invalidates: ["preview-draw"], targets: ["canvas.viewport.offset"] },
      { interaction: "viewport-zoom", invalidates: ["preview-draw"], targets: ["canvas.viewport.zoom"] },
      { interaction: "export", invalidates: ["export-draw"], mustNotInvalidate: ["preview-draw"], targets: ["actions.output"] },
    ],
    passes: [
      {
        cost: { dimensions: ["preview-pixels", "grid-lanes", "signal-count"], frequency: "interaction", relationship: "linear" },
        id: "preview-draw",
        inputs: [...fieldTargets, "canvas.backing.width", "canvas.backing.height"],
        invalidatedBy: [...fieldTargets, "canvas.backing.width", "canvas.backing.height"],
        kind: "rasterize",
        lifecycle: { cache: "none", resourceScope: "call" },
        output: "preview",
        quality: "retina",
        runsOn: "main",
        sceneBounds,
      },
      {
        cost: { dimensions: ["export-pixels", "grid-lanes", "signal-count"], frequency: "batch", relationship: "linear" },
        id: "export-draw",
        inputs: [...fieldTargets, "destination.context"],
        invalidatedBy: [...fieldTargets, "destination.context"],
        kind: "export",
        lifecycle: { cache: "none", resourceScope: "call" },
        output: "export",
        quality: "export",
        runsOn: "main",
      },
    ],
    runtimeId: "haven-signal-field-canvas2d-v1",
  });

export const previewDrawPass = appRendererPipelineRegistration.getPass("preview-draw");
export const exportDrawPass = appRendererPipelineRegistration.getPass("export-draw");
