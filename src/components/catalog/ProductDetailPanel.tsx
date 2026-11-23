import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from 'motion/react';
import {
  X,
  MessageCircle,
  Info,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import {
  Product,
  CakePortion,
  PRODUCT_IMAGE_FALLBACKS,
  PRODUCT_THEME_STYLES,
} from '../../data/products';
import { buildWhatsAppUrl } from '../../config/site';
import { ProductPlaceholder } from '../ProductPlaceholder';

interface ProductDetailPanelProps {
  product: Product | null;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onClose: () => void;
  prefersReducedMotion: boolean;
}

const PANEL_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function formatPriceTRY(amount: number): string {
  return `${new Intl.NumberFormat('tr-TR').format(amount)} ₺`;
}

export const ProductDetailPanel: React.FC<ProductDetailPanelProps> = ({
  product,
  products,
  onSelectProduct,
  onClose,
  prefersReducedMotion,
}) => {
  const [selectedPortion, setSelectedPortion] = useState<CakePortion>('7-8');
  const [imgSrc, setImgSrc] = useState<string | undefined>(product?.image);
  const [imgError, setImgError] = useState<boolean>(false);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const imageFrameRef = useRef<HTMLDivElement>(null);

  const rawZoomScale = useMotionValue(1);
  const rawPanX = useMotionValue(0);
  const rawPanY = useMotionValue(0);

  const zoomScale = useSpring(rawZoomScale, { stiffness: 240, damping: 26, mass: 0.5 });
  const panX = useSpring(rawPanX, { stiffness: 210, damping: 24, mass: 0.45 });
  const panY = useSpring(rawPanY, { stiffness: 210, damping: 24, mass: 0.45 });

  useEffect(() => {
    if (product) {
      setSelectedPortion(product.portions?.[0] ?? '7-8');
      setImgSrc(product.image);
      setImgError(false);
      setIsZoomed(false);
      rawZoomScale.set(1);
      rawPanX.set(0);
      rawPanY.set(0);
    }
  }, [product, rawZoomScale, rawPanX, rawPanY]);

  useEffect(() => {
    rawZoomScale.set(isZoomed && !prefersReducedMotion ? 1.48 : isZoomed ? 1.32 : 1);
    if (!isZoomed) {
      rawPanX.set(0);
      rawPanY.set(0);
    }
  }, [isZoomed, prefersReducedMotion, rawZoomScale, rawPanX, rawPanY]);

  // Panel açıldığında yumuşakça görüş alanına getir ve Esc ile kapatmayı dinle
  useEffect(() => {
    if (!product) return;

    const scrollTimer = window.setTimeout(() => {
      panelRef.current?.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'nearest',
      });
    }, 80);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(scrollTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [product?.id, onClose, prefersReducedMotion]);

  const handleImageError = useCallback(() => {
    if (imgSrc && PRODUCT_IMAGE_FALLBACKS[imgSrc] && imgSrc !== PRODUCT_IMAGE_FALLBACKS[imgSrc]) {
      setImgSrc(PRODUCT_IMAGE_FALLBACKS[imgSrc]);
    } else {
      setImgError(true);
    }
  }, [imgSrc]);

  const toggleZoom = useCallback(() => {
    if (imgError || !imgSrc) return;
    setIsZoomed((prev) => !prev);
  }, [imgError, imgSrc]);

  const handleImagePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isZoomed || prefersReducedMotion || !imageFrameRef.current) return;
      const rect = imageFrameRef.current.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      rawPanX.set(-nx * 42);
      rawPanY.set(-ny * 42);
    },
    [isZoomed, prefersReducedMotion, rawPanX, rawPanY]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (!isZoomed || prefersReducedMotion || e.touches.length !== 1 || !imageFrameRef.current) {
        return;
      }
      const rect = imageFrameRef.current.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const nx = ((e.touches[0].clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.touches[0].clientY - rect.top) / rect.height - 0.5) * 2;
      rawPanX.set(Math.max(-44, Math.min(44, -nx * 40)));
      rawPanY.set(Math.max(-44, Math.min(44, -ny * 40)));
    },
    [isZoomed, prefersReducedMotion, rawPanX, rawPanY]
  );

  const handlePortionKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    portions: CakePortion[],
    currentPortionIdx: number
  ) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = portions[(currentPortionIdx + 1) % portions.length];
      setSelectedPortion(next);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = portions[(currentPortionIdx - 1 + portions.length) % portions.length];
      setSelectedPortion(prev);
    }
  };

  const currentIndex =
    product && products.length > 0
      ? products.findIndex((item) => item.id === product.id)
      : -1;

  const canStep = products.length > 1 && currentIndex >= 0;

  const handleStep = (delta: -1 | 1) => {
    if (!canStep) return;
    const nextIdx = (currentIndex + delta + products.length) % products.length;
    onSelectProduct(products[nextIdx]);
  };

  return (
    <AnimatePresence initial={false}>
      {product && (
        <motion.div
          key="product-detail-panel-shell"
          ref={panelRef}
          role="region"
          aria-labelledby="detail-panel-title"
          initial={
            prefersReducedMotion
              ? { opacity: 0 }
              : { opacity: 0, height: 0, y: -8 }
          }
          animate={
            prefersReducedMotion
              ? { opacity: 1 }
              : { opacity: 1, height: 'auto', y: 0 }
          }
          exit={
            prefersReducedMotion
              ? { opacity: 0 }
              : { opacity: 0, height: 0, y: -6 }
          }
          transition={{ duration: prefersReducedMotion ? 0.14 : 0.3, ease: PANEL_EASE }}
          className="overflow-hidden mt-6"
        >
          {(() => {
            const themeStyle = PRODUCT_THEME_STYLES[product.flavorTheme];
            const activePrice = product.priceByPortion
              ? product.priceByPortion[selectedPortion]
              : product.price ?? 0;

            const portionOrWeightText = product.portions?.length
              ? `${selectedPortion} Kişilik`
              : product.priceUnit || product.weight || 'Porsiyon';

            const whatsappMessage = `Merhaba, ${product.name} (${portionOrWeightText} - Temsili Fiyat: ${formatPriceTRY(
              activePrice
            )}) hakkında bilgi almak / sipariş vermek istiyorum.`;
            const whatsappUrl = buildWhatsAppUrl(whatsappMessage);

            return (
              <div
                style={{ backgroundColor: themeStyle.panelBg }}
                className="rounded-[24px] border border-[#3E2723]/12 shadow-warm-lg p-5 sm:p-7 lg:p-8 transition-colors duration-300"
              >
                {/* Üst Bar: Tema adı, ürün sırası ve kontroller */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-[#3E2723]/10">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#5D4037]">
                    <span style={{ color: themeStyle.accentColor }}>
                      {themeStyle.label}
                    </span>
                    {canStep && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">
                          {currentIndex + 1} / {products.length}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {canStep && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleStep(-1)}
                          aria-label="Önceki ürüne geç"
                          className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#F3ECE1] text-[#3E2723] hover:bg-[#E7DDD0] active:scale-95 transition-all cursor-pointer"
                        >
                          <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStep(1)}
                          aria-label="Sonraki ürüne geç"
                          className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#F3ECE1] text-[#3E2723] hover:bg-[#E7DDD0] active:scale-95 transition-all cursor-pointer"
                        >
                          <ChevronRight className="w-5 h-5" aria-hidden="true" />
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={onClose}
                      aria-label="Ürün detay panelini kapat"
                      className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#3E2723] text-[#FFFDF9] hover:bg-[#5D4037] active:scale-95 transition-all cursor-pointer"
                    >
                      <X className="w-5 h-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {/* 2 Kolon İçerik Düzeni */}
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={product.id}
                    initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
                    animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                    transition={{ duration: prefersReducedMotion ? 0.12 : 0.2, ease: PANEL_EASE }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start"
                  >
                    {/* Sol Kolon: Etkileşimli Yakınlaştırmalı Ürün Görseli */}
                    <div className="md:col-span-5 flex flex-col items-center">
                      <div
                        ref={imageFrameRef}
                        onPointerMove={handleImagePointerMove}
                        onPointerLeave={() => {
                          if (isZoomed) {
                            rawPanX.set(0);
                            rawPanY.set(0);
                          }
                        }}
                        onTouchMove={handleTouchMove}
                        onClick={toggleZoom}
                        className={`relative w-full max-w-[360px] aspect-square rounded-[20px] overflow-hidden bg-[#F3ECE1] border border-[#3E2723]/10 shadow-xs select-none ${
                          imgSrc && !imgError
                            ? isZoomed
                              ? 'cursor-zoom-out'
                              : 'cursor-zoom-in'
                            : ''
                        }`}
                      >
                        <motion.div
                          style={{ scale: zoomScale, x: panX, y: panY }}
                          className="w-full h-full will-change-transform"
                        >
                          {imgSrc && !imgError ? (
                            <img
                              src={imgSrc}
                              alt={product.name}
                              width={360}
                              height={360}
                              onError={handleImageError}
                              className="w-full h-full object-cover object-[center_55%] pointer-events-none"
                            />
                          ) : (
                            <ProductPlaceholder
                              category={product.category}
                              name={product.name}
                            />
                          )}
                        </motion.div>

                        {imgSrc && !imgError && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleZoom();
                            }}
                            aria-pressed={isZoomed}
                            aria-label={
                              isZoomed ? 'Görsel yakınlaştırmayı kapat' : 'Görseli yakınlaştır'
                            }
                            className="absolute top-3 right-3 inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#FFFDF9]/92 backdrop-blur-xs text-[#3E2723] hover:bg-white active:scale-95 transition-all cursor-pointer shadow-xs border border-[#3E2723]/10"
                          >
                            {isZoomed ? (
                              <ZoomOut className="w-4 h-4 text-[#B23A48]" aria-hidden="true" />
                            ) : (
                              <ZoomIn className="w-4 h-4 text-[#4F6A1A]" aria-hidden="true" />
                            )}
                          </button>
                        )}
                      </div>
                      <p className="mt-2.5 text-center text-xs text-[#5D4037]/80">
                        {isZoomed
                          ? 'Dokuyu incelemek için gezdirin · Kapatmak için dokunun'
                          : 'Görseller temsilidir · Yakınlaştırmak için görsele dokunun'}
                      </p>
                    </div>

                    {/* Sağ Kolon: Başlık, Fiyat, Porsiyon, İçindekiler, Alerjenler ve Sipariş */}
                    <div className="md:col-span-7 flex flex-col gap-5 text-left">
                      <div>
                        <h3
                          id="detail-panel-title"
                          className="font-serif-display font-bold text-2xl sm:text-3xl text-[#3E2723] leading-snug"
                          style={{ textWrap: 'balance' }}
                        >
                          {product.name}
                        </h3>
                        <p className="mt-2 text-sm sm:text-base text-[#5D4037] leading-relaxed">
                          {product.description}
                        </p>
                      </div>

                      {/* Temsili Vitrin Fiyatı & Porsiyon Seçimi */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF9] border border-[#3E2723]/10 flex flex-col gap-4">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <div>
                            <div className="text-xs font-semibold text-[#5D4037]">
                              Temsili Vitrin Fiyatı · {portionOrWeightText}
                            </div>
                            <div className="mt-0.5 font-serif-display font-bold text-2xl sm:text-3xl text-[#3E2723] tabular-nums">
                              {formatPriceTRY(activePrice)}
                            </div>
                          </div>
                          <span className="text-xs font-medium text-[#5D4037]/85">
                            Günlük taze hazırlık
                          </span>
                        </div>

                        {product.portions && product.portions.length > 0 && (
                          <div>
                            <label
                              id="panel-portion-label"
                              className="block text-xs font-semibold text-[#3E2723] mb-2"
                            >
                              Porsiyon Boyutu Seçin
                            </label>
                            <div
                              role="radiogroup"
                              aria-labelledby="panel-portion-label"
                              className="grid grid-cols-2 gap-2 p-1.5 rounded-full bg-[#F3ECE1]"
                            >
                              {product.portions.map((portion, idx) => {
                                const isSelected = selectedPortion === portion;
                                return (
                                  <button
                                    key={portion}
                                    type="button"
                                    role="radio"
                                    aria-checked={isSelected}
                                    tabIndex={isSelected ? 0 : -1}
                                    onClick={() => setSelectedPortion(portion)}
                                    onKeyDown={(e) =>
                                      handlePortionKeyDown(e, product.portions!, idx)
                                    }
                                    className={`min-h-[44px] px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer active:scale-95 whitespace-nowrap ${
                                      isSelected
                                        ? 'bg-[#3E2723] text-[#FFFDF9] shadow-xs'
                                        : 'text-[#3E2723] hover:bg-[#FFFDF9]/60'
                                    }`}
                                  >
                                    {portion} Kişilik
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* İçindekiler */}
                      <div className="pt-1 border-t border-[#3E2723]/10">
                        <h4 className="text-xs sm:text-sm font-bold text-[#3E2723] mb-1.5 flex items-center gap-1.5">
                          <Info className="w-4 h-4 text-[#4F6A1A] shrink-0" aria-hidden="true" />
                          <span>İçindekiler</span>
                        </h4>
                        <p className="text-xs sm:text-sm text-[#5D4037] leading-relaxed">
                          {product.ingredients.join(' · ')}
                        </p>
                      </div>

                      {/* Alerjen Bilgileri */}
                      <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F3ECE1]/85 border border-[#3E2723]/12">
                        <h4 className="text-xs sm:text-sm font-bold text-[#B23A48] mb-1 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                          <span>Alerjen Bilgileri</span>
                        </h4>
                        <p className="text-xs sm:text-sm font-medium text-[#3E2723] leading-relaxed">
                          {product.allergens.join(' · ')}
                        </p>
                        <p className="mt-1 text-[11px] sm:text-xs text-[#5D4037]/90">
                          Aynı üretim alanında işlendiği için eser miktarda sert kabuklu meyveler, susam ve gluten içerebilir.
                        </p>
                      </div>

                      {/* WhatsApp CTA */}
                      <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-2.5 min-h-[48px] px-6 py-3.5 rounded-full bg-[#4F6A1A] text-white text-sm sm:text-base font-semibold shadow-warm hover:bg-[#415815] active:scale-95 transition-all text-center whitespace-nowrap"
                        >
                          <MessageCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
                          <span>WhatsApp ile Sipariş Ver</span>
                        </a>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            );
          })()}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
