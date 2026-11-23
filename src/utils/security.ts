import type { ProductCategory } from '../data/products';

const ALLOWED_CATEGORIES: ReadonlySet<string> = new Set<ProductCategory>([
  'yas-pasta',
  'ekler-ibiza',
  'kuru-pasta',
  'sutlu-tatlilar',
]);

export const TRUSTED_MAPS_EMBED_HOSTS = [
  'www.google.com',
  'maps.google.com',
] as const;

export const TRUSTED_MAPS_LINK_HOSTS = [
  'www.google.com',
  'maps.google.com',
  'maps.app.goo.gl',
] as const;

export const TRUSTED_INSTAGRAM_HOSTS = [
  'instagram.com',
  'www.instagram.com',
] as const;

export const TRUSTED_FACEBOOK_HOSTS = [
  'facebook.com',
  'www.facebook.com',
  'm.facebook.com',
] as const;

/**
 * Kontrol karakterlerini temizleyip metni güvenli uzunluğa sınırlar.
 */
export function sanitizeTextInput(input: unknown, maxLength = 350): string {
  if (typeof input !== 'string') return '';
  // ASCII kontrol karakterlerini (NUL, CR/LF vb.) tek boşluğa indirge
  const cleaned = input.replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim();
  return cleaned.slice(0, Math.max(0, maxLength));
}

/**
 * Bir URL'nin yalnızca HTTPS protokolü kullandığını, kimlik bilgisi içermediğini
 * ve izin verilen alan adlarından birine ait olduğunu doğrular.
 */
export function isAllowedHttpsUrl(
  rawUrl: unknown,
  allowedHosts: readonly string[]
): boolean {
  if (typeof rawUrl !== 'string') return false;
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed.length > 2048) return false;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:') return false;
    if (parsed.username || parsed.password) return false;

    const host = parsed.hostname.toLowerCase();
    return allowedHosts.some((allowed) => host === allowed.toLowerCase());
  } catch {
    return false;
  }
}

/**
 * Güvenli olmayan (javascript:, data:, bilinmeyen alan adı vb.) harici bağlantıları
 * güvenli varsayılan değere düşürür.
 */
export function sanitizeSafeHref(
  rawUrl: unknown,
  allowedHosts: readonly string[],
  fallback = '#'
): string {
  if (!isAllowedHttpsUrl(rawUrl, allowedHosts)) {
    return fallback;
  }
  return new URL((rawUrl as string).trim()).toString();
}

/**
 * WhatsApp bağlantısını alan adı, telefon formatı ve mesaj temizliği ile güvenli oluşturur.
 */
export function buildSafeWhatsAppUrl(phoneNumber: string, message: string): string {
  const safeDigits = phoneNumber.replace(/[^0-9A-Za-z]/g, '');
  const cleanRecipient =
    /^[0-9]{10,15}$/.test(safeDigits) || safeDigits === '90XXXXXXXXXX'
      ? safeDigits
      : '90XXXXXXXXXX';

  const cleanMessage = sanitizeTextInput(message, 450);
  const url = new URL(`https://wa.me/${cleanRecipient}`);
  if (cleanMessage) {
    url.searchParams.set('text', cleanMessage);
  }
  return url.toString();
}

/**
 * Köken (origin) bilgisini JSON-LD içinde güvenli kullanmak üzere doğrular.
 */
export function sanitizeOriginUrl(
  rawOrigin: unknown,
  fallback = 'https://cavusogullaripastaneleri.com'
): string {
  if (typeof rawOrigin !== 'string') return fallback;
  try {
    const parsed = new URL(rawOrigin.trim());
    if (
      (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') ||
      parsed.username ||
      parsed.password
    ) {
      return fallback;
    }
    return parsed.origin;
  } catch {
    return fallback;
  }
}

/**
 * JSON-LD verisini HTML <script> kırılımına karşı güvenli biçimde serileştirir.
 */
export function serializeJsonLdSafe(data: Record<string, unknown>): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

/**
 * Katalog kategori seçimi için sıkı izinli liste doğrulaması.
 */
export function isValidProductCategory(value: unknown): value is ProductCategory {
  return typeof value === 'string' && ALLOWED_CATEGORIES.has(value);
}
