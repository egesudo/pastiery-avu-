import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import { Icon } from './ui/IconRegistry';
import { ScallopDivider } from './icons/BakeryDividers';
import { siteConfig } from '../config/site';
import storefrontVectorImg from '../assets/images/storefront_flat_vector_1795875109263.jpg';
import interiorVectorImg from '../assets/images/interior_vitrine_flat_vector_1795875110322.jpg';
import {
  REVEAL_STAGGER_DELAY,
  SECTION_VIEWPORT,
  getSectionContainerVariants,
  getRevealItemVariants,
} from '../utils/motion';

export const Atmosphere: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  const [videoSrc, setVideoSrc] = useState<string>(siteConfig.assets.interiorVideo);
  const [posterSrc, setPosterSrc] = useState<string>(siteConfig.assets.interiorPoster);
  const [storefrontSrc, setStorefrontSrc] = useState<string>(siteConfig.assets.storefront);
  const [storefrontFailed, setStorefrontFailed] = useState<boolean>(false);
  const [interiorImgSrc, setInteriorImgSrc] = useState<string>(
    siteConfig.assets.interiorImage
  );
  const [interiorImgFailed, setInteriorImgFailed] = useState<boolean>(false);

  // Scroll tabanlı sinematik vitrin yakınlaştırma ve sonraki bölüme akıcı geçiş
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 26,
    mass: 0.55,
  });

  const vitrineScale = useTransform(
    smoothScroll,
    [0, 0.48, 1],
    prefersReducedMotion ? [1, 1, 1] : [0.98, 1.1, 1.01]
  );
  const vitrineParallaxY = useTransform(
    smoothScroll,
    [0, 0.5, 1],
    prefersReducedMotion ? [0, 0, 0] : [14, 0, -10]
  );
  const videoParallaxY = useTransform(
    smoothScroll,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [12, -10]
  );
  const sectionBlendOpacity = useTransform(
    smoothScroll,
    [0, 0.14, 0.86, 1],
    prefersReducedMotion ? [1, 1, 1, 1] : [0.92, 1, 1, 0.94]
  );

  const sectionVariants = useMemo(
    () => getSectionContainerVariants(prefersReducedMotion, REVEAL_STAGGER_DELAY, 0.02),
    [prefersReducedMotion]
  );
  const headerBlockVariants = useMemo(
    () => getSectionContainerVariants(prefersReducedMotion, REVEAL_STAGGER_DELAY, 0.01),
    [prefersReducedMotion]
  );
  const storyVariants = useMemo(
    () => getSectionContainerVariants(prefersReducedMotion, REVEAL_STAGGER_DELAY, 0.02),
    [prefersReducedMotion]
  );
  const itemVariants = useMemo(
    () => getRevealItemVariants(prefersReducedMotion),
    [prefersReducedMotion]
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
      if (e.matches && videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    };

    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  // Yalnızca görünür alandayken oynat, dışına çıkınca duraklat (IntersectionObserver)
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || reducedMotion) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoEl
              .play()
              .then(() => setIsPlaying(true))
              .catch(() => setIsPlaying(false));
          } else {
            videoEl.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.35 }
    );

    observer.observe(videoEl);
    return () => observer.disconnect();
  }, [reducedMotion, videoSrc]);

  const toggleMute = () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    const nextMuted = !isMuted;
    videoEl.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const togglePlay = () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    if (videoEl.paused) {
      videoEl
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      videoEl.pause();
      setIsPlaying(false);
    }
  };

  const handleFullscreen = () => {
    const videoEl = videoRef.current;
    const containerEl = videoContainerRef.current;
    if (!videoEl) return;

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else if (videoEl.requestFullscreen) {
      videoEl.requestFullscreen().catch(() => {});
    } else if (containerEl?.requestFullscreen) {
      containerEl.requestFullscreen().catch(() => {});
    }
  };

  const handleVideoError = () => {
    if (
      videoSrc === siteConfig.assets.interiorVideo &&
      siteConfig.assets.interiorVideoFallback
    ) {
      setVideoSrc(siteConfig.assets.interiorVideoFallback);
      setPosterSrc(siteConfig.assets.interiorPosterFallback);
    }
  };

  const handleStorefrontError = () => {
    if (
      storefrontSrc === siteConfig.assets.storefront &&
      siteConfig.assets.storefrontFallback
    ) {
      setStorefrontSrc(siteConfig.assets.storefrontFallback);
    } else {
      setStorefrontFailed(true);
    }
  };

  const handleInteriorImgError = () => {
    if (
      interiorImgSrc === siteConfig.assets.interiorImage &&
      siteConfig.assets.interiorImageFallback
    ) {
      setInteriorImgSrc(siteConfig.assets.interiorImageFallback);
    } else {
      setInteriorImgFailed(true);
    }
  };

  return (
    <motion.section
      ref={sectionRef}
      id="atmosfer"
      initial="hidden"
      whileInView="visible"
      viewport={SECTION_VIEWPORT}
      variants={sectionVariants}
      className="scroll-mt-24 bg-[#F4EDE2] pt-10 sm:pt-14 pb-16 sm:pb-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Bölüm Başlığı */}
        <motion.div variants={headerBlockVariants} className="max-w-2xl mb-10">
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold tracking-wide text-[#4F6A1A] mb-2"
          >
            <Icon name="store" size={16} className="text-[#4F6A1A]" />
            <span>Halkalı Merkez&apos;deki Sıcak Köşeniz</span>
          </motion.div>
          <motion.h2
            variants={itemVariants}
            className="font-serif-display font-bold text-2xl sm:text-4xl text-[#3E2723] tracking-tight"
            style={{ textWrap: 'balance' }}
          >
            Sıcak Yuva, Taze Tezgâh
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="mt-3 text-sm sm:text-base text-[#5D4037] leading-relaxed"
          >
            Kapımızdan adım attığınızda içinizi ısıtan fırın kokusu, güleryüzlü
            karşılama ve günlük taze tezgâhımızla kendinizi evinizde hissedin.
          </motion.p>
        </motion.div>

        {/* 2 Kolonlu Pastane Tuvali Düzeni */}
        <motion.div style={{ opacity: sectionBlendOpacity }}>
          <motion.div
            variants={sectionVariants}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch"
          >
            {/* Sol Kolon (7/12): Pastane Tente Çerçeveli Video + Mağaza Cephesi Tuvali */}
            <motion.div
              variants={itemVariants}
              style={{ y: videoParallaxY }}
              className="lg:col-span-7 flex flex-col gap-6"
            >
              {/* 1) Mağaza İçi Video Kartı — Pastane Tente Kapağı Tasarımı */}
              <div className="rounded-[24px] overflow-hidden bg-[#FFFDF9] border border-[#3E2723]/12 shadow-warm-lg">
                <div className="bg-[#F3ECE1] px-5 pt-3.5 pb-1.5 flex items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#3B2314]">
                    <Icon
                      name="play-dilim"
                      size={16}
                      variant="duotone"
                      className="text-[#3B2314]"
                    />
                    <span>Tezgâhtan Canlı Kesit</span>
                  </div>
                  <span className="text-[11px] font-medium text-[#5D4037]">
                    Halkalı Merkez
                  </span>
                </div>
                <ScallopDivider
                  fillColor="#F3ECE1"
                  strokeColor="rgba(59, 35, 20, 0.14)"
                  className="-mt-0.5 bg-[#3E2723]"
                />

                <div
                  ref={videoContainerRef}
                  className="relative w-full aspect-video overflow-hidden bg-[#3E2723] hover-video-zoom"
                >
                  <video
                    ref={videoRef}
                    src={videoSrc}
                    poster={posterSrc}
                    muted={isMuted}
                    loop
                    playsInline
                    preload="metadata"
                    onError={handleVideoError}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    aria-label="Gaziantepli Çavuşoğulları Pastaneleri mağaza içi vitrin videosu"
                    className="w-full h-full object-cover video-zoom-target"
                  />

                  <div
                    className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#3E2723]/80 via-[#3E2723]/30 to-transparent pointer-events-none"
                    aria-hidden="true"
                  />

                  {!isPlaying && (
                    <button
                      type="button"
                      onClick={togglePlay}
                      aria-label="Mağaza videosunu oynat"
                      className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-[#FFFDF9]/95 text-[#3B2314] shadow-warm-lg flex items-center justify-center hover:bg-white active:scale-95 transition-all cursor-pointer"
                    >
                      <Icon name="play-dilim" size={32} variant="solid" className="ml-0.5" />
                    </button>
                  )}

                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={togglePlay}
                        aria-label={isPlaying ? 'Videoyu duraklat' : 'Videoyu oynat'}
                        className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#FFFDF9]/92 backdrop-blur-md text-[#3E2723] hover:bg-white active:scale-95 transition-all cursor-pointer shadow-xs"
                      >
                        {isPlaying ? (
                          <Icon name="pause" size={16} />
                        ) : (
                          <Icon name="play" size={16} className="ml-0.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={toggleMute}
                        aria-pressed={!isMuted}
                        aria-label={isMuted ? 'Video sesini aç' : 'Video sesini kapat'}
                        className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-full bg-[#FFFDF9]/92 backdrop-blur-md text-[#3E2723] text-xs font-semibold hover:bg-white active:scale-95 transition-all cursor-pointer shadow-xs"
                      >
                        {isMuted ? (
                          <>
                            <Icon name="volume-off" size={16} className="text-[#B23A48]" />
                            <span>Sesi Aç</span>
                          </>
                        ) : (
                          <>
                            <Icon name="volume-on" size={16} className="text-[#4F6A1A]" />
                            <span>Ses Açık</span>
                          </>
                        )}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleFullscreen}
                      aria-label="Videoyu tam ekran görüntüle"
                      className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#FFFDF9]/92 backdrop-blur-md text-[#3E2723] hover:bg-white active:scale-95 transition-all cursor-pointer shadow-xs"
                    >
                      <Icon name="maximize" size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* 2) Mağaza Dış Cephesi Tuvali */}
              <div className="rounded-[24px] overflow-hidden bg-[#FFFDF9] border border-[#3E2723]/12 shadow-warm p-4 sm:p-5">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#3B2314] mb-3.5">
                  <Icon
                    name="pin-kiraz"
                    size={16}
                    variant="duotone"
                    className="text-[#3B2314]"
                  />
                  <span>Karadut Sokağı&apos;ndaki Sıcak Kapımız</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="aspect-video rounded-[16px] overflow-hidden bg-[#F3ECE1] border border-[#3E2723]/10">
                    <img
                      src={storefrontVectorImg}
                      alt="Gaziantepli Çavuşoğulları Pastaneleri dış cephesi"
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="aspect-video rounded-[16px] overflow-hidden bg-[#F3ECE1] border border-[#3E2723]/10">
                    {!storefrontFailed ? (
                      <img
                        src={storefrontSrc}
                        alt="Gaziantepli Çavuşoğulları Pastaneleri Halkalı Merkez mağaza dış görünümü"
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        onError={handleStorefrontError}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-4 text-center text-xs text-[#5D4037]">
                        Karadut Sokağı No:14, Halkalı Merkez
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Sağ Yan Panel (5/12): İç Mekân Tuvali + Ev Sıcaklığında Hikâyemiz */}
            <motion.div
              id="hakkimizda"
              variants={storyVariants}
              className="lg:col-span-5 scroll-mt-24 rounded-[24px] overflow-hidden bg-[#FFFDF9] border border-[#3E2723]/12 shadow-warm flex flex-col justify-between"
            >
              <div>
                <div className="bg-[#F3ECE1] px-6 pt-4 pb-1.5 flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#3B2314]">
                    <Icon
                      name="taze-gunluk"
                      size={16}
                      variant="duotone"
                      className="text-[#4F6A1A]"
                    />
                    <span>Pastanemizden Kareler</span>
                  </div>
                  <span className="text-[11px] font-medium text-[#5D4037]">
                    Her Gün Taze
                  </span>
                </div>
                <ScallopDivider
                  fillColor="#F3ECE1"
                  strokeColor="rgba(59, 35, 20, 0.14)"
                  className="-mt-0.5 mb-5"
                />

                <div className="px-6 sm:px-7">
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="aspect-[3/4] rounded-[16px] overflow-hidden bg-[#F3ECE1] border border-[#3E2723]/10 shadow-xs">
                      <img
                        src={interiorVectorImg}
                        alt="Gaziantepli Çavuşoğulları Pastaneleri iç mekân tezgâhı"
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="aspect-[3/4] rounded-[16px] overflow-hidden bg-[#F3ECE1] border border-[#3E2723]/10 shadow-xs">
                      {!interiorImgFailed ? (
                        <motion.div
                          style={{ scale: vitrineScale, y: vitrineParallaxY }}
                          className="w-full h-full will-change-transform"
                        >
                          <img
                            src={interiorImgSrc}
                            alt="Pasta ve baklava tezgâhlarıyla aydınlık mağaza içi"
                            width={380}
                            height={507}
                            loading="lazy"
                            decoding="async"
                            referrerPolicy="no-referrer"
                            onError={handleInteriorImgError}
                            className="w-full h-full object-cover"
                          />
                        </motion.div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center p-4 text-center text-xs text-[#5D4037]">
                          Pasta ve baklava tezgâhlarımız
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hikâye Metni */}
                  <motion.div variants={storyVariants} className="text-left w-full">
                    <motion.div
                      variants={itemVariants}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-[#4F6A1A] mb-1.5"
                    >
                      <Icon
                        name="usta-eli"
                        size={16}
                        variant="duotone"
                        className="text-[#4F6A1A]"
                      />
                      <span>Ailemizden Sofranıza</span>
                    </motion.div>
                    <motion.h3
                      variants={itemVariants}
                      className="font-serif-display font-bold text-xl sm:text-2xl text-[#3E2723] leading-snug mb-3"
                      style={{ textWrap: 'balance' }}
                    >
                      Evinizdeki Kadar Rahat, Fırından Yeni Çıkmış Gibi
                    </motion.h3>
                    <motion.p
                      variants={itemVariants}
                      className="text-sm sm:text-base text-[#5D4037] leading-relaxed mb-3"
                    >
                      Gaziantepli Çavuşoğulları Pastaneleri olarak Halkalı Merkez&apos;deki
                      mahalle yuvamızda, tezgâhımızı her sabah özenle ve ilk günkü
                      heyecanla hazırlıyoruz.
                    </motion.p>
                    <motion.p
                      variants={itemVariants}
                      className="text-sm sm:text-base text-[#5D4037] leading-relaxed"
                    >
                      İster sokak masalarımızda sıcacık bir çay eşliğinde soluklanın,
                      ister sevdiklerinize taze yaş pasta, ekler ve sütlü tatlılardan
                      götürün — kapımız size her zaman samimiyetle açık.
                    </motion.p>
                  </motion.div>
                </div>
              </div>

              {/* Hikâye Kartı Altı Hızlı Müşteri Yönlendirmeleri */}
              <div className="px-6 sm:px-7 pt-5 pb-6 mt-5 border-t border-[#3E2723]/8 flex flex-wrap items-center gap-3">
                <a
                  href="#lezzetlerimiz"
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-full bg-[#4F6A1A] text-white text-xs sm:text-sm font-semibold shadow-xs hover:bg-[#415815] active:scale-[0.96] transition-all whitespace-nowrap shrink-0"
                >
                  <Icon
                    name="yas-pasta"
                    size={16}
                    variant="duotone"
                    style={{ ['--icon-accent' as string]: 'var(--icon-vanilya)' }}
                  />
                  <span>Lezzetlere Göz Atın</span>
                  <Icon name="arrow-down-right" size={16} />
                </a>

                <a
                  href="#iletisim"
                  className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2.5 rounded-full bg-[#F3ECE1] text-[#3B2314] text-xs sm:text-sm font-semibold hover:bg-[#E7DDD0] active:scale-[0.96] transition-all whitespace-nowrap shrink-0"
                >
                  <Icon name="pin-kiraz" size={16} variant="duotone" />
                  <span>Bize Ulaşın</span>
                </a>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};
