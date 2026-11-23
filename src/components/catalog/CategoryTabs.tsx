import React, { useRef, useEffect, useCallback, useState } from 'react';
import { motion, LayoutGroup } from 'motion/react';
import type { CategoryMeta, ProductCategory } from '../../data/products';
import { CATEGORY_ICON_MAP } from './icons';
import { CATEGORY_TAB_LABELS } from './theme';

export interface CategoryTabsProps {
  categories: CategoryMeta[];
  activeTab: ProductCategory;
  onSelectTab: (category: ProductCategory) => void;
  prefersReducedMotion: boolean | null;
}

/**
 * Aktif sekme alt kenarından sarkan küçük, akışkan SVG çikolata damlaları.
 */
const ActiveChocolateDrips: React.FC = React.memo(() => (
  <svg
    viewBox="0 0 120 12"
    preserveAspectRatio="none"
    aria-hidden="true"
    className="pointer-events-none absolute -bottom-[8px] left-3 right-3 w-[calc(100%-24px)] h-[9px]"
  >
    <path
      d="M0 0 H120 V1 C111 1 108 5.2 104 5.2 C100 5.2 98 1 91 1 C84 1 82 9.5 76.5 9.5 C71 9.5 70 1.4 63 1.4 C55 1.4 53 6.2 48.5 6.2 C44 6.2 42 1.2 35 1.2 C28 1.2 26 8.2 21 8.2 C16 8.2 15 1 7 1 C3 1 1.5 0.5 0 0 Z"
      fill="#3B2314"
    />
  </svg>
));
ActiveChocolateDrips.displayName = 'ActiveChocolateDrips';

interface CategoryTabButtonProps {
  cat: CategoryMeta;
  index: number;
  isSelected: boolean;
  prefersReducedMotion: boolean | null;
  setButtonRef: (category: ProductCategory, el: HTMLButtonElement | null) => void;
  onActivate: (category: ProductCategory) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => void;
}

const CategoryTabButton: React.FC<CategoryTabButtonProps> = React.memo(
  ({
    cat,
    index,
    isSelected,
    prefersReducedMotion,
    setButtonRef,
    onActivate,
    onKeyDown,
  }) => {
    const Icon = CATEGORY_ICON_MAP[cat.id];
    const label = CATEGORY_TAB_LABELS[cat.id] ?? cat.label;

    const handleRef = useCallback(
      (el: HTMLButtonElement | null) => {
        setButtonRef(cat.id, el);
      },
      [cat.id, setButtonRef]
    );

    const handleClick = useCallback(() => {
      onActivate(cat.id);
    }, [cat.id, onActivate]);

    const handleButtonKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLButtonElement>) => {
        onKeyDown(e, index);
      },
      [index, onKeyDown]
    );

    return (
      <button
        ref={handleRef}
        id={`tab-${cat.id}`}
        type="button"
        role="tab"
        aria-selected={isSelected}
        aria-controls={`tabpanel-${cat.id}`}
        tabIndex={isSelected ? 0 : -1}
        onClick={handleClick}
        onKeyDown={handleButtonKeyDown}
        className={`group relative inline-flex items-center justify-center gap-2 min-h-[44px] px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-[color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C98A3E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F6E9D2] ${
          isSelected
            ? 'text-[#FFF8EC]'
            : 'text-[#3B2314] hover:text-[#3B2314] hover:shadow-[0_4px_12px_-4px_rgba(59,35,20,0.18)]'
        }`}
      >
        {isSelected && (
          <motion.span
            layoutId="catalog-active-pill"
            transition={
              prefersReducedMotion
                ? { duration: 0.12 }
                : { type: 'spring', stiffness: 420, damping: 32 }
            }
            className="absolute inset-0 rounded-full bg-[#3B2314] shadow-[0_8px_18px_-4px_rgba(59,35,20,0.36)]"
            aria-hidden="true"
          >
            <ActiveChocolateDrips />
          </motion.span>
        )}

        <span
          className={`relative z-10 inline-flex items-center justify-center shrink-0 ${
            prefersReducedMotion
              ? ''
              : 'transition-transform duration-[180ms] ease-out group-hover:-translate-y-0.5 group-hover:-rotate-6 group-focus-visible:-translate-y-0.5'
          }`}
        >
          <Icon isActive={isSelected} className="w-5 h-5" />
        </span>

        <span className="relative z-10 tracking-tight">{label}</span>
      </button>
    );
  }
);
CategoryTabButton.displayName = 'CategoryTabButton';

export const CategoryTabs: React.FC<CategoryTabsProps> = React.memo(
  ({ categories, activeTab, onSelectTab, prefersReducedMotion }) => {
    // Aktif sekme animasyon durumu (LayoutGroup + görsel aktif sekme) üst Catalog bileşeninden izole tutulur
    const [visualActiveTab, setVisualActiveTab] = useState<ProductCategory>(activeTab);

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const tabRefs = useRef<Record<ProductCategory, HTMLButtonElement | null>>({
      'yas-pasta': null,
      'ekler-ibiza': null,
      'kuru-pasta': null,
      'sutlu-tatlilar': null,
    });
    const isFirstMountRef = useRef<boolean>(true);
    const centerRafRef = useRef<number | null>(null);

    // Footer gibi harici bir kaynaktan sekme değişirse izole görsel durumu senkronize et
    useEffect(() => {
      setVisualActiveTab((prev) => (prev === activeTab ? prev : activeTab));
    }, [activeTab]);

    const handleActivateTab = useCallback(
      (nextCategory: ProductCategory) => {
        setVisualActiveTab(nextCategory);
        onSelectTab(nextCategory);
      },
      [onSelectTab]
    );

    const setButtonRef = useCallback(
      (category: ProductCategory, el: HTMLButtonElement | null) => {
        tabRefs.current[category] = el;
      },
      []
    );

    // Mobilde yatay kaydırmada aktif sekmeyi rAF içinde okuyup ortala (sıfır layout thrashing)
    useEffect(() => {
      if (isFirstMountRef.current) {
        isFirstMountRef.current = false;
        return;
      }

      if (centerRafRef.current !== null) {
        cancelAnimationFrame(centerRafRef.current);
      }

      centerRafRef.current = requestAnimationFrame(() => {
        centerRafRef.current = null;
        const container = scrollContainerRef.current;
        const activeBtn = tabRefs.current[visualActiveTab];
        if (!container || !activeBtn) return;

        // Tüm DOM metrikleri tek rAF karesinde toplu okunur (read-then-write)
        const scrollW = container.scrollWidth;
        const clientW = container.clientWidth;
        if (scrollW > clientW + 4) {
          const btnLeft = activeBtn.offsetLeft;
          const btnWidth = activeBtn.offsetWidth;
          const targetLeft = Math.max(0, btnLeft - clientW / 2 + btnWidth / 2);

          container.scrollTo({
            left: targetLeft,
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
          });
        }
      });

      return () => {
        if (centerRafRef.current !== null) {
          cancelAnimationFrame(centerRafRef.current);
          centerRafRef.current = null;
        }
      };
    }, [visualActiveTab, prefersReducedMotion]);

    // Sol/Sağ ok tuşları, Home ve End ile WCAG uyumlu sekme gezinmesi
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
        let nextIndex: number | null = null;
        if (e.key === 'ArrowRight') {
          nextIndex = (index + 1) % categories.length;
        } else if (e.key === 'ArrowLeft') {
          nextIndex = (index - 1 + categories.length) % categories.length;
        } else if (e.key === 'Home') {
          nextIndex = 0;
        } else if (e.key === 'End') {
          nextIndex = categories.length - 1;
        }

        if (nextIndex !== null) {
          e.preventDefault();
          const nextCategory = categories[nextIndex].id;
          handleActivateTab(nextCategory);
          tabRefs.current[nextCategory]?.focus();
        }
      },
      [categories, handleActivateTab]
    );

    return (
      <div className="sticky top-[68px] sm:top-[84px] z-30 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0 py-1.5 pointer-events-none">
        <div
          ref={scrollContainerRef}
          className="w-full overflow-x-auto overflow-y-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-3 pt-1 flex justify-start sm:justify-center pointer-events-auto"
        >
          <LayoutGroup id="catalog-category-tabs">
            <div
              role="tablist"
              aria-label="Ürün kategorileri"
              className="inline-flex flex-nowrap items-center gap-1.5 p-1.5 rounded-full bg-[#F6E9D2]/95 backdrop-blur-md border border-[#3B2314]/12 shadow-[0_8px_24px_-6px_rgba(59,35,20,0.12)] shrink-0"
            >
              {categories.map((cat, idx) => (
                <CategoryTabButton
                  key={cat.id}
                  cat={cat}
                  index={idx}
                  isSelected={visualActiveTab === cat.id}
                  prefersReducedMotion={prefersReducedMotion}
                  setButtonRef={setButtonRef}
                  onActivate={handleActivateTab}
                  onKeyDown={handleKeyDown}
                />
              ))}
            </div>
          </LayoutGroup>
        </div>
      </div>
    );
  }
);
CategoryTabs.displayName = 'CategoryTabs';
