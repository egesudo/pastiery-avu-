import React, { useState } from 'react';
import { siteConfig } from '../config/site';

interface LogoProps {
  /** Maksimum genişlik/yükseklik: navbar'da ≤48px, footer'da ≤64px */
  size?: 40 | 44 | 48 | 56 | 64;
  className?: string;
}

/**
 * Düşük çözünürlüklü logo kaynağını (≈102×102px) tek bir bileşende soyutlar.
 * Yüksek çözünürlüklü logo geldiğinde yalnızca siteConfig.assets.logo veya bu bileşen güncellenir.
 */
export const Logo: React.FC<LogoProps> = ({ size = 48, className = '' }) => {
  const [src, setSrc] = useState<string>(siteConfig.assets.logo);
  const [failed, setFailed] = useState<boolean>(false);

  const clampedSize = Math.min(size, 64);

  const handleError = () => {
    if (src === siteConfig.assets.logo && siteConfig.assets.logoFallback) {
      setSrc(siteConfig.assets.logoFallback);
    } else {
      setFailed(true);
    }
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full overflow-hidden bg-[#FFFDF9] border border-[#3E2723]/12 shadow-sm shrink-0 select-none hover-logo-scale transition-transform duration-200 ${className}`}
      style={{ width: `${clampedSize}px`, height: `${clampedSize}px` }}
    >
      {!failed ? (
        <img
          src={src}
          alt={`${siteConfig.name} logosu`}
          width={clampedSize}
          height={clampedSize}
          onError={handleError}
          className="w-full h-full object-cover rounded-full"
          decoding="async"
        />
      ) : (
        <svg
          viewBox="0 0 64 64"
          width={clampedSize}
          height={clampedSize}
          aria-label={`${siteConfig.name} logosu`}
          className="w-full h-full"
        >
          <circle cx="32" cy="32" r="30" fill="#FFFDF9" stroke="#B23A48" strokeWidth="2.5" />
          <circle cx="32" cy="32" r="24" fill="none" stroke="#8FA85B" strokeWidth="1.5" strokeDasharray="3 2" />
          <text
            x="32"
            y="37"
            textAnchor="middle"
            fill="#3E2723"
            fontFamily="Fraunces, Georgia, serif"
            fontWeight="700"
            fontSize="16"
          >
            GÇ
          </text>
        </svg>
      )}
    </span>
  );
};
