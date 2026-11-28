import React, { useEffect, useState } from 'react';
import { Icon } from './ui/IconRegistry';

/**
 * Sayfa aşağı kaydırıldığında beliren, krema buklesi ikonlu "Yukarı Çık" düğmesi.
 * ≥44px erişilebilir dokunma alanı ve görünür odak halkası sunar.
 */
export const ScrollToTopButton: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 720);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  const handleScrollTop = () => {
    const prefersReducedMotion = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <button
      type="button"
      onClick={handleScrollTop}
      aria-label="Sayfanın başına dön"
      className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-30 inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#FFFDF9]/95 border border-[#3B2314]/16 text-[#3B2314] shadow-warm hover:bg-[#F3ECE1] hover:-translate-y-0.5 active:scale-[0.96] transition-all cursor-pointer"
    >
      <Icon name="krema-bukle-yukari" size={24} variant="duotone" />
    </button>
  );
};
