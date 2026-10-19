import React from 'react';
import {Img, random, staticFile} from 'remotion';
import {evolvePath} from '@remotion/paths';
import {colors, fonts} from '../theme';
import {RichText} from './RichText';
import speckle from '../assets/speckle.png';

/**
 * Bộ chi tiết cắt dán (collage) của VOZ STORY: giấy xé, băng dính, ảnh sticker viền trắng, polaroid,
 * chữ cắt rời, số in typo, nhãn hộp đen, mũi tên vẽ tay, dây nối, con dấu.
 * Mọi thành phần là "tĩnh" theo tham số; chuyển động do ui/Layers.tsx điều khiển bằng useCurrentFrame().
 */

export const imgSrc = (s: string) => (/^(https?:|data:)/.test(s) ? s : staticFile(s));

/** Mặt nạ mực in mòn — dùng cho số lớn, con dấu, nhãn "worn". */
export const WORN: React.CSSProperties = {
  WebkitMaskImage: `url(${speckle})`,
  maskImage: `url(${speckle})`,
  WebkitMaskSize: '300px 300px',
  maskSize: '300px 300px',
};

/** clip-path mép giấy xé, tính bằng px nên đúng với mọi kích thước. `rough` = độ răng cưa hai đầu. */
export const tornClip = (seed: string, rough = 7, edge = 0.35) => {
  const j = (k: string) => random(`${seed}-${k}`) * rough;
  const pts: string[] = [];
  const hs = 16;
  const vs = 7;
  for (let i = 0; i <= hs; i++) pts.push(`${(i / hs) * 100}% ${(j('t' + i) * edge).toFixed(1)}px`);
  for (let i = 1; i < vs; i++) pts.push(`calc(100% - ${j('r' + i).toFixed(1)}px) ${(i / vs) * 100}%`);
  for (let i = hs; i >= 0; i--) pts.push(`${(i / hs) * 100}% calc(100% - ${(j('b' + i) * edge).toFixed(1)}px)`);
  for (let i = vs - 1; i >= 1; i--) pts.push(`${j('l' + i).toFixed(1)}px ${(i / vs) * 100}%`);
  return `polygon(${pts.join(',')})`;
};

const SHADOW = 'drop-shadow(0 7px 7px rgba(0,0,0,0.38))';
const LIGHT = 'linear-gradient(172deg, rgba(255,255,255,0.14), rgba(255,255,255,0) 45%, rgba(0,0,0,0.10))';

/** Bảng màu nhãn giấy (lấy từ ảnh tham khảo: kraft nâu, kem, vàng, đen, trắng, đỏ). */
export const PAPERS: Record<string, {bg: string; fg: string; accent: string}> = {
  cream: {bg: '#ECE4D2', fg: '#3B2A1E', accent: colors.red},
  yellow: {bg: '#F2D43D', fg: '#3B2A1E', accent: colors.red},
  kraft: {bg: '#4E3626', fg: '#F1E8D6', accent: colors.yellow},
  black: {bg: '#141414', fg: '#F4F1EA', accent: colors.yellow},
  white: {bg: '#F7F4EC', fg: colors.ink, accent: colors.red},
  red: {bg: colors.red, fg: '#FFF6EA', accent: colors.yellow},
  teal: {bg: colors.teal, fg: '#FFF6EA', accent: colors.yellow},
};

const FONT: Record<string, {family: string; weight: number}> = {
  serif: {family: fonts.serif, weight: 900},
  mono: {family: fonts.mono, weight: 700},
  condensed: {family: fonts.condensed, weight: 700},
  sans: {family: fonts.sans, weight: 800},
  heavy: {family: fonts.heavy, weight: 400},
  hand: {family: fonts.hand, weight: 400},
};

/** Mảnh giấy xé có bóng đổ. */
export const Torn: React.FC<{
  seed: string;
  bg: string;
  rough?: number;
  pad?: string;
  worn?: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({seed, bg, rough = 8, pad = '10px 26px', worn, style, children}) => (
  <div style={{filter: SHADOW, display: 'inline-block', ...style}}>
    <div style={{background: bg, backgroundImage: LIGHT, clipPath: tornClip(seed, rough), padding: pad, ...(worn ? WORN : null)}}>{children}</div>
  </div>
);

export type LabelProps = {
  text: string;
  color?: string;
  font?: string;
  size?: number;
  upper?: boolean;
  maxWidth?: number;
  align?: 'left' | 'center';
  worn?: boolean;
  seed?: string;
};

/** Nhãn giấy xé ("Leaning" / "Machu Picchu" / "of Peru"). */
export const Label: React.FC<LabelProps> = ({text, color = 'cream', font = 'serif', size = 64, upper, maxWidth, align = 'left', worn, seed = text}) => {
  const pal = PAPERS[color] ?? PAPERS.cream;
  const f = FONT[font] ?? FONT.serif;
  return (
    <Torn seed={seed} bg={pal.bg} rough={Math.max(5, size * 0.13)} pad={`${size * 0.12}px ${size * 0.38}px ${size * 0.16}px`} worn={worn}>
      <div
        style={{
          fontFamily: f.family,
          fontWeight: f.weight,
          fontSize: size,
          lineHeight: 1.22,
          color: pal.fg,
          textTransform: upper ? 'uppercase' : undefined,
          letterSpacing: font === 'condensed' || font === 'mono' ? size * 0.03 : 0,
          maxWidth,
          textAlign: align,
        }}
      >
        <RichText text={text} accent={pal.accent} />
      </div>
    </Torn>
  );
};

/** Nhãn hộp đen chữ trắng in hoa ("RECEP ERDOGAN", "TO LIFE"). */
export const Tag: React.FC<{text: string; size?: number; color?: string; upper?: boolean}> = ({text, size = 46, color = 'black', upper = true}) => {
  const pal = PAPERS[color] ?? PAPERS.black;
  return (
    <div
      style={{
        display: 'inline-block',
        background: pal.bg,
        color: pal.fg,
        fontFamily: fonts.condensed,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1.15,
        letterSpacing: size * 0.04,
        textTransform: upper ? 'uppercase' : undefined,
        padding: `${size * 0.14}px ${size * 0.36}px`,
        boxShadow: '0 6px 14px rgba(0,0,0,0.35)',
      }}
    >
      <RichText text={text} accent={pal.accent} />
    </div>
  );
};

/** Băng dính giấy mờ, hai đầu răng cưa. */
export const Tape: React.FC<{w?: number; h?: number; rot?: number; seed?: string; style?: React.CSSProperties}> = ({
  w = 220,
  h = 62,
  rot = -4,
  seed = 'tape',
  style,
}) => (
  <div
    style={{
      position: 'absolute',
      width: w,
      height: h,
      background: colors.tape,
      backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.25), rgba(0,0,0,0.04) 60%, rgba(255,255,255,0.15))',
      clipPath: tornClip(seed, 9, 0.12),
      transform: `rotate(${rot}deg)`,
      boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
      ...style,
    }}
  />
);

/** Bộ lọc xử lý ảnh: ảnh đen trắng để một chi tiết màu nổi bật (kiểu dãy nhà có một căn đỏ). */
export const TREAT: Record<string, string> = {
  color: 'saturate(1.05) contrast(1.05)',
  bw: 'grayscale(1) contrast(1.22) brightness(1.04)',
  sepia: 'grayscale(1) sepia(0.45) contrast(1.15)',
  faded: 'saturate(0.55) contrast(1.05) brightness(1.04)',
  dark: 'grayscale(1) contrast(1.3) brightness(0.62)',
};

/** Ảnh đã tách nền (PNG trong suốt) với viền trắng kiểu sticker. */
export const Sticker: React.FC<{src: string; w?: number; h?: number; border?: number; treat?: string; zoom?: number}> = ({
  src,
  w,
  h,
  border = 7,
  treat = 'color',
  zoom = 1,
}) => {
  const b = border;
  const outline = b
    ? `drop-shadow(${b}px 0 0 #fff) drop-shadow(-${b}px 0 0 #fff) drop-shadow(0 ${b}px 0 #fff) drop-shadow(0 -${b}px 0 #fff) `
    : '';
  return (
    <div style={{filter: `${outline}drop-shadow(0 18px 18px rgba(0,0,0,0.45))`}}>
      <Img
        src={imgSrc(src)}
        style={{width: w, height: h, objectFit: 'contain', display: 'block', filter: TREAT[treat] ?? treat, transform: `scale(${zoom})`}}
      />
    </div>
  );
};

/** Ảnh in / polaroid có viền giấy, chú thích serif và băng dính. */
export const Photo: React.FC<{
  src: string;
  w?: number;
  h?: number;
  frame?: 'polaroid' | 'print' | 'none';
  caption?: string;
  treat?: string;
  tape?: boolean;
  zoom?: number;
  pan?: number;
  seed?: string;
}> = ({src, w = 640, h = 520, frame = 'polaroid', caption, treat = 'color', tape = true, zoom = 1, pan = 0, seed = src}) => {
  const pad = frame === 'none' ? 0 : frame === 'print' ? 14 : 20;
  const bottom = frame === 'polaroid' ? (caption ? 92 : 64) : pad;
  return (
    <div style={{position: 'relative', filter: 'drop-shadow(0 18px 22px rgba(0,0,0,0.45))'}}>
      <div style={{background: '#F3F0E8', backgroundImage: LIGHT, padding: `${pad}px ${pad}px ${bottom}px`}}>
        <div style={{width: w, height: h, overflow: 'hidden', background: '#222'}}>
          <Img
            src={imgSrc(src)}
            style={{width: '100%', height: '100%', objectFit: 'cover', filter: TREAT[treat] ?? treat, transform: `scale(${zoom}) translateX(${pan}px)`}}
          />
        </div>
        {caption ? (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 18,
              textAlign: 'center',
              fontFamily: fonts.serif,
              fontWeight: 900,
              fontSize: 40,
              color: '#3B2A1E',
            }}
          >
            {caption}
          </div>
        ) : null}
      </div>
      {tape && frame !== 'none' ? <Tape seed={`${seed}-t`} w={190} h={56} rot={-5} style={{top: -26, left: '50%', marginLeft: -95}} /> : null}
    </div>
  );
};

/** Chữ cắt rời từng ký tự (thư nặc danh / máy đánh chữ): "G O E T H E". `shown` = số ký tự đã hiện. */
export const Ransom: React.FC<{text: string; size?: number; shown?: number; seed?: string; font?: string}> = ({
  text,
  size = 80,
  shown = Infinity,
  seed = text,
  font = 'mono',
}) => {
  const chars = Array.from(text.normalize('NFC'));
  const bgs = ['#EFE9DA', '#F7F4EC', '#DDD5C2', '#EFE9DA'];
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', gap: size * 0.06, alignItems: 'center'}}>
      {chars.map((c, i) => {
        if (c === ' ') return <div key={i} style={{width: size * 0.4}} />;
        const r = (k: string) => random(`${seed}-${i}-${k}`);
        const f = font === 'mix' ? (r('f') > 0.5 ? fonts.mono : fonts.serif) : (FONT[font] ?? FONT.mono).family;
        return (
          <div
            key={i}
            style={{
              opacity: i < shown ? 1 : 0,
              transform: `rotate(${(r('r') - 0.5) * 9}deg) translateY(${(r('y') - 0.5) * size * 0.12}px)`,
              filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.35))',
            }}
          >
            <div
              style={{
                background: bgs[Math.floor(r('b') * bgs.length)],
                clipPath: tornClip(`${seed}-${i}`, 4, 0.6),
                padding: `${size * 0.02}px ${size * 0.14}px`,
                fontFamily: f,
                fontWeight: 700,
                fontSize: size,
                lineHeight: 1.18,
                color: colors.ink,
              }}
            >
              {c}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Số lớn. style: "letterpress" (serif in typo mòn — 2430 m) | "poster" (chữ đậm vàng cắt giấy — 1819) | "ink" (condensed màu).
 */
export const BigNum: React.FC<{text: string; style?: string; size?: number; color?: string; unit?: string; seed?: string; maxWidth?: number}> = ({
  text,
  style = 'letterpress',
  size: want = 260,
  color,
  unit,
  seed = text,
  maxWidth = 850,
}) => {
  // tự co để luôn nằm trên một dòng trong vùng an toàn (độ rộng ký tự trung bình theo font)
  const em = style === 'poster' ? 0.5 : style === 'ink' ? 0.5 : 0.66;
  const len = Array.from(text).length + (unit ? Array.from(unit).length * 0.3 + 0.3 : 0);
  const size = Math.min(want, maxWidth / Math.max(1, len * em));
  const unitChip = unit ? (
    <div
      style={{
        alignSelf: 'flex-end',
        marginLeft: size * 0.04,
        marginBottom: size * 0.1,
        background: '#3E2B1F',
        color: colors.yellow,
        fontFamily: fonts.serif,
        fontWeight: 900,
        fontSize: size * 0.24,
        lineHeight: 1,
        padding: `${size * 0.03}px ${size * 0.06}px`,
        boxShadow: '0 4px 10px rgba(0,0,0,0.35)',
      }}
    >
      {unit}
    </div>
  ) : null;
  if (style === 'poster') {
    return (
      <div style={{display: 'flex', alignItems: 'flex-end', whiteSpace: 'nowrap'}}>
        {Array.from(text).map((c, i) => (
          <span
            key={i}
            style={{
              display: 'inline-block',
              fontFamily: fonts.heavy,
              fontSize: size,
              lineHeight: 0.95,
              color: color ?? colors.yellow,
              transform: `rotate(${(random(`${seed}-${i}`) - 0.5) * 5}deg) translateY(${(random(`${seed}-y${i}`) - 0.5) * size * 0.04}px)`,
              filter: 'drop-shadow(0 8px 0 rgba(0,0,0,0.28)) drop-shadow(0 14px 14px rgba(0,0,0,0.3))',
            }}
          >
            {c}
          </span>
        ))}
        {unitChip}
      </div>
    );
  }
  if (style === 'ink') {
    return (
      <div style={{display: 'flex', alignItems: 'flex-end'}}>
        <span style={{fontFamily: fonts.condensed, fontWeight: 700, fontSize: size, lineHeight: 1, whiteSpace: 'nowrap', color: color ?? colors.coral}}>{text}</span>
        {unitChip}
      </div>
    );
  }
  return (
    <div style={{display: 'flex', alignItems: 'flex-end'}}>
      <div style={{filter: 'drop-shadow(0 6px 5px rgba(0,0,0,0.45))'}}>
        <span
          style={{
            display: 'block',
            whiteSpace: 'nowrap',
            fontFamily: fonts.serif,
            fontWeight: 900,
            fontSize: size,
            lineHeight: 1,
            letterSpacing: -size * 0.02,
            color: color ?? '#EDE6D6',
            ...WORN,
          }}
        >
          {text}
        </span>
      </div>
      {unitChip}
    </div>
  );
};

/** Con dấu mực đỏ. */
export const Stamp: React.FC<{text: string; size?: number; color?: string}> = ({text, size = 64, color = colors.red}) => (
  <div
    style={{
      display: 'inline-block',
      border: `${Math.max(5, size * 0.11)}px solid ${color}`,
      outline: `${Math.max(2, size * 0.04)}px solid ${color}`,
      outlineOffset: size * 0.08,
      color,
      fontFamily: fonts.condensed,
      fontWeight: 700,
      fontSize: size,
      lineHeight: 1.1,
      letterSpacing: size * 0.05,
      textTransform: 'uppercase',
      padding: `${size * 0.06}px ${size * 0.3}px`,
      ...WORN,
    }}
  >
    {text}
  </div>
);

/** Emoji như sticker bế viền trắng — hợp chất liệu cắt dán hơn emoji trơn. */
export const EmojiSticker: React.FC<{char: string; size?: number}> = ({char, size = 160}) => (
  <div
    style={{
      fontSize: size,
      lineHeight: 1,
      filter:
        'drop-shadow(6px 0 0 #fff) drop-shadow(-6px 0 0 #fff) drop-shadow(0 6px 0 #fff) drop-shadow(0 -6px 0 #fff) drop-shadow(0 14px 14px rgba(0,0,0,0.4))',
    }}
  >
    {char}
  </div>
);

/** Đinh ghim tròn. */
export const Pin: React.FC<{size?: number; color?: string}> = ({size = 30, color = colors.red}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: `radial-gradient(circle at 35% 30%, #fff8 0 12%, ${color} 30%, #0006 100%)`,
      boxShadow: '0 5px 6px rgba(0,0,0,0.45)',
    }}
  />
);

/* ---------- nét vẽ SVG (toạ độ khung hình 1080×1920) ---------- */

type Pt = [number, number];

/** Đường cong vẽ tay từ a → b; `bend` = độ cong (tỉ lệ độ dài, âm = cong ngược). */
export const curvePath = (a: Pt, b: Pt, bend = 0.25) => {
  const [x1, y1] = a;
  const [x2, y2] = b;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const cx = mx - dy * bend;
  const cy = my + dx * bend;
  return {d: `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`, end: Math.atan2(y2 - cy, x2 - cx)};
};

/** Mũi tên vẽ tay (mũi chữ V hở như ảnh tham khảo). `p` = tiến độ vẽ 0→1. */
export const HandArrow: React.FC<{from: Pt; to: Pt; bend?: number; p: number; color?: string; width?: number; head?: boolean}> = ({
  from,
  to,
  bend = 0.25,
  p,
  color = '#F7F4EC',
  width = 8,
  head = true,
}) => {
  const {d, end} = curvePath(from, to, bend);
  const ev = evolvePath(Math.min(1, p / 0.85), d);
  const hp = Math.max(0, (p - 0.85) / 0.15);
  const L = 38 * hp;
  const [x, y] = to;
  const h1 = [x - L * Math.cos(end - 0.5), y - L * Math.sin(end - 0.5)];
  const h2 = [x - L * Math.cos(end + 0.5), y - L * Math.sin(end + 0.5)];
  return (
    <g style={{filter: 'drop-shadow(0 3px 3px rgba(0,0,0,0.35))'}}>
      <path d={d} stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />
      {head && hp > 0 ? (
        <path d={`M ${h1[0]} ${h1[1]} L ${x} ${y} L ${h2[0]} ${h2[1]}`} stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      ) : null}
    </g>
  );
};

/** Dây nối "bảng điều tra" giữa hai điểm, có ghim ở hai đầu. */
export const StringLine: React.FC<{from: Pt; to: Pt; p: number; color?: string; width?: number; pins?: boolean; sag?: number}> = ({
  from,
  to,
  p,
  color = colors.teal,
  width = 6,
  pins = false,
  sag = 0.03,
}) => {
  const {d} = curvePath(from, to, sag);
  const ev = evolvePath(p, d);
  return (
    <g style={{filter: 'drop-shadow(0 4px 3px rgba(0,0,0,0.4))'}}>
      <path d={d} stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />
      {pins && p > 0 ? <circle cx={from[0]} cy={from[1]} r={11} fill={colors.red} /> : null}
      {pins && p >= 1 ? <circle cx={to[0]} cy={to[1]} r={11} fill={colors.red} /> : null}
    </g>
  );
};

/** Vòng khoanh tay quanh một vùng (cx, cy, rx, ry). */
export const Scribble: React.FC<{cx: number; cy: number; rx: number; ry: number; p: number; color?: string; width?: number; seed?: string}> = ({
  cx,
  cy,
  rx,
  ry,
  p,
  color = colors.red,
  width = 8,
  seed = 'sc',
}) => {
  const pts: string[] = [];
  const N = 46;
  for (let i = 0; i <= N; i++) {
    const t = -Math.PI * 0.6 + (i / N) * Math.PI * 2.18;
    const k = 1 + (random(`${seed}-${i}`) - 0.5) * 0.05 + (i / N) * 0.06;
    pts.push(`${i ? 'L' : 'M'} ${(cx + Math.cos(t) * rx * k).toFixed(1)} ${(cy + Math.sin(t) * ry * k).toFixed(1)}`);
  }
  const d = pts.join(' ');
  const ev = evolvePath(p, d);
  return <path d={d} stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />;
};
