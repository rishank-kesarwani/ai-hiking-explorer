import React from 'react';

interface HikingLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export const HikingLogo: React.FC<HikingLogoProps> = ({
  size = 40,
  showText = true,
  className = '',
}) => {
  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.75rem',
        textDecoration: 'none',
        userSelect: 'none',
      }}
    >
      {/* Emblem SVG Icon */}
      <svg
        viewBox="0 0 64 64"
        width={size}
        height={size}
        style={{
          flexShrink: 0,
          filter: 'drop-shadow(0 4px 14px rgba(16, 185, 129, 0.45))',
        }}
      >
        <defs>
          <linearGradient id="logoEmblemBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#064e3b" />
          </linearGradient>
          <linearGradient id="logoEmblemMountBack" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#065f46" />
          </linearGradient>
          <linearGradient id="logoEmblemMountFront" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          <linearGradient id="logoEmblemTrail" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <radialGradient id="logoEmblemStarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#34d399" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer Frame */}
        <rect
          x="2"
          y="2"
          width="60"
          height="60"
          rx="16"
          fill="url(#logoEmblemBg)"
          stroke="#10b981"
          strokeWidth="2"
          strokeOpacity="0.6"
        />

        {/* Background Mountain Ridge */}
        <polygon points="12,48 26,20 40,48" fill="url(#logoEmblemMountBack)" opacity="0.85" />
        <polygon points="26,20 30,28 26,26 22,28" fill="#ffffff" opacity="0.95" />

        {/* Foreground Summit */}
        <polygon points="24,48 42,12 56,48" fill="url(#logoEmblemMountFront)" />
        <polygon points="42,12 47,23 42,20 37,23" fill="#ffffff" opacity="0.95" />

        {/* Dynamic Trail */}
        <path
          d="M12,50 Q28,45 33,36 T42,22"
          fill="none"
          stroke="url(#logoEmblemTrail)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <circle cx="13" cy="50" r="2.5" fill="#fbbf24" />

        {/* Luminous AI Beacon */}
        <circle cx="42" cy="12" r="10" fill="url(#logoEmblemStarGlow)" />
        <path
          d="M42,6 Q42,12 48,12 Q42,12 42,18 Q42,12 36,12 Q42,12 42,6 Z"
          fill="#ffffff"
        />
        <circle cx="42" cy="12" r="1.5" fill="#38bdf8" />
      </svg>

      {/* Brand Text */}
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: '1.2rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#ffffff',
              lineHeight: 1.15,
            }}
          >
            AI HIKING <span className="gradient-text" style={{ color: '#10b981' }}>EXPLORER</span>
          </div>
          <div
            style={{
              fontSize: '0.675rem',
              color: 'var(--text-muted)',
              letterSpacing: '0.06em',
              fontWeight: 600,
              textTransform: 'uppercase',
              marginTop: '1px',
            }}
          >
            Smart Trail Expedition
          </div>
        </div>
      )}
    </div>
  );
};
