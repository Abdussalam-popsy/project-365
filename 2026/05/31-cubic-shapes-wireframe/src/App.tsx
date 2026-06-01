import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  MeshTransmissionMaterial,
  OrbitControls,
} from "@react-three/drei";
import * as THREE from "three";

// ── 3D Gem ──────────────────────────────────────────────────────────────────

function Gem() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!ref.current) return;
    // ref.current.rotation.y += delta * 0.22; // control speed of rotate around y-axis
    // ref.current.rotation.z += delta * 0.08; // control speed of rotate around z-axis
    ref.current.rotation.x += delta * 0.22; // control speed of rotate around x-axis
  });

  return (
    <mesh ref={ref}>
      <octahedronGeometry args={[1.5, 0]} />
      <MeshTransmissionMaterial
        transmission={1}
        thickness={2}
        roughness={0}
        ior={2.4}
        chromaticAberration={0.08}
        color="#c8e8ff"
        backside
      />
    </mesh>
  );
}

// ── Logo Marquee ─────────────────────────────────────────────────────────────

// import.meta.env.BASE_URL resolves to "/" in dev and to the subpath in production.
// Never use bare "/filename" for public/ assets — it breaks on GitHub Pages subdirectories.
const base = import.meta.env.BASE_URL;

const LOGOS = [
  { src: `${base}logo-1.svg`, alt: "Claude" },
  { src: `${base}logo-2.svg`, alt: "Cursor" },
  { src: `${base}logo-3.svg`, alt: "Figma" },
  { src: `${base}logo-4.svg`, alt: "Granola" },
];

const MARQUEE_ITEMS = [...LOGOS, ...LOGOS, ...LOGOS, ...LOGOS];

function LogoMarquee() {
  return (
    <div className="overflow-hidden">
      <div className="flex w-max animate-marquee">
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((logo, i) => (
          <div key={i} className="border border-white/10 p-6 shrink-0">
            <img src={logo.src} alt={logo.alt} className="h-8 w-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Arrow icon ───────────────────────────────────────────────────────────────

function Arrow() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      className="shrink-0"
    >
      <path
        d="M3.75 9H14.25M14.25 9L9.75 4.5M14.25 9L9.75 13.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Cage wrapper — keeps content at max-w-[1440px] while borders are full-width
// border-b is on the outer element (full viewport width)
// border-l/r are on the inner content div (inset by px-[120px])
// ────────────────────────────────────────────────────────────────────────────

function CageRow({
  children,
  borderBottom = true,
  className = "",
}: {
  children: React.ReactNode;
  borderBottom?: boolean;
  className?: string;
}) {
  return (
    <div className={borderBottom ? "border-b border-white/10" : ""}>
      <div
        className={`mx-auto max-w-[1440px] px-[120px] max-md:px-4 ${className}`}
      >
        <div className="border-l border-r border-white/10">{children}</div>
      </div>
    </div>
  );
}

// ── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <div className="min-h-screen bg-[#0d0b14] font-geist text-white">
      {/* ── Navbar ───────────────────────────────────────────────────────── */}
      <CageRow>
        <div className="flex items-center justify-between px-6 py-3">
          <img src={`${base}logo.svg`} alt="Krystal" className="h-7 w-auto" />
          <nav className="hidden md:flex items-center gap-8 text-sm text-[#a1a1a1]">
            {["About", "Services", "Solutions", "Contact"].map((link) => (
              <a
                key={link}
                href="#"
                className="hover:text-white transition-colors duration-150"
              >
                {link}
              </a>
            ))}
          </nav>
          <button className="bg-white/10 px-3 py-2 text-[13px] font-medium uppercase tracking-widest text-white hover:bg-white/15 transition-colors duration-150">
            Get Protected
          </button>
        </div>
      </CageRow>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <CageRow>
        <div className="flex flex-col md:flex-row overflow-hidden">
          {/* Left — copy */}
          <div className="flex-1 border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-between px-6 py-20 max-md:py-12">
            {/* Top: badge + headline */}
            <div className="flex flex-col gap-4 max-w-[423px]">
              <div className="inline-flex w-fit border border-dashed border-white/15 bg-white/[0.04] px-3 py-2">
                <span className="text-[#d4d4d4] text-[14px] leading-5">
                  The SOC II Certification 2026 Report is here
                </span>
              </div>
              <h1 className="text-[48px] font-medium leading-none tracking-[-0.025em] max-md:text-[36px]">
                Security that's{" "}
                <span className="text-[#a684ff]">crystal clear</span>
              </h1>
            </div>

            {/* Bottom: subtext + CTA */}
            <div className="flex flex-col gap-4 max-w-[423px] max-md:mt-14">
              <p className="text-[#a1a1a1] text-[18px] leading-[1.4] max-md:text-base">
                Enterprise-grade protection with complete transparency. Know
                exactly what's defending your business, around the clock.
              </p>
              <button className="inline-flex w-fit items-center gap-2 bg-white px-[18px] py-[9px] text-[14px] font-semibold uppercase tracking-wide text-[#0d0b14] hover:bg-white/90 transition-colors duration-150">
                Contact Sales <Arrow />
              </button>
            </div>
          </div>

          {/* Right — 3D canvas */}
          <div className="flex-1 min-h-[400px] md:min-h-[650px]">
            <Canvas
              camera={{ position: [0, 0, 5], fov: 45 }}
              gl={{ antialias: true }}
              style={{ width: "100%", height: "100%" }}
            >
              <Environment preset="dawn" />
              <Gem />
              <OrbitControls
                enableZoom={false}
                enablePan={false}
                enableDamping={true}
                dampingFactor={0.05}
              />
            </Canvas>
          </div>
        </div>
      </CageRow>

      {/* ── Logo strip ───────────────────────────────────────────────────── */}
      <CageRow borderBottom={false}>
        <div className="overflow-hidden py-3 pt-6 flex flex-col gap-6">
          <p className="px-6 text-center text-[#a1a1a1] text-[18px] leading-[1.4]">
            Powering security for your favorite AI companies
          </p>
          <LogoMarquee />
        </div>
      </CageRow>
    </div>
  );
}
