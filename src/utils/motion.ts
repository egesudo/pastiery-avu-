import type { Variants, ViewportOptions } from 'motion/react';

export const REVEAL_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const REVEAL_DURATION = 0.55;
export const REVEAL_OFFSET_Y = 24;
/** 60ms (0.06s) staggerChildren delay across section blocks and grid items */
export const REVEAL_STAGGER_DELAY = 0.06;

export const SECTION_VIEWPORT: ViewportOptions = {
  once: true,
  amount: 'some',
  margin: '0px 0px -48px 0px',
};

/**
 * Ana bölüm kapsayıcıları ve alt gruplar (başlık blokları, kart ızgaraları, hikâye panelleri)
 * için 60ms (0.06s) staggerChildren gecikmesiyle alt öğeleri sırayla tetikleyen varyant üreticisi.
 */
export function getSectionContainerVariants(
  prefersReducedMotion: boolean | null,
  staggerChildren = REVEAL_STAGGER_DELAY,
  delayChildren = 0.02
): Variants {
  if (prefersReducedMotion) {
    return {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { duration: 0.15 },
      },
    };
  }

  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren,
        delayChildren,
      },
    },
  };
}

/**
 * Ürün ve medya ızgaraları için 60ms (0.06s) staggerChildren varyant üreticisi.
 */
export function getStaggerGridVariants(
  prefersReducedMotion: boolean | null,
  staggerChildren = REVEAL_STAGGER_DELAY
): Variants {
  return getSectionContainerVariants(prefersReducedMotion, staggerChildren, 0.02);
}

/**
 * Bölüm içi alt öğeler (başlık, paragraf, sekme çubuğu, ürün/medya/harita kartları, CTA grubu)
 * için opacity: 0 -> 1 ve translateY: 24px -> 0px reveal varyant üreticisi.
 */
export function getRevealItemVariants(
  prefersReducedMotion: boolean | null
): Variants {
  if (prefersReducedMotion) {
    return {
      hidden: { opacity: 0, y: 0 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.15 },
      },
    };
  }

  return {
    hidden: {
      opacity: 0,
      y: REVEAL_OFFSET_Y,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: REVEAL_DURATION,
        ease: REVEAL_EASE,
      },
    },
  };
}
