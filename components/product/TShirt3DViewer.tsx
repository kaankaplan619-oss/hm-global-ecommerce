"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, ContactShadows } from "@react-three/drei";
import { Suspense, useEffect, useRef } from "react";
import * as THREE from "three";

useGLTF.preload("/models/shirt.glb");

// ─── Vues prédéfinies ─────────────────────────────────────────────────────────
const VIEWS = [
  { y: 0.1,              label: "Face" },      // face légèrement de biais
  { y: Math.PI + 0.1,   label: "Dos" },        // dos
  { y: Math.PI * 0.5,   label: "Manche" },     // côté droit / manche
];

// ─── Modèle 3D animé ─────────────────────────────────────────────────────────
function ShirtModel({
  color,
  viewIndex,
  autoRotate,
}: {
  color: string;
  viewIndex: number;
  autoRotate?: boolean;
}) {
  const { scene } = useGLTF("/models/shirt.glb");
  const groupRef  = useRef<THREE.Group>(null!);
  const currentY  = useRef(VIEWS[0].y);
  const targetY   = useRef(VIEWS[0].y);

  // Mise à jour de l'angle cible quand viewIndex change (mode navigation)
  useEffect(() => {
    if (autoRotate) return;
    const target = VIEWS[viewIndex].y;
    const current = currentY.current;
    let delta = target - (current % (Math.PI * 2));
    if (delta > Math.PI)  delta -= Math.PI * 2;
    if (delta < -Math.PI) delta += Math.PI * 2;
    targetY.current = current + delta;
  }, [viewIndex, autoRotate]);

  // Couleur + matière tissu
  useEffect(() => {
    const col = new THREE.Color(color);
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as THREE.MeshStandardMaterial;
        mat.color        = col;
        mat.roughness    = 0.88;
        mat.metalness    = 0;
        mat.needsUpdate  = true;
      }
    });
  }, [scene, color]);

  // Animation : rotation continue (card) ou lerp vers vue cible (détail)
  useFrame(() => {
    if (!groupRef.current) return;
    if (autoRotate) {
      currentY.current += 0.006; // ~1 tour / 17s à 60fps
      groupRef.current.rotation.y = currentY.current;
    } else {
      currentY.current = THREE.MathUtils.lerp(currentY.current, targetY.current, 0.07);
      groupRef.current.rotation.y = currentY.current;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive
        object={scene}
        scale={2.5}
        position={[0, 0.1, 0]}
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
      <directionalLight position={[2, 5, 5]}   intensity={2.0} color="#ffffff" castShadow />
      <directionalLight position={[-4, 3, 2]}  intensity={0.7} color="#e8f4ff" />
      <directionalLight position={[0, 2, -5]}  intensity={0.4} color="#ffffff" />

      <Suspense fallback={null}>
        <ShirtModel color={color} viewIndex={viewIndex} autoRotate={autoRotate} />
      </Suspense>

      <ContactShadows
        position={[0, -1.4, 0]}
        opacity={0.15}
        scale={4}
        blur={2}
        color="#aaaaaa"
      />
    </>
  );
}

// ─── Composant public ─────────────────────────────────────────────────────────
interface TShirt3DViewerProps {
  color?:      string;
  viewIndex?:  number;   // 0=face, 1=dos, 2=manche
  className?:  string;
  /** Rotation automatique continue (mode card catalogue) */
  autoRotate?: boolean;
  /** Masquer le pill indicateur de vue */
  hideLabel?:  boolean;
}

export default function TShirt3DViewer({
  color      = "#111111",
  viewIndex  = 0,
  className  = "",
  autoRotate = false,
  hideLabel  = false,
}: TShirt3DViewerProps) {
  return (
    <div className={`relative overflow-hidden bg-white ${className}`}>
      <Canvas
        camera={{ position: [0, 0.1, 3.0], fov: 40 }}
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

      {/* Indicateur de vue actuelle — masqué en mode auto-rotation */}
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
