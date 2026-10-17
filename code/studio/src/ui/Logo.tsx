import React from 'react';
import {colors, fonts} from '../theme';

/**
 * Wordmark VOZ STORY: chữ "O" là chiếc kính lúp — "soi vào những hệ thống vô hình".
 * Vẽ bằng SVG để dùng chung cho video, watermark và ảnh đại diện kênh.
 */
export const Logo: React.FC<{size?: number; variant?: 'full' | 'mark'; dark?: boolean}> = ({
  size = 200,
  variant = 'full',
  dark = false,
}) => {
  const fg = dark ? colors.paper : colors.navy;
  if (variant === 'mark') {
    return (
      <svg width={size} height={size} viewBox="0 0 200 200">
        <rect width="200" height="200" rx="36" fill={colors.yellow} />
        <circle cx="92" cy="90" r="46" fill="none" stroke={colors.navy} strokeWidth="18" />
        <line x1="126" y1="124" x2="160" y2="158" stroke={colors.navy} strokeWidth="20" strokeLinecap="round" />
        <rect x="70" y="81" width="44" height="18" rx="4" fill={colors.coral} />
      </svg>
    );
  }
  return (
    <svg width={size * 2.9} height={size} viewBox="0 0 580 200">
      <rect x="0" y="0" width="310" height="200" rx="28" fill={colors.yellow} />
      <text x="18" y="166" fontFamily={fonts.condensed} fontWeight={700} fontSize="176" fill={colors.navy}>
        V
      </text>
      <circle cx="162" cy="100" r="42" fill="none" stroke={colors.navy} strokeWidth="18" />
      <line x1="193" y1="131" x2="212" y2="150" stroke={colors.navy} strokeWidth="18" strokeLinecap="round" />
      <rect x="143" y="91" width="38" height="18" rx="4" fill={colors.coral} />
      <text x="214" y="166" fontFamily={fonts.condensed} fontWeight={700} fontSize="176" fill={colors.navy}>
        Z
      </text>
      <text x="328" y="128" fontFamily={fonts.condensed} fontWeight={500} fontSize="76" letterSpacing="5" fill={fg}>
        STORY
      </text>
    </svg>
  );
};
