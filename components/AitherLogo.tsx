import React from 'react';

interface AitherLogoProps {
  className?: string;
  showText?: boolean;
}

export const AitherLogo: React.FC<AitherLogoProps> = ({ className = "w-24 h-24", showText = false }) => {
  return (
    <div className="flex flex-col items-center justify-center select-none">
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${className} transition-transform duration-500 hover:rotate-6`}
      >
        <defs>
          {/* Metallic golden linear gradients for the brass/bronze look */}
          <linearGradient id="goldLight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF2B2" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#AA7C11" />
          </linearGradient>

          <linearGradient id="goldDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B38728" />
            <stop offset="60%" stopColor="#7A5813" />
            <stop offset="100%" stopColor="#433008" />
          </linearGradient>

          <linearGradient id="goldHighlight" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFE066" />
            <stop offset="50%" stopColor="#FFCC00" />
            <stop offset="100%" stopColor="#997300" />
          </linearGradient>

          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient glow effect under the compass */}
        <circle cx="100" cy="100" r="85" fill="url(#centerGlow)" />

        {/* Outer Circular Rim (Bronze casing) */}
        <circle cx="100" cy="100" r="76" stroke="url(#goldDark)" strokeWidth="4.5" fill="#1b251d" fillOpacity="0.8" />
        <circle cx="100" cy="100" r="72" stroke="url(#goldLight)" strokeWidth="1.5" />

        {/* Outer Directional Tabs (N, S, W, E background housings) */}
        {/* North Housing */}
        <path d="M85 24 C85 10 115 10 115 24 Z" fill="#1b251d" stroke="url(#goldLight)" strokeWidth="2.5" />
        <circle cx="100" cy="18" r="8" fill="#1b251d" stroke="url(#goldLight)" strokeWidth="1.5" />
        <text x="100" y="21" fill="url(#goldHighlight)" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">N</text>

        {/* South Housing */}
        <path d="M85 176 C85 190 115 190 115 176 Z" fill="#1b251d" stroke="url(#goldLight)" strokeWidth="2.5" />
        <circle cx="100" cy="182" r="8" fill="#1b251d" stroke="url(#goldHighlight)" strokeWidth="1.5" />
        <text x="100" y="185" fill="url(#goldHighlight)" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">S</text>

        {/* West Housing */}
        <path d="M24 85 C10 85 10 115 24 115 Z" fill="#1b251d" stroke="url(#goldLight)" strokeWidth="2.5" />
        <circle cx="18" cy="100" r="8" fill="#1b251d" stroke="url(#goldHighlight)" strokeWidth="1.5" />
        <text x="18" y="103" fill="url(#goldHighlight)" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">W</text>

        {/* East Housing */}
        <path d="M176 85 C190 85 190 115 176 115 Z" fill="#1b251d" stroke="url(#goldLight)" strokeWidth="2.5" />
        <circle cx="182" cy="100" r="8" fill="#1b251d" stroke="url(#goldHighlight)" strokeWidth="1.5" />
        <text x="182" y="103" fill="url(#goldHighlight)" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">E</text>

        {/* Roman Numeral Ring Tracks */}
        <circle cx="100" cy="100" r="62" stroke="url(#goldDark)" strokeWidth="1" />
        <circle cx="100" cy="100" r="50" stroke="url(#goldDark)" strokeWidth="1.5" />

        {/* Roman Numerals for 12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 around the track */}
        <g fontSize="7" fontWeight="bold" fill="url(#goldHighlight)" fontFamily="serif" textAnchor="middle">
          {/* I */}
          <text transform="translate(127, 49) rotate(30)">I</text>
          {/* II */}
          <text transform="translate(148, 71) rotate(60)">II</text>
          {/* III */}
          <text transform="translate(155, 99) rotate(90)">III</text>
          {/* IV */}
          <text transform="translate(148, 128) rotate(120)">IV</text>
          {/* V */}
          <text transform="translate(127, 150) rotate(150)">V</text>
          {/* VI - replaced by S housing, but we can put it subtle */}
          {/* VII */}
          <text transform="translate(73, 150) rotate(-150)">VII</text>
          {/* VIII */}
          <text transform="translate(52, 128) rotate(-120)">VIII</text>
          {/* IX */}
          <text transform="translate(45, 99) rotate(-90)">IX</text>
          {/* X */}
          <text transform="translate(52, 71) rotate(-60)">X</text>
          {/* XI */}
          <text transform="translate(73, 49) rotate(-30)">XI</text>
        </g>

        {/* Inner Gear Teeth Wheel */}
        <circle cx="100" cy="100" r="42" stroke="url(#goldLight)" strokeWidth="3" strokeDasharray="3 2" className="animate-[spin_120s_linear_infinite]" />
        <circle cx="100" cy="100" r="37" stroke="url(#goldLight)" strokeWidth="1" />

        {/* Shorter Intercardinal Points (NE, SE, SW, NW arrows) */}
        <g stroke="none">
          {/* NE */}
          <path d="M100 100 L124 76 L120 100 Z" fill="url(#goldDark)" />
          <path d="M100 100 L124 76 L100 120 Z" fill="url(#goldLight)" />
          {/* SE */}
          <path d="M100 100 L124 124 L100 120 Z" fill="url(#goldDark)" />
          <path d="M100 100 L124 124 L120 100 Z" fill="url(#goldLight)" />
          {/* SW */}
          <path d="M100 100 L76 124 L80 100 Z" fill="url(#goldDark)" />
          <path d="M100 100 L76 124 L100 80 Z" fill="url(#goldLight)" />
          {/* NW */}
          <path d="M100 100 L76 76 L100 80 Z" fill="url(#goldDark)" />
          <path d="M100 100 L76 76 L80 100 Z" fill="url(#goldLight)" />
        </g>

        {/* Primary Large Chiseled Compass Star Points (N, S, W, E stars) */}
        <g stroke="none" className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
          {/* North Point */}
          <path d="M100 45 L106 100 L100 100 Z" fill="url(#goldLight)" />  {/* Left side light */}
          <path d="M100 45 L94 100 L100 100 Z" fill="url(#goldDark)" />   {/* Right side dark */}

          {/* South Point */}
          <path d="M100 155 L94 100 L100 100 Z" fill="url(#goldLight)" />
          <path d="M100 155 L106 100 L100 100 Z" fill="url(#goldDark)" />

          {/* East Point */}
          <path d="M155 100 L100 94 L100 100 Z" fill="url(#goldLight)" />
          <path d="M155 100 L100 106 L100 100 Z" fill="url(#goldDark)" />

          {/* West Point */}
          <path d="M45 100 L100 106 L100 100 Z" fill="url(#goldLight)" />
          <path d="M45 100 L100 94 L100 100 Z" fill="url(#goldDark)" />
        </g>

        {/* Central Complex Astrolabe Gear Hub */}
        <circle cx="100" cy="100" r="16" fill="#1b251d" stroke="url(#goldLight)" strokeWidth="2.5" />
        
        {/* Decorative central brass spirals/gilded clockwork detailing */}
        <circle cx="100" cy="100" r="11" stroke="url(#goldHighlight)" strokeWidth="1.5" strokeDasharray="3 1" />
        <path d="M96 96 C98 92 102 92 104 96 C106 100 94 104 100 100" stroke="url(#goldLight)" strokeWidth="1.5" strokeLinecap="round" />
        
        {/* Central metallic dome rivet */}
        <circle cx="100" cy="100" r="4" fill="url(#goldHighlight)" />
        <circle cx="98.5" cy="98.5" r="1" fill="#FFF" opacity="0.8" />
      </svg>
      {showText && (
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-[#FFF2B2] via-[#FFCC00] to-[#AA7C11] font-serif mt-3 select-none filter drop-shadow">
          AITHER
        </h1>
      )}
    </div>
  );
};
