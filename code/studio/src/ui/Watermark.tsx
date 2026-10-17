import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Logo} from './Logo';

/** Watermark góc trên-trái, mờ nhẹ; nằm ngoài vùng tab của TikTok/Shorts. */
export const Watermark: React.FC<{dark?: boolean}> = ({dark}) => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <div style={{position: 'absolute', left: 56, top: 64, opacity: 0.85}}>
      <Logo size={60} dark={dark} />
    </div>
  </AbsoluteFill>
);
