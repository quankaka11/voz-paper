import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import type {TransitionPresentation, TransitionPresentationComponentProps} from '@remotion/transitions';
import {slide} from '@remotion/transitions/slide';
import {easeInOut} from './anim';

/**
 * Chuyển cảnh kiểu cắt dán. Tên dùng trong episode.json > scenes[].transition (chuyển VÀO cảnh đó):
 *  cut     — cắt thẳng (không chồng hình)
 *  sheet   — tờ giấy mới đặt chồng lên từ bên phải, xoay nhẹ rồi nằm yên
 *  push    — đẩy ngang cả bảng (lia máy) · push-up — đẩy dọc
 *  tear    — mép giấy xé quét từ dưới lên, lộ cảnh mới
 *  zoom    — lao vào chi tiết (phóng to xuyên qua)
 *  auto    — tự xoay vòng theo thứ tự cảnh (mặc định)
 */
export const TRANSITION_FRAMES = 9;
export const TRANSITION_SFX: Record<string, string> = {sheet: 'paper', push: 'whoosh', 'push-up': 'whoosh', tear: 'tape', zoom: 'swish'};
const AUTO = ['sheet', 'cut', 'push', 'tear', 'cut', 'push-up', 'sheet', 'zoom', 'cut'];

export const pickTransition = (name: string | undefined, index: number): string => {
  if (index === 0) return 'cut';
  if (name && name !== 'auto') return name;
  return AUTO[(index - 1) % AUTO.length];
};

type P = Record<string, unknown>;

const Sheet: React.FC<TransitionPresentationComponentProps<P>> = ({children, presentationDirection, presentationProgress}) => {
  const p = easeInOut(presentationProgress);
  if (presentationDirection === 'exiting') {
    return <AbsoluteFill style={{filter: `brightness(${1 - 0.35 * p})`}}>{children}</AbsoluteFill>;
  }
  return (
    <AbsoluteFill
      style={{
        transform: `translateX(${(1 - p) * 1150}px) rotate(${(1 - p) * 9}deg)`,
        transformOrigin: '0% 100%',
        boxShadow: '-30px 0 60px rgba(0,0,0,0.5)',
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const tearEdge = (y: number) => {
  const pts: string[] = [];
  const N = 22;
  for (let i = 0; i <= N; i++) {
    const j = (random(`tear-${i}`) - 0.5) * 70 + Math.sin(i * 1.3) * 18;
    pts.push(`${(i / N) * 100}% ${y + j}px`);
  }
  return `polygon(${pts.join(',')}, 100% 2100px, 0% 2100px)`;
};

const Tear: React.FC<TransitionPresentationComponentProps<P>> = ({children, presentationDirection, presentationProgress}) => {
  const p = easeInOut(presentationProgress);
  if (presentationDirection === 'exiting') return <AbsoluteFill>{children}</AbsoluteFill>;
  const y = 2000 - p * 2100;
  return (
    <AbsoluteFill style={{filter: p < 1 ? 'drop-shadow(0 -14px 18px rgba(0,0,0,0.55))' : undefined}}>
      <AbsoluteFill style={{clipPath: p < 1 ? tearEdge(y) : undefined}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

const Zoom: React.FC<TransitionPresentationComponentProps<P>> = ({children, presentationDirection, presentationProgress}) => {
  const p = easeInOut(presentationProgress);
  if (presentationDirection === 'exiting') {
    return <AbsoluteFill style={{transform: `scale(${1 + 0.6 * p})`, opacity: 1 - p}}>{children}</AbsoluteFill>;
  }
  return <AbsoluteFill style={{transform: `scale(${0.82 + 0.18 * p})`, opacity: Math.min(1, p * 1.6)}}>{children}</AbsoluteFill>;
};

const make = (c: React.FC<TransitionPresentationComponentProps<P>>): TransitionPresentation<P> => ({component: c, props: {}});

export const presentationFor = (name: string): TransitionPresentation<any> | null => {
  switch (name) {
    case 'sheet':
      return make(Sheet);
    case 'tear':
      return make(Tear);
    case 'zoom':
      return make(Zoom);
    case 'push':
      return slide({direction: 'from-right'});
    case 'push-up':
      return slide({direction: 'from-bottom'});
    default:
      return null;
  }
};
