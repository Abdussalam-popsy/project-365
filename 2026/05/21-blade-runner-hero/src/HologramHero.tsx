import { useEffect, useId, useRef } from "react";
import darkImage from "./assets/dark-image.png";
import depthImage from "./assets/depth-image.png";
import depthShade from "./assets/grayscale-depth-layer.png";

export function HologramHero() {
  const imageRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<SVGFEPointLightElement>(null);

  const uid = useId().replace(/:/g, "");
  const filterId = `hologram-${uid}`;

  const target = useRef({ x: 372, y: 450 });
  const current = useRef({ x: 372, y: 450 });
  const hovered = useRef(false);

  useEffect(() => {
    let frame = 0;
    let t = 0;
    const tick = () => {
      const img = imageRef.current;
      if (img) {
        const rect = img.getBoundingClientRect();
        if (!hovered.current) {
          t += 0.012;
          const cycle = (1 - Math.cos(t / 2)) / 2;
          target.current.x = rect.width / 2;
          target.current.y = rect.height + 60 - cycle * (rect.height + 120);
        }
        const speed = 0.12;
        current.current.x += (target.current.x - current.current.x) * speed;
        current.current.y += (target.current.y - current.current.y) * speed;
        lightRef.current?.setAttribute("x", String(current.current.x));
        lightRef.current?.setAttribute("y", String(current.current.y));
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const img = imageRef.current;
    if (!img) return;
    const rect = img.getBoundingClientRect();
    target.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    hovered.current = true;
  };

  const handleMouseLeave = () => {
    hovered.current = false;
  };

  return (
    <section
      className="relative min-h-screen bg-neutral-950 flex items-center overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Left: copy */}
      <div className="relative z-10 flex flex-col gap-6 px-20 max-w-lg">
        <span className="text-[11px] tracking-[0.3em] text-neutral-500 uppercase">
          Voight Assessment Protocol · v4.1
        </span>

        <h1 className="text-6xl font-bold leading-[1.05] tracking-tight text-white">
          We see
          <br />
          through
          <br />
          the surface.
        </h1>

        <p className="text-neutral-400 text-lg leading-relaxed">
          Advanced empathy mapping and identity profiling. Your assessment takes
          47 seconds.
        </p>

        <div className="flex items-center gap-4 mt-2">
          <button className="px-6 py-3 bg-white text-neutral-950 text-sm font-semibold tracking-wide rounded-sm hover:bg-neutral-200 transition-colors">
            Begin Assessment
          </button>
          <button className="px-6 py-3 text-neutral-400 text-sm font-medium hover:text-white transition-colors">
            Learn more →
          </button>
        </div>
      </div>

      {/* Right: hologram image */}
      {/* flip the image horizontally */}
      <div className="absolute right-0 top-0 h-full w-[58%] pointer-events-none transform -scale-x-100">
        <div
          ref={imageRef}
          className="relative w-full h-full"
          style={{
            maskImage: "linear-gradient(to right, transparent 0%, black 35%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, black 35%)",
          }}
        >
          {/* SVG filter */}
          <svg
            width="0"
            height="0"
            style={{ position: "absolute", pointerEvents: "none" }}
            aria-hidden
          >
            <filter id={filterId} x="0" y="0" width="100%" height="100%">
              <feColorMatrix
                in="SourceGraphic"
                type="matrix"
                values="0 0 0 0 0
                        0 0 0 0 0
                        0 0 0 0 0
                        -0.299 -0.587 -0.114 1 0.1"
                result="bumpRaw"
              />
              <feGaussianBlur in="bumpRaw" stdDeviation="1.5" result="bump" />
              <feDiffuseLighting
                in="bump"
                surfaceScale="20"
                diffuseConstant="0.8"
                lightingColor="white"
                result="lit"
              >
                <fePointLight ref={lightRef} x="372" y="450" z="60" />
              </feDiffuseLighting>
              <feColorMatrix
                in="lit"
                type="matrix"
                values="0 0 0 0 1
                        0 0 0 0 1
                        0 0 0 0 1
                        0.299 0.587 0.114 0 0"
                result="litAlpha"
              />
              <feComposite in="litAlpha" in2="bumpRaw" operator="in" />
            </filter>
          </svg>

          {/* Layer 1: depth shade — ambient static shading */}
          <img
            src={depthShade}
            alt=""
            className="absolute inset-0 w-full h-full object-contain object-right"
            style={{ opacity: 0.4, mixBlendMode: "overlay" }}
          />

          {/* Layer 2: main image — desaturated silhouette, dissolves into dark bg */}
          <img
            src={darkImage}
            alt=""
            className="absolute inset-0 w-full h-full object-contain object-right"
            style={{
              mixBlendMode: "screen",
              filter: "grayscale(1) brightness(0.55)",
            }}
          />

          {/* Layer 3: lit depth — the hologram shimmer */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{ filter: `url(#${filterId})`, mixBlendMode: "overlay" }}
          >
            <img
              src={depthImage}
              alt=""
              className="w-full h-full object-contain object-right"
            />
          </div>
        </div>
      </div>

      {/* Subtle ambient glow behind the subject */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[55%] h-[80%] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 70% center, rgba(120,100,255,0.06) 0%, transparent 65%)",
        }}
      />

      {/* Bottom status bar */}
      <div className="absolute bottom-8 left-20 flex items-center gap-8 text-[11px] tracking-[0.2em] text-neutral-600 uppercase">
        <span>Scan ID: 4821-NX</span>
        <span>·</span>
        <span>Status: Awaiting Subject</span>
        <span>·</span>
        <span className="text-neutral-500 animate-pulse">● Live</span>
      </div>
    </section>
  );
}
