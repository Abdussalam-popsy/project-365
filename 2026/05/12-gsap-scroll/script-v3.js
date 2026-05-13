gsap.registerPlugin(ScrollTrigger);

// ── Arc geometry (matches Figma SVG exactly) ──────────────────────────────────
// Circle center and midpoint radius (halfway between outer R=1044 and inner R=839.44)
const CX = 720, CY = 1044, R = 941.72;

// Entry / exit points at y=800 (below the viewBox → off-screen)
const START_ANGLE = Math.atan2(800 - CY, -190 - CX); // ≈ −2.883 rad (bottom-left)
const END_ANGLE   = Math.atan2(800 - CY, 1630 - CX); // ≈ −0.263 rad (bottom-right)
// Interpolating start → end passes through −π/2 (the peak at y≈102) ✓

// ── Ball positioning ──────────────────────────────────────────────────────────
const scene = document.getElementById("v3-scene");
const ball  = document.getElementById("v3-ball");

function updateBall(progress) {
  const angle = START_ANGLE + progress * (END_ANGLE - START_ANGLE);
  const x = CX + R * Math.cos(angle);
  const y = CY + R * Math.sin(angle);
  const rot = progress * 720; // 2 clockwise rotations over the full journey
  ball.setAttribute("transform", `translate(${x} ${y}) rotate(${rot})`);
}

// Place ball off-screen before any scroll interaction
updateBall(0);

// ── ScrollTrigger — pins the scene, drives ball via onUpdate ─────────────────
ScrollTrigger.create({
  trigger: scene,
  start: "top top",
  end: "+=200%",
  pin: true,
  scrub: 1,
  onUpdate: (self) => updateBall(self.progress),
  markers: window.DEBUG,
});
