import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Caption} from '../types';
import {colors, fonts, SAFE} from '../theme';

/**
 * Phụ đề theo cụm từ (timing do ZipVoice trả về). Từ đang đọc được tô dạ quang;
 * thời điểm từng từ nội suy theo số ký tự trong cụm.
 */
export const Captions: React.FC<{captions: Caption[]; dark?: boolean}> = ({captions, dark}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ms = (frame / fps) * 1000;
  const cur = captions.find((c, i) => {
    const next = captions[i + 1];
    // giữ cụm hiện tại trong khoảng lặng ngắn để chữ không nhấp nháy
    const end = next ? Math.min(next.startMs, c.endMs + 400) : c.endMs + 400;
    return ms >= c.startMs && ms < end;
  });
  if (!cur) return null;

  const words = cur.text.split(/\s+/).filter(Boolean);
  const total = words.reduce((a, w) => a + w.length + 1, 0);
  const span = cur.endMs - cur.startMs;
  let acc = 0;
  const timed = words.map((w) => {
    const s = cur.startMs + (span * acc) / total;
    acc += w.length + 1;
    return {w, s, e: cur.startMs + (span * acc) / total};
  });

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          right: 1080 - SAFE.right,
          top: SAFE.bottom - 160,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            fontFamily: fonts.sans,
            fontWeight: 800,
            fontSize: 60,
            lineHeight: 1.25,
            textAlign: 'center',
            color: dark ? colors.paper : colors.ink,
            background: dark ? 'rgba(20,33,61,0.0)' : 'rgba(242,234,219,0.0)',
            textShadow: dark ? '0 3px 12px rgba(0,0,0,0.6)' : '0 2px 0 rgba(242,234,219,0.9)',
          }}
        >
          {timed.map(({w, s, e}, i) => {
            const active = ms >= s && ms < e + 60;
            return (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  margin: '0 7px',
                  padding: '0 6px',
                  borderRadius: 8,
                  background: active ? colors.yellow : 'transparent',
                  color: active ? colors.ink : undefined,
                  textShadow: active ? 'none' : undefined,
                  transform: active ? 'scale(1.06)' : 'scale(1)',
                }}
              >
                {w}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
