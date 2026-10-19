import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, fonts, VIDEO} from '../theme';
import {boil, clamp01, ease, easeInOut, onTwos} from './anim';
import {BigNum, EmojiSticker, HandArrow, Label, Photo, Pin, Ransom, Scribble, Stamp, Sticker, StringLine, Tag, Tape} from './collage';
import {RichText} from './RichText';
import {Sfx} from './Sfx';

/**
 * Lớp cắt dán — mỗi phần tử trong `layers` của cảnh collage/map.
 * Toạ độ x, y tính theo khung 1080×1920 (điểm neo mặc định ở giữa phần tử).
 * Thời điểm: `cue` (cụm từ trong lời đọc → atMs) hoặc `at` (giây); rời khung: `outCue` / `out`.
 */
export type Layer = {
  kind: string;
  x?: number;
  y?: number;
  anchor?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'tl' | 'tr' | 'bl' | 'br';
  rot?: number;
  scale?: number;
  w?: number;
  h?: number;
  z?: number;
  atMs?: number;
  at?: number;
  outAtMs?: number;
  out?: number;
  enter?: string;
  exit?: string;
  sfx?: string | false;
  wobble?: boolean;
  [k: string]: any;
};

const ANCHOR: Record<string, [number, number]> = {
  center: [-50, -50],
  top: [-50, 0],
  bottom: [-50, -100],
  left: [0, -50],
  right: [-100, -50],
  tl: [0, 0],
  tr: [-100, 0],
  bl: [0, -100],
  br: [-100, -100],
};

/** Kiểu vào mặc định + SFX mặc định theo loại lớp. */
const DEFAULTS: Record<string, {enter: string; sfx: string | false}> = {
  image: {enter: 'drop', sfx: 'paper'},
  photo: {enter: 'drop', sfx: 'paper'},
  label: {enter: 'slap', sfx: 'paper'},
  labels: {enter: 'slap', sfx: 'paper'},
  tag: {enter: 'slap', sfx: 'click'},
  ransom: {enter: 'type', sfx: 'type'},
  number: {enter: 'slap', sfx: 'thud'},
  stamp: {enter: 'stamp', sfx: 'stamp'},
  emoji: {enter: 'pop', sfx: 'pop'},
  pin: {enter: 'pop', sfx: 'pop'},
  tape: {enter: 'fade', sfx: 'tape'},
  text: {enter: 'rise', sfx: false},
  arrow: {enter: 'draw', sfx: 'swish'},
  string: {enter: 'draw', sfx: 'swish'},
  scribble: {enter: 'draw', sfx: 'marker'},
  dim: {enter: 'fade', sfx: false},
};

export const layerFrame = (l: {atMs?: number; at?: number} | undefined, fps: number, fallback: number) => {
  if (!l) return fallback;
  if (typeof l.atMs === 'number') return Math.round((l.atMs / 1000) * fps);
  if (typeof l.at === 'number') return Math.round(l.at * fps);
  return fallback;
};
const outFrame = (l: Layer, fps: number) =>
  typeof l.outAtMs === 'number' ? Math.round((l.outAtMs / 1000) * fps) : typeof l.out === 'number' ? Math.round(l.out * fps) : Infinity;

/** Biến đổi CSS khi vào khung: trả về {opacity, transform}. `t` = frame tính từ lúc vào. */
const enterStyle = (enter: string, t: number, fps: number, rot: number) => {
  if (enter === 'none' || enter === 'draw' || enter === 'type') return {o: t >= 0 ? 1 : 0, tf: ''};
  const tt = onTwos(t);
  const sp = spring({frame: tt, fps, config: {damping: 13, stiffness: 170, mass: 0.6}});
  const lin = clamp01(tt, 0, 8);
  switch (enter) {
    case 'slap':
      return {o: clamp01(tt, 0, 3), tf: `scale(${interpolate(sp, [0, 1], [1.25, 1])}) rotate(${interpolate(sp, [0, 1], [7, 0])}deg)`};
    case 'stamp':
      return {o: clamp01(tt, 0, 2), tf: `scale(${interpolate(sp, [0, 1], [1.9, 1])}) rotate(${interpolate(sp, [0, 1], [-10, 0])}deg)`};
    case 'drop':
      return {o: clamp01(tt, 0, 4), tf: `translateY(${interpolate(sp, [0, 1], [-90, 0])}px) scale(${interpolate(sp, [0, 1], [1.12, 1])})`};
    case 'pop':
      return {o: clamp01(tt, 0, 2), tf: `scale(${sp})`};
    case 'rise': {
      const e = ease(lin);
      return {o: e, tf: `translateY(${(1 - e) * 40}px)`};
    }
    case 'up': // trồi lên từ mép dưới (núi, toà nhà tràn viền)
      return {o: 1, tf: `translateY(${interpolate(sp, [0, 1], [900, 0])}px)`};
    case 'left':
      return {o: 1, tf: `translateX(${interpolate(sp, [0, 1], [-1200, 0])}px) rotate(${interpolate(sp, [0, 1], [-8, 0])}deg)`};
    case 'right':
      return {o: 1, tf: `translateX(${interpolate(sp, [0, 1], [1200, 0])}px) rotate(${interpolate(sp, [0, 1], [8, 0])}deg)`};
    case 'fade':
    default:
      return {o: lin, tf: ''};
  }
  void rot;
};

const exitStyle = (t: number) => {
  const p = clamp01(t, 0, 6);
  return {o: 1 - p, tf: `scale(${1 - 0.06 * p})`};
};

const DRAWN = new Set(['arrow', 'string', 'scribble']);

const LayerBody: React.FC<{l: Layer; t: number; fps: number; idx: number}> = ({l, t, fps, idx}) => {
  const seed = l.seed ?? `${l.kind}-${idx}`;
  switch (l.kind) {
    case 'image':
      return <Sticker src={l.src} w={l.w} h={l.h} border={l.border ?? 7} treat={l.treat} zoom={l.kenburns === false ? 1 : 1 + 0.06 * clamp01(t, 0, 150)} />;
    case 'photo':
      return (
        <Photo
          src={l.src}
          w={l.w ?? 640}
          h={l.h ?? 520}
          frame={l.frame ?? 'polaroid'}
          caption={l.caption}
          treat={l.treat}
          tape={l.tape ?? true}
          zoom={1.04 + 0.1 * clamp01(t, 0, 200)}
          seed={seed}
        />
      );
    case 'label':
      return <Label text={l.text} color={l.color} font={l.font} size={l.size} upper={l.upper} maxWidth={l.maxWidth ?? l.w} align={l.align} worn={l.worn} seed={seed} />;
    case 'labels': {
      // chồng nhãn so le như "Leaning / Machu Picchu / of Peru"; mỗi dòng đập xuống lần lượt
      const lines: any[] = l.lines ?? [];
      const step = l.stagger ?? 5;
      return (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: l.align === 'center' ? 'center' : 'flex-start', gap: l.gap ?? 4}}>
          {lines.map((ln, i) => {
            const line = typeof ln === 'string' ? {text: ln} : ln;
            const lt = t - i * step;
            const e = enterStyle('slap', lt, fps, 0);
            const off = line.indent ?? (i % 2 === 1 ? 70 : 0);
            return (
              <div key={i} style={{opacity: lt >= 0 ? e.o : 0, transform: `translateX(${off}px) rotate(${line.rot ?? (i % 2 ? 1.5 : -2)}deg) ${e.tf}`}}>
                <Label text={line.text} color={line.color ?? ['kraft', 'cream', 'yellow'][i % 3]} font={line.font ?? l.font} size={line.size ?? l.size ?? 70} upper={line.upper} seed={`${seed}-${i}`} />
              </div>
            );
          })}
        </div>
      );
    }
    case 'tag':
      return <Tag text={l.text} size={l.size} color={l.color} upper={l.upper} />;
    case 'ransom': {
      const per = l.speed ?? 2;
      const shown = t < 0 ? 0 : Math.floor(t / per) + 1;
      return <Ransom text={l.text} size={l.size} shown={shown} seed={seed} font={l.font} />;
    }
    case 'number': {
      let text = l.value as string | undefined;
      if (typeof l.countTo === 'number') {
        const n = interpolate(t, [0, l.countFrames ?? 26], [l.countFrom ?? 0, l.countTo], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
        const dec = l.decimals ?? 0;
        const num = l.grouping === false ? n.toFixed(dec) : n.toLocaleString('vi-VN', {minimumFractionDigits: dec, maximumFractionDigits: dec});
        text = `${l.prefix ?? ''}${num}${l.suffix ?? ''}`;
      }
      return <BigNum text={text ?? ''} style={l.style} size={l.size} color={l.color} unit={l.unit} seed={seed} />;
    }
    case 'stamp':
      return <Stamp text={l.text} size={l.size} color={l.color} />;
    case 'emoji':
      return <EmojiSticker char={l.char ?? l.text} size={l.size} />;
    case 'pin':
      return <Pin size={l.size} color={l.color} />;
    case 'tape':
      return <Tape w={l.w} h={l.h} rot={0} seed={seed} style={{position: 'relative'}} />;
    case 'text':
      return (
        <div
          style={{
            width: l.w,
            fontFamily: (fonts as any)[l.font ?? 'serif'] ?? fonts.serif,
            fontWeight: l.weight ?? 900,
            fontSize: l.size ?? 72,
            lineHeight: 1.2,
            color: l.color ?? colors.paper,
            textAlign: l.align ?? 'left',
            textShadow: l.shadow === false ? undefined : '0 4px 14px rgba(0,0,0,0.45)',
          }}
        >
          <RichText text={l.text} delay={Math.max(0, -t) + 6} />
        </div>
      );
    case 'dim':
      // phủ tối toàn khung để làm nổi các lớp phía sau nó trong danh sách
      return <div style={{width: VIDEO.width, height: VIDEO.height, background: l.color ?? 'rgba(10,10,12,0.6)'}} />;
    default:
      return <div style={{color: colors.coral, fontSize: 30}}>lớp lạ: {l.kind}</div>;
  }
};

/** Vẽ toàn bộ lớp; kèm SFX lúc mỗi lớp vào khung. */
export const Layers: React.FC<{layers: Layer[]; dur: number; autoFrom?: number; autoSpread?: number}> = ({layers, dur, autoFrom = 6, autoSpread = 0.6}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const n = layers.length;
  const to = Math.max(autoFrom, dur * autoSpread);
  const starts = layers.map((l, i) => layerFrame(l, fps, n <= 1 ? autoFrom : autoFrom + ((to - autoFrom) * i) / (n - 1)));
  const svgLayers: React.ReactNode[] = [];
  const htmlLayers: React.ReactNode[] = [];
  const sfx: React.ReactNode[] = [];

  layers.forEach((l, i) => {
    const at = starts[i];
    const t = frame - at;
    const def = DEFAULTS[l.kind] ?? {enter: 'fade', sfx: false};
    const enter = l.enter ?? def.enter;
    const sname = l.sfx === undefined ? def.sfx : l.sfx;
    if (sname) sfx.push(<Sfx key={`s${i}`} name={sname} at={at} volume={l.sfxVolume ?? 1} />);
    const of = outFrame(l, fps);
    if (frame < at && enter !== 'type') return;
    if (frame >= of + 6) return;
    const ex = frame >= of ? exitStyle(frame - of) : {o: 1, tf: ''};

    if (DRAWN.has(l.kind)) {
      const p = interpolate(onTwos(t), [0, l.drawFrames ?? 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeInOut});
      let el: React.ReactNode = null;
      if (l.kind === 'arrow') el = <HandArrow from={l.from} to={l.to} bend={l.bend} p={p} color={l.color} width={l.width} />;
      if (l.kind === 'string') el = <StringLine from={l.from} to={l.to} p={p} color={l.color} width={l.width} pins={l.pins} />;
      if (l.kind === 'scribble') el = <Scribble cx={l.x ?? 540} cy={l.y ?? 960} rx={(l.w ?? 300) / 2} ry={(l.h ?? 160) / 2} p={p} color={l.color} width={l.width} seed={`sc-${i}`} />;
      svgLayers.push(
        <g key={i} opacity={ex.o}>
          {el}
        </g>,
      );
      return;
    }

    const e = enter === 'type' ? {o: 1, tf: ''} : enterStyle(enter, t, fps, l.rot ?? 0);
    const [ax, ay] = ANCHOR[l.anchor ?? 'center'];
    const wob = l.wobble === false ? 0 : boil(`${i}`, frame, l.kind === 'image' || l.kind === 'photo' ? 0.25 : 0.4);
    const full = l.kind === 'dim';
    htmlLayers.push(
      <div
        key={i}
        style={{
          position: 'absolute',
          left: full ? 0 : l.x ?? 540,
          top: full ? 0 : l.y ?? 960,
          zIndex: l.z,
          opacity: e.o * ex.o * (l.opacity ?? 1),
          transform: full
            ? ''
            : `translate(${ax}%, ${ay}%) rotate(${(l.rot ?? 0) + wob}deg) scale(${l.scale ?? 1}) ${e.tf} ${ex.tf}`,
          transformOrigin: 'center',
        }}
      >
        <LayerBody l={l} t={t} fps={fps} idx={i} />
      </div>,
    );
  });

  return (
    <>
      {htmlLayers}
      {svgLayers.length ? (
        <svg width={VIDEO.width} height={VIDEO.height} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', zIndex: 50}}>
          {svgLayers}
        </svg>
      ) : null}
      {sfx}
    </>
  );
};
