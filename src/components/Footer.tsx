import React from 'react';
import { Logo } from './Logo';
import { Icon } from './ui/IconRegistry';
import { CATEGORY_ICON_NAME_MAP } from './catalog/icons';
import { siteConfig } from '../config/site';
import { CATEGORIES, ProductCategory } from '../data/products';
import {
  TRUSTED_FACEBOOK_HOSTS,
  TRUSTED_INSTAGRAM_HOSTS,
  sanitizeSafeHref,
} from '../utils/security';

interface FooterProps {
  onSelectCategory?: (category: ProductCategory) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory }) => {
  const currentYear = new Date().getFullYear();

  const handleCategoryClick = (categoryId: ProductCategory) => {
    if (onSelectCategory) {
      onSelectCategory(categoryId);
    }
    window.dispatchEvent(
      new CustomEvent<ProductCategory>('select-catalog-category', {
        detail: categoryId,
      })
    );
  };

  const safeInstagramUrl = sanitizeSafeHref(
    siteConfig.instagram,
    TRUSTED_INSTAGRAM_HOSTS,
    ''
  );
  const safeFacebookUrl = sanitizeSafeHref(
    siteConfig.facebook,
    TRUSTED_FACEBOOK_HOSTS,
    ''
  );

  return (
    <footer className="bg-[#F3ECE1] border-t border-[#3E2723]/12 pt-14 pb-24 sm:pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-[#3E2723]/10">
          {/* Sol: Logo (≤64px) + Marka Adı ve Adres */}
          <div className="md:col-span-5 flex flex-col items-start">
            <div className="flex items-center gap-3.5 mb-4">
              <Logo size={64} />
              <div>
                <h2 className="font-serif-display font-bold text-lg sm:text-xl text-[#3E2723]">
                  {siteConfig.name}
                </h2>
                <p className="text-xs text-[#5D4037] mt-0.5">{siteConfig.branchName}</p>
              </div>
            </div>

            <address className="not-italic flex items-start gap-2 text-sm text-[#5D4037] leading-relaxed max-w-sm">
              <Icon
                name="pin-kiraz"
                size={16}
                variant="duotone"
                className="text-[#3B2314] mt-0.5"
              />
              <span>{siteConfig.address}</span>
            </address>

            {/* Çalışma saatleri yalnızca config'te varsa gösterilir */}
            {siteConfig.hours && (
              <p className="mt-3 flex items-center gap-2 text-sm font-medium text-[#3E2723]">
                <Icon name="clock" size={16} className="text-[#4F6A1A]" />
                <span>Çalışma Saatleri: {siteConfig.hours.display}</span>
              </p>
            )}

            {/* Sosyal medya bağlantıları yalnızca doğrulanmış HTTPS URL varsa gösterilir */}
            {(safeInstagramUrl || safeFacebookUrl) && (
              <div className="mt-4 flex items-center gap-3">
                {safeInstagramUrl && (
                  <a
                    href={safeInstagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram sayfamız"
                    className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-full bg-[#FFFDF9] text-xs font-semibold text-[#3E2723] border border-[#3E2723]/12 hover:bg-[#FAF6F0] transition-colors"
                  >
                    <Icon name="instagram" size={16} />
                    <span>Instagram</span>
                  </a>
                )}
                {safeFacebookUrl && (
                  <a
                    href={safeFacebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook sayfamız"
                    className="inline-flex items-center min-h-[44px] px-4 py-2 rounded-full bg-[#FFFDF9] text-xs font-semibold text-[#3E2723] border border-[#3E2723]/12 hover:bg-[#FAF6F0] transition-colors"
                  >
                    Facebook
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Orta: Kategori Hızlı Linkleri */}
          <div className="md:col-span-4">
            <h3 className="font-serif-display font-bold text-base text-[#3E2723] mb-3">
              Lezzet Kategorileri
            </h3>
            <ul className="space-y-2 text-sm text-[#5D4037]">
              {CATEGORIES.map((category) => (
                <li key={category.id}>
                  <a
                    href="#lezzetlerimiz"
                    onClick={() => handleCategoryClick(category.id)}
                    className="group/catlink inline-flex items-center gap-2 py-1 hover:text-[#4F6A1A] transition-colors"
                  >
                    <Icon
                      name={CATEGORY_ICON_NAME_MAP[category.id]}
                      size={16}
                      variant="duotone"
                      className="text-[#3B2314] transition-transform duration-200 group-hover/catlink:-rotate-6"
                    />
                    <span>{category.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Sağ: Hızlı Erişim */}
          <div className="md:col-span-3">
            <h3 className="font-serif-display font-bold text-base text-[#3E2723] mb-3">
              Hızlı Gezinme
            </h3>
            <ul className="space-y-2 text-sm text-[#5D4037]">
              <li>
                <a href="#ana-sayfa" className="inline-flex items-center py-1 hover:text-[#4F6A1A] transition-colors">
                  Ana Sayfa
                </a>
              </li>
              <li>
                <a href="#atmosfer" className="inline-flex items-center py-1 hover:text-[#4F6A1A] transition-colors">
                  Sıcak Yuva, Taze Tezgâh
                </a>
              </li>
              <li>
                <a href="#hakkimizda" className="inline-flex items-center py-1 hover:text-[#4F6A1A] transition-colors">
                  Hakkımızda
                </a>
              </li>
              <li>
                <a href="#lezzetlerimiz" className="inline-flex items-center py-1 hover:text-[#4F6A1A] transition-colors">
                  Lezzetlerimiz
                </a>
              </li>
              <li>
                <a href="#iletisim" className="inline-flex items-center py-1 hover:text-[#4F6A1A] transition-colors">
                  İletişim &amp; Konum
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Alt Telif Satırı */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#5D4037]">
          <p>
            &copy; {currentYear} {siteConfig.name}. Tüm hakları saklıdır.
          </p>
          <p>Halkalı Merkez, Küçükçekmece / İstanbul</p>
        </div>
      </div>
    </footer>
  );
};
