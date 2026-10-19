import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CoverProps} from './types';
import {FilmGrain, Paper} from './ui/Paper';
import {Logo} from './ui/Logo';
import {RichText} from './ui/RichText';
import {EmojiSticker, Label, Sticker, Tag} from './ui/collage';
import {colors, fonts, resolveTone, TONES} from './theme';

/**
 * Ảnh bìa 9:16 cho Shorts/TikTok, cùng chất liệu cắt dán với video. Mọi chữ quan trọng nằm trong dải y 300–1600
 * vì lưới hồ sơ TikTok cắt ảnh bìa về 3:4 ở giữa.
 * props: kicker?, text | lines (chồng nhãn giấy), sub?, emoji?, image? (ảnh tách nền, trồi từ đáy), treat?, tone?
 */
export const Cover: React.FC<CoverProps> = ({kicker, text, lines, sub, emoji, image, episodeNo, tone, treat = 'bw'}) => {
  const t = resolveTone(tone);
  const dark = TONES[t].dark;
  return (
    <AbsoluteFill>
      <Paper tone={t} />
      {image ? (
        <div style={{position: 'absolute', left: 540, bottom: -40, transform: 'translateX(-50%) rotate(-2deg)'}}>
          <Sticker src={image} w={980} h={900} treat={treat} border={10} />
        </div>
      ) : null}
      <div style={{position: 'absolute', left: 80, right: 110, top: 320}}>
        {episodeNo ? (
          <div style={{marginBottom: 22, transform: 'rotate(-2deg)', display: 'inline-block'}}>
            <Tag text={`#${episodeNo}`} size={44} color="red" />
          </div>
        ) : null}
        {kicker ? (
          <div style={{marginBottom: 26, transform: 'rotate(-1.5deg)'}}>
            <Label text={kicker} color={dark ? 'yellow' : 'black'} font="condensed" size={46} upper seed="cover-k" />
          </div>
        ) : null}
        {Array.isArray(lines) && lines.length ? (
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8}}>
            {lines.map((ln, i) => {
              const line = typeof ln === 'string' ? {text: ln} : ln;
              return (
                <div key={i} style={{transform: `translateX(${i % 2 ? 50 : 0}px) rotate(${i % 2 ? 1.8 : -2.2}deg)`}}>
                  <Label text={line.text} color={line.color ?? ['kraft', 'cream', 'yellow'][i % 3]} size={112} seed={`cover-${i}`} />
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              fontFamily: fonts.serif,
              fontWeight: 900,
              fontSize: 128,
              lineHeight: 1.18,
              color: dark ? colors.paper : colors.ink,
              textShadow: dark ? '0 6px 20px rgba(0,0,0,0.5)' : undefined,
            }}
          >
            <RichText text={text} delay={-100} numFont={fonts.condensed} />
          </div>
        )}
        {sub ? (
          <div style={{marginTop: 36, fontFamily: fonts.sans, fontWeight: 700, fontSize: 52, color: dark ? '#DDD7CA' : colors.inkSoft}}>
            <RichText text={sub} delay={-100} />
          </div>
        ) : null}
        {emoji && !image ? (
          <div style={{marginTop: 50, transform: 'rotate(-8deg)', display: 'inline-block'}}>
            <EmojiSticker char={emoji} size={240} />
          </div>
        ) : null}
      </div>
      <div style={{position: 'absolute', left: 80, top: 150}}>
        <Logo size={80} dark={dark} />
      </div>
      <FilmGrain strength={0.8} />
    </AbsoluteFill>
  );
};

/** Ảnh đại diện kênh / file logo xuất PNG. */
export const BrandMark: React.FC<{variant: 'mark' | 'full'; dark?: boolean; bg?: boolean}> = ({variant, dark, bg}) => (
  <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', backgroundColor: bg ? (dark ? colors.navy : colors.paper) : 'transparent'}}>
    <Logo size={variant === 'mark' ? 800 : 220} variant={variant} dark={dark} />
  </AbsoluteFill>
);
