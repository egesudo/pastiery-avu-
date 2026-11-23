import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { motion } from 'motion/react';
import { siteConfig } from '../config/site';
import { SplashIconSprite } from './splash/icons';
import {
  generateTopCurtainPath,
  generateTopCurtainDroplets,
  generateLetterFillDripPath,
  generateHangingCreamDrips,
  generateRainParticles,
  CreamDripSpec,
} from './splash/drips';
import styles from './splash.module.css';

export type SplashPhase = 'idle' | 'playing' | 'exiting' | 'fast-exiting' | 'done';

export interface SplashProps {
  /** Splash tamamlandığında çağrılır */
  onFinish?: () => void;
  /** /splash-preview sayfasında durum izlemek için opsiyonel callback */
  onPhaseChange?: (phase: SplashPhase, elapsedMs: number) => void;
  /** Masaüstü tatlı yağmuru parçacık sayısı (varsayılan: 38) */
  particleCount?: number;
  /** Mobil (<640px) tatlı yağmuru parçacık sayısı (varsayılan: 22) */
  mobileParticleCount?: number;
  /** Önizleme modunda veya zorla oynatmada kullanılır */
  forcePlay?: boolean;
  /** Splash açıkken inert yapılacak ana uygulama kapsayıcısının DOM ID'si (varsayılan: "app-main-shell") */
  mainContainerId?: string;
}

const CHOCOLATE_FLOW_EASE: [number, number, number, number] = [0.45, 0.05, 0.2, 1];
const CURTAIN_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const EXIT_EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

/**
 * siteConfig.splashTitle metnini masaüstü (2 satır) ve mobil (<640px, 3 satır) için böler.
 */
function splitSplashTitle(title: string): {
  desktopLines: [string, string];
  mobileLines: [string, string, string];
} {
  const words = title.trim().split(/\s+/);
  if (words.length >= 4) {
    return {
      desktopLines: [words.slice(0, 2).join(' '), words.slice(2).join(' ')],
      mobileLines: [words[0], words[1], words.slice(2).join(' ')],
    };
  }
  return {
    desktopLines: ['Çavuşoğulları Pastahanesine', 'Hoş Geldiniz'],
    mobileLines: ['Çavuşoğulları', 'Pastahanesine', 'Hoş Geldiniz'],
  };
}

/**
 * 1.80–2.75 sn: Satır altlarından sarkan dolgun vanilya krema (#FFFBEF) ve kakao (#5D4037)
 * damlalarını ve ucundan kopup yer çekimiyle (easeIn) düşen damlacıkları çizer.
 */
const HangingCreamDripsGroup: React.FC<{ drips: CreamDripSpec[] }> = ({ drips }) => (
  <g aria-hidden="true">
    {drips.map((drip) => {
      const r = drip.width / 2;
      const topY = drip.y;
      const bottomY = drip.y + drip.length;
      const isCocoa = drip.flavor === 'cocoa';
      const fillColor = isCocoa ? '#5D4037' : '#FFFBEF';
      const strokeColor = isCocoa ? '#3E2723' : '#E3CFA3';

      const pathD = `M ${(drip.x - r).toFixed(1)} ${topY.toFixed(1)} L ${(
        drip.x -
        r * 0.84
      ).toFixed(1)} ${(bottomY - r).toFixed(1)} A ${r.toFixed(1)} ${r.toFixed(
        1
      )} 0 0 0 ${(drip.x + r * 0.84).toFixed(1)} ${(bottomY - r).toFixed(1)} L ${(
        drip.x + r
      ).toFixed(1)} ${topY.toFixed(1)} Z`;

      return (
        <React.Fragment key={drip.id}>
          <motion.g
            className={styles.svgTransformTop}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{
              duration: 0.55,
              delay: drip.delay,
              ease: CURTAIN_EASE,
            }}
          >
            <path
              d={pathD}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="1.9"
            />
            {/* Belirgin damla parlaklık çizgisi ve noktası */}
            <path
              d={`M ${(drip.x - r * 0.34).toFixed(1)} ${(topY + 4).toFixed(1)} L ${(
                drip.x -
                r * 0.34
              ).toFixed(1)} ${(bottomY - r * 1.35).toFixed(1)}`}
              stroke="rgba(255,255,255,0.65)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle
              cx={drip.x - r * 0.25}
              cy={bottomY - r * 0.85}
              r={Math.max(1.4, r * 0.28)}
              fill="rgba(255,255,255,0.72)"
            />
          </motion.g>
          {drip.detaches && (
            <motion.ellipse
              cx={drip.x}
              cy={bottomY + r * 1.4}
              rx={r * 0.88}
              ry={r * 1.12}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="1.7"
              className={styles.svgTransformCenter}
              initial={{ opacity: 0, y: -4, scale: 0.78 }}
              animate={{
                opacity: [0, 1, 0.95, 0],
                y: [-4, 2, 34, 62],
                scale: [0.78, 1.04, 0.95, 0.82],
              }}
              transition={{
                duration: 0.75,
                delay: drip.detachDelay,
                times: [0, 0.16, 0.7, 1],
                ease: 'easeIn',
              }}
            />
          )}
        </React.Fragment>
      );
    })}
  </g>
);

export const Splash: React.FC<SplashProps> = ({
  onFinish,
  onPhaseChange,
  particleCount = 38,
  mobileParticleCount = 22,
  mainContainerId = 'app-main-shell',
}) => {
  const [phase, setPhase] = useState<SplashPhase>('idle');
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  const dialogRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const exitStartRef = useRef<number | null>(null);
  const phaseRef = useRef<SplashPhase>('idle');

  // Üst bileşen re-render olduğunda zaman çizelgesinin sıfırlanmasını önlemek için callback ref'leri
  const onFinishRef = useRef(onFinish);
  const onPhaseChangeRef = useRef(onPhaseChange);
  onFinishRef.current = onFinish;
  onPhaseChangeRef.current = onPhaseChange;

  const title = siteConfig.splashTitle;
  const { desktopLines, mobileLines } = useMemo(() => splitSplashTitle(title), [title]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Splash açıkken ana uygulama kapsayıcısına inert uygula, kapanınca temizle
  useEffect(() => {
    const isActive = phase !== 'done';
    const mainEl = document.getElementById(mainContainerId);

    if (isActive) {
      mainEl?.setAttribute('inert', '');
      mainEl?.setAttribute('aria-hidden', 'true');
    } else {
      mainEl?.removeAttribute('inert');
      mainEl?.removeAttribute('aria-hidden');
    }

    return () => {
      mainEl?.removeAttribute('inert');
      mainEl?.removeAttribute('aria-hidden');
    };
  }, [phase, mainContainerId]);

  // Deterministik SVG yolları ve particleCount kontrollü tatlı yağmuru parçacıkları
  const topChocolateCurtainPath = useMemo(
    () => generateTopCurtainPath(1440, 56, 18, 60, 104729),
    []
  );
  const topCocoaCurtainPath = useMemo(
    () => generateTopCurtainPath(1440, 62, 18, 66, 154883),
    []
  );
  const topCreamCurtainPath = useMemo(
    () => generateTopCurtainPath(1440, 72, 18, 76, 209451),
    []
  );
  const topCurtainDroplets = useMemo(
    () => generateTopCurtainDroplets(1440, 18, 771205),
    []
  );

  const allRainParticles = useMemo(
    () => generateRainParticles(884219, particleCount, mobileParticleCount),
    [particleCount, mobileParticleCount]
  );
  const visibleParticles = useMemo(
    () => (isMobile ? allRainParticles.filter((p) => p.mobileVisible) : allRainParticles),
    [allRainParticles, isMobile]
  );

  // Masaüstü (2 satır) çikolata dolgu dalga path'leri ve dolgun vanilya/kakao damlaları
  const desktopDarkWave0 = useMemo(
    () => generateLetterFillDripPath(980, 130, 20, 70, 301101),
    []
  );
  const desktopMilkWave0 = useMemo(
    () => generateLetterFillDripPath(980, 130, 20, 62, 301102),
    []
  );
  const desktopDarkWave1 = useMemo(
    () => generateLetterFillDripPath(980, 130, 20, 70, 302201),
    []
  );
  const desktopMilkWave1 = useMemo(
    () => generateLetterFillDripPath(980, 130, 20, 62, 302202),
    []
  );

  const desktopDripsLine0 = useMemo(
    () => generateHangingCreamDrips(110, 870, 94, 12, 5, 401001, 1.8),
    []
  );
  const desktopDripsLine1 = useMemo(
    () => generateHangingCreamDrips(285, 695, 200, 11, 4, 401002, 1.94),
    []
  );

  // Mobil (<640px, 3 satır) çikolata dolgu dalga path'leri ve dolgun vanilya/kakao damlaları
  const mobileDarkWave0 = useMemo(
    () => generateLetterFillDripPath(600, 105, 14, 56, 501101),
    []
  );
  const mobileMilkWave0 = useMemo(
    () => generateLetterFillDripPath(600, 105, 14, 48, 501102),
    []
  );
  const mobileDarkWave1 = useMemo(
    () => generateLetterFillDripPath(600, 105, 14, 56, 502201),
    []
  );
  const mobileMilkWave1 = useMemo(
    () => generateLetterFillDripPath(600, 105, 14, 48, 502202),
    []
  );
  const mobileDarkWave2 = useMemo(
    () => generateLetterFillDripPath(600, 105, 14, 56, 503301),
    []
  );
  const mobileMilkWave2 = useMemo(
    () => generateLetterFillDripPath(600, 105, 14, 48, 503302),
    []
  );

  const mobileDripsLine0 = useMemo(
    () => generateHangingCreamDrips(100, 500, 76, 9, 3, 601001, 1.8),
    []
  );
  const mobileDripsLine1 = useMemo(
    () => generateHangingCreamDrips(95, 505, 164, 9, 3, 601002, 1.9),
    []
  );
  const mobileDripsLine2 = useMemo(
    () => generateHangingCreamDrips(130, 470, 252, 9, 3, 601003, 1.98),
    []
  );

  const updatePhase = useCallback((next: SplashPhase, elapsed = 0) => {
    phaseRef.current = next;
    setPhase(next);
    onPhaseChangeRef.current?.(next, elapsed);
  }, []);

  const completeSplash = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const mainEl = document.getElementById(mainContainerId);
    mainEl?.removeAttribute('inert');
    mainEl?.removeAttribute('aria-hidden');

    updatePhase('done', 3600);
    onFinishRef.current?.();

    // Çıkışta odağı sayfanın ana H1 başlığına görünmez biçimde döndür
    window.setTimeout(() => {
      const h1 =
        document.getElementById('main-hero-heading') ||
        document.querySelector<HTMLElement>('main h1');
      if (h1) {
        if (!h1.hasAttribute('tabindex')) {
          h1.setAttribute('tabindex', '-1');
        }
        h1.focus({ preventScroll: true });
      }
    }, 10);
  }, [mainContainerId, updatePhase]);

  // Klavye/erişilebilirlik için hızlı çıkış
  const triggerFastSkip = useCallback(() => {
    if (phaseRef.current === 'done' || phaseRef.current === 'fast-exiting') {
      return;
    }
    exitStartRef.current = performance.now();
    updatePhase('fast-exiting', 3200);
  }, [updatePhase]);

  // Font yüklenmesini kontrol et (hazırsa 0 ms'de başlat, değilse en fazla 250 ms bekle)
  // ?splash=off olmadığı sürece girişte daima otomatik açılır.
  useEffect(() => {
    let cancelled = false;

    async function waitForSplashFont() {
      if (
        typeof document === 'undefined' ||
        !('fonts' in document) ||
        document.fonts.check('700 48px "Fredoka"')
      ) {
        if (!cancelled) {
          startTimeRef.current = performance.now();
          updatePhase('playing', 0);
        }
        return;
      }

      const timeoutPromise = new Promise<'timeout'>((resolve) => {
        window.setTimeout(() => {
          resolve('timeout');
        }, 250);
      });

      const fontLoadPromise = (async () => {
        try {
          await Promise.race([
            document.fonts.load('700 48px "Fredoka"'),
            document.fonts.ready,
          ]);
          return 'ready' as const;
        } catch {
          return 'fallback' as const;
        }
      })();

      await Promise.race([fontLoadPromise, timeoutPromise]);
      if (cancelled) return;

      startTimeRef.current = performance.now();
      updatePhase('playing', 0);
    }

    waitForSplashFont();

    return () => {
      cancelled = true;
    };
  }, [updatePhase]);

  const isTimelineRunning =
    phase === 'playing' || phase === 'exiting' || phase === 'fast-exiting';

  // Tek Ana Zaman Çizgisi / Durum Makinesi (idle -> playing -> exiting -> done)
  // isTimelineRunning boolean'ı sayesinde playing -> exiting geçişinde RAF döngüsü sıfırlanmaz.
  useEffect(() => {
    if (!isTimelineRunning) return;

    dialogRef.current?.focus({ preventScroll: true });

    const tick = (now: number) => {
      if (phaseRef.current === 'fast-exiting') {
        const fastElapsed = now - (exitStartRef.current ?? now);
        if (fastElapsed >= 250) {
          completeSplash();
          return;
        }
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const start = startTimeRef.current ?? now;
      const elapsed = now - start;

      if (elapsed >= 3600) {
        completeSplash();
        return;
      }

      if (elapsed >= 3200 && phaseRef.current === 'playing') {
        updatePhase('exiting', elapsed);
      } else if (onPhaseChangeRef.current && phaseRef.current === 'playing') {
        onPhaseChangeRef.current('playing', elapsed);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isTimelineRunning, completeSplash, updatePhase]);

  // Klavye kısayolları: Esc, Enter veya Space ile erişilebilir geçiş
  useEffect(() => {
    if (!isTimelineRunning) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerFastSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTimelineRunning, triggerFastSkip]);

  if (phase === 'done') {
    return null;
  }

  // Font hazır olana kadar (<=250ms) sıcak vanilya zemin üzerinde beklet (ana sayfa flaşını önler)
  if (phase === 'idle') {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Karşılama animasyonu"
        className={styles.splashRoot}
      >
        <span className="sr-only">{title}</span>
      </div>
    );
  }

  const isExiting = phase === 'exiting' || phase === 'fast-exiting';
  const exitDuration = phase === 'fast-exiting' ? 0.25 : 0.42;

  return (
    <motion.div
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="Karşılama animasyonu"
      initial={{ opacity: 1, y: '0%' }}
      animate={
        isExiting
          ? { opacity: 0, y: '-100%' }
          : { opacity: 1, y: '0%' }
      }
      transition={{ duration: exitDuration, ease: EXIT_EASE }}
      className={`${styles.splashRoot} outline-none ${isExiting ? 'pointer-events-none' : ''}`}
    >
      {/* Yalnızca ekran okuyucu için görünmez karşılama metni */}
      <span className="sr-only">{title}</span>

      {/* Satır içi SVG İkon Sprite'ı (Tatlı, Sütlü Tatlı, Yaş Pasta) */}
      <SplashIconSprite />

      {/* KATMAN 1 (Z-10): particleCount (38/22) ile Zengin Tatlı, Sütlü Tatlı ve Yaş Pasta Yağmuru */}
      <div
        className="absolute inset-0 z-10 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        {visibleParticles.map((p) => (
          <div
            key={p.id}
            className={styles.particleOuter}
            style={
              {
                left: `${p.leftPercent}%`,
                width: `${p.sizePx}px`,
                height: `${p.sizePx}px`,
                '--p-dur': `${p.durationSec}s`,
                '--p-delay': `${p.delaySec}s`,
                '--p-opacity': p.opacity,
                '--p-rot-start': `${p.rotStartDeg}deg`,
                '--p-rot-end': `${p.rotEndDeg}deg`,
                '--p-sway': `${p.swayPx}px`,
              } as React.CSSProperties
            }
          >
            <svg
              className={styles.particleInner}
              shapeRendering="geometricPrecision"
            >
              <use href={`#${p.icon}`} />
            </svg>
          </div>
        ))}
      </div>

      {/* KATMAN 2 (Z-20): Üst Pasta Yüzeyi Çikolata, Kakao ve Vanilya Krema Perdesi + Belirgin Damlacıklar */}
      <svg
        viewBox="0 0 1440 185"
        preserveAspectRatio="none"
        className="absolute top-0 left-0 right-0 z-20 w-full h-[13vh] min-h-[88px] max-h-[148px] pointer-events-none overflow-visible"
        aria-hidden="true"
        shapeRendering="geometricPrecision"
      >
        {/* 0.15 sn gecikmeli uzun damlalı vanilya krema katmanı (en arkada) */}
        <motion.path
          d={topCreamCurtainPath}
          fill="#FFFBEF"
          stroke="#E3CFA3"
          strokeWidth="3"
          className={styles.svgTransformTop}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.82, delay: 0.15, ease: CURTAIN_EASE }}
        />

        {/* 0.08 sn gecikmeli kakao çikolata orta katmanı */}
        <motion.path
          d={topCocoaCurtainPath}
          fill="#5D4037"
          className={styles.svgTransformTop}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.8, delay: 0.08, ease: CURTAIN_EASE }}
        />

        {/* 0.00 sn başlayan üst bitter çikolata perdesi (en önde) */}
        <motion.g
          className={styles.svgTransformTop}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.78, delay: 0, ease: CURTAIN_EASE }}
        >
          <path d={topChocolateCurtainPath} fill="#3E2723" />
          <path
            d="M 40 20 Q 360 32 720 20 T 1400 22"
            stroke="rgba(255,255,255,0.62)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            opacity="0.45"
          />
        </motion.g>

        {/* Üst perdeden damla damla kopup aşağı süzülen belirgin çikolata ve vanilya kreması damlacıkları */}
        {topCurtainDroplets.map((drop) => {
          const fill =
            drop.flavor === 'dark-chocolate'
              ? '#3E2723'
              : drop.flavor === 'cocoa'
                ? '#6D4C41'
                : '#FFFBEF';
          const stroke =
            drop.flavor === 'vanilla-cream' ? '#E3CFA3' : '#3E2723';

          return (
            <motion.g
              key={drop.id}
              className={styles.svgTransformCenter}
              initial={{ opacity: 0, y: -8, scale: 0.75 }}
              animate={{
                opacity: [0, 1, 0.96, 0],
                y: [-8, 6, drop.fallDistance * 0.65, drop.fallDistance],
                scale: [0.75, 1.04, 0.94, 0.78],
              }}
              transition={{
                duration: drop.duration,
                delay: drop.delay,
                times: [0, 0.18, 0.76, 1],
                ease: 'easeIn',
              }}
            >
              <ellipse
                cx={drop.cx}
                cy={drop.startY}
                rx={drop.rx}
                ry={drop.ry}
                fill={fill}
                stroke={stroke}
                strokeWidth={drop.flavor === 'vanilla-cream' ? 1.8 : 1.1}
              />
              <circle
                cx={drop.cx - drop.rx * 0.28}
                cy={drop.startY - drop.ry * 0.28}
                r={Math.max(1.5, drop.rx * 0.28)}
                fill="rgba(255,255,255,0.65)"
              />
            </motion.g>
          );
        })}
      </svg>

      {/* KATMAN 3 (Z-30): Karşılama Yazısı + Çikolata Akışı + Dolgun Vanilya/Kakao Damlaları */}
      <motion.div
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.03, 1] }}
        transition={{
          duration: 0.9,
          delay: 2.3,
          times: [0, 0.5, 1],
          ease: 'easeInOut',
        }}
        className="relative z-30 w-[min(90vw,980px)] mx-auto flex flex-col items-center justify-center pointer-events-none"
        aria-hidden="true"
      >
        {!isMobile ? (
          /* A) MASAÜSTÜ SVG (≥640px: 2 Satır - Benzersiz clipPath ID'leri) */
          <svg
            viewBox="0 0 980 282"
            className="w-full h-auto overflow-visible"
            shapeRendering="geometricPrecision"
          >
            <defs>
              <clipPath id="desktop-splash-clip-0">
                <text
                  x="490"
                  y="92"
                  textAnchor="middle"
                  fontFamily="Fredoka, 'Baloo 2', sans-serif"
                  fontWeight="700"
                  fontSize="58"
                >
                  {desktopLines[0]}
                </text>
              </clipPath>
              <clipPath id="desktop-splash-clip-1">
                <text
                  x="490"
                  y="198"
                  textAnchor="middle"
                  fontFamily="Fredoka, 'Baloo 2', sans-serif"
                  fontWeight="700"
                  fontSize="62"
                >
                  {desktopLines[1]}
                </text>
              </clipPath>
            </defs>

            {/* Vanilya Krema Harf Yuvası */}
            <g
              fontFamily="Fredoka, 'Baloo 2', sans-serif"
              fontWeight="700"
              textAnchor="middle"
              fill="#FFFBEF"
              stroke="#E3CFA3"
              strokeWidth="3"
            >
              <text x="490" y="92" fontSize="58">
                {desktopLines[0]}
              </text>
              <text x="490" y="198" fontSize="62">
                {desktopLines[1]}
              </text>
            </g>

            {/* SATIR 1 Çikolata Dolgusu */}
            <g clipPath="url(#desktop-splash-clip-0)">
              <motion.g
                initial={{ y: -230 }}
                animate={{ y: 0 }}
                transition={{
                  duration: 1.3,
                  delay: 0.45,
                  ease: CHOCOLATE_FLOW_EASE,
                }}
              >
                <path d={desktopDarkWave0} fill="#3E2723" />
              </motion.g>
              <motion.g
                initial={{ y: -230 }}
                animate={{ y: 0 }}
                transition={{
                  duration: 1.3,
                  delay: 0.65,
                  ease: CHOCOLATE_FLOW_EASE,
                }}
              >
                <path d={desktopMilkWave0} fill="#6D4C41" />
                <rect x="0" y="0" width="980" height="115" fill="#3E2723" />
                <path
                  d="M 110 52 Q 490 38 870 52"
                  stroke="rgba(255,255,255,0.55)"
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.48"
                />
              </motion.g>
            </g>

            {/* SATIR 2 Çikolata Dolgusu */}
            <g clipPath="url(#desktop-splash-clip-1)">
              <motion.g
                initial={{ y: -230 }}
                animate={{ y: 0 }}
                transition={{
                  duration: 1.3,
                  delay: 0.7,
                  ease: CHOCOLATE_FLOW_EASE,
                }}
              >
                <path d={desktopDarkWave1} fill="#3E2723" transform="translate(0, 105)" />
              </motion.g>
              <motion.g
                initial={{ y: -230 }}
                animate={{ y: 0 }}
                transition={{
                  duration: 1.3,
                  delay: 0.9,
                  ease: CHOCOLATE_FLOW_EASE,
                }}
              >
                <path d={desktopMilkWave1} fill="#6D4C41" transform="translate(0, 105)" />
                <rect x="0" y="115" width="980" height="115" fill="#3E2723" />
                <path
                  d="M 280 156 Q 490 144 700 156"
                  stroke="rgba(255,255,255,0.55)"
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.48"
                />
              </motion.g>
            </g>

            {/* Her satırın altından sarkan dolgun vanilya krema ve kakao damlaları */}
            <HangingCreamDripsGroup drips={desktopDripsLine0} />
            <HangingCreamDripsGroup drips={desktopDripsLine1} />
          </svg>
        ) : (
          /* B) MOBİL SVG (<640px: 3 Satır - Benzersiz clipPath ID'leri) */
          <svg
            viewBox="0 0 600 328"
            className="w-full h-auto overflow-visible"
            shapeRendering="geometricPrecision"
          >
            <defs>
              <clipPath id="mobile-splash-clip-0">
                <text
                  x="300"
                  y="74"
                  textAnchor="middle"
                  fontFamily="Fredoka, 'Baloo 2', sans-serif"
                  fontWeight="700"
                  fontSize="52"
                >
                  {mobileLines[0]}
                </text>
              </clipPath>
              <clipPath id="mobile-splash-clip-1">
                <text
                  x="300"
                  y="162"
                  textAnchor="middle"
                  fontFamily="Fredoka, 'Baloo 2', sans-serif"
                  fontWeight="700"
                  fontSize="52"
                >
                  {mobileLines[1]}
                </text>
              </clipPath>
              <clipPath id="mobile-splash-clip-2">
                <text
                  x="300"
                  y="250"
                  textAnchor="middle"
                  fontFamily="Fredoka, 'Baloo 2', sans-serif"
                  fontWeight="700"
                  fontSize="52"
                >
                  {mobileLines[2]}
                </text>
              </clipPath>
            </defs>

            {/* Mobil 3 Satır Vanilya Krema Harf Yuvası */}
            <g
              fontFamily="Fredoka, 'Baloo 2', sans-serif"
              fontWeight="700"
              textAnchor="middle"
              fill="#FFFBEF"
              stroke="#E3CFA3"
              strokeWidth="2.6"
            >
              <text x="300" y="74" fontSize="52">
                {mobileLines[0]}
              </text>
              <text x="300" y="162" fontSize="52">
                {mobileLines[1]}
              </text>
              <text x="300" y="250" fontSize="52">
                {mobileLines[2]}
              </text>
            </g>

            {/* MOBİL SATIR 1 */}
            <g clipPath="url(#mobile-splash-clip-0)">
              <motion.g
                initial={{ y: -190 }}
                animate={{ y: 0 }}
                transition={{
                  duration: 1.3,
                  delay: 0.45,
                  ease: CHOCOLATE_FLOW_EASE,
                }}
              >
                <path d={mobileDarkWave0} fill="#3E2723" />
              </motion.g>
              <motion.g
                initial={{ y: -190 }}
                animate={{ y: 0 }}
                transition={{
                  duration: 1.3,
                  delay: 0.65,
                  ease: CHOCOLATE_FLOW_EASE,
                }}
              >
                <path d={mobileMilkWave0} fill="#6D4C41" />
                <rect x="0" y="0" width="600" height="92" fill="#3E2723" />
                <path
                  d="M 100 42 Q 300 32 500 42"
                  stroke="rgba(255,255,255,0.55)"
                  strokeWidth="3.4"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.48"
                />
              </motion.g>
            </g>

            {/* MOBİL SATIR 2 */}
            <g clipPath="url(#mobile-splash-clip-1)">
              <motion.g
                initial={{ y: -190 }}
                animate={{ y: 0 }}
                transition={{
                  duration: 1.3,
                  delay: 0.7,
                  ease: CHOCOLATE_FLOW_EASE,
                }}
              >
                <path d={mobileDarkWave1} fill="#3E2723" transform="translate(0, 88)" />
              </motion.g>
              <motion.g
                initial={{ y: -190 }}
                animate={{ y: 0 }}
                transition={{
                  duration: 1.3,
                  delay: 0.9,
                  ease: CHOCOLATE_FLOW_EASE,
                }}
              >
                <path d={mobileMilkWave1} fill="#6D4C41" transform="translate(0, 88)" />
                <rect x="0" y="92" width="600" height="92" fill="#3E2723" />
                <path
                  d="M 100 130 Q 300 120 500 130"
                  stroke="rgba(255,255,255,0.55)"
                  strokeWidth="3.4"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.48"
                />
              </motion.g>
            </g>

            {/* MOBİL SATIR 3 */}
            <g clipPath="url(#mobile-splash-clip-2)">
              <motion.g
                initial={{ y: -190 }}
                animate={{ y: 0 }}
                transition={{
                  duration: 1.3,
                  delay: 0.95,
                  ease: CHOCOLATE_FLOW_EASE,
                }}
              >
                <path d={mobileDarkWave2} fill="#3E2723" transform="translate(0, 176)" />
              </motion.g>
              <motion.g
                initial={{ y: -190 }}
                animate={{ y: 0 }}
                transition={{
                  duration: 1.3,
                  delay: 1.15,
                  ease: CHOCOLATE_FLOW_EASE,
                }}
              >
                <path d={mobileMilkWave2} fill="#6D4C41" transform="translate(0, 176)" />
                <rect x="0" y="180" width="600" height="96" fill="#3E2723" />
                <path
                  d="M 130 218 Q 300 208 470 218"
                  stroke="rgba(255,255,255,0.55)"
                  strokeWidth="3.4"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.48"
                />
              </motion.g>
            </g>

            {/* Mobil Satır Altı Dolgun Vanilya Krema ve Kakao Damlaları */}
            <HangingCreamDripsGroup drips={mobileDripsLine0} />
            <HangingCreamDripsGroup drips={mobileDripsLine1} />
            <HangingCreamDripsGroup drips={mobileDripsLine2} />
          </svg>
        )}
      </motion.div>

      {/* Yalnızca klavye/ekran okuyucu erişilebilirliği için gizli atlama kontrolü */}
      <button
        type="button"
        onClick={triggerFastSkip}
        className="sr-only focus:not-sr-only focus:fixed focus:bottom-6 focus:right-6 focus:z-40 focus:px-5 focus:py-2.5 focus:rounded-full focus:bg-[#3E2723] focus:text-[#FFFBEF] focus:text-sm focus:font-semibold"
      >
        Karşılama animasyonunu atla
      </button>
    </motion.div>
  );
};
