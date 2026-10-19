import React from 'react';
import {AbsoluteFill} from 'remotion';
import {fonts, SAFE} from '../theme';
import {useEnter} from './anim';

/** Dòng nguồn / nhãn minh họa — bắt buộc khi có số liệu (quy tắc biên tập của kênh). Kiểu nhãn đánh máy dán góc. */
export const SourceLine: React.FC<{source?: string | null; illustrative?: boolean; dark?: boolean}> = ({source, illustrative}) => {
  const o = useEnter(10);
  if (!source && !illustrative) return null;
  const txt = [illustrative ? 'MINH HỌA' : null, source ? `Nguồn: ${source}` : null].filter(Boolean).join(' · ');
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', right: 1080 - SAFE.right + 10, top: SAFE.top - 52, maxWidth: 640, opacity: o, display: 'flex', justifyContent: 'flex-end'}}>
        <div
          style={{
            fontFamily: fonts.mono,
            fontWeight: 400,
            fontSize: 22,
            lineHeight: 1.3,
            color: '#2A2A2A',
            background: 'rgba(240,235,222,0.92)',
            padding: '5px 12px',
            transform: 'rotate(-0.8deg)',
            boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
          }}
        >
          {txt}
        </div>
      </div>
    </AbsoluteFill>
  );
};
