import type { CSSProperties, MouseEvent, MutableRefObject } from 'react';
import { useEffect, useId, useRef } from 'react';

type Point = { x: number; y: number };
export type HologramImages = { image: string; depth: string; shade: string };
type HologramCardProps = {
  images: HologramImages;
  aspectRatio?: number;
  color?: string;
};
type LightRef = SVGFEPointLightElement | null;
type CssVars = CSSProperties & Record<`--${string}`, string>;

const BASE_CARD_WIDTH = 320;
const CARD_WIDTH = 640;
const CARD_SCALE = CARD_WIDTH / BASE_CARD_WIDTH;
const scale = (value: number) => value * CARD_SCALE;

const CARD = {
  width: CARD_WIDTH,
  radius: scale(16),
  shadow: `0 ${scale(24)}px ${scale(60)}px rgb(0 0 0 / 30%)`,
};

const DEFAULT_ASPECT_RATIO = 5 / 6;
const DEFAULT_CARD_CENTER: Point = getCardCenter(DEFAULT_ASPECT_RATIO);

const TILT = {
  perspective: scale(1000),
  sensitivity: scale(20),
  transitionMs: 500,
};

const TILT_ZERO_TRANSFORM = `perspective(${TILT.perspective}px) rotateX(0deg) rotateY(0deg)`;
const TILT_TRANSITION = `transform ${TILT.transitionMs}ms ease-out`;

const LIGHT = {
  idleSweepSpeed: 0.012,
  idleSweepPadding: scale(60),
  lerp: 0.15,
  xFromTilt: scale(80),
  yFromTilt: scale(60),
  border: {
    blur: scale(20),
    surfaceScale: scale(20),
    diffuseConstant: 2.2,
    z: scale(50),
  },
  body: {
    blur: scale(1.5),
    surfaceScale: scale(15),
    diffuseConstant: 0.5,
    z: scale(60),
  },
};

export function HologramCard({ images, aspectRatio = DEFAULT_ASPECT_RATIO, color = '#00ccff' }: HologramCardProps) {
  const id = useId().replace(/:/g, '');
  const cardRef = useRef<HTMLDivElement | null>(null);
  const tiltRef = useRef<HTMLDivElement | null>(null);
  const lightRefs = useRef<LightRef[]>([]);
  const cardCenter = getCardCenter(aspectRatio);
  const target = useRef<Point>(cardCenter);
  const current = useRef<Point>(cardCenter);
  const hovering = useRef(false);
  const enterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let frame = 0;
    let idleTime = 0;

    function tick() {
      const card = cardRef.current;
      if (card) {
        const { width, height } = card.getBoundingClientRect();

        if (!hovering.current) {
          idleTime += LIGHT.idleSweepSpeed;
          target.current = getIdleLightTarget(width, height, idleTime);
        }

        current.current = moveToward(current.current, target.current, LIGHT.lerp);
        updateLights(lightRefs.current, current.current);
      }

      frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  function handleMove(event: MouseEvent<HTMLDivElement>) {
    const card = cardRef.current;
    const tilt = tiltRef.current;
    if (!card || !tilt) return;

    const rect = card.getBoundingClientRect();
    const rotation = getTiltRotation(rect, event);

    target.current = getTiltLightTarget(rect, rotation);
    startEnterTransitionIfNeeded({ hovering, enterTimer, tiltRef });

    hovering.current = true;
    tilt.style.transform = getTiltTransform(rotation);
  }

  function handleLeave() {
    hovering.current = false;
    clearEnterTimer(enterTimer);
    resetTilt(tiltRef.current);
  }

  return (
    <div ref={tiltRef} className="hologram-tilt" onMouseMove={handleMove} onMouseLeave={handleLeave}>
      <div className="hologram-wrap" style={cardVars(aspectRatio)}>
        <div ref={cardRef} className="hologram-card" style={{ backgroundColor: color }}>
          <div className="hologram-dim" />
          <div className="hologram-gradient" />

          <img className="hologram-layer shade" src={images.shade} alt="" />
          <img className="hologram-layer image" src={images.image} alt="Heart hologram" />

          <svg className="hologram-filters" aria-hidden>
            <HologramFilters id={id} lightRefs={lightRefs} center={cardCenter} />
          </svg>

          <div className="hologram-depth" style={{ filter: `url(#organ-${id})` }}>
            <img src={images.depth} alt="" />
          </div>
        </div>

        <svg className="hologram-border" preserveAspectRatio="none" aria-hidden>
          <rect width="100%" height="100%" rx={CARD.radius} ry={CARD.radius} style={{ filter: `url(#border-${id})` }} />
        </svg>
      </div>
    </div>
  );
}

function getIdleLightTarget(width: number, height: number, idleTime: number): Point {
  const sweep = (1 - Math.cos(idleTime / 2)) / 2;

  return {
    x: width / 2,
    y: height + LIGHT.idleSweepPadding - sweep * (height + LIGHT.idleSweepPadding * 2),
  };
}

function getTiltRotation(rect: DOMRect, event: MouseEvent<HTMLDivElement>): Point {
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  return {
    x: (event.clientY - centerY) / TILT.sensitivity,
    y: -(event.clientX - centerX) / TILT.sensitivity,
  };
}

function getTiltLightTarget(rect: DOMRect, rotation: Point): Point {
  return {
    x: rect.width / 2 + rotation.y * LIGHT.xFromTilt,
    y: rect.height - rotation.x * LIGHT.yFromTilt,
  };
}

function getTiltTransform(rotation: Point): string {
  return `perspective(${TILT.perspective}px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`;
}

function moveToward(current: Point, target: Point, amount: number): Point {
  return {
    x: current.x + (target.x - current.x) * amount,
    y: current.y + (target.y - current.y) * amount,
  };
}

function updateLights(lights: LightRef[], point: Point) {
  for (const light of lights) {
    light?.setAttribute('x', String(point.x));
    light?.setAttribute('y', String(point.y));
  }
}

function startEnterTransitionIfNeeded({
  hovering,
  enterTimer,
  tiltRef,
}: {
  hovering: MutableRefObject<boolean>;
  enterTimer: MutableRefObject<ReturnType<typeof setTimeout> | null>;
  tiltRef: MutableRefObject<HTMLDivElement | null>;
}) {
  if (hovering.current || !tiltRef.current) return;

  tiltRef.current.style.transition = TILT_TRANSITION;
  clearEnterTimer(enterTimer);
  enterTimer.current = setTimeout(() => {
    if (hovering.current && tiltRef.current) {
      tiltRef.current.style.transition = 'none';
    }
  }, TILT.transitionMs);
}

function clearEnterTimer(enterTimer: MutableRefObject<ReturnType<typeof setTimeout> | null>) {
  if (enterTimer.current) {
    clearTimeout(enterTimer.current);
    enterTimer.current = null;
  }
}

function resetTilt(tilt: HTMLDivElement | null) {
  if (!tilt) return;

  tilt.style.transform = TILT_ZERO_TRANSFORM;
  tilt.style.transition = TILT_TRANSITION;
}

function getCardCenter(aspectRatio: number): Point {
  return { x: CARD.width / 2, y: CARD.width / aspectRatio / 2 };
}

function cardVars(aspectRatio: number): CssVars {
  return {
    '--card-width': `${CARD.width}px`,
    '--card-radius': `${CARD.radius}px`,
    '--card-shadow': CARD.shadow,
    '--tilt-perspective': `${TILT.perspective}px`,
    '--card-aspect-ratio': String(aspectRatio),
  };
}

function HologramFilters({
  id,
  lightRefs,
  center,
}: {
  id: string;
  lightRefs: MutableRefObject<LightRef[]>;
  center: Point;
}) {
  return (
    <>
      <filter id={`border-${id}`}>
        <feGaussianBlur in="SourceGraphic" stdDeviation={LIGHT.border.blur} result="blur" />
        <feDiffuseLighting
          in="blur"
          surfaceScale={LIGHT.border.surfaceScale}
          diffuseConstant={LIGHT.border.diffuseConstant}
          lightingColor="white"
          result="lit"
        >
          <fePointLight
            ref={(node) => {
              lightRefs.current[0] = node;
            }}
            x={center.x}
            y={center.y}
            z={LIGHT.border.z}
          />
        </feDiffuseLighting>
        <WhiteAlphaMatrix />
        <feComposite in="litAlpha" in2="SourceGraphic" operator="in" />
      </filter>

      <filter id={`organ-${id}`} x="0" y="0" width="100%" height="100%">
        <feColorMatrix in="SourceGraphic" type="matrix" values={BUMP_ALPHA_MATRIX} result="bumpRaw" />
        <feGaussianBlur in="bumpRaw" stdDeviation={LIGHT.body.blur} result="bump" />
        <feDiffuseLighting
          in="bump"
          surfaceScale={LIGHT.body.surfaceScale}
          diffuseConstant={LIGHT.body.diffuseConstant}
          lightingColor="white"
          result="lit"
        >
          <fePointLight
            ref={(node) => {
              lightRefs.current[1] = node;
            }}
            x={center.x}
            y={center.y}
            z={LIGHT.body.z}
          />
        </feDiffuseLighting>
        <WhiteAlphaMatrix />
        <feComposite in="litAlpha" in2="bumpRaw" operator="in" />
      </filter>
    </>
  );
}

const BUMP_ALPHA_MATRIX = '0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -0.299 -0.587 -0.114 1 0.1';
const WHITE_ALPHA_MATRIX = '0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0.299 0.587 0.114 0 0';

function WhiteAlphaMatrix() {
  return <feColorMatrix in="lit" type="matrix" values={WHITE_ALPHA_MATRIX} result="litAlpha" />;
}
