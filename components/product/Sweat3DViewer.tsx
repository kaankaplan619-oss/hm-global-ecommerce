"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { Suspense, useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// ─── Vues prédéfinies ─────────────────────────────────────────────────────────
const VIEWS = [
  { y: 0.1,            label: "Face"   },
  { y: Math.PI + 0.1,  label: "Dos"    },
  { y: Math.PI * 0.5,  label: "Manche" },
];

// ─── Géométrie procédurale — sweatshirt col rond ──────────────────────────────
// Même silhouette extrudée que le hoodie, sans capuche, avec col côtelé.
function createSweatGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  // ── 1. Corps + manches (silhouette 2D identique au hoodie) ───────────────
  const bodyShape = new THREE.Shape();

  bodyShape.moveTo(-0.41, -0.54);          // bas gauche ceinture
  bodyShape.lineTo( 0.41, -0.54);          // bas droit ceinture
  bodyShape.lineTo( 0.40, -0.06);          // côté droit → aisselle

  // Manche droite
  bodyShape.lineTo( 0.80, -0.10);
  bodyShape.quadraticCurveTo( 0.84, -0.10,  0.84, -0.04);
  bodyShape.lineTo( 0.84,  0.22);
  bodyShape.quadraticCurveTo( 0.84,  0.28,  0.80,  0.28);
  bodyShape.lineTo( 0.40,  0.36);

  // Épaule droite → col rond
  bodyShape.lineTo( 0.40,  0.44);
  bodyShape.quadraticCurveTo( 0.28,  0.53,  0.16,  0.55);
  // Col (ouverture arrondie)
  bodyShape.quadraticCurveTo( 0.06,  0.57,  0.00,  0.57);
  bodyShape.quadraticCurveTo(-0.06,  0.57, -0.16,  0.55);
  bodyShape.quadraticCurveTo(-0.28,  0.53, -0.40,  0.44);

  // Épaule gauche
  bodyShape.lineTo(-0.40,  0.36);

  // Manche gauche
  bodyShape.lineTo(-0.80,  0.28);
  bodyShape.quadraticCurveTo(-0.84,  0.28, -0.84,  0.22);
  bodyShape.lineTo(-0.84, -0.04);
  bodyShape.quadraticCurveTo(-0.84, -0.10, -0.80, -0.10);
  bodyShape.lineTo(-0.40, -0.06);

  bodyShape.lineTo(-0.41, -0.54);          // fermeture

  const bodyGeom = new THREE.ExtrudeGeometry(bodyShape, {
    depth: 0.32,
    bevelEnabled: true,
    bevelThickness: 0.022,
    bevelSize:      0.022,
    bevelSegments:  4,
  });
  bodyGeom.translate(0, 0, -0.16);
  parts.push(bodyGeom);

  // ── 2. Col côtelé (bande surélevée autour de l'encolure) ─────────────────
  // Col en U légèrement en relief — forme identique au col du corps mais
  // plus petit et légèrement décalé vers l'avant
  const neckShape = new THREE.Shape();
  neckShape.moveTo(-0.16, 0.54);
  neckShape.quadraticCurveTo(-0.28, 0.52, -0.40, 0.44);
  neckShape.quadraticCurveTo(-0.44, 0.40, -0.40, 0.36);
  neckShape.quadraticCurveTo(-0.32, 0.46, -0.14, 0.50);
  neckShape.quadraticCurveTo(-0.06, 0.52,  0.00, 0.52);
  neckShape.quadraticCurveTo( 0.06, 0.52,  0.14, 0.50);
  neckShape.quadraticCurveTo( 0.32, 0.46,  0.40, 0.36);
  neckShape.quadraticCurveTo( 0.44, 0.40,  0.40, 0.44);
  neckShape.quadraticCurveTo( 0.28, 0.52,  0.16, 0.54);
  neckShape.quadraticCurveTo( 0.06, 0.57,  0.00, 0.57);
  neckShape.quadraticCurveTo(-0.06, 0.57, -0.16, 0.54);

  const neckGeom = new THREE.ExtrudeGeometry(neckShape, {
    depth: 0.06,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize:      0.008,
    bevelSegments:  2,
  });
  neckGeom.translate(0, 0, 0.13);          // en relief par rapport au corps
  parts.push(neckGeom);

  // ── 3. Ceinture basse (bande côtelée) ────────────────────────────────────
  const waistShape = new THREE.Shape();
  waistShape.moveTo(-0.42, -0.54);
  waistShape.lineTo( 0.42, -0.54);
  waistShape.lineTo( 0.44, -0.46);
  waistShape.lineTo(-0.44, -0.46);
  waistShape.lineTo(-0.42, -0.54);

  const waistGeom = new THREE.ExtrudeGeometry(waistShape, {
    depth: 0.33,
    bevelEnabled: false,
  });
  waistGeom.translate(0, 0, -0.165);
  parts.push(waistGeom);

  // ── Merge + nettoyage ─────────────────────────────────────────────────────
  const merged = mergeGeometries(parts);
  parts.forEach((g) => g.dispose());
  return merged;
}

// ─── Modèle sweat animé ───────────────────────────────────────────────────────
function SweatModel({
  color,
  viewIndex,
  autoRotate,
}: {
  color: string;
  viewIndex: number;
  autoRotate?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const meshRef  = useRef<THREE.Mesh>(null!);
  const currentY = useRef(VIEWS[0].y);
  const targetY  = useRef(VIEWS[0].y);

  const geometry = useMemo(() => createSweatGeometry(), []);

  useEffect(() => {
    if (autoRotate) return;
    const target  = VIEWS[viewIndex].y;
    const current = currentY.current;
    let delta = target - (current % (Math.PI * 2));
    if (delta > Math.PI)  delta -= Math.PI * 2;
    if (delta < -Math.PI) delta += Math.PI * 2;
    targetY.current = current + delta;
  }, [viewIndex, autoRotate]);

  useEffect(() => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    mat.color.set(color);
    mat.needsUpdate = true;
  }, [color]);

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

  // La géométrie s'étend de y≈-0.54 à y≈0.57 → centre à y≈0.015
  // Léger décalage vers le bas pour laisser de l'air au-dessus
  return (
    <group ref={groupRef} position={[0, -0.05, 0]} scale={1.05}>
      <mesh ref={meshRef} geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          color={color}
          roughness={0.88}
          metalness={0}
        />
      </mesh>
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
      <ambientLight intensity={1.2} color="#ffffff" />
      <directionalLight position={[2, 5, 5]}   intensity={2.2} color="#ffffff" castShadow />
      <directionalLight position={[-4, 3, 2]}  intensity={0.8} color="#e8f4ff" />
      <directionalLight position={[0, 2, -5]}  intensity={0.5} color="#ffffff" />

      <Suspense fallback={null}>
        <SweatModel color={color} viewIndex={viewIndex} autoRotate={autoRotate} />
      </Suspense>

      <ContactShadows
        position={[0, -0.60, 0]}
        opacity={0.12}
        scale={3}
        blur={2.5}
        color="#aaaaaa"
      />
    </>
  );
}

// ─── Composant public ─────────────────────────────────────────────────────────
interface Sweat3DViewerProps {
  color?:      string;
  viewIndex?:  number;
  className?:  string;
  autoRotate?: boolean;
  hideLabel?:  boolean;
}

export default function Sweat3DViewer({
  color      = "#111111",
  viewIndex  = 0,
  className  = "",
  autoRotate = false,
  hideLabel  = false,
}: Sweat3DViewerProps) {
  return (
    <div className={`relative overflow-hidden bg-white ${className}`}>
      <Canvas
        camera={{ position: [0, 0.0, 3.2], fov: 42 }}
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
