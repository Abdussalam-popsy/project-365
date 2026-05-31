/**
 * Cuboctahedron — wireframe exploration
 *
 * Vanilla JS → R3F mental model:
 *   new THREE.WebGLRenderer()          → <Canvas>
 *   new THREE.PerspectiveCamera(...)   → <Canvas camera={{ fov, position }}>
 *   new THREE.Scene()                  → implicit, Canvas creates it
 *   new THREE.Mesh(geo, mat)           → <mesh><geometry /><material /></mesh>
 *   scene.add(mesh)                    → just render inside <Canvas>
 *   requestAnimationFrame(animate)     → useFrame((state, delta) => {})
 *   renderer.render(scene, camera)     → R3F handles this automatically
 */

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// ---------------------------------------------------------------------------
// Geometry data — same numbers you'd pass to new THREE.PolyhedronGeometry()
// A cuboctahedron has 12 vertices: all permutations of (±1, ±1, 0)
// ---------------------------------------------------------------------------
const VERTICES = [
  1,
  1,
  0,
  -1,
  1,
  0,
  1,
  -1,
  0,
  -1,
  -1,
  0, // xy-plane ring
  1,
  0,
  1,
  -1,
  0,
  1,
  1,
  0,
  -1,
  -1,
  0,
  -1, // xz-plane ring
  0,
  1,
  1,
  0,
  -1,
  1,
  0,
  1,
  -1,
  0,
  -1,
  -1, // yz-plane ring
];

const INDICES = [
  // 8 triangular faces
  0,
  4,
  8,
  1,
  8,
  5,
  2,
  9,
  4,
  3,
  5,
  9,
  0,
  10,
  6,
  1,
  7,
  10,
  2,
  6,
  11,
  3,
  11,
  7,
  // 6 square faces, each split into 2 triangles
  0,
  4,
  2,
  0,
  2,
  6, // +x face
  1,
  7,
  3,
  1,
  3,
  5, // -x face
  0,
  8,
  1,
  0,
  1,
  10, // +y face
  2,
  11,
  3,
  2,
  3,
  9, // -y face
  8,
  4,
  9,
  8,
  9,
  5, // +z face
  10,
  6,
  11,
  10,
  11,
  7, // -z face
];

// ---------------------------------------------------------------------------
// The shape component — owns its own animation loop
// ---------------------------------------------------------------------------
function Cuboctahedron() {
  const groupRef = useRef<THREE.Group>(null);

  // useMemo so geometry is built once, not on every render
  // In vanilla JS this is just: const geo = new THREE.PolyhedronGeometry(...)
  const geo = useMemo(
    () => new THREE.PolyhedronGeometry(VERTICES, INDICES, 1.5, 1),
    [],
  );

  // EdgesGeometry traces only the real edges — cleaner than wireframe:true
  // which draws diagonals across quad faces
  const edgesGeo = useMemo(() => new THREE.EdgesGeometry(geo), [geo]);

  // useFrame = requestAnimationFrame, runs every render frame
  // delta = seconds since last frame (frame-rate independent motion)
  useFrame((_state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.25; // control speed of rotate around y-axis
    groupRef.current.rotation.x += delta * 0.12; // control speed of rotate around x-axis
  });

  return (
    // group acts like a parent Object3D — rotation applies to both children
    <group ref={groupRef}>
      {/* Solid faces — equivalent to: new THREE.MeshStandardMaterial() */}
      <mesh geometry={geo}>
        {/* <meshStandardMaterial color="#CBC0FC" side={THREE.DoubleSide} /> */}
        {/* <meshNormalMaterial /> */}
        {/* <meshBasicMaterial color="#CBC0FC" wireframe={true} /> */}
        <meshPhongMaterial color="#CBC0FC" shininess={200} specular="#ffffff" />
      </mesh>

      {/* Wireframe edges — equivalent to: new THREE.LineSegments(edgesGeo, mat) */}
      <lineSegments geometry={edgesGeo}>
        <lineBasicMaterial color="#AAF5A1" />
      </lineSegments>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Root — Canvas replaces the renderer + camera + scene setup boilerplate
// ---------------------------------------------------------------------------
export default function App() {
  return (
    <div className="w-screen h-screen bg-black">
      {/* camera prop = new THREE.PerspectiveCamera(fov, aspect, near, far)
          aspect is calculated automatically from the canvas size            */}
      <Canvas camera={{ position: [0, 0, 4.5], fov: 60, near: 0.1, far: 100 }}>
        {/* Lights — same as adding them to scene in vanilla */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />

        <Cuboctahedron />

        {/* OrbitControls from drei — drag to rotate, scroll to zoom */}
        <OrbitControls enablePan={false} />
      </Canvas>
    </div>
  );
}
