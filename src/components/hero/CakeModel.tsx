import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import {
  HERO_CAKE_CONFIG,
  HERO_COLORS,
  HERO_TIMINGS,
  QualityTier,
} from './heroConstants';
import {
  ChocolateGlaze,
  getMainCakeDripDropSources,
} from './ChocolateGlaze';
import {
  CAKE_LAYER_STACK,
  CakeSlice,
  createCakeSectorGeometry,
  createRosetteGeometry,
  createSpongeBumpTexture,
} from './CakeSlice';
import { CakeDrops } from './CakeDrops';

interface CakeModelProps {
  tier: QualityTier;
  isSliceOpen: boolean;
  isDragging: boolean;
  isPaused: boolean;
  prefersReducedMotion: boolean;
  isEntered: boolean;
  wobbleTrigger: number;
  keyboardYawOffset: number;
  onToggleSlice: () => void;
  onCakePointerOver: () => void;
  onCakePointerOut: () => void;
}

function easeInOutCubic(t: number): number {
  const clamped = Math.min(1, Math.max(0, t));
  return clamped < 0.5
    ? 4 * clamped * clamped * clamped
    : 1 - Math.pow(-2 * clamped + 2, 3) / 2;
}

interface RotationRampState {
  fromSpeed: number;
  toSpeed: number;
  elapsedSec: number;
  durationSec: number;
}

export const CakeModel: React.FC<CakeModelProps> = React.memo(
  ({
    tier,
    isSliceOpen,
    isDragging,
    isPaused,
    prefersReducedMotion,
    isEntered,
    wobbleTrigger,
    keyboardYawOffset,
    onToggleSlice,
    onCakePointerOver,
    onCakePointerOut,
  }) => {
    const turntableGroupRef = useRef<THREE.Group>(null);
    const cakeBodyBounceRef = useRef<THREE.Group>(null);

    // Otomatik dönüş hızı: 0'dan 1.5 sn easeInOutCubic S-eğrisiyle 0.60 rad/sn hıza ivmelenir
    const autoRotateSpeedRef = useRef<number>(0);
    const rotationRampRef = useRef<RotationRampState>({
      fromSpeed: 0,
      toSpeed: 0,
      elapsedSec: 0,
      durationSec: HERO_CAKE_CONFIG.autoRotateEaseInDurationSec,
    });
    const resumeAllowedAtRef = useRef<number>(0);
    const prevDraggingRef = useRef<boolean>(isDragging);

    // Giriş inişi (drop-in) ve jöle sallanma durumları
    const entranceElapsedRef = useRef<number>(prefersReducedMotion ? 10 : 0);
    const wobbleRemainingRef = useRef<number>(0);
    const baseYawRef = useRef<number>(-0.35);
    const smoothedKeyboardYawRef = useRef<number>(keyboardYawOffset);
    const prevKeyboardOffsetRef = useRef<number>(keyboardYawOffset);

    useEffect(() => {
      if (prevDraggingRef.current && !isDragging) {
        // Kullanıcı bıraktıktan 2.5 sn sonra easeInOutCubic ile yeniden hızlanır
        resumeAllowedAtRef.current =
          performance.now() + HERO_TIMINGS.orbitResumeDelayMs;
      } else if (isDragging) {
        autoRotateSpeedRef.current = 0;
        rotationRampRef.current = {
          fromSpeed: 0,
          toSpeed: 0,
          elapsedSec: 0,
          durationSec: HERO_CAKE_CONFIG.autoRotateEaseOutDurationSec,
        };
      }
      prevDraggingRef.current = isDragging;
    }, [isDragging]);

    useEffect(() => {
      if (wobbleTrigger > 0 && !prefersReducedMotion) {
        wobbleRemainingRef.current = HERO_TIMINGS.jellyWobbleDurationSec;
      }
    }, [wobbleTrigger, prefersReducedMotion]);

    useEffect(() => {
      if (keyboardYawOffset !== prevKeyboardOffsetRef.current) {
        prevKeyboardOffsetRef.current = keyboardYawOffset;
        resumeAllowedAtRef.current =
          performance.now() + HERO_TIMINGS.orbitResumeDelayMs;
        autoRotateSpeedRef.current = 0;
        rotationRampRef.current = {
          fromSpeed: 0,
          toSpeed: 0,
          elapsedSec: 0,
          durationSec: HERO_CAKE_CONFIG.autoRotateEaseOutDurationSec,
        };
      }
    }, [keyboardYawOffset]);

    // 315° ana gövde açıları (45° dilim boşluğu çıkarılmış kapalı kama)
    const mainThetaStart =
      HERO_CAKE_CONFIG.sliceStartAngleRad +
      HERO_CAKE_CONFIG.sliceAngleRad +
      0.005;
    const mainThetaLength =
      Math.PI * 2 - HERO_CAKE_CONFIG.sliceAngleRad - 0.01;

    // Paylaşılan materyaller (yüksek ve düşük kalite dengeli, bellek sızıntısız dispose)
    const {
      spongeBumpMap,
      spongeMaterial,
      creamMaterial,
      porcelainMaterial,
      rimGoldMaterial,
      berryMaterial,
      leafMaterial,
      sprinkleMaterial,
    } = useMemo(() => {
      const bump = createSpongeBumpTexture();

      const sponge = new THREE.MeshStandardMaterial({
        color: HERO_COLORS.cakeSpongeCocoa,
        roughness: 0.88,
        metalness: 0.02,
        bumpMap: bump,
        bumpScale: 0.016,
      });

      const cream = new THREE.MeshStandardMaterial({
        color: HERO_COLORS.vanillaCream,
        roughness: 0.45,
        metalness: 0.0,
      });

      const porcelain = new THREE.MeshPhysicalMaterial({
        color: HERO_COLORS.porcelainStand,
        roughness: 0.16,
        metalness: 0.03,
        clearcoat: 0.85,
        clearcoatRoughness: 0.1,
      });

      const rimGold = new THREE.MeshStandardMaterial({
        color: HERO_COLORS.porcelainRimGold,
        roughness: 0.3,
        metalness: 0.72,
      });

      const berry = new THREE.MeshPhysicalMaterial({
        color: HERO_COLORS.berryRed,
        roughness: 0.28,
        metalness: 0.0,
        clearcoat: 0.65,
        clearcoatRoughness: 0.15,
      });

      const leaf = new THREE.MeshStandardMaterial({
        color: HERO_COLORS.mintLeaf,
        roughness: 0.55,
        metalness: 0.0,
      });

      const sprinkle = new THREE.MeshStandardMaterial({
        color: HERO_COLORS.caramel,
        roughness: 0.36,
        metalness: 0.12,
      });

      return {
        spongeBumpMap: bump,
        spongeMaterial: sponge,
        creamMaterial: cream,
        porcelainMaterial: porcelain,
        rimGoldMaterial: rimGold,
        berryMaterial: berry,
        leafMaterial: leaf,
        sprinkleMaterial: sprinkle,
      };
    }, []);

    useEffect(() => {
      return () => {
        spongeBumpMap.dispose();
        spongeMaterial.dispose();
        creamMaterial.dispose();
        porcelainMaterial.dispose();
        rimGoldMaterial.dispose();
        berryMaterial.dispose();
        leafMaterial.dispose();
        sprinkleMaterial.dispose();
      };
    }, [
      spongeBumpMap,
      spongeMaterial,
      creamMaterial,
      porcelainMaterial,
      rimGoldMaterial,
      berryMaterial,
      leafMaterial,
      sprinkleMaterial,
    ]);

    // Porselen pasta tablası (LatheGeometry + ince altın/karamel kenar halkası)
    const { standGeo, rimRingGeo } = useMemo(() => {
      const standProfile = [
        new THREE.Vector2(0.0, -0.44),
        new THREE.Vector2(0.66, -0.44),
        new THREE.Vector2(0.64, -0.40),
        new THREE.Vector2(0.40, -0.35),
        new THREE.Vector2(0.22, -0.26),
        new THREE.Vector2(0.20, -0.14),
        new THREE.Vector2(0.32, -0.06),
        new THREE.Vector2(1.48, -0.055),
        new THREE.Vector2(1.52, -0.018),
        new THREE.Vector2(1.49, 0.014),
        new THREE.Vector2(1.42, 0.002),
        new THREE.Vector2(0.0, 0.0),
      ];
      const lathe = new THREE.LatheGeometry(
        standProfile,
        tier === 'high' ? 44 : 26
      );
      lathe.computeVertexNormals();

      const rim = new THREE.TorusGeometry(
        1.505,
        0.015,
        8,
        tier === 'high' ? 48 : 28
      );
      rim.rotateX(Math.PI / 2);

      return { standGeo: lathe, rimRingGeo: rim };
    }, [tier]);

    // Ana gövde katman geometrileri + dekor geometrileri
    const {
      mainLayerGeometries,
      rosetteGeometry,
      berryGeometry,
      leafGeometry,
      sprinkleGeometry,
    } = useMemo(() => {
      const segs = tier === 'high' ? 28 : 16;
      const layers = CAKE_LAYER_STACK.map((layer) =>
        createCakeSectorGeometry(
          HERO_CAKE_CONFIG.cakeRadius + layer.radiusOffset,
          layer.height,
          mainThetaStart,
          mainThetaLength,
          segs,
          0
        )
      );

      const rosette = createRosetteGeometry(tier === 'high');
      const berry = new THREE.SphereGeometry(
        0.105,
        tier === 'high' ? 14 : 9,
        tier === 'high' ? 12 : 8
      );

      const leafShape = new THREE.Shape();
      leafShape.moveTo(0, 0);
      leafShape.quadraticCurveTo(0.036, 0.03, 0.0, 0.085);
      leafShape.quadraticCurveTo(-0.036, 0.03, 0, 0);
      const leaf = new THREE.ExtrudeGeometry(leafShape, {
        depth: 0.008,
        bevelEnabled: false,
        curveSegments: 4,
      });

      const sprinkle = new THREE.CapsuleGeometry(0.014, 0.045, 4, 6);

      return {
        mainLayerGeometries: layers,
        rosetteGeometry: rosette,
        berryGeometry: berry,
        leafGeometry: leaf,
        sprinkleGeometry: sprinkle,
      };
    }, [tier, mainThetaStart, mainThetaLength]);

    useEffect(() => {
      return () => {
        standGeo.dispose();
        rimRingGeo.dispose();
        mainLayerGeometries.forEach((g) => g.dispose());
        rosetteGeometry.dispose();
        berryGeometry.dispose();
        leafGeometry.dispose();
        sprinkleGeometry.dispose();
      };
    }, [
      standGeo,
      rimRingGeo,
      mainLayerGeometries,
      rosetteGeometry,
      berryGeometry,
      leafGeometry,
      sprinkleGeometry,
    ]);

    // Üst kenar boyunca ana pasta yayına düşen vanilya krema rozetleri (10 rozet + 1 dilimde = 11)
    const mainRosettes = useMemo(() => {
      const positions: [number, number, number][] = [];
      const total = HERO_CAKE_CONFIG.rosetteCount;
      const sliceStart = HERO_CAKE_CONFIG.sliceStartAngleRad;
      const sliceEnd = sliceStart + HERO_CAKE_CONFIG.sliceAngleRad;
      const r = HERO_CAKE_CONFIG.cakeRadius - 0.24;

      for (let i = 0; i < total; i++) {
        const theta = (i / total) * Math.PI * 2;
        const normTheta =
          ((theta % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const normStart =
          ((sliceStart % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const normEnd =
          ((sliceEnd % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

        const inSlice =
          normStart < normEnd
            ? normTheta >= normStart && normTheta <= normEnd
            : normTheta >= normStart || normTheta <= normEnd;

        if (!inSlice) {
          positions.push([r * Math.cos(theta), 0.945, r * Math.sin(theta)]);
        }
      }
      return positions;
    }, []);

    // Üstteki diğer 4 çilek/vişne (5. çilek CakeSlice içinde)
    const mainBerries = useMemo(() => {
      const items: { pos: [number, number, number]; rotY: number }[] = [];
      const angles = [1.85, 2.95, 4.15, 5.25];
      for (let i = 0; i < angles.length; i++) {
        const a = angles[i];
        const r = i % 2 === 0 ? 0.48 : 0.6;
        items.push({
          pos: [r * Math.cos(a), 1.02, r * Math.sin(a)],
          rotY: a * 1.3,
        });
      }
      return items;
    }, []);

    // Birkaç karamel serpme (fazla kalabalık etmeden 8 adet)
    const caramelSprinkles = useMemo(() => {
      const list: {
        pos: [number, number, number];
        rot: [number, number, number];
      }[] = [];
      const angles = [1.45, 2.35, 3.35, 3.85, 4.65, 5.05, 5.75, 0.05];
      for (let i = 0; i < angles.length; i++) {
        const a = angles[i];
        const r = 0.26 + (i % 3) * 0.14;
        list.push({
          pos: [r * Math.cos(a), 0.985, r * Math.sin(a)],
          rot: [Math.PI * 0.48, a + 0.5, 0.3],
        });
      }
      return list;
    }, []);

    const mainGlazeOptions = useMemo(
      () => ({
        radius: HERO_CAKE_CONFIG.cakeRadius,
        yBase: 0.94,
        yTop: 0.962,
        thetaStart: mainThetaStart,
        thetaLength: mainThetaLength,
        radialSegs: tier === 'high' ? 68 : 36,
        heightSegs: tier === 'high' ? 12 : 6,
      }),
      [tier, mainThetaStart, mainThetaLength]
    );

    const dripSources = useMemo(
      () =>
        getMainCakeDripDropSources(
          HERO_CAKE_CONFIG.cakeRadius + 0.022,
          0.924,
          mainThetaStart,
          mainThetaLength
        ),
      [mainThetaStart, mainThetaLength]
    );

    useFrame((_, delta) => {
      const turntable = turntableGroupRef.current;
      const bodyBounce = cakeBodyBounceRef.current;
      if (!turntable || !bodyBounce) return;
      if (isPaused && !prefersReducedMotion) return;

      const dt = Math.min(delta, 0.05);

      // 1) Giriş animasyonu: pasta küçük ve hafif yukarıdan tablaya zarifçe yerleşir
      if (!prefersReducedMotion && isEntered) {
        entranceElapsedRef.current = Math.min(
          HERO_TIMINGS.cakeDropInDurationSec,
          entranceElapsedRef.current + dt
        );
        const t =
          entranceElapsedRef.current / HERO_TIMINGS.cakeDropInDurationSec;
        // Hafif ease-out + minimal yerleşme sekmesi
        const easeOut = 1 - Math.pow(1 - t, 3);
        const microBounce =
          t < 1 ? Math.sin(t * Math.PI * 1.4) * (1 - t) * 0.05 : 0;

        bodyBounce.position.y = (1 - easeOut) * 0.55 + microBounce;
        const baseScale = 0.86 + easeOut * 0.14;

        // 2) Hover / dokunma jöle sallanması (~600 ms damped spring)
        if (wobbleRemainingRef.current > 0) {
          wobbleRemainingRef.current = Math.max(
            0,
            wobbleRemainingRef.current - dt
          );
          const progress =
            1 -
            wobbleRemainingRef.current / HERO_TIMINGS.jellyWobbleDurationSec;
          const decay = Math.exp(-progress * 5.2);
          const osc = Math.sin(progress * Math.PI * 4.5);
          const wobbleScale = 1 + osc * decay * 0.045;
          const wobbleY = 1 - osc * decay * 0.036;

          bodyBounce.scale.set(
            baseScale * wobbleScale,
            baseScale * wobbleY,
            baseScale * wobbleScale
          );
          bodyBounce.rotation.z = osc * decay * 0.035;
          bodyBounce.rotation.x = Math.cos(progress * Math.PI * 4) * decay * 0.02;
        } else {
          bodyBounce.scale.setScalar(baseScale);
          bodyBounce.rotation.set(0, 0, 0);
        }
      } else {
        bodyBounce.position.y = 0;
        bodyBounce.scale.setScalar(1);
        bodyBounce.rotation.set(0, 0, 0);
      }

      // 3) easeInOutCubic (1.5 sn) ivmeli sürekli dönüş (etkileşim yokken 0.60 rad/sn, dilim açıkken 0.22 rad/sn)
      if (!prefersReducedMotion && !isPaused) {
        const now = performance.now();
        const canAutoRotate =
          !isDragging && now >= resumeAllowedAtRef.current;
        const desiredCruiseSpeed = isSliceOpen
          ? HERO_CAKE_CONFIG.autoRotateSliceSpeedRad
          : HERO_CAKE_CONFIG.autoRotateSpeedRad;
        const targetSpeed = canAutoRotate ? desiredCruiseSpeed : 0;

        const ramp = rotationRampRef.current;
        if (Math.abs(ramp.toSpeed - targetSpeed) > 0.0001) {
          const nextDuration =
            targetSpeed === 0
              ? HERO_CAKE_CONFIG.autoRotateEaseOutDurationSec
              : autoRotateSpeedRef.current < 0.05
                ? HERO_CAKE_CONFIG.autoRotateEaseInDurationSec
                : HERO_CAKE_CONFIG.autoRotateSliceBlendSec;

          ramp.fromSpeed = autoRotateSpeedRef.current;
          ramp.toSpeed = targetSpeed;
          ramp.elapsedSec = 0;
          ramp.durationSec = nextDuration;
        }

        if (ramp.elapsedSec < ramp.durationSec) {
          ramp.elapsedSec = Math.min(ramp.durationSec, ramp.elapsedSec + dt);
          const progress = ramp.elapsedSec / ramp.durationSec;
          const eased = easeInOutCubic(progress);
          autoRotateSpeedRef.current = THREE.MathUtils.lerp(
            ramp.fromSpeed,
            ramp.toSpeed,
            eased
          );
        } else {
          autoRotateSpeedRef.current = ramp.toSpeed;
        }

        baseYawRef.current += autoRotateSpeedRef.current * dt;
        smoothedKeyboardYawRef.current = THREE.MathUtils.damp(
          smoothedKeyboardYawRef.current,
          keyboardYawOffset,
          8.5,
          dt
        );
      } else {
        autoRotateSpeedRef.current = 0;
        rotationRampRef.current.fromSpeed = 0;
        rotationRampRef.current.toSpeed = 0;
        rotationRampRef.current.elapsedSec = 0;
        smoothedKeyboardYawRef.current = keyboardYawOffset;
      }

      turntable.rotation.y =
        baseYawRef.current + smoothedKeyboardYawRef.current;
    });

    const handleCakeClick = (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      onToggleSlice();
    };

    return (
      <group
        ref={turntableGroupRef}
        name="cake-turntable-assembly"
        onPointerOver={(e) => {
          e.stopPropagation();
          onCakePointerOver();
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onCakePointerOut();
        }}
      >
        {/* Porselen Pasta Tablası + Altın/Karamel Kenar Halkası */}
        <group name="cake-stand">
          <mesh geometry={standGeo} material={porcelainMaterial} />
          <mesh
            position={[0, 0.008, 0]}
            geometry={rimRingGeo}
            material={rimGoldMaterial}
          />
        </group>

        {/* Zıplama & Jöle Sallanma Kapsayıcısı */}
        <group ref={cakeBodyBounceRef} name="cake-layers-and-toppings">
          {/* 315° Ana Katmanlı Gövde (3 Kakaolu Kek + 2 Vanilya Krema) */}
          {CAKE_LAYER_STACK.map((layer, idx) => (
            <mesh
              key={layer.id}
              position={[0, layer.yBottom, 0]}
              geometry={mainLayerGeometries[idx]}
              material={layer.kind === 'sponge' ? spongeMaterial : creamMaterial}
              onClick={handleCakeClick}
            />
          ))}

          {/* Çikolata Glazür + Damla Dilleri */}
          <ChocolateGlaze
            geometryOptions={mainGlazeOptions}
            tier={tier}
            prefersReducedMotion={prefersReducedMotion}
            isPaused={isPaused}
            onClick={handleCakeClick}
          />

          {/* Vanilya Krema Rozetleri */}
          {mainRosettes.map((pos, idx) => (
            <mesh
              key={`rosette-${idx}`}
              position={pos}
              geometry={rosetteGeometry}
              material={creamMaterial}
              onClick={handleCakeClick}
            />
          ))}

          {/* Çilek / Vişne Süslemeleri */}
          {mainBerries.map((item, idx) => (
            <group
              key={`berry-${idx}`}
              position={item.pos}
              rotation={[0, item.rotY, 0]}
              onClick={handleCakeClick}
            >
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
          ))}

          {/* Karamel Serpmeler */}
          {caramelSprinkles.map((item, idx) => (
            <mesh
              key={`sprinkle-${idx}`}
              position={item.pos}
              rotation={item.rot}
              geometry={sprinkleGeometry}
              material={sprinkleMaterial}
              onClick={handleCakeClick}
            />
          ))}

          {/* Ayrılabilir 45° Dilim */}
          <CakeSlice
            isOpen={isSliceOpen}
            tier={tier}
            prefersReducedMotion={prefersReducedMotion}
            isPaused={isPaused}
            spongeMaterial={spongeMaterial}
            creamMaterial={creamMaterial}
            rosetteGeometry={rosetteGeometry}
            berryGeometry={berryGeometry}
            berryMaterial={berryMaterial}
            leafGeometry={leafGeometry}
            leafMaterial={leafMaterial}
            onToggleSlice={onToggleSlice}
          />

          {/* Glazür uçlarından tablaya düşen damlalar (InstancedMesh) */}
          <CakeDrops
            dripSources={dripSources}
            standTopY={HERO_CAKE_CONFIG.standTopY}
            tier={tier}
            isPaused={isPaused}
            prefersReducedMotion={prefersReducedMotion}
          />
        </group>
      </group>
    );
  }
);
CakeModel.displayName = 'CakeModel';
