import React, {useContext} from 'react';
import {AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {geoMercator, geoPath} from 'd3-geo';
import {feature} from 'topojson-client';
import {evolvePath} from '@remotion/paths';
import world from 'world-atlas/countries-50m.json';
import {Scene} from '../types';
import {colors, fonts} from '../theme';
import {clamp01, easeInOut, onTwos} from '../ui/anim';
import {Layer, layerFrame, Layers} from '../ui/Layers';
import {curvePath, imgSrc, Tag, Tape, TREAT} from '../ui/collage';
import {DarkContext, RichText} from '../ui/RichText';
import {Sfx} from '../ui/Sfx';

/* ======================= collage ======================= */

/**
 * collage — "một tấm poster cắt dán cho mỗi nhịp lời": tự do đặt ảnh sticker, polaroid, nhãn giấy xé, số lớn,
 * chữ cắt rời, mũi tên, dây nối… theo toạ độ khung đang render (1080×1920 | 1920×1080), mỗi lớp hiện đúng lúc lời đọc chạm `cue`.
 * props: layers: Layer[], camera?, handheld?
 */
export const CollageScene: React.FC<{scene: Scene}> = ({scene}) => (
  <AbsoluteFill>
    <Layers layers={scene.props.layers ?? []} dur={scene.durationInFrames} />
  </AbsoluteFill>
);

/* ======================= map ======================= */

type LonLat = [number, number];

// Đường biên tính sẵn một lần ở tỉ lệ khung dọc (rộng 1080); khung ngang nhân thêm W/BASE_W vào zoom
// → zoom 1 ở mọi định dạng = cả thế giới rộng bằng khung.
const BASE_W = 1080;
const S0 = BASE_W / (2 * Math.PI);
const proj = geoMercator().scale(S0).translate([0, 0]).precision(0.2);
const pathGen = geoPath(proj);

const FEATURES = (feature(world as any, (world as any).objects.countries) as any).features.filter((f: any) => f.id !== '010');
const PATHS: {id: string; name: string; d: string}[] = FEATURES.map((f: any) => ({id: String(f.id), name: f.properties.name, d: pathGen(f) ?? ''}));

const ALIAS: Record<string, string> = {
  'việt nam': 'Vietnam',
  'viet nam': 'Vietnam',
  pháp: 'France',
  'trung quốc': 'China',
  mỹ: 'United States of America',
  usa: 'United States of America',
  'hoa kỳ': 'United States of America',
  'nhật bản': 'Japan',
  'hàn quốc': 'South Korea',
  lào: 'Laos',
  campuchia: 'Cambodia',
  'thái lan': 'Thailand',
  'ấn độ': 'India',
  anh: 'United Kingdom',
  đức: 'Germany',
  nga: 'Russia',
  'in-đô-nê-xi-a': 'Indonesia',
  indonesia: 'Indonesia',
  brazil: 'Brazil',
  colombia: 'Colombia',
  ethiopia: 'Ethiopia',
  singapore: 'Singapore',
  malaysia: 'Malaysia',
  philippines: 'Philippines',
};
const findCountry = (q: string | number) => {
  const s = String(q).trim();
  const name = ALIAS[s.toLowerCase()] ?? s;
  return PATHS.find((p) => p.id === s || p.name.toLowerCase() === name.toLowerCase());
};

/** Hoàng Sa, Trường Sa — luôn vẽ cùng màu Việt Nam (Natural Earth không có hai quần đảo này). */
const HOANG_SA: LonLat[] = [[112.33, 16.83], [111.6, 16.53], [111.75, 16.45], [111.62, 17.0], [112.25, 16.6], [111.2, 15.78]];
const TRUONG_SA: LonLat[] = [[111.92, 8.64], [114.36, 10.38], [114.28, 11.05], [115.5, 9.9], [112.5, 8.8], [113.85, 7.9], [114.9, 10.9], [112.9, 9.6]];

type View = {center?: LonLat; zoom?: number; move?: number; atMs?: number; at?: number};

const useMapCam = (views: View[], dur: number) => {
  const frame = useCurrentFrame();
  const {fps, width: W, height: H} = useVideoConfig();
  const first = views[0] ?? {};
  const p0 = proj(first.center ?? [106, 16]) as [number, number];
  let cur = {x: p0[0], y: p0[1], z: first.zoom ?? 6};
  for (let i = 1; i < views.length; i++) {
    const v = views[i];
    const at = layerFrame(v, fps, Math.round((dur * i) / views.length));
    if (frame <= at) break;
    const p = easeInOut(Math.min(1, (frame - at) / (v.move ?? 28)));
    const q = proj(v.center ?? [0, 0]) as [number, number];
    const nz = v.zoom ?? cur.z;
    cur = {x: cur.x + (q[0] - cur.x) * p, y: cur.y + (q[1] - cur.y) * p, z: Math.exp(Math.log(cur.z) + (Math.log(nz) - Math.log(cur.z)) * p)};
  }
  const z = cur.z * (1 + 0.03 * (frame / Math.max(1, dur))) * (W / BASE_W);
  const toScreen = (ll: LonLat): [number, number] => {
    const p = proj(ll) as [number, number];
    return [(p[0] - cur.x) * z + W / 2, (p[1] - cur.y) * z + H / 2];
  };
  return {x: cur.x, y: cur.y, z, toScreen, W, H};
};

/**
 * map — bản đồ thế giới (Natural Earth, public domain) có máy lia/zoom theo lời, tô đỏ quốc gia, ghim, đường đi nét đứt.
 * props: views: [{center: [kinh, vĩ], zoom, cue?}], highlight: [{country, color?, cue?, lift?}],
 *        points: [{at: [kinh, vĩ], label?, cue?, dot?}], routes: [{from, to, cue?, bend?, color?}],
 *        layers?: Layer[] (lớp cắt dán toạ độ màn hình — vd chân dung tách nền đặt trên bản đồ), land?, sea? (màu)
 */
export const MapScene: React.FC<{scene: Scene}> = ({scene}) => {
  const {views = [], highlight = [], points = [], routes = [], layers = [], land = '#EEEBE4', border = '#AFA99F'} = scene.props;
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cam = useMapCam(views, scene.durationInFrames);
  const {W, H} = cam;
  const g = `translate(${W / 2} ${H / 2}) scale(${cam.z}) translate(${-cam.x} ${-cam.y})`;
  const hl = (highlight as any[])
    .map((h, i) => ({...h, path: findCountry(h.country), at: layerFrame(h, fps, 8 + i * 6)}))
    .filter((h) => h.path);
  const vn = hl.find((h) => h.path.name === 'Vietnam');
  const vnP = vn ? clamp01(onTwos(frame), vn.at, vn.at + 8) : 0;
  const vnColor = vn ? vn.color ?? colors.red : land;
  const islandFill = vn && vnP > 0.5 ? vnColor : '#C9C3B8';
  const sfx: React.ReactNode[] = [];

  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <defs>
          <filter id="lift" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000" floodOpacity="0.45" />
          </filter>
          <filter id="landsh" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.18" />
          </filter>
        </defs>
        <g transform={g}>
          <g filter="url(#landsh)">
            {PATHS.map((p) => (
              <path key={p.id + p.name} d={p.d} fill={land} stroke={border} strokeWidth={1.1} vectorEffect="non-scaling-stroke" />
            ))}
          </g>
          {hl.map((h, i) => {
            const p = clamp01(onTwos(frame), h.at, h.at + 8);
            if (i === 0 || hl[i - 1].at !== h.at) sfx.push(<Sfx key={`h${i}`} name="pop" at={h.at} />);
            if (p <= 0) return null;
            const lift = h.lift === false ? 0 : 5 * p;
            return (
              <g key={i} filter={h.lift === false ? undefined : 'url(#lift)'} transform={`translate(0 ${-lift / cam.z})`}>
                <path d={h.path.d} fill={h.color ?? colors.red} fillOpacity={p} stroke="#7A1015" strokeWidth={1.2} strokeOpacity={p} vectorEffect="non-scaling-stroke" />
              </g>
            );
          })}
        </g>
        {/* hai quần đảo của Việt Nam: chấm theo toạ độ màn hình để luôn nhìn thấy */}
        {[...HOANG_SA, ...TRUONG_SA].map((ll, i) => {
          const [x, y] = cam.toScreen(ll);
          return <circle key={i} cx={x} cy={y} r={Math.max(2.2, Math.min(6, cam.z * 0.18))} fill={islandFill} stroke="#00000033" strokeWidth={1} />;
        })}
        {routes.map((r: any, i: number) => {
          const at = layerFrame(r, fps, 10 + i * 8);
          const p = interpolate(onTwos(frame), [at, at + (r.drawFrames ?? 22)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeInOut});
          sfx.push(<Sfx key={`r${i}`} name="swish" at={at} />);
          if (p <= 0) return null;
          const {d} = curvePath(cam.toScreen(r.from), cam.toScreen(r.to), r.bend ?? -0.25);
          const ev = evolvePath(p, d);
          return (
            <g key={i}>
              <mask id={`rm${i}`}>
                <path d={d} stroke="#fff" strokeWidth={20} fill="none" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />
              </mask>
              <path d={d} stroke={r.color ?? colors.ink} strokeWidth={7} fill="none" strokeDasharray="4 18" strokeLinecap="round" mask={`url(#rm${i})`} />
            </g>
          );
        })}
      </svg>
      {cam.z >= 2.5 && (vn || scene.props.islandLabels)
        ? [
            {ll: [112.0, 16.95] as LonLat, t: 'QĐ. Hoàng Sa'},
            {ll: [113.4, 9.4] as LonLat, t: 'QĐ. Trường Sa'},
          ].map((it, i) => {
            const [x, y] = cam.toScreen(it.ll);
            return (
              <div key={i} style={{position: 'absolute', left: x + 14, top: y - 40, fontFamily: fonts.sans, fontWeight: 700, fontSize: 24, color: '#3A3A3A', opacity: 0.85}}>
                {it.t}
              </div>
            );
          })
        : null}
      {points.map((pt: any, i: number) => {
        const at = layerFrame(pt, fps, 12 + i * 8);
        sfx.push(<Sfx key={`p${i}`} name={pt.label ? 'click' : 'pop'} at={at} />);
        if (frame < at) return null;
        const p = clamp01(onTwos(frame), at, at + 6);
        const [x, y] = cam.toScreen(pt.at);
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y, opacity: p}}>
            {pt.dot === false ? null : (
              <div style={{position: 'absolute', left: -13, top: -13, width: 26, height: 26, borderRadius: '50%', background: pt.color ?? colors.ink, border: '5px solid #fff', boxShadow: '0 4px 8px rgba(0,0,0,0.4)', transform: `scale(${p})`}} />
            )}
            {pt.label ? (
              <div style={{position: 'absolute', left: pt.side === 'left' ? undefined : 26, right: pt.side === 'left' ? 26 : undefined, top: -34, whiteSpace: 'nowrap', transform: `scale(${0.85 + 0.15 * p})`}}>
                <Tag text={pt.label} size={pt.size ?? 38} color={pt.tagColor ?? 'black'} />
              </div>
            ) : null}
          </div>
        );
      })}
      <Layers layers={layers as Layer[]} dur={scene.durationInFrames} />
      {sfx}
    </AbsoluteFill>
  );
};

/* ======================= document ======================= */

/**
 * document — trích đoạn tài liệu/báo cáo/bài báo THẬT, nghiêng 3D, bút dạ quang quét câu then chốt đúng lúc đọc,
 * các đoạn khác mờ đi. KHÔNG bịa tiêu đề báo; không vẽ logo toà soạn — `outlet` chỉ là chữ thường.
 * props: outlet, date?, headline, paragraphs: [string | {text, cue?}] (==câu== = đoạn được quét), image?, caption?,
 *        treat?, tilt? (độ, mặc định -6), paper? ('white' | 'news')
 */
export const DocumentScene: React.FC<{scene: Scene}> = ({scene}) => {
  const {outlet, date, headline, paragraphs = [], image, caption, treat = 'bw', tilt = -6, paper = 'news', tape = true} = scene.props;
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const wide = width > height;
  const dark = useContext(DarkContext);
  const paras = (paragraphs as any[]).map((p, i) => {
    const o = typeof p === 'string' ? {text: p} : p;
    return {...o, at: layerFrame(o, fps, 18 + i * 14), hl: /==/.test(o.text)};
  });
  const firstHl = paras.filter((p) => p.hl).reduce((m, p) => Math.min(m, p.at), Infinity);
  const dim = clamp01(frame, firstHl + 4, firstHl + 14);
  const e = clamp01(onTwos(frame), 0, 10);
  const bg = paper === 'white' ? '#F8F6F1' : '#ECE8DE';
  const rx = interpolate(frame, [0, scene.durationInFrames], [14, 9]);
  return (
    <AbsoluteFill style={{perspective: 1700, justifyContent: 'center', alignItems: 'center'}}>
      <div
        style={{
          // khung ngang: tờ báo rộng hơn, căn giữa khung
          width: wide ? 1180 : 880,
          marginTop: wide ? 0 : -330,
          transform: `rotateX(${rx}deg) rotateZ(${tilt}deg) translateY(${(1 - easeInOut(e)) * 500}px)`,
          transformStyle: 'preserve-3d',
          filter: `drop-shadow(0 30px 40px rgba(0,0,0,${dark ? 0.6 : 0.3}))`,
        }}
      >
        <div style={{background: bg, backgroundImage: 'linear-gradient(170deg, rgba(255,255,255,0.4), rgba(0,0,0,0.06))', padding: '44px 54px 54px', position: 'relative'}}>
          {outlet ? (
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '3px solid #222', paddingBottom: 12, marginBottom: 22}}>
              <div style={{fontFamily: fonts.serif, fontWeight: 900, fontSize: 40, color: '#1A1A1A'}}>{outlet}</div>
              {date ? <div style={{fontFamily: fonts.mono, fontSize: 22, color: '#555'}}>{date}</div> : null}
            </div>
          ) : null}
          {headline ? (
            <div style={{fontFamily: fonts.serif, fontWeight: 900, fontSize: wide ? 66 : 56, lineHeight: 1.1, color: '#111', marginBottom: 18, opacity: 1 - dim * 0.5}}>{headline}</div>
          ) : null}
          {image ? (
            <div style={{height: 260, overflow: 'hidden', marginBottom: 14, opacity: 1 - dim * 0.55}}>
              <Img src={imgSrc(image)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: TREAT[treat] ?? treat, transform: `scale(${1.05 + 0.08 * clamp01(frame, 0, scene.durationInFrames)})`}} />
            </div>
          ) : null}
          {caption ? <div style={{fontFamily: fonts.mono, fontSize: 20, color: '#555', marginBottom: 18, opacity: 1 - dim * 0.5}}>{caption}</div> : null}
          {paras.map((p, i) => (
            <div
              key={i}
              style={{
                fontFamily: fonts.serif,
                fontWeight: 700,
                fontSize: wide ? 42 : 35,
                lineHeight: 1.4,
                color: '#222',
                marginBottom: 16,
                opacity: p.hl ? 1 : 1 - 0.62 * dim,
              }}
            >
              <RichText text={p.text} delay={p.at} />
            </div>
          ))}
          {tape ? <Tape seed="doc" w={240} h={60} rot={-3} style={{top: -28, left: 60}} /> : null}
        </div>
      </div>
      {paras.filter((p) => p.hl).map((p, i) => (
        <Sfx key={i} name="marker" at={p.at} />
      ))}
    </AbsoluteFill>
  );
};
