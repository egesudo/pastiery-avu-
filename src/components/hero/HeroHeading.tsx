import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './heroHeading.module.css';
import { HERO_COLORS, HERO_DRIPS, HERO_TIMINGS } from './heroConstants';
import { useDripClock } from './useDripClock';

interface AccentAnchorBox {
  id: 'ustalik' | 'tazelik';
  left: number;
  width: number;
  bottom: number;
}

interface ChocolateDrop {
  id: string;
  x: number;
  y: number;
  delayMs: number;
  fallPx: number;
  fill: string;
  highlight: string;
  scale: number;
}

const CHOCOLATE_DROP_TONES = [
  { fill: '#2B160E', highlight: '#7A4A2B' }, // Bitter çikolata
  { fill: '#3B2314', highlight: '#94501D' }, // Koyu kakao-karamel yansımalı
  { fill: '#6B371B', highlight: '#C98A3E' }, // Akışkan süt çikolatası
] as const;

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export interface HeroHeadingProps {
  splashDone?: boolean;
}

export const HeroHeading: React.FC<HeroHeadingProps> = ({ splashDone = true }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const ustalikRef = useRef<HTMLSpanElement>(null);
  const tazelikRef = useRef<HTMLElement>(null);

  const [anchors, setAnchors] = useState<AccentAnchorBox[]>([]);
  const [drops, setDrops] = useState<ChocolateDrop[]>([]);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isTabHidden, setIsTabHidden] = useState<boolean>(() =>
    typeof document !== 'undefined' ? document.hidden : false
  );
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  const lastInteractiveRef = useRef<number>(0);
  const cleanupTimersRef = useRef<number[]>([]);

  const isPaused = !splashDone || !isVisible || isTabHidden || prefersReducedMotion;

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabHidden(document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // "Ustalık" ve "Tazelik" kelime konumlarını ölç — damlalar yalnızca bu iki vurgunun altından doğar
  const measureAnchors = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    if (containerRect.width === 0) return;

    const nextAnchors: AccentAnchorBox[] = [];

    const ustalikEl = ustalikRef.current;
    if (ustalikEl) {
      const rect = ustalikEl.getBoundingClientRect();
      if (rect.width > 16) {
        nextAnchors.push({
          id: 'ustalik',
          left: Math.max(0, rect.left - containerRect.left),
          width: rect.width,
          bottom: Math.max(0, rect.bottom - containerRect.top),
        });
      }
    }

    const tazelikEl = tazelikRef.current;
    if (tazelikEl) {
      const rect = tazelikEl.getBoundingClientRect();
      if (rect.width > 16) {
        nextAnchors.push({
          id: 'tazelik',
          left: Math.max(0, rect.left - containerRect.left),
          width: rect.width,
          bottom: Math.max(0, rect.bottom - containerRect.top),
        });
      }
    }

    setAnchors(nextAnchors);
  }, []);

  useEffect(() => {
    measureAnchors();
    const container = containerRef.current;
    if (!container) return;

    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        window.requestAnimationFrame(measureAnchors);
      });
      ro.observe(container);
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        window.requestAnimationFrame(measureAnchors);
      });
    }

    return () => ro?.disconnect();
  }, [measureAnchors]);

  const scheduleDropCleanup = useCallback((idsToRemove: string[], delayMs: number) => {
    const timer = window.setTimeout(() => {
      const idSet = new Set(idsToRemove);
      setDrops((prev) => prev.filter((d) => !idSet.has(d.id)));
      cleanupTimersRef.current = cleanupTimersRef.current.filter((t) => t !== timer);
    }, delayMs);
    cleanupTimersRef.current.push(timer);
  }, []);

  const spawnAccentDrips = useCallback(
    (count: number, maxRandomDelayMs: number, preferredX?: number) => {
      if (anchors.length === 0) return;

      const isMobile =
        typeof window !== 'undefined' &&
        window.innerWidth < HERO_DRIPS.mobileBreakpointPx;

      const minFall = isMobile ? 16 : 22;
      const maxFall = isMobile ? 24 : 34;

      const now = Date.now();
      const created: ChocolateDrop[] = [];

      for (let i = 0; i < count; i++) {
        let targetAnchor = anchors[i % anchors.length];

        if (typeof preferredX === 'number' && i === 0 && anchors.length > 1) {
          // İşaretçiye en yakın vurgu kelimesini seç
          targetAnchor = anchors.reduce((closest, candidate) => {
            const closestCenter = closest.left + closest.width / 2;
            const candidateCenter = candidate.left + candidate.width / 2;
            return Math.abs(candidateCenter - preferredX) <
              Math.abs(closestCenter - preferredX)
              ? candidate
              : closest;
          });
        }

        const edgePad = 14;
        const safeMinX = targetAnchor.left + edgePad;
        const safeMaxX = Math.max(
          safeMinX + 4,
          targetAnchor.left + targetAnchor.width - edgePad
        );

        const targetX =
          typeof preferredX === 'number' && i === 0
            ? Math.min(safeMaxX, Math.max(safeMinX, preferredX))
            : randomBetween(safeMinX, safeMaxX);

        const tone =
          CHOCOLATE_DROP_TONES[
            Math.floor(Math.random() * CHOCOLATE_DROP_TONES.length)
          ];
        const delayMs =
          maxRandomDelayMs > 0 ? Math.round(Math.random() * maxRandomDelayMs) : 0;

        // "Ustalık" altındaki çizgi vurgusunun hemen altından doğması için hafif dikey pay
        const verticalOffset = targetAnchor.id === 'ustalik' ? 5 : -2;

        created.push({
          id: `choco-drip-${now}-${i}-${Math.random().toString(36).slice(2, 6)}`,
          x: Math.round(targetX),
          y: Math.round(targetAnchor.bottom + verticalOffset),
          delayMs,
          fallPx: Math.round(randomBetween(minFall, maxFall)),
          fill: tone.fill,
          highlight: tone.highlight,
          scale: Number(randomBetween(0.76, 0.94).toFixed(2)),
        });
      }

      setDrops((prev) => [...prev, ...created]);

      const maxLifeMs =
        maxRandomDelayMs +
        HERO_TIMINGS.dropElongateMs +
        HERO_TIMINGS.dropFallMs +
        HERO_TIMINGS.dropSplashMs +
        140;

      scheduleDropCleanup(
        created.map((d) => d.id),
        maxLifeMs
      );
    },
    [anchors, scheduleDropCleanup]
  );

  // 3D pasta glazürü ile senkron ortak zamanlayıcı
  const handleDripSessionStart = useCallback(() => {
    const isMobile =
      typeof window !== 'undefined' &&
      window.innerWidth < HERO_DRIPS.mobileBreakpointPx;
    const dropCount = isMobile ? 1 : 2;
    spawnAccentDrips(dropCount, 900);
  }, [spawnAccentDrips]);

  useDripClock({
    isPaused: isPaused || anchors.length === 0,
    onSessionStart: handleDripSessionStart,
  });

  useEffect(() => {
    return () => {
      cleanupTimersRef.current.forEach((id) => window.clearTimeout(id));
      cleanupTimersRef.current = [];
    };
  }, []);

  const triggerInteractiveDrop = useCallback(
    (clientX?: number) => {
      if (isPaused || anchors.length === 0) return;
      const now = Date.now();
      if (now - lastInteractiveRef.current < HERO_TIMINGS.interactiveCooldownMs) {
        return;
      }
      lastInteractiveRef.current = now;

      let relativeX: number | undefined;
      if (typeof clientX === 'number' && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        relativeX = clientX - rect.left;
      }

      spawnAccentDrips(1, 0, relativeX);
    },
    [isPaused, anchors.length, spawnAccentDrips]
  );

  const handlePointerEnter = useCallback(
    (e: React.PointerEvent<HTMLHeadingElement>) => {
      if (e.pointerType === 'touch') return;
      triggerInteractiveDrop(e.clientX);
    },
    [triggerInteractiveDrop]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLHeadingElement>) => {
      const touchX = e.touches[0]?.clientX;
      triggerInteractiveDrop(touchX);
    },
    [triggerInteractiveDrop]
  );

  return (
    <div
      ref={containerRef}
      className={`${styles.heroCopy} ${
        !splashDone ? styles.awaitingSplash : ''
      }`}
    >
      <p className={styles.heroKicker}>
        Günlük Taze Üretim · Gaziantep Lezzet Geleneği
      </p>

      <h1
        id="main-hero-heading"
        tabIndex={-1}
        onPointerEnter={handlePointerEnter}
        onTouchStart={handleTouchStart}
        className={`${styles.heroTitle} focus:outline-none`}
        aria-label="Her Dilimde Geleneksel Ustalık, Her Lokmada Tazelik"
      >
        <span className={styles.lineTop}>Her Dilimde</span>

        <span className={styles.lineAccentWrap}>
          <span className={styles.lineScript}>
            <span className={styles.wordEspresso}>Geleneksel</span>{' '}
            <span ref={ustalikRef} className={styles.chocoCaramelShine}>
              Ustalık
            </span>
            <span className={styles.wordEspresso}>,</span>
          </span>

          {/* Zarif, akışkan çikolata & vanilya kreması çizgi vurgusu */}
          <svg
            className={styles.flowUnderline}
            viewBox="0 0 360 22"
            fill="none"
            aria-hidden="true"
          >
            <path
              className={styles.flowPathCream}
              d="M6 14C78 5 154 20 236 11C280 6 318 9 354 14"
              stroke="#F3E5C8"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              className={styles.flowPathChoco}
              d="M14 17C88 9 162 21 244 13C286 9 322 12 348 16"
              stroke="#5A2A16"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </span>

        <span className={styles.lineBottom}>
          Her Lokmada{' '}
          <em
            ref={tazelikRef}
            className={`${styles.creamHighlight} ${styles.chocoCaramelShine}`}
          >
            Tazelik
          </em>
        </span>
      </h1>

      {/* "Ustalık" ve "Tazelik" altından süzülen zarif akışkan çikolata damlaları */}
      {!prefersReducedMotion && drops.length > 0 && (
        <div className={styles.dripLayer} aria-hidden="true">
          {drops.map((drop) => {
            const cssVars = {
              '--drop-delay': `${drop.delayMs}ms`,
              '--elongate-ms': `${HERO_TIMINGS.dropElongateMs}ms`,
              '--fall-ms': `${HERO_TIMINGS.dropFallMs}ms`,
              '--splash-ms': `${HERO_TIMINGS.dropSplashMs}ms`,
              '--drop-fall-distance': `${drop.fallPx}px`,
            } as React.CSSProperties;

            return (
              <div
                key={drop.id}
                className={styles.dropUnit}
                style={{
                  transform: `translate3d(${drop.x}px, ${drop.y}px, 0) scale(${drop.scale})`,
                  ...cssVars,
                }}
              >
                <div className={styles.dropFallCarrier}>
                  <div className={styles.dropNeckWrap}>
                    <svg
                      width="14"
                      height="22"
                      viewBox="0 0 16 26"
                      fill="none"
                      style={{ display: 'block', marginLeft: '-7px' }}
                    >
                      <path
                        d="M8 0.8 C 9.1 7.2, 13.1 13.0, 13.1 18.2 A 5.1 5.1 0 1 1 2.9 18.2 C 2.9 13.0, 6.9 7.2, 8 0.8 Z"
                        fill={drop.fill}
                      />
                      <path
                        d="M5.4 15.6 C 4.9 17.5, 5.2 19.6, 6.4 20.8"
                        stroke={drop.highlight}
                        strokeWidth="1.25"
                        strokeLinecap="round"
                        opacity="0.82"
                      />
                      <circle
                        cx="7.4"
                        cy="21.4"
                        r="0.7"
                        fill={HERO_COLORS.vanillaCream}
                        opacity="0.72"
                      />
                    </svg>
                  </div>
                </div>

                <svg
                  className={styles.dropSplash}
                  viewBox="0 0 24 12"
                  fill="none"
                >
                  <ellipse
                    cx="12"
                    cy="7.2"
                    rx="7.6"
                    ry="2.2"
                    stroke={drop.fill}
                    strokeWidth="1.15"
                    opacity="0.78"
                  />
                  <circle cx="3.8" cy="4.4" r="0.85" fill={drop.fill} opacity="0.75" />
                  <circle cx="20.2" cy="4.4" r="0.85" fill={drop.fill} opacity="0.75" />
                </svg>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
