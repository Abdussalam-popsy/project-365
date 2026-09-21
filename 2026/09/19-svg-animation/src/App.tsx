import {
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
  type CSSProperties,
  type SVGProps,
} from "react";
import Lenis from "lenis";
import sceneSource from "./assets/scene-updated.svg?raw";
import calloutSource from "./assets/callouts.svg?raw";
import { agents, clamp, getSceneFrame, headings } from "./scene-motion";
import MobileExperience from "./MobileExperience";

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

const mobileLayout = window.matchMedia(
  "(max-width: 640px), (max-width: 1024px) and (pointer: coarse)",
);

function subscribeToLayout(onChange: () => void) {
  mobileLayout.addEventListener("change", onChange);
  return () => mobileLayout.removeEventListener("change", onChange);
}

function getMobileLayout() {
  return mobileLayout.matches;
}

export default function App() {
  const isMobile = useSyncExternalStore(subscribeToLayout, getMobileLayout);
  return isMobile ? (
    <MobileExperience cardLayers={cardLayers} />
  ) : (
    <DesktopExperience />
  );
}

function DesktopExperience() {
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
    const copyTrack = scene.querySelector<HTMLDivElement>(".copy-track")!;
    const timeline = scene.querySelector<HTMLDivElement>(".step-timeline")!;
    const featureSections = agents.map(
      (agent) =>
        scene.querySelector<HTMLElement>(`[data-feature="${agent.id}"]`)!,
    );
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const lenis = new Lenis({
      eventsTarget: scene,
      autoRaf: true,
      lerp: 0.1,
      smoothWheel: true,
      syncTouch: false,
      respectReducedMotion: true,
      anchors: { immediate: true },
    });
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
        const focus = `${frame.focus[index] * 100}%`;
        card.setAttribute("transform", `translate(0 ${frame.cards[index]})`);
        card.style.setProperty("--card-focus", focus);
        featureSections[index].style.setProperty("--step-focus", focus);
      });
      timeline.style.setProperty(
        "--marker-offset",
        `${frame.marker.offset * 100}%`,
      );
      timeline.style.setProperty("--accent-from", frame.marker.from);
      timeline.style.setProperty("--accent-to", frame.marker.to);
      timeline.style.setProperty(
        "--accent-blend",
        `${frame.marker.blend * 100}%`,
      );
      timeline.style.setProperty(
        "--timeline-progress",
        String(frame.marker.draw),
      );
      copyTrack.style.transform = `translateY(${-progress * (headings.length - 1) * 100}%)`;
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

    function handleMotionChange() {
      lenis.stop();
      lenis.resize();
      lenis.start();
      measure();
    }

    const observer = new ResizeObserver(measure);
    observer.observe(story);
    observer.observe(scene);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    window.addEventListener("pageshow", measure);
    reducedMotion.addEventListener("change", handleMotionChange);
    measure();
    window.cancelAnimationFrame(request);
    render();

    return () => {
      lenis.destroy();
      window.cancelAnimationFrame(request);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      window.removeEventListener("pageshow", measure);
      reducedMotion.removeEventListener("change", handleMotionChange);
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
            <div className="copy-track">
              {headings.map((heading, index) => {
                const Heading = index === 0 ? "h1" : "h2";
                const agent =
                  index > 0 && index <= agents.length
                    ? agents[index - 1]
                    : undefined;
                return (
                  <section
                    className={`copy-section${agent ? " copy-section--feature" : ""}`}
                    data-feature={agent?.id}
                    style={
                      agent
                        ? ({ "--agent-accent": agent.accent } as CSSProperties)
                        : undefined
                    }
                    key={`${heading}-${index}`}
                  >
                    {agent && (
                      <p className="feature-eyebrow">
                        <span className="step-number">
                          {String(index).padStart(2, "0")}
                        </span>
                        <span>{agent.label}</span>
                      </p>
                    )}
                    <Heading
                      className="scene-heading"
                      id={index === 0 ? "scene-title" : undefined}
                    >
                      {heading}
                    </Heading>
                    {index === 0 && (
                      <ul className="static-summary">
                        {agents.map((agent) => (
                          <li key={agent.id}>
                            {agent.title} <span>— {agent.label}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                );
              })}
            </div>
            <div className="step-timeline" aria-hidden="true">
              <span className="step-entry" />
              <span className="step-rail" />
              <span className="step-marker">
                <span className="step-marker-core" />
              </span>
            </div>
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
