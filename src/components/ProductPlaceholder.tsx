import React from 'react';
import { ProductCategory } from '../data/products';
import { Icon } from './ui/IconRegistry';
import { CATEGORY_ICON_NAME_MAP } from './catalog/icons';

interface ProductPlaceholderProps {
  category: ProductCategory;
  name: string;
  className?: string;
}

/**
 * Görseli olmayan veya yüklenemeyen ürünler için kategoriye özel,
 * merkezi IconRegistry tabanlı zarif yer tutucu.
 */
export const ProductPlaceholder: React.FC<ProductPlaceholderProps> = ({
  category,
  name,
  className = '',
}) => {
  const categoryLabelMap: Record<ProductCategory, string> = {
    'yas-pasta': 'Yaş Pasta',
    'ekler-ibiza': 'Ekler & İbiza',
    'kuru-pasta': 'Kuru Pasta',
    'sutlu-tatlilar': 'Sütlü Tatlı & Özel Lezzet',
  };

  return (
    <div
      className={`relative w-full h-full flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden bg-gradient-to-br from-[#F3ECE1] via-[#FAF6F0] to-[#EFE5D6] ${className}`}
      role="img"
      aria-label={`${name} - temsili kategori illüstrasyonu`}
    >
      {/* Arka plan zarif SVG deseni */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id={`pattern-${category}`}
            width="36"
            height="36"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="18" cy="18" r="2" fill="#8FA85B" />
            <path
              d="M0 18 H36 M18 0 V36"
              stroke="#3E2723"
              strokeWidth="0.4"
              strokeOpacity="0.25"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#pattern-${category})`} />
      </svg>

      {/* Kategoriye özel merkez ikon */}
      <div className="relative z-10 w-16 h-16 rounded-full bg-[#FFFDF9] border border-[#8FA85B]/40 shadow-sm flex items-center justify-center mb-3">
        <Icon
          name={CATEGORY_ICON_NAME_MAP[category]}
          size={32}
          variant="duotone"
          className="text-[#3B2314]"
        />
      </div>

      <span className="relative z-10 text-xs font-medium tracking-wide text-[#5D4037]/80">
        {categoryLabelMap[category]}
      </span>
      <span className="relative z-10 mt-1 text-sm font-serif-display font-semibold text-[#3E2723] line-clamp-2">
        {name}
      </span>
    </div>
  );
};
