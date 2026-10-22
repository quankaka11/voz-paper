import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CoverProps} from './types';
import {FilmGrain, Paper} from './ui/Paper';
import {Logo} from './ui/Logo';
import {RichText} from './ui/RichText';
import {EmojiSticker, HandArrow, Label, Scribble, Stamp, Sticker, Tag} from './ui/collage';
import {colors, fonts, resolveTone, TONES} from './theme';
import {useFormat} from './ui/format';
import {tornClip, PAPERS} from './ui/collage';

/** Tiêu đề siêu lớn 1–3 chữ (Anton, vàng viền mực) — `**chữ**` tô đỏ. Tự co theo độ dài để luôn ≤ 2 dòng.
 * Tránh số 0 đứng riêng: số 0 của Anton hẹp, dễ đọc thành chữ O. */
const Headline: React.FC<{text: string; size?: number; width?: number; max?: number}> = ({text, size, width = 920, max = 230}) => {
  const longest = Math.max(...text.replace(/\*\*/g, '').split(/\s+/).map((w) => Array.from(w).length), 1);
  const fs = size ?? Math.min(max, Math.round(width / (longest * 0.5)));
  const parts = text.split('**');
  return (
    <div
      style={{
        fontFamily: fonts.heavy,
        fontSize: fs,
        lineHeight: 0.98,
        textTransform: 'uppercase',
        color: colors.yellow,
        WebkitTextStroke: `${Math.round(fs * 0.035)}px #141414`,
        paintOrder: 'stroke fill',
        textShadow: `0 ${Math.round(fs * 0.05)}px 0 #141414, 0 ${Math.round(fs * 0.09)}px ${Math.round(fs * 0.12)}px rgba(0,0,0,0.55)`,
        transform: 'rotate(-3deg)',
        transformOrigin: 'left center',
      }}
    >
      {parts.map((p, i) => (
        <span key={i} style={i % 2 ? {color: colors.red} : undefined}>
          {p}
        </span>
      ))}
    </div>
  );
};

/**
 * Ảnh bìa 9:16 (thumbnail) cho Shorts/TikTok, cùng chất liệu cắt dán với video. Mọi chữ quan trọng nằm trong dải y 300–1600
 * vì lưới hồ sơ TikTok cắt ảnh bìa về 3:4 ở giữa.
 * Công thức cuốn hút: `headline` 1–3 chữ siêu lớn + `lines` 1–2 nhãn nêu mâu thuẫn + vật thể thật tràn đáy
 * + một điểm đỏ (`stamp` / `arrow` / `circle`).
 * props: kicker?, headline?, text | lines, sub?, emoji?, image?, treat?, imageW?, stamp?, arrow?, circle?, tone?
 */
export const Cover: React.FC<CoverProps> = (props) => {
  const {wide} = useFormat();
  return wide ? <CoverWide {...props} /> : <CoverTall {...props} />;
};

const CoverTall: React.FC<CoverProps> = ({
  kicker,
  headline,
  text,
  lines,
  sub,
  emoji,
  image,
  episodeNo,
  tone,
  treat = 'bw',
  imageW = 1000,
  stamp,
  arrow,
  circle,
}) => {
  const t = resolveTone(tone);
  const dark = TONES[t].dark;
  const arr = arrow === true ? {from: [930, 880], to: [760, 1180], bend: -0.3} : arrow || null;
  return (
    <AbsoluteFill>
      <Paper tone={t} />
      {image ? (
        <div style={{position: 'absolute', left: 540, bottom: -60, transform: 'translateX(-50%) rotate(-2deg)'}}>
          <Sticker src={image} w={imageW} h={980} treat={treat} border={10} />
        </div>
      ) : null}
      {/* lớp mực đỏ: vòng khoanh + mũi tên chỉ vào vật thể */}
      {circle || arr ? (
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          {circle ? <Scribble cx={circle.x} cy={circle.y} rx={circle.rx ?? 260} ry={circle.ry ?? 200} p={1} width={14} seed="cover" /> : null}
          {arr ? <HandArrow from={arr.from as [number, number]} to={arr.to as [number, number]} bend={arr.bend ?? -0.3} p={1} color={colors.red} width={16} /> : null}
        </svg>
      ) : null}
      {stamp ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 1290, display: 'flex', justifyContent: 'center'}}>
          <div style={{transform: 'rotate(-9deg)', background: 'rgba(242,234,219,0.94)', padding: '18px 26px', boxShadow: '0 14px 24px rgba(0,0,0,0.45)'}}>
            <Stamp text={stamp} size={88} />
          </div>
        </div>
      ) : null}
      <div style={{position: 'absolute', left: 80, right: 110, top: 310}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, marginBottom: 26}}>
          {episodeNo ? (
            <div style={{transform: 'rotate(-2deg)'}}>
              <Tag text={`#${episodeNo}`} size={44} color="red" />
            </div>
          ) : null}
          {kicker ? (
            <div style={{transform: 'rotate(-1.5deg)'}}>
              <Label text={kicker} color={dark ? 'yellow' : 'black'} font="condensed" size={46} upper seed="cover-k" />
            </div>
          ) : null}
        </div>
        {headline ? (
          <div style={{marginBottom: 18}}>
            <Headline text={headline} />
          </div>
        ) : null}
        {Array.isArray(lines) && lines.length ? (
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8}}>
            {lines.map((ln, i) => {
              const line = typeof ln === 'string' ? {text: ln} : ln;
              return (
                <div key={i} style={{transform: `translateX(${i % 2 ? 50 : 0}px) rotate(${i % 2 ? 1.8 : -2.2}deg)`}}>
                  <Label text={line.text} color={line.color ?? (headline ? ['cream', 'yellow'] : ['kraft', 'cream', 'yellow'])[i % (headline ? 2 : 3)]} size={headline ? 96 : 112} seed={`cover-${i}`} />
                </div>
              );
            })}
          </div>
        ) : !headline && text ? (
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
        ) : null}
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

/**
 * Ảnh bìa 16:9 (thumbnail YouTube 1280×720) cho video dài — poster cắt dán kiểu "ONE STEEL BOX": tiêu đề siêu lớn
 * cột trái, mảng giấy màu xé chéo bên phải, vật thể thật tách nền đứng trên mảng màu.
 * Góc dưới-phải bị YouTube che bởi thời lượng → không đặt chữ ở đó. Toạ độ circle/arrow theo khung 1280×720.
 * props như bản dọc + panel? ('red' | 'yellow' | 'navy' | 'teal' | false — mảng giấy màu, mặc định red)
 */
const CoverWide: React.FC<CoverProps> = ({
  kicker,
  headline,
  text,
  lines,
  sub,
  emoji,
  image,
  episodeNo,
  tone,
  treat = 'bw',
  imageW = 620,
  stamp,
  arrow,
  circle,
  panel = 'red',
}) => {
  const t = resolveTone(tone);
  const dark = TONES[t].dark;
  const arr = arrow === true ? {from: [660, 250], to: [800, 390], bend: -0.3} : arrow || null;
  const panelBg = panel ? (PAPERS[panel]?.bg ?? panel) : null;
  return (
    <AbsoluteFill>
      <Paper tone={t} />
      {panelBg ? (
        <div style={{position: 'absolute', left: 760, top: -40, width: 640, height: 820, transform: 'rotate(7deg)', filter: 'drop-shadow(-10px 0 18px rgba(0,0,0,0.45))'}}>
          <div style={{width: '100%', height: '100%', background: panelBg, clipPath: tornClip('cover-panel', 26, 0.2)}} />
        </div>
      ) : null}
      {image ? (
        <div style={{position: 'absolute', left: 940, bottom: -30, transform: 'translateX(-50%) rotate(-2deg)'}}>
          <Sticker src={image} w={imageW} h={640} treat={treat} border={8} />
        </div>
      ) : emoji ? (
        <div style={{position: 'absolute', left: 940, top: 360, transform: 'translate(-50%, -50%) rotate(-8deg)'}}>
          <EmojiSticker char={emoji} size={280} />
        </div>
      ) : null}
      {circle || arr ? (
        <svg width={1280} height={720} style={{position: 'absolute', inset: 0}}>
          {circle ? <Scribble cx={circle.x} cy={circle.y} rx={circle.rx ?? 170} ry={circle.ry ?? 130} p={1} width={11} seed="cover" /> : null}
          {arr ? <HandArrow from={arr.from as [number, number]} to={arr.to as [number, number]} bend={arr.bend ?? -0.3} p={1} color={colors.red} width={12} /> : null}
        </svg>
      ) : null}
      {stamp ? (
        <div style={{position: 'absolute', left: 820, top: 470, transform: 'rotate(-9deg)', background: 'rgba(242,234,219,0.94)', padding: '12px 18px', boxShadow: '0 10px 20px rgba(0,0,0,0.45)'}}>
          <Stamp text={stamp} size={64} />
        </div>
      ) : null}
      <div style={{position: 'absolute', left: 54, width: 720, top: 46}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18}}>
          {episodeNo ? (
            <div style={{transform: 'rotate(-2deg)'}}>
              <Tag text={`#${episodeNo}`} size={32} color="red" />
            </div>
          ) : null}
          {kicker ? (
            <div style={{transform: 'rotate(-1.5deg)'}}>
              <Label text={kicker} color={dark ? 'yellow' : 'black'} font="condensed" size={34} upper seed="cover-k" />
            </div>
          ) : null}
        </div>
        {headline ? (
          <div style={{marginBottom: 14}}>
            <Headline text={headline} width={700} max={190} />
          </div>
        ) : null}
        {Array.isArray(lines) && lines.length ? (
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6}}>
            {lines.map((ln, i) => {
              const line = typeof ln === 'string' ? {text: ln} : ln;
              return (
                <div key={i} style={{transform: `translateX(${i % 2 ? 36 : 0}px) rotate(${i % 2 ? 1.8 : -2.2}deg)`}}>
                  <Label text={line.text} color={line.color ?? (headline ? ['cream', 'yellow'] : ['kraft', 'cream', 'yellow'])[i % (headline ? 2 : 3)]} size={headline ? 58 : 72} maxWidth={660} seed={`cover-${i}`} />
                </div>
              );
            })}
          </div>
        ) : !headline && text ? (
          <div style={{fontFamily: fonts.serif, fontWeight: 900, fontSize: 84, lineHeight: 1.15, color: dark ? colors.paper : colors.ink, textShadow: dark ? '0 6px 20px rgba(0,0,0,0.5)' : undefined}}>
            <RichText text={text} delay={-100} numFont={fonts.condensed} />
          </div>
        ) : null}
        {sub ? (
          <div style={{marginTop: 22, fontFamily: fonts.sans, fontWeight: 700, fontSize: 36, color: dark ? '#DDD7CA' : colors.inkSoft}}>
            <RichText text={sub} delay={-100} />
          </div>
        ) : null}
      </div>
      <div style={{position: 'absolute', left: 54, bottom: 40}}>
        <Logo size={60} dark={dark} />
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
