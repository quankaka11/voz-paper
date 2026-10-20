import React, {useContext} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Scene} from '../types';
import {colors, fonts} from '../theme';
import {Heading, Kicker, Stage, useRevealFrame} from '../ui/layout';
import {boil, clamp01, onTwos, useEnter, useSlap} from '../ui/anim';
import {DarkContext, RichText} from '../ui/RichText';
import {Logo} from '../ui/Logo';
import {BigNum, EmojiSticker, Label, Sticker, Torn} from '../ui/collage';
import {Sfx} from '../ui/Sfx';

/** Ảnh tách nền trồi lên từ mép dưới khung (núi, toà nhà, người) — nằm sau phụ đề, chỉ để tạo không khí. */
export const BottomImage: React.FC<{image?: any; delay?: number}> = ({image, delay = 6}) => {
  const p = useSlap(delay, 16);
  if (!image) return null;
  const im = typeof image === 'string' ? {src: image} : image;
  return (
    <>
      <div style={{position: 'absolute', left: im.x ?? 540, bottom: im.bottom ?? -30, transform: `translateX(-50%) translateY(${(1 - p) * 700}px) rotate(${im.rot ?? 0}deg)`}}>
        <Sticker src={im.src} w={im.w ?? 900} treat={im.treat ?? 'bw'} border={im.border ?? 8} />
      </div>
      <Sfx name="paper" at={delay} />
    </>
  );
};

/**
 * title — câu hook / câu hỏi trung tâm / chuyển ý.
 * props: kicker?, text (tiêu đề serif lớn) HOẶC lines (chồng nhãn giấy xé), sub?, emoji?, size?, image? (ảnh trồi từ đáy)
 */
export const TitleScene: React.FC<{scene: Scene}> = ({scene}) => {
  const {kicker, text, lines, sub, emoji, size, image} = scene.props;
  const frame = useCurrentFrame();
  const e = useSlap(4);
  const s = useEnter(22);
  const dark = useContext(DarkContext);
  const reveal = useRevealFrame(scene.durationInFrames);
  return (
    <AbsoluteFill>
      <BottomImage image={image} />
      <Stage align={image ? 'top' : 'center'} style={image ? {paddingTop: 60} : undefined}>
        {emoji ? (
          <div style={{marginBottom: 30, alignSelf: 'flex-start', transform: `scale(${e}) rotate(${-8 + boil('em', frame, 1.5)}deg)`, transformOrigin: 'left bottom'}}>
            <EmojiSticker char={emoji} size={160} />
            <Sfx name="pop" at={4} />
          </div>
        ) : null}
        <Kicker text={kicker} />
        {Array.isArray(lines) ? (
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6}}>
            {lines.map((ln: any, i: number) => {
              const line = typeof ln === 'string' ? {text: ln} : ln;
              const at = reveal(line, i, lines.length, 4, 0.35);
              const p = clamp01(onTwos(frame), at, at + 6);
              const sc = interpolate(p, [0, 0.6, 1], [1.3, 0.96, 1]);
              return (
                <div
                  key={i}
                  style={{
                    opacity: p > 0 ? 1 : 0,
                    transform: `translateX(${line.indent ?? (i % 2 ? 60 : 0)}px) rotate(${(line.rot ?? (i % 2 ? 1.6 : -2)) + boil(`l${i}`, frame, 0.3)}deg) scale(${sc})`,
                    transformOrigin: 'left center',
                  }}
                >
                  <Label text={line.text} color={line.color ?? ['kraft', 'cream', 'yellow'][i % 3]} size={line.size ?? size ?? 84} font={line.font} seed={`t-${i}-${line.text}`} />
                  <Sfx name="paper" at={at} />
                </div>
              );
            })}
          </div>
        ) : (
          <Heading text={text ?? ''} size={size ?? 104} delay={2} />
        )}
        {sub ? (
          <div style={{marginTop: 34, fontFamily: fonts.sans, fontWeight: 600, fontSize: 44, lineHeight: 1.35, color: dark ? '#D9D4C8' : colors.inkSoft, opacity: s}}>
            <RichText text={sub} delay={30} />
          </div>
        ) : null}
      </Stage>
    </AbsoluteFill>
  );
};

/**
 * bigNumber — một con số lớn.
 * props: kicker?, value | countTo(+prefix/suffix/decimals), unit?, label, note?, color?, style? (letterpress|poster|ink), image?
 */
export const BigNumberScene: React.FC<{scene: Scene}> = ({scene}) => {
  const {kicker, value, countTo, prefix = '', suffix = '', decimals = 0, unit, label, note, color, style = 'letterpress', image, size} = scene.props;
  const frame = useCurrentFrame();
  const dark = useContext(DarkContext);
  const p = useSlap(4);
  const n = interpolate(frame, [6, 34], [0, countTo ?? 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (t) => 1 - Math.pow(1 - t, 3)});
  const shown =
    typeof countTo === 'number'
      ? `${prefix}${n.toLocaleString('vi-VN', {minimumFractionDigits: decimals, maximumFractionDigits: decimals})}${suffix}`
      : String(value ?? '');
  const l = useSlap(18);
  const big = size ?? (shown.length > 7 ? 200 : shown.length > 5 ? 240 : 290);
  return (
    <AbsoluteFill>
      <BottomImage image={image} delay={10} />
      <Stage align={image ? 'top' : 'center'} style={image ? {paddingTop: 80} : undefined}>
        <Kicker text={kicker} />
        <div style={{transform: `scale(${interpolate(p, [0, 1], [1.35, 1])}) rotate(${interpolate(p, [0, 1], [-5, -1.5])}deg)`, transformOrigin: 'left center', opacity: Math.min(1, p * 3)}}>
          <BigNum text={shown} style={style} size={big} color={color ?? (style === 'ink' ? colors.coral : undefined)} unit={unit} />
        </div>
        {label ? (
          <div style={{marginTop: 24, alignSelf: 'flex-start', opacity: Math.min(1, l * 3), transform: `scale(${interpolate(l, [0, 1], [1.2, 1])}) rotate(1deg)`, transformOrigin: 'left center'}}>
            <Label text={label} color={dark ? 'yellow' : 'black'} font="serif" size={52} maxWidth={820} seed={`bn-${label}`} />
          </div>
        ) : null}
        {note ? (
          <div style={{marginTop: 22, fontFamily: fonts.hand, fontSize: 46, color: dark ? '#E9E3D5' : colors.inkSoft, opacity: clamp01(frame, 26, 34)}}>{note}</div>
        ) : null}
      </Stage>
      <Sfx name="thud" at={4} />
      {label ? <Sfx name="paper" at={18} /> : null}
    </AbsoluteFill>
  );
};

/** list — danh sách ý, mỗi ý một mảnh giấy. props: kicker?, title?, items: [{emoji?, text, color?, cue?}] */
export const ListScene: React.FC<{scene: Scene}> = ({scene}) => {
  const {kicker, title, items = []} = scene.props;
  const reveal = useRevealFrame(scene.durationInFrames);
  const frame = useCurrentFrame();
  return (
    <Stage>
      <Kicker text={kicker} />
      {title ? <Heading text={title} size={78} /> : null}
      <div style={{marginTop: 40, display: 'flex', flexDirection: 'column', gap: 24}}>
        {items.map((it: any, i: number) => {
          const at = reveal(it, i, items.length, 14);
          const p = clamp01(onTwos(frame), at, at + 8);
          const rot = (i % 2 ? 1.2 : -1.2) + boil(`li${i}`, frame, 0.25);
          return (
            <div key={i} style={{opacity: p > 0 ? 1 : 0, transform: `translateX(${(1 - p) * 120}px) rotate(${rot}deg)`}}>
              <Torn seed={`li-${i}`} bg={i % 2 ? '#F4EFE3' : '#ECE4D2'} pad="20px 30px" rough={9}>
                <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
                  {it.emoji ? (
                    <EmojiSticker char={it.emoji} size={64} />
                  ) : (
                    <div style={{fontFamily: fonts.heavy, fontSize: 70, color: it.color ?? colors.red, width: 60, textAlign: 'center'}}>{i + 1}</div>
                  )}
                  <div style={{fontFamily: fonts.sans, fontWeight: 700, fontSize: 48, lineHeight: 1.25, color: colors.ink}}>
                    <RichText text={it.text} delay={at + 6} />
                  </div>
                </div>
              </Torn>
              <Sfx name="paper" at={at} />
            </div>
          );
        })}
      </div>
    </Stage>
  );
};

/** question — kết bài, câu hỏi mở cho bình luận. props: text, options?: string[], sub?, endCard? (false khi tập có outro) */
export const QuestionScene: React.FC<{scene: Scene}> = ({scene}) => {
  const {text, options = [], sub, endCard = true} = scene.props;
  const frame = useCurrentFrame();
  const dark = useContext(DarkContext);
  const reveal = useRevealFrame(scene.durationInFrames);
  const lg = useEnter(Math.max(0, scene.durationInFrames - 40));
  return (
    <Stage>
      <Kicker text={sub ?? 'Còn bạn thì sao?'} />
      <Heading text={text} size={88} />
      <div style={{marginTop: 44, display: 'flex', flexDirection: 'column', gap: 22}}>
        {options.map((o: string, i: number) => {
          const at = reveal(undefined, i, options.length, 24, 0.5);
          const p = clamp01(onTwos(frame), at, at + 8);
          return (
            <div key={i} style={{alignSelf: 'flex-start', opacity: p > 0 ? 1 : 0, transform: `translateY(${(1 - p) * 40}px) rotate(${i % 2 ? 1 : -1}deg)`}}>
              <Torn seed={`q-${i}`} bg={i % 2 ? '#F2D43D' : '#ECE4D2'} pad="16px 30px" rough={8}>
                <div style={{fontFamily: fonts.sans, fontWeight: 800, fontSize: 46, color: colors.ink}}>
                  <span style={{fontFamily: fonts.heavy, fontWeight: 400, color: colors.red, marginRight: 20}}>{String.fromCharCode(65 + i)}</span>
                  {o}
                </div>
              </Torn>
              <Sfx name="paper" at={at} />
            </div>
          );
        })}
      </div>
      {endCard ? (
        <div style={{marginTop: 56, opacity: lg, display: 'flex', alignItems: 'center', gap: 24}}>
          <Logo size={70} dark={dark} />
          <div style={{fontFamily: fonts.sans, fontWeight: 600, fontSize: 34, color: dark ? colors.paper : colors.ink}}>Theo dõi để xem tập tiếp theo</div>
        </div>
      ) : null}
    </Stage>
  );
};
