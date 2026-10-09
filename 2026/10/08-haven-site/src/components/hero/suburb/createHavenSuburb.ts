import {
  BoxGeometry, BufferAttribute, BufferGeometry, DoubleSide, IcosahedronGeometry, InstancedBufferAttribute,
  InstancedMesh, Matrix4, Mesh, OrthographicCamera, PerspectiveCamera, PlaneGeometry, Quaternion, Raycaster,
  Scene, ShaderMaterial, Sphere, Vector2, Vector3, WebGLRenderer,
} from "three";
import { skyFragment, skyVertex } from "../city/shaders";
import { reportHeroFrame } from "../perfStats";
import { MAX_GROUPS, partFragment, partVertex, streetFragment, streetVertex } from "./suburbShaders";
import {
  blockLength, carParts, houseKinds, planStreet, seeded, street, streetLength, treeParts, type Part, type Prim,
} from "./suburbHouses";
import { suburbThemes, type SuburbThemeName } from "./suburbTheme";

export type HavenSuburbParams = {
  speed: number; curve: number; cameraHeight: number; cameraZ: number; lookY: number;
  litWindows: number; warmth: number; flicker: number; trees: number; sway: number;
  ambientFlashEvery: number; glow: number;
};

export const defaultHavenSuburbParams: HavenSuburbParams = {
  speed: 0.45, curve: 0.004, cameraHeight: 2.6, cameraZ: 12, lookY: 2,
  litWindows: 0.55, warmth: 0.5, flicker: 0.1, trees: 0.6, sway: 0.35,
  ambientFlashEvery: 3, glow: 1,
};

const MAX_RIPPLES = 6;
const FOG_RANGE = new Vector2(16, 42);
const UP = new Vector3(0, 1, 0);

function srgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return new Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}
function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}
/** Unit roof, base 1×1 at y = 0, ridge along x at y = 1. ridgeHalf 0.5 = gable, smaller = hip. */
function roof(ridgeHalf: number) {
  const A = [-0.5, 0, 0.5], B = [0.5, 0, 0.5], C = [0.5, 0, -0.5], D = [-0.5, 0, -0.5];
  const R1 = [-ridgeHalf, 1, 0], R2 = [ridgeHalf, 1, 0];
  const g = new BufferGeometry();
  g.setAttribute("position", new BufferAttribute(new Float32Array([A, B, R2, A, R2, R1, D, R1, R2, D, R2, C, A, R1, D, B, C, R2].flat()), 3));
  return g;
}

/** Something that moves as one along the street: a house, a tree or a car. Only houses flash. */
type Group = { at: number; lateral: number; yaw: number; mirror: boolean; parts: Part[]; house: boolean };

export function createHavenSuburb(
  canvas: HTMLCanvasElement,
  options: { theme?: SuburbThemeName; params?: Partial<HavenSuburbParams>; reducedMotion?: boolean } = {},
) {
  const p = { ...defaultHavenSuburbParams, ...options.params };
  const t = suburbThemes[options.theme ?? "dark"];
  const reduce = options.reducedMotion ?? false;
  const edge = street.roadHalf + street.pavement;

  // 1. Plan the street as groups of parts, in "street space": `at` along the road, `lateral` across it.
  const groups: Group[] = [];
  planStreet().forEach((plan, i) => {
    const shape = houseKinds[plan.kind]({
      theme: t, rand: rng(1000 + i * 77), lit: p.litWindows, warmth: p.warmth, flicker: p.flicker,
      focal: plan.focal, chimney: plan.chimney,
      wall: plan.focal ? t.focalWall : t.walls[plan.colour % t.walls.length],
      roof: plan.focal ? t.focalRoof : t.roofs[plan.colour % t.roofs.length],
    });
    const front = shape.d / 2 + street.setback / 2;
    const parts: Part[] = [...shape.parts, { prim: "box", pos: [shape.doorX, 0, front], size: [0.34, 0.015, street.setback], color: t.pavement }];
    if (shape.driveX !== undefined) parts.push({ prim: "box", pos: [shape.driveX, 0, front], size: [0.95, 0.015, street.setback], color: t.driveway });
    if (plan.edge === "hedge") parts.push({ prim: "box", pos: [1.6, 0, front - shape.d / 4], size: [0.28, 0.32, shape.d + street.setback], color: t.hedge });
    if (plan.edge === "fence") parts.push({ prim: "box", pos: [-1.6, 0, front - shape.d / 4], size: [0.05, 0.24, shape.d + street.setback], color: t.fence });
    if (plan.car && shape.driveX !== undefined) parts.push(...carParts(t, t.cars[i % t.cars.length]).map((c) => ({ ...c, pos: [c.pos[0] + shape.driveX!, c.pos[1], c.pos[2] + shape.d / 2 + street.setback * 0.55] as Part["pos"] })));
    groups.push({
      at: plan.at, lateral: plan.side * (edge + street.setback + shape.d / 2),
      yaw: -plan.side * (Math.PI / 2), mirror: plan.mirror, parts, house: true,
    });
  });
  // Street trees on the verge, back-garden trees behind the houses, and one car parked per block.
  const plots = street.blocks * street.plotsPerBlock;
  for (let k = 0; k < plots * 2; k++) {
    const side = k % 2 ? 1 : -1, plot = Math.floor(k / 2);
    const at = street.far + plot * street.plot;
    if (seeded(k, 11) < p.trees * 0.7) groups.push({ at, lateral: side * (edge + 0.55), yaw: k, mirror: false, parts: treeParts(t, t.trees[k % 3], 0.8 + seeded(k, 12) * 0.4), house: false });
    if (seeded(k, 13) < p.trees) groups.push({ at: at + 1.7, lateral: side * (7.2 + seeded(k, 14) * 2), yaw: k, mirror: false, parts: treeParts(t, t.trees[(k + 1) % 3], 1 + seeded(k, 15) * 0.5), house: false });
  }
  for (let b = 0; b < street.blocks; b++) {
    const side = b % 2 ? -1 : 1;
    groups.push({ at: street.far + b * blockLength + 2.6 * street.plot, lateral: side * (street.roadHalf - 0.42), yaw: 0, mirror: false, parts: carParts(t, t.cars[b % t.cars.length]), house: false });
  }
  if (groups.length > MAX_GROUPS) groups.length = MAX_GROUPS;

  // 2. One InstancedMesh per primitive shape; every part becomes one instance.
  const geometries: Record<Prim, BufferGeometry> = {
    box: new BoxGeometry(1, 1, 1).translate(0, 0.5, 0),
    gable: roof(0.5),
    hip: roof(0.18),
    blob: new IcosahedronGeometry(0.5, 0).translate(0, 0.5, 0),
  };
  const flashes = new Array(MAX_GROUPS).fill(0);
  const material = new ShaderMaterial({
    vertexShader: partVertex, fragmentShader: partFragment, side: DoubleSide,
    uniforms: {
      uFlashes: { value: flashes }, uTime: { value: 0 },
      uGlass: { value: srgb(t.glass) }, uFlash: { value: srgb(t.flash) },
      uFog: { value: srgb(t.fog) }, uFogRange: { value: FOG_RANGE },
    },
  });
  const scene = new Scene();
  const meshes: { mesh: InstancedMesh; groupOf: number[]; local: Matrix4[] }[] = [];
  (Object.keys(geometries) as Prim[]).forEach((prim) => {
    const items = groups.flatMap((g, gi) => g.parts.filter((part) => part.prim === prim).map((part) => ({ gi, part })));
    if (!items.length) return;
    const geo = geometries[prim];
    const color = new Float32Array(items.length * 3), group = new Float32Array(items.length);
    const glow = new Float32Array(items.length), flicker = new Float32Array(items.length);
    const mesh = new InstancedMesh(geo, material, items.length);
    const local = items.map(({ gi, part }, k) => {
      color.set(srgb(part.color).toArray(), k * 3);
      group[k] = gi;
      // Windows: 1 = lit, a tiny value = unlit glass (so the shader still knows it is a window).
      glow[k] = part.window ? (part.window.lit ? 1 : 0.0001) : 0;
      flicker[k] = part.window?.lit ? part.window.flicker : 0;
      const [px, py, pz] = part.pos, [sx, sy, sz] = part.size;
      return new Matrix4().compose(new Vector3(px, py, pz), new Quaternion().setFromAxisAngle(UP, part.yaw ?? 0), new Vector3(sx, sy, sz));
    });
    geo.setAttribute("aColor", new InstancedBufferAttribute(color, 3));
    geo.setAttribute("aGroup", new InstancedBufferAttribute(group, 1));
    geo.setAttribute("aGlow", new InstancedBufferAttribute(glow, 1));
    geo.setAttribute("aFlicker", new InstancedBufferAttribute(flicker, 1));
    mesh.frustumCulled = false;
    // Instances move every frame, so give the raycaster one big sphere instead of recomputing it.
    mesh.boundingSphere = new Sphere(new Vector3(0, 0, -15), 200);
    scene.add(mesh);
    meshes.push({ mesh, groupOf: Array.from(group), local });
  });

  // 3. Ground with the roads drawn by the shader, and the sky behind everything.
  const ripples = Array.from({ length: MAX_RIPPLES }, () => new Vector3(0, 0, -1));
  let nextRipple = 0;
  const streetMaterial = new ShaderMaterial({
    vertexShader: streetVertex, fragmentShader: streetFragment,
    uniforms: {
      uLawn: { value: srgb(t.lawn) }, uRoad: { value: srgb(t.road) }, uPavementColor: { value: srgb(t.pavement) },
      uFlash: { value: srgb(t.flash) }, uFog: { value: srgb(t.fog) }, uFogRange: { value: FOG_RANGE },
      uCurve: { value: p.curve }, uCamZ: { value: p.cameraZ }, uRoadHalf: { value: street.roadHalf },
      uSideHalf: { value: street.sideHalf }, uPavement: { value: street.pavement }, uFar: { value: street.far },
      uLength: { value: streetLength }, uBlock: { value: blockLength }, uJunction: { value: street.plot / 2 },
      uTravel: { value: 0 }, uGlow: { value: p.glow }, uRipples: { value: ripples },
    },
  });
  const ground = new Mesh(new PlaneGeometry(120, 90).rotateX(-Math.PI / 2), streetMaterial);
  ground.position.z = -20;
  scene.add(ground);
  const skyScene = new Scene();
  const skyMaterial = new ShaderMaterial({
    vertexShader: skyVertex, fragmentShader: skyFragment, depthTest: false, depthWrite: false,
    uniforms: {
      uTop: { value: srgb(t.skyTop) }, uMid: { value: srgb(t.skyMid) }, uFog: { value: srgb(t.skyFog) },
      uHorizon: { value: srgb(t.horizon) }, uHorizonY: { value: 0.6 }, uAspect: { value: 1 },
      uGlow: { value: t.skyGlow * p.glow }, uTime: { value: 0 },
    },
  });
  skyScene.add(new Mesh(new PlaneGeometry(2, 2), skyMaterial));
  const skyCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.autoClear = false;
  renderer.info.autoReset = false;
  const camera = new PerspectiveCamera(46, 1, 0.1, 120);
  const raycaster = new Raycaster();
  const pointer = new Vector2(), parallax = new Vector2(), probe = new Vector3(), look = new Vector3();
  const groupMatrix = groups.map(() => new Matrix4()), tmp = new Matrix4();
  const q = new Quaternion(), pos = new Vector3(), scale = new Vector3();
  let time = 0, travel = 0, pointerInside = false, pointerDirty = false, hovered = -1, untilAmbient = p.ambientFlashEvery;
  let frame = 0, last = 0, visible = true, wakeUntil = 0;

  const bend = (z: number) => p.curve * (z - p.cameraZ) ** 2;
  /** Street space → world: wrap `at` into the visible stretch, then follow the curve. */
  const place = () => {
    groups.forEach((g, i) => {
      const z = street.far + ((((g.at - street.far + travel) % streetLength) + streetLength) % streetLength);
      const theta = Math.atan(2 * p.curve * (z - p.cameraZ));
      pos.set(bend(z) + g.lateral * Math.cos(theta), 0, z - g.lateral * Math.sin(theta));
      q.setFromAxisAngle(UP, g.yaw + theta);
      groupMatrix[i].compose(pos, q, scale.set(g.mirror ? -1 : 1, 1, 1));
    });
    for (const { mesh, groupOf, local } of meshes) {
      for (let k = 0; k < local.length; k++) mesh.setMatrixAt(k, tmp.multiplyMatrices(groupMatrix[groupOf[k]], local[k]));
      mesh.instanceMatrix.needsUpdate = true;
    }
  };
  const houseIds = groups.flatMap((g, i) => (g.house ? [i] : []));
  const flash = (gi: number, strength: number) => {
    flashes[gi] = Math.max(flashes[gi], strength);
    pos.setFromMatrixPosition(groupMatrix[gi]);
    ripples[nextRipple].set(pos.x, pos.z, 0);
    nextRipple = (nextRipple + 1) % MAX_RIPPLES;
  };

  const render = (dt: number) => {
    const started = performance.now();
    if (!reduce) {
      time += dt;
      travel += dt * p.speed;
      if (p.ambientFlashEvery > 0 && (untilAmbient -= dt) <= 0) {
        const near = houseIds.filter((i) => { pos.setFromMatrixPosition(groupMatrix[i]); return pos.z > -20 && pos.z < 6; });
        if (near.length) flash(near[Math.floor(Math.random() * near.length)], 0.7);
        untilAmbient = p.ambientFlashEvery * (0.6 + Math.random() * 0.8);
      }
    }
    place();
    parallax.lerp(pointerInside ? pointer : new Vector2(), reduce ? 1 : 0.04);
    camera.position.set(Math.sin(time * 0.08) * p.sway + parallax.x * 0.5, p.cameraHeight + parallax.y * 0.2, p.cameraZ);
    camera.lookAt(look.set(bend(-10) * 0.5, p.lookY, -10));
    camera.updateMatrixWorld();

    if (pointerDirty || hovered >= 0) {
      pointerDirty = false;
      raycaster.setFromCamera(pointer, camera);
      const hit = pointerInside ? raycaster.intersectObjects(meshes.map((x) => x.mesh), false)[0] : undefined;
      const owner = hit && hit.instanceId !== undefined ? meshes.find((x) => x.mesh === hit.object)!.groupOf[hit.instanceId] : -1;
      const id = owner >= 0 && groups[owner].house ? owner : -1;
      if (id !== hovered && id >= 0) flash(id, 1);
      hovered = id;
    }
    for (let i = 0; i < groups.length; i++)
      flashes[i] = i === hovered ? Math.min(1, flashes[i] + dt * 6) : Math.max(0, flashes[i] - dt * 1.4);
    for (const r of ripples) if (r.z >= 0) { r.y += dt * p.speed; if ((r.z += dt) > 1.6) r.z = -1; }

    probe.set(camera.position.x, 0, -1000).project(camera);
    skyMaterial.uniforms.uHorizonY.value = probe.y * 0.5 + 0.5;
    skyMaterial.uniforms.uTime.value = time;
    material.uniforms.uTime.value = time;
    streetMaterial.uniforms.uTravel.value = travel % streetLength;
    renderer.info.reset();
    renderer.clear();
    renderer.render(skyScene, skyCamera);
    renderer.render(scene, camera);
    reportHeroFrame({ renderMs: performance.now() - started, drawCalls: renderer.info.render.calls, triangles: renderer.info.render.triangles, width: canvas.width, height: canvas.height });
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
  const pause = () => { cancelAnimationFrame(frame); frame = 0; };
  const wake = () => { wakeUntil = performance.now() + 2200; play(); };
  const resize = () => {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = camera.aspect < 1 ? 62 : 46;
    camera.updateProjectionMatrix();
    skyMaterial.uniforms.uAspect.value = camera.aspect;
    wake();
  };
  const onPointerMove = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width, y = (e.clientY - rect.top) / rect.height;
    pointerInside = x >= 0 && x <= 1 && y >= 0 && y <= 1;
    pointer.set(x * 2 - 1, -(y * 2 - 1));
    pointerDirty = true;
    if (reduce) wake();
  };
  const onPointerLeave = () => { pointerInside = false; pointerDirty = true; };
  const onVisibility = () => (document.hidden ? pause() : play());
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) play(); else pause(); });
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
      Object.values(geometries).forEach((g) => g.dispose());
      ground.geometry.dispose();
      (skyScene.children[0] as Mesh).geometry.dispose();
      [material, streetMaterial, skyMaterial].forEach((x) => x.dispose());
      meshes.forEach(({ mesh }) => mesh.dispose());
      renderer.dispose();
    },
  };
}
