import React from 'react';
import { siteConfig } from '../config/site';
import {
  TRUSTED_FACEBOOK_HOSTS,
  TRUSTED_INSTAGRAM_HOSTS,
  sanitizeOriginUrl,
  sanitizeSafeHref,
  serializeJsonLdSafe,
} from '../utils/security';

/**
 * Schema.org Bakery JSON-LD yapılandırılmış verisi.
 * Tüm köken ve dış URL'ler doğrulanır; HTML kırılım karakterleri güvenli serileştirilir.
 */
export const JsonLd: React.FC = () => {
  const origin = sanitizeOriginUrl(
    typeof window !== 'undefined' ? window.location.origin : undefined,
    'https://cavusogullaripastaneleri.com'
  );

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

  if (
    siteConfig.whatsappNumber &&
    !siteConfig.whatsappNumber.includes('X') &&
    siteConfig.whatsappNumber.trim().length >= 10
  ) {
    schema.telephone = `+${siteConfig.whatsappNumber.replace(/^\+/, '')}`;
  }

  if (siteConfig.hours?.display) {
    schema.openingHours = siteConfig.hours.display;
  }

  const sameAs: string[] = [];
  const safeInstagram = sanitizeSafeHref(
    siteConfig.instagram,
    TRUSTED_INSTAGRAM_HOSTS,
    ''
  );
  const safeFacebook = sanitizeSafeHref(
    siteConfig.facebook,
    TRUSTED_FACEBOOK_HOSTS,
    ''
  );
  if (safeInstagram) sameAs.push(safeInstagram);
  if (safeFacebook) sameAs.push(safeFacebook);
  if (sameAs.length > 0) {
    schema.sameAs = sameAs;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLdSafe(schema) }}
    />
  );
};
