import React, { useId } from 'react';

interface WhatsAppIconProps {
  className?: string;
  /** 'official' resmi WhatsApp rengi + krem-beyaz çerçeve; 'monochrome' ise tek renk currentColor */
  variant?: 'official' | 'monochrome';
}

/**
 * Resmi WhatsApp marka amblemi (yüksek hassasiyetli 3 katmanlı vektör SVG).
 * Kurumsal kimlik paleti (#FFFDF9 sıcak fildişi çerçeve) ve resmi WhatsApp
 * yeşili (#25D366 -> #1FA855) ile koyu buton yüzeylerinde net ayrışma ve
 * profesyonel görünüm sağlar.
 */
export const WhatsAppIcon: React.FC<WhatsAppIconProps> = ({
  className = 'w-5 h-5 shrink-0',
  variant = 'official',
}) => {
  const gradientId = useId();

  if (variant === 'monochrome') {
    return (
      <svg
        viewBox="0 0 32 32"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        aria-hidden="true"
        className={className}
      >
        <path d="M4.2 22.98A13.85 13.85 0 1 1 9.3 27.93L2.35 29.75Zm17.95-3.33c.15-.55 0-.9-.5-1.15l-2.1-1c-.5-.2-.85-.1-1.2.3l-.7.85c-.25.3-.6.3-1 .1-1.15-.55-2.15-1.45-2.75-2.45-.25-.4-.3-.75-.05-1l.65-.7c.35-.4.45-.75.25-1.2l-.95-2.25c-.25-.6-.55-.85-1-.85h-.95c-.7 0-1.7.7-2.1 1.7-.5 1.3-.2 3.05 1.05 4.8 1.85 2.6 4.3 4.4 6.55 5.15 2.05.7 3.55.4 4.35-.3Z" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="16"
          y1="4"
          x2="16"
          y2="27.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#29DC6D" />
          <stop offset="100%" stopColor="#1CA952" />
        </linearGradient>
      </defs>

      {/* Kurumsal fildişi dış çerçeve: fıstık yeşili ve bordo butonlarda net kontrast */}
      <path
        d="M4.2 22.98A13.85 13.85 0 1 1 9.3 27.93L2.35 29.75Z"
        fill="#FFFDF9"
      />

      {/* Resmi WhatsApp yeşil konuşma balonu */}
      <path
        d="M6.05 21.85A11.65 11.65 0 1 1 10.15 25.9L4.85 27.25Z"
        fill={`url(#${gradientId})`}
      />

      {/* Resmi beyaz telefon ahizesi silüeti */}
      <path
        d="M22.15 19.65c-.45.95-1.55 1.8-2.65 1.95-.7.1-1.6.15-2.6-.2-.6-.2-1.35-.45-2.35-.9-3.9-1.75-6.45-5.75-6.65-6.05-.2-.25-1.55-2.1-1.55-4s.95-2.85 1.35-3.25c.35-.4.8-.5 1.05-.5h.8c.25 0 .6-.05.9.7.35.85 1.15 2.85 1.25 3.05.1.2.15.45.05.7-.15.25-.25.45-.45.7-.2.25-.45.55-.65.75-.2.2-.4.45-.15.85.25.4 1.05 1.75 2.25 2.8 1.55 1.4 2.85 1.85 3.25 2.05.4.2.65.15.9-.1.25-.3 1.05-1.25 1.35-1.65.25-.4.55-.35.9-.2.35.15 2.35 1.1 2.75 1.3.4.2.65.3.75.45.1.2.1 1.05-.35 1.9Z"
        fill="#FFFFFF"
      />
    </svg>
  );
};
