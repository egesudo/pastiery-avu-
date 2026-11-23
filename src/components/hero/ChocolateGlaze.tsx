import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { HERO_COLORS, QualityTier } from './heroConstants';
import { useDripClock } from './useDripClock';

export interface GlazeLobeTip {
  angle: number;
  x: number;
  yTip: number;
  z: number;
}

interface DripProfileResult {
  depth: number;
  lobeFactor: number;
}

const LOBE_DEFS = [
  { angle: 0.28, width: 0.26, depth: 0.36 },
  { angle: 1.02, width: 0.22, depth: 0.24 },
  { angle: 1.72, width: 0.29, depth: 0.41 },
  { angle: 2.52, width: 0.24, depth: 0.27 },
  { angle: 3.30, width: 0.27, depth: 0.38 },
  { angle: 4.10, width: 0.23, depth: 0.22 },
  { angle: 4.88, width: 0.28, depth: 0.39 },
  { angle: 5.66, width: 0.24, depth: 0.29 },
] as const;

function shortestAngleDiff(a: number, b: number): number {
  let diff = ((a - b + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return diff;
}

export function evaluateGlazeDripAtAngle(theta: number): DripProfileResult {
  let maxLobe = 0;
  let extraDepth = 0;

  for (let i = 0; i < LOBE_DEFS.length; i++) {
    const lobe = LOBE_DEFS[i];
    const dist = Math.abs(shortestAngleDiff(theta, lobe.angle));
    if (dist < lobe.width) {
      const normalized = dist / lobe.width;
      const bell = Math.pow(Math.cos(normalized * Math.PI * 0.5), 2.1);
      if (bell * lobe.depth > extraDepth) {
        extraDepth = bell * lobe.depth;
      }
      if (bell > maxLobe) {
        maxLobe = bell;
      }
    }
  }

  const baseSkirt = 0.085 + 0.02 * Math.sin(theta * 3.0 + 0.4);
  return {
    depth: baseSkirt + extraDepth,
    lobeFactor: maxLobe,
  };
}

export function getMainCakeDripDropSources(
  glazeRadius: number,
  glazeStartY: number,
  cakeThetaStart: number,
  cakeThetaLength: number
): GlazeLobeTip[] {
  const tips: GlazeLobeTip[] = [];
  const endAngle = cakeThetaStart + cakeThetaLength;

  for (let i = 0; i < LOBE_DEFS.length; i++) {
    const lobe = LOBE_DEFS[i];
    // Açının 315° ana pasta yayı içinde olduğundan emin ol
    let a = lobe.angle;
    while (a < cakeThetaStart) a += Math.PI * 2;
    if (a > cakeThetaStart + 0.14 && a < endAngle - 0.14) {
      const { depth } = evaluateGlazeDripAtAngle(lobe.angle);
      tips.push({
        angle: lobe.angle,
        x: (glazeRadius + 0.01) * Math.cos(lobe.angle),
        yTip: glazeStartY - depth,
        z: (glazeRadius + 0.01) * Math.sin(lobe.angle),
      });
    }
  }

  return tips;
}

export interface GlazeGeometryOptions {
  radius: number;
  yBase: number;
  yTop: number;
  thetaStart: number;
  thetaLength: number;
  radialSegs: number;
  heightSegs: number;
}

export function createGlazeSectionGeometry({
  radius,
  yBase,
  yTop,
  thetaStart,
  thetaLength,
  radialSegs,
  heightSegs,
}: GlazeGeometryOptions): THREE.BufferGeometry {
  const positions: number[] = [];
  const uvs: number[] = [];
  const dripFactors: number[] = [];
  const lobeAmps: number[] = [];
  const indices: number[] = [];

  const pushVertex = (
    x: number,
    y: number,
    z: number,
    u: number,
    v: number,
    dripFactor: number,
    lobeAmp: number
  ) => {
    positions.push(x, y, z);
    uvs.push(u, v);
    dripFactors.push(dripFactor);
    lobeAmps.push(lobeAmp);
    return positions.length / 3 - 1;
  };

  // Profil noktaları: merkez taç -> üst düzlem -> yuvarlak kenar -> damla eteği
  const crownRings = 3;
  const shoulderRings = 3;
  const totalRings = crownRings + shoulderRings + heightSegs;

  const grid: number[][] = [];

  for (let s = 0; s <= radialSegs; s++) {
    const fracS = s / radialSegs;
    const theta = thetaStart + fracS * thetaLength;
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);

    const { depth, lobeFactor } = evaluateGlazeDripAtAngle(theta);
    const lobeAmp = 0.025 + 0.095 * lobeFactor;

    const col: number[] = [];

    // 1) Üst taç halkaları (r = 0.002 -> radius - 0.04)
    for (let rIdx = 0; rIdx < crownRings; rIdx++) {
      const t = rIdx / crownRings;
      const r = 0.002 + t * (radius - 0.04);
      const dome = Math.cos(t * Math.PI * 0.5) * 0.012;
      col.push(
        pushVertex(r * cosT, yTop + dome, r * sinT, fracS, t * 0.35, 0, 0)
      );
    }

    // 2) Yuvarlak omuz geçişi
    for (let sh = 0; sh < shoulderRings; sh++) {
      const t = sh / (shoulderRings - 1);
      const r = radius - 0.04 + Math.sin(t * Math.PI * 0.5) * 0.062;
      const y = yTop - (1 - Math.cos(t * Math.PI * 0.5)) * 0.038;
      col.push(
        pushVertex(r * cosT, y, r * sinT, fracS, 0.35 + t * 0.15, t * 0.08, lobeAmp * 0.15)
      );
    }

    // 3) Aşağı sarkan damla dilleri (v: 0..1)
    const skirtTopY = yTop - 0.038;
    const skirtRadius = radius + 0.022;

    for (let h = 1; h <= heightSegs; h++) {
      const v = h / heightSegs;
      const y = skirtTopY - v * depth;
      // Uçlarda viskoz damla şişkinliği, en altta hafif içe toparlanma
      const bulb =
        v > 0.72 ? Math.sin(((v - 0.72) / 0.28) * Math.PI) * 0.014 : 0;
      const tipTaper = v > 0.92 ? -((v - 0.92) / 0.08) * 0.012 : 0;
      const r = skirtRadius + bulb + tipTaper;

      col.push(
        pushVertex(
          r * cosT,
          y,
          r * sinT,
          fracS,
          0.5 + v * 0.5,
          v,
          lobeAmp
        )
      );
    }

    grid.push(col);
  }

  for (let s = 0; s < radialSegs; s++) {
    for (let r = 0; r < totalRings; r++) {
      const a = grid[s][r];
      const b = grid[s + 1][r];
      const c = grid[s + 1][r + 1];
      const d = grid[s][r + 1];
      indices.push(a, b, c, a, c, d);
    }
  }

  // Dilim kesit yüzeylerinde üst glazürü kapat (yTop -> yBase arası ince dolgu şeridi)
  const addCutCap = (colIndex: number, flipWinding: boolean) => {
    const theta =
      colIndex === 0 ? thetaStart : thetaStart + thetaLength;
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);

    const centerTop = pushVertex(0, yTop + 0.012, 0, 0.5, 0, 0, 0);
    const centerBot = pushVertex(0, yBase, 0, 0.5, 1, 0, 0);
    const edgeTop = pushVertex(
      (radius + 0.012) * cosT,
      yTop - 0.004,
      (radius + 0.012) * sinT,
      1,
      0,
      0.05,
      0
    );
    const edgeBot = pushVertex(
      (radius + 0.012) * cosT,
      yBase,
      (radius + 0.012) * sinT,
      1,
      1,
      0.05,
      0
    );

    if (flipWinding) {
      indices.push(centerTop, edgeTop, edgeBot, centerTop, edgeBot, centerBot);
    } else {
      indices.push(centerTop, edgeBot, edgeTop, centerTop, centerBot, edgeBot);
    }
  };

  addCutCap(0, false);
  addCutCap(radialSegs, true);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setAttribute('aDripFactor', new THREE.Float32BufferAttribute(dripFactors, 1));
  geometry.setAttribute('aLobeAmp', new THREE.Float32BufferAttribute(lobeAmps, 1));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

export interface ChocolateGlazeMaterialController {
  material: THREE.MeshPhysicalMaterial;
  dispose: () => void;
}

export function createChocolateGlazeMaterial(
  useShaderFlow: boolean
): {
  material: THREE.MeshPhysicalMaterial;
  uniforms: { uTime: { value: number }; uCycle: { value: number } };
} {
  const uniforms = {
    uTime: { value: 0 },
    uCycle: { value: 0 },
  };

  const material = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(HERO_COLORS.glazeDark),
    roughness: 0.25,
    metalness: 0.02,
    clearcoat: 1.0,
    clearcoatRoughness: 0.12,
    reflectivity: 0.9,
    side: THREE.DoubleSide,
  });

  if (useShaderFlow) {
    material.customProgramCacheKey = () => 'chocolate-glaze-flow-v1';
    material.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = uniforms.uTime;
      shader.uniforms.uCycle = uniforms.uCycle;

      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          `#include <common>
          attribute float aDripFactor;
          attribute float aLobeAmp;
          uniform float uTime;
          uniform float uCycle;
          varying float vDripFactor;
          varying vec3 vGlazeLocalPos;`
        )
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
          vDripFactor = aDripFactor;
          float waveShift = sin(uTime * 1.4 + position.x * 2.5 + position.z * 2.5) * 0.008;
          transformed.y -= (uCycle * aDripFactor * aLobeAmp) + (waveShift * aDripFactor * uCycle);
          float tipSwell = uCycle * smoothstep(0.55, 1.0, aDripFactor);
          transformed.xz *= (1.0 + tipSwell * 0.068);
          vGlazeLocalPos = transformed;`
        );

      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          `#include <common>
          uniform float uTime;
          uniform float uCycle;
          varying float vDripFactor;
          varying vec3 vGlazeLocalPos;`
        )
        .replace(
          '#include <color_fragment>',
          `#include <color_fragment>
          vec3 glazeDarkLin = vec3(0.024, 0.009, 0.004);
          vec3 glazeMilkLin = vec3(0.194, 0.068, 0.024);
          vec3 caramelTipLin = vec3(0.584, 0.254, 0.048);

          vec3 baseChocolate = mix(glazeDarkLin, glazeMilkLin, smoothstep(0.15, 0.85, vDripFactor));
          float tipWeight = smoothstep(0.68, 1.0, vDripFactor) * (0.28 + 0.55 * uCycle);
          vec3 tintedGlaze = mix(baseChocolate, caramelTipLin, tipWeight);

          // Yüzeyde yavaş kayan ince parlama (glossy highlight) bandı
          float sweepPos = mod(uTime * 0.55, 3.8) - 1.9;
          float diagCoord = vGlazeLocalPos.x * 0.78 + vGlazeLocalPos.z * 0.62;
          float glossBand = exp(-pow((diagCoord - sweepPos) * 4.2, 2.0));
          tintedGlaze += vec3(0.22, 0.13, 0.05) * glossBand * (0.45 + 0.55 * uCycle);

          diffuseColor.rgb = tintedGlaze;`
        );
    };
  }

  return { material, uniforms };
}

interface ChocolateGlazeMeshProps {
  geometryOptions: GlazeGeometryOptions;
  tier: QualityTier;
  prefersReducedMotion: boolean;
  isPaused: boolean;
  onClick?: (e: { stopPropagation: () => void }) => void;
}

export const ChocolateGlaze: React.FC<ChocolateGlazeMeshProps> = React.memo(
  ({ geometryOptions, tier, prefersReducedMotion, isPaused, onClick }) => {
    const useShaderFlow = tier === 'high' && !prefersReducedMotion;

    const geometry = useMemo(
      () => createGlazeSectionGeometry(geometryOptions),
      [
        geometryOptions.radius,
        geometryOptions.yBase,
        geometryOptions.yTop,
        geometryOptions.thetaStart,
        geometryOptions.thetaLength,
        geometryOptions.radialSegs,
        geometryOptions.heightSegs,
      ]
    );

    const { material, uniforms } = useMemo(
      () => createChocolateGlazeMaterial(useShaderFlow),
      [useShaderFlow]
    );

    const { sampleClock } = useDripClock({
      isPaused: isPaused || !useShaderFlow,
    });

    const isPausedRef = useRef(isPaused);
    isPausedRef.current = isPaused;

    useFrame(() => {
      if (!useShaderFlow || isPausedRef.current) return;
      const sample = sampleClock();
      uniforms.uTime.value = sample.uTime;
      uniforms.uCycle.value = sample.uCycle;
    });

    useEffect(() => {
      return () => {
        geometry.dispose();
        material.dispose();
      };
    }, [geometry, material]);

    return (
      <mesh
        geometry={geometry}
        material={material}
        onClick={onClick}
        castShadow={false}
        receiveShadow={false}
      />
    );
  }
);
ChocolateGlaze.displayName = 'ChocolateGlaze';
