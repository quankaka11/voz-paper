import React, {useContext} from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {colors, fonts} from '../theme';
import {DarkContext, RichText} from './RichText';
import {Label} from './collage';
import {useEnter} from './anim';
import {useFormat} from './format';

/** Vùng nội dung chính của định dạng đang render: nằm trên phụ đề, trong vùng an toàn. */
export const useContent = () => useFormat().content;

export const Stage: React.FC<{children: React.ReactNode; align?: 'center' | 'top'; style?: React.CSSProperties}> = ({
  children,
  align = 'center',
  style,
}) => {
  const c = useContent();
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: c.left,
          width: c.width,
          top: c.top,
          height: c.bottom - c.top,
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
};

/**
 * Bố cục 2 cột cho khung ngang (long): chữ bên trái, hình bên phải. Ở khung dọc (short) xếp chồng như Stage.
 * `side` rộng `sideWidth` (mặc định 46% vùng nội dung) và căn giữa theo chiều dọc.
 */
export const Split: React.FC<{
  children: React.ReactNode;
  side: React.ReactNode;
  sideWidth?: number;
  align?: 'center' | 'top';
  reverse?: boolean;
  gap?: number;
}> = ({children, side, sideWidth, align = 'center', reverse = false, gap = 80}) => {
  const f = useFormat();
  if (!f.wide) {
    return (
      <Stage align={align}>
        {children}
        {side}
      </Stage>
    );
  }
  const c = f.content;
  const sw = sideWidth ?? Math.round(c.width * 0.46);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: c.left, width: c.width, top: c.top, height: c.bottom - c.top, display: 'flex', flexDirection: reverse ? 'row-reverse' : 'row', alignItems: 'center', gap}}>
        <div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: align === 'center' ? 'center' : 'flex-start', alignSelf: align === 'center' ? 'center' : 'stretch'}}>
          {children}
        </div>
        <div style={{width: sw, flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>{side}</div>
      </div>
    </AbsoluteFill>
  );
};

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
