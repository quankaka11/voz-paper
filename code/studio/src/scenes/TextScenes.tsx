import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {Scene} from '../types';
import {colors, fonts} from '../theme';
import {Heading, Kicker, Stage, useRevealFrame} from '../ui/layout';
import {useEnter} from '../ui/anim';
import {RichText} from '../ui/RichText';
import {Logo} from '../ui/Logo';

/** title — câu hook / câu hỏi trung tâm. props: kicker?, text, sub?, emoji?, size? */
export const TitleScene: React.FC<{scene: Scene}> = ({scene}) => {
  const {kicker, text, sub, emoji, size} = scene.props;
  const e = useEnter(4, 12);
  const s = useEnter(22);
  return (
    <Stage>
      {emoji ? (
        <div style={{fontSize: 170, marginBottom: 24, transform: `scale(${e})`, transformOrigin: 'left bottom'}}>{emoji}</div>
      ) : null}
      <Kicker text={kicker} />
      <Heading text={text} size={size ?? 104} delay={2} />
      {sub ? (
        <div
          style={{
            marginTop: 34,
            fontFamily: fonts.sans,
            fontWeight: 500,
            fontSize: 44,
            lineHeight: 1.35,
            color: colors.inkSoft,
            opacity: s,
          }}
        >
          <RichText text={sub} delay={30} />
        </div>
      ) : null}
    </Stage>
  );
};

/** bigNumber — một con số lớn. props: kicker?, value | countTo(+prefix/suffix/decimals), label, note?, color? */
export const BigNumberScene: React.FC<{scene: Scene}> = ({scene}) => {
  const {kicker, value, countTo, prefix = '', suffix = '', decimals = 0, label, note, color} = scene.props;
  const frame = useCurrentFrame();
  const p = useEnter(4);
  const n = interpolate(frame, [6, 36], [0, countTo ?? 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const shown =
    typeof countTo === 'number'
      ? `${prefix}${n.toLocaleString('vi-VN', {minimumFractionDigits: decimals, maximumFractionDigits: decimals})}${suffix}`
      : value;
  const l = useEnter(20);
  return (
    <Stage>
      <Kicker text={kicker} />
      <div
        style={{
          fontFamily: fonts.condensed,
          fontWeight: 700,
          fontSize: shown && String(shown).length > 8 ? 190 : 250,
          lineHeight: 1,
          color: color ?? colors.coral,
          transform: `scale(${0.85 + 0.15 * p})`,
          transformOrigin: 'left center',
          opacity: p,
        }}
      >
        {shown}
      </div>
      <div style={{marginTop: 28, fontFamily: fonts.serif, fontWeight: 700, fontSize: 64, lineHeight: 1.2, color: colors.ink, opacity: l}}>
        <RichText text={label ?? ''} delay={26} />
      </div>
      {note ? (
        <div style={{marginTop: 24, fontFamily: fonts.hand, fontSize: 46, color: colors.inkSoft, opacity: l}}>{note}</div>
      ) : null}
    </Stage>
  );
};

/** list — danh sách ý. props: kicker?, title?, items: [{emoji?, text, atMs?}] */
export const ListScene: React.FC<{scene: Scene}> = ({scene}) => {
  const {kicker, title, items = []} = scene.props;
  const reveal = useRevealFrame(scene.durationInFrames);
  const frame = useCurrentFrame();
  return (
    <Stage>
      <Kicker text={kicker} />
      {title ? <Heading text={title} size={78} /> : null}
      <div style={{marginTop: 36, display: 'flex', flexDirection: 'column', gap: 26}}>
        {items.map((it: any, i: number) => {
          const at = reveal(it, i, items.length, 14);
          const p = interpolate(frame, [at, at + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 26,
                opacity: p,
                transform: `translateX(${(1 - p) * 60}px)`,
                background: colors.white,
                borderLeft: `12px solid ${it.color ?? colors.yellow}`,
                padding: '22px 28px',
                boxShadow: '0 6px 0 rgba(22,24,29,0.12)',
              }}
            >
              <div style={{fontSize: 64, width: 80, textAlign: 'center'}}>{it.emoji ?? `${i + 1}`}</div>
              <div style={{fontFamily: fonts.sans, fontWeight: 700, fontSize: 52, lineHeight: 1.25, color: colors.ink}}>
                <RichText text={it.text} delay={at + 6} />
              </div>
            </div>
          );
        })}
      </div>
    </Stage>
  );
};

/** question — kết bài, câu hỏi mở cho bình luận (nền navy). props: text, options?: string[], sub? */
export const QuestionScene: React.FC<{scene: Scene}> = ({scene}) => {
  const {text, options = [], sub} = scene.props;
  const frame = useCurrentFrame();
  const reveal = useRevealFrame(scene.durationInFrames);
  const lg = useEnter(Math.max(0, scene.durationInFrames - 40));
  return (
    <Stage>
      <Kicker text={sub ?? 'Còn bạn thì sao?'} dark />
      <Heading text={text} size={88} dark />
      <div style={{marginTop: 44, display: 'flex', flexDirection: 'column', gap: 22}}>
        {options.map((o: string, i: number) => {
          const at = reveal(undefined, i, options.length, 24, 0.5);
          const p = interpolate(frame, [at, at + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          return (
            <div
              key={i}
              style={{
                fontFamily: fonts.sans,
                fontWeight: 700,
                fontSize: 46,
                color: colors.navy,
                background: colors.paper,
                padding: '18px 28px',
                borderRadius: 14,
                opacity: p,
                transform: `translateY(${(1 - p) * 30}px)`,
              }}
            >
              <span style={{color: colors.coral, marginRight: 18}}>{String.fromCharCode(65 + i)}</span>
              {o}
            </div>
          );
        })}
      </div>
      <div style={{marginTop: 56, opacity: lg, display: 'flex', alignItems: 'center', gap: 24}}>
        <Logo size={70} dark />
        <div style={{fontFamily: fonts.sans, fontWeight: 500, fontSize: 34, color: colors.paper}}>
          Theo dõi để xem tập tiếp theo
        </div>
      </div>
    </Stage>
  );
};
