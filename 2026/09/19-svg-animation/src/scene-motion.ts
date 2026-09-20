export const agents = [
  {
    id: "scheduling",
    title: "Scheduling",
    label: "Your carers",
    accent: "#00d3c3",
    top: 600,
    lineStart: 530,
  },
  {
    id: "onboarding",
    title: "Onboarding",
    label: "Your team",
    accent: "#f5ce63",
    top: 640.5,
    lineStart: 582,
  },
  {
    id: "retention",
    title: "Retention",
    label: "Keeping the team",
    accent: "#f28ebd",
    top: 681,
    lineStart: 731,
  },
  {
    id: "payroll",
    title: "Payroll",
    label: "Paying the team",
    accent: "#ffbc8b",
    top: 721.5,
    lineStart: 787,
  },
] as const;

export const headings = [
  "Four agents\nworking side by side",
  ...agents.map((agent) => agent.title),
  "Four agents\nworking side by side",
];

const markerAccents = [
  "#3b4864",
  ...agents.map((agent) => agent.accent),
  "#3b4864",
];

const positions = [
  [0, 0, 0, 0],
  [-120, 0, 0, 0],
  [-450, -120, 0, 0],
  [-450, -450, 0, 0],
  [-450, -450, -450, 0],
  [-450, -450, -450, -450],
];

export function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

function ease(start: number, end: number, value: number) {
  const t = clamp((value - start) / (end - start));
  return t * t * t * (t * (t * 6 - 15) + 10);
}

export function getSceneFrame(progress: number) {
  const time = clamp(progress) * (positions.length - 1);
  const stage = Math.min(Math.floor(time), positions.length - 2);
  const blend = ease(0.18, 0.82, time - stage);
  const cards = positions[stage].map(
    (position, index) =>
      position + (positions[stage + 1][index] - position) * blend,
  );

  return {
    cards,
    focus: agents.map((_, index) =>
      index + 1 === stage ? 1 - blend : index === stage ? blend : 0,
    ),
    marker: {
      offset: Math.max(1 - time, 0) - Math.max(time - agents.length, 0),
      from: markerAccents[stage],
      to: markerAccents[stage + 1],
      blend,
      draw: clamp(time),
    },
    callouts: agents.map((agent, index) => {
      const local = time - (index + 1);
      const line = ease(-0.34, -0.12, local) * (1 - ease(0.3, 0.48, local));
      const text = ease(-0.18, 0, local) * (1 - ease(0.2, 0.34, local));
      return {
        line,
        opacity: text,
        textY: 8 * (1 - ease(-0.18, 0, local)) - 5 * ease(0.2, 0.34, local),
        y:
          agent.top +
          (274 - 206.088) / Math.sqrt(3) +
          cards[index] -
          agent.lineStart,
      };
    }),
  };
}
