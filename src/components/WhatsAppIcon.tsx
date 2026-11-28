import React from 'react';
import { Icon } from './ui/IconRegistry';

interface WhatsAppIconProps {
  className?: string;
  /** 'official' CTA bağlamında WhatsApp yeşili rozet; 'monochrome' ise tek renk currentColor */
  variant?: 'official' | 'monochrome';
}

/**
 * Resmi WhatsApp marka ikonu (Simple Icons vektör geometrisi, oran değiştirilmeden).
 * WhatsApp yeşili yalnızca CTA bağlamında yüksek kontrastlı fildişi rozet üzerinde uygulanır.
 */
export const WhatsAppIcon: React.FC<WhatsAppIconProps> = ({
  className = 'w-5 h-5 shrink-0',
  variant = 'official',
}) => {
  if (variant === 'monochrome') {
    return <Icon name="whatsapp" size={20} className={className} />;
  }

  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center rounded-full bg-[#FFFDF9] text-[#1CA952] p-0.5 shadow-[0_1px_2px_rgba(30,20,14,0.18)] ${className}`.trim()}
    >
      <Icon name="whatsapp" size={16} className="w-full h-full" />
    </span>
  );
};
