import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {fonts} from '../theme';
import {onTwos} from './anim';
import {Tag} from './collage';
import {layerFrame} from './Layers';
import {Sfx} from './Sfx';
import {useFormat} from './format';

export type Lower = {text: string; role?: string; color?: string; atMs?: number; at?: number; outAtMs?: number; out?: number};

/**
 * Lower third — tên người/tổ chức (nhãn đen) + chức danh/nguồn (dòng đánh máy), góc dưới-trái, trên dải phụ đề.
 * Nằm NGOÀI máy quay (như dòng nguồn) nên không trôi khi máy lia/zoom. Khai báo ở props.lower của bất kỳ cảnh nào:
 * {text, role?, color?, cue?, outCue?} hoặc danh sách nhiều người (mỗi người một cue, người sau thay người trước).
 */
export const LowerThird: React.FC<{lower: Lower | Lower[]; dur: number}> = ({lower, dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fmt = useFormat();
  const list = Array.isArray(lower) ? lower : [lower];
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {list.map((l, i) => {
        const at = layerFrame(l, fps, 8);
        const next = list[i + 1] ? layerFrame(list[i + 1], fps, dur) : Infinity;
        const out = Math.min(next, typeof l.outAtMs === 'number' || typeof l.out === 'number' ? layerFrame({atMs: l.outAtMs, at: l.out}, fps, dur) : Infinity);
        if (frame < at || frame >= out + 8) return null;
        const sp = spring({frame: onTwos(frame - at), fps, config: {damping: 14, stiffness: 160, mass: 0.6}});
        const gone = frame >= out ? (frame - out) / 8 : 0;
        const size = fmt.wide ? 44 : 46;
        return (
          <React.Fragment key={i}>
            <Sfx name="paper" at={at} />
            <div
              style={{
                position: 'absolute',
                left: fmt.safe.left,
                bottom: fmt.height - fmt.safe.bottom + (fmt.wide ? 110 : 250),
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 6,
                opacity: 1 - gone,
                transform: `translateX(${interpolate(sp, [0, 1], [-700, 0])}px) rotate(${interpolate(sp, [0, 1], [-6, -1])}deg)`,
              }}
            >
              <Tag text={l.text} size={size} color={l.color ?? 'black'} upper={false} />
              {l.role ? (
                <div style={{background: 'rgba(240,235,222,0.94)', fontFamily: fonts.mono, fontWeight: 700, fontSize: size * 0.56, color: '#2A2A2A', padding: '4px 14px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)'}}>
                  {l.role}
                </div>
              ) : null}
            </div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
