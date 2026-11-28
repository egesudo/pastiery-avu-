import React, { useState, useCallback } from 'react';
import { Icon } from './ui/IconRegistry';
import { Splash, SplashPhase } from './Splash';
import { siteConfig } from '../config/site';

interface SplashPreviewProps {
  onExitPreview: () => void;
}

/**
 * /splash-preview geliştirici & tasarım önizleme sayfası.
 * 3.6 sn'lik karşılama sahnesini "Tekrar Oynat" butonuyla istenildiği kadar
 * baştan oynatmayı ve zaman çizelgesi durumunu (idle -> playing -> exiting -> done)
 * incelemeyi sağlar.
 */
export const SplashPreview: React.FC<SplashPreviewProps> = ({ onExitPreview }) => {
  const [playKey, setPlayKey] = useState<number>(1);
  const [isPlayingSplash, setIsPlayingSplash] = useState<boolean>(true);
  const [phase, setPhase] = useState<SplashPhase>('playing');
  const [elapsedMs, setElapsedMs] = useState<number>(0);

  const handleReplay = useCallback(() => {
    setElapsedMs(0);
    setPhase('playing');
    setIsPlayingSplash(true);
    setPlayKey((prev) => prev + 1);
  }, []);

  const handlePhaseChange = useCallback((nextPhase: SplashPhase, ms: number) => {
    setPhase(nextPhase);
    setElapsedMs(Math.min(3600, Math.round(ms)));
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF8E7] text-[#3E2723] flex flex-col items-center justify-center p-6">
      {isPlayingSplash && (
        <Splash
          key={playKey}
          forcePlay
          onPhaseChange={handlePhaseChange}
          onFinish={() => setIsPlayingSplash(false)}
        />
      )}

      {/* Splash bittikten veya atlandıktan sonra görünen kontrol kartı */}
      <div className="w-full max-w-xl rounded-[24px] bg-[#FFFBEF] border-2 border-[#E3CFA3] shadow-warm-lg p-6 sm:p-8 text-center">
        <div className="text-xs font-semibold tracking-wide text-[#5D4037] mb-2">
          Karşılama Sahnesi Önizleme Stüdyosu (/splash-preview)
        </div>
        <h1 className="font-serif-display font-bold text-2xl sm:text-3xl text-[#3E2723] mb-3">
          {siteConfig.splashTitle}
        </h1>
        <p className="text-sm text-[#5D4037] leading-relaxed mb-6">
          3.60 saniyelik çikolata &amp; vanilya krema perdesi, 3 derinlik katmanlı tatlı
          yağmuru, harf içi çikolata akışı ve sarkan vanilya kreması damlalarını
          aşağıdaki butonla tekrar oynatabilirsiniz.
        </p>

        {/* Durum ve Süre Göstergesi */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#FFF8E7] border border-[#E3CFA3] mb-6 text-left text-xs sm:text-sm">
          <div>
            <span className="text-[#5D4037] block">Durum Makinesi:</span>
            <strong className="text-[#3E2723] font-semibold">{phase}</strong>
          </div>
          <div>
            <span className="text-[#5D4037] block">Zaman Çizelgesi:</span>
            <strong className="text-[#3E2723] font-semibold tabular-nums">
              {(elapsedMs / 1000).toFixed(2)} sn / 3.60 sn
            </strong>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleReplay}
            className="inline-flex items-center justify-center gap-2 min-h-[48px] px-7 py-3.5 rounded-full bg-[#3E2723] text-[#FFFBEF] text-sm sm:text-base font-semibold shadow-warm hover:bg-[#5D4037] active:scale-95 transition-all cursor-pointer"
          >
            <Icon name="rotate-ccw" size={16} />
            <span>Tekrar Oynat (3.6 sn)</span>
          </button>

          <button
            type="button"
            onClick={onExitPreview}
            className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3.5 rounded-full bg-[#FFF8E7] text-[#3E2723] border border-[#E3CFA3] text-sm sm:text-base font-semibold hover:bg-[#F3E3C3] active:scale-95 transition-all cursor-pointer"
          >
            <Icon name="arrow-left" size={16} />
            <span>Ana Vitrine Dön</span>
          </button>
        </div>
      </div>

      {/* Splash oynarken de sol üstte sabit hızlı "Tekrar Oynat" kontrolü */}
      <div className="fixed top-4 left-4 z-[10000] flex items-center gap-2">
        <button
          type="button"
          onClick={handleReplay}
          aria-label="Karşılama animasyonunu baştan tekrar oynat"
          className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-full bg-[#3E2723] text-[#FFFBEF] border border-[#E3CFA3] text-xs sm:text-sm font-semibold shadow-warm hover:bg-[#5D4037] active:scale-95 transition-transform cursor-pointer"
        >
          <Icon name="play" size={16} variant="solid" />
          <span>Tekrar Oynat</span>
        </button>
      </div>
    </div>
  );
};
