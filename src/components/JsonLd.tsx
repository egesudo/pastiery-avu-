import React from 'react';
import { siteConfig } from '../config/site';

/**
 * Schema.org Bakery JSON-LD yapılandırılmış verisi.
 * Telefon, çalışma saatleri ve sosyal bağlantılar yalnızca siteConfig içinde tanımlıysa eklenir.
 */
export const JsonLd: React.FC = () => {
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://cavusogullaripastaneleri.com';

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Bakery',
    name: siteConfig.name,
    alternateName: siteConfig.alternateName,
    url: origin,
    logo: `${origin}${siteConfig.assets.logoFallback}`,
    image: `${origin}${siteConfig.assets.storefrontFallback}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.addressStructured.streetAddress,
      addressLocality: siteConfig.addressStructured.addressLocality,
      addressRegion: siteConfig.addressStructured.addressRegion,
      postalCode: siteConfig.addressStructured.postalCode,
      addressCountry: siteConfig.addressStructured.addressCountry,
    },
  };

  // Telefon yalnızca varsayılan placeholder ("90XXXXXXXXXX") değiştirilmişse eklenir
  if (
    siteConfig.whatsappNumber &&
    !siteConfig.whatsappNumber.includes('X') &&
    siteConfig.whatsappNumber.trim().length >= 10
  ) {
    schema.telephone = `+${siteConfig.whatsappNumber.replace(/^\+/, '')}`;
  }

  // Çalışma saatleri yalnızca config'te tanımlıysa eklenir
  if (siteConfig.hours?.display) {
    schema.openingHours = siteConfig.hours.display;
  }

  // Sosyal medya linkleri yalnızca config'te tanımlıysa eklenir
  const sameAs: string[] = [];
  if (siteConfig.instagram) sameAs.push(siteConfig.instagram);
  if (siteConfig.facebook) sameAs.push(siteConfig.facebook);
  if (sameAs.length > 0) {
    schema.sameAs = sameAs;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};
