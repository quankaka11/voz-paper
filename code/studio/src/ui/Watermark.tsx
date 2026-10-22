import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Logo} from './Logo';
import {useFormat} from './format';

/** Watermark góc trên-trái, mờ nhẹ; khung dọc: nằm ngoài vùng tab của TikTok/Shorts, khung ngang: sát vùng an toàn. */
export const Watermark: React.FC<{dark?: boolean}> = ({dark}) => {
  const {wide} = useFormat();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: wide ? 70 : 56, top: wide ? 46 : 64, opacity: 0.85}}>
        <Logo size={wide ? 52 : 60} dark={dark} />
      </div>
    </AbsoluteFill>
  );
};
