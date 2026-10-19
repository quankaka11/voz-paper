import React, {createContext, useContext} from 'react';
import {Audio, Sequence} from 'remotion';
import whoosh from '../assets/sfx/whoosh.wav';
import swish from '../assets/sfx/swish.wav';
import paper from '../assets/sfx/paper.wav';
import tape from '../assets/sfx/tape.wav';
import pop from '../assets/sfx/pop.wav';
import click from '../assets/sfx/click.wav';
import type from '../assets/sfx/type.wav';
import thud from '../assets/sfx/thud.wav';
import stamp from '../assets/sfx/stamp.wav';
import marker from '../assets/sfx/marker.wav';
import ding from '../assets/sfx/ding.wav';
import riser from '../assets/sfx/riser.wav';

/** Bộ SFX tự tổng hợp (code/voz/tools/make_sfx.py). Mức gốc từng tiếng đã cân để đặt cạnh giọng đọc. */
export const SFX: Record<string, {src: string; vol: number; frames: number}> = {
  whoosh: {src: whoosh, vol: 0.5, frames: 16},
  swish: {src: swish, vol: 0.35, frames: 8},
  paper: {src: paper, vol: 0.4, frames: 9},
  tape: {src: tape, vol: 0.45, frames: 12},
  pop: {src: pop, vol: 0.4, frames: 5},
  click: {src: click, vol: 0.35, frames: 2},
  type: {src: type, vol: 0.25, frames: 2},
  thud: {src: thud, vol: 0.4, frames: 10},
  stamp: {src: stamp, vol: 0.35, frames: 7},
  marker: {src: marker, vol: 0.4, frames: 12},
  ding: {src: ding, vol: 0.3, frames: 30},
  riser: {src: riser, vol: 0.35, frames: 36},
};

/** Bật/tắt và mức chung của SFX cho cả tập (episode.json > sfx, sfx_volume). */
export const SfxContext = createContext({enabled: true, volume: 1});

/** Phát một SFX tại frame `at` (tính trong cảnh hiện tại). */
export const Sfx: React.FC<{name?: string | false | null; at: number; volume?: number}> = ({name, at, volume = 1}) => {
  const ctx = useContext(SfxContext);
  if (!ctx.enabled || !name || !SFX[name]) return null;
  const s = SFX[name];
  return (
    <Sequence from={Math.max(0, Math.round(at))} durationInFrames={s.frames + 4} layout="none" name={`sfx:${name}`}>
      <Audio src={s.src} volume={s.vol * volume * ctx.volume} />
    </Sequence>
  );
};
