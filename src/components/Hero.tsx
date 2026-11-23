import React, {
  Component,
  Suspense,
  useState,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import { ArrowDownRight, Store, MapPin } from 'lucide-react';
import { siteConfig, getStoreOpenStatus } from '../config/site';
import { HeroHeading } from './hero/HeroHeading';
import { BakerMascot } from './hero/BakerMascot';
import { CakePoster } from './hero/CakePoster';
import { resetSharedDripClock } from './hero/useDripClock';
import {
  HERO_CAKE_CONFIG,
  HERO_TIMINGS,
  detectCakeQualityTier,
} from './hero/heroConstants';
import {
  REVEAL_STAGGER_DELAY,
  SECTION_VIEWPORT,
  getSectionContainerVariants,
  getRevealItemVariants,
} from '../utils/motion';

const loadHeroCake3D = () => import('./hero/HeroCake3D');
const LazyHeroCake3D = React.lazy(loadHeroCake3D);

interface CakeErrorBoundaryProps {
  fallback: React.ReactNode;
  children: React.ReactNode;
}

interface CakeErrorBoundaryState {
  hasError: boolean;
}

class CakeErrorBoundary extends Component<
  CakeErrorBoundaryProps,
  CakeErrorBoundaryState
> {
  state: CakeErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): CakeErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export interface HeroProps {
  splashDone?: boolean;
}

export const Hero: React.FC<HeroProps> = ({ splashDone = true }) => {
  const prefersReducedMotion = Boolean(useReducedMotion());
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isTabHidden, setIsTabHidden] = useState<boolean>(() =>
    typeof document !== 'undefined' ? document.hidden : false
  );
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? window.innerWidth <= HERO_CAKE_CONFIG.qualityThresholds.mobileMaxWidthPx
      : false
  );
  const [canShow3D, setCanShow3D] = useState<boolean>(false);
  const [webglLost, setWebglLost] = useState<boolean>(false);

  const qualityInfo = useMemo(() => detectCakeQualityTier(), []);
  const openStatus = useMemo(() => getStoreOpenStatus(siteConfig.hours), []);

  // 3D chunk'ı splash sırasında arka planda önceden yükle
  useEffect(() => {
    void loadHeroCake3D();
  }, []);

  // Splash bittikten ve başlığın giriş animasyonu (~1.6 sn) tamamlandıktan sonra 3D pastayı sahneye getir
  // Aynı anda başlık ve pasta ortak saatini 0ms noktasına kilitle
  useEffect(() => {
    if (!splashDone) {
      setCanShow3D(false);
      return;
    }

    resetSharedDripClock();

    const delayMs = prefersReducedMotion
      ? 0
      : HERO_TIMINGS.cakeEntranceAfterHeadingMs;

    const timer = window.setTimeout(() => {
      setCanShow3D(true);
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [splashDone, prefersReducedMotion]);

  // Ekran boyutu ve sekme görünürlüğü dinleyicileri
  useEffect(() => {
    const onResize = () => {
      setIsMobile(
        window.innerWidth <= HERO_CAKE_CONFIG.qualityThresholds.mobileMaxWidthPx
      );
    };
    const onVisibility = () => {
      setIsTabHidden(document.hidden);
    };

    window.addEventListener('resize', onResize, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // IntersectionObserver ile Hero görünür değilken 3D render'ı durdur
  useEffect(() => {
    const el = stageRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Scroll tabanlı yumuşak parallax ve çıkış geçişi
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    mass: 0.5,
  });

  const textParallaxY = useTransform(
    smoothProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [0, -18]
  );
  const stageParallaxY = useTransform(
    smoothProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [0, 16]
  );
  const heroExitOpacity = useTransform(
    smoothProgress,
    [0.55, 1],
    prefersReducedMotion ? [1, 1] : [1, 0.88]
  );

  const sectionVariants = useMemo(
    () =>
      getSectionContainerVariants(
        prefersReducedMotion,
        REVEAL_STAGGER_DELAY,
        0.02
      ),
    [prefersReducedMotion]
  );
  const leftColumnVariants = useMemo(
    () =>
      getSectionContainerVariants(
        prefersReducedMotion,
        REVEAL_STAGGER_DELAY,
        0.02
      ),
    [prefersReducedMotion]
  );
  const itemVariants = useMemo(
    () => getRevealItemVariants(prefersReducedMotion),
    [prefersReducedMotion]
  );

  const posterFallback = (
    <div className="relative w-full flex flex-col items-center">
      <div className="relative w-full h-[290px] sm:h-[320px] lg:h-[min(70vh,560px)] rounded-[24px] overflow-hidden">
        <CakePoster isLoading={!canShow3D && qualityInfo.webglSupported} />
        <div className="pointer-events-none absolute bottom-3 left-3 sm:bottom-4 sm:left-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFDF9]/92 border border-[#3E2723]/10 text-[#3E2723] text-xs font-semibold shadow-warm">
          <MapPin
            className="w-3.5 h-3.5 text-[#B23A48] shrink-0"
            aria-hidden="true"
          />
          <span>{siteConfig.branchName}</span>
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
      {/* Masaüstü ve mobilde yükseklik sıçraması olmaması için aynı alt boşluk rezervi */}
      <div className="mt-2.5 h-[34px]" aria-hidden="true" />
    </div>
  );

  const shouldMount3D =
    canShow3D && qualityInfo.webglSupported && !webglLost;

  return (
    <motion.section
      ref={sectionRef}
      id="ana-sayfa"
      initial="hidden"
      whileInView="visible"
      viewport={SECTION_VIEWPORT}
      variants={sectionVariants}
      className="scroll-mt-24 pt-24 sm:pt-28 pb-12 sm:pb-16 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      <motion.div
        style={{ opacity: heroExitOpacity }}
        className="grid grid-cols-1 lg:grid-cols-[minmax(0,54fr)_minmax(0,46fr)] gap-y-5 lg:gap-y-0 lg:gap-x-12 items-start lg:items-center"
      >
        {/* Slot 1: Üst bilgi + H1 Başlık (Mobilde sıra 1; Masaüstü sol ~54% üst) */}
        <motion.div
          variants={leftColumnVariants}
          style={{ y: textParallaxY }}
          className="order-1 lg:col-start-1 lg:row-start-1 lg:self-end flex flex-col items-start text-left"
        >
          <HeroHeading splashDone={splashDone} />
        </motion.div>

        {/* Slot 2: Etkileşimli 3D Yaş Pasta Sahnesi (Mobilde H1 hemen altı; Masaüstü sağ ~46%) */}
        <motion.div
          ref={stageRef}
          variants={itemVariants}
          style={{ y: stageParallaxY }}
          className="order-2 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:self-center relative z-10 w-full"
        >
          {shouldMount3D ? (
            <CakeErrorBoundary fallback={posterFallback}>
              <Suspense fallback={posterFallback}>
                <LazyHeroCake3D
                  tier={qualityInfo.tier}
                  isMobile={isMobile}
                  isSoftwareGl={qualityInfo.isSoftwareGl}
                  prefersReducedMotion={prefersReducedMotion}
                  isVisible={isVisible}
                  isTabHidden={isTabHidden}
                  branchName={siteConfig.branchName}
                  openStatus={openStatus}
                  onWebglContextLost={() => setWebglLost(true)}
                />
              </Suspense>
            </CakeErrorBoundary>
          ) : (
            posterFallback
          )}
        </motion.div>

        {/* Slot 3: Alt metin + CTA butonları (Mobilde pasta altı; Masaüstü sol ~54% alt) */}
        <motion.div
          variants={leftColumnVariants}
          style={{ y: textParallaxY }}
          className="order-3 lg:col-start-1 lg:row-start-2 lg:self-start flex flex-col items-start text-left"
        >
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg text-[#5D4037] leading-relaxed max-w-xl mb-8"
          >
            Halkalı Merkez&apos;deki mağazamızda günlük hazırlanan yaş pastalar,
            özel dolgulu ekler ve eşsiz sütlü tatlılarla özel anlarınıza tat
            katıyoruz.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center gap-3.5 w-full sm:w-auto"
          >
            <a
              href="#lezzetlerimiz"
              className="inline-flex items-center justify-center gap-2 min-h-[48px] px-7 py-3.5 rounded-full bg-[#4F6A1A] text-white text-sm sm:text-base font-semibold shadow-warm hover:bg-[#415815] active:scale-95 transition-all whitespace-nowrap shrink-0"
            >
              <span>Menüyü Keşfet</span>
              <ArrowDownRight className="w-4 h-4" aria-hidden="true" />
            </a>

            <div className="relative inline-flex items-center mr-6 sm:mr-8">
              <a
                href="#atmosfer"
                className="group/store relative inline-flex items-center justify-center gap-2 min-h-[48px] pl-6 pr-11 sm:pl-7 sm:pr-12 py-3.5 rounded-full bg-[#FFFDF9] text-[#3E2723] border border-[#3E2723]/18 text-sm sm:text-base font-semibold shadow-xs hover:bg-[#F3ECE1] active:scale-95 transition-all whitespace-nowrap shrink-0"
              >
                <Store className="w-4 h-4 text-[#5D4037]" aria-hidden="true" />
                <span>Mağazamızı Görün</span>
                <BakerMascot className="pointer-events-none absolute -right-7 sm:-right-8 top-1/2 -translate-y-[52%] w-[54px] h-[62px] sm:w-[62px] sm:h-[70px] drop-shadow-[0_3px_6px_rgba(59,35,20,0.12)] transition-transform duration-300 group-hover/store:-translate-y-[56%] group-hover/store:rotate-3 motion-reduce:transition-none motion-reduce:group-hover/store:transform-none" />
              </a>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
};
