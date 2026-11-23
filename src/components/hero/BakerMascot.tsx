import React from 'react';

interface BakerMascotProps {
  className?: string;
}

/**
 * "Mağazamızı Görün" butonunun yanında gülümseyerek karşılayan
 * geleneksel pastacı ustamız illüstrasyonu (şeffaf zemin, el çizimi çizgi sıcaklığı)
 */
export const BakerMascot: React.FC<BakerMascotProps> = React.memo(
  ({ className = '' }) => {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 84 96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Yumuşak alt gölge */}
        <ellipse
          cx="42"
          cy="90"
          rx="22"
          ry="4.5"
          fill="#3B2314"
          fillOpacity="0.12"
        />

        {/* Pofuduk geleneksel aşçı/pastacı şapkası */}
        <path
          d="M 22 40 C 12 36, 11 21, 22 18 C 25 10, 35 7, 42 10 C 49 7, 59 10, 62 18 C 73 21, 72 36, 62 40 Z"
          fill="#FFFDF9"
          stroke="#4A2C1B"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {/* Şapka iç kıvrımları */}
        <path
          d="M 27 19 C 31 24, 32 30, 31 35 M 42 14 C 42 20, 42 28, 42 35 M 57 19 C 53 24, 52 30, 53 35"
          stroke="#D7C8B4"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        {/* Şapka bandı */}
        <path
          d="M 23 36 C 35 33.5, 49 33.5, 61 36 L 60 45 C 48 42.8, 36 42.8, 24 45 Z"
          fill="#F5EDE0"
          stroke="#4A2C1B"
          strokeWidth="2.1"
          strokeLinejoin="round"
        />

        {/* Kulaklar */}
        <path
          d="M 23 51 C 18.5 51, 18.5 60, 23.5 60"
          fill="#F4C7AD"
          stroke="#4A2C1B"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M 61 51 C 65.5 51, 65.5 60, 60.5 60"
          fill="#F4C7AD"
          stroke="#4A2C1B"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Güler yüzlü baş */}
        <path
          d="M 24 44 C 24 44, 42 40.5, 60 44 L 60.5 56 C 60.5 68, 52 75, 42 75 C 32 75, 23.5 68, 23.5 56 Z"
          fill="#FAD5BE"
          stroke="#4A2C1B"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />

        {/* Neşeli kaşlar */}
        <path
          d="M 29.5 48.5 Q 33 45.8, 37 48.2"
          stroke="#3B2314"
          strokeWidth="2.1"
          strokeLinecap="round"
        />
        <path
          d="M 47 48.2 Q 51 45.8, 54.5 48.5"
          stroke="#3B2314"
          strokeWidth="2.1"
          strokeLinecap="round"
        />

        {/* Samimi gülen gözler */}
        <path
          d="M 30 53.5 Q 33.5 50.2, 37 53.5"
          stroke="#2A180D"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M 47 53.5 Q 50.5 50.2, 54 53.5"
          stroke="#2A180D"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* Sıcak allık yanaklar */}
        <ellipse cx="29.5" cy="59.5" rx="4.2" ry="2.4" fill="#EB948A" fillOpacity="0.6" />
        <ellipse cx="54.5" cy="59.5" rx="4.2" ry="2.4" fill="#EB948A" fillOpacity="0.6" />

        {/* Yuvarlak dostane burun */}
        <path
          d="M 39.2 55.2 C 39.2 58.8, 44.8 58.8, 44.8 55.2"
          fill="#F2B89B"
          stroke="#4A2C1B"
          strokeWidth="1.9"
          strokeLinecap="round"
        />

        {/* Sıcak gülümseme */}
        <path
          d="M 35 63.5 Q 42 70.5, 49 63.5 Z"
          fill="#B23A48"
          stroke="#3B2314"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M 37.5 64.2 L 46.5 64.2"
          stroke="#FFFDF9"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Karakteristik kıvrık pala bıyık */}
        <path
          d="M 42 60 C 37.5 57.5, 31 59.5, 27.5 63.2 C 25.5 65.2, 23.2 63.5, 24.8 61.5 C 27.5 64.5, 34 65.2, 42 62.6 C 50 65.2, 56.5 64.5, 59.2 61.5 C 60.8 63.5, 58.5 65.2, 56.5 63.2 C 53 59.5, 46.5 57.5, 42 60 Z"
          fill="#2A180D"
          stroke="#2A180D"
          strokeWidth="1.1"
          strokeLinejoin="round"
        />

        {/* Beyaz pastacı yakası / omuzlar */}
        <path
          d="M 19 88 C 20 77, 29 73, 42 73 C 55 73, 64 77, 65 88 Z"
          fill="#FFFDF9"
          stroke="#4A2C1B"
          strokeWidth="2.1"
          strokeLinejoin="round"
        />

        {/* Sıcak pastel fular & düğüm */}
        <path
          d="M 31 74 L 42 82.5 L 53 74 L 48 87.5 L 36 87.5 Z"
          fill="#EBBAB3"
          stroke="#4A2C1B"
          strokeWidth="1.9"
          strokeLinejoin="round"
        />
        <ellipse
          cx="42"
          cy="79.5"
          rx="4.6"
          ry="3.8"
          fill="#DF9C93"
          stroke="#4A2C1B"
          strokeWidth="1.9"
        />
      </svg>
    );
  }
);
BakerMascot.displayName = 'BakerMascot';
