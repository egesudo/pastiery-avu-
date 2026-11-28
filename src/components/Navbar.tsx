import React, { useState, useEffect, useRef } from 'react';
import { Logo } from './Logo';
import { WhatsAppActionButton } from './WhatsAppActionButton';
import { siteConfig, buildWhatsAppUrl } from '../config/site';
import { Icon, type IconName } from './ui/IconRegistry';
import { ScallopDivider } from './icons/BakeryDividers';

interface NavItem {
  label: string;
  href: string;
  sectionId: string;
  icon: IconName;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Ana Sayfa', href: '#ana-sayfa', sectionId: 'ana-sayfa', icon: 'store' },
  { label: 'Sıcak Yuvamız', href: '#atmosfer', sectionId: 'atmosfer', icon: 'ekler-ibiza' },
  { label: 'Hakkımızda', href: '#hakkimizda', sectionId: 'hakkimizda', icon: 'usta-eli' },
  { label: 'Lezzetlerimiz', href: '#lezzetlerimiz', sectionId: 'lezzetlerimiz', icon: 'yas-pasta' },
  { label: 'İletişim & Konum', href: '#iletisim', sectionId: 'iletisim', icon: 'pin-kiraz' },
];

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('ana-sayfa');
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

  // Masaüstü aktif link krema dalgası için hafif bölüm takibi
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const targets = NAV_ITEMS.map((item) => document.getElementById(item.sectionId)).filter(
      (el): el is HTMLElement => Boolean(el)
    );
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) {
          setActiveSection(visible.target.id);
        }
      },
      { rootMargin: '-25% 0px -55% 0px', threshold: [0.1, 0.35] }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
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
          {/* Sol: Logo (≤48px) + Marka Adı */}
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

          {/* Orta: Masaüstü Bölümlere Çapa Bağlantıları (ikon yok, krema dalgası alt çizgisi) */}
          <nav
            aria-label="Ana navigasyon"
            className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#5D4037]"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.sectionId;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setActiveSection(item.sectionId)}
                  aria-current={isActive ? 'location' : undefined}
                  className={`group/nav relative py-1.5 whitespace-nowrap shrink-0 transition-colors ${
                    isActive ? 'text-[#3B2314] font-semibold' : 'hover:text-[#3B2314]'
                  }`}
                >
                  <span>{item.label}</span>
                  {/* Küçük krema dalgası alt çizgisi (aktifte sabit, hover'da çikolata/karamel akışıyla belirir) */}
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute left-0 right-0 -bottom-0.5 h-[6px] overflow-hidden transition-[opacity,transform] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] origin-left motion-reduce:transition-none ${
                      isActive
                        ? 'opacity-100 scale-x-100'
                        : 'opacity-0 scale-x-0 group-hover/nav:opacity-90 group-hover/nav:scale-x-100'
                    }`}
                  >
                    <svg
                      viewBox="0 0 64 8"
                      preserveAspectRatio="none"
                      className="w-full h-full"
                      fill="none"
                    >
                      <path
                        d="M1 4.5C7 1.8 11 6.8 17 4.2C23 1.6 27 6.8 33 4.2C39 1.6 43 6.8 49 4.2C54 2 58 6 63 4.2"
                        stroke={isActive ? 'var(--icon-karamel)' : 'var(--icon-sut-cikolatasi)'}
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </a>
              );
            })}
          </nav>

          {/* Sağ: WhatsApp ile Sipariş Butonu + Mobil Hamburger */}
          <div className="flex items-center gap-2 shrink-0">
            <WhatsAppActionButton
              href={generalWhatsAppUrl}
              label="WhatsApp ile Sipariş"
              size="sm"
              onClick={triggerRipple}
              className="hidden sm:inline-flex shrink-0"
            >
              {rippleKey && (
                <span
                  key={rippleKey}
                  className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-white/35 animate-ripple pointer-events-none"
                  aria-hidden="true"
                />
              )}
            </WhatsAppActionButton>

            {/* Mobil Hamburger Butonu (≥44x44px, hamburger-krema <-> X 250ms morph) */}
            <button
              ref={hamburgerBtnRef}
              type="button"
              onClick={() => setDrawerOpen((prev) => !prev)}
              aria-expanded={drawerOpen}
              aria-controls="mobile-navigation-drawer"
              aria-label={drawerOpen ? 'Menüyü kapat' : 'Menüyü aç'}
              className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#FFFDF9] border border-[#3E2723]/12 text-[#3B2314] active:scale-95 transition-transform cursor-pointer"
            >
              <Icon name="hamburger-krema" size={20} isOpen={drawerOpen} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobil Çekmece Menü (Focus Trap + Esc + Aria-Modal + Üst Tente Kenarı) */}
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
            className="relative w-full max-w-xs h-full bg-[#FFFDF9] shadow-warm-lg flex flex-col justify-between overflow-y-auto"
          >
            {/* Açılan panelin üst kenarında tente (scallop) dokusu */}
            <div className="bg-[#F3ECE1] pt-3 pb-1 px-6">
              <div className="flex items-center justify-between py-2">
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
                  className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#FFFDF9] border border-[#3E2723]/10 text-[#3B2314] active:scale-95 transition-transform cursor-pointer"
                >
                  <Icon name="close" size={20} />
                </button>
              </div>
            </div>
            <ScallopDivider
              fillColor="#F3ECE1"
              strokeColor="rgba(59, 35, 20, 0.14)"
              className="-mt-0.5 shrink-0"
            />

            <div className="flex-1 px-6 py-4">
              <nav aria-label="Mobil menü bağlantıları" className="flex flex-col gap-1.5">
                {NAV_ITEMS.map((item, index) => {
                  const isActive = activeSection === item.sectionId;
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={() => {
                        setActiveSection(item.sectionId);
                        setDrawerOpen(false);
                      }}
                      style={{
                        animationDelay: `${index * 50}ms`,
                      }}
                      className={`animate-nav-drawer-item flex items-center gap-3 min-h-[44px] px-4 py-2.5 rounded-2xl text-base font-medium transition-colors motion-reduce:transition-none ${
                        isActive
                          ? 'bg-[#F3ECE1] text-[#3B2314] font-semibold'
                          : 'text-[#3E2723] hover:bg-[#F3ECE1]/80'
                      }`}
                    >
                      <Icon
                        name={item.icon}
                        size={20}
                        variant="duotone"
                        className="text-[#3B2314]"
                      />
                      <span>{item.label}</span>
                    </a>
                  );
                })}
              </nav>
            </div>

            <div className="p-6 pt-5 border-t border-[#3E2723]/10">
              <p className="flex items-start gap-2 text-xs text-[#5D4037] mb-3">
                <Icon
                  name="pin-kiraz"
                  size={16}
                  variant="duotone"
                  className="text-[#3B2314] mt-0.5"
                />
                <span>{siteConfig.address}</span>
              </p>
              <WhatsAppActionButton
                href={generalWhatsAppUrl}
                label="WhatsApp ile Sipariş"
                size="md"
                onClick={() => setDrawerOpen(false)}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobilde Ekranın Altında Sabit WhatsApp Butonu */}
      <div className="sm:hidden fixed bottom-4 left-4 right-4 z-30 pointer-events-none flex justify-center">
        <WhatsAppActionButton
          href={generalWhatsAppUrl}
          label="WhatsApp ile Sipariş / Bilgi Al"
          ariaLabel="WhatsApp ile bilgi al veya sipariş ver"
          size="md"
          className="pointer-events-auto w-full max-w-sm shadow-warm-lg"
        />
      </div>
    </>
  );
};
