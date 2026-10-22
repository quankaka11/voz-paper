import React, {useContext} from 'react';
import {AbsoluteFill, Img, interpolate, OffthreadVideo, useCurrentFrame, useVideoConfig} from 'remotion';
import {evolvePath} from '@remotion/paths';
import {Scene} from '../types';
import {colors, fonts} from '../theme';
import {Heading, Kicker, Split, Stage, useContent, useRevealFrame} from '../ui/layout';
import {boil, clamp01, easeInOut, onTwos, useEnter, useSlap} from '../ui/anim';
import {BigNum, imgSrc, Label, Sticker, Tag, Tape, Torn, TREAT} from '../ui/collage';
import {layerFrame} from '../ui/Layers';
import {DarkContext, RichText} from '../ui/RichText';
import {Sfx} from '../ui/Sfx';
import {useFormat} from '../ui/format';

/*
 * Cảnh dành cho video dài (dùng được ở cả hai định dạng): chapter, timeline, callout, lineChart, quote, footage.
 * Mọi chuyển động chỉ dựa vào useCurrentFrame(); mốc hiện theo lời đọc qua `cue` (build đổi thành atMs).
 */

/* ======================= chapter ======================= */

/**
 * chapter — thẻ mở chương: số chương poster lớn, tên chương nhãn giấy xé, dải tiến độ các chương.
 * Đồng thời là mốc chương YouTube (build ghi vào props.chapters → publish.md).
 * props: title, no?, total? (build tự đánh số), kicker? (mặc định "Chương N"), sub?, image? ({src, treat?, w?} — vật thể tách nền)
 */
export const ChapterScene: React.FC<{scene: Scene}> = ({scene}) => {
  const {title = '', no = 1, total = 1, kicker, sub, image} = scene.props;
  const frame = useCurrentFrame();
  const f = useFormat();
  const dark = useContext(DarkContext);
  const n = useSlap(2, 12);
  const t = useSlap(10);
  const s = useEnter(22);
  const img = useSlap(6, 16);
  const im = typeof image === 'string' ? {src: image} : image;
  const num = String(no).padStart(2, '0');
  const progress = (
    <div style={{display: 'flex', gap: 14, marginTop: 44, opacity: s}}>
      {Array.from({length: Math.max(1, total)}, (_, i) => (
        <div
          key={i}
          style={{
            width: i + 1 === no ? 70 : 34,
            height: 16,
            background: i + 1 < no ? (dark ? '#8E897E' : colors.inkSoft) : i + 1 === no ? colors.red : 'transparent',
            border: `3px solid ${dark ? '#8E897E' : colors.inkSoft}`,
            transform: `rotate(${(i % 2 ? 1 : -1) * 1.5}deg)`,
          }}
        />
      ))}
    </div>
  );
  const body = (
    <>
      <div style={{display: 'flex', alignItems: 'flex-end', gap: 26}}>
        <div style={{transform: `scale(${interpolate(n, [0, 1], [1.4, 1])}) rotate(${interpolate(n, [0, 1], [-8, -3])}deg)`, transformOrigin: 'left bottom', opacity: Math.min(1, n * 3)}}>
          <BigNum text={num} style="poster" size={f.wide ? 300 : 320} />
        </div>
        <div style={{marginBottom: 30, transform: `rotate(-2deg)`, opacity: Math.min(1, n * 3)}}>
          <Tag text={kicker ?? `Chương ${no}`} size={f.wide ? 44 : 48} color="red" />
        </div>
      </div>
      <div style={{marginTop: 26, alignSelf: 'flex-start', opacity: t > 0 ? 1 : 0, transform: `scale(${interpolate(t, [0, 1], [1.25, 1])}) rotate(${-1.5 + boil('ch', frame, 0.3)}deg)`, transformOrigin: 'left center'}}>
        <Label text={title} color="cream" font="serif" size={f.wide ? 92 : 96} maxWidth={f.wide ? 1100 : 860} seed={`chap-${title}`} />
      </div>
      {sub ? (
        <div style={{marginTop: 30, fontFamily: fonts.sans, fontWeight: 600, fontSize: f.wide ? 44 : 46, lineHeight: 1.35, color: dark ? '#D9D4C8' : colors.inkSoft, opacity: s, maxWidth: f.wide ? 1100 : undefined}}>
          <RichText text={sub} delay={30} />
        </div>
      ) : null}
      {progress}
    </>
  );
  return (
    <AbsoluteFill>
      {im ? (
        <div style={{position: 'absolute', left: f.wide ? f.width * 0.78 : f.width * 0.62, bottom: -30, transform: `translateX(-50%) translateY(${(1 - img) * 700}px) rotate(3deg)`}}>
          <Sticker src={im.src} w={im.w ?? (f.wide ? 560 : 640)} treat={im.treat ?? 'bw'} border={8} />
        </div>
      ) : null}
      <Stage style={f.wide ? {width: f.content.width * (im ? 0.62 : 0.9)} : {paddingTop: 0}}>{body}</Stage>
      <Sfx name="thud" at={2} />
      <Sfx name="paper" at={10} />
      {im ? <Sfx name="paper" at={6} /> : null}
    </AbsoluteFill>
  );
};

/* ======================= timeline ======================= */

type Ev = {year: string | number; label: string; img?: string; treat?: string; atMs?: number; highlight?: boolean};

/**
 * timeline — dòng thời gian: trục kẻ dần theo lời đọc, mỗi mốc là chấm + năm (số poster) + nhãn giấy (+ ảnh nhỏ).
 * Khung ngang: trục ngang; khung dọc: trục dọc bên trái.
 * props: kicker?, title?, events: [{year, label, img?, treat?, highlight?, cue?}], proportional? (khoảng cách theo năm)
 */
export const TimelineScene: React.FC<{scene: Scene}> = ({scene}) => {
  const {kicker, title, events = [], proportional = false} = scene.props;
  const frame = useCurrentFrame();
  const f = useFormat();
  const c = useContent();
  const dark = useContext(DarkContext);
  const reveal = useRevealFrame(scene.durationInFrames);
  const evs = events as Ev[];
  const n = evs.length;
  const ats = evs.map((e, i) => reveal(e, i, n, 10, 0.7));
  const ys = evs.map((e) => parseFloat(String(e.year)));
  const numeric = proportional && ys.every((y) => Number.isFinite(y)) && ys[n - 1] > ys[0];
  const pos = (i: number) => (numeric ? (ys[i] - ys[0]) / (ys[n - 1] - ys[0]) : n <= 1 ? 0.5 : i / (n - 1));
  const head = title ? 150 : 40;
  const ink = dark ? colors.paper : colors.ink;
  // trục kẻ dần: 10 frame trước mỗi mốc thì kẻ từ mốc trước tới mốc đó
  const reach = evs.reduce((r, _, i) => {
    const from = i === 0 ? 0 : pos(i - 1);
    return Math.max(r, from + (pos(i) - from) * clamp01(onTwos(frame), ats[i] - 10, ats[i]));
  }, 0);

  if (f.wide) {
    const x0 = 190; // chừa nửa bề rộng nhãn (360) ở hai đầu trục
    const x1 = c.width - 190;
    const axisY = (c.bottom - c.top - head) * 0.52;
    return (
      <Stage align="top">
        <Kicker text={kicker} />
        {title ? <Heading text={title} size={72} /> : null}
        <div style={{position: 'relative', width: c.width, height: c.bottom - c.top - head, marginTop: 20}}>
          <svg width={c.width} height={c.bottom - c.top - head} style={{position: 'absolute', overflow: 'visible'}}>
            <line x1={x0} y1={axisY} x2={x0 + (x1 - x0) * (n ? reach : 0)} y2={axisY} stroke={ink} strokeWidth={8} strokeLinecap="round" />
          </svg>
          {evs.map((e, i) => {
            const p = clamp01(onTwos(frame), ats[i], ats[i] + 8);
            const x = x0 + (x1 - x0) * pos(i);
            const up = i % 2 === 0;
            return (
              <React.Fragment key={i}>
                <Sfx name="pop" at={ats[i]} />
                <div style={{position: 'absolute', left: x - 16, top: axisY - 16, width: 32, height: 32, borderRadius: '50%', background: e.highlight ? colors.red : ink, border: `6px solid ${dark ? colors.charcoal : colors.paper}`, transform: `scale(${p})`}} />
                <div style={{position: 'absolute', left: x, top: up ? axisY - 40 : axisY + 40, transform: `translate(-50%, ${up ? '-100%' : '0'}) scale(${interpolate(p, [0, 1], [1.2, 1])})`, opacity: p > 0 ? 1 : 0, display: 'flex', flexDirection: up ? 'column' : 'column-reverse', alignItems: 'center', gap: 10, width: 360}}>
                  {e.img ? <Sticker src={e.img} h={170} treat={e.treat ?? 'bw'} border={6} /> : null}
                  <BigNum text={String(e.year)} style="poster" size={86} color={e.highlight ? colors.red : undefined} seed={`tl-${i}`} />
                </div>
                <div style={{position: 'absolute', left: x - 180, width: 360, top: up ? axisY + 40 : axisY - 40, display: 'flex', justifyContent: 'center', transform: `translateY(${up ? '0' : '-100%'}) rotate(${up ? -1.5 : 1.5}deg)`, opacity: clamp01(frame, ats[i] + 4, ats[i] + 10)}}>
                  <Torn seed={`tl-l-${i}`} bg={e.highlight ? '#F2D43D' : '#ECE4D2'} pad="10px 20px" rough={7}>
                    <div style={{fontFamily: fonts.sans, fontWeight: 700, fontSize: 36, lineHeight: 1.2, color: colors.ink, maxWidth: 320, textAlign: 'center'}}>
                      <RichText text={e.label} />
                    </div>
                  </Torn>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </Stage>
    );
  }
  const y0 = 30;
  const y1 = c.bottom - c.top - head - 150; // mốc cuối cách dải phụ đề
  const axisX = 90;
  return (
    <Stage align="top">
      <Kicker text={kicker} />
      {title ? <Heading text={title} size={70} /> : null}
      <div style={{position: 'relative', width: c.width, height: c.bottom - c.top - head, marginTop: 20}}>
        <svg width={c.width} height={c.bottom - c.top - head} style={{position: 'absolute', overflow: 'visible'}}>
          <line x1={axisX} y1={y0} x2={axisX} y2={y0 + (y1 - y0) * (n ? reach : 0)} stroke={ink} strokeWidth={8} strokeLinecap="round" />
        </svg>
        {evs.map((e, i) => {
          const p = clamp01(onTwos(frame), ats[i], ats[i] + 8);
          const y = y0 + (y1 - y0) * pos(i);
          return (
            <React.Fragment key={i}>
              <Sfx name="pop" at={ats[i]} />
              <div style={{position: 'absolute', left: axisX - 16, top: y - 16, width: 32, height: 32, borderRadius: '50%', background: e.highlight ? colors.red : ink, border: `6px solid ${dark ? colors.charcoal : colors.paper}`, transform: `scale(${p})`}} />
              <div style={{position: 'absolute', left: axisX + 44, top: y, transform: `translateY(-50%) scale(${interpolate(p, [0, 1], [1.2, 1])})`, transformOrigin: 'left center', opacity: p > 0 ? 1 : 0, display: 'flex', alignItems: 'center', gap: 20}}>
                <BigNum text={String(e.year)} style="poster" size={90} color={e.highlight ? colors.red : undefined} seed={`tl-${i}`} />
                <Torn seed={`tl-l-${i}`} bg={e.highlight ? '#F2D43D' : '#ECE4D2'} pad="10px 20px" rough={7}>
                  <div style={{fontFamily: fonts.sans, fontWeight: 700, fontSize: 38, lineHeight: 1.2, color: colors.ink, maxWidth: 440}}>
                    <RichText text={e.label} />
                  </div>
                </Torn>
                {e.img ? <Sticker src={e.img} h={150} treat={e.treat ?? 'bw'} border={6} /> : null}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </Stage>
  );
};

/* ======================= callout ======================= */

type Callout = {x: number; y: number; r?: number; label?: string; atMs?: number};

/**
 * callout — ảnh tư liệu in trên giấy, vòng tròn vàng khoanh chi tiết + đường dẫn ra nhãn đánh máy
 * (kiểu "The 1956 Interstate Act"). Máy quay tự đẩy về vòng tròn đang được nói tới.
 * props: src, treat? (mặc định bw), callouts: [{x, y (0–1 theo ảnh), r? (0–1 theo bề rộng ảnh, mặc định 0.09),
 *        label?, cue?}], kicker?, caption?, credit?, zoom? (độ đẩy máy, mặc định 1.08; 1 = tắt)
 * Khung ngang: ảnh 980×700 bên trái, nhãn bên phải. Khung dọc: ảnh 920×680 phía trên, nhãn bên dưới ảnh.
 */
export const CalloutScene: React.FC<{scene: Scene}> = ({scene}) => {
  const {src, treat = 'bw', callouts = [], kicker, caption, credit, zoom = 1.08} = scene.props;
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const f = useFormat();
  const dark = useContext(DarkContext);
  const e = useSlap(0, 15);
  const list = (callouts as Callout[]).map((c, i) => ({...c, at: layerFrame(c, fps, 14 + i * 30)}));
  // khung ảnh trong toạ độ khung hình
  const P = f.wide ? {x: 150, y: 190, w: 980, h: 700} : {x: 80, y: 330, w: 920, h: 600};
  const toXY = (c: Callout) => [P.x + c.x * P.w, P.y + c.y * P.h] as [number, number];
  // máy quay: đẩy nhẹ về vòng tròn mới nhất
  const active = list.filter((c) => frame >= c.at);
  const cur = active[active.length - 1];
  const prev = active[active.length - 2];
  const pm = cur ? easeInOut(clamp01(frame, cur.at, cur.at + 24)) : 0;
  const tgt = (c?: Callout) => (c ? toXY(c) : [f.width / 2, f.height / 2]);
  const [ax, ay] = tgt(prev);
  const [bx, by] = tgt(cur);
  const z0 = prev ? zoom : 1;
  const z = cur ? z0 + (zoom - z0) * pm : 1;
  const cx = ax + (bx - ax) * pm;
  const cy = ay + (by - ay) * pm;
  // giữ điểm nhìn gần tâm khung (chỉ lia 25% quãng đường) để ảnh và nhãn không trôi ra mép
  const fx = f.width / 2 + (cx - f.width / 2) * 0.25;
  const fy = f.height / 2 + (cy - f.height / 2) * 0.25;
  const cam = `translate(${f.width / 2}px, ${f.height / 2}px) scale(${z}) translate(${-fx}px, ${-fy}px)`;
  const labelX = f.wide ? P.x + P.w + 70 : P.x + 20;
  return (
    <AbsoluteFill style={{transform: cam, transformOrigin: '0 0'}}>
      <div style={{position: 'absolute', left: P.x, top: P.y, width: P.w, height: P.h, transform: `translateY(${(1 - e) * -90}px) scale(${1.08 - 0.08 * e}) rotate(${-1}deg)`, opacity: Math.min(1, e * 3), filter: `drop-shadow(0 26px 30px rgba(0,0,0,${dark ? 0.6 : 0.35}))`}}>
        <div style={{position: 'absolute', inset: -16, background: '#EFEAE0', backgroundImage: 'linear-gradient(170deg, rgba(255,255,255,0.35), rgba(0,0,0,0.06))'}} />
        <Img src={imgSrc(src)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: TREAT[treat] ?? treat}} />
        <Tape seed="co1" w={200} h={56} rot={-6} style={{left: -40, top: -30}} />
      </div>
      <Sfx name="paper" at={0} />
      {kicker ? (
        <div style={{position: 'absolute', left: f.wide ? labelX : P.x, top: f.wide ? P.y : P.y - 100, opacity: e}}>
          <Kicker text={kicker} />
        </div>
      ) : null}
      <svg width={f.width} height={f.height} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {list.map((c, i) => {
          const [x, y] = toXY(c);
          const r = (c.r ?? 0.09) * P.w;
          const pc = interpolate(onTwos(frame), [c.at, c.at + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeInOut});
          const pl = interpolate(onTwos(frame), [c.at + 10, c.at + 22], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeInOut});
          // đường dẫn: từ mép vòng tròn ra vị trí nhãn
          const ly = f.wide ? Math.min(P.y + P.h - 40, Math.max(P.y + 40, y)) : P.y + P.h + 60 + i * 90;
          const lx = f.wide ? labelX : Math.min(Math.max(x, P.x + 60), P.x + P.w - 60);
          const sx = f.wide ? x + r : x;
          const sy = f.wide ? y : y + r;
          const d = f.wide ? `M ${sx} ${sy} L ${lx - 14} ${ly}` : `M ${sx} ${sy} L ${lx} ${ly - 40}`;
          const circle = `M ${x + r} ${y} A ${r} ${r} 0 1 1 ${x + r - 0.01} ${y + 0.5}`;
          const ec = evolvePath(pc, circle);
          const el = evolvePath(pl, d);
          return pc > 0 ? (
            <g key={i} style={{filter: 'drop-shadow(0 3px 3px rgba(0,0,0,0.35))'}}>
              <path d={circle} stroke={colors.yellow} strokeWidth={9} fill="none" strokeLinecap="round" strokeDasharray={ec.strokeDasharray} strokeDashoffset={ec.strokeDashoffset} />
              {c.label ? <path d={d} stroke={colors.yellow} strokeWidth={6} fill="none" strokeDasharray={el.strokeDasharray} strokeDashoffset={el.strokeDashoffset} /> : null}
            </g>
          ) : null;
        })}
      </svg>
      {list.map((c, i) => {
        if (!c.label) return null;
        const [, y] = toXY(c);
        const ly = f.wide ? Math.min(P.y + P.h - 40, Math.max(P.y + 40, y)) : P.y + P.h + 60 + i * 90;
        const pt = clamp01(frame, c.at + 18, c.at + 26);
        const chars = Math.floor(interpolate(frame, [c.at + 18, c.at + 18 + c.label.length * 1.2], [0, c.label.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
        return (
          <React.Fragment key={i}>
            <Sfx name="marker" at={c.at} />
            <Sfx name="type" at={c.at + 18} />
            <div
              style={{
                position: 'absolute',
                left: labelX,
                top: ly,
                transform: 'translateY(-50%)',
                width: f.wide ? f.width - labelX - 150 : P.w - 40,
                fontFamily: fonts.mono,
                fontWeight: 700,
                fontSize: f.wide ? 46 : 48,
                lineHeight: 1.2,
                color: dark ? colors.paper : colors.ink,
                opacity: pt > 0 ? 1 : 0,
                textShadow: dark ? '0 3px 10px rgba(0,0,0,0.5)' : undefined,
              }}
            >
              {c.label.slice(0, chars)}
            </div>
          </React.Fragment>
        );
      })}
      {caption || credit ? (
        <div style={{position: 'absolute', left: P.x, top: P.y + P.h + 26, width: P.w, fontFamily: fonts.mono, fontSize: 24, color: dark ? '#CFC9BC' : colors.inkSoft, opacity: e, display: f.wide ? 'block' : 'none'}}>
          {[caption, credit ? `Ảnh: ${credit}` : null].filter(Boolean).join(' · ')}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/* ======================= lineChart ======================= */

type Series = {name?: string; color?: string; points: [number, number][]};

const fmt = (v: number, dec = 0) => v.toLocaleString('vi-VN', {minimumFractionDigits: dec, maximumFractionDigits: dec});

/**
 * lineChart — biểu đồ đường theo thời gian, đường tự kẻ dần như bút dạ; nhãn giá trị cuối đường; chú thích dọc theo cue.
 * props: kicker?, title?, unit?, decimals?, series: [{name?, color?, points: [[x, y], …]}], yMin? (mặc định 0), yMax?,
 *        xTicks? (các giá trị x hiện nhãn — mặc định điểm đầu/cuối và vài mốc giữa), annotate?: [{x, label, cue?}],
 *        drawCue? ({cue} — lúc bắt đầu kẻ; mặc định 10 frame), drawFrames? (mặc định 55% cảnh)
 */
export const LineChartScene: React.FC<{scene: Scene}> = ({scene}) => {
  const {kicker, title, unit = '', decimals = 0, series = [], yMin = 0, yMax, xTicks, annotate = [], drawCue, drawFrames} = scene.props;
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const f = useFormat();
  const c = useContent();
  const dark = useContext(DarkContext);
  const ss = series as Series[];
  const all = ss.flatMap((s) => s.points);
  if (!all.length) return null;
  const xs = all.map((p) => p[0]);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const top = yMax ?? Math.max(...all.map((p) => p[1])) * 1.12;
  const W = c.width - 260; // chừa chỗ cho trục số bên trái và nhãn giá trị cuối đường bên phải
  const H = f.wide ? c.bottom - c.top - (title ? 240 : 120) : 820;
  const X = (x: number) => ((x - xMin) / Math.max(1e-9, xMax - xMin)) * W;
  const Y = (y: number) => H - ((y - yMin) / Math.max(1e-9, top - yMin)) * H;
  const start = layerFrame(drawCue, fps, 10);
  const dur = drawFrames ?? Math.round(scene.durationInFrames * 0.55);
  const p = interpolate(frame, [start, start + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeInOut});
  const ink = dark ? colors.paper : colors.ink;
  const grid = dark ? 'rgba(242,234,219,0.18)' : 'rgba(22,24,29,0.15)';
  const ticks = [0, 1, 2, 3].map((i) => yMin + ((top - yMin) * i) / 3);
  const xt: number[] = xTicks ?? Array.from(new Set([xMin, Math.round(xMin + (xMax - xMin) / 3), Math.round(xMin + ((xMax - xMin) * 2) / 3), xMax]));
  const palette = [colors.red, dark ? colors.yellow : colors.navy, colors.teal, colors.coral];
  const chart = (
    <div style={{position: 'relative', width: W + 160, height: H + 70, marginTop: 30}}>
      <svg width={W + 160} height={H + 70} style={{position: 'absolute', overflow: 'visible'}}>
        <g transform="translate(110 10)">
          {ticks.map((t, i) => (
            <g key={i} opacity={clamp01(frame, 2 + i * 2, 10 + i * 2)}>
              <line x1={0} y1={Y(t)} x2={W} y2={Y(t)} stroke={grid} strokeWidth={2} strokeDasharray={i === 0 ? undefined : '6 10'} />
              <text x={-16} y={Y(t) + 10} textAnchor="end" fontFamily={fonts.condensed} fontWeight={700} fontSize={30} fill={ink} opacity={0.75}>
                {fmt(t, t < 10 && top < 10 ? 1 : 0)}
              </text>
            </g>
          ))}
          {xt.map((x, i) => (
            <text key={i} x={X(x)} y={H + 46} textAnchor="middle" fontFamily={fonts.condensed} fontWeight={700} fontSize={32} fill={ink} opacity={clamp01(frame, 4, 12) * 0.85}>
              {x}
            </text>
          ))}
          {ss.map((s, si) => {
            const pts = [...s.points].sort((a, b) => a[0] - b[0]);
            const d = pts.map((q, i) => `${i ? 'L' : 'M'} ${X(q[0]).toFixed(1)} ${Y(q[1]).toFixed(1)}`).join(' ');
            const ev = evolvePath(p, d);
            const col = s.color ?? palette[si % palette.length];
            // đầu bút: điểm cuối phần đã kẻ (nội suy theo x)
            const xNow = xMin + (xMax - xMin) * p;
            let yNow = pts[0][1];
            for (let i = 1; i < pts.length; i++) {
              if (pts[i][0] >= xNow) {
                const [x0, y0] = pts[i - 1];
                const [x1, y1] = pts[i];
                yNow = y0 + ((y1 - y0) * (xNow - x0)) / Math.max(1e-9, x1 - x0);
                break;
              }
              yNow = pts[i][1];
            }
            return (
              <g key={si} style={{filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.3))'}}>
                <path d={d} stroke={col} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />
                {p > 0 ? <circle cx={X(xNow)} cy={Y(yNow)} r={13} fill={col} stroke={dark ? colors.charcoal : colors.paper} strokeWidth={5} /> : null}
              </g>
            );
          })}
          {(annotate as {x: number; label: string; atMs?: number}[]).map((a, i) => {
            const at = layerFrame(a, fps, start + Math.round(dur * ((a.x - xMin) / Math.max(1e-9, xMax - xMin))));
            const pa = clamp01(onTwos(frame), at, at + 8);
            return pa > 0 ? (
              <g key={i} opacity={pa}>
                <line x1={X(a.x)} y1={0} x2={X(a.x)} y2={H} stroke={ink} strokeWidth={3} strokeDasharray="4 10" />
              </g>
            ) : null;
          })}
        </g>
      </svg>
      {(annotate as {x: number; label: string; atMs?: number}[]).map((a, i) => {
        const at = layerFrame(a, fps, start + Math.round(dur * ((a.x - xMin) / Math.max(1e-9, xMax - xMin))));
        const pa = clamp01(onTwos(frame), at, at + 8);
        return (
          <React.Fragment key={i}>
            <Sfx name="click" at={at} />
            <div style={{position: 'absolute', left: 110 + X(a.x), top: 0, transform: `translateX(-50%) scale(${interpolate(pa, [0, 1], [1.2, 1])}) rotate(-2deg)`, opacity: pa > 0 ? 1 : 0, whiteSpace: 'nowrap'}}>
              <Tag text={a.label} size={32} color={i % 2 ? 'black' : 'red'} upper={false} />
            </div>
          </React.Fragment>
        );
      })}
      {ss.map((s, si) => {
        const pts = [...s.points].sort((a, b) => a[0] - b[0]);
        const last = pts[pts.length - 1];
        const pe = clamp01(frame, start + dur, start + dur + 8);
        const col = s.color ?? palette[si % palette.length];
        return (
          <div key={si} style={{position: 'absolute', left: 110 + X(last[0]) + 24, top: 10 + Y(last[1]), transform: `translateY(-50%) scale(${interpolate(pe, [0, 1], [1.3, 1])})`, transformOrigin: 'left center', opacity: pe, display: 'flex', flexDirection: 'column', gap: 2}}>
            <span style={{fontFamily: fonts.heavy, fontSize: 56, color: col, lineHeight: 1, filter: 'drop-shadow(0 3px 3px rgba(0,0,0,0.35))'}}>
              {fmt(last[1], decimals)}
              {unit}
            </span>
            {s.name ? <span style={{fontFamily: fonts.sans, fontWeight: 700, fontSize: 28, color: ink, whiteSpace: 'nowrap'}}>{s.name}</span> : null}
          </div>
        );
      })}
    </div>
  );
  return (
    <Stage align="top">
      <Kicker text={kicker} />
      {title ? <Heading text={title} size={f.wide ? 72 : 70} /> : null}
      <Sfx name="marker" at={start} />
      {chart}
    </Stage>
  );
};

/* ======================= quote ======================= */

/**
 * quote — trích dẫn nguyên văn có ghi nguồn: dấu ngoặc kép lớn, câu trích (==cụm== được quét), chân dung tách nền.
 * CHỈ dùng câu nói thật có nguồn (ghi `source`). props: text, author, role?, date?, image?, treat?, kicker?
 */
export const QuoteScene: React.FC<{scene: Scene}> = ({scene}) => {
  const {text = '', author, role, date, image, treat = 'bw', kicker} = scene.props;
  const frame = useCurrentFrame();
  const f = useFormat();
  const dark = useContext(DarkContext);
  const q = useSlap(0, 12);
  const t = useEnter(8);
  const a = useSlap(24);
  const im = typeof image === 'string' ? {src: image} : image;
  const fg = dark ? colors.paper : colors.ink;
  const quote = (
    <>
      <Kicker text={kicker} />
      <div style={{position: 'relative'}}>
        <div style={{position: 'absolute', left: -20, top: f.wide ? -120 : -110, fontFamily: fonts.serif, fontWeight: 900, fontSize: 240, lineHeight: 1, color: colors.yellow, opacity: Math.min(1, q * 3), transform: `scale(${interpolate(q, [0, 1], [1.4, 1])}) rotate(${-6 + boil('qq', frame, 0.4)}deg)`}}>“</div>
        <div style={{fontFamily: fonts.serif, fontWeight: 700, fontSize: f.wide ? 62 : 64, lineHeight: 1.3, color: fg, opacity: t, transform: `translateY(${(1 - t) * 24}px)`, textShadow: dark ? '0 4px 16px rgba(0,0,0,0.5)' : undefined, paddingTop: 30}}>
          <RichText text={text} delay={20} />
        </div>
      </div>
      {author ? (
        <div style={{marginTop: 40, display: 'flex', alignItems: 'center', gap: 18, opacity: a > 0 ? 1 : 0, transform: `scale(${interpolate(a, [0, 1], [1.2, 1])}) rotate(-1.5deg)`, transformOrigin: 'left center', flexWrap: 'wrap'}}>
          <Tag text={`— ${author}`} size={42} color="black" upper={false} />
          {role || date ? <span style={{fontFamily: fonts.mono, fontSize: 28, color: dark ? '#CFC9BC' : colors.inkSoft}}>{[role, date].filter(Boolean).join(' · ')}</span> : null}
        </div>
      ) : null}
      <Sfx name="thud" at={0} />
      {author ? <Sfx name="paper" at={24} /> : null}
    </>
  );
  const portrait = im ? (
    <div style={{transform: `translateY(${(1 - q) * 300}px) rotate(${2 + boil('qp', frame, 0.3)}deg)`}}>
      <Sticker src={im.src} w={im.w ?? (f.wide ? 520 : 560)} h={im.h ?? (f.wide ? 680 : 560)} treat={im.treat ?? treat} border={8} />
    </div>
  ) : null;
  if (f.wide && portrait) {
    return (
      <Split side={portrait} sideWidth={600} reverse>
        {quote}
      </Split>
    );
  }
  return (
    <Stage style={f.wide ? {width: f.content.width * 0.8, left: f.content.left + f.content.width * 0.1} : undefined}>
      {portrait ? <div style={{alignSelf: 'center', marginBottom: 60}}>{portrait}</div> : null}
      {quote}
    </Stage>
  );
};

/* ======================= footage ======================= */

/**
 * footage — đoạn phim tư liệu (mp4 trong assets/, nguồn public domain / CC — ghi sources.json), tắt tiếng gốc.
 * style: "full" (tràn khung, phủ tối nhẹ) | "print" (khung phim trên giấy, nghiêng — như ảnh polaroid).
 * props: src, start? (giây bắt đầu trong file), rate? (tốc độ phát), style?, treat? (bw|sepia|faded…), kicker?, text?, caption?, credit?
 */
export const FootageScene: React.FC<{scene: Scene}> = ({scene}) => {
  const {src, start = 0, rate = 1, style = 'full', treat = 'faded', kicker, text, caption, credit} = scene.props;
  const {fps} = useVideoConfig();
  const frame = useCurrentFrame();
  const f = useFormat();
  const dark = useContext(DarkContext);
  const e = useSlap(0, 15);
  const txt = useEnter(14);
  const zoom = 1.04 + 0.06 * clamp01(frame, 0, scene.durationInFrames);
  const vid = (
    <OffthreadVideo src={imgSrc(src)} startFrom={Math.round(start * fps)} playbackRate={rate} muted style={{width: '100%', height: '100%', objectFit: 'cover', filter: TREAT[treat] ?? treat, transform: `scale(${zoom})`}} />
  );
  const cap = (
    <>
      {text ? <Heading text={text} size={f.wide ? 66 : 60} delay={14} /> : null}
      {credit ? <div style={{marginTop: 12, fontFamily: fonts.mono, fontSize: 22, color: dark || style === 'full' ? '#CFC9BC' : colors.inkSoft, opacity: txt}}>Phim: {credit}</div> : null}
    </>
  );
  if (style === 'full') {
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{overflow: 'hidden'}}>{vid}</AbsoluteFill>
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.3), rgba(0,0,0,0) 30%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.6))'}} />
        <DarkContext.Provider value>
          <Stage align="top">
            <Kicker text={kicker} />
            {cap}
          </Stage>
        </DarkContext.Provider>
      </AbsoluteFill>
    );
  }
  const w = f.wide ? 1040 : 900;
  const h = Math.round((w * 9) / 16);
  const frameEl = (
    <div style={{position: 'relative', transform: `translateY(${(1 - e) * -100}px) scale(${1.1 - 0.1 * e}) rotate(-1.5deg)`, opacity: Math.min(1, e * 3), filter: 'drop-shadow(0 22px 26px rgba(0,0,0,0.5))'}}>
      <div style={{background: '#141414', padding: '22px 22px 46px'}}>
        <div style={{width: w, height: h, overflow: 'hidden', background: '#000'}}>{vid}</div>
        {caption ? <div style={{position: 'absolute', left: 0, right: 0, bottom: 8, textAlign: 'center', fontFamily: fonts.mono, fontSize: 24, color: '#DCD6C8'}}>{caption}</div> : null}
      </div>
      <Tape seed="ft" w={200} h={56} rot={-5} style={{top: -26, left: '50%', marginLeft: -100}} />
    </div>
  );
  if (f.wide && text) {
    return (
      <>
        <Sfx name="paper" at={0} />
        <Split side={frameEl} sideWidth={w + 60} reverse>
          <Kicker text={kicker} />
          {cap}
        </Split>
      </>
    );
  }
  return (
    <Stage>
      <Sfx name="paper" at={0} />
      <Kicker text={kicker} />
      <div style={{alignSelf: 'center'}}>{frameEl}</div>
      <div style={{marginTop: 34}}>{cap}</div>
    </Stage>
  );
};
