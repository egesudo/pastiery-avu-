import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import {
  HERO_CAKE_CONFIG,
  HERO_COLORS,
  HERO_DRIPS,
  HERO_TIMINGS,
  QualityTier,
} from './heroConstants';
import { GlazeLobeTip } from './ChocolateGlaze';
import { useDripClock } from './useDripClock';

interface CakeDropsProps {
  dripSources: GlazeLobeTip[];
  standTopY: number;
  tier: QualityTier;
  isPaused: boolean;
  prefersReducedMotion: boolean;
}

interface DropSlotState {
  sourceIndex: number;
  startMs: number;
  durationMs: number;
  toneDark: boolean;
}

const MAX_DROP_SLOTS = 3;

// Zero-allocation math helpers outside useFrame
const _dummy = new THREE.Object3D();
const _ringDummy = new THREE.Object3D();
const _cDark = new THREE.Color(HERO_COLORS.glazeDark);
const _cMilk = new THREE.Color(HERO_COLORS.milkChocolate);

/**
 * Aktif 2.5 sn damla penceresinde çikolata glazür uçlarından kopup
 * porselen tablaya düşen ve küçük sıçrama halkası bırakarak kaybolan damlalar (InstancedMesh).
 */
export const CakeDrops: React.FC<CakeDropsProps> = React.memo(
  ({ dripSources, standTopY, tier, isPaused, prefersReducedMotion }) => {
    const dropMeshRef = useRef<THREE.InstancedMesh>(null);
    const ringMeshRef = useRef<THREE.InstancedMesh>(null);

    const lastSessionRef = useRef<number>(-999);
    const slotsRef = useRef<DropSlotState[]>([
      { sourceIndex: 0, startMs: 120, durationMs: 680, toneDark: true },
      { sourceIndex: 1, startMs: 640, durationMs: 740, toneDark: false },
      { sourceIndex: 2, startMs: 1180, durationMs: 660, toneDark: true },
    ]);

    const activeCount =
      tier === 'high'
        ? HERO_DRIPS.cakeActiveDropCountHigh
        : HERO_DRIPS.cakeActiveDropCountLow;

    const { sampleClock } = useDripClock({
      isPaused: isPaused || prefersReducedMotion,
    });

    const { dropGeo, dropMat, ringGeo, ringMat } = useMemo(() => {
      // Damla şekli: hafif uzamış sferoid
      const dGeo = new THREE.SphereGeometry(0.032, 10, 10);
      dGeo.scale(0.85, 1.35, 0.85);

      const dMat = new THREE.MeshPhysicalMaterial({
        color: '#ffffff',
        roughness: 0.22,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
      });

      const rGeo = new THREE.RingGeometry(0.022, 0.048, 18);
      rGeo.rotateX(-Math.PI / 2);

      const rMat = new THREE.MeshBasicMaterial({
        color: HERO_COLORS.glazeMid,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      });

      return { dropGeo: dGeo, dropMat: dMat, ringGeo: rGeo, ringMat: rMat };
    }, []);

    useEffect(() => {
      const dropMesh = dropMeshRef.current;
      const ringMesh = ringMeshRef.current;
      if (!dropMesh || !ringMesh) return;

      for (let i = 0; i < MAX_DROP_SLOTS; i++) {
        _dummy.scale.set(0, 0, 0);
        _dummy.updateMatrix();
        dropMesh.setMatrixAt(i, _dummy.matrix);
        dropMesh.setColorAt(i, i % 2 === 0 ? _cDark : _cMilk);

        _ringDummy.scale.set(0, 0, 0);
        _ringDummy.updateMatrix();
        ringMesh.setMatrixAt(i, _ringDummy.matrix);
      }

      dropMesh.instanceMatrix.needsUpdate = true;
      if (dropMesh.instanceColor) dropMesh.instanceColor.needsUpdate = true;
      ringMesh.instanceMatrix.needsUpdate = true;
    }, []);

    useEffect(() => {
      return () => {
        dropGeo.dispose();
        dropMat.dispose();
        ringGeo.dispose();
        ringMat.dispose();
      };
    }, [dropGeo, dropMat, ringGeo, ringMat]);

    useFrame(() => {
      const dropMesh = dropMeshRef.current;
      const ringMesh = ringMeshRef.current;
      if (!dropMesh || !ringMesh) return;

      if (prefersReducedMotion || isPaused || dripSources.length === 0) {
        for (let i = 0; i < MAX_DROP_SLOTS; i++) {
          _dummy.scale.set(0, 0, 0);
          _dummy.updateMatrix();
          dropMesh.setMatrixAt(i, _dummy.matrix);

          _ringDummy.scale.set(0, 0, 0);
          _ringDummy.updateMatrix();
          ringMesh.setMatrixAt(i, _ringDummy.matrix);
        }
        dropMesh.instanceMatrix.needsUpdate = true;
        ringMesh.instanceMatrix.needsUpdate = true;
        return;
      }

      const sample = sampleClock();

      // Yeni aktif seans başladığında damla kaynaklarını deterministik/çeşitli dağıt
      if (sample.isActive && sample.sessionIndex !== lastSessionRef.current) {
        lastSessionRef.current = sample.sessionIndex;
        const countSources = dripSources.length;
        for (let i = 0; i < MAX_DROP_SLOTS; i++) {
          const idx = (sample.sessionIndex * 2 + i * 2) % countSources;
          slotsRef.current[i] = {
            sourceIndex: idx,
            startMs: 140 + i * 520,
            durationMs: HERO_TIMINGS.dropFallMs + 140,
            toneDark: (sample.sessionIndex + i) % 3 !== 1,
          };
          dropMesh.setColorAt(i, slotsRef.current[i].toneDark ? _cDark : _cMilk);
        }
        if (dropMesh.instanceColor) dropMesh.instanceColor.needsUpdate = true;
      }

      const splashWindowMs = HERO_TIMINGS.dropSplashMs;

      for (let i = 0; i < MAX_DROP_SLOTS; i++) {
        if (!sample.isActive || i >= activeCount) {
          _dummy.scale.set(0, 0, 0);
          _dummy.updateMatrix();
          dropMesh.setMatrixAt(i, _dummy.matrix);

          _ringDummy.scale.set(0, 0, 0);
          _ringDummy.updateMatrix();
          ringMesh.setMatrixAt(i, _ringDummy.matrix);
          continue;
        }

        const slot = slotsRef.current[i];
        const src = dripSources[slot.sourceIndex % dripSources.length];
        const localMs = sample.sessionElapsedMs - slot.startMs;

        if (localMs >= 0 && localMs < slot.durationMs) {
          // Yerçekimi hissiyle hızlanan düşüş
          const t = localMs / slot.durationMs;
          const gravityT = t * t;
          const startY = src.yTip - 0.06;
          const endY = standTopY + 0.025;
          const y = THREE.MathUtils.lerp(startY, endY, gravityT);

          const scaleIn = Math.min(1, t * 4.5);
          const stretchY = 0.85 + t * 0.55;
          const fadeOutScale = t > 0.88 ? (1 - t) / 0.12 : 1;

          _dummy.position.set(src.x, y, src.z);
          _dummy.scale.set(
            scaleIn * fadeOutScale,
            scaleIn * stretchY * fadeOutScale,
            scaleIn * fadeOutScale
          );
          _dummy.updateMatrix();
          dropMesh.setMatrixAt(i, _dummy.matrix);
        } else {
          _dummy.scale.set(0, 0, 0);
          _dummy.updateMatrix();
          dropMesh.setMatrixAt(i, _dummy.matrix);
        }

        // Tabla yüzeyinde düşüş sonu küçük sıçrama halkası
        const splashLocalMs = localMs - slot.durationMs * 0.92;
        if (splashLocalMs >= 0 && splashLocalMs < splashWindowMs) {
          const st = splashLocalMs / splashWindowMs;
          const expand = 0.5 + st * 1.45;
          const shrinkFade = st < 0.35 ? 1 : 1 - (st - 0.35) / 0.65;
          _ringDummy.position.set(src.x, standTopY + 0.014, src.z);
          _ringDummy.scale.set(expand * shrinkFade, 1, expand * shrinkFade);
          _ringDummy.updateMatrix();
          ringMesh.setMatrixAt(i, _ringDummy.matrix);
        } else {
          _ringDummy.scale.set(0, 0, 0);
          _ringDummy.updateMatrix();
          ringMesh.setMatrixAt(i, _ringDummy.matrix);
        }
      }

      dropMesh.instanceMatrix.needsUpdate = true;
      ringMesh.instanceMatrix.needsUpdate = true;
    });

    if (prefersReducedMotion) {
      return null;
    }

    return (
      <group name="cake-dripping-particles">
        <instancedMesh
          ref={dropMeshRef}
          args={[dropGeo, dropMat, MAX_DROP_SLOTS]}
          frustumCulled={false}
        />
        <instancedMesh
          ref={ringMeshRef}
          args={[ringGeo, ringMat, MAX_DROP_SLOTS]}
          frustumCulled={false}
        />
      </group>
    );
  }
);
CakeDrops.displayName = 'CakeDrops';
