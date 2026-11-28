import React from 'react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { Icon } from './ui/IconRegistry';

export interface WhatsAppActionButtonProps {
  href: string;
  label: string;
  variant?: 'pistachio' | 'raspberry';
  size?: 'sm' | 'md' | 'lg';
  ariaLabel?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
  children?: React.ReactNode;
}

const VARIANT_CLASSES: Record<'pistachio' | 'raspberry', string> = {
  pistachio: [
    'bg-gradient-to-b from-[#58781E] via-[#4F6A1A] to-[#425915]',
    'hover:from-[#628522] hover:via-[#55731D] hover:to-[#476017]',
    'border border-[#FFFDF9]/20 hover:border-[#FFFDF9]/35',
    'shadow-[inset_0_1px_0_rgba(255,253,249,0.24),0_8px_20px_-6px_rgba(62,39,35,0.26)]',
    'hover:shadow-[inset_0_1px_0_rgba(255,253,249,0.34),0_16px_30px_-6px_rgba(62,39,35,0.36),0_0_0_3px_rgba(79,106,26,0.18)]',
  ].join(' '),
  raspberry: [
    'bg-gradient-to-b from-[#C14352] via-[#B23A48] to-[#982E3B]',
    'hover:from-[#CC4A5A] hover:via-[#BA3F4E] hover:to-[#A1323F]',
    'border border-[#FFFDF9]/22 hover:border-[#FFFDF9]/38',
    'shadow-[inset_0_1px_0_rgba(255,253,249,0.24),0_8px_20px_-6px_rgba(120,30,40,0.28)]',
    'hover:shadow-[inset_0_1px_0_rgba(255,253,249,0.34),0_16px_30px_-6px_rgba(120,30,40,0.38),0_0_0_3px_rgba(178,58,72,0.18)]',
  ].join(' '),
};

const SIZE_CLASSES: Record<'sm' | 'md' | 'lg', { button: string; icon: string }> = {
  sm: {
    button: 'min-h-[44px] px-5 py-2.5 text-sm gap-2.5',
    icon: 'w-5 h-5',
  },
  md: {
    button: 'min-h-[48px] px-6 py-3.5 text-sm gap-2.5',
    icon: 'w-[22px] h-[22px]',
  },
  lg: {
    button: 'min-h-[50px] px-7 py-3.5 text-sm sm:text-base gap-3',
    icon: 'w-6 h-6',
  },
};

/**
 * Kurumsal kimlik estetiğine uygun, resmi WhatsApp ikonlu ve hover'da kapağı
 * aralanan pasta kutusu mikro-etkileşimine sahip ortak sipariş / iletişim düğmesi.
 */
export const WhatsAppActionButton: React.FC<WhatsAppActionButtonProps> = ({
  href,
  label,
  variant = 'pistachio',
  size = 'md',
  ariaLabel,
  onClick,
  className = '',
  children,
}) => {
  const sizeSpec = SIZE_CLASSES[size];

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      onClick={onClick}
      className={[
        'group icon-box-hover relative overflow-hidden inline-flex items-center justify-center rounded-full',
        'text-white font-semibold tracking-[0.01em] whitespace-nowrap text-center cursor-pointer',
        'transition-all duration-250 ease-[cubic-bezier(0.22,1,0.36,1)]',
        'hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.96]',
        VARIANT_CLASSES[variant],
        sizeSpec.button,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Hover sırasında soldan sağa süzülen saten parlama geçişi */}
      <span
        aria-hidden="true"
        className="whatsapp-btn-sheen pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-[#FFFDF9]/25 to-transparent -translate-x-full group-hover:translate-x-[360%] transition-transform duration-700 ease-out"
      />

      {children}

      <WhatsAppIcon
        className={`${sizeSpec.icon} relative z-10 shrink-0 transition-transform duration-200 ease-out group-hover:scale-110 group-hover:-rotate-6`}
      />

      <span className="relative z-10">{label}</span>

      <span className="relative z-10 inline-flex items-center gap-1 shrink-0 opacity-85 group-hover:opacity-100 transition-opacity">
        <Icon
          name="pasta-kutusu"
          size={16}
          variant="duotone"
          style={{ ['--icon-accent' as string]: 'var(--icon-vanilya)' }}
        />
        <Icon
          name="arrow-up-right"
          size={16}
          className="transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </span>
    </a>
  );
};
