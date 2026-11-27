import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'motion/react';
import {
  X,
  Info,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  Product,
  CakePortion,
  PRODUCT_IMAGE_FALLBACKS,
} from '../data/products';
import { buildWhatsAppUrl } from '../config/site';
import { ProductPlaceholder } from './ProductPlaceholder';
import { WhatsAppActionButton } from './WhatsAppActionButton';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  products?: Product[];
  onSelectProduct?: (product: Product) => void;
}

const MODAL_SWITCH_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  products,
  onSelectProduct,
}) => {
  const [selectedPortion, setSelectedPortion] = useState<CakePortion>('7-8');
  const [imgSrc, setImgSrc] = useState<string | undefined>(product?.image);
  const [imgError, setImgError] = useState<boolean>(false);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [switchDir, setSwitchDir] = useState<number>(1);
  const prefersReducedMotion = Boolean(useReducedMotion());

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const imageFrameRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Yakınlaştırma ve yumuşak kaydırma motion değerleri (sıfır re-render)
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
    rawZoomScale.set(isZoomed && !prefersReducedMotion ? 1.48 : isZoomed ? 1.35 : 1);
    if (!isZoomed) {
      rawPanX.set(0);
      rawPanY.set(0);
    }
  }, [isZoomed, prefersReducedMotion, rawZoomScale, rawPanX, rawPanY]);

  // Focus trap, Esc ile kapanma ve arka plan scroll kilidi
  useEffect(() => {
    if (!product) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Modal açıldığında kapat butonuna odaklan
    const focusTimeout = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 30);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimeout);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [product, onClose]);

  const handleImageError = () => {
    if (imgSrc && PRODUCT_IMAGE_FALLBACKS[imgSrc] && imgSrc !== PRODUCT_IMAGE_FALLBACKS[imgSrc]) {
      setImgSrc(PRODUCT_IMAGE_FALLBACKS[imgSrc]);
    } else {
      setImgError(true);
    }
  };

  const canBrowseProducts = Boolean(products && products.length > 1 && onSelectProduct);
  const currentIndex =
    product && products ? products.findIndex((item) => item.id === product.id) : -1;

  const handleStepProduct = useCallback(
    (delta: -1 | 1) => {
      if (!products || products.length <= 1 || !onSelectProduct || currentIndex < 0) return;
      setSwitchDir(delta);
      const nextIndex = (currentIndex + delta + products.length) % products.length;
      onSelectProduct(products[nextIndex]);
    },
    [products, onSelectProduct, currentIndex]
  );

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

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }, []);

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

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (!touchStartRef.current || isZoomed || !canBrowseProducts || e.changedTouches.length !== 1) {
        touchStartRef.current = null;
        return;
      }
      const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
      const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
      touchStartRef.current = null;

      if (Math.abs(dx) >= 48 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        handleStepProduct(dx < 0 ? 1 : -1);
      }
    },
    [isZoomed, canBrowseProducts, handleStepProduct]
  );

  if (!product) return null;

  // Seçili porsiyon veya gramaj metni
  const portionOrWeightText = product.portions?.length
    ? `${selectedPortion} Kişilik`
    : product.weight
    ? product.weight
    : 'Standart Porsiyon';

  const whatsappMessage = `Merhaba, ${product.name} (${portionOrWeightText}) hakkında bilgi almak / sipariş vermek istiyorum.`;
  const whatsappUrl = buildWhatsAppUrl(whatsappMessage);

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

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#3E2723]/55 backdrop-blur-xs overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-product-title"
          aria-describedby="modal-product-desc"
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 16 }}
          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
          transition={
            prefersReducedMotion
              ? { duration: 0.16 }
              : { type: 'spring', stiffness: 360, damping: 28 }
          }
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg rounded-[24px] bg-[#FFFDF9] border border-[#3E2723]/12 shadow-warm-lg p-5 sm:p-7 my-auto max-h-[92vh] overflow-y-auto"
        >
          {/* Üst bar: Başlık, Ürün Sayacı & Kapatma Butonu (≥44x44px) */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold tracking-wide text-[#5D4037]">
                Hızlı Bakış &amp; Sipariş
              </span>
              {canBrowseProducts && currentIndex >= 0 && products && (
                <span className="px-2 py-0.5 rounded-full bg-[#F3ECE1] text-[11px] font-semibold text-[#5D4037]">
                  {currentIndex + 1} / {products.length}
                </span>
              )}
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Hızlı bakış penceresini kapat"
              className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#F3ECE1] text-[#3E2723] hover:bg-[#E7DDD0] active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {/* İnteraktif Vitrin Görseli + Önceki / Sonraki Gezinme */}
          <div className="relative flex items-center justify-center gap-2 sm:gap-3">
            {canBrowseProducts && (
              <button
                type="button"
                onClick={() => handleStepProduct(-1)}
                aria-label="Önceki ürün"
                className="hidden sm:inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#F3ECE1] text-[#3E2723] hover:bg-[#E7DDD0] active:scale-95 transition-all cursor-pointer shrink-0 shadow-xs"
              >
                <ChevronLeft className="w-5 h-5" aria-hidden="true" />
              </button>
            )}

            <div
              ref={imageFrameRef}
              onPointerMove={handleImagePointerMove}
              onPointerLeave={() => {
                if (isZoomed) {
                  rawPanX.set(0);
                  rawPanY.set(0);
                }
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="relative w-full max-w-[330px] aspect-square mx-auto rounded-[20px] overflow-hidden bg-[#F3ECE1] border border-[#3E2723]/8 shadow-xs select-none"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={product.id}
                  initial={
                    prefersReducedMotion
                      ? { opacity: 0 }
                      : { opacity: 0, x: switchDir * 24 }
                  }
                  animate={
                    prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }
                  }
                  exit={
                    prefersReducedMotion
                      ? { opacity: 0 }
                      : { opacity: 0, x: -switchDir * 24 }
                  }
                  transition={{ duration: prefersReducedMotion ? 0.14 : 0.22, ease: MODAL_SWITCH_EASE }}
                  onClick={toggleZoom}
                  className={`w-full h-full ${
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
                        width={320}
                        height={320}
                        onError={handleImageError}
                        className="w-full h-full object-cover object-[center_55%] pointer-events-none"
                      />
                    ) : (
                      <ProductPlaceholder category={product.category} name={product.name} />
                    )}
                  </motion.div>
                </motion.div>
              </AnimatePresence>

              {/* Yakınlaştırma Kontrolü (Erişilebilir ≥44x44px Dokunma Alanı) */}
              {imgSrc && !imgError && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleZoom();
                  }}
                  aria-pressed={isZoomed}
                  aria-label={isZoomed ? 'Görsel yakınlaştırmayı kapat' : 'Görseli yakınlaştır'}
                  className="absolute top-2.5 right-2.5 inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#FFFDF9]/92 backdrop-blur-xs text-[#3E2723] hover:bg-white active:scale-95 transition-all cursor-pointer shadow-xs border border-[#3E2723]/10"
                >
                  {isZoomed ? (
                    <ZoomOut className="w-4 h-4 text-[#B23A48]" aria-hidden="true" />
                  ) : (
                    <ZoomIn className="w-4 h-4 text-[#4F6A1A]" aria-hidden="true" />
                  )}
                </button>
              )}
            </div>

            {canBrowseProducts && (
              <button
                type="button"
                onClick={() => handleStepProduct(1)}
                aria-label="Sonraki ürün"
                className="hidden sm:inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#F3ECE1] text-[#3E2723] hover:bg-[#E7DDD0] active:scale-95 transition-all cursor-pointer shrink-0 shadow-xs"
              >
                <ChevronRight className="w-5 h-5" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Mobil Önceki/Sonraki Butonları + Yakınlaştırma/Temsili Not */}
          <div className="mt-2.5 flex items-center justify-center gap-3">
            {canBrowseProducts && (
              <button
                type="button"
                onClick={() => handleStepProduct(-1)}
                aria-label="Önceki ürün"
                className="sm:hidden inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#F3ECE1] text-[#3E2723] active:scale-95 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
            <p className="text-center text-xs text-[#5D4037]/80">
              {isZoomed
                ? 'Dokuyu incelemek için gezdirin · Kapatmak için dokunun'
                : 'Görseller temsilidir · Yakınlaştırmak için görsele dokunun'}
            </p>
            {canBrowseProducts && (
              <button
                type="button"
                onClick={() => handleStepProduct(1)}
                aria-label="Sonraki ürün"
                className="sm:hidden inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#F3ECE1] text-[#3E2723] active:scale-95 transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Ürün Başlığı ve Kısa Açıklaması */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={product.id}
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
              animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
              transition={{ duration: prefersReducedMotion ? 0.14 : 0.2, ease: MODAL_SWITCH_EASE }}
              className="mt-4 text-left"
            >
              <h3
                id="modal-product-title"
                className="font-serif-display font-bold text-xl sm:text-2xl text-[#3E2723] leading-snug"
              >
                {product.name}
              </h3>

              <p
                id="modal-product-desc"
                className="mt-2 text-sm sm:text-base text-[#5D4037] leading-relaxed"
              >
                {product.description}
              </p>

              {/* Gramaj Bilgisi (Ekler / İbiza için) */}
              {product.weight && (
                <div className="mt-4 flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#3E2723]">
                  <span>Paket Miktarı:</span>
                  <span className="text-[#4F6A1A]">{product.weight}</span>
                </div>
              )}

              {/* Yaş Pastalarda Porsiyon Seçici (Klavye Erişilebilir Segmented Control) */}
              {product.portions && product.portions.length > 0 && (
                <div className="mt-5">
                  <label
                    id="portion-selector-label"
                    className="block text-xs sm:text-sm font-semibold text-[#3E2723] mb-2"
                  >
                    Porsiyon Seçimi
                  </label>
                  <div
                    role="radiogroup"
                    aria-labelledby="portion-selector-label"
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

              {/* Sabit Alerjen ve İçerik Notu */}
              <div className="mt-5 p-3.5 rounded-2xl bg-[#F3ECE1]/80 border border-[#3E2723]/8 flex items-start gap-2.5">
                <Info
                  className="w-4 h-4 text-[#5D4037] shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <p className="text-xs sm:text-sm text-[#5D4037] leading-relaxed">
                  İçerik ve alerjen bilgisi için bize WhatsApp&apos;tan ulaşabilirsiniz.
                </p>
              </div>

              {/* WhatsApp Sipariş / Bilgi Alma CTA */}
              <div className="mt-6">
                <WhatsAppActionButton
                  href={whatsappUrl}
                  label="WhatsApp ile Sipariş Ver / Bilgi Al"
                  size="lg"
                  className="w-full"
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

