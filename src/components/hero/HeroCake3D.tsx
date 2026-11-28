import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei/core/ContactShadows';
import { Environment } from '@react-three/drei/core/Environment';
import { Lightformer } from '@react-three/drei/core/Lightformer';
import { OrbitControls } from '@react-three/drei/core/OrbitControls';
import { Icon } from '../ui/IconRegistry';
import {
  HERO_CAKE_CONFIG,
  HERO_COLORS,
  QualityTier,
} from './heroConstants';
import { useDripClock } from './useDripClock';
import { CakeModel } from './CakeModel';

export interface HeroCake3DProps {
  tier: QualityTier;
  isMobile: boolean;
  isSoftwareGl: boolean;
  prefersReducedMotion: boolean;
  isVisible: boolean;
  isTabHidden: boolean;
  branchName: string;
  openStatus: { isOpen: boolean; label: string } | null;
  onWebglContextLost?: () => void;
}

/**
 * Üst taç etrafında çok az sayıda (<=12) hafifçe süzülen pudra şekeri parçacığı
 */
const PowderedSugarMotes: React.FC<{ isPaused: boolean }> = React.memo(
  ({ isPaused }) => {
    const pointsRef = useRef<THREE.Points>(null);
    const simTimeRef = useRef<number>(0);
    const count = HERO_CAKE_CONFIG.sugarParticleCount;

    const { geometry, material, basePositions, phases } = useMemo(() => {
      const geo = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      const base = new Float32Array(count * 3);
      const ph = new Float32Array(count);

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + 0.3;
        const r = 0.65 + (i % 3) * 0.42;
        const x = Math.cos(angle) * r;
        const y = 0.4 + (i % 4) * 0.34;
        const z = Math.sin(angle) * r;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        base[i * 3] = x;
        base[i * 3 + 1] = y;
        base[i * 3 + 2] = z;
        ph[i] = i * 1.37;
      }

      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const mat = new THREE.PointsMaterial({
        color: HERO_COLORS.powderSugar,
        size: 0.032,
        transparent: true,
        opacity: 0.38,
        depthWrite: false,
        sizeAttenuation: true,
      });

      return { geometry: geo, material: mat, basePositions: base, phases: ph };
    }, [count]);

    useEffect(() => {
      return () => {
        geometry.dispose();
        material.dispose();
      };
    }, [geometry, material]);

    useFrame((_, delta) => {
      if (isPaused || !pointsRef.current) return;
      simTimeRef.current += Math.min(delta, 0.05);
      const t = simTimeRef.current;
      const attr = geometry.getAttribute('position') as THREE.BufferAttribute;

      for (let i = 0; i < count; i++) {
        const p = phases[i];
        const bx = basePositions[i * 3];
        const by = basePositions[i * 3 + 1];
        const bz = basePositions[i * 3 + 2];

        attr.setXYZ(
          i,
          bx + Math.sin(t * 0.45 + p) * 0.06,
          by + ((t * 0.09 + p * 0.15) % 0.65) - 0.15,
          bz + Math.cos(t * 0.38 + p) * 0.06
        );
      }
      attr.needsUpdate = true;
    });

    return (
      <points
        ref={pointsRef}
        geometry={geometry}
        material={material}
        frustumCulled={false}
      />
    );
  }
);
PowderedSugarMotes.displayName = 'PowderedSugarMotes';

/**
 * Mobilde / düşük kalitede gerçek zamanlı gölge olmadan taban yumuşak gölgesi
 */
const StaticGroundShadow: React.FC = React.memo(() => {
  const texture = useMemo(() => {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(
        size / 2,
        size / 2,
        8,
        size / 2,
        size / 2,
        size / 2
      );
      grad.addColorStop(0, 'rgba(59, 35, 20, 0.24)');
      grad.addColorStop(0.55, 'rgba(59, 35, 20, 0.09)');
      grad.addColorStop(1, 'rgba(59, 35, 20, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  useEffect(() => {
    return () => {
      texture.dispose();
    };
  }, [texture]);

  return (
    <mesh
      position={[0, -0.445, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      renderOrder={-1}
    >
      <planeGeometry args={[3.1, 3.1]} />
      <meshBasicMaterial
        map={texture}
        transparent
        depthWrite={false}
        opacity={0.95}
      />
    </mesh>
  );
});
StaticGroundShadow.displayName = 'StaticGroundShadow';

/**
 * reduced-motion ('demand' frameloop) modunda state değişikliklerinde tek kare render tetikler
 */
const DemandInvalidateBridge: React.FC<{
  isRenderingActive: boolean;
  isSliceOpen: boolean;
  keyboardYawOffset: number;
}> = ({ isRenderingActive, isSliceOpen, keyboardYawOffset }) => {
  const { invalidate } = useThree();
  useEffect(() => {
    if (isRenderingActive) {
      invalidate();
    }
  }, [isRenderingActive, isSliceOpen, keyboardYawOffset, invalidate]);
  return null;
};

interface SceneControlsProps {
  isSoftwareGl: boolean;
  isRenderingActive: boolean;
  onStartDrag: () => void;
  onEndDrag: () => void;
}

const SceneOrbitControls: React.FC<SceneControlsProps> = React.memo(
  ({ isSoftwareGl, isRenderingActive, onStartDrag, onEndDrag }) => {
    const controlsRef = useRef<React.ComponentRef<typeof OrbitControls>>(null);
    const { invalidate } = useThree();

    useEffect(() => {
      const ctrl = controlsRef.current;
      if (!ctrl?.domElement) return;
      // Mobilde sayfa dikey kaydırmasının ASLA kilitlenmemesi için pan-y uygula
      ctrl.domElement.style.touchAction = 'pan-y';
    }, []);

    return (
      <OrbitControls
        ref={controlsRef}
        enabled={isRenderingActive}
        enableZoom={false}
        enablePan={false}
        enableDamping={!isSoftwareGl && isRenderingActive}
        dampingFactor={0.07}
        rotateSpeed={0.75}
        minPolarAngle={HERO_CAKE_CONFIG.minPolarAngleRad}
        maxPolarAngle={HERO_CAKE_CONFIG.maxPolarAngleRad}
        target={[
          HERO_CAKE_CONFIG.cameraTarget[0],
          HERO_CAKE_CONFIG.cameraTarget[1],
          HERO_CAKE_CONFIG.cameraTarget[2],
        ]}
        onStart={onStartDrag}
        onEnd={onEndDrag}
        onChange={() => {
          if (isRenderingActive) {
            invalidate();
          }
        }}
      />
    );
  }
);
SceneOrbitControls.displayName = 'SceneOrbitControls';

const HeroCake3D: React.FC<HeroCake3DProps> = ({
  tier,
  isMobile,
  isSoftwareGl,
  prefersReducedMotion,
  isVisible,
  isTabHidden,
  branchName,
  openStatus,
  onWebglContextLost,
}) => {
  const stageContainerRef = useRef<HTMLDivElement>(null);
  const [isInHeroViewport, setIsInHeroViewport] = useState<boolean>(true);
  const [isSliceOpen, setIsSliceOpen] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isHoveringCake, setIsHoveringCake] = useState<boolean>(false);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const [wobbleTrigger, setWobbleTrigger] = useState<number>(0);
  const [keyboardYawOffset, setKeyboardYawOffset] = useState<number>(0);
  const [liveStatus, setLiveStatus] = useState<string>('');

  const pointerDownPosRef = useRef<{ x: number; y: number } | null>(null);
  const wasDraggedRef = useRef<boolean>(false);

  // Sahnenin kendi IntersectionObserver takibi: kullanıcı Hero dışına kaydırınca GPU döngüsünü tamamen durdur
  useEffect(() => {
    const targetEl = stageContainerRef.current;
    if (!targetEl || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (let i = 0; i < entries.length; i++) {
          setIsInHeroViewport(entries[i].isIntersecting);
        }
      },
      { threshold: 0.02, rootMargin: '40px 0px' }
    );

    observer.observe(targetEl);
    return () => observer.disconnect();
  }, []);

  const isRenderingActive = isVisible && isInHeroViewport && !isTabHidden;
  const isPaused = !isRenderingActive || prefersReducedMotion;

  // Başlık ile ortak zamanlayıcı bağlantısı
  useDripClock({ isPaused });

  const markInteracted = useCallback(() => {
    setHasInteracted(true);
  }, []);

  const toggleSlice = useCallback(() => {
    if (wasDraggedRef.current) return;
    markInteracted();
    setIsSliceOpen((prev) => {
      const next = !prev;
      setLiveStatus(
        next
          ? 'Pastadan bir dilim ayrıldı. Kakaolu kek ve vanilya krema katmanları görünüyor.'
          : 'Pasta dilimi tekrar yerine yerleştirildi.'
      );
      return next;
    });
  }, [markInteracted]);

  const closeSlice = useCallback(() => {
    setIsSliceOpen((prev) => {
      if (!prev) return false;
      setLiveStatus('Pasta dilimi tekrar yerine yerleştirildi.');
      return false;
    });
  }, []);

  const handleOrbitStart = useCallback(() => {
    setIsDragging(true);
    wasDraggedRef.current = false;
    markInteracted();
  }, [markInteracted]);

  const handleOrbitEnd = useCallback(() => {
    setIsDragging(false);
    window.setTimeout(() => {
      wasDraggedRef.current = false;
    }, 60);
  }, []);

  const handlePointerDownStage = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      pointerDownPosRef.current = { x: e.clientX, y: e.clientY };
      wasDraggedRef.current = false;
      if (e.pointerType === 'touch' && !prefersReducedMotion) {
        setWobbleTrigger((v) => v + 1);
      }
    },
    [prefersReducedMotion]
  );

  const handlePointerMoveStage = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const down = pointerDownPosRef.current;
      if (!down) return;
      const dx = e.clientX - down.x;
      const dy = e.clientY - down.y;
      if (dx * dx + dy * dy > 36) {
        wasDraggedRef.current = true;
      }
    },
    []
  );

  const handleKeyDownStage = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        markInteracted();
        setKeyboardYawOffset((v) => v - 0.32);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        markInteracted();
        setKeyboardYawOffset((v) => v + 0.32);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        wasDraggedRef.current = false;
        toggleSlice();
      } else if (e.key === 'Escape') {
        if (isSliceOpen) {
          e.preventDefault();
          closeSlice();
        }
      }
    },
    [isSliceOpen, markInteracted, toggleSlice, closeSlice]
  );

  const handleNavigateToFreshCakes = useCallback(() => {
    window.dispatchEvent(
      new CustomEvent('select-catalog-category', { detail: 'yas-pasta' })
    );
    const catalogEl = document.getElementById('lezzetlerimiz');
    if (catalogEl) {
      catalogEl.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    }
  }, [prefersReducedMotion]);

  const handleCakePointerOver = useCallback(() => {
    setIsHoveringCake(true);
    if (!prefersReducedMotion) {
      setWobbleTrigger((v) => v + 1);
    }
  }, [prefersReducedMotion]);

  const handleCakePointerOut = useCallback(() => {
    setIsHoveringCake(false);
  }, []);

  const frameloopMode: 'always' | 'demand' | 'never' = !isRenderingActive
    ? 'never'
    : prefersReducedMotion
      ? 'demand'
      : 'always';

  const useRealtimeShadows = tier === 'high' && !isMobile && !isSoftwareGl;

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* 3D Sahne Alanı: Sabit aspect/yükseklik ile sıfır CLS */}
      <div
        ref={stageContainerRef}
        role="img"
        tabIndex={0}
        aria-label="Çikolata akışlı katmanlı yaş pasta. Sürükleyerek çevirebilirsiniz."
        onKeyDown={handleKeyDownStage}
        onPointerDown={handlePointerDownStage}
        onPointerMove={handlePointerMoveStage}
        style={{ touchAction: 'pan-y' }}
        className={`relative w-full h-[290px] sm:h-[320px] lg:h-[min(70vh,560px)] rounded-[24px] overflow-hidden select-none focus-visible:outline-3 focus-visible:outline-[#4F6A1A] focus-visible:outline-offset-2 ${
          isDragging
            ? 'cursor-grabbing'
            : isHoveringCake
              ? 'cursor-pointer'
              : 'cursor-grab'
        }`}
      >
        {/* Yumuşak vanilya arka plan parıltısı (şeffaf canvas arkasında #FAF7F0 zemin üzerinde) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 48%, rgba(243, 223, 181, 0.56) 0%, rgba(243, 223, 181, 0.18) 46%, rgba(250, 247, 240, 0) 76%)',
          }}
        />

        <Canvas
          dpr={[1, HERO_CAKE_CONFIG.qualityThresholds.maxDpr]}
          frameloop={frameloopMode}
          shadows={false}
          style={{ touchAction: 'pan-y', background: 'transparent' }}
          gl={{
            alpha: true,
            antialias: tier === 'high' && !isSoftwareGl,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.08,
          }}
          camera={{
            fov: HERO_CAKE_CONFIG.cameraFovDeg,
            position: [
              HERO_CAKE_CONFIG.cameraPosition[0],
              HERO_CAKE_CONFIG.cameraPosition[1],
              HERO_CAKE_CONFIG.cameraPosition[2],
            ],
            near: 0.1,
            far: 40,
          }}
          onPointerMissed={() => {
            if (!wasDraggedRef.current && isSliceOpen) {
              closeSlice();
            }
          }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
            gl.domElement.style.touchAction = 'pan-y';
            gl.domElement.addEventListener(
              'webglcontextlost',
              (ev) => {
                ev.preventDefault();
                onWebglContextLost?.();
              },
              false
            );
          }}
        >
          <DemandInvalidateBridge
            isRenderingActive={isRenderingActive}
            isSliceOpen={isSliceOpen}
            keyboardYawOffset={keyboardYawOffset}
          />

          {/* Sıcak Hemisphere + Ana Yönlü Işık (harici HDR yok) */}
          <hemisphereLight args={['#FFFDF9', '#C98A3E', 0.92]} />
          <directionalLight
            position={[3.6, 5.4, 4.2]}
            intensity={1.75}
            color="#FFF6E8"
          />
          <directionalLight
            position={[-3.4, 3.0, -3.5]}
            intensity={0.62}
            color="#F3DFB5"
          />

          {/* Yerel Prosedürel Lightformer Stüdyo Yansımaları */}
          <Environment resolution={tier === 'high' ? 128 : 64}>
            <Lightformer
              form="rect"
              intensity={2.4}
              color="#FFFDF9"
              position={[0, 5, 2]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={[8, 4, 1]}
            />
            <Lightformer
              form="rect"
              intensity={1.6}
              color="#F3DFB5"
              position={[-4, 2.2, 3]}
              rotation={[0, Math.PI / 3, 0]}
              scale={[4, 4, 1]}
            />
            <Lightformer
              form="rect"
              intensity={1.4}
              color="#FFE8C2"
              position={[4.5, 2.5, -2]}
              rotation={[0, -Math.PI / 2.2, 0]}
              scale={[4, 4, 1]}
            />
          </Environment>

          <SceneOrbitControls
            isSoftwareGl={isSoftwareGl}
            isRenderingActive={isRenderingActive}
            onStartDrag={handleOrbitStart}
            onEndDrag={handleOrbitEnd}
          />

          <group position={[0, -0.18, 0]} visible={isRenderingActive}>
            <CakeModel
              tier={tier}
              isSliceOpen={isSliceOpen}
              isDragging={isDragging}
              isPaused={isPaused}
              prefersReducedMotion={prefersReducedMotion}
              isEntered
              wobbleTrigger={wobbleTrigger}
              keyboardYawOffset={keyboardYawOffset}
              onToggleSlice={toggleSlice}
              onCakePointerOver={handleCakePointerOver}
              onCakePointerOut={handleCakePointerOut}
            />

            {useRealtimeShadows ? (
              <ContactShadows
                position={[0, -0.45, 0]}
                opacity={0.34}
                scale={5.4}
                blur={2.4}
                far={2.4}
                resolution={256}
                frames={
                  isRenderingActive
                    ? prefersReducedMotion
                      ? 1
                      : Infinity
                    : 0
                }
                color="#3B2314"
              />
            ) : (
              <StaticGroundShadow />
            )}

            {tier === 'high' && !prefersReducedMotion && isRenderingActive && (
              <PowderedSugarMotes isPaused={!isRenderingActive} />
            )}
          </group>
        </Canvas>

        {/* İlk Ziyaret İpucu ("Sürükle ve çevir") - ilk etkileşimden sonra solarak kaybolur */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute top-3.5 left-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFDF9]/85 border border-[#3E2723]/10 text-[#5D4037] text-xs font-medium shadow-xs transition-opacity duration-500 ${
            hasInteracted ? 'opacity-0' : 'opacity-85'
          }`}
        >
          <Icon name="hand" size={16} className="text-[#7A4A2B]" />
          <span>Sürükle ve çevir</span>
        </div>

        {/* Dilim açıkken beliren ikincil köprü butonu: "Yaş Pastalarımız" */}
        <div
          className={`absolute top-3.5 right-3.5 transition-all duration-300 ${
            isSliceOpen
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 -translate-y-1 pointer-events-none'
          }`}
        >
          <button
            type="button"
            tabIndex={isSliceOpen ? 0 : -1}
            onClick={handleNavigateToFreshCakes}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFFDF9]/95 text-[#3E2723] border border-[#3E2723]/18 text-xs font-semibold shadow-warm hover:bg-[#F3ECE1] active:scale-[0.96] transition-all cursor-pointer"
          >
            <Icon name="yas-pasta" size={16} variant="duotone" className="text-[#3B2314]" />
            <span>Yaş Pastalarımız</span>
            <Icon name="arrow-down-right" size={16} className="text-[#4F6A1A]" />
          </button>
        </div>

        {/* Şube Rozeti (onaylanan tasarım kararına göre sağ kolon sahne köşesinde korunur) */}
        <div className="pointer-events-none absolute bottom-3 left-3 sm:bottom-4 sm:left-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFDF9]/92 border border-[#3E2723]/10 text-[#3E2723] text-xs font-semibold shadow-warm">
          <Icon name="pin-kiraz" size={16} variant="duotone" className="text-[#3B2314]" />
          <span>{branchName}</span>
          {openStatus && (
            <>
              <span aria-hidden="true" className="text-[#5D4037]/50">
                ·
              </span>
              <span
                className={
                  openStatus.isOpen
                    ? 'text-[#4F6A1A] font-bold'
                    : 'text-[#B23A48] font-bold'
                }
              >
                {openStatus.label}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Canvas altında sade metin + ince çerçeveli erişilebilir "Dilim al" butonu */}
      <div className="mt-2.5 flex items-center justify-center">
        <button
          type="button"
          onClick={() => {
            wasDraggedRef.current = false;
            toggleSlice();
          }}
          aria-pressed={isSliceOpen}
          className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full border border-[#3E2723]/22 bg-transparent text-[#3E2723] text-xs sm:text-sm font-medium hover:bg-[#F3ECE1]/70 hover:border-[#3E2723]/35 active:scale-95 transition-all cursor-pointer"
        >
          <span>{isSliceOpen ? 'Dilimi yerine koy' : 'Dilim al'}</span>
        </button>
      </div>

      {/* Ekran okuyucu için canlı durum bildirimi */}
      <span className="sr-only" aria-live="polite">
        {liveStatus}
      </span>
    </div>
  );
};

export default HeroCake3D;
