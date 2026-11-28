import React, { useState, useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Icon } from './ui/IconRegistry';
import { siteConfig, buildWhatsAppUrl } from '../config/site';
import { WhatsAppActionButton } from './WhatsAppActionButton';
import {
  REVEAL_STAGGER_DELAY,
  SECTION_VIEWPORT,
  getSectionContainerVariants,
  getRevealItemVariants,
} from '../utils/motion';
import {
  TRUSTED_MAPS_EMBED_HOSTS,
  TRUSTED_MAPS_LINK_HOSTS,
  sanitizeSafeHref,
} from '../utils/security';

export const LocationContact: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const sectionVariants = useMemo(
    () => getSectionContainerVariants(prefersReducedMotion, REVEAL_STAGGER_DELAY, 0.02),
    [prefersReducedMotion]
  );
  const headerBlockVariants = useMemo(
    () => getSectionContainerVariants(prefersReducedMotion, REVEAL_STAGGER_DELAY, 0.01),
    [prefersReducedMotion]
  );
  const cardStaggerVariants = useMemo(
    () => getSectionContainerVariants(prefersReducedMotion, REVEAL_STAGGER_DELAY, 0.02),
    [prefersReducedMotion]
  );
  const itemVariants = useMemo(
    () => getRevealItemVariants(prefersReducedMotion),
    [prefersReducedMotion]
  );

  const handleCopyAddress = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(siteConfig.address);
      } else {
        // Fallback: eski tarayıcı veya izin kısıtlaması durumunda
        const textArea = document.createElement('textarea');
        textArea.value = siteConfig.address;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2600);
    } catch {
      setCopied(false);
    }
  };

  const contactWhatsAppUrl = buildWhatsAppUrl(
    'Merhaba, Gaziantepli Çavuşoğulları Pastaneleri konum ve sipariş hakkında bilgi almak istiyorum.'
  );
  const safeMapsEmbedUrl = sanitizeSafeHref(
    siteConfig.mapsEmbedUrl,
    TRUSTED_MAPS_EMBED_HOSTS,
    ''
  );
  const safeMapsDirectionsUrl = sanitizeSafeHref(
    siteConfig.mapsDirectionsUrl,
    TRUSTED_MAPS_LINK_HOSTS
  );

  return (
    <motion.section
      id="iletisim"
      initial="hidden"
      whileInView="visible"
      viewport={SECTION_VIEWPORT}
      variants={sectionVariants}
      className="scroll-mt-24 pt-10 sm:pt-14 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      {/* Bölüm Başlığı (60ms staggerChildren: Kicker -> H2 -> Paragraph) */}
      <motion.div variants={headerBlockVariants} className="max-w-2xl mb-10">
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold tracking-wide text-[#4F6A1A] mb-2"
        >
          <Icon name="pin-kiraz" size={16} variant="duotone" className="text-[#4F6A1A]" />
          <span>Her Zaman Bekleriz</span>
        </motion.div>
        <motion.h2
          variants={itemVariants}
          className="font-serif-display font-bold text-2xl sm:text-4xl text-[#3E2723] tracking-tight"
          style={{ textWrap: 'balance' }}
        >
          Konum &amp; İletişim
        </motion.h2>
        <motion.p
          variants={itemVariants}
          className="mt-3 text-sm sm:text-base text-[#5D4037] leading-relaxed"
        >
          Sıcak bir çay molası vermek ya da taptaze tatlılarımızdan seçmek için Halkalı
          Merkez&apos;deki kapımız size her zaman açık. Adresi tek dokunuşla kopyalayabilir,
          yol tarifi alabilir veya WhatsApp&apos;tan hemen bize ulaşabilirsiniz.
        </motion.p>
      </motion.div>

      <motion.div
        variants={sectionVariants}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
      >
        {/* Sol: Adres Kartı ve Aksiyon Butonları (60ms staggerChildren) */}
        <motion.div
          variants={cardStaggerVariants}
          className="lg:col-span-5 rounded-[24px] bg-[#FFFDF9] border border-[#3E2723]/10 shadow-warm p-6 sm:p-8 flex flex-col justify-between gap-6"
        >
          <motion.div variants={cardStaggerVariants}>
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#B23A48] mb-3"
            >
              <Icon name="pin-kiraz" size={16} variant="duotone" className="text-[#3B2314]" />
              <span>{siteConfig.branchName}</span>
            </motion.div>

            <motion.h3
              variants={itemVariants}
              className="font-serif-display font-bold text-xl sm:text-2xl text-[#3E2723] mb-3"
            >
              {siteConfig.name}
            </motion.h3>

            <motion.address
              variants={itemVariants}
              className="not-italic text-sm sm:text-base text-[#5D4037] leading-relaxed bg-[#F3ECE1]/70 rounded-2xl p-4 border border-[#3E2723]/8"
            >
              {siteConfig.address}
            </motion.address>

            {/* Çalışma saatleri yalnızca siteConfig.hours tanımlıysa gösterilir */}
            {siteConfig.hours && (
              <motion.div
                variants={itemVariants}
                className="mt-4 flex items-center gap-2.5 text-sm text-[#5D4037]"
              >
                <Icon name="clock" size={16} className="text-[#4F6A1A]" />
                <span>Çalışma Saatleri: {siteConfig.hours.display}</span>
              </motion.div>
            )}

            {/* Ekran okuyucular için kopyalandı duyurusu */}
            <div aria-live="polite" className="sr-only">
              {copied ? 'Adres panoya kopyalandı.' : ''}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Adresi Kopyala Butonu */}
              <button
                type="button"
                onClick={handleCopyAddress}
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-5 py-3 rounded-full bg-[#F3ECE1] text-[#3E2723] text-sm font-semibold hover:bg-[#E7DDD0] active:scale-95 transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Icon name="onay" size={16} variant="duotone" className="text-[#4F6A1A]" />
                    <span className="text-[#4F6A1A]">Kopyalandı!</span>
                  </>
                ) : (
                  <>
                    <Icon name="copy" size={16} />
                    <span>Adresi Kopyala</span>
                  </>
                )}
              </button>

              {/* Yol Tarifi Al Bağlantısı */}
              <a
                href={safeMapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-5 py-3 rounded-full bg-[#3E2723] text-[#FFFDF9] text-sm font-semibold hover:bg-[#4E342E] active:scale-[0.96] transition-all text-center"
              >
                <Icon name="navigation" size={16} />
                <span>Yol Tarifi Al</span>
              </a>
            </div>

            {/* WhatsApp İletişim Butonu */}
            <WhatsAppActionButton
              href={contactWhatsAppUrl}
              label="WhatsApp ile İletişime Geçin"
              size="md"
              className="w-full"
            />
          </motion.div>
        </motion.div>

        {/* Sağ: Google Maps Iframe (sandbox kısıtlamalı, sepia/saturate filtreli, 24px köşe) */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-7 relative min-h-[320px] sm:min-h-[400px] rounded-[24px] overflow-hidden bg-[#F3ECE1] border border-[#3E2723]/12 shadow-warm flex flex-col justify-between"
        >
          {safeMapsEmbedUrl && (
            <iframe
              src={safeMapsEmbedUrl}
              title="Gaziantepli Çavuşoğulları Pastaneleri Halkalı Merkez Google Haritalar Konumu"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
              style={{ filter: 'sepia(0.2) saturate(0.9)' }}
              className="w-full h-full min-h-[320px] sm:min-h-[400px] border-0 flex-1"
              allowFullScreen
            />
          )}

          {/* Harita yüklenemezse veya engellenirse her zaman görünür kalan alt yol tarifi çubuğu */}
          <div className="px-4 py-2.5 bg-[#FFFDF9]/95 border-t border-[#3E2723]/10 flex flex-wrap items-center justify-between gap-2 text-xs text-[#5D4037]">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="map-pin" size={16} className="text-[#B23A48]" />
              <span>Karadut Sokağı No:14, Halkalı Merkez / Küçükçekmece</span>
            </span>
            <a
              href={safeMapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-[#4F6A1A] hover:underline"
            >
              <span>Google Haritalar&apos;da Aç</span>
              <Icon name="arrow-up-right" size={16} />
            </a>
          </div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
};
