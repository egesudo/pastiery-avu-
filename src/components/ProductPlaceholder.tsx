import React from 'react';
import { ProductCategory } from '../data/products';

interface ProductPlaceholderProps {
  category: ProductCategory;
  name: string;
  className?: string;
}

/**
 * Görseli olmayan veya yüklenemeyen ürünler için kategoriye özel,
 * marka renkli SVG desenli zarif yer tutucu.
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

      {/* Kategoriye özel merkez vektör ikon */}
      <div className="relative z-10 w-16 h-16 rounded-full bg-[#FFFDF9] border border-[#8FA85B]/40 shadow-sm flex items-center justify-center mb-3">
        {category === 'yas-pasta' && (
          <svg
            viewBox="0 0 48 48"
            className="w-9 h-9"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M10 34H38V24C38 21.7909 36.2091 20 34 20H14C11.7909 20 10 21.7909 10 24V34Z"
              fill="#F3ECE1"
              stroke="#3E2723"
              strokeWidth="2.2"
            />
            <path
              d="M10 27C13 27 14 29 17 29C20 29 21 27 24 27C27 27 28 29 31 29C34 29 35 27 38 27"
              stroke="#C84B59"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <circle cx="24" cy="15" r="3.5" fill="#C84B59" />
            <path d="M24 11.5C25.5 9.5 27.5 9 29 9.5" stroke="#8FA85B" strokeWidth="2" strokeLinecap="round" />
            <path d="M7 34H41" stroke="#3E2723" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        )}

        {category === 'ekler-ibiza' && (
          <svg
            viewBox="0 0 48 48"
            className="w-9 h-9"
            fill="none"
            aria-hidden="true"
          >
            <rect
              x="8"
              y="19"
              width="32"
              height="13"
              rx="6.5"
              fill="#F3ECE1"
              stroke="#3E2723"
              strokeWidth="2.2"
            />
            <path
              d="M11 23C11 20.5 14 19 18 19H30C34 19 37 20.5 37 23C35 24.5 32 23.5 29 24.5C26 25.5 22 23.5 19 24.5C16 25.5 13 24 11 23Z"
              fill="#3E2723"
            />
            <path
              d="M15 22L19 25M23 21.5L27 25M31 22L34 24.5"
              stroke="#8FA85B"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        )}

        {category === 'kuru-pasta' && (
          <svg
            viewBox="0 0 48 48"
            className="w-9 h-9"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="24"
              cy="24"
              r="13"
              fill="#F3ECE1"
              stroke="#3E2723"
              strokeWidth="2.2"
            />
            <circle cx="24" cy="24" r="5" fill="#C84B59" />
            <circle cx="18" cy="18" r="1.4" fill="#3E2723" />
            <circle cx="30" cy="19" r="1.4" fill="#3E2723" />
            <circle cx="19" cy="30" r="1.4" fill="#3E2723" />
            <circle cx="29" cy="29" r="1.4" fill="#8FA85B" />
          </svg>
        )}

        {category === 'sutlu-tatlilar' && (
          <svg
            viewBox="0 0 48 48"
            className="w-9 h-9"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M10 23H38L35 34C34.4 36.2 32.4 37.8 30.1 37.8H17.9C15.6 37.8 13.6 36.2 13 34L10 23Z"
              fill="#F3ECE1"
              stroke="#3E2723"
              strokeWidth="2.2"
            />
            <path
              d="M12 23C14 19.5 18.5 17.5 24 17.5C29.5 17.5 34 19.5 36 23"
              stroke="#8FA85B"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <circle cx="24" cy="15" r="2.5" fill="#C84B59" />
          </svg>
        )}
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
