import React from 'react';
import { HERO_COLORS } from './heroConstants';

interface CakePosterProps {
  /** Yükleme sırasında çok hafif nefes alma animasyonu gösterilsin mi */
  isLoading?: boolean;
}

/**
 * WebGL desteklenmediğinde, düşük performans modunda veya 3D chunk yüklenirken
 * aynı sabit aspect-ratio kutuda sıfır kayma (CLS=0) ile gösterilen statik SVG pasta görseli.
 */
export const CakePoster: React.FC<CakePosterProps> = React.memo(({ isLoading = false }) => {
  return (
    <div
      className="relative w-full h-full flex items-center justify-center select-none pointer-events-none"
      role="img"
      aria-label="Çikolata akışlı üç katlı kakaolu ve vanilya kremalı yaş pasta illüstrasyonu"
    >
      {/* Yumuşak vanilya arka plan parıltısı */}
      <div
        aria-hidden="true"
        className="absolute inset-4 rounded-full opacity-75"
        style={{
          background:
            'radial-gradient(circle at 50% 48%, rgba(243, 223, 181, 0.55) 0%, rgba(243, 223, 181, 0.16) 48%, transparent 74%)',
        }}
      />

      <svg
        viewBox="0 0 360 320"
        className={`relative w-[84%] h-[84%] max-w-[360px] drop-shadow-[0_18px_28px_rgba(59,35,20,0.12)] ${
          isLoading ? 'opacity-95' : 'opacity-100'
        }`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="posterGlaze" x1="180" y1="68" x2="180" y2="178" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={HERO_COLORS.glazeDark} />
            <stop offset="68%" stopColor="#4A2B18" />
            <stop offset="100%" stopColor={HERO_COLORS.glazeMid} />
          </linearGradient>
          <linearGradient id="posterStand" x1="180" y1="210" x2="180" y2="286" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={HERO_COLORS.porcelainStand} />
            <stop offset="100%" stopColor="#EFE5D6" />
          </linearGradient>
        </defs>

        {/* Yumuşak zemin gölgesi */}
        <ellipse cx="180" cy="285" rx="92" ry="14" fill="#3B2314" fillOpacity="0.12" />

        {/* Porselen Pasta Tablası */}
        <path
          d="M148 228 L212 228 L204 268 C222 271 236 277 236 282 C236 286 211 290 180 290 C149 290 124 286 124 282 C124 277 138 271 156 268 Z"
          fill="url(#posterStand)"
          stroke="#DFD2BE"
          strokeWidth="1.5"
        />
        <ellipse
          cx="180"
          cy="222"
          rx="126"
          ry="24"
          fill={HERO_COLORS.porcelainStand}
          stroke={HERO_COLORS.porcelainRimGold}
          strokeWidth="2.2"
        />
        <ellipse cx="180" cy="220" rx="116" ry="18" fill="#F8F2E7" />

        {/* Katmanlı Pasta Gövdesi: 3 Kakaolu Kek + Arada Vanilya Krema */}
        {/* Alt Kakaolu Kek */}
        <path
          d="M84 185 L84 211 C84 222 127 231 180 231 C233 231 276 222 276 211 L276 185 Z"
          fill={HERO_COLORS.cakeSpongeCocoa}
        />
        {/* Alt Vanilya Krema */}
        <path
          d="M84 173 L84 186 C84 196 127 204 180 204 C233 204 276 196 276 186 L276 173 Z"
          fill={HERO_COLORS.vanillaCream}
        />
        {/* Orta Kakaolu Kek */}
        <path
          d="M84 146 L84 174 C84 184 127 192 180 192 C233 192 276 184 276 174 L276 146 Z"
          fill={HERO_COLORS.cakeSpongeCocoa}
        />
        {/* Üst Vanilya Krema */}
        <path
          d="M84 134 L84 147 C84 157 127 165 180 165 C233 165 276 157 276 147 L276 134 Z"
          fill={HERO_COLORS.vanillaCream}
        />
        {/* Üst Kakaolu Kek */}
        <path
          d="M84 106 L84 135 C84 145 127 153 180 153 C233 153 276 145 276 135 L276 106 Z"
          fill={HERO_COLORS.cakeSpongeCocoa}
        />

        {/* Çikolata Glazür + Damla Dilleri */}
        <path
          d="M83 106 C83 92 127 82 180 82 C233 82 277 92 277 106
             L277 132 C277 141 267 142 266 131 C265 122 256 122 255 142
             C254 155 242 155 241 139 C240 126 226 127 224 152
             C222 169 208 169 207 148 C206 131 193 131 191 144
             C189 156 175 156 174 141 C173 128 158 130 156 161
             C154 176 140 175 139 152 C138 132 125 130 123 144
             C121 155 110 155 109 138 C108 126 98 127 96 139
             C94 148 83 145 83 132 Z"
          fill="url(#posterGlaze)"
        />
        <ellipse cx="180" cy="105" rx="96" ry="22" fill="#3B2314" />
        {/* Glazür Parlaması */}
        <path
          d="M114 98 C138 89 182 88 214 93"
          stroke="rgba(255,253,249,0.34)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* Vanilya Krema Rozetleri */}
        {[104, 134, 165, 196, 227, 256].map((cx, i) => {
          const cy = 98 + Math.sin((i / 5) * Math.PI) * 11;
          return (
            <g key={cx}>
              <ellipse cx={cx} cy={cy + 3} rx="10" ry="6.5" fill={HERO_COLORS.vanillaCream} stroke={HERO_COLORS.vanillaStroke} strokeWidth="0.9" />
              <ellipse cx={cx} cy={cy - 1} rx="6.5" ry="4.5" fill="#FFF7E4" />
              <circle cx={cx} cy={cy - 4} r="2.6" fill="#FFFDF9" />
            </g>
          );
        })}

        {/* Üst Çilek/Vişneler & Yapraklar */}
        {[
          { x: 145, y: 84 },
          { x: 180, y: 78 },
          { x: 216, y: 85 },
          { x: 162, y: 95 },
          { x: 199, y: 95 },
        ].map((berry, idx) => (
          <g key={idx}>
            <path
              d={`M${berry.x - 5} ${berry.y - 6} Q${berry.x} ${berry.y - 12} ${berry.x + 5} ${berry.y - 6}`}
              fill={HERO_COLORS.mintLeaf}
            />
            <circle cx={berry.x} cy={berry.y} r="7.5" fill={HERO_COLORS.berryRed} />
            <circle cx={berry.x - 2.3} cy={berry.y - 2.3} r="2" fill="rgba(255,255,255,0.45)" />
          </g>
        ))}

        {/* Düşen minik çikolata damlaları */}
        <path d="M147 183 C149 188 151 191 151 194 A4 4 0 1 1 143 194 C143 191 145 188 147 183 Z" fill={HERO_COLORS.glazeDark} />
        <path d="M215 178 C216.5 182 218 185 218 187 A3 3 0 1 1 212 187 C212 185 213.5 182 215 178 Z" fill={HERO_COLORS.milkChocolate} />
      </svg>
    </div>
  );
});
CakePoster.displayName = 'CakePoster';
