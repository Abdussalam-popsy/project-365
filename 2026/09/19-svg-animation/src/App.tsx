import { useLayoutEffect, useRef, type SVGProps } from "react";
import sceneSource from "./assets/scene-updated.svg?raw";
import calloutSource from "./assets/callouts.svg?raw";
import { agents, clamp, getSceneFrame, headings } from "./scene-motion";

type Path = SVGProps<SVGPathElement>;

const cardPalette: Record<string, string> = {
  white: "var(--card-face)",
  black: "var(--card-ink)",
  "#c0d8fb": "var(--card-light-side)",
  "#94bdfa": "var(--card-blue-side)",
  "#0d2872": "var(--card-recess)",
};

function cardPaint(paint?: string) {
  return paint ? (cardPalette[paint.toLowerCase()] ?? paint) : undefined;
}

function readSvg(source: string) {
  const document = new DOMParser().parseFromString(source, "image/svg+xml");
  if (document.querySelector("parsererror"))
    throw new Error("Invalid scene SVG");
  return document;
}

function readPaths(source: ParentNode): Path[] {
  return Array.from(source.querySelectorAll("path"), (path) => ({
    d: path.getAttribute("d") ?? "",
    fill: path.getAttribute("fill") ?? "none",
    stroke: path.getAttribute("stroke") ?? undefined,
    strokeWidth: path.getAttribute("stroke-width") ?? undefined,
    fillRule: (path.getAttribute("fill-rule") ?? undefined) as Path["fillRule"],
    clipRule: (path.getAttribute("clip-rule") ?? undefined) as Path["clipRule"],
  }));
}

const sceneDocument = readSvg(sceneSource);
const cardLayers = [...agents].reverse().map(({ id }) => {
  const group = sceneDocument.getElementById(id);
  if (!group) throw new Error(`Missing SVG card group: ${id}`);
  return readPaths(group);
});
const calloutPaths = readPaths(readSvg(calloutSource));

if (
  cardLayers.some((paths) => paths.length === 0) ||
  calloutPaths.length !== agents.length * 2
) {
  throw new Error(
    "Expected four non-empty cards and four label/line pairs in the scene assets",
  );
}

export default function App() {
  const storyRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const story = storyRef.current!;
    const scene = sceneRef.current!;
    const cards = agents.map(
      (agent) => scene.querySelector<SVGGElement>(`[data-card="${agent.id}"]`)!,
    );
    const callouts = agents.map(
      (agent) =>
        scene.querySelector<SVGGElement>(`[data-callout="${agent.id}"]`)!,
    );
    const lines = callouts.map(
      (node) => node.querySelector<SVGPathElement>(".callout-line")!,
    );
    const labels = callouts.map(
      (node) => node.querySelector<SVGPathElement>(".callout-label")!,
    );
    const titles = Array.from(
      scene.querySelectorAll<HTMLSpanElement>(".scene-heading"),
    );
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let start = 0;
    let distance = 1;
    let request = 0;

    function render() {
      request = 0;
      const progress = reducedMotion.matches
        ? 0
        : clamp((window.scrollY - start) / distance);
      const frame = getSceneFrame(progress);
      cards.forEach((card, index) => {
        card.setAttribute("transform", `translate(0 ${frame.cards[index]})`);
        card.style.setProperty("--card-focus", `${frame.focus[index] * 100}%`);
      });
      titles.forEach((title, index) => {
        title.style.opacity = String(frame.headings[index].opacity);
        title.style.transform = `translateY(${frame.headings[index].y}px)`;
      });
      callouts.forEach((callout, index) => {
        const state = frame.callouts[index];
        callout.setAttribute("transform", `translate(0 ${state.y})`);
        callout.setAttribute(
          "visibility",
          state.line > 0 || state.opacity > 0 ? "visible" : "hidden",
        );
        lines[index].setAttribute("stroke-dashoffset", String(1 - state.line));
        labels[index].setAttribute("opacity", String(state.opacity));
        labels[index].setAttribute("transform", `translate(0 ${state.textY})`);
      });
    }

    function schedule() {
      if (!request) request = window.requestAnimationFrame(render);
    }

    function measure() {
      start = story.getBoundingClientRect().top + window.scrollY;
      distance = Math.max(1, story.offsetHeight - scene.offsetHeight);
      schedule();
    }

    const observer = new ResizeObserver(measure);
    observer.observe(story);
    observer.observe(scene);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    window.addEventListener("pageshow", measure);
    reducedMotion.addEventListener("change", measure);
    measure();
    window.cancelAnimationFrame(request);
    render();

    return () => {
      window.cancelAnimationFrame(request);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      window.removeEventListener("pageshow", measure);
      reducedMotion.removeEventListener("change", measure);
    };
  }, []);

  return (
    <main>
      <a className="skip-link" href="#after-scene">
        Skip animation
      </a>
      <section
        className="scroll-story"
        ref={storyRef}
        aria-labelledby="scene-title"
      >
        <div className="scene" ref={sceneRef}>
          <div className="copy-panel">
            <h1 className="heading-frame" id="scene-title">
              <span className="sr-only">Four agents working side by side</span>
              {headings.map((heading, index) => (
                <span
                  className="scene-heading"
                  aria-hidden="true"
                  key={`${heading}-${index}`}
                  style={{ opacity: index === 0 ? 1 : 0 }}
                >
                  {heading}
                </span>
              ))}
            </h1>
            <ul className="static-summary">
              {agents.map((agent) => (
                <li key={agent.id}>
                  {agent.title} <span>— {agent.label}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="illustration-panel">
            <svg
              className="artwork"
              viewBox="-2 0 426 1000"
              fill="none"
              aria-hidden="true"
            >
              {agents.map((agent, index) => {
                const sourceIndex = (agents.length - 1 - index) * 2;
                return (
                  <g
                    className="callout"
                    data-callout={agent.id}
                    key={agent.id}
                    visibility="hidden"
                  >
                    <path
                      {...calloutPaths[sourceIndex + 1]}
                      className="callout-line"
                      pathLength={1}
                      strokeDasharray={1}
                      strokeDashoffset={1}
                    />
                    <path
                      {...calloutPaths[sourceIndex]}
                      className="callout-label"
                      opacity={0}
                    />
                  </g>
                );
              })}
              {cardLayers.map((paths, index) => (
                <g
                  className="agent-card"
                  data-card={agents[agents.length - 1 - index].id}
                  key={index}
                >
                  {paths.map((path, pathIndex) => (
                    <path
                      {...path}
                      fill={cardPaint(path.fill)}
                      stroke={cardPaint(path.stroke)}
                      key={pathIndex}
                    />
                  ))}
                </g>
              ))}
            </svg>
          </div>
        </div>
      </section>
      <div id="after-scene" tabIndex={-1} />
    </main>
  );
}
