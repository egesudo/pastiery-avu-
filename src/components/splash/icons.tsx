import React from 'react';

export type SplashIconId =
  | 'splash-icon-eclair'
  | 'splash-icon-baklava'
  | 'splash-icon-cookie'
  | 'splash-icon-trilece'
  | 'splash-icon-sutlac'
  | 'splash-icon-kazandibi'
  | 'splash-icon-strawberry-cake'
  | 'splash-icon-whole-cake'
  | 'splash-icon-raspberry-cake'
  | 'splash-icon-pistachio';

/**
 * Satır içi SVG <symbol> sprite (10 vektör tatlı ikonu).
 * Toplam DOM düğümünü <150 sınırında tutmak için aynı renkteki alt şekiller
 * birleştirilmiş <path> olarak optimize edilmiştir.
 * Renk paleti:
 * - Vanilya: #FFF8E7, #F3E3C3, #FFFBEF, #E3CFA3
 * - Çikolata: #3E2723 (bitter), #5D4037 (kakao), #6D4C41 (sütlü)
 * - Vurgular: #C98A3D (karamel), #8FA85B (Antep fıstığı), #C84B59 (frambuaz/çilek)
 * - Parlaklık: rgba(255,255,255,0.55)
 */
export const SplashIconSprite: React.FC = () => (
  <svg
    className="hidden"
    aria-hidden="true"
    focusable="false"
    shapeRendering="geometricPrecision"
  >
    <defs>
      {/* 1. Tatlı: Çikolata kaplı ekler */}
      <symbol id="splash-icon-eclair" viewBox="0 0 64 40" shapeRendering="geometricPrecision">
        <rect x="6" y="14" width="54" height="20" rx="10" fill="#E3CFA3" />
        <rect x="4" y="10" width="54" height="20" rx="10" fill="#F3E3C3" />
        <path
          d="M6 17C6 12.5 11 9 18 9H44C51 9 56 12.5 56 17C53 20 49 17.5 44 19.5C39 21.5 34 18 29 20C24 22 19 18.5 14 20C10 21 6 19 6 17Z"
          fill="#3E2723"
        />
        <path d="M15 13H36" stroke="rgba(255,255,255,0.55)" strokeWidth="2.4" strokeLinecap="round" />
      </symbol>

      {/* 2. Tatlı: Baklava dilimi (üstü Antep fıstıklı) */}
      <symbol id="splash-icon-baklava" viewBox="0 0 60 56" shapeRendering="geometricPrecision">
        <polygon points="30,10 54,26 30,48 6,26" fill="#E3CFA3" />
        <polygon points="30,6 54,22 30,44 6,22" fill="#C98A3D" />
        <path d="M30 36L52 20L54 24L30 42L6 24L8 20Z M20 20A10 6 0 1 0 40 20A10 6 0 1 0 20 20Z" fill="#8FA85B" />
        <ellipse cx="27" cy="18" rx="5" ry="2" fill="rgba(255,255,255,0.55)" />
      </symbol>

      {/* 3. Tatlı: Çikolata parçacıklı kurabiye */}
      <symbol id="splash-icon-cookie" viewBox="0 0 56 56" shapeRendering="geometricPrecision">
        <circle cx="29" cy="30" r="21" fill="#E3CFA3" />
        <circle cx="27" cy="27" r="21" fill="#C98A3D" />
        <path
          d="M16 18A3.2 3.2 0 1 0 22.4 18A3.2 3.2 0 1 0 16 18Z M30 17A3 3 0 1 0 36 17A3 3 0 1 0 30 17Z M22.5 27A3.6 3.6 0 1 0 29.7 27A3.6 3.6 0 1 0 22.5 27Z M14.5 31A2.8 2.8 0 1 0 20.1 31A2.8 2.8 0 1 0 14.5 31Z M32 30A3.2 3.2 0 1 0 38.4 30A3.2 3.2 0 1 0 32 30Z M24.5 38A2.6 2.6 0 1 0 29.7 38A2.6 2.6 0 1 0 24.5 38Z"
          fill="#3E2723"
        />
        <path d="M15 15C18 12 23 10.5 28 11" stroke="rgba(255,255,255,0.55)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </symbol>

      {/* 4. Sütlü Tatlı: Karamel soslu trileçe dilimi */}
      <symbol id="splash-icon-trilece" viewBox="0 0 60 52" shapeRendering="geometricPrecision">
        <rect x="10" y="16" width="42" height="28" rx="6" fill="#E3CFA3" />
        <rect x="8" y="13" width="42" height="28" rx="6" fill="#FFFBEF" />
        <path
          d="M8 18C8 14.5 11 12 15 12H43C47 12 50 14.5 50 18V21C47 21 46 26 43 26C40 26 39 20 35 20C31 20 30 28 26 28C22 28 21 20 17 20C14 20 13 24 10 24C8.5 24 8 22 8 21V18Z"
          fill="#C98A3D"
        />
        <path d="M14 15.5H44M14 19H44" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round" />
      </symbol>

      {/* 5. Sütlü Tatlı: Fırın sütlaç kasesi (kızarmış üstlü) */}
      <symbol id="splash-icon-sutlac" viewBox="0 0 60 52" shapeRendering="geometricPrecision">
        <path d="M8 22H52L48 38C47 41.5 43.5 44 39 44H21C16.5 44 13 41.5 12 38L8 22Z" fill="#C98A3D" />
        <ellipse cx="30" cy="21" rx="21" ry="8" fill="#FFFBEF" />
        <path
          d="M17 20A7 3.2 0 1 0 31 20A7 3.2 0 1 0 17 20Z M31.5 22A5.5 2.6 0 1 0 42.5 22A5.5 2.6 0 1 0 31.5 22Z"
          fill="#3E2723"
        />
        <ellipse cx="20" cy="18" rx="4" ry="1.3" fill="rgba(255,255,255,0.55)" />
      </symbol>

      {/* 6. Sütlü Tatlı: Kazandibi dilimi */}
      <symbol id="splash-icon-kazandibi" viewBox="0 0 60 48" shapeRendering="geometricPrecision">
        <rect x="10" y="16" width="42" height="24" rx="9" fill="#E3CFA3" />
        <rect x="8" y="13" width="42" height="24" rx="9" fill="#FFFBEF" />
        <rect x="8" y="13" width="42" height="12" rx="6" fill="#3E2723" />
        <path d="M15 16.5H34" stroke="rgba(255,255,255,0.55)" strokeWidth="2.2" strokeLinecap="round" />
      </symbol>

      {/* 7. Yaş Pasta: Çilekli pasta dilimi */}
      <symbol id="splash-icon-strawberry-cake" viewBox="0 0 60 58" shapeRendering="geometricPrecision">
        <polygon points="10,46 31,14 52,46" fill="#E3CFA3" />
        <polygon points="8,44 29,12 50,44" fill="#FFFBEF" />
        <path d="M14 34H44V38.5H14Z M23 12A6 6 0 1 0 35 12A6 6 0 1 0 23 12Z" fill="#C84B59" />
        <ellipse cx="29" cy="6" rx="4.5" ry="2" fill="#8FA85B" />
      </symbol>

      {/* 8. Yaş Pasta: Bütün çikolatalı pasta (damlalı) */}
      <symbol id="splash-icon-whole-cake" viewBox="0 0 64 58" shapeRendering="geometricPrecision">
        <rect x="10" y="20" width="46" height="28" rx="7" fill="#E3CFA3" />
        <rect x="8" y="17" width="46" height="28" rx="7" fill="#6D4C41" />
        <path
          d="M8 23C8 19 11 17 15 17H47C51 17 54 19 54 23V25C51 25 50 32 47 32C44 32 43 24 39 24C35 24 34 34 30 34C26 34 25 24 21 24C17 24 16 31 13 31C10 31 9 26 8 25V23Z"
          fill="#3E2723"
        />
        <rect x="8" y="39" width="46" height="6" rx="3" fill="#8FA85B" />
      </symbol>

      {/* 9. Yaş Pasta: Frambuazlı pasta dilimi */}
      <symbol id="splash-icon-raspberry-cake" viewBox="0 0 60 56" shapeRendering="geometricPrecision">
        <rect x="11" y="18" width="40" height="28" rx="6" fill="#E3CFA3" />
        <rect x="9" y="15" width="40" height="28" rx="6" fill="#5D4037" />
        <rect x="9" y="27" width="40" height="5" fill="#FFFBEF" />
        <path
          d="M9 20C9 17 11.5 15 15 15H43C46.5 15 49 17 49 20V22C46 22 45 26 42 26C39 26 38 21 34 21C30 21 29 26 25 26C21 26 20 21 16 21C13 21 11 24 9 23V20Z"
          fill="#C84B59"
        />
      </symbol>

      {/* 10. Dolgu: Antep fıstığı tanesi (küçük, 18–24 px) */}
      <symbol id="splash-icon-pistachio" viewBox="0 0 36 36" shapeRendering="geometricPrecision">
        <ellipse cx="19" cy="19" rx="12" ry="8.5" transform="rotate(-28 19 19)" fill="#E3CFA3" />
        <ellipse cx="17.5" cy="17.5" rx="12" ry="8.5" transform="rotate(-28 17.5 17.5)" fill="#8FA85B" />
        <ellipse cx="15" cy="14.5" rx="5.5" ry="2.2" transform="rotate(-28 15 14.5)" fill="rgba(255,255,255,0.55)" />
      </symbol>
    </defs>
  </svg>
);
