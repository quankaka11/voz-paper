import React, {useContext} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Scene} from '../types';
import {colors, fonts} from '../theme';
import {boil, clamp01, onTwos, useSlap} from '../ui/anim';
import {DarkContext} from '../ui/RichText';
import {Logo} from '../ui/Logo';
import {EmojiSticker, Label, Tag, Tape} from '../ui/collage';
import {layerFrame} from '../ui/Layers';
import {Sfx} from '../ui/Sfx';
import {useFormat} from '../ui/format';

/** Hàng căn giữa toàn khung: phần tử con không bị bó hẹp bề rộng như khi dùng left: 540 + translateX(-50%). */
const Row: React.FC<{top: number; children: React.ReactNode}> = ({top, children}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center'}}>{children}</div>
);

/** Lò xo "đập giấy" bắt đầu ở frame `at` (on twos), 0→1 có vượt nhẹ. */
const slapAt = (frame: number, at: number) => interpolate(onTwos(frame) - at, [0, 4, 8], [0, 1.08, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

/**
 * intro — nhịp giới thiệu kênh ngay SAU hook (~2–3s): logo đập xuống, tên series, chủ đề tập.
 * Tự chèn bởi `voz.py build` từ config/channel.json > intro (episode.json > intro để đổi chủ đề / tắt).
 * props: series?, topic (≤ 7 từ), episodeNo?, topicCue? ({cue} — lúc hiện chủ đề)
 */
export const IntroScene: React.FC<{scene: Scene}> = ({scene}) => {
  const {series, topic, episodeNo, topicCue} = scene.props;
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const dark = useContext(DarkContext);
  const s = slapAt(frame, 0);
  const lg = useSlap(3);
  const tAt = layerFrame(topicCue, fps, 12);
  const t = slapAt(frame, tAt);
  const line = clamp01(onTwos(frame), tAt + 6, tAt + 16);
  const f = useFormat();
  // khung dọc: cụm nằm nửa trên (nửa dưới dành cho phụ đề); khung ngang: căn giữa khung
  const Y = f.wide ? {series: 230, logo: 330, topic: 610} : {series: 420, logo: 560, topic: 860};
  return (
    <AbsoluteFill>
      {series ? (
        <Row top={Y.series}>
          <div style={{transform: `rotate(${-2 + boil('is', frame, 0.3)}deg) scale(${s})`, opacity: s > 0 ? 1 : 0, whiteSpace: 'nowrap'}}>
            <Tag text={episodeNo ? `${series} · Tập ${episodeNo}` : series} size={44} color={dark ? 'black' : 'red'} />
          </div>
        </Row>
      ) : null}
      <div
        style={{
          position: 'absolute',
          left: f.width / 2,
          top: Y.logo,
          transform: `translateX(-50%) rotate(${interpolate(lg, [0, 1], [-9, -2]) + boil('il', frame, 0.25)}deg) scale(${interpolate(lg, [0, 1], [1.5, 1])})`,
          opacity: Math.min(1, lg * 3),
          filter: 'drop-shadow(0 18px 22px rgba(0,0,0,0.45))',
        }}
      >
        <Logo size={190} dark={dark} />
        <Tape w={170} h={54} rot={-14} seed="it1" style={{left: -50, top: -18}} />
        <Tape w={170} h={54} rot={12} seed="it2" style={{right: -50, bottom: -14}} />
      </div>
      {topic ? (
        <Row top={Y.topic}>
          <div style={{position: 'relative', transform: `rotate(${1.5 + boil('it', frame, 0.3)}deg) scale(${t})`, opacity: t > 0 ? 1 : 0}}>
            <Label text={topic} color="cream" font="serif" size={70} maxWidth={f.wide ? 1300 : 860} align="center" seed={`intro-${topic}`} />
            <svg width={600} height={40} style={{position: 'absolute', left: '50%', bottom: -34, marginLeft: -300, overflow: 'visible'}}>
              <path d="M10 22 C 160 6, 360 34, 590 14" fill="none" stroke={colors.yellow} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - line} />
            </svg>
          </div>
        </Row>
      ) : null}
      <Sfx name="thud" at={3} />
      {topic ? <Sfx name="paper" at={tAt} /> : null}
      {topic ? <Sfx name="marker" at={tAt + 6} /> : null}
    </AbsoluteFill>
  );
};

/** Nút "Theo dõi" kiểu ứng dụng: bấm xong chuyển "Đã theo dõi ✓". */
const FollowButton: React.FC<{label: string; done: string; pressed: boolean; press: number}> = ({label, done, pressed, press}) => (
  <div
    style={{
      transform: `scale(${1 - 0.08 * press})`,
      background: pressed ? '#3A3A3D' : colors.red,
      color: '#FFF6EA',
      fontFamily: fonts.condensed,
      fontWeight: 700,
      fontSize: 62,
      letterSpacing: 3,
      textTransform: 'uppercase',
      padding: '16px 58px 18px',
      borderRadius: 18,
      boxShadow: '0 10px 0 rgba(0,0,0,0.35), 0 18px 26px rgba(0,0,0,0.35)',
      whiteSpace: 'nowrap',
    }}
  >
    {pressed ? `${done} ✓` : `+ ${label}`}
  </div>
);

/**
 * outro — thẻ kết kênh (~4–6s) sau câu hỏi A/B: kêu gọi bình luận, nút Theo dõi được bấm, chuông rung, logo + @handle.
 * Tự chèn bởi `voz.py build` từ config/channel.json > outro. Các mốc theo lời đọc: comment / follow / bell = {cue}.
 * props: name, handle, comment (chữ trên bong bóng), cta, ctaDone, tagline?, comment/follow/bell cue
 * Khung ngang (long): màn hình kết thúc YouTube — xem OutroWide.
 */
export const OutroScene: React.FC<{scene: Scene}> = ({scene}) => {
  const {wide} = useFormat();
  return wide ? <OutroWide scene={scene} /> : <OutroTall scene={scene} />;
};

/** Khung chừa chỗ cho phần tử "video" của màn hình kết thúc YouTube (toạ độ khung 1920×1080; publish.md ghi lại để đặt trong YouTube Studio). */
export const END_SLOTS = [
  {x: 1000, y: 150, w: 800, h: 450},
  {x: 1080, y: 650, w: 560, h: 315},
];

/**
 * Màn hình kết thúc video dài (16:9, ≥ 20s — YouTube cho gắn phần tử trong 5–20s cuối).
 * Trái: logo kênh, nút Đăng ký được bấm, chuông, bong bóng bình luận. Phải: 2 khung giấy trống ở đúng END_SLOTS để
 * gắn phần tử "Video/Danh sách phát". Nhãn khung: props.slots (mặc định "Xem tiếp", "Tập khác").
 */
const OutroWide: React.FC<{scene: Scene}> = ({scene}) => {
  const {handle, comment = 'Bình luận ý kiến của bạn', cta = 'Đăng ký', ctaDone = 'Đã đăng ký', tagline, cues = {}, slots = ['Xem tiếp', 'Tập khác']} = scene.props;
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const dark = useContext(DarkContext);
  const cAt = layerFrame(cues.comment, fps, 20);
  const fAt = layerFrame(cues.follow, fps, 60);
  const bAt = layerFrame(cues.bell, fps, 90);
  const avatar = useSlap(2);
  const c = slapAt(frame, cAt);
  const btnAt = Math.max(6, Math.min(fAt - 12, cAt + 14));
  const btn = slapAt(frame, btnAt);
  const hand = clamp01(onTwos(frame), fAt - 10, fAt - 2);
  const press = interpolate(frame, [fAt - 2, fAt, fAt + 4], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const pressed = frame >= fAt;
  const b = slapAt(frame, bAt);
  const ring = frame >= bAt ? Math.sin((frame - bAt) * 1.6) * 16 * Math.max(0, 1 - (frame - bAt) / 30) : 0;
  const tg = clamp01(frame, 16, 26);
  const fg = dark ? '#E9E3D5' : colors.inkSoft;
  return (
    <AbsoluteFill>
      {/* khung trống cho phần tử màn hình kết thúc */}
      {END_SLOTS.map((sl, i) => {
        const at = 8 + i * 6;
        const p = slapAt(frame, at);
        return (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', left: sl.x, top: sl.y, width: sl.w, height: sl.h, opacity: p > 0 ? 1 : 0, transform: `rotate(${i ? 1.4 : -1.2}deg) scale(${p})`}}>
              <div style={{position: 'absolute', inset: 0, background: 'rgba(14,14,14,0.55)', border: `6px dashed ${colors.paper}`, boxShadow: '0 18px 30px rgba(0,0,0,0.4)'}} />
              <div style={{position: 'absolute', left: 0, right: 0, top: '50%', transform: 'translateY(-50%)', textAlign: 'center', fontSize: sl.h * 0.3, color: 'rgba(242,234,219,0.5)'}}>▶</div>
              <Tape w={180} h={50} rot={i ? 8 : -8} seed={`es${i}`} style={{left: -40, top: -20}} />
              <div style={{position: 'absolute', left: 24, top: -46, transform: 'rotate(-2deg)'}}>
                <Tag text={slots[i] ?? ''} size={40} color={i ? 'black' : 'red'} />
              </div>
            </div>
            <Sfx name="paper" at={at} />
          </React.Fragment>
        );
      })}
      {/* bong bóng bình luận */}
      <div style={{position: 'absolute', left: 120, top: 120, display: 'flex', alignItems: 'center', gap: 16, transform: `rotate(${-2 + boil('oc', frame, 0.3)}deg) scale(${c})`, transformOrigin: 'left center', opacity: c > 0 ? 1 : 0}}>
        <EmojiSticker char="💬" size={110} />
        <Label text={comment} color="yellow" font="sans" size={50} maxWidth={620} seed="outro-c" />
      </div>
      {/* ảnh đại diện kênh — phần tử "Đăng ký" của YouTube đặt chồng lên đây */}
      <div style={{position: 'absolute', left: 300, top: 340, transform: `translateX(-50%) rotate(${interpolate(avatar, [0, 1], [-10, 2])}deg) scale(${interpolate(avatar, [0, 1], [1.4, 1])})`, opacity: Math.min(1, avatar * 3)}}>
        <div style={{width: 260, height: 260, borderRadius: '50%', overflow: 'hidden', border: '10px solid #F7F4EC', boxShadow: '0 18px 30px rgba(0,0,0,0.45)'}}>
          <Logo size={260} variant="mark" />
        </div>
      </div>
      <div style={{position: 'absolute', left: 470, top: 380, display: 'flex', flexDirection: 'column', gap: 12, opacity: tg}}>
        <Logo size={96} dark={dark} />
        {handle ? <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 36, color: fg}}>{handle}</div> : null}
      </div>
      {/* nút đăng ký + chuông */}
      <div style={{position: 'absolute', left: 170, top: 700, transform: `rotate(-1.5deg) scale(${btn})`, transformOrigin: 'left center', opacity: btn > 0 ? 1 : 0, display: 'flex', alignItems: 'center', gap: 26}}>
        <FollowButton label={cta} done={ctaDone} pressed={pressed} press={press} />
        <div style={{transform: `rotate(${ring}deg) scale(${b})`, transformOrigin: '50% 10%', opacity: b > 0 ? 1 : 0}}>
          <EmojiSticker char="🔔" size={90} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 330, top: 740, opacity: hand > 0 && frame < fAt + 14 ? 1 : 0, transform: `translate(${(1 - hand) * 260}px, ${(1 - hand) * 300 + press * 14}px) rotate(-18deg)`}}>
        <EmojiSticker char="👆" size={110} />
      </div>
      {tagline ? <div style={{position: 'absolute', left: 120, width: 760, top: 900, fontFamily: fonts.hand, fontSize: 40, color: fg, opacity: tg}}>{tagline}</div> : null}
      <Sfx name="thud" at={2} />
      <Sfx name="pop" at={cAt} />
      <Sfx name="paper" at={btnAt} />
      <Sfx name="click" at={fAt} />
      <Sfx name="pop" at={fAt + 1} />
      <Sfx name="ding" at={bAt} />
    </AbsoluteFill>
  );
};

/** Thẻ kết kênh khung dọc (Shorts/TikTok). */
const OutroTall: React.FC<{scene: Scene}> = ({scene}) => {
  const {handle, comment = 'Bình luận ý kiến của bạn', cta = 'Theo dõi', ctaDone = 'Đã theo dõi', tagline, cues = {}} = scene.props;
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const dark = useContext(DarkContext);
  const dur = scene.durationInFrames;
  const cAt = layerFrame(cues.comment, fps, Math.round(dur * 0.08));
  const fAt = layerFrame(cues.follow, fps, Math.round(dur * 0.45));
  const bAt = layerFrame(cues.bell, fps, Math.round(dur * 0.7));
  const avatar = useSlap(2);
  const c = slapAt(frame, cAt);
  const btnAt = Math.max(6, Math.min(fAt - 12, cAt + 14));
  const btn = slapAt(frame, btnAt);
  // ngón tay trượt vào rồi bấm đúng lúc lời đọc nói "theo dõi"
  const hand = clamp01(onTwos(frame), fAt - 10, fAt - 2);
  const press = interpolate(frame, [fAt - 2, fAt, fAt + 4], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const pressed = frame >= fAt;
  const plusDone = clamp01(frame, fAt, fAt + 6);
  const b = slapAt(frame, bAt);
  const ring = frame >= bAt ? Math.sin((frame - bAt) * 1.6) * 16 * Math.max(0, 1 - (frame - bAt) / 30) : 0;
  const tg = clamp01(frame, 16, 26);
  return (
    <AbsoluteFill>
      {/* bong bóng bình luận */}
      <div style={{position: 'absolute', left: 90, top: 270, display: 'flex', alignItems: 'center', gap: 18, transform: `rotate(${-2 + boil('oc', frame, 0.3)}deg) scale(${c})`, transformOrigin: 'left center', opacity: c > 0 ? 1 : 0}}>
        <EmojiSticker char="💬" size={130} />
        <Label text={comment} color="yellow" font="sans" size={60} maxWidth={720} seed="outro-c" />
      </div>
      {/* ảnh đại diện kênh + dấu cộng */}
      <div style={{position: 'absolute', left: 540, top: 480, transform: `translateX(-50%) rotate(${interpolate(avatar, [0, 1], [-10, 2])}deg) scale(${interpolate(avatar, [0, 1], [1.4, 1])})`, opacity: Math.min(1, avatar * 3)}}>
        <div style={{width: 300, height: 300, borderRadius: '50%', overflow: 'hidden', border: '10px solid #F7F4EC', boxShadow: '0 18px 30px rgba(0,0,0,0.45)'}}>
          <Logo size={300} variant="mark" />
        </div>
        <div
          style={{
            position: 'absolute',
            left: 150 - 42,
            bottom: -34,
            width: 84,
            height: 84,
            borderRadius: '50%',
            background: plusDone > 0.5 ? colors.teal : colors.red,
            border: '7px solid #F7F4EC',
            color: '#fff',
            fontFamily: fonts.sans,
            fontWeight: 800,
            fontSize: 54,
            lineHeight: '70px',
            textAlign: 'center',
            transform: `scale(${1 + 0.25 * press})`,
          }}
        >
          {plusDone > 0.5 ? '✓' : '+'}
        </div>
      </div>
      {/* tên kênh + handle */}
      <div style={{position: 'absolute', left: 540, top: 840, transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, opacity: tg}}>
        <Logo size={84} dark={dark} />
        {handle ? <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 38, color: dark ? '#E9E3D5' : colors.inkSoft}}>{handle}</div> : null}
      </div>
      {/* nút theo dõi + chuông */}
      <Row top={1030}>
        <div style={{transform: `rotate(-1.5deg) scale(${btn})`, opacity: btn > 0 ? 1 : 0, display: 'flex', alignItems: 'center', gap: 26}}>
          <FollowButton label={cta} done={ctaDone} pressed={pressed} press={press} />
          <div style={{transform: `rotate(${ring}deg) scale(${b})`, transformOrigin: '50% 10%', opacity: b > 0 ? 1 : 0}}>
            <EmojiSticker char="🔔" size={96} />
          </div>
        </div>
      </Row>
      {/* ngón tay bấm nút */}
      <div style={{position: 'absolute', left: 560, top: 1080, opacity: hand > 0 && frame < fAt + 14 ? 1 : 0, transform: `translate(${(1 - hand) * 260}px, ${(1 - hand) * 300 + press * 14}px) rotate(-18deg)`}}>
        <EmojiSticker char="👆" size={120} />
      </div>
      {tagline ? (
        <div style={{position: 'absolute', left: 90, right: 90, top: 1480, textAlign: 'center', fontFamily: fonts.hand, fontSize: 46, color: dark ? '#E9E3D5' : colors.inkSoft, opacity: tg}}>
          {tagline}
        </div>
      ) : null}
      <Sfx name="thud" at={2} />
      <Sfx name="pop" at={cAt} />
      <Sfx name="paper" at={btnAt} />
      <Sfx name="click" at={fAt} />
      <Sfx name="pop" at={fAt + 1} />
      <Sfx name="ding" at={bAt} />
    </AbsoluteFill>
  );
};
