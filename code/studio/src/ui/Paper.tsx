import React from 'react';
import {AbsoluteFill, Img, useCurrentFrame} from 'remotion';
import l0 from '../assets/bg-light-0.jpg';
import l1 from '../assets/bg-light-1.jpg';
import l2 from '../assets/bg-light-2.jpg';
import l3 from '../assets/bg-light-3.jpg';
import d0 from '../assets/bg-dark-0.jpg';
import d1 from '../assets/bg-dark-1.jpg';
import d2 from '../assets/bg-dark-2.jpg';
import d3 from '../assets/bg-dark-3.jpg';

const BG = {light: [l0, l1, l2, l3], dark: [d0, d1, d2, d3]};

/**
 * Nền giấy (thớ giấy + hạt film + vignette) dựng sẵn bằng code/voz/tools/make_paper.py.
 * Đổi ảnh mỗi 3 frame cho hạt "sống"; không blend lúc render nên nhanh.
 */
export const Paper: React.FC<{tone?: 'light' | 'dark'}> = ({tone = 'light'}) => {
  const frame = useCurrentFrame();
  const list = BG[tone];
  return (
    <AbsoluteFill>
      <Img src={list[Math.floor(frame / 3) % list.length]} style={{width: '100%', height: '100%'}} />
    </AbsoluteFill>
  );
};
