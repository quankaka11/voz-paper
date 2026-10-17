import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {colors, fonts, SAFE} from '../theme';
import {RichText} from './RichText';
import {useEnter} from './anim';

/** Vùng nội dung chính: nằm trên phụ đề, tránh cột nút bên phải. */
export const CONTENT = {left: SAFE.left, width: SAFE.right - SAFE.left, top: SAFE.top + 40, bottom: SAFE.bottom - 200};

export const Stage: React.FC<{children: React.ReactNode; align?: 'center' | 'top'; style?: React.CSSProperties}> = ({
  children,
  align = 'center',
  style,
}) => (
  <AbsoluteFill>
    <div
      style={{
        position: 'absolute',
        left: CONTENT.left,
        width: CONTENT.width,
        top: CONTENT.top,
        height: CONTENT.bottom - CONTENT.top,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: align === 'center' ? 'center' : 'flex-start',
        ...style,
      }}
    >
      {children}
    </div>
  </AbsoluteFill>
);

export const Kicker: React.FC<{text?: string; dark?: boolean; delay?: number}> = ({text, dark, delay = 0}) => {
  const p = useEnter(delay);
  if (!text) return null;
  return (
    <div
      style={{
        alignSelf: 'flex-start',
        fontFamily: fonts.condensed,
        fontWeight: 700,
        fontSize: 34,
        letterSpacing: 4,
        textTransform: 'uppercase',
        color: dark ? colors.navy : colors.paper,
        background: dark ? colors.yellow : colors.navy,
        padding: '6px 16px',
        marginBottom: 28,
        opacity: p,
        transform: `translateX(${(1 - p) * -40}px)`,
      }}
    >
      {text}
    </div>
  );
};

export const Heading: React.FC<{text: string; size?: number; delay?: number; dark?: boolean; align?: 'left' | 'center'}> = ({
  text,
  size = 84,
  delay = 0,
  dark,
  align = 'left',
}) => {
  const p = useEnter(delay);
  return (
    <div
      style={{
        fontFamily: fonts.serif,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1.12,
        color: dark ? colors.paper : colors.ink,
        textAlign: align,
        opacity: p,
        transform: `translateY(${(1 - p) * 30}px)`,
      }}
    >
      <RichText text={text} delay={delay + 10} />
    </div>
  );
};

/** Frame xuất hiện của phần tử thứ i: ưu tiên atMs (khớp lời đọc), nếu không thì chia đều. */
export const useRevealFrame = (durationInFrames: number) => {
  const {fps} = useVideoConfig();
  return (item: {atMs?: number} | undefined, i: number, n: number, from = 8, spread = 0.6) => {
    if (item && typeof item.atMs === 'number') return Math.round((item.atMs / 1000) * fps);
    const to = Math.max(from, durationInFrames * spread);
    return n <= 1 ? from : from + ((to - from) * i) / (n - 1);
  };
};
