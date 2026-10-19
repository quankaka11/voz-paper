import React, {useContext} from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {colors, fonts, SAFE} from '../theme';
import {DarkContext, RichText} from './RichText';
import {Label} from './collage';
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

/** Nhãn nhỏ phía trên tiêu đề — mảnh giấy xé (đen trên nền sáng, vàng trên nền tối). */
export const Kicker: React.FC<{text?: string; dark?: boolean; delay?: number}> = ({text, dark, delay = 0}) => {
  const ctxDark = useContext(DarkContext);
  const p = useEnter(delay, 14);
  if (!text) return null;
  const d = dark ?? ctxDark;
  return (
    <div style={{alignSelf: 'flex-start', marginBottom: 26, opacity: Math.min(1, p * 2), transform: `rotate(-1.5deg) scale(${1.2 - 0.2 * p})`, transformOrigin: 'left center'}}>
      <Label text={text} color={d ? 'yellow' : 'black'} font="condensed" size={36} upper seed={`k-${text}`} />
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
  const ctxDark = useContext(DarkContext);
  const p = useEnter(delay);
  const d = dark ?? ctxDark;
  return (
    <div
      style={{
        fontFamily: fonts.serif,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1.2,
        color: d ? colors.paper : colors.ink,
        textAlign: align,
        textShadow: d ? '0 4px 16px rgba(0,0,0,0.5)' : undefined,
        opacity: p,
        transform: `translateY(${(1 - p) * 30}px)`,
      }}
    >
      <RichText text={text} delay={delay + 10} numFont={fonts.condensed} />
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
