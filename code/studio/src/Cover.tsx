import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {CoverProps} from './types';
import {Paper} from './ui/Paper';
import {Logo} from './ui/Logo';
import {RichText} from './ui/RichText';
import {colors, fonts} from './theme';

/**
 * Ảnh bìa 9:16 cho Shorts/TikTok. Mọi chữ quan trọng nằm trong dải y 300–1600
 * vì lưới hồ sơ TikTok cắt ảnh bìa về 3:4 ở giữa.
 */
export const Cover: React.FC<CoverProps> = ({kicker, text, sub, emoji, image, episodeNo}) => (
  <AbsoluteFill>
    <Paper />
    {image ? (
      <Img
        src={/^https?:/.test(image) ? image : staticFile(image)}
        style={{position: 'absolute', right: -40, top: 980, width: 760, transform: 'rotate(4deg)', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.3))'}}
      />
    ) : null}
    <div style={{position: 'absolute', left: 80, right: 80, top: 330}}>
      {episodeNo ? (
        <div style={{fontFamily: fonts.condensed, fontWeight: 700, fontSize: 48, color: colors.coral, letterSpacing: 3, marginBottom: 16}}>
          #{episodeNo}
        </div>
      ) : null}
      {kicker ? (
        <div
          style={{
            display: 'inline-block',
            fontFamily: fonts.condensed,
            fontWeight: 700,
            fontSize: 44,
            letterSpacing: 4,
            color: colors.paper,
            background: colors.navy,
            padding: '8px 20px',
            marginBottom: 34,
            textTransform: 'uppercase',
          }}
        >
          {kicker}
        </div>
      ) : null}
      <div style={{fontFamily: fonts.serif, fontWeight: 900, fontSize: 132, lineHeight: 1.08, color: colors.ink}}>
        <RichText text={text} delay={-100} />
      </div>
      {sub ? (
        <div style={{marginTop: 36, fontFamily: fonts.sans, fontWeight: 700, fontSize: 52, color: colors.inkSoft}}>
          <RichText text={sub} delay={-100} />
        </div>
      ) : null}
      {emoji && !image ? <div style={{fontSize: 260, marginTop: 40}}>{emoji}</div> : null}
    </div>
    <div style={{position: 'absolute', left: 80, top: 1480}}>
      <Logo size={88} />
    </div>
  </AbsoluteFill>
);

/** Ảnh đại diện kênh / file logo xuất PNG. */
export const BrandMark: React.FC<{variant: 'mark' | 'full'; dark?: boolean; bg?: boolean}> = ({variant, dark, bg}) => (
  <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', backgroundColor: bg ? (dark ? colors.navy : colors.paper) : 'transparent'}}>
    <Logo size={variant === 'mark' ? 800 : 220} variant={variant} dark={dark} />
  </AbsoluteFill>
);
