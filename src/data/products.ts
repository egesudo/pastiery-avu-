export type ProductCategory =
  | 'yas-pasta'
  | 'ekler-ibiza'
  | 'kuru-pasta'
  | 'sutlu-tatlilar';

export type CakePortion = '7-8' | '10-12';

export type ProductFlavorTheme =
  | 'pistachio-cocoa'
  | 'dark-chocolate'
  | 'berry-cream'
  | 'caramel-lotus'
  | 'vanilla-milk'
  | 'golden-pastry';

export interface ProductThemeStyle {
  label: string;
  /** Katalog bölümü için düşük doygunluklu sıcak pastel arka plan (WCAG AA uyumlu) */
  sectionBg: string;
  /** Genişleyen detay paneli için tamamlayıcı sıcak yüzey tonu */
  panelBg: string;
  /** Tema vurgu rengi */
  accentColor: string;
}

export const PRODUCT_THEME_STYLES: Record<ProductFlavorTheme, ProductThemeStyle> = {
  'pistachio-cocoa': {
    label: 'Antep Fıstığı & Çikolata',
    sectionBg: '#EEF2E4',
    panelBg: '#F9FBF5',
    accentColor: '#4F6A1A',
  },
  'dark-chocolate': {
    label: 'Bitter & Sütlü Çikolata',
    sectionBg: '#EFE5DB',
    panelBg: '#FCF7F2',
    accentColor: '#5D4037',
  },
  'berry-cream': {
    label: 'Orman Meyveleri & Frambuaz',
    sectionBg: '#F6E8EA',
    panelBg: '#FEF8F9',
    accentColor: '#B23A48',
  },
  'caramel-lotus': {
    label: 'Karamel & Bisküvi',
    sectionBg: '#F5EBD9',
    panelBg: '#FDF9F1',
    accentColor: '#9A6324',
  },
  'vanilla-milk': {
    label: 'Süt Kreması & Vanilya',
    sectionBg: '#F7F1E3',
    panelBg: '#FEFCF7',
    accentColor: '#7A5C38',
  },
  'golden-pastry': {
    label: 'Geleneksel Fırın Dokusu',
    sectionBg: '#F4ECDD',
    panelBg: '#FDFBF4',
    accentColor: '#8C5E2A',
  },
};

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  portions?: CakePortion[];
  weight?: string;
  description: string;
  image?: string;
  verified: boolean;
  flavorTheme: ProductFlavorTheme;
  /** Yaş pasta gibi çoklu porsiyonlarda temsili TL fiyat */
  priceByPortion?: Record<CakePortion, number>;
  /** Tek porsiyon veya sabit gramajlı ürünlerde temsili TL fiyat */
  price?: number;
  /** Fiyat birimi etiketi (örn. 'Porsiyon', '500 GR Kutu') */
  priceUnit?: string;
  ingredients: string[];
  allergens: string[];
}

export interface CategoryMeta {
  id: ProductCategory;
  label: string;
  subtitle: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'yas-pasta',
    label: 'Yaş Pastalar',
    subtitle: 'Özel anlar ve kutlamalar için iki farklı boy seçeneğiyle hazırlanan yaş pastalar',
  },
  {
    id: 'ekler-ibiza',
    label: 'Ekler & İbiza',
    subtitle: 'Farklı krema ve sos dolgularıyla günlük hazırlanan ekler ve İbiza çeşitleri',
  },
  {
    id: 'kuru-pasta',
    label: 'Kuru Pastalar',
    subtitle: 'Çay saatlerine eşlik eden tatlı ve tuzlu kuru pasta ile kurabiye çeşitleri',
  },
  {
    id: 'sutlu-tatlilar',
    label: 'Sütlü Tatlılar',
    subtitle: 'Sütlü tatlı çeşitleri ve geleneksel tatlar',
  },
];

/**
 * AI Studio ortamında /products/<slug>.jpg henüz kopyalanmamışsa veya
 * önbelleklenmişse doğrudan hash'li varlık yoluna yedekleme tablosu.
 */
export const PRODUCT_IMAGE_FALLBACKS: Record<string, string> = {
  '/products/antep-fistikli-cikolatali-pasta.jpg':
    '/assets/aistudio/antep-fistikli-cikolatali-pasta_77fe479c.jpg',
  '/products/antep-fistikli-frambuaz-muz-cikolatali-pasta.jpg':
    '/assets/aistudio/antep-fistikli-frambuaz-muz-cikolatali-pasta_f46ab459.jpg',
  '/products/findik-cikolatali-pasta.jpg':
    '/assets/aistudio/findik-cikolatali-pasta_21b4e11c.jpg',
  '/products/profiterollu-cikolatali-pasta.jpg':
    '/assets/aistudio/profiterollu-cikolatali-pasta_cd443daf.jpg',
  '/products/cilek-muz-cikolatali-pasta.jpg':
    '/assets/aistudio/cilek-muz-cikolatali-pasta_222e8c09.jpg',
  '/products/orman-meyveli-cikolatali-pasta.jpg':
    '/assets/aistudio/orman-meyveli-cikolatali-pasta_73acbc96.jpg',
  '/products/beyaz-inci-pasta.jpg':
    '/assets/aistudio/beyaz-inci-pasta_c2875b6a.jpg',
  '/products/frambuaz-muz-vanilyali-pasta.jpg':
    '/assets/aistudio/frambuaz-muz-vanilyali-pasta_6fe1cd59.jpg',
  '/products/kus-yuvasi-pasta.jpg':
    '/assets/aistudio/kus-yuvasi-pasta_1387c92c.jpg',
  '/products/karisik-ekler-500gr.jpg':
    '/assets/aistudio/karisik-ekler-500gr_b1eb4d70.jpg',
  '/products/klasik-cikolatali-ekler.jpg':
    '/assets/aistudio/klasik-cikolatali-ekler_fafc8d62.jpg',
  '/products/orman-meyveli-ekler.jpg':
    '/assets/aistudio/orman-meyveli-ekler_bdb23af6.jpg',
  '/products/frambuazli-ekler.jpg':
    '/assets/aistudio/frambuazli-ekler_eff2827b.jpg',
  '/products/lotuslu-ekler.jpg':
    '/assets/aistudio/lotuslu-ekler_9e575206.jpg',
  '/products/vanilyali-ekler.jpg':
    '/assets/aistudio/vanilyali-ekler_3b336fe9.jpg',
  '/products/ibiza-tatlisi-muzlu-500gr.jpg':
    '/assets/aistudio/ibiza-tatlisi-muzlu-500gr_91cf6be1.jpg',
  '/products/aile-boyu-karisik-ekler-1kg.jpg':
    '/assets/aistudio/aile-boyu-karisik-ekler-1kg_8e453729.jpg',
  '/products/karisik-kuru-pasta.jpg':
    '/assets/aistudio/karisik-kuru-pasta_9c705af0.jpg',
  '/products/tuzlu-kuru-pasta-cesitleri.jpg':
    '/assets/aistudio/tuzlu-kuru-pasta-cesitleri_5d7e8b70.jpg',
  '/products/cikolatali-marmelatli-kuru-pasta.jpg':
    '/assets/aistudio/cikolatali-marmelatli-kuru-pasta_59d940dc.jpg',
  '/products/un-kurabiyesi.jpg':
    '/assets/aistudio/un-kurabiyesi_990fcf14.jpg',
  '/products/karamelli-trilece.jpg':
    '/assets/aistudio/karamelli-trilece_bc9f36a2.jpg',
  '/products/frambuazli-trilece.jpg':
    '/assets/aistudio/frambuazli-trilece_9e597f78.jpg',
  '/products/klasik-kazandibi.jpg':
    '/assets/aistudio/klasik-kazandibi_f3cf0fcb.jpg',
  '/products/firin-guvec-sutlac.jpg':
    '/assets/aistudio/firin-guvec-sutlac_452c3b30.jpg',
  '/products/soguk-baklava.jpg':
    '/assets/aistudio/soguk-baklava_9d184d61.jpg',
};

export const PRODUCTS: Product[] = [
  // 1. YAŞ PASTALAR (9 ürün - tümü verified: true, portions: ['7-8', '10-12'])
  {
    id: 'antep-fistikli-cikolatali-pasta',
    name: 'Antep Fıstıklı Çikolatalı Pasta',
    category: 'yas-pasta',
    portions: ['7-8', '10-12'],
    priceByPortion: { '7-8': 860, '10-12': 1150 },
    description: 'Antep fıstığı ve çikolata katmanlarıyla hazırlanan yaş pasta.',
    image: '/products/antep-fistikli-cikolatali-pasta.jpg',
    verified: true,
    flavorTheme: 'pistachio-cocoa',
    ingredients: [
      'Kakaolu pandispanya',
      'Kavrulmuş Gaziantep fıstığı',
      'Belçika tipi kuvertür çikolata ganaj',
      'Günlük pastacı kreması',
      'Süt ve doğal vanilya özütü',
    ],
    allergens: ['Gluten (Buğday Unu)', 'Süt ve Süt Ürünleri', 'Yumurta', 'Antep Fıstığı', 'Soya Lesitini'],
  },
  {
    id: 'antep-fistikli-frambuaz-muz-cikolatali-pasta',
    name: 'Antep Fıstıklı Frambuaz Muz Çikolatalı Pasta',
    category: 'yas-pasta',
    portions: ['7-8', '10-12'],
    priceByPortion: { '7-8': 880, '10-12': 1180 },
    description: 'Antep fıstığı, frambuaz, muz ve çikolata uyumuyla hazırlanan yaş pasta.',
    image: '/products/antep-fistikli-frambuaz-muz-cikolatali-pasta.jpg',
    verified: true,
    flavorTheme: 'pistachio-cocoa',
    ingredients: [
      'Kakaolu sünger pandispanya',
      'Antep fıstığı krokanı ve tozu',
      'Taze muz dilimleri ve frambuaz dolgusu',
      'Bitter çikolata kreması',
    ],
    allergens: ['Gluten (Buğday Unu)', 'Süt ve Süt Ürünleri', 'Yumurta', 'Antep Fıstığı', 'Soya Lesitini'],
  },
  {
    id: 'findik-cikolatali-pasta',
    name: 'Fındık Çikolatalı Pasta',
    category: 'yas-pasta',
    portions: ['7-8', '10-12'],
    priceByPortion: { '7-8': 810, '10-12': 1080 },
    description: 'Fındık parçaları ve çikolatalı krema ile hazırlanan yaş pasta.',
    image: '/products/findik-cikolatali-pasta.jpg',
    verified: true,
    flavorTheme: 'dark-chocolate',
    ingredients: [
      'Kakaolu yumuşak kek katmanları',
      'Kavrulmuş Giresun fındık parçaları',
      'Fındık pralinli çikolata kreması',
      'Parlak kakao ganaj kaplama',
    ],
    allergens: ['Gluten (Buğday Unu)', 'Süt ve Süt Ürünleri', 'Yumurta', 'Fındık', 'Soya Lesitini'],
  },
  {
    id: 'profiterollu-cikolatali-pasta',
    name: 'Profiterollü Çikolatalı Pasta',
    category: 'yas-pasta',
    portions: ['7-8', '10-12'],
    priceByPortion: { '7-8': 840, '10-12': 1120 },
    description: 'Profiterol topları ve yoğun çikolata kaplamasıyla hazırlanan yaş pasta.',
    image: '/products/profiterollu-cikolatali-pasta.jpg',
    verified: true,
    flavorTheme: 'dark-chocolate',
    ingredients: [
      'Kakaolu pandispanya tabanı',
      'Krema dolgulu el yapımı profiterol topları',
      'Bitter ve sütlü çikolata sosu',
      'Vanilyalı pastacı kreması',
    ],
    allergens: ['Gluten (Buğday Unu)', 'Süt ve Süt Ürünleri', 'Yumurta', 'Soya Lesitini'],
  },
  {
    id: 'cilek-muz-cikolatali-pasta',
    name: 'Çilek Muz Çikolatalı Pasta',
    category: 'yas-pasta',
    portions: ['7-8', '10-12'],
    priceByPortion: { '7-8': 790, '10-12': 1060 },
    description: 'Çilek, muz dilimleri ve çikolata kremasıyla hazırlanan yaş pasta.',
    image: '/products/cilek-muz-cikolatali-pasta.jpg',
    verified: true,
    flavorTheme: 'berry-cream',
    ingredients: [
      'Taze çilek ve dilimlenmiş muz',
      'Sütlü çikolatalı kadife krema',
      'Yumuşak pandispanya',
      'Doğal meyve parıltısı',
    ],
    allergens: ['Gluten (Buğday Unu)', 'Süt ve Süt Ürünleri', 'Yumurta', 'Soya Lesitini'],
  },
  {
    id: 'orman-meyveli-cikolatali-pasta',
    name: 'Orman Meyveli Çikolatalı Pasta',
    category: 'yas-pasta',
    portions: ['7-8', '10-12'],
    priceByPortion: { '7-8': 820, '10-12': 1090 },
    description: 'Seçilmiş orman meyveleri ve çikolatalı krema ile hazırlanan yaş pasta.',
    image: '/products/orman-meyveli-cikolatali-pasta.jpg',
    verified: true,
    flavorTheme: 'berry-cream',
    ingredients: [
      'Böğürtlen, frambuaz ve yaban mersini',
      'Yoğun kakao kreması',
      'Kakaolu pandispanya',
      'Meyve özlü hafif şurup',
    ],
    allergens: ['Gluten (Buğday Unu)', 'Süt ve Süt Ürünleri', 'Yumurta', 'Soya Lesitini'],
  },
  {
    id: 'beyaz-inci-pasta',
    name: 'Beyaz İnci Pasta',
    category: 'yas-pasta',
    portions: ['7-8', '10-12'],
    priceByPortion: { '7-8': 800, '10-12': 1070 },
    description: 'Zarif beyaz krema dokusu ve özel sunumuyla hazırlanan yaş pasta.',
    image: '/products/beyaz-inci-pasta.jpg',
    verified: true,
    flavorTheme: 'vanilla-milk',
    ingredients: [
      'Vanilyalı sade pandispanya',
      'Beyaz çikolata ve süt kreması',
      'İnci şekerleme dokunuşu',
      'Hafif sütlü ıslatma şurubu',
    ],
    allergens: ['Gluten (Buğday Unu)', 'Süt ve Süt Ürünleri', 'Yumurta', 'Soya Lesitini'],
  },
  {
    id: 'frambuaz-muz-vanilyali-pasta',
    name: 'Frambuaz Muz Vanilyalı Pasta',
    category: 'yas-pasta',
    portions: ['7-8', '10-12'],
    priceByPortion: { '7-8': 780, '10-12': 1040 },
    description: 'Frambuaz, muz ve vanilyalı krema katmanlarıyla hazırlanan yaş pasta.',
    image: '/products/frambuaz-muz-vanilyali-pasta.jpg',
    verified: true,
    flavorTheme: 'berry-cream',
    ingredients: [
      'Vanilyalı sünger kek',
      'Frambuaz püresi ve taze muz',
      'Hafif vanilyalı diplomat krema',
      'Taze meyve süslemesi',
    ],
    allergens: ['Gluten (Buğday Unu)', 'Süt ve Süt Ürünleri', 'Yumurta'],
  },
  {
    id: 'kus-yuvasi-pasta',
    name: 'Kuş Yuvası Pasta',
    category: 'yas-pasta',
    portions: ['7-8', '10-12'],
    priceByPortion: { '7-8': 850, '10-12': 1140 },
    description: 'Özel kuş yuvası formunda çikolatalı krema dokusuyla hazırlanan yaş pasta.',
    image: '/products/kus-yuvasi-pasta.jpg',
    verified: true,
    flavorTheme: 'dark-chocolate',
    ingredients: [
      'Çikolatalı pandispanya katmanları',
      'Rendelenmiş bitter ve sütlü çikolata bukleleri',
      'Fındık kreması dolgusu',
      'Kakao tozu kaplaması',
    ],
    allergens: ['Gluten (Buğday Unu)', 'Süt ve Süt Ürünleri', 'Yumurta', 'Fındık', 'Soya Lesitini'],
  },

  // 2. EKLER & İBİZA (8 ürün - tümü verified: true)
  {
    id: 'karisik-ekler-500gr',
    name: 'Karışık Ekler (500 GR)',
    category: 'ekler-ibiza',
    weight: '500 GR',
    price: 340,
    priceUnit: '500 GR Kutu',
    description: 'Farklı sos ve krema çeşitlerinden oluşan 500 gramlık karışık ekler kutusu.',
    image: '/products/karisik-ekler-500gr.jpg',
    verified: true,
    flavorTheme: 'dark-chocolate',
    ingredients: [
      'Pataşu (choux) hamuru',
      'Vanilyalı ve kakaolu pastacı kreması',
      'Bitter çikolata, frambuaz, lotus ve beyaz sos kaplama',
      'Tereyağı ve taze süt',
    ],
    allergens: ['Gluten (Buğday Unu)', 'Süt ve Süt Ürünleri', 'Yumurta', 'Soya Lesitini', 'Sert Kabuklu Meyve İzleri'],
  },
  {
    id: 'klasik-cikolatali-ekler',
    name: 'Klasik Çikolatalı Ekler',
    category: 'ekler-ibiza',
    price: 190,
    priceUnit: 'Porsiyon (4 Adet)',
    description: 'İçi krema dolgulu, üzeri klasik çikolata kaplamalı ekler.',
    image: '/products/klasik-cikolatali-ekler.jpg',
    verified: true,
    flavorTheme: 'dark-chocolate',
    ingredients: [
      'Günlük pişirilmiş pataşu hamuru',
      'Vanilya çubuklu pastacı kreması',
      'Parlak bitter çikolata ganaj',
    ],
    allergens: ['Gluten (Buğday Unu)', 'Süt ve Süt Ürünleri', 'Yumurta', 'Soya Lesitini'],
  },
  {
    id: 'orman-meyveli-ekler',
    name: 'Orman Meyveli Ekler',
    category: 'ekler-ibiza',
    price: 205,
    priceUnit: 'Porsiyon (4 Adet)',
    description: 'Orman meyveli sos kaplaması ve yumuşak krema dolgusuyla hazırlanan ekler.',
    image: '/products/orman-meyveli-ekler.jpg',
    verified: true,
    flavorTheme: 'berry-cream',
    ingredients: [
      'Hafif pataşu hamuru',
      'Yumuşak sütlü pastacı kreması',
      'Orman meyveli özel glaze sos',
    ],
    allergens: ['Gluten (Buğday Unu)', 'Süt ve Süt Ürünleri', 'Yumurta'],
  },
  {
    id: 'frambuazli-ekler',
    name: 'Frambuazlı Ekler',
    category: 'ekler-ibiza',
    price: 205,
    priceUnit: 'Porsiyon (4 Adet)',
    description: 'Canlı frambuaz kaplaması ve kremasıyla hazırlanan ekler.',
    image: '/products/frambuazli-ekler.jpg',
    verified: true,
    flavorTheme: 'berry-cream',
    ingredients: [
      'Pataşu hamuru',
      'Frambuaz aromalı ipeksi krema',
      'Gerçek frambuazlı sos kaplama',
    ],
    allergens: ['Gluten (Buğday Unu)', 'Süt ve Süt Ürünleri', 'Yumurta'],
  },
  {
    id: 'lotuslu-ekler',
    name: 'Lotuslu Ekler',
    category: 'ekler-ibiza',
    price: 220,
    priceUnit: 'Porsiyon (4 Adet)',
    description: 'Lotus bisküvi kreması ve parçacıklarıyla hazırlanan ekler.',
    image: '/products/lotuslu-ekler.jpg',
    verified: true,
    flavorTheme: 'caramel-lotus',
    ingredients: [
      'Tereyağlı pataşu hamuru',
      'Karamelize bisküvi kreması dolgusu',
      'Kıtır Lotus bisküvi kırıntıları',
    ],
    allergens: ['Gluten (Buğday Unu)', 'Süt ve Süt Ürünleri', 'Yumurta', 'Soya'],
  },
  {
    id: 'vanilyali-ekler',
    name: 'Vanilyalı Ekler',
    category: 'ekler-ibiza',
    price: 190,
    priceUnit: 'Porsiyon (4 Adet)',
    description: 'Vanilyalı krema dolgusu ve beyaz sos kaplamasıyla hazırlanan ekler.',
    image: '/products/vanilyali-ekler.jpg',
    verified: true,
    flavorTheme: 'vanilla-milk',
    ingredients: [
      'Pataşu hamuru',
      'Madagaskar vanilyalı pastacı kreması',
      'Beyaz çikolata sos kaplama',
    ],
    allergens: ['Gluten (Buğday Unu)', 'Süt ve Süt Ürünleri', 'Yumurta', 'Soya Lesitini'],
  },
  {
    id: 'ibiza-tatlisi-muzlu-500gr',
    name: 'İbiza Tatlısı Muzlu (500 GR)',
    category: 'ekler-ibiza',
    weight: '500 GR',
    price: 360,
    priceUnit: '500 GR Kutu',
    description: 'Muz dolgulu ve kakaolu sarma dokusuyla 500 gramlık İbiza tatlısı.',
    image: '/products/ibiza-tatlisi-muzlu-500gr.jpg',
    verified: true,
    flavorTheme: 'dark-chocolate',
    ingredients: [
      'Kakaolu ince kek katmanı',
      'İpek kıvamlı sütlü krema',
      'Taze muz bütün dolgusu',
      'Dış katman kakao bisküvi kırıntısı',
    ],
    allergens: ['Gluten (Buğday Unu)', 'Süt ve Süt Ürünleri', 'Yumurta', 'Fındık İzleri'],
  },
  {
    id: 'aile-boyu-karisik-ekler-1kg',
    name: 'Aile Boyu Karışık Ekler (1 KG)',
    category: 'ekler-ibiza',
    weight: '1 KG',
    price: 650,
    priceUnit: '1 KG Kutu',
    description: 'Paylaşımlık 1 kilogramlık kutuda farklı lezzetlerden oluşan karışık ekler.',
    image: '/products/aile-boyu-karisik-ekler-1kg.jpg',
    verified: true,
    flavorTheme: 'caramel-lotus',
    ingredients: [
      'Günlük taze pataşu hamurları',
      'Çikolatalı, vanilyalı, meyveli ve karamelli kremalar',
      'Seçme ganaj ve meyve glaze kaplamaları',
    ],
    allergens: ['Gluten (Buğday Unu)', 'Süt ve Süt Ürünleri', 'Yumurta', 'Soya Lesitini', 'Sert Kabuklu Meyve İzleri'],
  },

  // 3. KURU PASTALAR (4 ürün - 3 verified: true, 1 verified: false)
  {
    id: 'karisik-kuru-pasta',
    name: 'Karışık Kuru Pasta (Tatlı & Tuzlu)',
    category: 'kuru-pasta',
    weight: '500 GR',
    price: 290,
    priceUnit: '500 GR Kutu',
    description: 'Çay saatleri için bir arada sunulan tatlı ve tuzlu kuru pasta çeşitleri.',
    image: '/products/karisik-kuru-pasta.jpg',
    verified: true,
    flavorTheme: 'golden-pastry',
    ingredients: [
      'Buğday unu ve pastane tereyağı',
      'Mahlep, çörek otu ve susam',
      'Marmelat ve bitter kakao dokunuşu',
      'Toz şeker ve kaya tuzu',
    ],
    allergens: ['Gluten (Buğday Unu)', 'Süt ve Süt Ürünleri', 'Yumurta', 'Susam', 'Sert Kabuklu Meyve İzleri'],
  },
  {
    id: 'tuzlu-kuru-pasta-cesitleri',
    name: 'Tuzlu Kuru Pasta Çeşitleri',
    category: 'kuru-pasta',
    weight: '500 GR',
    price: 280,
    priceUnit: '500 GR Kutu',
    description: 'Günlük hazırlanan çeşitli tuzlu kuru pasta alternatifleri.',
    image: '/products/tuzlu-kuru-pasta-cesitleri.jpg',
    verified: false,
    flavorTheme: 'golden-pastry',
    ingredients: [
      'Buğday unu, tereyağı ve bitkisel yağ',
      'Mahlep, çörek otu ve kavrulmuş susam',
      'Yumurta sarısı parıltısı',
    ],
    allergens: ['Gluten (Buğday Unu)', 'Süt ve Süt Ürünleri', 'Yumurta', 'Susam'],
  },
  {
    id: 'cikolatali-marmelatli-kuru-pasta',
    name: 'Tatlı Çikolatalı & Marmelatlı Kuru Pasta',
    category: 'kuru-pasta',
    weight: '500 GR',
    price: 300,
    priceUnit: '500 GR Kutu',
    description: 'Çikolata kaplamalı ve meyve marmelatlı tatlı kuru pasta çeşitleri.',
    image: '/products/cikolatali-marmelatli-kuru-pasta.jpg',
    verified: true,
    flavorTheme: 'caramel-lotus',
    ingredients: [
      'Ağızda dağılan tereyağlı kurabiye hamuru',
      'Kayısı ve vişne meyve marmelatı',
      'Bitter çikolata ve hindistancevizi süslemesi',
    ],
    allergens: ['Gluten (Buğday Unu)', 'Süt ve Süt Ürünleri', 'Yumurta', 'Soya Lesitini'],
  },
  {
    id: 'un-kurabiyesi',
    name: 'Geleneksel Un Kurabiyesi',
    category: 'kuru-pasta',
    weight: '500 GR',
    price: 270,
    priceUnit: '500 GR Kutu',
    description: 'Pudra şekeri dokunuşuyla ağızda dağılan geleneksel un kurabiyesi.',
    image: '/products/un-kurabiyesi.jpg',
    verified: true,
    flavorTheme: 'vanilla-milk',
    ingredients: [
      'Kavrulmuş özel buğday unu',
      'Sade yağ ve tereyağı',
      'İnce öğütülmüş pudra şekeri',
      'Mısır nişastası',
    ],
    allergens: ['Gluten (Buğday Unu)', 'Süt ve Süt Ürünleri'],
  },

  // 4. SÜTLÜ TATLILAR & ÖZEL LEZZETLER (8 ürün - 5 verified: true, 3 verified: false ve görselsiz)
  {
    id: 'karamelli-trilece',
    name: 'Karamelli Trileçe',
    category: 'sutlu-tatlilar',
    price: 195,
    priceUnit: 'Porsiyon',
    description: 'Sütlü kek dokusu ve üzerinde karamel sosuyla hazırlanan trileçe.',
    image: '/products/karamelli-trilece.jpg',
    verified: true,
    flavorTheme: 'caramel-lotus',
    ingredients: [
      'Hafif sünger pandispanya',
      'Üç çeşit süt karışımı ve taze krema',
      'Ev yapımı karamel sos ve beyaz krema çizgisi',
    ],
    allergens: ['Gluten (Buğday Unu)', 'Süt ve Süt Ürünleri', 'Yumurta'],
  },
  {
    id: 'frambuazli-trilece',
    name: 'Frambuazlı Trileçe',
    category: 'sutlu-tatlilar',
    price: 205,
    priceUnit: 'Porsiyon',
    description: 'Sütlü kek dokusu ve ferah frambuaz sosuyla hazırlanan trileçe.',
    image: '/products/frambuazli-trilece.jpg',
    verified: true,
    flavorTheme: 'berry-cream',
    ingredients: [
      'Yumuşak sünger kek',
      'Soğuk süt ve krema şerbeti',
      'Ferahlatıcı frambuaz sosu',
    ],
    allergens: ['Gluten (Buğday Unu)', 'Süt ve Süt Ürünleri', 'Yumurta'],
  },
  {
    id: 'klasik-kazandibi',
    name: 'Klasik Kazandibi',
    category: 'sutlu-tatlilar',
    price: 185,
    priceUnit: 'Porsiyon',
    description: 'Üzeri karamelize dokulu, geleneksel kıvamda klasik kazandibi.',
    image: '/products/klasik-kazandibi.jpg',
    verified: true,
    flavorTheme: 'caramel-lotus',
    ingredients: [
      'Günlük tam yağlı süt',
      'Pirinç unu ve buğday nişastası',
      'Karamelize edilmiş şeker katmanı ve doğal tarçın',
    ],
    allergens: ['Süt ve Süt Ürünleri', 'Gluten İzleri İçerebilir'],
  },
  {
    id: 'firin-guvec-sutlac',
    name: 'Fırın Güveç Sütlaç',
    category: 'sutlu-tatlilar',
    price: 185,
    priceUnit: 'Porsiyon (Güveç)',
    description: 'Toprak güveçte üzeri kızartılarak fırınlanmış sütlaç.',
    image: '/products/firin-guvec-sutlac.jpg',
    verified: true,
    flavorTheme: 'vanilla-milk',
    ingredients: [
      'Tam yağlı günlük süt',
      'Baldo pirinç ve pirinç nişastası',
      'Toz şeker ve vanilya',
    ],
    allergens: ['Süt ve Süt Ürünleri'],
  },
  {
    id: 'soguk-baklava',
    name: 'Soğuk Baklava',
    category: 'sutlu-tatlilar',
    weight: '500 GR',
    price: 490,
    priceUnit: '500 GR Paket',
    description: 'Sütlü şerbeti, kakao ve Antep fıstığı dokunuşuyla hazırlanan soğuk baklava.',
    image: '/products/soguk-baklava.jpg',
    verified: true,
    flavorTheme: 'pistachio-cocoa',
    ingredients: [
      'El açması ince baklava yufkası',
      'Saf Urfa sadeyağı',
      'Boz Gaziantep fıstığı',
      'Sütlü hafif şerbet ve kakao rendesi',
    ],
    allergens: ['Gluten (Buğday Unu)', 'Süt ve Süt Ürünleri', 'Antep Fıstığı', 'Soya Lesitini'],
  },
  {
    id: 'soguk-kadayif',
    name: 'Soğuk Kadayıf',
    category: 'sutlu-tatlilar',
    weight: '500 GR',
    price: 460,
    priceUnit: '500 GR Paket',
    description: 'Sütlü şerbet ile hafifletilmiş soğuk kadayıf tatlısı.',
    image: undefined,
    verified: false,
    flavorTheme: 'pistachio-cocoa',
    ingredients: [
      'İnce tel kadayıf',
      'Tereyağı ve sütlü soğuk şerbet',
      'Antep fıstığı ve sütlü çikolata tozu',
    ],
    allergens: ['Gluten (Buğday Unu)', 'Süt ve Süt Ürünleri', 'Antep Fıstığı'],
  },
  {
    id: 'akiskan-cikolatali-izmir-bomba',
    name: 'Akışkan Çikolatalı İzmir Bomba',
    category: 'sutlu-tatlilar',
    price: 170,
    priceUnit: 'Porsiyon (3 Adet)',
    description: 'İnce hamur içinde akışkan çikolata dolgulu İzmir bomba.',
    image: undefined,
    verified: false,
    flavorTheme: 'dark-chocolate',
    ingredients: [
      'İnce açılmış tereyağlı hamur',
      'Akışkan fındıklı kakaolu pralin dolgu',
    ],
    allergens: ['Gluten (Buğday Unu)', 'Süt ve Süt Ürünleri', 'Fındık', 'Soya Lesitini'],
  },
  {
    id: 'renkli-makaron-cesitleri',
    name: 'Renkli Makaron Çeşitleri',
    category: 'sutlu-tatlilar',
    price: 260,
    priceUnit: 'Kutu (6 Adet)',
    description: 'Farklı renk ve krema dolgularıyla hazırlanan makaron çeşitleri.',
    image: undefined,
    verified: false,
    flavorTheme: 'berry-cream',
    ingredients: [
      'İnce öğütülmüş badem unu',
      'Yumurta akı ve pudra şekeri',
      'Frambuaz, fıstık, çikolata ve vanilya ganaj',
    ],
    allergens: ['Yumurta', 'Badem', 'Süt ve Süt Ürünleri', 'Antep Fıstığı İzleri'],
  },
];
