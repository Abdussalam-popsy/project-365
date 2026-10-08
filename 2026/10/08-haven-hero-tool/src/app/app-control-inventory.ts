import type { ToolcraftControlSectionInventoryEntry } from "./acceptance/types";

export const appControlSectionInventory: readonly ToolcraftControlSectionInventoryEntry[] = [
  {
    entity: "Field palette",
    entityId: "field-palette",
    finiteSelectors: [],
    groupingReason: "Glow, signal and grid colors plus glow strength jointly set the field's color identity.",
    id: "palette",
    targets: ["field.glowColor", "field.accentColor", "field.lineColor", "field.glowIntensity"],
    title: "Palette",
  },
  {
    entity: "Perspective grid",
    entityId: "perspective-grid",
    finiteSelectors: [],
    groupingReason: "Lane density, horizon height and line opacity jointly define the floor geometry.",
    id: "grid",
    targets: ["field.gridDensity", "field.horizon", "field.lineOpacity"],
    title: "Grid",
  },
  {
    entity: "Request signals",
    entityId: "request-signals",
    finiteSelectors: [],
    groupingReason: "Signal count and loop phase jointly define which pulses appear and where they are in their ripple.",
    id: "signals",
    targets: ["field.signalCount", "field.phase"],
    title: "Signals",
  },
  {
    entity: "Output background",
    entityId: "output-background",
    finiteSelectors: [
      {
        affectedTargets: ["appearance.background"],
        reason: "Background inclusion determines whether its color affects output.",
        role: "branch",
        target: "export.includeBackground",
      },
    ],
    groupingReason: "Inclusion and color jointly define the preview and exported field background.",
    id: "background",
    targets: ["export.includeBackground", "appearance.background"],
    title: "Background",
  },
  {
    entity: "Image delivery",
    entityId: "image-delivery",
    finiteSelectors: [
      { reason: "Image format changes its own exported artifact encoding.", role: "parameter", target: "export.image.format" },
      { reason: "Image resolution changes its own exported artifact dimensions.", role: "parameter", target: "export.image.resolution" },
    ],
    groupingReason: "Format and resolution jointly configure the exported hero image.",
    id: "runtime.image-export",
    targets: ["export.image.format", "export.image.resolution"],
    title: "Image Export",
  },
];
