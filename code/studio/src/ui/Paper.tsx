import React from 'react';
import {AbsoluteFill, Img, useCurrentFrame} from 'remotion';
import {noise2D} from '@remotion/noise';
import {resolveTone} from '../theme';
import charcoal from '../assets/bg-charcoal.jpg';
import cream from '../assets/bg-cream.jpg';
import navy from '../assets/bg-navy.jpg';
import grid from '../assets/bg-grid.jpg';
import gridBlue from '../assets/bg-grid-blue.jpg';
import gridRed from '../assets/bg-grid-red.jpg';
import mapBg from '../assets/bg-map.jpg';
import g0 from '../assets/grain-0.png';
import g1 from '../assets/grain-1.png';
import g2 from '../assets/grain-2.png';
import g3 from '../assets/grain-3.png';

const BG: Record<string, string> = {charcoal, cream, navy, grid, 'grid-blue': gridBlue, 'grid-red': gridRed, map: mapBg};
const GRAIN = [g0, g1, g2, g3];

/**
 * Nền giấy dựng sẵn (code/voz/tools/make_paper.py). Nền nằm TRONG máy quay và rộng hơn khung 12% mỗi phía
 * để khi lia/zoom ra nhẹ không lộ mép.
 */
export const Paper: React.FC<{tone?: string | null}> = ({tone}) => (
  <AbsoluteFill>
    <Img src={BG[resolveTone(tone)]} style={{position: 'absolute', left: '-12%', top: '-12%', width: '124%', height: '124%'}} />
  </AbsoluteFill>
);

/** Hạt film + bụi + nhấp nháy sáng rất nhẹ, phủ lên mọi thứ (ảnh từ nhiều nguồn trông cùng một chất liệu). */
export const FilmGrain: React.FC<{strength?: number}> = ({strength = 1}) => {
  const frame = useCurrentFrame();
  const flicker = 0.025 + 0.025 * noise2D('flk', frame / 3, 0);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <Img src={GRAIN[Math.floor(frame / 2) % GRAIN.length]} style={{width: '100%', height: '100%', opacity: 0.9 * strength, imageRendering: 'auto'}} />
      <AbsoluteFill style={{background: '#000', opacity: Math.max(0, flicker) * strength}} />
    </AbsoluteFill>
  );
};
