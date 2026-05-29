import { useRef } from "react";
import { DialRoot, useDialKit } from "dialkit";
import "dialkit/styles.css";
import { CarouselScene } from "./components/CarouselScene";
import { CAROUSEL_DIAL_CONFIG } from "./config/carouselDial";
import { usePointerTilt, useReducedMotion } from "./hooks/usePointerTilt";
import { useScrollProgress } from "./hooks/useScrollProgress";

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollProgress = useScrollProgress();
  const reducedMotion = useReducedMotion();
  const pointer = usePointerTilt(containerRef, reducedMotion);
  const controls = useDialKit("Carousel", CAROUSEL_DIAL_CONFIG);

  return (
    <div className="relative bg-[#0a0a12] text-neutral-50">
      <DialRoot position="top-right" defaultOpen theme="dark" />

      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(88,28,135,0.22),transparent_55%)]"
        aria-hidden
      />

      <div ref={containerRef} className="sticky top-0 h-screen w-full">
        <CarouselScene
          controls={controls}
          scrollProgress={scrollProgress}
          pointer={pointer}
          reducedMotion={reducedMotion}
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center">
          <p className="text-sm tracking-wide text-neutral-500">
            Scroll to rotate · Move mouse to reveal depth · ⚙ to tweak
          </p>
        </div>
      </div>

      <div style={{ height: `${controls.Scroll.heightVh}vh` }} aria-hidden />
    </div>
  );
}
