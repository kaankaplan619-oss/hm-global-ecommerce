"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, ContactShadows } from "@react-three/drei";
import { Suspense, useEffect, useRef } from "react";
import * as THREE from "three";

useGLTF.preload("/models/hoodie.glb");

// ─── Vues prédéfinies ─────────────────────────────────────────────────────────
const VIEWS = [
  { y: 0.1,            label: "Face"   },
  { y: Math.PI + 0.1,  label: "Dos"    },
  { y: Math.PI * 0.5,  label: "Manche" },
];

// ─── Modèle 3D animé ─────────────────────────────────────────────────────────
function HoodieModel({
  color,
  viewIndex,
  autoRotate,
}: {
  color: string;
  viewIndex: number;
  autoRotate?: boolean;
}) {
  const { scene } = useGLTF("/models/hoodie.glb");
  const groupRef   = useRef<THREE.Group>(null!);
  const currentY   = useRef(VIEWS[0].y);
  const targetY    = useRef(VIEWS[0].y);

  useEffect(() => {
    if (autoRotate) return;
    const target  = VIEWS[viewIndex].y;
    const current = currentY.current;
    let delta = target - (current % (Math.PI * 2));
    if (delta > Math.PI)  delta -= Math.PI * 2;
    if (delta < -Math.PI) delta += Math.PI * 2;
    targetY.current = current + delta;
  }, [viewIndex, autoRotate]);

  // Appliquer la couleur à tous les meshes du GLB
  useEffect(() => {
    const col = new THREE.Color(color);
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as THREE.MeshStandardMaterial;
        mat.color       = col;
        mat.roughness   = 0.88;
        mat.metalness   = 0;
        mat.needsUpdate = true;
      }
    });
  }, [scene, color]);

  useFrame(() => {
    if (!groupRef.current) return;
    if (autoRotate) {
      currentY.current += 0.006;
      groupRef.current.rotation.y = currentY.current;
    } else {
      currentY.current = THREE.MathUtils.lerp(currentY.current, targetY.current, 0.07);
      groupRef.current.rotation.y = currentY.current;
    }
  });

  return (
    <group ref={groupRef}>
      {/* rotation-y={Math.PI} — corrige l'orientation Blender→Three.js (GLB face arrière en premier) */}
      <primitive
        object={scene}
        scale={1.05}
        position={[0, -0.10, 0]}
        rotation={[0, Math.PI, 0]}
      />
    </group>
  );
}

// ─── Scène ────────────────────────────────────────────────────────────────────
function Scene({
  color,
  viewIndex,
  autoRotate,
}: {
  color: string;
  viewIndex: number;
  autoRotate?: boolean;
}) {
  return (
    <>
      <ambientLight intensity={1.1} color="#ffffff" />
      <directionalLight position={[2, 5, 5]}  intensity={2.0} color="#ffffff" castShadow />
      <directionalLight position={[-4, 3, 2]} intensity={0.7} color="#e8f4ff" />
      <directionalLight position={[0, 2, -5]} intensity={0.4} color="#ffffff" />

      <Suspense fallback={null}>
        <HoodieModel color={color} viewIndex={viewIndex} autoRotate={autoRotate} />
      </Suspense>

      <ContactShadows
        position={[0, -0.95, 0]}
        opacity={0.15}
        scale={4}
        blur={2}
        color="#aaaaaa"
      />
    </>
  );
}

// ─── Composant public ─────────────────────────────────────────────────────────
interface Hoodie3DViewerProps {
  color?:      string;
  viewIndex?:  number;
  className?:  string;
  autoRotate?: boolean;
  hideLabel?:  boolean;
}

export default function Hoodie3DViewer({
  color      = "#111111",
  viewIndex  = 0,
  className  = "",
  autoRotate = false,
  hideLabel  = false,
}: Hoodie3DViewerProps) {
  return (
    <div className={`relative overflow-hidden bg-white ${className}`}>
      <Canvas
        camera={{ position: [0, 0.1, 3.2], fov: 42 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(new THREE.Color("#ffffff"), 1);
          scene.background = new THREE.Color("#ffffff");
        }}
        shadows
      >
        <Suspense fallback={null}>
          <Scene color={color} viewIndex={viewIndex} autoRotate={autoRotate} />
        </Suspense>
      </Canvas>

      {!hideLabel && !autoRotate && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full border border-[var(--hm-line)] bg-white/95 px-3 py-1.5 text-[10px] font-semibold text-[var(--hm-text-soft)] shadow-sm">
          {VIEWS.map((v, i) => (
            <span
              key={v.label}
              className={`transition-colors ${i === viewIndex ? "text-[var(--hm-primary)]" : ""}`}
            >
              {i === viewIndex ? v.label : "·"}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
