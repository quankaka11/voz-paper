import React, {createContext, useContext} from 'react';
import {interpolate, useCurrentFrame, Easing} from 'remotion';
import {colors} from '../theme';

/** Cảnh nền tối: vệt dạ quang phủ hết chiều cao chữ để dấu tiếng Việt không chìm vào nền. */
export const DarkContext = createContext(false);

type Seg = {text: string; kind: 'plain' | 'hl' | 'accent'};

/** Cú pháp trong episode.json: ==chữ dạ quang==, **chữ màu nhấn** */
export const parseRich = (s: string): Seg[] => {
  const out: Seg[] = [];
  const re = /(==[^=]+==|\*\*[^*]+\*\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push({text: s.slice(last, m.index), kind: 'plain'});
    const tok = m[0];
    out.push({text: tok.slice(2, -2), kind: tok.startsWith('==') ? 'hl' : 'accent'});
    last = m.index + tok.length;
  }
  if (last < s.length) out.push({text: s.slice(last), kind: 'plain'});
  return out;
};

export const stripRich = (s: string) => s.replace(/==|\*\*/g, '');

/** Bút dạ quang quét từ trái sang phải sau `delay` frame. */
export const Highlight: React.FC<{children: React.ReactNode; delay?: number; color?: string}> = ({
  children,
  delay = 0,
  color = colors.yellow,
}) => {
  const frame = useCurrentFrame();
  const dark = useContext(DarkContext);
  const p = interpolate(frame, [delay, delay + 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  // Nền gradient + box-decoration-break để vệt dạ quang đúng cả khi chữ xuống dòng.
  return (
    <span
      style={{
        whiteSpace: 'pre-wrap',
        backgroundImage: `linear-gradient(${color}, ${color})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${p * 100}% ${dark ? 100 : 62}%`,
        backgroundPosition: dark ? '0 50%' : '0 88%',
        color: p > 0.3 ? colors.ink : undefined, // chữ tối trên nền vàng, kể cả ở cảnh nền navy
        padding: '0 0.08em',
        margin: '0 -0.04em',
        WebkitBoxDecorationBreak: 'clone',
        boxDecorationBreak: 'clone',
      }}
    >
      {children}
    </span>
  );
};

/** Bọc chuỗi số bằng font riêng (số của Playfair dễ nhầm: '0' trông như 'Q'). */
const withNums = (t: string, numFont?: string): React.ReactNode =>
  !numFont
    ? t
    : t.split(/(\d[\d.,]*)/).map((part, i) =>
        /^\d/.test(part) ? (
          <span key={i} style={{fontFamily: numFont, fontWeight: 700}}>
            {part}
          </span>
        ) : (
          part
        ),
      );

export const RichText: React.FC<{text: string; delay?: number; accent?: string; style?: React.CSSProperties; numFont?: string}> = ({
  text,
  delay = 0,
  accent = colors.coral,
  style,
  numFont,
}) => {
  const segs = parseRich(text);
  let hlIndex = 0;
  return (
    <span style={style}>
      {segs.map((s, i) => {
        if (s.kind === 'hl')
          return (
            <Highlight key={i} delay={delay + 8 * hlIndex++}>
              {withNums(s.text, numFont)}
            </Highlight>
          );
        if (s.kind === 'accent')
          return (
            <span key={i} style={{color: accent}}>
              {withNums(s.text, numFont)}
            </span>
          );
        return (
          <span key={i} style={{whiteSpace: 'pre-wrap'}}>
            {withNums(s.text, numFont)}
          </span>
        );
      })}
    </span>
  );
};
