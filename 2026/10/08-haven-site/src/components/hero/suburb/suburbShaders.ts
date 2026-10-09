// GLSL for the v5 neighbourhood. Every face is one flat colour, shaded by which way it points.

export const MAX_GROUPS = 128;

export const partVertex = /* glsl */ `
#define MAX_GROUPS ${MAX_GROUPS}
attribute vec3 aColor;
attribute float aGroup;
attribute float aGlow;
attribute float aFlicker;
uniform float uFlashes[MAX_GROUPS];
uniform float uTime;
varying vec3 vColor;
varying vec3 vWorld;
varying float vWindow;
varying float vGlow;
varying float vFlash;
varying float vDepth;

void main() {
  int g = int(aGroup + 0.5);
  vec4 world = modelMatrix * instanceMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vColor = aColor;
  vWindow = step(0.001, aGlow + aFlicker);
  float blink = aFlicker > 0.0 ? step(0.25, sin(uTime * (0.25 + aFlicker * 0.5) + aFlicker * 50.0)) : 1.0;
  vGlow = aGlow * blink;
  vFlash = uFlashes[g];
  vec4 mv = viewMatrix * world;
  vDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`;

export const partFragment = /* glsl */ `
uniform vec3 uGlass;
uniform vec3 uFlash;
uniform vec3 uFog;
uniform vec2 uFogRange;
varying vec3 vColor;
varying vec3 vWorld;
varying float vWindow;
varying float vGlow;
varying float vFlash;
varying float vDepth;

void main() {
  vec3 n = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
  if (dot(n, cameraPosition - vWorld) < 0.0) n = -n;
  float shade = 0.62 + 0.38 * clamp(n.y, 0.0, 1.0) + 0.1 * n.z - 0.05 * n.x;
  vec3 col = mix(vColor, uGlass, vWindow) * shade;
  col = mix(col, vColor, vGlow);
  col = mix(col, uFlash, vFlash * 0.3) + uFlash * vFlash * vWindow * 0.6;
  float fog = smoothstep(uFogRange.x, uFogRange.y, vDepth);
  gl_FragColor = vec4(mix(col, uFog, fog), 1.0);
}
`;

export const streetVertex = /* glsl */ `
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

export const streetFragment = /* glsl */ `
#define MAX_RIPPLES 6
uniform vec3 uLawn;
uniform vec3 uRoad;
uniform vec3 uPavementColor;
uniform vec3 uFlash;
uniform vec3 uFog;
uniform vec2 uFogRange;
uniform float uCurve;
uniform float uCamZ;
uniform float uRoadHalf;
uniform float uSideHalf;
uniform float uPavement;
uniform float uFar;
uniform float uLength;
uniform float uBlock;
uniform float uJunction;
uniform float uTravel;
uniform float uGlow;
uniform vec3 uRipples[MAX_RIPPLES];
varying vec3 vWorld;
varying float vDepth;

void main() {
  vec2 p = vWorld.xz;
  // The road bends sideways by uCurve * (distance from the camera)^2.
  float dz = p.y - uCamZ;
  float slope = 2.0 * uCurve * dz;
  float lateral = (p.x - uCurve * dz * dz) / sqrt(1.0 + slope * slope);
  // Undo the drift to find where along the (repeating) street this pixel is.
  float along = mod(p.y - uFar - uTravel, uLength);
  float block = floor(along / uBlock);
  float local = along - block * uBlock;
  float side = mod(block, 2.0) < 0.5 ? -1.0 : 1.0;

  // Signed distances: negative inside the tarmac.
  float main = abs(lateral) - uRoadHalf;
  float branch = lateral * side > 0.0 ? abs(local - uJunction) - uSideHalf : 1e3;
  float road = min(main, branch);
  float aa = fwidth(road);
  float onRoad = 1.0 - smoothstep(-aa, aa, road);
  float onPavement = 1.0 - smoothstep(-aa, aa, road - uPavement);

  vec3 col = mix(uLawn, uPavementColor, onPavement);
  col = mix(col, uRoad, onRoad);

  for (int i = 0; i < MAX_RIPPLES; i++) {
    vec3 rp = uRipples[i];
    if (rp.z < 0.0) continue;
    float d = length(p - rp.xy);
    float ring = exp(-pow((d - rp.z * 3.0) * 2.6, 2.0)) * max(0.0, 1.0 - rp.z / 1.6);
    col += uFlash * ring * 0.5 * uGlow;
  }

  float fog = smoothstep(uFogRange.x, uFogRange.y, vDepth);
  gl_FragColor = vec4(mix(col, uFog, fog), 1.0);
}
`;
