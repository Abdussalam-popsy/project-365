import { defineToolcraft, imageExportModule } from "@/toolcraft/runtime";

import appDefaults from "./app-defaults.json" with { type: "json" };
import { appIdentity } from "./app-identity";

export const appSchema = defineToolcraft({
  defaults: appDefaults,
  base: {
    canvas: {
      enabled: true,
      renderScale: true,
      size: { height: 900, unit: "px", width: 1440 },
      sizing: { mode: "editable-output" },
    },
    identity: appIdentity,
    panels: {
      controls: {
        sections: [
          {
            controls: {
              glowColor: {
                applicability: { mode: "always" },
                defaultValue: "#5740EF",
                label: "Glow",
                performanceRole: "responsiveness",
                semanticGroup: "glow",
                target: "field.glowColor",
                type: "color",
              },
              accentColor: {
                applicability: { mode: "always" },
                defaultValue: "#C9C1FF",
                label: "Signal",
                performanceRole: "responsiveness",
                semanticGroup: "signal",
                target: "field.accentColor",
                type: "color",
              },
              lineColor: {
                applicability: { mode: "always" },
                defaultValue: "#8B7BFF",
                label: "Grid",
                performanceRole: "responsiveness",
                semanticGroup: "grid",
                target: "field.lineColor",
                type: "color",
              },
              glowIntensity: {
                applicability: { mode: "always" },
                defaultValue: 0.55,
                label: "Glow intensity",
                max: 1,
                min: 0,
                performanceRole: "responsiveness",
                sliderValueKind: "continuous",
                step: 0.01,
                target: "field.glowIntensity",
                type: "slider",
              },
            },
            id: "palette",
            title: "Palette",
          },
          {
            controls: {
              gridDensity: {
                applicability: { mode: "always" },
                defaultValue: 22,
                description: "Number of perspective lanes across the floor.",
                label: "Density",
                max: 40,
                min: 6,
                performanceReason:
                  "Lane and row counts scale the stroked line count per frame.",
                performanceRole: "workload",
                sliderValueKind: "discrete",
                step: 1,
                target: "field.gridDensity",
                type: "slider",
              },
              horizon: {
                applicability: { mode: "always" },
                defaultValue: 0.58,
                label: "Horizon",
                max: 0.8,
                min: 0.35,
                performanceRole: "responsiveness",
                sliderValueKind: "continuous",
                step: 0.01,
                target: "field.horizon",
                type: "slider",
              },
              lineOpacity: {
                applicability: { mode: "always" },
                defaultValue: 0.35,
                label: "Line opacity",
                max: 1,
                min: 0,
                performanceRole: "responsiveness",
                sliderValueKind: "continuous",
                step: 0.01,
                target: "field.lineOpacity",
                type: "slider",
              },
            },
            id: "grid",
            title: "Grid",
          },
          {
            controls: {
              signalCount: {
                applicability: { mode: "always" },
                defaultValue: 9,
                description: "Pulsing request points placed on the floor.",
                label: "Count",
                max: 24,
                min: 0,
                performanceReason:
                  "Each signal adds two rings, a glow and a beam per frame.",
                performanceRole: "workload",
                sliderValueKind: "discrete",
                step: 1,
                target: "field.signalCount",
                type: "slider",
              },
              phase: {
                applicability: { mode: "always" },
                defaultValue: 0.3,
                description:
                  "Position in the seamless loop: grid scroll, ring ripples and glow drift.",
                label: "Phase",
                max: 1,
                min: 0,
                performanceRole: "responsiveness",
                sliderValueKind: "continuous",
                step: 0.01,
                target: "field.phase",
                type: "slider",
              },
            },
            id: "signals",
            title: "Signals",
          },
          {
            controls: {
              includeBackground: {
                applicability: { mode: "always" },
                defaultValue: true,
                description:
                  "Controls the plum background in preview and image output.",
                label: "Include",
                performanceRole: "responsiveness",
                target: "export.includeBackground",
                type: "switch",
              },
              background: {
                applicability: { mode: "always" },
                defaultValue: "#0B062A",
                label: false,
                performanceRole: "responsiveness",
                target: "appearance.background",
                type: "color",
              },
            },
            id: "background",
            layoutGroups: [
              {
                columns: 2,
                controls: ["includeBackground", "background"],
                layout: "inline",
              },
            ],
            title: "Background",
          },
        ],
        title: "Haven Hero Controls",
      },
    },
    toolbar: {
      history: true,
      radar: true,
      zoom: true,
    },
  },
  modules: [imageExportModule()],
});
