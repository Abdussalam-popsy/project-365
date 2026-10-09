import {
  AdditiveBlending,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  DynamicDrawUsage,
  InstancedBufferAttribute,
  InstancedMesh,
  Matrix4,
  Mesh,
  OrthographicCamera,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  Raycaster,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import {
  beaconFragment,
  beaconVertex,
  buildingFragment,
  roofFragment,
  roofVertex,
  buildingVertex,
  groundFragment,
  groundVertex,
  skyFragment,
  skyVertex,
} from "./shaders";
import { reportHeroFrame } from "../perfStats";

export type HavenCityParams = {
  /** World units per second the city drifts toward the camera. */
  speed: number;
  /** Multiplier on every building height. */
  towerHeight: number;
  /** Share of windows that are lit, 0–1. */
  windowDensity: number;
  /** Share of windows that blink on and off, 0–1. */
  flicker: number;
  /** Seconds between automatic flashes; 0 turns them off. */
  ambientFlashEvery: number;
  /** Strength of horizon glow and flash ripples. */
  glow: number;
  /** Share of lit windows that glow warm instead of lilac, 0–1. */
  warmth: number;
  /** Camera height in world units (buildings are ~0.8–10 tall). */
  cameraHeight: number;
  /** Residential only: tallest apartment block, in floors (3 or more). */
  storeys: number;
  /** Residential only: share of plots that are pitched-roof houses, 0–1. */
  houseShare: number;
  /** Residential only: multiplier on roof height; 0 flattens every roof. */
  roofPitch: number;
};

/** "towers" is the v2 skyline; "residential" is v4's low-rise neighbourhood. */
export type HavenCityVariant = "towers" | "residential";

export const defaultHavenCityParams: HavenCityParams = {
  speed: 0.55,
  towerHeight: 1,
  windowDensity: 0.22,
  flicker: 0.08,
  ambientFlashEvery: 2.4,
  glow: 1,
  warmth: 0,
  cameraHeight: 3.1,
  storeys: 5,
  houseShare: 0.6,
  roofPitch: 1,
};

export const residentialCityParams: HavenCityParams = {
  ...defaultHavenCityParams,
  speed: 0.4,
  windowDensity: 0.38,
  flicker: 0.05,
  warmth: 0.35,
  cameraHeight: 2.4,
  glow: 0.9,
};

/** Per-variant look: where the camera aims, window grid size, and how tall the facade shading spans. */
const variants = {
  towers: { look: new Vector3(0, 4.6, -10), winCell: new Vector2(0.12, 0.17), shadeHeight: 9 },
  residential: { look: new Vector3(0, 1.1, -10), winCell: new Vector2(0.3, 0.36), shadeHeight: 3 },
};

const palette = {
  top: "#1e0f26",
  mid: "#2f1839",
  fog: "#3a2047",
  horizon: "#5740ef",
  glass: "#170b1d",
  glassTop: "#3a2148",
  window: "#c9b5da",
  windowAlt: "#8b7bff",
  flash: "#dccbea",
  ground: "#160a1c",
  grid: "#8b7bff",
  beacon: "#f1e8f7",
  warm: "#f2d4b4",
  lamp: "#f6dcc0",
  roof: "#24112d",
  roofLit: "#43234f",
  gable: "#1c0d23",
};

const CELL = 1.7;
const COLUMNS = 9; // per side of the avenue's centre line
const ROWS = 34;
const NEAR_Z = 14;
const DEPTH = ROWS * CELL;
const FAR_Z = NEAR_Z - DEPTH;
const MAX_RIPPLES = 6;
const FOG_RANGE = new Vector2(16, 54);
const STOREY = 0.36;

/** `roof` is the pitched roof's height above `h`; 0 means a flat roof. */
type Building = { x: number; z: number; w: number; d: number; h: number; roof: number; seed: number };
type Light = { x: number; y: number; z: number; seed: number };

function seeded(index: number, salt: number) {
  const x = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function srgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return new Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

/** Lay buildings on a grid, leaving a three-column avenue down the middle. */
export function layoutCity(towerHeight: number): Building[] {
  const buildings: Building[] = [];
  let i = 0;
  for (let col = -COLUMNS; col <= COLUMNS; col++) {
    for (let row = 0; row < ROWS; row++) {
      i++;
      if (Math.abs(col) <= 1 || seeded(i, 1) < 0.14) continue;
      const side = Math.min(1, (Math.abs(col) - 2) / 5);
      const h = (0.7 + Math.pow(seeded(i, 2), 2.6) * 6.5 + side * seeded(i, 3) * 2.5) * towerHeight;
      buildings.push({
        x: col * CELL + (seeded(i, 4) - 0.5) * 0.25,
        z: FAR_Z + row * CELL,
        w: 0.85 + seeded(i, 5) * 0.5,
        d: 0.85 + seeded(i, 6) * 0.5,
        h,
        roof: 0,
        seed: seeded(i, 7),
      });
    }
  }
  return buildings;
}

/** Same grid as `layoutCity`, filled with 2-floor houses and short apartment blocks. */
export function layoutResidential(p: HavenCityParams): Building[] {
  const buildings: Building[] = [];
  const maxFloors = Math.max(3, Math.round(p.storeys));
  let i = 0;
  for (let col = -COLUMNS; col <= COLUMNS; col++) {
    for (let row = 0; row < ROWS; row++) {
      i++;
      if (Math.abs(col) <= 1 || seeded(i, 1) < 0.18) continue;
      const house = seeded(i, 2) < p.houseShare;
      const floors = house ? 2 : 3 + Math.floor(seeded(i, 3) * (maxFloors - 2));
      const w = house ? 0.9 + seeded(i, 5) * 0.35 : 1.15 + seeded(i, 5) * 0.35;
      buildings.push({
        x: col * CELL + (seeded(i, 4) - 0.5) * 0.2,
        z: FAR_Z + row * CELL,
        w,
        d: house ? 0.95 + seeded(i, 6) * 0.3 : 1.1 + seeded(i, 6) * 0.35,
        h: floors * STOREY + 0.1,
        roof: house ? (0.35 + seeded(i, 8) * 0.2) * w * p.roofPitch : 0,
        seed: seeded(i, 7),
      });
    }
  }
  return buildings;
}

/** Unit gable prism: base 1×1 at y = 0, ridge along z at y = 1, gable ends facing the camera. */
function roofGeometry() {
  const A = [-0.5, 0, 0.5], B = [0, 1, 0.5], C = [0, 1, -0.5], D = [-0.5, 0, -0.5];
  const E = [0.5, 0, -0.5], H = [0.5, 0, 0.5];
  const triangles = [A, B, C, A, C, D, E, C, B, E, B, H, A, H, B, E, D, C];
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(triangles.flat()), 3));
  geometry.computeVertexNormals();
  return geometry;
}

const wrapZ = (z: number, scroll: number) => FAR_Z + ((((z - FAR_Z + scroll) % DEPTH) + DEPTH) % DEPTH);

export type HavenCity = {
  dispose: () => void;
};

export function createHavenCity(
  canvas: HTMLCanvasElement,
  options: { variant?: HavenCityVariant; params?: Partial<HavenCityParams>; reducedMotion?: boolean } = {},
): HavenCity {
  const variant = options.variant ?? "towers";
  const residential = variant === "residential";
  const look = variants[variant];
  const params = { ...(residential ? residentialCityParams : defaultHavenCityParams), ...options.params };
  const reduce = options.reducedMotion ?? false;

  const renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.autoClear = false;
  renderer.info.autoReset = false;

  const camera = new PerspectiveCamera(50, 1, 0.1, 120);
  const lookTarget = look.look;
  const scene = new Scene();

  // Sky: a full-screen quad drawn before the city.
  const skyScene = new Scene();
  const skyCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const skyMaterial = new ShaderMaterial({
    vertexShader: skyVertex,
    fragmentShader: skyFragment,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uTop: { value: srgb(palette.top) },
      uMid: { value: srgb(palette.mid) },
      uFog: { value: srgb(palette.fog) },
      uHorizon: { value: srgb(palette.horizon) },
      uHorizonY: { value: 0.4 },
      uAspect: { value: 1 },
      uGlow: { value: params.glow },
      uTime: { value: 0 },
    },
  });
  skyScene.add(new Mesh(new PlaneGeometry(2, 2), skyMaterial));

  // Buildings: one instanced box, base at y = 0.
  const buildings = residential ? layoutResidential(params) : layoutCity(params.towerHeight);
  const count = buildings.length;
  const box = new BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
  const sizes = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const flashes = new Float32Array(count);
  buildings.forEach((b, i) => {
    sizes.set([b.w, b.h, b.d], i * 3);
    seeds[i] = b.seed;
  });
  box.setAttribute("aSize", new InstancedBufferAttribute(sizes, 3));
  box.setAttribute("aSeed", new InstancedBufferAttribute(seeds, 1));
  const flashAttribute = new InstancedBufferAttribute(flashes, 1);
  flashAttribute.setUsage(DynamicDrawUsage);
  box.setAttribute("aFlash", flashAttribute);

  const buildingMaterial = new ShaderMaterial({
    vertexShader: buildingVertex,
    fragmentShader: buildingFragment,
    uniforms: {
      uTime: { value: 0 },
      uWindowDensity: { value: params.windowDensity },
      uFlicker: { value: params.flicker },
      uGlass: { value: srgb(palette.glass) },
      uGlassTop: { value: srgb(palette.glassTop) },
      uWindow: { value: srgb(palette.window) },
      uWindowAlt: { value: srgb(palette.windowAlt) },
      uFlash: { value: srgb(palette.flash) },
      uWarm: { value: srgb(palette.warm) },
      uWarmth: { value: params.warmth },
      uWinCell: { value: look.winCell },
      uShadeHeight: { value: look.shadeHeight },
      uFog: { value: srgb(palette.fog) },
      uFogRange: { value: FOG_RANGE },
    },
  });
  const city = new InstancedMesh(box, buildingMaterial, count);
  city.instanceMatrix.setUsage(DynamicDrawUsage);
  city.frustumCulled = false;
  scene.add(city);

  // Roofs: one prism per pitched building. roofOwners[k] is the building index roof k sits on.
  const roofOwners = buildings.flatMap((b, i) => (b.roof > 0 ? [i] : []));
  const roofGeo = roofGeometry();
  const roofFlashes = new Float32Array(roofOwners.length);
  const roofFlashAttribute = new InstancedBufferAttribute(roofFlashes, 1);
  roofFlashAttribute.setUsage(DynamicDrawUsage);
  roofGeo.setAttribute("aFlash", roofFlashAttribute);
  const roofMaterial = new ShaderMaterial({
    vertexShader: roofVertex,
    fragmentShader: roofFragment,
    uniforms: {
      uRoof: { value: srgb(palette.roof) },
      uRoofLit: { value: srgb(palette.roofLit) },
      uGable: { value: srgb(palette.gable) },
      uRim: { value: srgb(palette.windowAlt) },
      uFlash: { value: srgb(palette.flash) },
      uFog: { value: srgb(palette.fog) },
      uFogRange: { value: FOG_RANGE },
    },
  });
  const roofs = roofOwners.length ? new InstancedMesh(roofGeo, roofMaterial, roofOwners.length) : null;
  if (roofs) {
    roofs.instanceMatrix.setUsage(DynamicDrawUsage);
    roofs.frustumCulled = false;
    scene.add(roofs);
  }
  const hoverTargets = roofs ? [city, roofs] : [city];

  // Ground: street grid that scrolls with the city, plus flash ripples.
  const ripples = Array.from({ length: MAX_RIPPLES }, () => new Vector3(0, 0, -1));
  let nextRipple = 0;
  const groundMaterial = new ShaderMaterial({
    vertexShader: groundVertex,
    fragmentShader: groundFragment,
    uniforms: {
      uScroll: { value: 0 },
      uCell: { value: CELL },
      uFarZ: { value: FAR_Z },
      uGlow: { value: params.glow },
      uBase: { value: srgb(palette.ground) },
      uGrid: { value: srgb(palette.grid) },
      uFlash: { value: srgb(palette.flash) },
      uFog: { value: srgb(palette.fog) },
      uFogRange: { value: FOG_RANGE },
      uRipples: { value: ripples },
    },
  });
  const ground = new Mesh(new PlaneGeometry(80, DEPTH + 20).rotateX(-Math.PI / 2), groundMaterial);
  ground.position.z = FAR_Z + DEPTH / 2;
  scene.add(ground);

  // Lights: blinking beacons on the tallest towers, or steady street lamps along the avenue.
  const lights: Light[] = residential
    ? Array.from({ length: ROWS * 2 }, (_, k) => ({
        x: (k % 2 ? 1 : -1) * (1.5 * CELL - 0.2),
        y: 0.55,
        z: FAR_Z + Math.floor(k / 2) * CELL + CELL / 2,
        seed: seeded(k, 9),
      }))
    : buildings
        .filter((b) => b.h > 4.6 * params.towerHeight)
        .map((b) => ({ x: b.x, y: b.h + 0.12, z: b.z, seed: b.seed }));
  const beaconPositions = new Float32Array(lights.length * 3);
  const beaconGeometry = new BufferGeometry();
  const beaconPositionAttribute = new BufferAttribute(beaconPositions, 3);
  beaconPositionAttribute.setUsage(DynamicDrawUsage);
  beaconGeometry.setAttribute("position", beaconPositionAttribute);
  beaconGeometry.setAttribute("aSeed", new BufferAttribute(new Float32Array(lights.map((l) => l.seed)), 1));
  const beaconMaterial = new ShaderMaterial({
    vertexShader: beaconVertex,
    fragmentShader: beaconFragment,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uSize: { value: residential ? 6 : 9 },
      uSteady: { value: residential ? 1 : 0 },
      uColor: { value: srgb(residential ? palette.lamp : palette.beacon) },
      uFogRange: { value: FOG_RANGE },
    },
  });
  const beacons = new Points(beaconGeometry, beaconMaterial);
  beacons.frustumCulled = false;
  scene.add(beacons);

  // Per-frame state.
  const matrix = new Matrix4();
  const horizonProbe = new Vector3();
  const raycaster = new Raycaster();
  const pointer = new Vector2(0, 0);
  const parallax = new Vector2(0, 0);
  let pointerInside = false;
  let pointerDirty = false;
  let hovered = -1;
  let scroll = 0;
  let time = reduce ? 6 : 0;
  let untilAmbient = params.ambientFlashEvery;
  let frame = 0;
  let last = 0;
  let visible = true;
  let wakeUntil = 0;

  const placeBuildings = () => {
    buildings.forEach((b, i) => {
      matrix.makeScale(b.w, b.h, b.d).setPosition(b.x, 0, wrapZ(b.z, scroll));
      city.setMatrixAt(i, matrix);
    });
    city.instanceMatrix.needsUpdate = true;
    city.boundingSphere = null;
    if (roofs) {
      roofOwners.forEach((i, k) => {
        const b = buildings[i];
        matrix.makeScale(b.w * 1.06, b.roof, b.d * 1.06).setPosition(b.x, b.h, wrapZ(b.z, scroll));
        roofs.setMatrixAt(k, matrix);
      });
      roofs.instanceMatrix.needsUpdate = true;
      roofs.boundingSphere = null;
    }
    lights.forEach((l, k) => beaconPositions.set([l.x, l.y, wrapZ(l.z, scroll)], k * 3));
    beaconPositionAttribute.needsUpdate = true;
  };

  const flash = (index: number, strength: number) => {
    flashes[index] = Math.max(flashes[index], strength);
    const b = buildings[index];
    ripples[nextRipple].set(b.x, wrapZ(b.z, scroll), 0);
    nextRipple = (nextRipple + 1) % MAX_RIPPLES;
  };

  const ambientFlash = () => {
    for (let tries = 0; tries < 20; tries++) {
      const i = Math.floor(Math.random() * count);
      const z = wrapZ(buildings[i].z, scroll);
      if (z > -26 && z < 4) return flash(i, 0.75);
    }
  };

  const resize = () => {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = camera.aspect < 1 ? 62 : 46;
    camera.updateProjectionMatrix();
    skyMaterial.uniforms.uAspect.value = camera.aspect;
    beaconMaterial.uniforms.uPixelRatio.value = dpr;
    wake();
  };

  const render = (dt: number) => {
    const started = performance.now();
    if (!reduce) {
      time += dt;
      scroll += dt * params.speed;
      if (params.ambientFlashEvery > 0) {
        untilAmbient -= dt;
        if (untilAmbient <= 0) {
          ambientFlash();
          untilAmbient = params.ambientFlashEvery * (0.6 + Math.random() * 0.8);
        }
      }
    }
    placeBuildings();

    parallax.lerp(pointerInside ? pointer : new Vector2(0, 0), reduce ? 1 : 0.04);
    camera.position.set(parallax.x * 0.9, params.cameraHeight + parallax.y * 0.35, 12.5);
    camera.lookAt(lookTarget);
    camera.updateMatrixWorld();

    if (pointerDirty || hovered >= 0) {
      pointerDirty = false;
      raycaster.setFromCamera(pointer, camera);
      const hit = pointerInside ? raycaster.intersectObjects(hoverTargets, false)[0] : undefined;
      const instance = hit?.instanceId ?? -1;
      const id = hit && instance >= 0 && hit.object === roofs ? roofOwners[instance] : instance;
      if (id !== hovered && id >= 0) flash(id, 1);
      hovered = id;
    }

    for (let i = 0; i < count; i++) {
      flashes[i] = i === hovered ? Math.min(1, flashes[i] + dt * 6) : Math.max(0, flashes[i] - dt * 1.4);
    }
    flashAttribute.needsUpdate = true;
    roofOwners.forEach((i, k) => (roofFlashes[k] = flashes[i]));
    roofFlashAttribute.needsUpdate = true;
    for (const r of ripples) {
      if (r.z < 0) continue;
      r.y += dt * params.speed * (reduce ? 0 : 1);
      r.z += dt;
      if (r.z > 1.8) r.z = -1;
    }

    horizonProbe.set(camera.position.x, 0, -1000).project(camera);
    skyMaterial.uniforms.uHorizonY.value = horizonProbe.y * 0.5 + 0.5;
    skyMaterial.uniforms.uTime.value = time;
    buildingMaterial.uniforms.uTime.value = time;
    beaconMaterial.uniforms.uTime.value = time;
    groundMaterial.uniforms.uScroll.value = scroll % CELL;

    renderer.info.reset();
    renderer.clear();
    renderer.render(skyScene, skyCamera);
    renderer.render(scene, camera);
    reportHeroFrame({
      renderMs: performance.now() - started,
      drawCalls: renderer.info.render.calls,
      triangles: renderer.info.render.triangles,
      width: canvas.width,
      height: canvas.height,
    });
  };

  const tick = (now: number) => {
    const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
    last = now;
    render(dt);
    frame = !reduce || now < wakeUntil ? requestAnimationFrame(tick) : 0;
  };

  const play = () => {
    if (!visible || document.hidden || frame) return;
    last = 0;
    frame = requestAnimationFrame(tick);
  };
  const pause = () => {
    cancelAnimationFrame(frame);
    frame = 0;
  };
  // Reduced motion: render on demand for a couple of seconds after input, otherwise idle.
  function wake() {
    wakeUntil = performance.now() + 2200;
    play();
  }

  const onPointerMove = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    pointerInside = x >= 0 && x <= 1 && y >= 0 && y <= 1;
    pointer.set(x * 2 - 1, -(y * 2 - 1));
    pointerDirty = true;
    if (reduce) wake();
  };
  const onPointerLeave = () => {
    pointerInside = false;
    pointerDirty = true;
  };
  const onVisibility = () => (document.hidden ? pause() : play());

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) play();
    else pause();
  });
  intersection.observe(canvas);
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerdown", onPointerMove, { passive: true });
  document.documentElement.addEventListener("pointerleave", onPointerLeave);
  document.addEventListener("visibilitychange", onVisibility);
  resize();

  return {
    dispose() {
      pause();
      reportHeroFrame(null);
      resizeObserver.disconnect();
      intersection.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      [box, roofGeo, ground.geometry, beaconGeometry, skyScene.children[0] instanceof Mesh ? skyScene.children[0].geometry : null].forEach((g) => g?.dispose());
      [buildingMaterial, roofMaterial, groundMaterial, beaconMaterial, skyMaterial].forEach((m) => m.dispose());
      city.dispose();
      roofs?.dispose();
      renderer.dispose();
    },
  };
}
