import { useEffect, useRef, type CSSProperties, type SVGProps } from "react";
import { agents, headings } from "./scene-motion";

type MobileExperienceProps = {
  cardLayers: SVGProps<SVGPathElement>[][];
};

export default function MobileExperience({
  cardLayers,
}: MobileExperienceProps) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.18) {
            entry.target.setAttribute("data-revealed", "true");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 },
    );

    rootRef
      .current!.querySelectorAll(".mobile-illustration-frame")
      .forEach((frame) => observer.observe(frame));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="mobile-experience" ref={rootRef}>
      <header className="mobile-intro">
        <h1 className="mobile-title">{headings[0]}</h1>
        <p className="mobile-description">
          Support for your team, from planning the rota to paying the people
          behind it.
        </p>
      </header>
      {agents.map((agent, index) => (
        <section
          className="mobile-agent"
          aria-labelledby={`mobile-${agent.id}-title`}
          style={{ "--agent-accent": agent.accent } as CSSProperties}
          key={agent.id}
        >
          <p className="mobile-eyebrow">
            <span className="mobile-step">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span>{agent.label}</span>
          </p>
          <h2 className="mobile-heading" id={`mobile-${agent.id}-title`}>
            {agent.title}
          </h2>
          <p className="mobile-description">{agent.description}</p>
          <figure className="mobile-illustration-frame" aria-hidden="true">
            <svg
              className="mobile-illustration"
              viewBox={`-16 ${agent.top - 60} 444 340`}
              fill="none"
            >
              <g data-mobile-card={agent.id}>
                {cardLayers[agents.length - 1 - index].map(
                  (path, pathIndex) => (
                    <path {...path} key={pathIndex} />
                  ),
                )}
              </g>
            </svg>
          </figure>
        </section>
      ))}
      <footer className="mobile-outro">
        Four workflows. One connected team.
      </footer>
    </main>
  );
}
