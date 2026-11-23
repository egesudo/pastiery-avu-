import type { SplashIconId } from './icons';

/**
 * Tohumlu (seeded) deterministik rastgele sayı üreticisi (mulberry32).
 * Sunucu ve istemcide birebir aynı çıktıyı üreterek hydration uyuşmazlığını önler.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 0.00–0.80 sn: Ekranın üstündeki çikolata ve vanilya krema perdesi için
 * alt kenarı belirgin ve farklı uzunlukta damla uçlarıyla düzensiz SVG path üretir.
 */
export function generateTopCurtainPath(
  width = 1440,
  baseHeight = 58,
  dripCount = 18,
  maxDripExtra = 68,
  seed = 104729
): string {
  const rand = mulberry32(seed);
  const segWidth = width / dripCount;

  let d = `M 0 0 L ${width} 0 L ${width} ${baseHeight.toFixed(1)}`;

  for (let i = dripCount - 1; i >= 0; i--) {
    const rightX = (i + 1) * segWidth;
    const leftX = i * segWidth;
    const midX = leftX + segWidth * (0.34 + rand() * 0.32);
    const dripTipY = baseHeight + 20 + rand() * maxDripExtra;
    const valleyY = baseHeight - 8 + rand() * 10;

    const cp1X = rightX - segWidth * 0.22;
    const cp2X = midX + segWidth * 0.2;
    const cp3X = midX - segWidth * 0.2;
    const cp4X = leftX + segWidth * 0.22;

    d += ` C ${cp1X.toFixed(1)} ${baseHeight.toFixed(1)}, ${cp2X.toFixed(1)} ${dripTipY.toFixed(
      1
    )}, ${midX.toFixed(1)} ${dripTipY.toFixed(1)}`;
    d += ` C ${cp3X.toFixed(1)} ${dripTipY.toFixed(1)}, ${cp4X.toFixed(1)} ${valleyY.toFixed(
      1
    )}, ${leftX.toFixed(1)} ${valleyY.toFixed(1)}`;
  }

  d += ' Z';
  return d;
}

export interface TopCurtainDropletSpec {
  id: string;
  cx: number;
  startY: number;
  fallDistance: number;
  rx: number;
  ry: number;
  delay: number;
  duration: number;
  flavor: 'dark-chocolate' | 'cocoa' | 'vanilla-cream';
}

/**
 * Üst pasta glazürü perdesinden (çikolata ve vanilya kreması uçlarından)
 * damla damla kopup aşağı süzülen belirgin krema ve çikolata damlacıkları.
 */
export function generateTopCurtainDroplets(
  width = 1440,
  count = 18,
  seed = 771205
): TopCurtainDropletSpec[] {
  const rand = mulberry32(seed);
  const slotWidth = width / count;
  const flavors: TopCurtainDropletSpec['flavor'][] = [
    'dark-chocolate',
    'vanilla-cream',
    'cocoa',
    'vanilla-cream',
  ];

  const droplets: TopCurtainDropletSpec[] = [];
  for (let i = 0; i < count; i++) {
    const cx = Math.round((slotWidth * (i + 0.22 + rand() * 0.56)) * 10) / 10;
    const startY = Math.round((92 + rand() * 38) * 10) / 10;
    const fallDistance = Math.round((56 + rand() * 58) * 10) / 10;
    const rx = Math.round((5.8 + rand() * 3.0) * 10) / 10;
    const ry = Math.round((rx * (1.35 + rand() * 0.25)) * 10) / 10;
    const delay = Math.round((0.4 + rand() * 1.45) * 100) / 100;
    const duration = Math.round((0.75 + rand() * 0.35) * 100) / 100;
    const flavor = flavors[i % flavors.length];

    droplets.push({
      id: `curtain-drop-${i}`,
      cx,
      startY,
      fallDistance,
      rx,
      ry,
      delay,
      duration,
      flavor,
    });
  }

  return droplets;
}

/**
 * 0.50–2.30 sn: Harf clipPath'i içinde yukarıdan aşağıya (`translateY(-110%) -> 0`)
 * akan çikolata katmanı path'i.
 */
export function generateLetterFillDripPath(
  width = 980,
  solidHeight = 140,
  tongueCount = 20,
  maxTongueLength = 74,
  seed = 202611
): string {
  const rand = mulberry32(seed);
  const step = width / tongueCount;

  let d = `M -20 -65 L ${width + 20} -65 L ${width + 20} ${solidHeight.toFixed(1)}`;

  for (let i = tongueCount - 1; i >= 0; i--) {
    const rightX = (i + 1) * step;
    const leftX = i * step;
    const midX = (leftX + rightX) / 2;
    const tongueLen = 22 + rand() * maxTongueLength;
    const tipY = solidHeight + tongueLen;

    d += ` C ${(rightX - step * 0.18).toFixed(1)} ${solidHeight.toFixed(1)}, ${(
      midX +
      step * 0.22
    ).toFixed(1)} ${tipY.toFixed(1)}, ${midX.toFixed(1)} ${tipY.toFixed(1)}`;
    d += ` C ${(midX - step * 0.22).toFixed(1)} ${tipY.toFixed(1)}, ${(
      leftX +
      step * 0.18
    ).toFixed(1)} ${solidHeight.toFixed(1)}, ${leftX.toFixed(1)} ${solidHeight.toFixed(1)}`;
  }

  d += ' L -20 ' + solidHeight.toFixed(1) + ' Z';
  return d;
}

export interface CreamDripSpec {
  id: string;
  x: number;
  y: number;
  width: number;
  length: number;
  delay: number;
  detaches: boolean;
  detachDelay: number;
  flavor: 'vanilla' | 'cocoa';
}

/**
 * 1.80–2.70 sn: Her yazı satırının altından sarkan belirgin vanilya krema ve kakao damlaları.
 * Uzunlukları 20–44 birim, genişlikleri 9.2–13.4 birim arası;
 * belirlenen damlalar ucundan koparak yer çekimiyle aşağı düşer.
 */
export function generateHangingCreamDrips(
  lineStartX: number,
  lineEndX: number,
  baselineY: number,
  count: number,
  detachCount: number,
  seed: number,
  baseDelay = 1.8
): CreamDripSpec[] {
  const rand = mulberry32(seed);
  const span = lineEndX - lineStartX;
  const slotWidth = span / count;

  const detachIndices = new Set<number>();
  while (detachIndices.size < Math.min(detachCount, count)) {
    const candidate = Math.floor(rand() * count);
    detachIndices.add(candidate);
  }

  const drips: CreamDripSpec[] = [];
  for (let i = 0; i < count; i++) {
    const jitter = (rand() - 0.5) * slotWidth * 0.5;
    const x = Math.round((lineStartX + (i + 0.5) * slotWidth + jitter) * 10) / 10;
    const length = Math.round((20 + rand() * 24) * 10) / 10; // 20–44 birim arası
    const width = Math.round((9.2 + rand() * 4.2) * 10) / 10; // 9.2–13.4 birim (belirgin dolgun damla)
    const delay = Math.round((baseDelay + rand() * 0.34) * 100) / 100;
    const detaches = detachIndices.has(i);
    const detachDelay = Math.round((delay + 0.22 + rand() * 0.16) * 100) / 100;
    const flavor: CreamDripSpec['flavor'] = i % 3 === 1 ? 'cocoa' : 'vanilla';

    drips.push({
      id: `drip-${seed}-${i}`,
      x,
      y: baselineY,
      width,
      length,
      delay,
      detaches,
      detachDelay,
      flavor,
    });
  }

  return drips;
}

export type ParticleDepthLayer = 'far' | 'mid' | 'near';

export interface RainParticleSpec {
  id: number;
  icon: SplashIconId;
  layer: ParticleDepthLayer;
  /** Yatay konum yüzdesi (şeritlere bölünmüş, kümelenmesiz) */
  leftPercent: number;
  /** Ekranda piksel boyutu (dolgu fıstıklar 20–27px, diğerleri 30–72px) */
  sizePx: number;
  /** Katman opaklığı: uzak 0.62, orta 0.86, yakın 1.0 */
  opacity: number;
  /** Düşüş süresi (sn): uzak 2.6, orta 2.1, yakın 1.6 */
  durationSec: number;
  /** Başlangıç gecikmesi (sn): gecikme + süre <= 3.20 sn */
  delaySec: number;
  /** Dönüş açısı (uzak ±30°, yakın ±120°) */
  rotStartDeg: number;
  rotEndDeg: number;
  /** Yatay sinüs salınım genliği (px) */
  swayPx: number;
  /** Mobilde görünür mü? */
  mobileVisible: boolean;
}

const PASTRY_ICONS: SplashIconId[] = [
  'splash-icon-eclair',
  'splash-icon-baklava',
  'splash-icon-cookie',
  'splash-icon-trilece',
  'splash-icon-sutlac',
  'splash-icon-kazandibi',
  'splash-icon-strawberry-cake',
  'splash-icon-whole-cake',
  'splash-icon-raspberry-cake',
  'splash-icon-pistachio',
];

/**
 * 0.12–3.18 sn: Tatlı, sütlü tatlı ve yaş pasta yağmuru parçacıklarını
 * `particleCount` (varsayılan masaüstü 38, mobil 22) parametresine göre tohumlu (mulberry32) üretir.
 */
export function generateRainParticles(
  seed = 884219,
  particleCount = 38,
  mobileParticleCount = 22
): RainParticleSpec[] {
  const rand = mulberry32(seed);
  const totalCount = Math.max(8, Math.round(particleCount));
  const targetMobile = Math.min(totalCount, Math.max(6, Math.round(mobileParticleCount)));
  const laneWidth = 96 / totalCount; // %2 ile %98 arası eşit şeritler

  const layers: ParticleDepthLayer[] = ['far', 'mid', 'near'];
  const particles: RainParticleSpec[] = [];

  for (let i = 0; i < totalCount; i++) {
    const icon = PASTRY_ICONS[i % PASTRY_ICONS.length];
    const isPistachio = icon === 'splash-icon-pistachio';
    const layer = layers[i % 3];

    let sizePx: number;
    let opacity: number;
    let durationSec: number;
    let maxRotation: number;

    if (layer === 'far') {
      sizePx = isPistachio ? Math.round(20 + rand() * 4) : Math.round(30 + rand() * 8);
      opacity = 0.62;
      durationSec = 2.55;
      maxRotation = 30;
    } else if (layer === 'mid') {
      sizePx = isPistachio ? Math.round(22 + rand() * 4) : Math.round(42 + rand() * 12);
      opacity = 0.86;
      durationSec = 2.05;
      maxRotation = 75;
    } else {
      sizePx = isPistachio ? Math.round(24 + rand() * 4) : Math.round(56 + rand() * 16);
      opacity = 1.0;
      durationSec = 1.55;
      maxRotation = 120;
    }

    // 0.12 sn'de başlar, delay + duration <= 3.16 sn olacak şekilde sınırlandırılır
    const minDelay = 0.12;
    const maxAllowedDelay = Math.max(minDelay + 0.05, 3.16 - durationSec);
    const delaySec =
      Math.round((minDelay + rand() * (maxAllowedDelay - minDelay)) * 100) / 100;

    const laneStart = 2 + i * laneWidth;
    const leftPercent =
      Math.round((laneStart + (0.15 + rand() * 0.7) * laneWidth) * 10) / 10;

    const dir = rand() > 0.5 ? 1 : -1;
    const rotStartDeg = Math.round((rand() - 0.5) * 26);
    const rotEndDeg = Math.round(
      rotStartDeg + dir * (maxRotation * (0.65 + rand() * 0.35))
    );
    const swayPx = Math.round((11 + rand() * 16) * dir);

    // Mobilde targetMobile adet parçacığı eşit aralıklarla seç
    const mobileVisible =
      Math.floor(((i + 1) * targetMobile) / totalCount) >
      Math.floor((i * targetMobile) / totalCount);

    particles.push({
      id: i + 1,
      icon,
      layer,
      leftPercent,
      sizePx,
      opacity,
      durationSec,
      delaySec,
      rotStartDeg,
      rotEndDeg,
      swayPx,
      mobileVisible,
    });
  }

  return particles;
}
