'use client';

import React from 'react';

interface QuestlyLogoProps {
  size?: number;
  className?: string;
  withText?: boolean;
  textClassName?: string;
  variant?: 'lime' | 'cyan' | 'purple' | 'full';
}

export function QuestlyLogo({
  size = 32,
  className = '',
  withText = false,
  textClassName = '',
  variant = 'lime',
}: QuestlyLogoProps) {
  const accentColor =
    variant === 'cyan'
      ? '#42DFFF'
      : variant === 'purple'
      ? '#A879FF'
      : '#B5FF55'; // default lime

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Vector Stylized Q + Lightning Bolt */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform hover:scale-105"
      >
        <defs>
          <linearGradient id={`q_bg_grad_${variant}`} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#171A21" />
            <stop offset="100%" stopColor="#090A0D" />
          </linearGradient>
          <linearGradient id={`q_bolt_grad_${variant}`} x1="12" y1="10" x2="40" y2="42" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={accentColor} />
            <stop offset="100%" stopColor="#42DFFF" />
          </linearGradient>
          <filter id={`q_glow_${variant}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor={accentColor} floodOpacity="0.6" />
          </filter>
        </defs>

        {/* Squircle Housing with Neon Edge */}
        <rect
          x="1.5"
          y="1.5"
          width="45"
          height="45"
          rx="12"
          fill={`url(#q_bg_grad_${variant})`}
          stroke="#303642"
          strokeWidth="2"
        />

        {/* Stylized Geometric Q Loop */}
        <path
          d="M24 10C16.82 10 11 15.82 11 23C11 30.18 16.82 36 24 36C26.9 36 29.58 35.05 31.75 33.45L27.5 29.2C26.45 29.7 25.26 30 24 30C20.13 30 17 26.87 17 23C17 19.13 20.13 16 24 16C27.87 16 31 19.13 31 23C31 24.26 30.7 25.45 30.2 26.5L34.45 30.75C36.05 28.58 37 25.9 37 23C37 15.82 31.18 10 24 10Z"
          fill={accentColor}
          fillOpacity="0.25"
        />

        {/* High-Voltage Lightning Bolt Strike cutting through and creating the Q tail */}
        <path
          d="M28 6L14 26H25L20 42L36 21H24L28 6Z"
          fill={`url(#q_bolt_grad_${variant})`}
          filter={`url(#q_glow_${variant})`}
        />
      </svg>

      {withText && (
        <div className="flex items-baseline gap-1.5">
          <span className={`font-display font-black tracking-wider text-white text-lg ${textClassName}`}>
            QUESTLY
          </span>
          <span className="text-[9px] font-mono font-bold text-[#B5FF55] px-1.5 py-0.2 rounded bg-[#B5FF55]/10 border border-[#B5FF55]/30">
            NEON
          </span>
        </div>
      )}
    </div>
  );
}

