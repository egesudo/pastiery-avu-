import React from 'react';
import type { ProductCategory } from '../../data/products';

export interface CategoryIconProps {
  isActive?: boolean;
  className?: string;
}

/**
 * 1) Yaş Pasta: Katmanlı pasta dilimi, üstünde krema dalgası ve tek bir çilek
 */
export const YasPastaIcon: React.FC<CategoryIconProps> = React.memo(
  ({ isActive = false, className = '' }) => {
    const accentFill = '#D9566B';
    const creamFill = isActive ? 'rgba(246, 233, 210, 0.28)' : 'rgba(246, 233, 210, 0.75)';

    return (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={className}
      >
        {/* Çilek / vişne tek vurgulu dolgu */}
        <path
          d="M12.2 4.3C10.8 4.3 9.9 5.3 10.1 6.7C10.3 7.8 11.3 8.8 12.2 8.8C13.1 8.8 14.1 7.8 14.3 6.7C14.5 5.3 13.6 4.3 12.2 4.3Z"
          fill={accentFill}
          stroke="currentColor"
        />
        {/* Çilek sapı */}
        <path d="M12.2 4.3C12.3 3.4 12.9 2.8 13.6 2.6" />
        {/* Krema dalgası dolgusu */}
        <path
          d="M4.2 12.6C4.2 11.4 5.2 10.4 6.5 10.4H17.5C18.8 10.4 19.8 11.4 19.8 12.6V13.6C18.7 13.6 18.1 15 17 15C15.8 15 15.3 13.5 14 13.5C12.7 13.5 12.3 15.2 11 15.2C9.7 15.2 9.1 13.5 7.8 13.5C6.5 13.5 5.8 14.7 4.2 14.2V12.6Z"
          fill={creamFill}
          stroke="none"
        />
        {/* Katmanlı pasta dilimi gövdesi */}
        <path d="M4.2 19.5V12.6C4.2 11.4 5.2 10.4 6.5 10.4H17.5C18.8 10.4 19.8 11.4 19.8 12.6V19.5H4.2Z" />
        {/* Krema dalgası çizgisi & orta kat */}
        <path d="M4.2 14.1C5.6 14.7 6.4 13.4 7.7 13.4C9 13.4 9.7 15.1 11 15.1C12.3 15.1 12.8 13.4 14.1 13.4C15.4 13.4 16.1 14.9 17.2 14.9C18.2 14.9 18.8 13.8 19.8 13.8" />
        <path d="M4.2 17H19.8" />
      </svg>
    );
  }
);
YasPastaIcon.displayName = 'YasPastaIcon';

/**
 * 2) Ekler & İbiza: Uzunlamasına ekler, üstü çikolata kaplı, kenarından süzülen bir damla
 */
export const EklerIcon: React.FC<CategoryIconProps> = React.memo(
  ({ isActive = false, className = '' }) => {
    const glazeFill = isActive ? 'rgba(201, 138, 62, 0.45)' : 'rgba(201, 138, 62, 0.35)';

    return (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={className}
      >
        {/* Üst çikolata kaplaması + kenarından süzülen tek damla (duotone dolgu) */}
        <path
          d="M4.2 11.5C4.2 8.7 6.8 7 10.5 7H14.5C17.8 7 19.8 8.7 19.8 11.5C18.7 12.3 17.4 12.1 16.5 11.7C15.9 11.4 15.5 12 15.5 13.2C15.5 14.4 14.7 15.2 13.9 15.2C13.1 15.2 12.5 14.3 12.5 13.1C12.5 12.1 11.9 11.8 10.8 12.1C8.6 12.7 6.1 12.6 4.2 11.5Z"
          fill={glazeFill}
          stroke="none"
        />
        {/* Ekler hamuru dış hattı */}
        <rect x="3.5" y="7" width="17" height="10" rx="5" />
        {/* Üst sos dalgası ve süzülen damla çizgisi */}
        <path d="M3.8 11.4C5.7 12.5 8.4 12.6 10.7 12C11.9 11.7 12.5 12.1 12.5 13.2C12.5 14.4 13.1 15.3 13.9 15.3C14.7 15.3 15.4 14.4 15.4 13.2C15.4 12.1 15.9 11.4 16.7 11.7C17.8 12.1 19 12.1 20.2 11.4" />
        {/* Parlaklık çizgisi */}
        <path d="M7.5 9.5H11.5" />
      </svg>
    );
  }
);
EklerIcon.displayName = 'EklerIcon';

/**
 * 3) Kuru Pastalar: Ortası reçelli, kenarı tırtıklı kurabiye ve yanında küçük ikinci kurabiye
 */
export const KuruPastaIcon: React.FC<CategoryIconProps> = React.memo(
  ({ className = '' }) => {
    const jamFill = '#D9566B';

    return (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={className}
      >
        {/* Arka sağdaki küçük ikinci kurabiye */}
        <path d="M15.2 7.5C16.2 5.9 18.4 5.6 19.8 6.8C21.1 7.9 21.3 9.9 20.2 11.3C19.5 12.2 18.3 12.6 17.2 12.5" />
        <circle cx="17.8" cy="8.9" r="0.65" fill="currentColor" stroke="none" />
        {/* Tırtıklı kenarlı ana kurabiye */}
        <path d="M8.6 7.5Q10.3 5.5 12.0 7.5Q14.6 7.3 14.8 9.9Q16.9 11.5 15.1 13.3Q15.2 16.0 12.6 16.1Q10.7 18.2 8.7 16.2Q6.1 16.3 6.1 13.7Q4.0 12.0 5.9 10.2Q5.9 7.5 8.6 7.5Z" />
        {/* Ortası reçelli dolgu */}
        <circle cx="10.4" cy="12" r="2.2" fill={jamFill} stroke="currentColor" />
      </svg>
    );
  }
);
KuruPastaIcon.displayName = 'KuruPastaIcon';

/**
 * 4) Sütlü Tatlılar: Cam kasede sütlaç/supangle, üstünde karamel/tarçın dokunuşu ve yanında kaşık
 */
export const SutluTatliIcon: React.FC<CategoryIconProps> = React.memo(
  ({ isActive = false, className = '' }) => {
    const toppingFill = isActive ? 'rgba(201, 138, 62, 0.55)' : 'rgba(201, 138, 62, 0.4)';

    return (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={className}
      >
        {/* Karamel / sütlaç üst krema yüzeyi (duotone dolgu) */}
        <ellipse
          cx="10.5"
          cy="11"
          rx="6.2"
          ry="2.2"
          fill={toppingFill}
          stroke="none"
        />
        {/* Cam kase gövdesi ve ayağı */}
        <path d="M4.2 11.2C4.2 15 6.8 17.6 10.5 17.6C14.2 17.6 16.8 15 16.8 11.2" />
        <path d="M8 20H13" />
        <path d="M10.5 17.6V20" />
        {/* Kase ağzı ve sütlü tatlı yüzeyi */}
        <ellipse cx="10.5" cy="11" rx="6.3" ry="2.2" />
        {/* Üst tarçın / karamel dokunuşu */}
        <path d="M8.7 10.8C9.8 10.3 11.2 10.3 12.3 10.9" />
        {/* Yanındaki kaşık */}
        <path d="M19.8 4.4C18.7 4.4 18 5.5 18.2 6.8C18.3 7.7 19 8.4 19.7 8.4C20.5 8.4 21.1 7.7 21.2 6.8C21.4 5.5 20.8 4.4 19.8 4.4Z" />
        <path d="M19.7 8.4V19.6" />
      </svg>
    );
  }
);
SutluTatliIcon.displayName = 'SutluTatliIcon';

export const CATEGORY_ICON_MAP: Record<ProductCategory, React.FC<CategoryIconProps>> = {
  'yas-pasta': YasPastaIcon,
  'ekler-ibiza': EklerIcon,
  'kuru-pasta': KuruPastaIcon,
  'sutlu-tatlilar': SutluTatliIcon,
};
