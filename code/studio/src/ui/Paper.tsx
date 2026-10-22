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
import charcoalW from '../assets/bg-charcoal-wide.jpg';
import creamW from '../assets/bg-cream-wide.jpg';
import navyW from '../assets/bg-navy-wide.jpg';
import gridW from '../assets/bg-grid-wide.jpg';
import gridBlueW from '../assets/bg-grid-blue-wide.jpg';
import gridRedW from '../assets/bg-grid-red-wide.jpg';
import mapBgW from '../assets/bg-map-wide.jpg';
import g0W from '../assets/grain-0-wide.png';
import g1W from '../assets/grain-1-wide.png';
import g2W from '../assets/grain-2-wide.png';
import g3W from '../assets/grain-3-wide.png';
import {useFormat} from './format';

// Mỗi định dạng một bộ nền riêng (make_paper.py) để thớ giấy, ô lưới, hạt film không bị kéo méo.
const BG: Record<string, string> = {charcoal, cream, navy, grid, 'grid-blue': gridBlue, 'grid-red': gridRed, map: mapBg};
const BG_WIDE: Record<string, string> = {charcoal: charcoalW, cream: creamW, navy: navyW, grid: gridW, 'grid-blue': gridBlueW, 'grid-red': gridRedW, map: mapBgW};
const GRAIN = [g0, g1, g2, g3];
const GRAIN_WIDE = [g0W, g1W, g2W, g3W];

/**
 * Nền giấy dựng sẵn (code/voz/tools/make_paper.py). Nền nằm TRONG máy quay và rộng hơn khung 12% mỗi phía
 * để khi lia/zoom ra nhẹ không lộ mép.
 */
export const Paper: React.FC<{tone?: string | null}> = ({tone}) => {
  const {wide} = useFormat();
  return (
    <AbsoluteFill>
      <Img src={(wide ? BG_WIDE : BG)[resolveTone(tone)]} style={{position: 'absolute', left: '-12%', top: '-12%', width: '124%', height: '124%'}} />
    </AbsoluteFill>
  );
};

/** Hạt film + bụi + nhấp nháy sáng rất nhẹ, phủ lên mọi thứ (ảnh từ nhiều nguồn trông cùng một chất liệu). */
export const FilmGrain: React.FC<{strength?: number}> = ({strength = 1}) => {
  const frame = useCurrentFrame();
  const {wide} = useFormat();
  const grain = wide ? GRAIN_WIDE : GRAIN;
  const flicker = 0.025 + 0.025 * noise2D('flk', frame / 3, 0);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <Img src={grain[Math.floor(frame / 2) % grain.length]} style={{width: '100%', height: '100%', opacity: 0.9 * strength, imageRendering: 'auto'}} />
      <AbsoluteFill style={{background: '#000', opacity: Math.max(0, flicker) * strength}} />
    </AbsoluteFill>
  );
};
