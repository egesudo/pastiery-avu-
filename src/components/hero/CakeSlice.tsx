import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { HERO_CAKE_CONFIG, HERO_COLORS, QualityTier } from './heroConstants';
import { ChocolateGlaze } from './ChocolateGlaze';

export interface CakeLayerSpec {
  id: string;
  kind: 'sponge' | 'cream';
  yBottom: number;
  height: number;
  radiusOffset: number;
  color: string;
  roughness: number;
}

export const CAKE_LAYER_STACK: CakeLayerSpec[] = [
  {
    id: 'sponge-bottom',
    kind: 'sponge',
    yBottom: 0.0,
    height: 0.25,
    radiusOffset: 0,
    color: HERO_COLORS.cakeSpongeCocoa,
    roughness: 0.88,
  },
  {
    id: 'cream-lower',
    kind: 'cream',
    yBottom: 0.25,
    height: 0.09,
    radiusOffset: 0.008,
    color: HERO_COLORS.vanillaCream,
    roughness: 0.45,
  },
  {
    id: 'sponge-middle',
    kind: 'sponge',
    yBottom: 0.34,
    height: 0.25,
    radiusOffset: 0,
    color: HERO_COLORS.cakeSpongeCocoa,
    roughness: 0.88,
  },
  {
    id: 'cream-upper',
    kind: 'cream',
    yBottom: 0.59,
    height: 0.09,
    radiusOffset: 0.008,
    color: HERO_COLORS.vanillaCream,
    roughness: 0.45,
  },
  {
    id: 'sponge-top',
    kind: 'sponge',
    yBottom: 0.68,
    height: 0.26,
    radiusOffset: 0,
    color: HERO_COLORS.cakeSpongeCocoa,
    roughness: 0.88,
  },
];

/**
 * Kapalı kesit yüzeylerine sahip yuvarlatılmış pasta sektörü (315° gövde ve 45° dilim için)
 */
export function createCakeSectorGeometry(
  radius: number,
  height: number,
  thetaStart: number,
  thetaLength: number,
  curveSegments: number,
  apexInset = 0
): THREE.ExtrudeGeometry {
  const bevel = 0.01;
  const effectiveRadius = Math.max(0.1, radius - bevel);
  const innerDepth = Math.max(0.02, height - bevel * 2);

  const midTheta = thetaStart + thetaLength * 0.5;
  const apexX = apexInset * Math.cos(midTheta);
  const apexY = -apexInset * Math.sin(midTheta);

  // rotateX(-PI/2) sonrası (cos(theta), sin(theta)) XZ düzlemine tam hizalanır
  const phiStart = -(thetaStart + thetaLength);
  const phiEnd = -thetaStart;

  const shape = new THREE.Shape();
  shape.moveTo(apexX, apexY);
  shape.lineTo(
    effectiveRadius * Math.cos(phiStart),
    effectiveRadius * Math.sin(phiStart)
  );
  shape.absarc(0, 0, effectiveRadius, phiStart, phiEnd, false);
  shape.lineTo(apexX, apexY);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: innerDepth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    curveSegments,
  });

  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, bevel, 0);
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Prosedürel kakaolu pandispanya gözenek dokusu (harici dosya yok)
 */
export function createSpongeBumpTexture(): THREE.DataTexture {
  const size = 64;
  const data = new Uint8Array(size * size * 4);
  let seed = 48271;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let i = 0; i < size * size; i++) {
    const grain = Math.floor(110 + rand() * 140);
    const idx = i * 4;
    data[idx] = grain;
    data[idx + 1] = grain;
    data[idx + 2] = grain;
    data[idx + 3] = 255;
  }

  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  texture.needsUpdate = true;
  return texture;
}

export function createRosetteGeometry(highDetail: boolean): THREE.LatheGeometry {
  const pts = [
    new THREE.Vector2(0.001, 0),
    new THREE.Vector2(0.115, 0.005),
    new THREE.Vector2(0.125, 0.035),
    new THREE.Vector2(0.092, 0.065),
    new THREE.Vector2(0.098, 0.092),
    new THREE.Vector2(0.056, 0.122),
    new THREE.Vector2(0.032, 0.152),
    new THREE.Vector2(0.0, 0.175),
  ];
  const geo = new THREE.LatheGeometry(pts, highDetail ? 14 : 9);
  geo.computeVertexNormals();
  return geo;
}

interface CakeSliceProps {
  isOpen: boolean;
  tier: QualityTier;
  prefersReducedMotion: boolean;
  isPaused: boolean;
  spongeMaterial: THREE.MeshStandardMaterial;
  creamMaterial: THREE.MeshStandardMaterial;
  rosetteGeometry: THREE.BufferGeometry;
  berryGeometry: THREE.BufferGeometry;
  berryMaterial: THREE.MeshPhysicalMaterial;
  leafGeometry: THREE.BufferGeometry;
  leafMaterial: THREE.MeshStandardMaterial;
  onToggleSlice: () => void;
}

export const CakeSlice: React.FC<CakeSliceProps> = React.memo(
  ({
    isOpen,
    tier,
    prefersReducedMotion,
    isPaused,
    spongeMaterial,
    creamMaterial,
    rosetteGeometry,
    berryGeometry,
    berryMaterial,
    leafGeometry,
    leafMaterial,
    onToggleSlice,
  }) => {
    const sliceGroupRef = useRef<THREE.Group>(null);
    const progressRef = useRef<number>(isOpen ? 1 : 0);

    const sliceStart = HERO_CAKE_CONFIG.sliceStartAngleRad + 0.006;
    const sliceLength = HERO_CAKE_CONFIG.sliceAngleRad - 0.012;
    const midAngle = sliceStart + sliceLength * 0.5;
    const dirX = Math.cos(midAngle);
    const dirZ = Math.sin(midAngle);

    // Dilim üzerindeki tek rozet ve çilek/vişne dekoru
    const sliceRosettePos = useMemo<[number, number, number]>(() => {
      const r = HERO_CAKE_CONFIG.cakeRadius - 0.24;
      return [r * Math.cos(midAngle), 0.945, r * Math.sin(midAngle)];
    }, [midAngle]);

    const sliceBerryPos = useMemo<[number, number, number]>(() => {
      const r = 0.54;
      const a = midAngle - 0.06;
      return [r * Math.cos(a), 1.02, r * Math.sin(a)];
    }, [midAngle]);

    const layerGeometries = useMemo(() => {
      const segs = tier === 'high' ? 12 : 7;
      return CAKE_LAYER_STACK.map((layer) =>
        createCakeSectorGeometry(
          HERO_CAKE_CONFIG.cakeRadius + layer.radiusOffset,
          layer.height,
          sliceStart,
          sliceLength,
          segs,
          0.022
        )
      );
    }, [tier, sliceStart, sliceLength]);

    useEffect(() => {
      return () => {
        layerGeometries.forEach((g) => g.dispose());
      };
    }, [layerGeometries]);

    const glazeOptions = useMemo(
      () => ({
        radius: HERO_CAKE_CONFIG.cakeRadius,
        yBase: 0.94,
        yTop: 0.962,
        thetaStart: sliceStart,
        thetaLength: sliceLength,
        radialSegs: tier === 'high' ? 16 : 8,
        heightSegs: tier === 'high' ? 10 : 5,
      }),
      [tier, sliceStart, sliceLength]
    );

    useFrame((_, delta) => {
      const group = sliceGroupRef.current;
      if (!group) return;
      if (isPaused && !prefersReducedMotion) return;

      const target = isOpen ? 1 : 0;
      if (prefersReducedMotion) {
        if (progressRef.current === target) return;
        progressRef.current = target;
      } else {
        if (Math.abs(progressRef.current - target) < 0.0002) {
          if (progressRef.current === target) return;
          progressRef.current = target;
        } else {
          const dt = Math.min(delta, 0.05);
          progressRef.current = THREE.MathUtils.damp(
            progressRef.current,
            target,
            7.5,
            dt
          );
        }
      }

      const p = progressRef.current;
      const slideDist = p * HERO_CAKE_CONFIG.sliceSlideOutDistance;

      group.position.set(dirX * slideDist, p * 0.08, dirZ * slideDist);
      // Radyal yöne dik eksen etrafında hafif zarif eğim
      const tilt = p * HERO_CAKE_CONFIG.sliceTiltRad;
      group.rotation.set(dirZ * tilt, 0, -dirX * tilt);
    });

    const handleClick = (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      onToggleSlice();
    };

    return (
      <group ref={sliceGroupRef} name="cake-slice-45deg">
        {CAKE_LAYER_STACK.map((layer, idx) => (
          <mesh
            key={layer.id}
            position={[0, layer.yBottom, 0]}
            geometry={layerGeometries[idx]}
            material={layer.kind === 'sponge' ? spongeMaterial : creamMaterial}
            onClick={handleClick}
          />
        ))}

        <ChocolateGlaze
          geometryOptions={glazeOptions}
          tier={tier}
          prefersReducedMotion={prefersReducedMotion}
          isPaused={isPaused}
          onClick={handleClick}
        />

        {/* Dilim üzeri krema rozeti */}
        <mesh
          position={sliceRosettePos}
          geometry={rosetteGeometry}
          material={creamMaterial}
          onClick={handleClick}
        />

        {/* Dilim üzeri çilek/vişne ve yaprak */}
        <group position={sliceBerryPos} onClick={handleClick}>
          <mesh
            scale={[1.05, 0.92, 1.05]}
            geometry={berryGeometry}
            material={berryMaterial}
          />
          <mesh
            position={[0.025, 0.092, 0.01]}
            rotation={[0.3, 0.4, -0.4]}
            geometry={leafGeometry}
            material={leafMaterial}
          />
          <mesh
            position={[-0.022, 0.09, -0.015]}
            rotation={[-0.25, 2.2, 0.35]}
            geometry={leafGeometry}
            material={leafMaterial}
          />
        </group>
      </group>
    );
  }
);
CakeSlice.displayName = 'CakeSlice';
