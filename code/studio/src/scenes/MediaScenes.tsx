import React, {useContext} from 'react';
import {AbsoluteFill, Img, interpolate, useCurrentFrame} from 'remotion';
import {Scene} from '../types';
import {colors, fonts} from '../theme';
import {Heading, Kicker, Split, Stage, useRevealFrame} from '../ui/layout';
import {useFormat} from '../ui/format';
import {useEnter, useSlap} from '../ui/anim';
import {imgSrc, Photo, Sticker, TREAT} from '../ui/collage';
import {DarkContext} from '../ui/RichText';
import {Sfx} from '../ui/Sfx';
import {RichText} from '../ui/RichText';

const clampI = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});


/**
 * image — một ảnh minh họa có Ken Burns.
 * style: "polaroid" (khung giấy + băng dính, nghiêng) | "cutout" (PNG đã tách nền, viền trắng sticker) | "full" (tràn khung)
 * props: src, style?, kenburns?: in|out|left|right, kicker?, text?, caption?, credit?, tilt?, treat? (color|bw|sepia|faded)
 * Khung ngang: có `text` thì chữ cột trái, ảnh cột phải.
 */
export const ImageScene: React.FC<{scene: Scene}> = ({scene}) => {
  const {src: s, style = 'polaroid', kenburns = 'in', kicker, text, credit, caption, tilt = -2.5, treat = 'color'} = scene.props;
  const frame = useCurrentFrame();
  const dark = useContext(DarkContext);
  const d = scene.durationInFrames;
  const t = clampI(frame, 0, d);
  const scale = kenburns === 'out' ? 1.15 - 0.15 * t : 1 + 0.15 * t;
  const tx = kenburns === 'left' ? -40 * t : kenburns === 'right' ? 40 * t : 0;
  const e = useSlap(0, 14);
  const txt = useEnter(14);
  const f = useFormat();

  const cap = (
    <>
      {text ? (
        <div style={{marginTop: 40, opacity: txt}}>
          <Heading text={text} size={60} delay={14} />
        </div>
      ) : null}
      {credit ? (
        <div style={{marginTop: 14, fontFamily: fonts.mono, fontSize: 22, color: dark ? '#CFC9BC' : colors.inkSoft, opacity: txt}}>Ảnh: {credit}</div>
      ) : null}
    </>
  );

  if (style === 'full') {
    return (
      <AbsoluteFill>
        <Img src={imgSrc(s)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: TREAT[treat] ?? treat, transform: `scale(${scale}) translateX(${tx}px)`}} />
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0) 30%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55))'}} />
        <DarkContext.Provider value>
          <Stage align="top">
            <Kicker text={kicker} />
            {cap}
          </Stage>
        </DarkContext.Provider>
      </AbsoluteFill>
    );
  }

  const pic = (
    <div style={{display: 'flex', justifyContent: 'center', transform: `translateY(${(1 - e) * -120}px) scale(${1.12 - 0.12 * e}) rotate(${tilt}deg)`, opacity: Math.min(1, e * 3)}}>
      {style === 'cutout' ? (
        <div style={{maxWidth: f.wide ? 900 : 860}}>
          <Sticker src={s} w={f.wide ? 860 : 820} h={f.wide ? 620 : 680} treat={treat} zoom={scale} />
        </div>
      ) : (
        <Photo src={s} w={f.wide ? 820 : 700} h={f.wide ? 580 : 560} caption={caption} treat={treat} zoom={scale} pan={tx} />
      )}
    </div>
  );
  if (f.wide && text) {
    return (
      <>
        <Sfx name="paper" at={0} />
        <Split side={pic} sideWidth={900} reverse>
          <Kicker text={kicker} />
          {cap}
        </Split>
      </>
    );
  }
  return (
    <Stage>
      <Kicker text={kicker} />
      <Sfx name="paper" at={0} />
      {pic}
      {cap}
    </Stage>
  );
};

/**
 * phone — điện thoại mô phỏng giao diện app (không dùng logo thật).
 * props: app, price?, tagline?, rows?: [{emoji, label, value?, atMs?}], stamp?, kicker?, title?
 * Khung ngang: tiêu đề cột trái, điện thoại cột phải (thấp hơn để vừa chiều cao 1080).
 */
export const PhoneScene: React.FC<{scene: Scene}> = ({scene}) => {
  const {app = 'Ứng dụng', price, tagline, rows = [], stamp, kicker, title} = scene.props;
  const frame = useCurrentFrame();
  const reveal = useRevealFrame(scene.durationInFrames);
  const e = useEnter(0, 16);
  const st = useEnter(Math.round(scene.durationInFrames * 0.45), 10);
  const f = useFormat();
  const phone = (
      <div style={{alignSelf: 'center', position: 'relative', transform: `translateY(${(1 - e) * 300}px)`}}>
        <div
          style={{
            width: f.wide ? 540 : 560,
            height: f.wide ? 720 : title ? 780 : 920,
            background: colors.ink,
            borderRadius: 64,
            padding: 18,
            boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
          }}
        >
          <div style={{width: '100%', height: '100%', background: '#fff', borderRadius: 48, overflow: 'hidden', fontFamily: fonts.sans}}>
            <div style={{height: 40, display: 'flex', justifyContent: 'center', paddingTop: 12}}>
              <div style={{width: 130, height: 26, background: colors.ink, borderRadius: 20}} />
            </div>
            <div style={{padding: '18px 30px'}}>
              <div style={{fontWeight: 800, fontSize: 48, color: colors.navy}}>{app}</div>
              {tagline ? <div style={{fontSize: 26, color: colors.inkSoft, marginTop: 4}}>{tagline}</div> : null}
              {price ? (
                <div
                  style={{
                    marginTop: 18,
                    display: 'inline-block',
                    background: colors.teal,
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: 44,
                    padding: '8px 26px',
                    borderRadius: 40,
                  }}
                >
                  {price}
                </div>
              ) : null}
              <div style={{marginTop: 24, display: 'flex', flexDirection: 'column', gap: 14}}>
                {rows.map((r: any, i: number) => {
                  const at = reveal(r, i, rows.length, 12, 0.6);
                  const p = clampI(frame, at, at + 8);
                  return (
                    <React.Fragment key={i}>
                    <Sfx name="pop" at={at} />
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        padding: '14px 16px',
                        background: r.highlight ? colors.yellow : '#F4F4F4',
                        borderRadius: 16,
                        opacity: p,
                        transform: `translateY(${(1 - p) * 20}px)`,
                        fontSize: 36,
                        fontWeight: 700,
                        color: colors.ink,
                      }}
                    >
                      <span style={{fontSize: 48}}>{r.emoji}</span>
                      <span style={{flex: 1}}>{r.label}</span>
                      {r.value ? <span style={{color: colors.coral}}>{r.value}</span> : null}
                    </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        {stamp ? (
          <div
            style={{
              position: 'absolute',
              right: -70,
              top: 120,
              transform: `rotate(12deg) scale(${1.6 - 0.6 * st})`,
              opacity: st,
              border: `8px solid ${colors.coral}`,
              color: colors.coral,
              fontFamily: fonts.condensed,
              fontWeight: 700,
              fontSize: 64,
              padding: '6px 22px',
              background: 'rgba(242,234,219,0.9)',
            }}
          >
            <RichText text={stamp} />
          </div>
        ) : null}
      </div>
  );
  if (f.wide) {
    return (
      <Split side={phone} sideWidth={640}>
        <Kicker text={kicker} />
        {title ? <Heading text={title} size={80} /> : null}
      </Split>
    );
  }
  return (
    <Stage>
      <Kicker text={kicker} />
      {title ? (
        <div style={{marginBottom: 30}}>
          <Heading text={title} size={60} />
        </div>
      ) : null}
      {phone}
    </Stage>
  );
};
