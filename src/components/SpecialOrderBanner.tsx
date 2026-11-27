import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { WhatsAppActionButton } from './WhatsAppActionButton';
import { buildWhatsAppUrl } from '../config/site';
import {
  REVEAL_STAGGER_DELAY,
  SECTION_VIEWPORT,
  getSectionContainerVariants,
  getRevealItemVariants,
} from '../utils/motion';

export const SpecialOrderBanner: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();

  const sectionVariants = useMemo(
    () => getSectionContainerVariants(prefersReducedMotion, REVEAL_STAGGER_DELAY, 0.02),
    [prefersReducedMotion]
  );
  const textGroupVariants = useMemo(
    () => getSectionContainerVariants(prefersReducedMotion, REVEAL_STAGGER_DELAY, 0.01),
    [prefersReducedMotion]
  );
  const itemVariants = useMemo(
    () => getRevealItemVariants(prefersReducedMotion),
    [prefersReducedMotion]
  );

  const specialOrderWhatsAppUrl = buildWhatsAppUrl(
    'Merhaba, özel gün (doğum günü / nişan / bayram) pasta ve tatlı siparişi hakkında bilgi almak istiyorum.'
  );

  return (
    <motion.section
      aria-label="Özel gün siparişi bilgilendirme bandı"
      initial="hidden"
      whileInView="visible"
      viewport={SECTION_VIEWPORT}
      variants={sectionVariants}
      className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      <motion.div
        variants={sectionVariants}
        className="rounded-[24px] bg-[#F3ECE1] border border-[#3E2723]/12 shadow-warm px-6 py-7 sm:px-10 sm:py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
      >
        <motion.div variants={textGroupVariants} className="max-w-2xl">
          <motion.div
            variants={itemVariants}
            className="text-xs sm:text-sm font-semibold tracking-wide text-[#B23A48] mb-1.5"
          >
            Özel Kutlamalar &amp; Davetler
          </motion.div>
          <motion.h2
            variants={itemVariants}
            className="font-serif-display font-bold text-xl sm:text-2xl text-[#3E2723] leading-snug"
            style={{ textWrap: 'balance' }}
          >
            Doğum günü, nişan, bayram… Özel anlarınız için pasta ve tatlı siparişi
          </motion.h2>
        </motion.div>

        <motion.div variants={itemVariants} className="w-full md:w-auto shrink-0">
          <WhatsAppActionButton
            href={specialOrderWhatsAppUrl}
            label="WhatsApp ile Bilgi Alın"
            variant="raspberry"
            size="lg"
            className="w-full md:w-auto"
          />
        </motion.div>
      </motion.div>
    </motion.section>
  );
};
