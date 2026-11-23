export interface HeroHeadingWord {
  text: string;
  trailingPunctuation?: string;
  isAccent?: boolean;
  isScript?: boolean;
}

export interface HeroHeadingLine {
  id: string;
  words: HeroHeadingWord[];
}

export type QualityTier = 'high' | 'low';
export type DripTone = 'dark-chocolate' | 'milk-chocolate' | 'vanilla-cream';

/**
 * Hero başlık satırları ve vurgu kelimeleri ("Geleneksel Ustalık", "Tazelik")
 */
export const HERO_HEADING_LINES: HeroHeadingLine[] = [
  {
    id: 'line-1',
    words: [{ text: 'Her' }, { text: 'Dilimde' }],
  },
  {
    id: 'line-2',
    words: [
      { text: 'Geleneksel', isScript: true },
      { text: 'Ustalık', trailingPunctuation: ',', isAccent: true, isScript: true },
    ],
  },
  {
    id: 'line-3',
    words: [
      { text: 'Her' },
      { text: 'Lokmada' },
      { text: 'Tazelik', isAccent: true, isScript: true },
    ],
  },
];

/**
 * Tek merkezden yönetilen renk paleti sabitleri (Başlık + 3D Yaş Pasta + Fallback)
 */
export const HERO_COLORS = {
  creamBg: '#FAF7F0',
  surfaceCream: '#FAF6F0',
  porcelainStand: '#FFFDF9',
  porcelainRimGold: '#C98A3E',
  darkCocoa: '#3B2314',
  cakeSpongeCocoa: '#5A3420',
  milkChocolate: '#7A4A2B',
  caramel: '#C98A3E',
  vanillaCream: '#F3DFB5',
  vanillaStroke: '#C98A3E',
  darkDrop: '#2A180D',
  glazeDark: '#2A180D',
  glazeMid: '#7A4A2B',
  berryRed: '#B3263E',
  mintLeaf: '#4F6A1A',
  powderSugar: '#FFFDF9',
} as const;

/**
 * Tek merkezden yönetilen zamanlama ve ritim sabitleri (Başlık + 3D Pasta SENKRON)
 */
export const HERO_TIMINGS = {
  /** Kelimeler arası giriş dökülme aralığı (ms) */
  wordStaggerMs: 160,
  /** Her kelimenin dökülme + yaylanma süresi (ms) */
  wordPourDurationMs: 560,
  /** Harfler arası giriş dökülme aralığı (ms) */
  letterStaggerMs: 22,
  /** Her harfin SVG maskesinden üstten aşağı akış süresi (ms) */
  letterPourDurationMs: 580,
  /** İtalik vurgu kelimeleri parlama döngüsü (ms) */
  shimmerIntervalMs: 6000,
  /** Parlama geçiş süresi (ms) */
  shimmerDurationMs: 1800,
  /** Başlık ve pasta için ortak ilk damla başlangıç gecikmesi (ms) */
  initialDripDelayMs: 1800,
  /** Ortak damla/akış periyodu (DRIP_PERIOD = 6 sn) */
  dripPeriodMs: 6000,
  /** Ortak aktif damla/akış penceresi (DRIP_ACTIVE = 2.5 sn; ~3.5 sn dinlenme) */
  dripActiveMs: 2500,
  /** Damla içindeki maksimum rastgele gecikme (ms) */
  maxDropRandomDelayMs: 1200,
  /** Damlanın uzama (scaleY) süresi (ms) */
  dropElongateMs: 700,
  /** Damlanın düşüş süresi (ms) */
  dropFallMs: 600,
  /** Düşüş sonu sıçrama/halka süresi (ms) */
  dropSplashMs: 320,
  /** Vanilya şeridi tek tam dalga akış süresi (ms) */
  ribbonWaveDurationMs: 2500,
  /** Hover/dokunma ile ek damla oluşturma minimum bekleme süresi (ms) */
  interactiveCooldownMs: 1500,
  /** Splash + başlık girişi sonrası 3D pastanın sahneye giriş gecikmesi (ms) */
  cakeEntranceAfterHeadingMs: 1600,
  /** 3D pasta tablaya iniş süresi (sn) */
  cakeDropInDurationSec: 0.85,
  /** Sürükleme bırakıldıktan sonra otomatik dönüşün yeniden başlama beklemesi (ms) */
  orbitResumeDelayMs: 2500,
  /** Hover/dokunma jöle sallanma süresi (sn) */
  jellyWobbleDurationSec: 0.6,
} as const;

/**
 * Başlık ve 3D pasta damla sayıları, mesafeleri ve oranları
 */
export const HERO_DRIPS = {
  desktopMinCount: 3,
  desktopMaxCount: 5,
  mobileMinCount: 2,
  mobileMaxCount: 3,
  mobileBreakpointPx: 640,
  desktopMinFallPx: 32,
  desktopMaxFallPx: 52,
  mobileMinFallPx: 20,
  mobileMaxFallPx: 32,
  /** 3D pasta aktif pencerede glazür uçlarından kopan damla sayısı */
  cakeActiveDropCountHigh: 3,
  cakeActiveDropCountLow: 2,
  /** Renk olasılık eşikleri: %50 çikolata, %30 süt çikolatası, %20 vanilya */
  colorWeights: {
    chocolateThreshold: 0.5,
    milkThreshold: 0.8,
  },
} as const;

/**
 * 3D Pasta Sahnesi boyut, etkileşim ve kalite eşikleri
 */
export const HERO_CAKE_CONFIG = {
  /** Otomatik dönüş hızı (rad/sn) */
  autoRotateSpeedRad: 0.6,
  /** 45° dilim açıkken kesiti incelemek için yavaşlatılmış dönüş hızı (rad/sn) */
  autoRotateSliceSpeedRad: 0.22,
  /** Durgunluktan sabit hıza easeInOutCubic ivmelenme süresi (sn) */
  autoRotateEaseInDurationSec: 1.5,
  /** Duraklama/sürükleme anında yumuşak duruş süresi (sn) */
  autoRotateEaseOutDurationSec: 0.35,
  /** Dilim açılış/kapanışında dönüş hızı geçiş süresi (sn) */
  autoRotateSliceBlendSec: 0.85,
  /** Kamera perspektif açısı (derece) ve pozisyon */
  cameraFovDeg: 35,
  cameraPosition: [0, 2.35, 5.15] as const,
  cameraTarget: [0, 0.25, 0] as const,
  /** OrbitControls dikey açı sınırları (~60° - 85°) */
  minPolarAngleRad: (58 * Math.PI) / 180,
  maxPolarAngleRad: (84 * Math.PI) / 180,
  /** Pasta boyutları (Three.js birimi) */
  cakeRadius: 1.18,
  cakeTotalHeight: 0.96,
  standTopY: 0.0,
  standBaseY: -0.44,
  sliceAngleRad: Math.PI / 4, // 45 derece dilim
  sliceStartAngleRad: -Math.PI / 8, // Ön-sağ izleyiciye dönük merkezlenen kama
  sliceSlideOutDistance: 0.66,
  sliceTiltRad: 0.09,
  /** Üst dekor ve atmosfer sayıları */
  dripLobeCount: 8,
  rosetteCount: 11,
  berryCount: 5,
  sugarParticleCount: 10, // <= 12
  /** Cihaz kalite eşikleri */
  qualityThresholds: {
    mobileMaxWidthPx: 768,
    lowCpuCoresMax: 4,
    lowDeviceMemoryGbMax: 4,
    maxDpr: 1.5,
  },
} as const;

export function pickWeightedDripColor(rand = Math.random()): {
  tone: DripTone;
  fill: string;
  stroke?: string;
} {
  const { chocolateThreshold, milkThreshold } = HERO_DRIPS.colorWeights;
  if (rand < chocolateThreshold) {
    return {
      tone: 'dark-chocolate',
      fill:
        rand < chocolateThreshold * 0.5
          ? HERO_COLORS.darkCocoa
          : HERO_COLORS.darkDrop,
    };
  }
  if (rand < milkThreshold) {
    return {
      tone: 'milk-chocolate',
      fill: HERO_COLORS.milkChocolate,
    };
  }
  return {
    tone: 'vanilla-cream',
    fill: HERO_COLORS.vanillaCream,
    stroke: HERO_COLORS.vanillaStroke,
  };
}

/**
 * Software WebGL veya düşük donanım kapasitesine göre kalite seviyesini belirler
 */
export function detectCakeQualityTier(): {
  tier: QualityTier;
  webglSupported: boolean;
  isSoftwareGl: boolean;
} {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return { tier: 'high', webglSupported: true, isSoftwareGl: false };
  }

  let webglSupported = false;
  let isSoftwareGl = false;

  try {
    const probeCanvas = document.createElement('canvas');
    const gl = (probeCanvas.getContext('webgl2') ||
      probeCanvas.getContext('webgl') ||
      probeCanvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;

    if (gl) {
      webglSupported = true;
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      const param = debugInfo ? debugInfo.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const rendererName = String(gl.getParameter(param) || '');
      isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(rendererName);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
  } catch {
    webglSupported = false;
  }

  if (!webglSupported) {
    return { tier: 'low', webglSupported: false, isSoftwareGl: false };
  }

  const isMobile =
    window.innerWidth <= HERO_CAKE_CONFIG.qualityThresholds.mobileMaxWidthPx ||
    (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);

  const cores = navigator.hardwareConcurrency ?? 8;
  const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;

  const isLowCpuOrMem =
    cores <= HERO_CAKE_CONFIG.qualityThresholds.lowCpuCoresMax ||
    (typeof deviceMemory === 'number' &&
      deviceMemory <= HERO_CAKE_CONFIG.qualityThresholds.lowDeviceMemoryGbMax);

  const tier: QualityTier = (isMobile && isLowCpuOrMem) || isSoftwareGl ? 'low' : 'high';
  return { tier, webglSupported, isSoftwareGl };
}
