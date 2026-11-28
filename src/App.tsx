/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Splash } from './components/Splash';
import { SplashPreview } from './components/SplashPreview';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Catalog } from './components/Catalog';
import { SpecialOrderBanner } from './components/SpecialOrderBanner';
import { Atmosphere } from './components/Atmosphere';
import { LocationContact } from './components/LocationContact';
import { Footer } from './components/Footer';
import { JsonLd } from './components/JsonLd';
import { ScrollToTopButton } from './components/ScrollToTopButton';
import { PastrySectionWave } from './components/icons/BakeryDividers';

function checkIsSplashPreviewRoute(): boolean {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.replace(/\/+$/, '');
  const hash = window.location.hash;
  const params = new URLSearchParams(window.location.search);
  return (
    path === '/splash-preview' ||
    hash === '#/splash-preview' ||
    params.get('splash') === 'preview'
  );
}

function getInitialShouldShowSplash(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const params = new URLSearchParams(window.location.search);
    // Yalnızca ?splash=off ile devre dışı bırakılır; girişte daima otomatik açılır
    if (params.get('splash') === 'off') {
      return false;
    }
    return true;
  } catch {
    return true;
  }
}

export default function App() {
  const [isPreviewRoute, setIsPreviewRoute] = useState<boolean>(() =>
    checkIsSplashPreviewRoute()
  );
  const [showSplash, setShowSplash] = useState<boolean>(() =>
    getInitialShouldShowSplash()
  );

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  useEffect(() => {
    const onPopState = () => {
      setIsPreviewRoute(checkIsSplashPreviewRoute());
    };
    window.addEventListener('popstate', onPopState);
    window.addEventListener('hashchange', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('hashchange', onPopState);
    };
  }, []);

  // Splash açıkken arka plan scroll kilitli; kapanınca serbest
  useEffect(() => {
    if (!showSplash || isPreviewRoute) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showSplash, isPreviewRoute]);

  if (isPreviewRoute) {
    return (
      <SplashPreview
        onExitPreview={() => {
          if (window.location.pathname === '/splash-preview') {
            window.history.pushState({}, '', '/');
          } else {
            window.location.hash = '';
          }
          setIsPreviewRoute(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6F0] text-[#5D4037] overflow-x-clip">
      <JsonLd />

      {/* Splash açıkken bile ana sayfa altında render edilmiş durumdadır (LCP ve SEO için) */}
      {showSplash && (
        <Splash
          particleCount={38}
          mobileParticleCount={22}
          onFinish={handleSplashFinish}
        />
      )}

      {/* Splash açıkken arka plan inert */}
      <div
        id="app-main-shell"
        inert={showSplash ? true : undefined}
        aria-hidden={showSplash ? true : undefined}
        className="flex-1 flex flex-col"
      >
        <Navbar />

        <main id="main-content" className="flex-1">
          <Hero splashDone={!showSplash} />
          <PastrySectionWave variant="hero-yuva" />
          <Atmosphere />
          <PastrySectionWave variant="yuva-lezzet" />
          <Catalog />
          <SpecialOrderBanner />
          <PastrySectionWave variant="lezzet-konum" />
          <LocationContact />
        </main>

        <Footer />
        <ScrollToTopButton />
      </div>
    </div>
  );
}
