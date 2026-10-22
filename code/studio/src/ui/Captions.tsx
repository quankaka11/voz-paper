import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Caption} from '../types';
import {colors, fonts} from '../theme';
import {useFormat} from './format';

/**
 * Phụ đề theo cụm từ (timing do ZipVoice trả về), kiểu nhãn hộp đen của Vox: chữ trắng trên dải đen,
 * từ đang đọc chuyển vàng. Hộp đen đọc được trên mọi nền (ảnh, bản đồ, giấy kẻ ô).
 * Thời điểm từng từ nội suy theo số ký tự trong cụm.
 */
export const Captions: React.FC<{captions: Caption[]; dark?: boolean}> = ({captions}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fmt = useFormat();
  const ms = (frame / fps) * 1000;
  const idx = captions.findIndex((c, i) => {
    const next = captions[i + 1];
    // giữ cụm hiện tại trong khoảng lặng ngắn để chữ không nhấp nháy
    const end = next ? Math.min(next.startMs, c.endMs + 400) : c.endMs + 400;
    return ms >= c.startMs && ms < end;
  });
  if (idx < 0) return null;
  const cur = captions[idx];

  const words = cur.text.split(/\s+/).filter(Boolean);
  const total = words.reduce((a, w) => a + w.length + 1, 0);
  const span = cur.endMs - cur.startMs;
  let acc = 0;
  const timed = words.map((w) => {
    const s = cur.startMs + (span * acc) / total;
    acc += w.length + 1;
    return {w, s, e: cur.startMs + (span * acc) / total};
  });
  // cụm mới bật lên rất nhanh (3 frame) — cảm giác "cắt" theo nhịp lời
  const since = ms - cur.startMs;
  const pop = Math.min(1, Math.max(0, since / 100));

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: fmt.safe.left - 20,
          right: fmt.width - fmt.safe.right - 20,
          // khung ngang: dải chữ sát mép dưới vùng an toàn, không che hình giữa khung
          top: fmt.safe.bottom - (fmt.wide ? 96 : 150),
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            fontFamily: fonts.sans,
            fontWeight: 800,
            fontSize: fmt.wide ? 46 : 54,
            lineHeight: 1.42,
            textAlign: 'center',
            color: '#F7F4EC',
            transform: `scale(${0.94 + 0.06 * pop}) rotate(${idx % 2 ? 0.6 : -0.6}deg)`,
          }}
        >
          <span
            style={{
              background: 'rgba(14,14,14,0.92)',
              padding: '4px 20px 8px',
              WebkitBoxDecorationBreak: 'clone',
              boxDecorationBreak: 'clone',
              boxShadow: '0 8px 18px rgba(0,0,0,0.35)',
            }}
          >
            {timed.map(({w, s, e}, i) => {
              const active = ms >= s && ms < e + 60;
              return (
                <span key={i} style={{color: active ? colors.yellow : undefined}}>
                  {w}
                  {i < timed.length - 1 ? ' ' : ''}
                </span>
              );
            })}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
