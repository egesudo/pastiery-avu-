import React, { useEffect, useId, useRef } from 'react';
import type { ProductCategory } from '../../data/products';
import { SAUCE_THEME_BY_CATEGORY, SAUCE_TIMINGS } from './theme';

export interface SauceTransitionProps {
  /** Kullanıcının seçtiği hedef kategori */
  targetCategory: ProductCategory;
  /** Sos ürün alanını tamamen kapladığı anda içeriği değiştirmek için çağrılır */
  onCommitCategory: (category: ProductCategory) => void;
  /** prefers-reduced-motion desteği */
  prefersReducedMotion: boolean | null;
  children: React.ReactNode;
}

const VIEWBOX_WIDTH = 1200;
const VIEWBOX_HEIGHT = 820;

/**
 * 8 adet organik damla profili (genişlik boyunca farklı uzunluk ve ritimde damlalar)
 */
const DRIP_DEPTH_FACTORS = [0.55, 1.0, 0.45, 0.88, 0.62, 0.96, 0.5, 0.78] as const;
const TOP_WAVE_FACTORS = [0.6, -0.5, 0.75, -0.45, 0.65, -0.55, 0.7, -0.4] as const;

/**
 * Kübik bezier (x1, y1, x2, y2) eğrisi için 60fps hassasiyetli Newton-Raphson çözücüsü.
 */
function sampleCubicBezier(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x: number
): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;

  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;

  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  let t = x;
  for (let i = 0; i < 6; i++) {
    const currentX = ((ax * t + bx) * t + cx) * t - x;
    if (Math.abs(currentX) < 1e-4) break;
    const dx = (3 * ax * t + 2 * bx) * t + cx;
    if (Math.abs(dx) < 1e-5) break;
    t = Math.min(1, Math.max(0, t - currentX / dx));
  }

  return ((ay * t + by) * t + cy) * t;
}

/**
 * Doğrudan SVG <clipPath> içindeki <path d="..."> için akışkan dalgalı kesme yolu üretir.
 * Üst menisküs (soldan sağa) ve alt damla uçları (sağdan sola) tek kapalı path olarak hesaplanır.
 */
function buildLiquidClipPath(
  topBaseY: number,
  topWaveAmp: number,
  bottomBaseY: number,
  bottomDripAmp: number
): { clipD: string; waveHighlightD: string } {
  const segCount = DRIP_DEPTH_FACTORS.length;
  const segW = VIEWBOX_WIDTH / segCount;

  // Üst kenar (soldan sağa)
  let clipD = `M 0 ${topBaseY.toFixed(1)}`;
  let topHighlightD = `M 0 ${(topBaseY + 6).toFixed(1)}`;

  for (let i = 0; i < segCount; i++) {
    const startX = i * segW;
    const endX = (i + 1) * segW;
    const midX = startX + segW * 0.5;
    const offset = TOP_WAVE_FACTORS[i] * topWaveAmp;
    const midY = topBaseY + offset;

    clipD += ` Q ${(startX + segW * 0.25).toFixed(1)} ${midY.toFixed(1)}, ${midX.toFixed(1)} ${midY.toFixed(1)}`;
    clipD += ` Q ${(startX + segW * 0.75).toFixed(1)} ${midY.toFixed(1)}, ${endX.toFixed(1)} ${topBaseY.toFixed(1)}`;

    topHighlightD += ` Q ${(startX + segW * 0.25).toFixed(1)} ${(midY + 6).toFixed(1)}, ${midX.toFixed(1)} ${(midY + 6).toFixed(1)}`;
    topHighlightD += ` Q ${(startX + segW * 0.75).toFixed(1)} ${(midY + 6).toFixed(1)}, ${endX.toFixed(1)} ${(topBaseY + 6).toFixed(1)}`;
  }

  // Sağ kenardan alt damla başlangıcına in
  clipD += ` L ${VIEWBOX_WIDTH} ${bottomBaseY.toFixed(1)}`;

  // Alt damlalı kenar (sağdan sola)
  let bottomHighlightD = `M ${VIEWBOX_WIDTH} ${(bottomBaseY - 10).toFixed(1)}`;

  for (let i = segCount - 1; i >= 0; i--) {
    const rightX = (i + 1) * segW;
    const leftX = i * segW;
    const tipX = leftX + segW * 0.5;
    const tipY = bottomBaseY + DRIP_DEPTH_FACTORS[i] * bottomDripAmp;

    clipD += ` C ${(rightX - segW * 0.18).toFixed(1)} ${bottomBaseY.toFixed(1)}, ${(tipX + segW * 0.22).toFixed(1)} ${tipY.toFixed(1)}, ${tipX.toFixed(1)} ${tipY.toFixed(1)}`;
    clipD += ` C ${(tipX - segW * 0.22).toFixed(1)} ${tipY.toFixed(1)}, ${(leftX + segW * 0.18).toFixed(1)} ${bottomBaseY.toFixed(1)}, ${leftX.toFixed(1)} ${bottomBaseY.toFixed(1)}`;

    const sheenTipY = tipY - 12;
    const sheenBaseY = bottomBaseY - 10;
    bottomHighlightD += ` C ${(rightX - segW * 0.18).toFixed(1)} ${sheenBaseY.toFixed(1)}, ${(tipX + segW * 0.22).toFixed(1)} ${sheenTipY.toFixed(1)}, ${tipX.toFixed(1)} ${sheenTipY.toFixed(1)}`;
    bottomHighlightD += ` C ${(tipX - segW * 0.22).toFixed(1)} ${sheenTipY.toFixed(1)}, ${(leftX + segW * 0.18).toFixed(1)} ${sheenBaseY.toFixed(1)}, ${leftX.toFixed(1)} ${sheenBaseY.toFixed(1)}`;
  }

  clipD += ' Z';

  return {
    clipD,
    waveHighlightD: topBaseY > 2 ? topHighlightD : bottomHighlightD,
  };
}

interface SauceOverlayLayerProps {
  targetCategory: ProductCategory;
  onCommitCategory: (category: ProductCategory) => void;
  prefersReducedMotion: boolean | null;
}

/**
 * Sıfır re-render mimarisi:
 * SVG katmanı başlangıçtan itibaren gizli olarak DOM'da bulunur;
 * sekme değişiminde tüm renk güncellemesi ve 450ms SVG <clipPath> path animasyonu
 * doğrudan DOM ref + requestAnimationFrame üzerinden yürütülür (React state güncellenmez).
 */
const SauceOverlayLayer: React.FC<SauceOverlayLayerProps> = React.memo(
  ({ targetCategory, onCommitCategory, prefersReducedMotion }) => {
    const rawId = useId();
    const clipPathId = `sauce-flow-clip-${rawId.replace(/:/g, '')}`;

    const overlayRef = useRef<HTMLDivElement>(null);
    const clipPathRef = useRef<SVGPathElement>(null);
    const mainRectRef = useRef<SVGRectElement>(null);
    const glossWaveRef = useRef<SVGPathElement>(null);
    const sheenStrokeRef = useRef<SVGPathElement>(null);
    const fleckGroupRef = useRef<SVGGElement>(null);

    const rafRef = useRef<number | null>(null);
    const runIdRef = useRef<number>(0);
    const lastRequestedRef = useRef<ProductCategory>(targetCategory);
    const onCommitRef = useRef(onCommitCategory);
    onCommitRef.current = onCommitCategory;

    useEffect(() => {
      if (targetCategory === lastRequestedRef.current) {
        return;
      }
      lastRequestedRef.current = targetCategory;

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      const currentRunId = ++runIdRef.current;
      const overlayEl = overlayRef.current;

      if (prefersReducedMotion) {
        if (overlayEl) {
          overlayEl.style.visibility = 'hidden';
          overlayEl.style.opacity = '0';
        }
        onCommitRef.current(targetCategory);
        return;
      }

      // Hedef kategori sos renklerini React render'ı olmadan doğrudan SVG DOM düğümlerine uygula
      const sauce = SAUCE_THEME_BY_CATEGORY[targetCategory];
      if (mainRectRef.current) {
        mainRectRef.current.setAttribute('fill', sauce.fill);
      }
      if (glossWaveRef.current) {
        glossWaveRef.current.setAttribute('fill', sauce.glossFill);
        glossWaveRef.current.setAttribute('opacity', String(sauce.glossOpacity));
      }
      if (sheenStrokeRef.current) {
        sheenStrokeRef.current.setAttribute('stroke', sauce.sheenStroke);
      }
      if (fleckGroupRef.current) {
        fleckGroupRef.current.setAttribute('fill', sauce.fleckColor);
      }

      // Başlangıç karesini senkron kur
      if (clipPathRef.current) {
        clipPathRef.current.setAttribute('d', 'M 0 0 H 1200 V 0 H 0 Z');
      }
      if (overlayEl) {
        overlayEl.style.visibility = 'visible';
        overlayEl.style.opacity = '1';
        overlayEl.style.transform = 'translate3d(0, 0, 0)';
      }

      const coverMs = SAUCE_TIMINGS.coverMs; // 450 ms
      const drainMs = SAUCE_TIMINGS.drainMs; // 450 ms
      const totalMs = coverMs + drainMs; // 900 ms (< 1 sn)

      let startTime: number | null = null;
      let swapped = false;

      const tick = (now: number) => {
        if (runIdRef.current !== currentRunId) return;

        if (startTime === null) {
          startTime = now;
        }
        const elapsed = now - startTime;

        if (elapsed <= coverMs) {
          // AŞAMA 1 (0 -> 450ms): Üstten dalgalı ve damlalı clip-path aşağı akarak ürün alanını kaplar
          const progress = Math.min(1, elapsed / coverMs);
          const eased = sampleCubicBezier(0.22, 1, 0.36, 1, progress);

          const bottomBaseY = -20 + (VIEWBOX_HEIGHT + 45) * eased;
          const dripAmp = Math.sin(Math.PI * Math.min(1, progress * 1.15)) * 110;

          const { clipD, waveHighlightD } = buildLiquidClipPath(
            -10,
            0,
            bottomBaseY,
            dripAmp
          );

          clipPathRef.current?.setAttribute('d', clipD);
          sheenStrokeRef.current?.setAttribute('d', waveHighlightD);

          if (overlayEl) {
            overlayEl.style.opacity = '1';
          }

          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        // Tamamen kaplandığı anda görünmez içerik değişimini tek seferde tetikle
        if (!swapped) {
          swapped = true;
          onCommitRef.current(targetCategory);
        }

        if (elapsed < totalMs) {
          // AŞAMA 2 (450 -> 900ms): Üst menisküs aşağı süzülerek yeni ürünleri ortaya çıkarır
          const drainElapsed = elapsed - coverMs;
          const progress = Math.min(1, drainElapsed / drainMs);
          const eased = sampleCubicBezier(0.4, 0, 0.2, 1, progress);

          const topBaseY = -10 + (VIEWBOX_HEIGHT + 55) * eased;
          const topWaveAmp = Math.sin(Math.PI * progress) * 58;

          const { clipD, waveHighlightD } = buildLiquidClipPath(
            topBaseY,
            topWaveAmp,
            VIEWBOX_HEIGHT + 30,
            0
          );

          clipPathRef.current?.setAttribute('d', clipD);
          sheenStrokeRef.current?.setAttribute('d', waveHighlightD);

          if (overlayEl) {
            const tailOpacity =
              progress <= 0.78 ? 1 : Math.max(0, 1 - (progress - 0.78) / 0.22);
            overlayEl.style.opacity = tailOpacity.toFixed(3);
          }

          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        // Bitiş: 0 React re-render ile katmanı gizle ve sıfırla
        if (overlayEl) {
          overlayEl.style.opacity = '0';
          overlayEl.style.visibility = 'hidden';
        }
        clipPathRef.current?.setAttribute('d', 'M 0 0 H 1200 V 0 H 0 Z');
        rafRef.current = null;
      };

      rafRef.current = requestAnimationFrame(tick);

      return () => {
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      };
    }, [targetCategory, prefersReducedMotion]);

    const initialSauce = SAUCE_THEME_BY_CATEGORY[targetCategory];

    return (
      <div
        ref={overlayRef}
        aria-hidden="true"
        style={{
          visibility: 'hidden',
          opacity: 0,
          transform: 'translate3d(0, 0, 0)',
          contain: 'layout style paint',
        }}
        className="pointer-events-none absolute inset-0 z-20 will-change-[opacity,transform]"
      >
        <svg
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          preserveAspectRatio="none"
          className="w-full h-full block"
        >
          <defs>
            <clipPath id={clipPathId}>
              <path ref={clipPathRef} d="M 0 0 H 1200 V 0 H 0 Z" />
            </clipPath>
          </defs>

          <g clipPath={`url(#${clipPathId})`}>
            {/* Ana sıvı sos gövdesi */}
            <rect
              ref={mainRectRef}
              x="0"
              y="0"
              width={VIEWBOX_WIDTH}
              height={VIEWBOX_HEIGHT}
              fill={initialSauce.fill}
            />

            {/* İkinci derinlik ve parlaklık akış katmanı */}
            <path
              ref={glossWaveRef}
              d="M0 0 H1200 V580 C1100 580 1055 636 985 636 C915 636 885 568 805 568 C725 568 685 648 615 648 C545 648 510 572 435 572 C360 572 315 640 245 640 C175 640 135 574 65 574 C30 574 12 595 0 595 Z"
              fill={initialSauce.glossFill}
              opacity={initialSauce.glossOpacity}
            />

            {/* Çok seyrek, şeffaf pudra şekeri / kakao / karamel parçacıkları */}
            <g ref={fleckGroupRef} opacity="0.34" fill={initialSauce.fleckColor}>
              <circle cx="165" cy="215" r="4.5" />
              <circle cx="420" cy="375" r="3.5" />
              <circle cx="695" cy="195" r="5" />
              <circle cx="940" cy="425" r="3.8" />
              <circle cx="1080" cy="275" r="4.2" />
            </g>

            {/* Hareket eden dalga kenarını takip eden akışkan parlaklık çizgisi */}
            <path
              ref={sheenStrokeRef}
              d="M 0 0"
              fill="none"
              stroke={initialSauce.sheenStroke}
              strokeWidth="5"
              strokeLinecap="round"
            />
          </g>
        </svg>
      </div>
    );
  }
);
SauceOverlayLayer.displayName = 'SauceOverlayLayer';

export const SauceTransition: React.FC<SauceTransitionProps> = React.memo(
  ({ targetCategory, onCommitCategory, prefersReducedMotion, children }) => {
    return (
      <div
        className="relative rounded-[28px] overflow-hidden -mx-2 px-2 py-2"
        style={{ contain: 'layout style' }}
      >
        {/* Ürün alanı içeriği */}
        {children}

        {/* Sıfır re-render SVG <clipPath> rAF sos katmanı */}
        <SauceOverlayLayer
          targetCategory={targetCategory}
          onCommitCategory={onCommitCategory}
          prefersReducedMotion={prefersReducedMotion}
        />
      </div>
    );
  }
);
SauceTransition.displayName = 'SauceTransition';
