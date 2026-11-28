import React from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  Copy,
  Hand,
  Info,
  MapPin,
  Maximize,
  Menu,
  Navigation,
  Pause,
  Phone,
  Play,
  RotateCcw,
  Store,
  Volume2,
  VolumeX,
  X,
  ZoomIn,
  ZoomOut,
  type LucideIcon,
} from 'lucide-react';

export type SignatureIconName =
  // Kategori (4)
  | 'yas-pasta'
  | 'ekler-ibiza'
  | 'kuru-pasta'
  | 'sutlu-tatli'
  // Değerler (4)
  | 'taze-gunluk'
  | 'usta-eli'
  | 'antep-fistigi'
  | 'ozenli-paket'
  // Aksiyon / Yardımcı (9)
  | 'pasta-kutusu'
  | 'krema-bukle-yukari'
  | 'tabla-yukleme'
  | 'bos-tabak'
  | 'parilti'
  | 'onay'
  | 'pin-kiraz'
  | 'hamburger-krema'
  | 'play-dilim';

export type HelperIconName =
  | 'chevron-left'
  | 'chevron-right'
  | 'close'
  | 'menu'
  | 'arrow-up-right'
  | 'arrow-down-right'
  | 'arrow-left'
  | 'phone'
  | 'clock'
  | 'compass'
  | 'check'
  | 'play'
  | 'pause'
  | 'volume-on'
  | 'volume-off'
  | 'maximize'
  | 'copy'
  | 'navigation'
  | 'zoom-in'
  | 'zoom-out'
  | 'info'
  | 'alert'
  | 'map-pin'
  | 'store'
  | 'hand'
  | 'rotate-ccw';

export type BrandIconName = 'whatsapp' | 'instagram';

export type IconName = SignatureIconName | HelperIconName | BrandIconName;

export type IconSize = 16 | 20 | 24 | 32;

export type IconVariant = 'outline' | 'duotone' | 'solid';

export interface IconProps
  extends Omit<React.SVGProps<SVGSVGElement>, 'children' | 'name' | 'width' | 'height'> {
  name: IconName;
  size?: IconSize;
  variant?: IconVariant;
  title?: string;
  /** Açılır/kapanır durumlu ikonlar için (örn. hamburger-krema) */
  isOpen?: boolean;
}

export interface RegistryIconProps extends Omit<IconProps, 'name'> {
  size: IconSize;
  variant: IconVariant;
}

export type RegistryIconComponent = React.FC<RegistryIconProps>;

const DUOTONE_OPACITY = 0.35;

function accentFill(variant: IconVariant): { fill: string; fillOpacity?: number } {
  if (variant === 'duotone') {
    return { fill: 'var(--icon-accent)', fillOpacity: DUOTONE_OPACITY };
  }
  if (variant === 'solid') {
    return { fill: 'currentColor', fillOpacity: 0.22 };
  }
  return { fill: 'none' };
}

function solidOrAccent(
  variant: IconVariant,
  solidOpacity = 0.88
): { fill: string; fillOpacity?: number } {
  if (variant === 'solid') {
    return { fill: 'currentColor', fillOpacity: solidOpacity };
  }
  if (variant === 'duotone') {
    return { fill: 'var(--icon-accent)', fillOpacity: DUOTONE_OPACITY };
  }
  return { fill: 'none' };
}

function getA11yProps(title?: string) {
  const hasTitle = Boolean(title && title.trim().length > 0);
  return {
    hasTitle,
    props: hasTitle
      ? ({ role: 'img', 'aria-label': title } as const)
      : ({ 'aria-hidden': true } as const),
  };
}

/**
 * Özel pastane imza SVG ikon bileşeni üreticisi (24x24 viewBox, 1.75 stroke, round cap/join)
 */
function createBakerySvgIcon(
  displayName: string,
  renderPaths: (ctx: { variant: IconVariant; isOpen?: boolean }) => React.ReactNode
): RegistryIconComponent {
  const Component: RegistryIconComponent = ({
    size,
    variant,
    title,
    isOpen,
    className = '',
    ...svgProps
  }) => {
    const { hasTitle, props: a11yProps } = getA11yProps(title);
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable={false}
        className={`shrink-0 ${className}`.trim()}
        {...a11yProps}
        {...svgProps}
      >
        {hasTitle && <title>{title}</title>}
        {renderPaths({ variant, isOpen })}
      </svg>
    );
  };
  Component.displayName = displayName;
  return Component;
}

/**
 * Resmi marka SVG ikon bileşeni üreticisi (tek renk currentColor, oran korunur)
 */
function createBrandSvgIcon(
  displayName: string,
  renderPath: () => React.ReactNode
): RegistryIconComponent {
  const Component: RegistryIconComponent = ({
    size,
    variant: _variant,
    title,
    isOpen: _isOpen,
    className = '',
    ...svgProps
  }) => {
    const { hasTitle, props: a11yProps } = getA11yProps(title);
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="currentColor"
        stroke="none"
        focusable={false}
        className={`shrink-0 ${className}`.trim()}
        {...a11yProps}
        {...svgProps}
      >
        {hasTitle && <title>{title}</title>}
        {renderPath()}
      </svg>
    );
  };
  Component.displayName = displayName;
  return Component;
}

/**
 * Lucide yardımcı ikonlarını sistem token'larıyla (24x24, 1.75 stroke, round cap/join) uyumlu hale getirir
 */
function createLucideHelperIcon(
  displayName: string,
  LucideCmp: LucideIcon
): RegistryIconComponent {
  const Component: RegistryIconComponent = ({
    size,
    variant,
    title,
    isOpen: _isOpen,
    className = '',
    ...svgProps
  }) => {
    const { props: a11yProps } = getA11yProps(title);
    return (
      <LucideCmp
        width={size}
        height={size}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={variant === 'solid' ? 'currentColor' : 'none'}
        fillOpacity={variant === 'solid' ? 0.14 : undefined}
        focusable={false}
        className={`shrink-0 ${className}`.trim()}
        {...a11yProps}
        {...svgProps}
      />
    );
  };
  Component.displayName = displayName;
  return Component;
}

/**
 * Tek merkezî ikon kayıt defteri:
 * - Katman 1: Özel pastane imza ikonları (17 adet)
 * - Katman 2: Lucide yardımcı ikonları (25 adet)
 * - Katman 3: Resmi marka ikonları (2 adet)
 */
export const ICON_REGISTRY: Record<IconName, RegistryIconComponent> = {
  // === KATMAN 1: KATEGORİ İMZA İKONLARI ===
  'yas-pasta': createBakerySvgIcon('YasPastaIcon', ({ variant }) => {
    const wave = accentFill(variant);
    const berry =
      variant === 'duotone'
        ? { fill: 'var(--icon-cilek)', fillOpacity: 0.78 }
        : variant === 'solid'
          ? { fill: 'currentColor', fillOpacity: 0.9 }
          : { fill: 'none' };
    return (
      <>
        <path
          d="M12 4.3C10.7 4.3 9.9 5.3 10.1 6.6C10.3 7.7 11.2 8.7 12 8.7C12.8 8.7 13.7 7.7 13.9 6.6C14.1 5.3 13.3 4.3 12 4.3Z"
          {...berry}
        />
        <path d="M12 4.3C12.2 3.4 12.8 2.8 13.5 2.6" />
        <path
          d="M4.3 12.5C4.3 11.3 5.2 10.4 6.4 10.4H17.6C18.8 10.4 19.7 11.3 19.7 12.5V13.8C18.6 13.8 18 15 16.9 15C15.8 15 15.2 13.5 14 13.5C12.7 13.5 12.2 15.1 11 15.1C9.7 15.1 9.1 13.5 7.9 13.5C6.7 13.5 5.9 14.6 4.3 14.2Z"
          stroke="none"
          {...wave}
        />
        <path d="M4.3 19.4V12.5C4.3 11.3 5.2 10.4 6.4 10.4H17.6C18.8 10.4 19.7 11.3 19.7 12.5V19.4H4.3Z" />
        <path d="M4.3 14.1C5.7 14.6 6.5 13.4 7.8 13.4C9.1 13.4 9.7 15 11 15C12.3 15 12.8 13.4 14.1 13.4C15.3 13.4 16 14.9 17.1 14.9C18.1 14.9 18.8 13.8 19.7 13.8" />
        <path d="M4.3 16.9H19.7" />
      </>
    );
  }),

  'ekler-ibiza': createBakerySvgIcon('EklerIbizaIcon', ({ variant }) => {
    const glaze = accentFill(variant);
    return (
      <>
        <path
          d="M4 11.6C4 8.8 6.6 7 10.4 7H14.5C17.8 7 20 8.8 20 11.6C18.8 12.4 17.5 12.1 16.6 11.7C16 11.4 15.5 12.1 15.5 13.2C15.5 14.4 14.8 15.2 14 15.2C13.2 15.2 12.6 14.3 12.6 13.1C12.6 12.1 12 11.8 10.9 12.1C8.6 12.7 6 12.6 4 11.6Z"
          stroke="none"
          {...glaze}
        />
        <rect x="3.5" y="7" width="17" height="10" rx="5" />
        <path d="M3.8 11.4C5.8 12.5 8.5 12.6 10.8 12C12 11.7 12.6 12.1 12.6 13.2C12.6 14.4 13.2 15.3 14 15.3C14.8 15.3 15.5 14.4 15.5 13.2C15.5 12.1 16 11.4 16.8 11.7C17.9 12.1 19 12.1 20.2 11.4" />
        <path d="M7.5 9.5H11.5" />
      </>
    );
  }),

  'kuru-pasta': createBakerySvgIcon('KuruPastaIcon', ({ variant }) => {
    const jam =
      variant === 'duotone'
        ? { fill: 'var(--icon-cilek)', fillOpacity: 0.65 }
        : variant === 'solid'
          ? { fill: 'currentColor', fillOpacity: 0.8 }
          : { fill: 'none' };
    const body = accentFill(variant);
    return (
      <>
        <path
          d="M8.6 7.5Q10.3 5.5 12 7.5Q14.6 7.3 14.8 9.9Q16.9 11.5 15.1 13.3Q15.2 16 12.6 16.1Q10.7 18.2 8.7 16.2Q6.1 16.3 6.1 13.7Q4 12 5.9 10.2Q5.9 7.5 8.6 7.5Z"
          {...body}
        />
        <path d="M15.3 7.4C16.3 5.9 18.4 5.7 19.7 6.8C21 7.9 21.2 9.9 20.1 11.3C19.4 12.1 18.3 12.5 17.2 12.4" />
        <circle cx="17.8" cy="8.9" r="0.7" fill="currentColor" stroke="none" />
        <circle cx="10.4" cy="12" r="2.2" {...jam} />
      </>
    );
  }),

  'sutlu-tatli': createBakerySvgIcon('SutluTatliIcon', ({ variant }) => {
    const top = accentFill(variant);
    return (
      <>
        <ellipse cx="10.5" cy="11" rx="6.2" ry="2.2" stroke="none" {...top} />
        <path d="M4.2 11.2C4.2 15 6.8 17.6 10.5 17.6C14.2 17.6 16.8 15 16.8 11.2" />
        <path d="M8 20H13" />
        <path d="M10.5 17.6V20" />
        <ellipse cx="10.5" cy="11" rx="6.3" ry="2.2" />
        <path d="M8.7 10.8C9.8 10.3 11.2 10.3 12.3 10.9" />
        <path d="M19.8 4.4C18.7 4.4 18 5.5 18.2 6.8C18.3 7.7 19 8.4 19.7 8.4C20.5 8.4 21.1 7.7 21.2 6.8C21.4 5.5 20.8 4.4 19.8 4.4Z" />
        <path d="M19.7 8.4V19.6" />
      </>
    );
  }),

  // === KATMAN 1: DEĞERLER İMZA İKONLARI ===
  'taze-gunluk': createBakerySvgIcon('TazeGunlukIcon', ({ variant }) => {
    const tray = solidOrAccent(variant, 0.2);
    return (
      <>
        <path d="M7.5 8.5C7 7 8.4 6 8 4.4" />
        <path d="M12 8C11.5 6.4 12.9 5.3 12.4 3.6" />
        <path d="M16.5 8.5C16 7 17.4 6 17 4.4" />
        <path
          d="M4.2 14.2C4.2 12.7 5.4 11.5 7 11.5H17C18.6 11.5 19.8 12.7 19.8 14.2V16.8C19.8 17.9 18.9 18.8 17.8 18.8H6.2C5.1 18.8 4.2 17.9 4.2 16.8V14.2Z"
          {...tray}
        />
        <path d="M2.8 15.2H4.2M19.8 15.2H21.2" />
        <path d="M7.5 15.2H16.5" />
      </>
    );
  }),

  'usta-eli': createBakerySvgIcon('UstaEliIcon', ({ variant }) => {
    const crown = accentFill(variant);
    return (
      <>
        <path
          d="M7 14.5C5.1 14.1 3.8 12.5 4 10.5C4.2 8.7 5.7 7.4 7.5 7.5C8.3 5.3 10.3 4 12 4C13.7 4 15.7 5.3 16.5 7.5C18.3 7.4 19.8 8.7 20 10.5C20.2 12.5 18.9 14.1 17 14.5V18.5C17 19.3 16.3 20 15.5 20H8.5C7.7 20 7 19.3 7 18.5V14.5Z"
          {...crown}
        />
        <path d="M7 16.8H17" />
        <path d="M10 11V14.2M14 11V14.2" />
      </>
    );
  }),

  'antep-fistigi': createBakerySvgIcon('AntepFistigiIcon', ({ variant }) => {
    const kernel =
      variant === 'duotone'
        ? { fill: 'var(--icon-accent)', fillOpacity: 0.4 }
        : variant === 'solid'
          ? { fill: 'currentColor', fillOpacity: 0.8 }
          : { fill: 'none' };
    return (
      <>
        <path d="M12 4.2C8.3 4.2 5.6 7.5 5.6 12C5.6 16.5 8.3 19.8 12 19.8C13.8 19.8 15.4 18.8 16.6 17.2" />
        <path d="M12 4.2C15.7 4.2 18.4 7.5 18.4 12C18.4 13.7 17.9 15.3 17 16.6" />
        <path
          d="M11.6 7.2C13.6 7.8 15.1 9.8 15.1 12.2C15.1 14.6 13.7 16.5 11.8 17C10.5 15.6 10 13.8 10 12C10 10.1 10.5 8.4 11.6 7.2Z"
          {...kernel}
        />
      </>
    );
  }),

  'ozenli-paket': createBakerySvgIcon('OzenliPaketIcon', ({ variant }) => {
    const box = accentFill(variant);
    return (
      <>
        <path
          d="M4.8 11H19.2V18.5C19.2 19.6 18.3 20.5 17.2 20.5H6.8C5.7 20.5 4.8 19.6 4.8 18.5V11Z"
          {...box}
        />
        <rect x="3.8" y="8" width="16.4" height="3.2" rx="1.2" />
        <path d="M12 8V20.5" />
        <path d="M12 8C10.3 8 8.7 6.8 8.9 5.3C9.1 4.1 10.7 4 11.6 5.6L12 8ZM12 8C13.7 8 15.3 6.8 15.1 5.3C14.9 4.1 13.3 4 12.4 5.6L12 8Z" />
      </>
    );
  }),

  // === KATMAN 1: AKSİYON VE YARDIMCI İMZA İKONLARI ===
  'pasta-kutusu': createBakerySvgIcon('PastaKutusuIcon', ({ variant }) => {
    const box = accentFill(variant);
    return (
      <>
        <path
          d="M5.2 11.2H18.8V18.4C18.8 19.5 17.9 20.3 16.8 20.3H7.2C6.1 20.3 5.2 19.5 5.2 18.4V11.2Z"
          {...box}
        />
        <path d="M12 11.2V20.3" />
        <g className="icon-pasta-box-lid">
          <rect x="3.8" y="8" width="16.4" height="3.2" rx="1.3" />
          <path d="M12 8C10.5 7.9 9.2 6.8 9.4 5.5C9.6 4.5 11 4.4 11.7 5.8L12 8ZM12 8C13.5 7.9 14.8 6.8 14.6 5.5C14.4 4.5 13 4.4 12.3 5.8L12 8Z" />
        </g>
      </>
    );
  }),

  'krema-bukle-yukari': createBakerySvgIcon('KremaBukleYukariIcon', ({ variant }) => {
    const swirl = accentFill(variant);
    return (
      <>
        <path
          d="M6.5 18.5C6.5 16.3 8.8 15 12 15C15.2 15 17.5 16.3 17.5 18.5C17.5 19.6 16.4 20.2 15 20.2H9C7.6 20.2 6.5 19.6 6.5 18.5Z"
          {...swirl}
        />
        <path d="M12 15V5.5" />
        <path d="M7.5 9.8C9.3 8.2 10.6 6.8 12 5.2C13.4 6.8 14.7 8.2 16.5 9.8" />
        <path d="M8.8 13.5C10.2 12.7 13.8 12.7 15.2 13.5" />
      </>
    );
  }),

  'tabla-yukleme': createBakerySvgIcon('TablaYuklemeIcon', ({ variant }) => {
    const plate = accentFill(variant);
    return (
      <>
        <path d="M4.2 15.4H19.8" />
        <path d="M9.5 19.6H14.5M12 15.4V19.6" />
        <g className="icon-tabla-spinner">
          <circle cx="12" cy="10.2" r="4.8" strokeDasharray="16 8" {...plate} />
          <circle cx="12" cy="5.4" r="0.8" fill="currentColor" stroke="none" />
        </g>
      </>
    );
  }),

  'bos-tabak': createBakerySvgIcon('BosTabakIcon', ({ variant }) => {
    const rim = accentFill(variant);
    return (
      <>
        <ellipse cx="10.2" cy="13.5" rx="6.6" ry="5.5" {...rim} />
        <ellipse cx="10.2" cy="13.5" rx="3.8" ry="3" />
        <path d="M19.8 5.2V10.5M18.2 5.2V8.8C18.2 9.8 18.9 10.5 19.8 10.5C20.7 10.5 21.4 9.8 21.4 8.8V5.2" />
        <path d="M19.8 10.5V19.2" />
      </>
    );
  }),

  parilti: createBakerySvgIcon('PariltiIcon', ({ variant }) => {
    const glow = accentFill(variant);
    return (
      <>
        <path
          d="M12 3.8C12.7 7.8 14.2 9.3 18.2 10C14.2 10.7 12.7 12.2 12 16.2C11.3 12.2 9.8 10.7 5.8 10C9.8 9.3 11.3 7.8 12 3.8Z"
          {...glow}
        />
        <path d="M17.8 14.8C18 16.2 18.6 16.8 20 17C18.6 17.2 18 17.8 17.8 19.2C17.6 17.8 17 17.2 15.6 17C17 16.8 17.6 16.2 17.8 14.8Z" />
        <circle cx="6.2" cy="17.2" r="0.9" fill="currentColor" stroke="none" />
      </>
    );
  }),

  onay: createBakerySvgIcon('OnayIcon', ({ variant }) => {
    const cookie = accentFill(variant);
    return (
      <>
        <path
          d="M9.6 5.1Q12 3.4 14.4 5.1Q17.5 5 18.2 8Q20.7 10 19.4 12.8Q20.2 16 17.2 17.2Q15.8 20.1 12.8 19.1Q10 20.6 8 18.1Q5 17.6 5.4 14.6Q3.5 12 5.4 9.4Q5.2 6.3 8.2 6Q8.7 5.4 9.6 5.1Z"
          {...cookie}
        />
        <path d="M8.8 12.3L11 14.6L15.6 9.6" className="icon-onay-check" />
      </>
    );
  }),

  'pin-kiraz': createBakerySvgIcon('PinKirazIcon', ({ variant }) => {
    const cherry =
      variant === 'duotone'
        ? { fill: 'var(--icon-cilek)', fillOpacity: 0.45 }
        : variant === 'solid'
          ? { fill: 'currentColor', fillOpacity: 0.85 }
          : { fill: 'none' };
    return (
      <>
        <path d="M12 6.8C12.3 4.8 13.7 3.5 15.8 3.2" />
        <path
          d="M12 20.5C12 20.5 6.4 15.5 6.4 11.2C6.4 8.1 8.9 6.2 12 6.2C15.1 6.2 17.6 8.1 17.6 11.2C17.6 15.5 12 20.5 12 20.5Z"
          {...cherry}
        />
        <circle cx="12" cy="11.2" r="2" />
      </>
    );
  }),

  'hamburger-krema': createBakerySvgIcon('HamburgerKremaIcon', ({ isOpen = false }) => (
    <>
      <path
        d="M4.2 7.2C6.5 6.2 8.7 8.2 11 7.2C13.3 6.2 15.5 8.2 19.8 7.2"
        className="icon-hamburger-bar"
        style={{
          transform: isOpen ? 'translateY(4.8px) rotate(45deg)' : 'translateY(0) rotate(0deg)',
        }}
      />
      <path
        d="M4.2 12C6.5 11 8.7 13 11 12C13.3 11 15.5 13 19.8 12"
        className="icon-hamburger-bar"
        style={{
          opacity: isOpen ? 0 : 1,
          transform: isOpen ? 'scaleX(0.4)' : 'scaleX(1)',
        }}
      />
      <path
        d="M4.2 16.8C6.5 15.8 8.7 17.8 11 16.8C13.3 15.8 15.5 17.8 19.8 16.8"
        className="icon-hamburger-bar"
        style={{
          transform: isOpen ? 'translateY(-4.8px) rotate(-45deg)' : 'translateY(0) rotate(0deg)',
        }}
      />
    </>
  )),

  'play-dilim': createBakerySvgIcon('PlayDilimIcon', ({ variant }) => {
    const fillProps = solidOrAccent(variant, 0.9);
    return (
      <>
        <path
          d="M7.2 5.5C6.4 5 5.4 5.6 5.4 6.6V17.4C5.4 18.4 6.4 19 7.2 18.5L18.2 13.1C19.1 12.6 19.1 11.4 18.2 10.9L7.2 5.5Z"
          {...fillProps}
        />
        <path d="M5.6 10.2C7.4 10.8 8.8 10 10.4 10.7C11.6 11.2 12.6 10.5 13.8 10.9" />
      </>
    );
  }),

  // === KATMAN 2: YARDIMCI İKONLAR (LUCIDE) ===
  'chevron-left': createLucideHelperIcon('ChevronLeftIcon', ChevronLeft),
  'chevron-right': createLucideHelperIcon('ChevronRightIcon', ChevronRight),
  close: createLucideHelperIcon('CloseIcon', X),
  menu: createLucideHelperIcon('MenuIcon', Menu),
  'arrow-up-right': createLucideHelperIcon('ArrowUpRightIcon', ArrowUpRight),
  'arrow-down-right': createLucideHelperIcon('ArrowDownRightIcon', ArrowDownRight),
  'arrow-left': createLucideHelperIcon('ArrowLeftIcon', ArrowLeft),
  phone: createLucideHelperIcon('PhoneIcon', Phone),
  clock: createLucideHelperIcon('ClockIcon', Clock),
  compass: createLucideHelperIcon('CompassIcon', Compass),
  check: createLucideHelperIcon('CheckIcon', Check),
  play: createLucideHelperIcon('PlayIcon', Play),
  pause: createLucideHelperIcon('PauseIcon', Pause),
  'volume-on': createLucideHelperIcon('VolumeOnIcon', Volume2),
  'volume-off': createLucideHelperIcon('VolumeOffIcon', VolumeX),
  maximize: createLucideHelperIcon('MaximizeIcon', Maximize),
  copy: createLucideHelperIcon('CopyIcon', Copy),
  navigation: createLucideHelperIcon('NavigationIcon', Navigation),
  'zoom-in': createLucideHelperIcon('ZoomInIcon', ZoomIn),
  'zoom-out': createLucideHelperIcon('ZoomOutIcon', ZoomOut),
  info: createLucideHelperIcon('InfoIcon', Info),
  alert: createLucideHelperIcon('AlertIcon', AlertTriangle),
  'map-pin': createLucideHelperIcon('MapPinIcon', MapPin),
  store: createLucideHelperIcon('StoreIcon', Store),
  hand: createLucideHelperIcon('HandIcon', Hand),
  'rotate-ccw': createLucideHelperIcon('RotateCcwIcon', RotateCcw),

  // === KATMAN 3: MARKA İKONLARI (RESMİ TEK RENK currentColor) ===
  whatsapp: createBrandSvgIcon('WhatsAppBrandIcon', () => (
    <path d="M12 2c-5.5 0-9.9 4.5-9.9 9.9 0 1.8.5 3.4 1.3 5l-1.4 5.1 5.3-1.4c1.5.8 3.2 1.2 4.7 1.2 5.5 0 9.9-4.4 9.9-9.9 0-2.7-1-5.1-2.9-7-1.9-1.9-4.4-2.9-7-2.9m0 1.7c2.2 0 4.3.9 5.8 2.4 1.6 1.6 2.4 3.6 2.4 5.8 0 4.5-3.7 8.2-8.2 8.2-1.5 0-2.9-.4-4.2-1.1l-.3-.2-3.1.8.8-3.1-.2-.3c-.8-1.3-1.2-2.8-1.2-4.3 0-4.5 3.7-8.2 8.2-8.2m-3.5 3.7c-.2 0-.4.1-.7.3-.2.3-.9.9-.9 2.1 0 1.2.9 2.4 1 2.6.1.2 1.7 2.7 4.2 3.7.6.3 1.1.4 1.4.5.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2 0-.1-.2-.2-.5-.3-.3-.1-1.5-.8-1.8-.8-.2-.1-.4-.1-.6.1-.2.3-.6.8-.8 1-.1.2-.3.2-.5.1-.3-.1-1.1-.4-2.1-1.3-.8-.7-1.3-1.6-1.5-1.8-.1-.3 0-.4.1-.5.1-.1.3-.3.4-.5.1-.2.2-.3.3-.4.1-.2 0-.3 0-.4-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4-.2 0-.3 0-.5 0z" />
  )),

  instagram: createBrandSvgIcon('InstagramBrandIcon', () => (
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.4 5.6 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.6 18.4 4 16.4 4H7.6Zm9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
    />
  )),
};

/**
 * Sitenin tek giriş noktalı ikon bileşeni.
 * - `24x24` viewBox, `1.75` yuvarlatılmış çizgi ve CSS renk token'ları kullanır.
 * - `title` yoksa otomatik `aria-hidden="true"`, varsa `role="img"` + `<title>` üretir.
 */
export const Icon: React.FC<IconProps> = React.memo(
  ({ name, size = 24, variant = 'outline', title, isOpen, ...rest }) => {
    const IconComponent = ICON_REGISTRY[name];
    return (
      <IconComponent
        size={size}
        variant={variant}
        title={title}
        isOpen={isOpen}
        {...rest}
      />
    );
  }
);

Icon.displayName = 'Icon';
