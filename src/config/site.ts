export interface WorkingHoursConfig {
  /** Ekranda gösterilecek çalışma saati metni, örn: "Her gün 07:00 – 23:00" */
  display: string;
  /** Europe/Istanbul saatine göre Açık/Kapalı rozeti hesaplaması için 24 saat formatında açılış ("07:00") */
  openTime?: string;
  /** Europe/Istanbul saatine göre Açık/Kapalı rozeti hesaplaması için 24 saat formatında kapanış ("23:00") */
  closeTime?: string;
}

export interface SiteConfig {
  name: string;
  alternateName: string;
  shortName: string;
  branchName: string;
  /** Karşılama sahnesi (Splash) başlığı */
  splashTitle: string;
  address: string;
  addressStructured: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  /**
   * Uluslararası formatta (+ veya boşluk olmadan) WhatsApp numarası.
   * Yayından önce işletme sahibi gerçek numarasını buraya girmelidir.
   */
  whatsappNumber: string;
  /**
   * Çalışma saatleri (opsiyonel). Boş bırakıldığında (undefined) çalışma saati
   * ve "Şu an açık/kapalı" rozeti hata vermeden gizlenir.
   */
  hours?: WorkingHoursConfig;
  /**
   * Sosyal medya bağlantıları (opsiyonel). Boş bırakıldığında ilgili ikonlar gizlenir.
   */
  instagram?: string;
  facebook?: string;
  /**
   * Kuruluş yılı (opsiyonel). Boş bırakıldığında rozette yıl ifadesi gösterilmez.
   */
  foundedYear?: number;
  /**
   * verified: false olan ürünleri (görseli veya onayı henüz tamamlanmamış 4 ürün)
   * vitrinde göstermek için bayrak. Varsayılan: false.
   */
  SHOW_UNVERIFIED: boolean;
  mapsEmbedUrl: string;
  mapsDirectionsUrl: string;
  assets: {
    logo: string;
    logoFallback: string;
    storefront: string;
    storefrontFallback: string;
    interiorImage: string;
    interiorImageFallback: string;
    interiorVideo: string;
    interiorVideoFallback: string;
    interiorPoster: string;
    interiorPosterFallback: string;
  };
}

const ADDRESS = 'Halkalı Merkez, Karadut Sokağı No:14, 34303 Küçükçekmece/İstanbul';

export const siteConfig: SiteConfig = {
  name: 'Gaziantepli Çavuşoğulları Pastaneleri',
  alternateName: 'Çavuşoğulları Pastaneleri',
  shortName: 'Çavuşoğulları',
  branchName: 'Halkalı Merkez Şubemiz',
  splashTitle: 'Çavuşoğulları Pastahanesine Hoş Geldiniz',
  address: ADDRESS,
  addressStructured: {
    streetAddress: 'Halkalı Merkez, Karadut Sokağı No:14',
    addressLocality: 'Küçükçekmece',
    addressRegion: 'İstanbul',
    postalCode: '34303',
    addressCountry: 'TR',
  },
  whatsappNumber: '90XXXXXXXXXX',
  hours: undefined,
  instagram: undefined,
  facebook: undefined,
  foundedYear: undefined,
  SHOW_UNVERIFIED: false,
  mapsEmbedUrl: `https://www.google.com/maps?q=${encodeURIComponent(ADDRESS)}&output=embed`,
  mapsDirectionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(ADDRESS)}`,
  assets: {
    logo: '/brand/logo-lowres-source.png',
    logoFallback: '/assets/aistudio/logo-lowres-source_3d7993d4.png',
    storefront: '/images/storefront.jpg',
    storefrontFallback: '/assets/aistudio/storefront_cd82becb.jpg',
    interiorImage: '/images/interior.webp',
    interiorImageFallback: '/assets/aistudio/interior_b9f75ac5.webp',
    interiorVideo: '/video/interior.mp4',
    interiorVideoFallback: '/assets/aistudio/interior_c23c49be.mp4',
    interiorPoster: '/video/interior-poster.jpg',
    interiorPosterFallback: '/assets/aistudio/interior-poster_38272694.jpg',
  },
};

/**
 * WhatsApp sipariş/bilgi alma bağlantısı üretir.
 */
export function buildWhatsAppUrl(message: string): string {
  const cleanNumber = siteConfig.whatsappNumber.replace(/[^0-9A-Za-z]/g, '');
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * hours alanı tanımlıysa Europe/Istanbul saatine göre mağazanın açık olup olmadığını hesaplar.
 * Tanımlı değilse null döner.
 */
export function getStoreOpenStatus(hours?: WorkingHoursConfig): {
  isOpen: boolean;
  label: string;
} | null {
  if (!hours || !hours.openTime || !hours.closeTime) {
    return null;
  }

  try {
    const formatter = new Intl.DateTimeFormat('tr-TR', {
      timeZone: 'Europe/Istanbul',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const parts = formatter.formatToParts(new Date());
    const hourPart = parts.find((p) => p.type === 'hour')?.value ?? '00';
    const minutePart = parts.find((p) => p.type === 'minute')?.value ?? '00';
    const currentMinutes = parseInt(hourPart, 10) * 60 + parseInt(minutePart, 10);

    const [openH, openM] = hours.openTime.split(':').map((n) => parseInt(n, 10));
    const [closeH, closeM] = hours.closeTime.split(':').map((n) => parseInt(n, 10));
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    let isOpen = false;
    if (closeMinutes >= openMinutes) {
      isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
    } else {
      // Gece yarısını geçen kapanış saati
      isOpen = currentMinutes >= openMinutes || currentMinutes < closeMinutes;
    }

    return {
      isOpen,
      label: isOpen ? 'Şu an açık' : 'Şu an kapalı',
    };
  } catch {
    return null;
  }
}
