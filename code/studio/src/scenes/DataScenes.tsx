import React, {useContext} from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {Scene} from '../types';
import {colors, fonts} from '../theme';
import {Heading, Kicker, Stage, useRevealFrame} from '../ui/layout';
import {useEnter} from '../ui/anim';
import {DarkContext, Highlight, RichText} from '../ui/RichText';
import {Tape, Torn} from '../ui/collage';
import {Sfx} from '../ui/Sfx';
import {onTwos} from '../ui/anim';

const clampI = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

/**
 * receipt — hóa đơn bóc tách từng khoản.
 * props: title, items: [{label, value, note?, color?, atMs?}], total: {label, value, atMs?}
 */
export const ReceiptScene: React.FC<{scene: Scene}> = ({scene}) => {
  const {kicker, title, items = [], total} = scene.props;
  const frame = useCurrentFrame();
  const reveal = useRevealFrame(scene.durationInFrames);
  const enter = useEnter(0);
  const totalAt = total?.atMs !== undefined ? reveal(total, 0, 1) : reveal(undefined, items.length, items.length + 1, 12, 0.7);
  const tp = clampI(frame, totalAt, totalAt + 10);
  const zig = 'polygon(' + Array.from({length: 25}, (_, i) => `${(i * 100) / 24}% ${i % 2 ? 100 : 97}%`).join(',') + ',100% 0,0 0)';
  return (
    <Stage>
      <Kicker text={kicker} />
      <div
        style={{
          alignSelf: 'center',
          width: 840,
          background: colors.white,
          padding: '44px 52px 64px',
          clipPath: zig,
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          transform: `translateY(${(1 - enter) * 120}px) rotate(${-1.2 * enter}deg)`,
          opacity: enter,
          fontFamily: fonts.sans,
          position: 'relative',
        }}
      >
        <div style={{fontFamily: fonts.condensed, fontWeight: 700, fontSize: 44, letterSpacing: 3, textAlign: 'center', color: colors.ink}}>
          {title ?? 'HÓA ĐƠN'}
        </div>
        <Sfx name="paper" at={0} />
        <div style={{borderTop: '4px dashed #bbb', margin: '22px 0'}} />
        {items.map((it: any, i: number) => {
          const at = reveal(it, i, items.length + 1, 10, 0.7);
          const p = clampI(onTwos(frame), at, at + 6);
          return (
            <div key={i} style={{opacity: p, transform: `translateX(${(1 - p) * 40}px)`, marginBottom: 18}}>
              <Sfx name="type" at={at} />
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 48, fontWeight: 700, color: colors.ink}}>
                <span>{it.label}</span>
                <span style={{color: it.color ?? (String(it.value).trim().startsWith('-') ? colors.teal : colors.ink)}}>{it.value}</span>
              </div>
              {it.note ? <div style={{fontFamily: fonts.hand, fontSize: 32, color: colors.inkSoft}}>{it.note}</div> : null}
            </div>
          );
        })}
        {total ? (
          <>
            <Sfx name="stamp" at={totalAt} />
            <div style={{borderTop: '4px solid #222', margin: '26px 0 20px', opacity: tp}} />
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 60, fontWeight: 800, opacity: tp, color: colors.ink}}>
              <span>{total.label ?? 'TỔNG'}</span>
              <Highlight delay={totalAt + 6}>
                <span style={{color: colors.coral}}>{total.value}</span>
              </Highlight>
            </div>
          </>
        ) : null}
      </div>
    </Stage>
  );
};

/**
 * bars — biểu đồ cột ngang, mỗi cột là một dải giấy xé.
 * props: kicker?, title, unit?, bars: [{label, value, display?, highlight?, cue?}], max?
 */
export const BarsScene: React.FC<{scene: Scene}> = ({scene}) => {
  const {kicker, title, unit = '', bars = [], max} = scene.props;
  const frame = useCurrentFrame();
  const dark = useContext(DarkContext);
  const reveal = useRevealFrame(scene.durationInFrames);
  const m = max ?? Math.max(...bars.map((b: any) => b.value), 1);
  const fg = dark ? colors.paper : colors.ink;
  return (
    <Stage>
      <Kicker text={kicker} />
      {title ? <Heading text={title} size={74} /> : null}
      <div style={{marginTop: 44, display: 'flex', flexDirection: 'column', gap: 30}}>
        {bars.map((b: any, i: number) => {
          const at = reveal(b, i, bars.length, 14, 0.55);
          const p = interpolate(onTwos(frame), [at, at + 20], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: (t) => 1 - Math.pow(1 - t, 3),
          });
          const w = Math.max(30, (b.value / m) * 600 * p);
          const val = b.display ?? `${(b.value * p).toLocaleString('vi-VN', {maximumFractionDigits: b.decimals ?? 0})}${unit}`;
          const bg = b.highlight ? colors.red : dark ? '#ECE4D2' : colors.navy;
          return (
            <div key={i} style={{opacity: clampI(frame, at - 4, at + 2)}}>
              <Sfx name="paper" at={at} />
              <div style={{fontFamily: fonts.sans, fontWeight: 700, fontSize: 44, color: fg, marginBottom: 10}}>{b.label}</div>
              <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
                <Torn seed={`bar-${i}`} bg={bg} rough={12} pad="0" style={{transform: `rotate(${i % 2 ? 0.6 : -0.6}deg)`}}>
                  <div style={{height: 88, width: w}} />
                </Torn>
                <div style={{fontFamily: fonts.heavy, fontSize: 70, color: b.highlight ? (dark ? colors.yellow : colors.red) : fg}}>
                  {p > 0.98 && b.display ? b.display : val}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Stage>
  );
};

/**
 * compare — hai cột đối chiếu (vd Đăng ký vs Hủy), hai tờ giấy dán băng dính.
 * props: kicker?, title?, left: {title, items: string[], tone?}, right: {title, items: string[], tone?}
 */
export const CompareScene: React.FC<{scene: Scene}> = ({scene}) => {
  const {kicker, title, left, right} = scene.props;
  const frame = useCurrentFrame();
  const reveal = useRevealFrame(scene.durationInFrames);
  const cols = [left, right];
  const n = (left?.items?.length ?? 0) + (right?.items?.length ?? 0);
  let k = 0;
  return (
    <Stage>
      <Kicker text={kicker} />
      {title ? <Heading text={title} size={74} /> : null}
      <div style={{marginTop: 50, display: 'flex', gap: 30}}>
        {cols.map((c: any, ci: number) => {
          const tone = c?.tone ?? (ci === 0 ? 'good' : 'bad');
          const accent = tone === 'good' ? colors.teal : tone === 'bad' ? colors.red : colors.navy;
          const e = clampI(onTwos(frame), ci * 4, ci * 4 + 8);
          return (
            <div key={ci} style={{flex: 1, position: 'relative', opacity: e, transform: `translateY(${(1 - e) * 80}px) rotate(${ci ? 1.4 : -1.4}deg)`}}>
              <Sfx name="paper" at={ci * 4} />
              <Torn seed={`cmp-${ci}`} bg={ci ? '#F4EFE3' : '#ECE4D2'} pad="30px 26px 34px" rough={7} style={{display: 'block'}}>
                <div style={{fontFamily: fonts.condensed, fontWeight: 700, fontSize: 52, letterSpacing: 2, textTransform: 'uppercase', color: accent, marginBottom: 18}}>{c?.title}</div>
                {(c?.items ?? []).map((it: any, i: number) => {
                  const item = typeof it === 'string' ? {text: it} : it;
                  const at = reveal(item, k++, n, 12, 0.7);
                  const p = clampI(onTwos(frame), at, at + 6);
                  return (
                    <div key={i} style={{display: 'flex', gap: 12, alignItems: 'flex-start', opacity: p, marginBottom: 14, fontFamily: fonts.sans, fontWeight: 700, fontSize: 40, lineHeight: 1.25, color: colors.ink}}>
                      <Sfx name="type" at={at} />
                      <span style={{fontFamily: fonts.heavy, color: accent, minWidth: 34}}>{i + 1}.</span>
                      <RichText text={item.text} />
                    </div>
                  );
                })}
              </Torn>
              <Tape seed={`cmpt-${ci}`} w={170} h={50} rot={ci ? 5 : -5} style={{top: -22, left: '50%', marginLeft: -85}} />
            </div>
          );
        })}
      </div>
    </Stage>
  );
};
