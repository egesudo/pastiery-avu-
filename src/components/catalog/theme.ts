import type { ProductCategory } from '../../data/products';

/**
 * Pastane renk paleti (Splash ekranıyla uyumlu kakao, vanilya, krem, karamel ve çilek pembe vurgu)
 */
export const CATALOG_PALETTE = {
  cocoa: '#3B2314',
  cocoaSoft: '#5A3621',
  vanilla: '#F6E9D2',
  cream: '#FFF8EC',
  caramel: '#C98A3E',
  strawberry: '#D9566B',
} as const;

/**
 * Sekme görünümünde kısa, tek satırlık kategori etiketleri (sıra korunur)
 */
export const CATEGORY_TAB_LABELS: Record<ProductCategory, string> = {
  'yas-pasta': 'Yaş Pasta',
  'ekler-ibiza': 'Ekler & İbiza',
  'kuru-pasta': 'Kuru Pastalar',
  'sutlu-tatlilar': 'Sütlü Tatlılar',
};

export interface CategorySauceConfig {
  id: ProductCategory;
  name: string;
  /** Ana sos dolgusu */
  fill: string;
  /** Üst/parlaklık katmanı */
  glossFill: string;
  /** Alt dalga parlaklık çizgisi */
  sheenStroke: string;
  /** Kenar çizgisi (özellikle açık renk süt kreması için tanımlı kenar) */
  edgeStroke: string;
  /** Seyrek dekoratif pudra şekeri / kakao / karamel parçacık rengi */
  fleckColor: string;
  /** Parlaklık opaklığı */
  glossOpacity: number;
}

/**
 * Hedef kategoriye göre akan sos teması — kolayca güncellenebilir merkezi yapı
 */
export const SAUCE_THEME_BY_CATEGORY: Record<ProductCategory, CategorySauceConfig> = {
  'yas-pasta': {
    id: 'yas-pasta',
    name: 'Sıvı Çikolata',
    fill: '#3B2314',
    glossFill: '#563420',
    sheenStroke: 'rgba(255, 248, 236, 0.32)',
    edgeStroke: '#2A180D',
    fleckColor: '#F6E9D2',
    glossOpacity: 0.45,
  },
  'ekler-ibiza': {
    id: 'ekler-ibiza',
    name: 'Bitter Çikolata Ganaj',
    fill: '#26140B',
    glossFill: '#462617',
    sheenStroke: 'rgba(255, 248, 236, 0.48)',
    edgeStroke: '#1B0D06',
    fleckColor: '#C98A3E',
    glossOpacity: 0.58,
  },
  'kuru-pasta': {
    id: 'kuru-pasta',
    name: 'Karamel & Bal Şerbeti',
    fill: '#C98A3E',
    glossFill: '#DDA458',
    sheenStroke: 'rgba(255, 248, 236, 0.42)',
    edgeStroke: '#A76D28',
    fleckColor: '#FFF8EC',
    glossOpacity: 0.52,
  },
  'sutlu-tatlilar': {
    id: 'sutlu-tatlilar',
    name: 'Süt Kreması & Vanilya',
    fill: '#F6E9D2',
    glossFill: '#FFF8EC',
    sheenStroke: 'rgba(255, 255, 255, 0.72)',
    edgeStroke: '#DEC9A4',
    fleckColor: '#C98A3E',
    glossOpacity: 0.65,
  },
};

/**
 * Geçiş zamanlamaları (Toplam sos akışı < 1000 ms)
 */
export const SAUCE_TIMINGS = {
  /** Üstten akarak ürün alanını kaplama süresi (ms) */
  coverMs: 450,
  /** İçerik değiştikten sonra aşağı süzülerek açılma süresi (ms) */
  drainMs: 450,
  /** Kartların ardışık damla düşüş aralığı (sn) */
  cardStaggerSec: 0.06,
  /** Kart düşüş süresi (sn) */
  cardDropSec: 0.36,
  /** Reduced-motion sade fade süresi (ms) */
  reducedFadeMs: 180,
} as const;
