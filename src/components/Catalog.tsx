import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  Variants,
} from 'motion/react';
import { ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  CATEGORIES,
  PRODUCTS,
  Product,
  ProductCategory,
  PRODUCT_IMAGE_FALLBACKS,
  PRODUCT_THEME_STYLES,
} from '../data/products';
import { siteConfig } from '../config/site';
import { ProductPlaceholder } from './ProductPlaceholder';
import { CategoryTabs } from './catalog/CategoryTabs';
import { SauceTransition } from './catalog/SauceTransition';
import { ProductDetailPanel, formatPriceTRY } from './catalog/ProductDetailPanel';
import { SAUCE_TIMINGS } from './catalog/theme';
import {
  REVEAL_STAGGER_DELAY,
  SECTION_VIEWPORT,
  getSectionContainerVariants,
  getRevealItemVariants,
} from '../utils/motion';
import { isValidProductCategory } from '../utils/security';

const DROPLET_OVERSHOOT_EASE: [number, number, number, number] = [0.34, 1.32, 0.64, 1];
const HOVER_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const DEFAULT_CATALOG_BG = '#FAF6F0';

interface ProductCardProps {
  product: Product;
  variants: Variants;
  canHover: boolean;
  isTouchPreviewed: boolean;
  isExpanded: boolean;
  prefersReducedMotion: boolean;
  onCardClick: (product: Product, triggerEl: HTMLButtonElement) => void;
  onHoverChange: (product: Product | null) => void;
}

const ProductCard: React.FC<ProductCardProps> = React.memo(
  ({
    product,
    variants,
    canHover,
    isTouchPreviewed,
    isExpanded,
    prefersReducedMotion,
    onCardClick,
    onHoverChange,
  }) => {
    const [imgSrc, setImgSrc] = useState<string | undefined>(product.image);
    const [imgError, setImgError] = useState<boolean>(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Sıfır re-render ile GPU tabanlı mikro-parallax ve yumuşak yakınlaştırma
    const rawX = useMotionValue(0);
    const rawY = useMotionValue(0);
    const rawImgScale = useMotionValue(1);

    const springConfig = { stiffness: 220, damping: 24, mass: 0.45 };
    const imgX = useSpring(rawX, springConfig);
    const imgY = useSpring(rawY, springConfig);
    const imgScale = useSpring(rawImgScale, { stiffness: 200, damping: 24, mass: 0.5 });

    const enableDesktopMotion = canHover && !prefersReducedMotion;
    const themeStyle = PRODUCT_THEME_STYLES[product.flavorTheme];

    const handlePointerEnter = useCallback(() => {
      if (canHover) {
        onHoverChange(product);
      }
      if (!enableDesktopMotion) return;
      rawImgScale.set(1.08);
    }, [canHover, enableDesktopMotion, onHoverChange, product, rawImgScale]);

    const handlePointerMove = useCallback(
      (e: React.PointerEvent<HTMLButtonElement>) => {
        if (!enableDesktopMotion || e.pointerType === 'touch' || !buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        rawX.set(-nx * 6);
        rawY.set(-ny * 5);
      },
      [enableDesktopMotion, rawX, rawY]
    );

    const handlePointerLeave = useCallback(() => {
      if (canHover) {
        onHoverChange(null);
      }
      rawX.set(0);
      rawY.set(0);
      rawImgScale.set(1);
    }, [canHover, onHoverChange, rawX, rawY, rawImgScale]);

    const handleImageError = useCallback(() => {
      if (imgSrc && PRODUCT_IMAGE_FALLBACKS[imgSrc] && imgSrc !== PRODUCT_IMAGE_FALLBACKS[imgSrc]) {
        setImgSrc(PRODUCT_IMAGE_FALLBACKS[imgSrc]);
      } else {
        setImgError(true);
      }
    }, [imgSrc]);

    const handleClick = useCallback(() => {
      if (buttonRef.current) {
        onCardClick(product, buttonRef.current);
      }
    }, [onCardClick, product]);

    const portionOrWeightText = useMemo(() => {
      if (product.portions && product.portions.length > 0) {
        return `${product.portions.join(' · ')} Kişilik`;
      }
      return product.weight ?? product.priceUnit ?? 'Porsiyon';
    }, [product.portions, product.weight, product.priceUnit]);

    const startingPriceLabel = useMemo(() => {
      if (product.priceByPortion && product.portions?.length) {
        const minPrice = product.priceByPortion[product.portions[0]];
        return `${formatPriceTRY(minPrice)}'den`;
      }
      if (typeof product.price === 'number') {
        return formatPriceTRY(product.price);
      }
      return null;
    }, [product.price, product.priceByPortion, product.portions]);

    const showTouchOverlay = !canHover && isTouchPreviewed;

    return (
      <motion.div
        variants={variants}
        className="shrink-0 w-[248px] min-[400px]:w-[266px] sm:w-[276px] lg:w-[288px] snap-start flex"
      >
        <motion.button
          ref={buttonRef}
          type="button"
          onClick={handleClick}
          onPointerEnter={handlePointerEnter}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          onFocus={() => {
            if (canHover) onHoverChange(product);
          }}
          onBlur={() => {
            if (canHover) onHoverChange(null);
          }}
          whileHover={
            enableDesktopMotion
              ? { scale: 1.03, y: -4, transition: { duration: 0.2, ease: HOVER_EASE } }
              : undefined
          }
          whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
          aria-expanded={isExpanded}
          aria-label={`${product.name}, ${portionOrWeightText}${
            startingPriceLabel ? `, ${startingPriceLabel}` : ''
          }. Detaylar, içerik ve alerjen bilgisi için tıklayın`}
          className={`group w-full h-full flex flex-col text-left rounded-[24px] bg-[#FFFDF9] overflow-hidden cursor-pointer transition-shadow duration-200 border ${
            isExpanded
              ? 'border-[#3E2723]/45 ring-2 ring-[#4F6A1A]/35 shadow-warm-lg'
              : 'border-[#3E2723]/10 shadow-warm hover:shadow-warm-lg hover:border-[#3E2723]/22'
          }`}
        >
          {/* Kare ürün görseli: aspect-ratio 1/1, mikro-parallax + hover/dokunma açıklama & porsiyon katmanı */}
          <div className="relative w-full aspect-square overflow-hidden bg-[#F3ECE1] shrink-0">
            <motion.div
              style={
                enableDesktopMotion
                  ? { x: imgX, y: imgY, scale: imgScale }
                  : isTouchPreviewed && !prefersReducedMotion
                  ? { scale: 1.05 }
                  : undefined
              }
              transition={{ duration: 0.25, ease: HOVER_EASE }}
              className="w-full h-full will-change-transform"
            >
              {imgSrc && !imgError ? (
                <img
                  src={imgSrc}
                  alt={product.name}
                  width={300}
                  height={300}
                  loading="lazy"
                  decoding="async"
                  onError={handleImageError}
                  className="w-full h-full object-cover object-[center_55%]"
                />
              ) : (
                <ProductPlaceholder
                  category={product.category}
                  name={product.name}
                />
              )}
            </motion.div>

            {/* Masaüstü Hover / Klavye Odak Veya Mobil İlk Dokunuş Katmanı (Açıklama + Porsiyon + İpucu) */}
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-[#261612]/94 via-[#3E2723]/68 to-transparent transition-opacity duration-200 ease-out ${
                canHover
                  ? 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
                  : showTouchOverlay
                  ? 'opacity-100'
                  : 'opacity-0'
              }`}
            >
              <div
                className={`transition-transform duration-200 ease-out ${
                  canHover
                    ? 'translate-y-2 group-hover:translate-y-0 group-focus-visible:translate-y-0'
                    : showTouchOverlay
                    ? 'translate-y-0'
                    : 'translate-y-2'
                }`}
              >
                <span className="inline-block text-[11px] font-semibold tracking-wide text-[#E7D8B9] mb-1">
                  {portionOrWeightText}
                </span>
                <p className="text-xs text-[#FAF6F0]/95 leading-relaxed line-clamp-3">
                  {product.description}
                </p>
                <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#C5DC8C]">
                  <span>
                    {canHover
                      ? isExpanded
                        ? 'Panel Açık'
                        : 'İçerik ve Detayları Aç'
                      : 'Detaylar için tekrar dokunun'}
                  </span>
                  <span>→</span>
                </span>
              </div>
            </div>

            {/* Dokunmatik / Mobil Cihazlar için İlk Dokunuş Öncesi İpucu */}
            {!canHover && !showTouchOverlay && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFFDF9]/92 backdrop-blur-xs text-[#3E2723] text-[11px] font-semibold shadow-xs border border-[#3E2723]/10"
              >
                <ZoomIn className="w-3 h-3 text-[#4F6A1A]" />
                <span>Önizle</span>
              </span>
            )}
          </div>

          {/* Kart Alt İçeriği: Temiz Porsiyon/Gramaj + İsim + Fiyat + Detay Aksiyonu */}
          <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
            <div>
              <div className="flex items-center justify-between gap-2 text-xs font-semibold mb-1.5">
                <span style={{ color: themeStyle.accentColor }}>
                  {portionOrWeightText}
                </span>
                {startingPriceLabel && (
                  <span className="text-[#3E2723] font-bold tabular-nums whitespace-nowrap">
                    {startingPriceLabel}
                  </span>
                )}
              </div>

              <h3 className="font-serif-display font-bold text-base sm:text-lg text-[#3E2723] leading-snug group-hover:text-[#4F6A1A] transition-colors">
                {product.name}
              </h3>

              <p className="mt-1.5 text-xs sm:text-sm text-[#5D4037] leading-relaxed line-clamp-2">
                {product.description}
              </p>
            </div>

            <div className="pt-2.5 border-t border-[#3E2723]/8 flex items-center justify-between text-xs font-semibold text-[#3E2723]">
              <span>
                {isExpanded ? 'Detay Paneli Açık' : 'İçerik, Fiyat & Alerjen'}
              </span>
              <span
                aria-hidden="true"
                className="text-[#4F6A1A] group-hover:translate-x-0.5 transition-transform"
              >
                {isExpanded ? '↓' : '→'}
              </span>
            </div>
          </div>
        </motion.button>
      </motion.div>
    );
  }
);
ProductCard.displayName = 'ProductCard';

export const Catalog: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ProductCategory>('yas-pasta');
  const [displayedTab, setDisplayedTab] = useState<ProductCategory>('yas-pasta');
  const [hasTabSwitched, setHasTabSwitched] = useState<boolean>(false);
  const [hoveredProduct, setHoveredProduct] = useState<Product | null>(null);
  const [previewedProduct, setPreviewedProduct] = useState<Product | null>(null);
  const [expandedProduct, setExpandedProduct] = useState<Product | null>(null);
  const [canHover, setCanHover] = useState<boolean>(false);
  const [scrollState, setScrollState] = useState<{ canLeft: boolean; canRight: boolean }>({
    canLeft: false,
    canRight: true,
  });

  const prefersReducedMotion = Boolean(useReducedMotion());
  const trackRef = useRef<HTMLDivElement>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);

  const handleSelectTab = useCallback((nextCategory: ProductCategory) => {
    setActiveTab((prev) => (prev === nextCategory ? prev : nextCategory));
  }, []);

  const handleCommitCategory = useCallback((committedCategory: ProductCategory) => {
    setHasTabSwitched(true);
    setDisplayedTab(committedCategory);
    setHoveredProduct(null);
    setPreviewedProduct(null);
    setExpandedProduct(null);
    if (trackRef.current) {
      trackRef.current.scrollLeft = 0;
    }
  }, []);

  // İnce imleç (hover: hover) algılaması — dokunmatik cihazlarda iki aşamalı dokunma akışı
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    setCanHover(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setCanHover(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Footer hızlı kategori bağlantıları için doğrulamalı event dinleyicisi
  useEffect(() => {
    const handleSelectCategory = (e: Event) => {
      const customEvent = e as CustomEvent<unknown>;
      if (isValidProductCategory(customEvent.detail)) {
        handleSelectTab(customEvent.detail);
      }
    };
    window.addEventListener('select-catalog-category', handleSelectCategory);
    return () => window.removeEventListener('select-catalog-category', handleSelectCategory);
  }, [handleSelectTab]);

  // Onaysız ürünler yalnızca yapılandırma bayrağı ile kontrol edilir; URL parametresi ile aşılamaz
  const showUnverified = siteConfig.SHOW_UNVERIFIED;

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter(
      (p) => p.category === displayedTab && (p.verified || showUnverified)
    );
  }, [displayedTab, showUnverified]);

  const activeCategoryMeta = useMemo(
    () => CATEGORIES.find((c) => c.id === activeTab) ?? CATEGORIES[0],
    [activeTab]
  );

  // Yatay kaydırma ok durumunu izle
  const updateTrackScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const canLeft = el.scrollLeft > 8;
    const canRight = el.scrollLeft + el.clientWidth < el.scrollWidth - 8;
    setScrollState((prev) =>
      prev.canLeft === canLeft && prev.canRight === canRight ? prev : { canLeft, canRight }
    );
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const rafId = window.requestAnimationFrame(updateTrackScrollState);
    el.addEventListener('scroll', updateTrackScrollState, { passive: true });
    window.addEventListener('resize', updateTrackScrollState, { passive: true });
    return () => {
      window.cancelAnimationFrame(rafId);
      el.removeEventListener('scroll', updateTrackScrollState);
      window.removeEventListener('resize', updateTrackScrollState);
    };
  }, [filteredProducts.length, updateTrackScrollState]);

  const scrollTrackBy = useCallback(
    (direction: -1 | 1) => {
      const el = trackRef.current;
      if (!el) return;
      const step = Math.max(280, Math.round(el.clientWidth * 0.72));
      el.scrollBy({
        left: direction * step,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    },
    [prefersReducedMotion]
  );

  // Masaüstü: tek tıkla altta detay paneli aç/kapat. Mobil: 1. dokunuş önizleme + tema, 2. dokunuş detay paneli.
  const handleCardClick = useCallback(
    (product: Product, triggerEl: HTMLButtonElement) => {
      lastTriggerRef.current = triggerEl;

      if (!canHover) {
        if (previewedProduct?.id !== product.id) {
          setPreviewedProduct(product);
          return;
        }
        setExpandedProduct((prev) => (prev?.id === product.id ? null : product));
        return;
      }

      setExpandedProduct((prev) => (prev?.id === product.id ? null : product));
    },
    [canHover, previewedProduct]
  );

  const handleClosePanel = useCallback(() => {
    setExpandedProduct(null);
    window.setTimeout(() => {
      lastTriggerRef.current?.focus();
    }, 20);
  }, []);

  // Ürünün lezzet temasına göre dinamik katalog arka plan rengi (hovered -> expanded -> previewed -> baseline)
  const themeDriverProduct = hoveredProduct ?? expandedProduct ?? previewedProduct;
  const activeBackdropBg = themeDriverProduct
    ? PRODUCT_THEME_STYLES[themeDriverProduct.flavorTheme].sectionBg
    : DEFAULT_CATALOG_BG;

  const sectionVariants = useMemo(
    () => getSectionContainerVariants(prefersReducedMotion, REVEAL_STAGGER_DELAY, 0.02),
    [prefersReducedMotion]
  );
  const headerBlockVariants = useMemo(
    () => getSectionContainerVariants(prefersReducedMotion, REVEAL_STAGGER_DELAY, 0.01),
    [prefersReducedMotion]
  );
  const itemVariants = useMemo(
    () => getRevealItemVariants(prefersReducedMotion),
    [prefersReducedMotion]
  );

  const horizontalTrackVariants = useMemo<Variants>(() => {
    if (prefersReducedMotion) {
      return {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { duration: SAUCE_TIMINGS.reducedFadeMs / 1000 },
        },
      };
    }
    return {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: SAUCE_TIMINGS.cardStaggerSec,
          delayChildren: 0.04,
        },
      },
    };
  }, [prefersReducedMotion]);

  const switchCardVariants = useMemo<Variants>(() => {
    if (prefersReducedMotion) {
      return {
        hidden: { opacity: 0, y: 0, scale: 1 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: SAUCE_TIMINGS.reducedFadeMs / 1000 },
        },
      };
    }
    return {
      hidden: { opacity: 0, y: -16, scale: 0.96 },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          duration: SAUCE_TIMINGS.cardDropSec,
          ease: DROPLET_OVERSHOOT_EASE,
        },
      },
    };
  }, [prefersReducedMotion]);

  return (
    <motion.section
      id="lezzetlerimiz"
      initial="hidden"
      whileInView="visible"
      viewport={SECTION_VIEWPORT}
      variants={sectionVariants}
      style={{
        backgroundColor: activeBackdropBg,
        transition: prefersReducedMotion
          ? 'none'
          : 'background-color 360ms cubic-bezier(0.22, 1, 0.36, 1)',
      }}
      className="scroll-mt-24 py-16 sm:py-20"
    >
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Bölüm Başlığı (60ms staggerChildren: Kicker -> H2 -> Subtitle) */}
        <motion.div
          variants={headerBlockVariants}
          className="text-center max-w-2xl mx-auto mb-8"
        >
          <motion.div
            variants={itemVariants}
            className="text-xs sm:text-sm font-semibold tracking-wide text-[#4F6A1A] mb-2"
          >
            Günlük Taze Vitrinimiz
          </motion.div>
          <motion.h2
            variants={itemVariants}
            className="font-serif-display font-bold text-2xl sm:text-4xl text-[#3E2723] tracking-tight"
            style={{ textWrap: 'balance' }}
          >
            Lezzetlerimiz
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="mt-3 text-sm sm:text-base text-[#5D4037]"
          >
            {activeCategoryMeta.subtitle}
          </motion.p>
        </motion.div>

        {/* Memoize Kategori Sekme Çubuğu */}
        <CategoryTabs
          categories={CATEGORIES}
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          prefersReducedMotion={prefersReducedMotion}
        />

        {/* Yatay Vitrin Kaydırma Kontrolleri */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <p className="text-xs font-medium text-[#5D4037]">
            {themeDriverProduct ? (
              <span>
                Vitrin Teması:{' '}
                <strong className="font-semibold text-[#3E2723]">
                  {PRODUCT_THEME_STYLES[themeDriverProduct.flavorTheme].label}
                </strong>
              </span>
            ) : (
              <span>
                {canHover
                  ? 'İncelemek için ürün üzerine gelin, detaylar için tıklayın'
                  : 'Önizlemek için karta dokunun, detaylar için tekrar dokunun'}
              </span>
            )}
          </p>

          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => scrollTrackBy(-1)}
              disabled={!scrollState.canLeft}
              aria-label="Yatay ürün listesini sola kaydır"
              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#FFFDF9] border border-[#3E2723]/14 text-[#3E2723] shadow-xs hover:bg-[#F3ECE1] disabled:opacity-35 disabled:cursor-not-allowed active:scale-95 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scrollTrackBy(1)}
              disabled={!scrollState.canRight}
              aria-label="Yatay ürün listesini sağa kaydır"
              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#FFFDF9] border border-[#3E2723]/14 text-[#3E2723] shadow-xs hover:bg-[#F3ECE1] disabled:opacity-35 disabled:cursor-not-allowed active:scale-95 transition-all cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Sekme Paneli, rAF Sos Geçiş Katmanı ve Yatay Sıralı Ürün Rafı */}
        <div
          id={`tabpanel-${displayedTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          tabIndex={0}
          className="focus:outline-none"
        >
          <SauceTransition
            targetCategory={activeTab}
            onCommitCategory={handleCommitCategory}
            prefersReducedMotion={prefersReducedMotion}
          >
            <motion.div
              ref={trackRef}
              key={displayedTab}
              initial="hidden"
              animate={hasTabSwitched ? 'visible' : undefined}
              whileInView={hasTabSwitched ? undefined : 'visible'}
              viewport={{ once: true, amount: 'some', margin: '0px 0px -24px 0px' }}
              variants={horizontalTrackVariants}
              className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth py-3 px-1 [scrollbar-width:thin] [scrollbar-color:rgba(62,39,35,0.22)_transparent]"
            >
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variants={hasTabSwitched ? switchCardVariants : itemVariants}
                  canHover={canHover}
                  isTouchPreviewed={previewedProduct?.id === product.id}
                  isExpanded={expandedProduct?.id === product.id}
                  prefersReducedMotion={prefersReducedMotion}
                  onCardClick={handleCardClick}
                  onHoverChange={setHoveredProduct}
                />
              ))}
            </motion.div>
          </SauceTransition>
        </div>

        {/* Yatay Sıranın Altında Genişleyen Detay Paneli (İçerik, Fiyat & Alerjenler) */}
        <ProductDetailPanel
          product={expandedProduct}
          products={filteredProducts}
          onSelectProduct={setExpandedProduct}
          onClose={handleClosePanel}
          prefersReducedMotion={prefersReducedMotion}
        />

        {/* Temsili Görsel ve Bilgilendirme Notu */}
        <motion.p
          variants={itemVariants}
          className="mt-8 text-center text-xs sm:text-sm text-[#5D4037]"
        >
          Görseller ve belirtilen fiyatlar temsilidir. Güncel vitrin stoğu ve özel siparişler için
          ürün detay panelinden WhatsApp üzerinden bize ulaşabilirsiniz.
        </motion.p>
      </div>
    </motion.section>
  );
};

