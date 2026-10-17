import React from 'react';
import {AbsoluteFill} from 'remotion';
import {colors, fonts, SAFE} from '../theme';
import {useEnter} from './anim';

/** Dòng nguồn / nhãn minh họa — bắt buộc khi có số liệu (quy tắc biên tập của kênh). */
export const SourceLine: React.FC<{source?: string | null; illustrative?: boolean; dark?: boolean}> = ({
  source,
  illustrative,
  dark,
}) => {
  const o = useEnter(10);
  if (!source && !illustrative) return null;
  const txt = [illustrative ? 'Minh họa' : null, source ? `Nguồn: ${source}` : null].filter(Boolean).join(' · ');
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          right: SAFE.left,
          top: SAFE.top - 40,
          fontFamily: fonts.sans,
          fontWeight: 500,
          fontSize: 26,
          color: dark ? 'rgba(242,234,219,0.75)' : colors.inkSoft,
          opacity: o,
          textAlign: 'right',
        }}
      >
        {txt}
      </div>
    </AbsoluteFill>
  );
};
