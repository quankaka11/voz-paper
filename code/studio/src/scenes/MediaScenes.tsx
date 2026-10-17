import React from 'react';
import {Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Scene} from '../types';
import {colors, fonts} from '../theme';
import {Heading, Kicker, Stage, useRevealFrame} from '../ui/layout';
import {useEnter} from '../ui/anim';
import {RichText} from '../ui/RichText';

const clampI = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const src = (s: string) => (/^https?:/.test(s) ? s : staticFile(s));

/**
 * image — ảnh minh họa có Ken Burns.
 * style: "polaroid" (khung giấy + băng dính, nghiêng) | "cutout" (PNG đã tách nền, viền trắng) | "full" (tràn khung)
 * props: src, style?, kenburns?: in|out|left|right, kicker?, text?, credit?
 */
export const ImageScene: React.FC<{scene: Scene}> = ({scene}) => {
  const {src: s, style = 'polaroid', kenburns = 'in', kicker, text, credit, tilt = -2.5} = scene.props;
  const frame = useCurrentFrame();
  const d = scene.durationInFrames;
  const t = clampI(frame, 0, d);
  const scale = kenburns === 'out' ? 1.15 - 0.15 * t : 1 + 0.15 * t;
  const tx = kenburns === 'left' ? -40 * t : kenburns === 'right' ? 40 * t : 0;
  const e = useEnter(0, 14);
  const txt = useEnter(14);

  const caption = (
    <>
      {text ? (
        <div style={{marginTop: 40, opacity: txt}}>
          <Heading text={text} size={60} delay={14} />
        </div>
      ) : null}
      {credit ? (
        <div style={{marginTop: 14, fontFamily: fonts.sans, fontSize: 24, color: colors.inkSoft, opacity: txt}}>Ảnh: {credit}</div>
      ) : null}
    </>
  );

  if (style === 'cutout') {
    return (
      <Stage>
        <Kicker text={kicker} />
        <div style={{display: 'flex', justifyContent: 'center', transform: `translateY(${(1 - e) * 200}px) rotate(${tilt * e}deg)`}}>
          <Img
            src={src(s)}
            style={{
              maxWidth: 820,
              maxHeight: 640,
              transform: `scale(${scale}) translateX(${tx}px)`,
              filter:
                'drop-shadow(5px 0 0 #fff) drop-shadow(-5px 0 0 #fff) drop-shadow(0 5px 0 #fff) drop-shadow(0 -5px 0 #fff) drop-shadow(0 18px 20px rgba(0,0,0,0.3))',
            }}
          />
        </div>
        {caption}
      </Stage>
    );
  }

  if (style === 'full') {
    return (
      <Stage>
        <Kicker text={kicker} />
        <div style={{width: '100%', height: 760, overflow: 'hidden', borderRadius: 8, opacity: e}}>
          <Img src={src(s)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale}) translateX(${tx}px)`}} />
        </div>
        {caption}
      </Stage>
    );
  }

  return (
    <Stage>
      <Kicker text={kicker} />
      <div
        style={{
          alignSelf: 'center',
          position: 'relative',
          background: '#fff',
          padding: '22px 22px 70px',
          boxShadow: '0 22px 40px rgba(0,0,0,0.25)',
          transform: `translateY(${(1 - e) * 220}px) rotate(${tilt * e}deg)`,
        }}
      >
        <div style={{width: 700, height: 560, overflow: 'hidden'}}>
          <Img src={src(s)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale}) translateX(${tx}px)`}} />
        </div>
        <div
          style={{
            position: 'absolute',
            top: -26,
            left: '50%',
            width: 200,
            height: 56,
            background: 'rgba(255,201,60,0.75)',
            transform: 'translateX(-50%) rotate(-4deg)',
          }}
        />
      </div>
      {caption}
    </Stage>
  );
};

/**
 * phone — điện thoại mô phỏng giao diện app (không dùng logo thật).
 * props: app, price?, tagline?, rows?: [{emoji, label, value?, atMs?}], stamp?, kicker?, title?
 */
export const PhoneScene: React.FC<{scene: Scene}> = ({scene}) => {
  const {app = 'Ứng dụng', price, tagline, rows = [], stamp, kicker, title} = scene.props;
  const frame = useCurrentFrame();
  const reveal = useRevealFrame(scene.durationInFrames);
  const e = useEnter(0, 16);
  const st = useEnter(Math.round(scene.durationInFrames * 0.45), 10);
  return (
    <Stage>
      <Kicker text={kicker} />
      {title ? (
        <div style={{marginBottom: 30}}>
          <Heading text={title} size={60} />
        </div>
      ) : null}
      <div style={{alignSelf: 'center', position: 'relative', transform: `translateY(${(1 - e) * 300}px)`}}>
        <div
          style={{
            width: 560,
            height: title ? 780 : 920,
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
    </Stage>
  );
};
