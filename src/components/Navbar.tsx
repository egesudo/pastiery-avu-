import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, MessageCircle } from 'lucide-react';
import { Logo } from './Logo';
import { siteConfig, buildWhatsAppUrl } from '../config/site';

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Ana Sayfa', href: '#ana-sayfa' },
  { label: 'Lezzetlerimiz', href: '#lezzetlerimiz' },
  { label: 'Atmosferimiz', href: '#atmosfer' },
  { label: 'Hakkımızda', href: '#hakkimizda' },
  { label: 'İletişim & Konum', href: '#iletisim' },
];

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rippleKey, setRippleKey] = useState<number | null>(null);

  const drawerRef = useRef<HTMLDivElement>(null);
  const hamburgerBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 16);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Mobil çekmece açıkken focus trap, Esc ile kapanma ve body scroll kilidi
  useEffect(() => {
    if (!drawerOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const drawerEl = drawerRef.current;
    const focusableElements = drawerEl?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const firstEl = focusableElements?.[0];
    const lastEl = focusableElements?.[focusableElements.length - 1];

    firstEl?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setDrawerOpen(false);
        hamburgerBtnRef.current?.focus();
      } else if (e.key === 'Tab' && focusableElements && focusableElements.length > 0) {
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl?.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [drawerOpen]);

  const generalWhatsAppUrl = buildWhatsAppUrl(
    'Merhaba, Gaziantepli Çavuşoğulları Pastaneleri ürünleriniz hakkında bilgi almak / sipariş vermek istiyorum.'
  );

  const triggerRipple = () => {
    setRippleKey(Date.now());
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${
          scrolled
            ? 'bg-[#FAF6F0]/90 backdrop-blur-md shadow-warm border-b border-[#3E2723]/8'
            : 'bg-[#FAF6F0]/80 backdrop-blur-md border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4 lg:gap-8">
          {/* Sol: Logo (≤48px) + Marka Adı (Mobilde kısaltılmış: "Çavuşoğulları") */}
          <a
            href="#ana-sayfa"
            className="inline-flex items-center gap-3 whitespace-nowrap shrink-0 group rounded-full pr-2"
          >
            <Logo size={48} />
            <span className="font-serif-display font-bold text-[#3E2723] tracking-tight text-base sm:text-lg">
              <span className="sm:hidden">{siteConfig.shortName}</span>
              <span className="hidden sm:inline">{siteConfig.name}</span>
            </span>
          </a>

          {/* Orta: Bölümlere Çapa Bağlantıları */}
          <nav
            aria-label="Ana navigasyon"
            className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#5D4037]"
          >
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="relative py-1 whitespace-nowrap shrink-0 hover:text-[#3E2723] transition-colors after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-[#4F6A1A] hover:after:w-full after:transition-all after:duration-200"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Sağ: WhatsApp ile Sipariş Butonu */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={generalWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={triggerRipple}
              className="hidden sm:inline-flex relative overflow-hidden items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-full bg-[#4F6A1A] text-white text-sm font-semibold shadow-sm hover:bg-[#425915] active:scale-95 transition-all whitespace-nowrap shrink-0"
            >
              {rippleKey && (
                <span
                  key={rippleKey}
                  className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-white/35 animate-ripple pointer-events-none"
                  aria-hidden="true"
                />
              )}
              <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>WhatsApp ile Sipariş</span>
            </a>

            {/* Mobil Hamburger Butonu (≥44x44px) */}
            <button
              ref={hamburgerBtnRef}
              type="button"
              onClick={() => setDrawerOpen((prev) => !prev)}
              aria-expanded={drawerOpen}
              aria-controls="mobile-navigation-drawer"
              aria-label={drawerOpen ? 'Menüyü kapat' : 'Menüyü aç'}
              className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#FFFDF9] border border-[#3E2723]/12 text-[#3E2723] active:scale-95 transition-transform cursor-pointer"
            >
              {drawerOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobil Çekmece Menü (Focus Trap + Esc + Aria-Modal) */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex justify-end bg-[#3E2723]/40 backdrop-blur-xs"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            id="mobile-navigation-drawer"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Mobil navigasyon menüsü"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xs h-full bg-[#FFFDF9] shadow-warm-lg p-6 flex flex-col justify-between overflow-y-auto"
          >
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-[#3E2723]/10">
                <div className="flex items-center gap-3">
                  <Logo size={44} />
                  <span className="font-serif-display font-bold text-[#3E2723] text-base">
                    {siteConfig.shortName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    hamburgerBtnRef.current?.focus();
                  }}
                  aria-label="Menüyü kapat"
                  className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#F3ECE1] text-[#3E2723] active:scale-95 transition-transform cursor-pointer"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              <nav aria-label="Mobil menü bağlantıları" className="mt-6 flex flex-col gap-2">
                {NAV_ITEMS.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center min-h-[44px] px-4 py-2.5 rounded-2xl text-base font-medium text-[#3E2723] hover:bg-[#F3ECE1] transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>

            <div className="pt-6 border-t border-[#3E2723]/10">
              <p className="text-xs text-[#5D4037] mb-3">{siteConfig.address}</p>
              <a
                href={generalWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-center gap-2 w-full min-h-[48px] px-5 py-3 rounded-full bg-[#4F6A1A] text-white text-sm font-semibold shadow-sm active:scale-95 transition-transform"
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                <span>WhatsApp ile Sipariş</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Mobilde Ekranın Altında Sabit WhatsApp Butonu */}
      <div className="sm:hidden fixed bottom-4 left-4 right-4 z-30 pointer-events-none flex justify-center">
        <a
          href={generalWhatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp ile bilgi al veya sipariş ver"
          className="pointer-events-auto inline-flex items-center justify-center gap-2.5 w-full max-w-sm min-h-[48px] px-6 py-3 rounded-full bg-[#4F6A1A] text-white text-sm font-semibold shadow-warm-lg border border-white/15 active:scale-95 transition-transform"
        >
          <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>WhatsApp ile Sipariş / Bilgi Al</span>
        </a>
      </div>
    </>
  );
};
