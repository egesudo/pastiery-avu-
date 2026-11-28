import React, { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';

export interface ScallopDividerProps {
  className?: string;
  /** Üst/alt bölüm geçiş yönü */
  flip?: boolean;
  /** Tente rengi CSS değişkeni veya hex değeri (varsayılan krem #FFF8EC) */
  fillColor?: string;
  /** Alt kenar kakao/karamel vurgu çizgisi */
  strokeColor?: string;
}

/**
 * Dekoratif tente kenarı ayraç (scallop-ayrac).
 * Bölüm geçişlerinde ve mobil çekmece kenarında dekoratif amaçlı kullanılır (ikon değildir).
 */
export const ScallopDivider: React.FC<ScallopDividerProps> = React.memo(
  ({
    className = '',
    flip = false,
    fillColor = 'var(--icon-krem)',
    strokeColor = 'rgba(59, 35, 20, 0.14)',
  }) => {
    return (
      <div
        aria-hidden="true"
        className={`w-full overflow-hidden leading-none select-none pointer-events-none ${
          flip ? 'rotate-180' : ''
        } ${className}`.trim()}
      >
        <svg
          viewBox="0 0 1200 32"
          preserveAspectRatio="none"
          className="block w-full h-5 sm:h-7"
        >
          <path
            d="M0,0 H1200 V10 C1175,28 1125,28 1100,10 C1075,28 1025,28 1000,10 C975,28 925,28 900,10 C875,28 825,28 800,10 C775,28 725,28 700,10 C675,28 625,28 600,10 C575,28 525,28 500,10 C475,28 425,28 400,10 C375,28 325,28 300,10 C275,28 225,28 200,10 C175,28 125,28 100,10 C75,28 25,28 0,10 Z"
            fill={fillColor}
          />
          <path
            d="M0,10 C25,28 75,28 100,10 C125,28 175,28 200,10 C225,28 275,28 300,10 C325,28 375,28 400,10 C425,28 475,28 500,10 C525,28 575,28 600,10 C625,28 675,28 700,10 C725,28 775,28 800,10 C825,28 875,28 900,10 C925,28 975,28 1000,10 C1025,28 1075,28 1100,10 C1125,28 1175,28 1200,10"
            fill="none"
            stroke={strokeColor}
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }
);
ScallopDivider.displayName = 'ScallopDivider';

export interface SprinklesDividerProps {
  className?: string;
}

/**
 * Dekoratif pasta süsü (serpme-ayrac) ince bölüm ayracı.
 * Çikolata damlalı geçiş diliyle uyumlu karamel, kakao ve çilek tanecikleri.
 */
export const SprinklesDivider: React.FC<SprinklesDividerProps> = React.memo(
  ({ className = '' }) => {
    return (
      <div
        aria-hidden="true"
        className={`w-full flex items-center justify-center py-2 select-none pointer-events-none ${className}`.trim()}
      >
        <svg viewBox="0 0 240 20" className="w-48 sm:w-60 h-5" fill="none">
          <line
            x1="8"
            y1="10"
            x2="76"
            y2="10"
            stroke="var(--icon-vanilya)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="164"
            y1="10"
            x2="232"
            y2="10"
            stroke="var(--icon-vanilya)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <rect
            x="88"
            y="8"
            width="9"
            height="3.2"
            rx="1.6"
            transform="rotate(-18 92.5 9.6)"
            fill="var(--icon-sut-cikolatasi)"
          />
          <circle cx="108" cy="10" r="2.1" fill="var(--icon-karamel)" />
          <rect
            x="118"
            y="8.2"
            width="8.5"
            height="3.2"
            rx="1.6"
            transform="rotate(20 122 9.8)"
            fill="var(--icon-cilek)"
            fillOpacity="0.82"
          />
          <circle cx="136" cy="9.8" r="2" fill="var(--icon-kakao)" fillOpacity="0.72" />
          <rect
            x="145"
            y="8.4"
            width="8"
            height="3"
            rx="1.5"
            transform="rotate(-14 149 9.9)"
            fill="var(--icon-karamel)"
          />
        </svg>
      </div>
    );
  }
);
SprinklesDivider.displayName = 'SprinklesDivider';

export type PastrySectionWaveVariant =
  | 'hero-yuva'
  | 'yuva-lezzet'
  | 'lezzet-konum';

export interface PastrySectionWaveProps {
  variant: PastrySectionWaveVariant;
  className?: string;
}

const SCALLOP_CRESTS = [50, 55, 47, 53, 46, 54, 48, 55, 47, 53, 49] as const;

function buildPipedScallopPath(baseY: number, closeBottom: boolean): string {
  const step = 160;
  const startX = -160;
  let d = `M${startX},${baseY}`;

  SCALLOP_CRESTS.forEach((crestY, idx) => {
    const x0 = startX + idx * step;
    const x1 = x0 + step;
    const mid = (x0 + x1) / 2;
    d += ` C${x0 + 44},${baseY} ${x0 + 52},${crestY} ${mid},${crestY}`;
    d += ` C${x1 - 52},${crestY} ${x1 - 44},${baseY} ${x1},${baseY}`;
  });

  if (closeBottom) {
    d += ' L1600,114 L-160,114 Z';
  }
  return d;
}

const PIPED_SCALLOP_FILL_D = buildPipedScallopPath(76, true);
const PIPED_SCALLOP_STROKE_D = buildPipedScallopPath(76, false);

/**
 * Pastane ruhlu, çok katmanlı dalgalı bölüm geçiş deseni.
 * - `hero-yuva`: Hero (#FAF6F0) → Sıcak Yuva, Taze Tezgâh (#F4EDE2) (krema & karamel sos dalgası)
 * - `yuva-lezzet`: Sıcak Yuva, Taze Tezgâh (#F4EDE2) → Lezzetlerimiz (#FAF6F0) (süt çikolatalı ganaj & sıkma krema tente dalgası)
 * - `lezzet-konum`: Lezzetlerimiz (#FAF6F0) → Konum & İletişim (#FAF6F0) (fıstık & karamel şeritli yumuşak davet dalgası)
 */
export const PastrySectionWave: React.FC<PastrySectionWaveProps> = React.memo(
  ({ variant, className = '' }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const prefersReducedMotion = useReducedMotion();

    const { scrollYProgress } = useScroll({
      target: containerRef,
      offset: ['start end', 'end start'],
    });

    const backWaveShiftX = useTransform(
      scrollYProgress,
      [0, 1],
      prefersReducedMotion
        ? [0, 0]
        : variant === 'hero-yuva'
          ? [-18, 18]
          : variant === 'yuva-lezzet'
            ? [18, -18]
            : [-14, 14]
    );
    const midWaveShiftX = useTransform(
      scrollYProgress,
      [0, 1],
      prefersReducedMotion
        ? [0, 0]
        : variant === 'hero-yuva'
          ? [14, -14]
          : variant === 'yuva-lezzet'
            ? [-12, 12]
            : [12, -12]
    );

    const wrapperBg =
      variant === 'yuva-lezzet' ? 'bg-[#F4EDE2]' : 'bg-[#FAF6F0]';

    return (
      <div
        ref={containerRef}
        aria-hidden="true"
        className={`relative w-full overflow-hidden leading-none select-none pointer-events-none -mt-px -mb-px ${wrapperBg} ${className}`.trim()}
      >
        <svg
          viewBox="0 0 1440 112"
          preserveAspectRatio="none"
          className="block w-full h-16 sm:h-20 lg:h-24"
        >
          {variant === 'hero-yuva' && (
            <>
              <motion.g style={{ x: backWaveShiftX }}>
                <path
                  d="M-120,54 C90,14 270,90 480,48 C690,6 880,88 1090,44 C1270,8 1410,74 1560,46 L1560,114 L-120,114 Z"
                  fill="var(--icon-vanilya)"
                  fillOpacity="0.62"
                />
              </motion.g>

              <motion.g style={{ x: midWaveShiftX }}>
                <path
                  d="M-120,70 C130,96 340,26 560,64 C780,102 990,30 1210,64 C1360,86 1460,42 1560,58 L1560,114 L-120,114 Z"
                  fill="var(--icon-karamel)"
                  fillOpacity="0.22"
                />
              </motion.g>

              <path
                d="M-120,74 C110,44 270,94 460,70 C650,46 820,88 1020,60 C1210,34 1370,82 1560,62 L1560,114 L-120,114 Z"
                fill="#F4EDE2"
              />
              <path
                d="M-120,74 C110,44 270,94 460,70 C650,46 820,88 1020,60 C1210,34 1370,82 1560,62"
                fill="none"
                stroke="var(--icon-karamel)"
                strokeOpacity="0.4"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </>
          )}

          {variant === 'yuva-lezzet' && (
            <>
              <motion.g style={{ x: backWaveShiftX }}>
                <path
                  d="M-120,44 C110,84 290,18 500,56 C710,94 900,16 1110,56 C1280,88 1420,30 1560,50 L1560,114 L-120,114 Z"
                  fill="var(--icon-vanilya)"
                  fillOpacity="0.68"
                />
              </motion.g>

              <motion.g style={{ x: midWaveShiftX }}>
                <path
                  d="M-120,62 C150,24 350,86 560,48 C770,12 970,84 1180,48 C1340,22 1450,68 1560,52 L1560,114 L-120,114 Z"
                  fill="var(--icon-sut-cikolatasi)"
                  fillOpacity="0.16"
                />
              </motion.g>

              <path d={PIPED_SCALLOP_FILL_D} fill="#FAF6F0" />
              <path
                d={PIPED_SCALLOP_STROKE_D}
                fill="none"
                stroke="var(--icon-kakao)"
                strokeOpacity="0.22"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </>
          )}

          {variant === 'lezzet-konum' && (
            <>
              <motion.g style={{ x: backWaveShiftX }}>
                <path
                  d="M-120,56 C120,24 300,88 520,54 C740,20 920,84 1140,50 C1310,24 1440,72 1560,54 L1560,114 L-120,114 Z"
                  fill="var(--icon-vanilya)"
                  fillOpacity="0.48"
                />
              </motion.g>

              <motion.g style={{ x: midWaveShiftX }}>
                <path
                  d="M-120,72 C150,94 360,34 590,68 C820,100 1020,38 1240,68 C1380,86 1470,50 1560,64 L1560,114 L-120,114 Z"
                  fill="var(--icon-karamel)"
                  fillOpacity="0.14"
                />
              </motion.g>

              <path
                d="M-120,76 C120,50 280,92 470,70 C670,48 840,90 1040,64 C1220,40 1380,82 1560,66 L1560,114 L-120,114 Z"
                fill="#FAF6F0"
              />
              <path
                d="M-120,76 C120,50 280,92 470,70 C670,48 840,90 1040,64 C1220,40 1380,82 1560,66"
                fill="none"
                stroke="var(--icon-sut-cikolatasi)"
                strokeOpacity="0.26"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </>
          )}
        </svg>

        {/* Orta eksende esnemeyen (aspect-preserved) ince pastane süsü motifi */}
        <div className="pointer-events-none absolute inset-x-0 bottom-2 sm:bottom-3 flex justify-center">
          <svg viewBox="0 0 180 32" className="w-36 sm:w-44 h-6 sm:h-7" fill="none">
            {variant === 'hero-yuva' && (
              <>
                <path
                  d="M16 18C34 11 52 24 72 16"
                  stroke="var(--icon-karamel)"
                  strokeOpacity="0.52"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
                <path
                  d="M108 16C128 24 146 11 164 18"
                  stroke="var(--icon-karamel)"
                  strokeOpacity="0.52"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
                <path
                  d="M82 20C82 15 86 12 90 12C94 12 98 15 98 20C98 22.5 95.5 24 90 24C84.5 24 82 22.5 82 20Z"
                  fill="var(--icon-vanilya)"
                  stroke="var(--icon-sut-cikolatasi)"
                  strokeOpacity="0.58"
                  strokeWidth="1.5"
                />
                <path
                  d="M87 12C88 9 91 7.5 93.5 8.5"
                  stroke="var(--icon-sut-cikolatasi)"
                  strokeOpacity="0.65"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <circle cx="63" cy="18" r="2" fill="var(--icon-karamel)" fillOpacity="0.85" />
                <circle cx="117" cy="18" r="2" fill="#4F6A1A" fillOpacity="0.72" />
              </>
            )}

            {variant === 'yuva-lezzet' && (
              <>
                <path
                  d="M20 17C38 22 54 12 72 17"
                  stroke="var(--icon-sut-cikolatasi)"
                  strokeOpacity="0.45"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
                <path
                  d="M108 17C126 12 142 22 160 17"
                  stroke="var(--icon-sut-cikolatasi)"
                  strokeOpacity="0.45"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
                <rect
                  x="79"
                  y="14"
                  width="8.5"
                  height="3.2"
                  rx="1.6"
                  transform="rotate(-16 83 15.6)"
                  fill="var(--icon-karamel)"
                />
                <circle cx="91.5" cy="15.5" r="2.3" fill="var(--icon-cilek)" fillOpacity="0.82" />
                <rect
                  x="96"
                  y="14.2"
                  width="8"
                  height="3.2"
                  rx="1.6"
                  transform="rotate(18 100 15.8)"
                  fill="var(--icon-kakao)"
                  fillOpacity="0.75"
                />
              </>
            )}

            {variant === 'lezzet-konum' && (
              <>
                <path
                  d="M22 17C40 12 56 22 74 17"
                  stroke="var(--icon-karamel)"
                  strokeOpacity="0.48"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
                <path
                  d="M106 17C124 22 140 12 158 17"
                  stroke="var(--icon-karamel)"
                  strokeOpacity="0.48"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
                <circle cx="82" cy="16" r="2.2" fill="#4F6A1A" fillOpacity="0.76" />
                <circle cx="90" cy="14.5" r="2.6" fill="var(--icon-cilek)" fillOpacity="0.78" />
                <circle cx="98" cy="16" r="2.2" fill="var(--icon-karamel)" fillOpacity="0.85" />
              </>
            )}
          </svg>
        </div>
      </div>
    );
  }
);
PastrySectionWave.displayName = 'PastrySectionWave';
