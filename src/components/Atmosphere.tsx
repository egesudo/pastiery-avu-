import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import { Volume2, VolumeX, Maximize, Play, Pause } from 'lucide-react';
import { siteConfig } from '../config/site';
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
  const [interiorImgSrc, setInteriorImgSrc] = useState<string>(
    siteConfig.assets.interiorImage
  );
  const [interiorImgFailed, setInteriorImgFailed] = useState<boolean>(false);

  // Scroll tabanlı sinematik vitrin yakınlaştırma ve sonraki bölüme (Konum) akıcı zoom-out geçişi
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
    prefersReducedMotion ? [1, 1, 1] : [0.98, 1.15, 1.02]
  );
  const vitrineParallaxY = useTransform(
    smoothScroll,
    [0, 0.5, 1],
    prefersReducedMotion ? [0, 0, 0] : [18, 0, -14]
  );
  const videoParallaxY = useTransform(
    smoothScroll,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [14, -12]
  );
  const sectionBlendOpacity = useTransform(
    smoothScroll,
    [0, 0.14, 0.86, 1],
    prefersReducedMotion ? [1, 1, 1, 1] : [0.9, 1, 1, 0.9]
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
      className="scroll-mt-24 py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      {/* Bölüm Başlığı (60ms staggerChildren: Kicker -> H2 -> Paragraph) */}
      <motion.div variants={headerBlockVariants} className="max-w-2xl mb-10">
        <motion.div
          variants={itemVariants}
          className="text-xs sm:text-sm font-semibold tracking-wide text-[#4F6A1A] mb-2"
        >
          Halkalı Merkez Mağazamız
        </motion.div>
        <motion.h2
          variants={itemVariants}
          className="font-serif-display font-bold text-2xl sm:text-4xl text-[#3E2723] tracking-tight"
          style={{ textWrap: 'balance' }}
        >
          Mağaza Atmosferimiz
        </motion.h2>
        <motion.p
          variants={itemVariants}
          className="mt-3 text-sm sm:text-base text-[#5D4037] leading-relaxed"
        >
          Zengin vitrin çeşitliliğimizi ve ferah mağaza ortamımızı yakından keşfedin.
        </motion.p>
      </motion.div>

      {/* Masaüstünde 2 Kolon Sinematik Düzen: Solda 16:9 Video, Sağda İç Mekân Fotoğrafı (≤380px, 3:4) + Hikâye */}
      <motion.div style={{ opacity: sectionBlendOpacity }}>
        <motion.div
          variants={sectionVariants}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start"
        >
        {/* Sol Kolon: Yatay 16:9 Video Kartı (hafif scroll parallax) */}
        <motion.div
          variants={itemVariants}
          style={{ y: videoParallaxY }}
          className="lg:col-span-7 w-full"
        >
          <div
            ref={videoContainerRef}
            className="relative w-full aspect-video rounded-[24px] overflow-hidden bg-[#3E2723] shadow-warm-lg border border-[#3E2723]/12 hover-video-zoom"
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

            {/* Alt kontrol şeridi için kontrast katmanı */}
            <div
              className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#3E2723]/80 via-[#3E2723]/30 to-transparent pointer-events-none"
              aria-hidden="true"
            />

            {/* prefers-reduced-motion veya duraklatılmış durumda merkez Oynat butonu */}
            {!isPlaying && (
              <button
                type="button"
                onClick={togglePlay}
                aria-label="Mağaza videosunu oynat"
                className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-[#FFFDF9]/95 text-[#3E2723] shadow-warm-lg flex items-center justify-center hover:bg-white active:scale-95 transition-all cursor-pointer"
              >
                <Play className="w-7 h-7 ml-0.5 fill-current" aria-hidden="true" />
              </button>
            )}

            {/* Video Kontrolleri: Oynat/Duraklat, Ses Aç/Kapat (aria-pressed), Tam Ekran */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={isPlaying ? 'Videoyu duraklat' : 'Videoyu oynat'}
                  className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#FFFDF9]/90 backdrop-blur-md text-[#3E2723] hover:bg-white active:scale-95 transition-all cursor-pointer shadow-xs"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Play className="w-4 h-4 ml-0.5" aria-hidden="true" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={toggleMute}
                  aria-pressed={!isMuted}
                  aria-label={isMuted ? 'Video sesini aç' : 'Video sesini kapat'}
                  className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-full bg-[#FFFDF9]/90 backdrop-blur-md text-[#3E2723] text-xs font-semibold hover:bg-white active:scale-95 transition-all cursor-pointer shadow-xs"
                >
                  {isMuted ? (
                    <>
                      <VolumeX className="w-4 h-4 text-[#B23A48]" aria-hidden="true" />
                      <span>Sesi Aç</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 text-[#4F6A1A]" aria-hidden="true" />
                      <span>Ses Açık</span>
                    </>
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={handleFullscreen}
                aria-label="Videoyu tam ekran görüntüle"
                className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#FFFDF9]/90 backdrop-blur-md text-[#3E2723] hover:bg-white active:scale-95 transition-all cursor-pointer shadow-xs"
              >
                <Maximize className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
          <p className="mt-2.5 text-xs text-[#5D4037]/80">
            Görseller temsilidir. Mağaza içi vitrin görünümü.
          </p>
        </motion.div>

        {/* Sağ Yan Panel: interior.webp (scroll-driven sinematik zoom-in -> zoom-out + parallax) + Hikâye */}
        <motion.div
          id="hakkimizda"
          variants={storyVariants}
          className="lg:col-span-5 scroll-mt-24 rounded-[24px] bg-[#FFFDF9] border border-[#3E2723]/10 shadow-warm p-6 sm:p-7 flex flex-col items-center lg:items-start"
        >
          {/* Dikey İç Mekân Fotoğrafı: En fazla ~380 css px genişlikte ve 3:4 oranında */}
          <motion.div
            variants={itemVariants}
            className="w-full max-w-[360px] aspect-[3/4] rounded-[20px] overflow-hidden bg-[#F3ECE1] border border-[#3E2723]/10 shadow-xs mb-6 mx-auto"
          >
            {!interiorImgFailed ? (
              <motion.div
                style={{ scale: vitrineScale, y: vitrineParallaxY }}
                className="w-full h-full will-change-transform"
              >
                <img
                  src={interiorImgSrc}
                  alt="Pasta ve baklava vitrinleriyle aydınlık mağaza içi"
                  width={380}
                  height={507}
                  loading="lazy"
                  decoding="async"
                  onError={handleInteriorImgError}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ) : (
              <div className="w-full h-full flex items-center justify-center p-6 text-center text-sm text-[#5D4037]">
                Pasta ve baklava vitrinleriyle aydınlık mağaza içi
              </div>
            )}
          </motion.div>

          {/* Hikâye Metni: Kicker -> H3 -> Paragraf 1 -> Paragraf 2 (60ms staggerChildren) */}
          <motion.div variants={storyVariants} className="text-left w-full">
            <motion.div
              variants={itemVariants}
              className="text-xs font-semibold tracking-wide text-[#4F6A1A] mb-1.5"
            >
              Hakkımızda
            </motion.div>
            <motion.h3
              variants={itemVariants}
              className="font-serif-display font-bold text-xl sm:text-2xl text-[#3E2723] leading-snug mb-3"
            >
              Sıcak Bir Mola, Taze Bir Başlangıç
            </motion.h3>
            <motion.p
              variants={itemVariants}
              className="text-sm sm:text-base text-[#5D4037] leading-relaxed mb-3"
            >
              Gaziantepli Çavuşoğulları Pastaneleri olarak Halkalı Merkez&apos;deki
              şubemizde, günlük üretim hijyenine ve tazeliğe özen göstererek tezgâhımızı
              her gün yeniliyoruz.
            </motion.p>
            <motion.p
              variants={itemVariants}
              className="text-sm sm:text-base text-[#5D4037] leading-relaxed"
            >
              Yaş pastalardan farklı aromalardaki ekler çeşitlerine, çay saatlerine eşlik
              eden kuru pastalardan sütlü tatlılara kadar geniş vitrin çeşitliliğimizle
              misafirlerimizi samimi bir ortamda ağırlıyoruz.
            </motion.p>
          </motion.div>
        </motion.div>
      </motion.div>
      </motion.div>
    </motion.section>
  );
};
