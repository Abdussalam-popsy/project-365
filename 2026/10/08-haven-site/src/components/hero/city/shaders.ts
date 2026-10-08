// GLSL for the Haven skyline. Colours arrive as raw sRGB vec3s and are written straight to the canvas.

export const buildingVertex = /* glsl */ `
attribute vec3 aSize;
attribute float aSeed;
attribute float aFlash;
varying vec3 vLocal;
varying vec3 vNormal;
varying vec3 vSize;
varying float vSeed;
varying float vFlash;
varying float vDepth;

void main() {
  vLocal = position * aSize;
  vNormal = normal;
  vSize = aSize;
  vSeed = aSeed;
  vFlash = aFlash;
  vec4 mv = viewMatrix * modelMatrix * instanceMatrix * vec4(position, 1.0);
  vDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`;

export const buildingFragment = /* glsl */ `
uniform float uTime;
uniform float uWindowDensity;
uniform float uFlicker;
uniform vec3 uGlass;
uniform vec3 uGlassTop;
uniform vec3 uWindow;
uniform vec3 uWindowAlt;
uniform vec3 uFlash;
uniform vec3 uFog;
uniform vec2 uFogRange;
varying vec3 vLocal;
varying vec3 vNormal;
varying vec3 vSize;
varying float vSeed;
varying float vFlash;
varying float vDepth;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

void main() {
  vec3 n = normalize(vNormal);
  float top = step(0.5, n.y);
  bool sideX = abs(n.x) > 0.5;
  float u = sideX ? vLocal.z : vLocal.x;
  float halfWidth = 0.5 * (sideX ? vSize.z : vSize.x);
  float face = sideX ? sign(n.x) : 2.0 + sign(n.z);

  vec2 g = vec2(u, vLocal.y) / vec2(0.12, 0.17);
  vec2 id = floor(g);
  vec2 f = fract(g);
  float pane = step(0.22, f.x) * step(f.x, 0.78) * step(0.28, f.y) * step(f.y, 0.72);
  float r = hash(vec3(id, face + vSeed * 31.0));
  float lit = step(1.0 - uWindowDensity, r);
  float blinks = step(1.0 - uFlicker, hash(vec3(id.yx, vSeed * 7.0 + face)));
  lit = mix(lit, step(0.35, sin(uTime * (0.4 + r * 1.6) + r * 40.0)), blinks);

  float body = step(0.25, vLocal.y) * step(vLocal.y, vSize.y - 0.12) * step(abs(u), halfWidth - 0.06);
  float sharp = clamp(1.0 - max(fwidth(g.x), fwidth(g.y)) * 1.2, 0.0, 1.0);
  float win = mix(uWindowDensity * 0.45, pane * lit, sharp) * body * (1.0 - top);
  vec3 winColor = mix(uWindow, uWindowAlt, step(0.5, hash(vec3(id, vSeed + 3.0))));

  vec3 col = mix(uGlass, uGlassTop, clamp(vLocal.y / 9.0, 0.0, 1.0));
  col *= sideX ? 0.62 : 1.0;
  col *= mix(1.0, 0.55, smoothstep(2.5, 9.0, vLocal.y));
  col = mix(col, uGlassTop * 1.25, top * 0.7);
  col += winColor * win * (0.5 + 0.4 * r);

  float rim = smoothstep(0.05, 0.0, halfWidth - abs(u)) * (1.0 - top) + smoothstep(0.05, 0.0, vSize.y - vLocal.y);
  col += uWindowAlt * rim * 0.22;

  float flash = pow(vFlash, 1.4);
  float panes = mix(0.45, pane, sharp) * body * (1.0 - top);
  col += uFlash * flash * (0.14 + panes * 1.1 + rim * 0.8);

  float fog = smoothstep(uFogRange.x, uFogRange.y, vDepth);
  gl_FragColor = vec4(mix(col, uFog, fog), 1.0);
}
`;

export const groundVertex = /* glsl */ `
varying vec3 vWorld;
varying float vDepth;

void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vec4 mv = viewMatrix * world;
  vDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`;

export const groundFragment = /* glsl */ `
#define MAX_RIPPLES 6
uniform float uScroll;
uniform float uCell;
uniform float uFarZ;
uniform float uGlow;
uniform vec3 uBase;
uniform vec3 uGrid;
uniform vec3 uFlash;
uniform vec3 uFog;
uniform vec2 uFogRange;
uniform vec3 uRipples[MAX_RIPPLES];
varying vec3 vWorld;
varying float vDepth;

float gridLine(float v) {
  float d = abs(fract(v - 0.5) - 0.5) / fwidth(v);
  return 1.0 - min(d, 1.0);
}

void main() {
  float gx = vWorld.x / uCell + 0.5;
  float gz = (vWorld.z - uFarZ - uScroll) / uCell + 0.5;
  float line = max(gridLine(gx), gridLine(gz));
  vec3 col = uBase + uGrid * line * 0.3;
  col += uGrid * 0.1 * exp(-abs(vWorld.x) * 0.9);

  for (int i = 0; i < MAX_RIPPLES; i++) {
    vec3 rp = uRipples[i];
    if (rp.z < 0.0) continue;
    float d = length(vWorld.xz - rp.xy);
    float ring = exp(-pow((d - rp.z * 3.4) * 2.6, 2.0)) * max(0.0, 1.0 - rp.z / 1.8);
    float pool = exp(-d * 1.4) * max(0.0, 1.0 - rp.z / 1.1) * 0.5;
    col += uFlash * (ring + pool) * uGlow;
  }

  float fog = smoothstep(uFogRange.x, uFogRange.y, vDepth);
  gl_FragColor = vec4(mix(col, uFog, fog), 1.0);
}
`;

export const skyVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const skyFragment = /* glsl */ `
uniform vec3 uTop;
uniform vec3 uMid;
uniform vec3 uFog;
uniform vec3 uHorizon;
uniform float uHorizonY;
uniform float uAspect;
uniform float uGlow;
uniform float uTime;
varying vec2 vUv;

void main() {
  float y = vUv.y;
  vec3 col = mix(uMid, uTop, smoothstep(uHorizonY, 1.0, y));
  col = mix(col, uFog, smoothstep(uHorizonY + 0.28, uHorizonY, y) * 0.85);
  float dx = (vUv.x - 0.5 + 0.04 * sin(uTime * 0.07)) * uAspect;
  float dy = y - uHorizonY;
  col += uHorizon * exp(-dx * dx * 1.1 - dy * dy * 16.0) * 0.55 * uGlow;
  gl_FragColor = vec4(col, 1.0);
}
`;

export const beaconVertex = /* glsl */ `
attribute float aSeed;
uniform float uTime;
uniform float uPixelRatio;
varying float vAlpha;
varying float vDepth;

void main() {
  vec4 mv = viewMatrix * modelMatrix * vec4(position, 1.0);
  vDepth = -mv.z;
  vAlpha = pow(0.5 + 0.5 * sin(uTime * (1.2 + aSeed) + aSeed * 40.0), 8.0);
  gl_PointSize = 9.0 * uPixelRatio * (12.0 / vDepth);
  gl_Position = projectionMatrix * mv;
}
`;

export const beaconFragment = /* glsl */ `
uniform vec3 uColor;
uniform vec2 uFogRange;
varying float vAlpha;
varying float vDepth;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d) * vAlpha * (1.0 - smoothstep(uFogRange.x, uFogRange.y, vDepth));
  gl_FragColor = vec4(uColor * a, a);
}
`;
