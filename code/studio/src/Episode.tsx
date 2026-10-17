import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {EpisodeProps} from './types';
import {SCENES, DARK_SCENES} from './scenes';
import {Paper} from './ui/Paper';
import {Watermark} from './ui/Watermark';
import {Captions} from './ui/Captions';
import {SourceLine} from './ui/SourceLine';
import {colors, fonts} from './theme';
import {DarkContext} from './ui/RichText';

const Missing: React.FC<{type: string}> = ({type}) => (
  <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', fontFamily: fonts.sans, fontSize: 50, color: colors.coral}}>
    Thiếu loại cảnh: {type}
  </AbsoluteFill>
);

/** Đẩy máy chậm (push-in) + vào cảnh nhẹ, giúp hình luôn "sống" kiểu Vox. */
const SceneMotion: React.FC<{dur: number; children: React.ReactNode}> = ({dur, children}) => {
  const f = useCurrentFrame();
  const scale = interpolate(f, [0, dur], [1, 1.035]);
  const o = interpolate(f, [0, 4], [0, 1], {extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{transform: `scale(${scale})`, opacity: o}}>{children}</AbsoluteFill>;
};

export const Episode: React.FC<EpisodeProps> = ({scenes, music, musicVolume = 0.08, showCaptions = true, showWatermark = true}) => {
  let from = 0;
  return (
    <AbsoluteFill style={{backgroundColor: colors.paper}}>
      {scenes.map((sc) => {
        const Comp = SCENES[sc.type];
        const dark = DARK_SCENES.has(sc.type) || sc.props?.tone === 'dark';
        const start = from;
        from += sc.durationInFrames;
        return (
          <Sequence key={sc.id} from={start} durationInFrames={sc.durationInFrames} name={`${sc.id} · ${sc.type}`}>
            <Paper tone={dark ? 'dark' : 'light'} />
            <DarkContext.Provider value={dark}>
              <SceneMotion dur={sc.durationInFrames}>{Comp ? <Comp scene={sc} /> : <Missing type={sc.type} />}</SceneMotion>
            </DarkContext.Provider>
            <SourceLine source={sc.source} illustrative={sc.illustrative} dark={dark} />
            {showCaptions && sc.captions?.length ? <Captions captions={sc.captions} dark={dark} /> : null}
            {showWatermark ? <Watermark dark={dark} /> : null}
            {sc.audio ? <Audio src={staticFile(sc.audio)} /> : null}
          </Sequence>
        );
      })}
      {music ? <Audio src={staticFile(music)} volume={musicVolume} loop /> : null}
    </AbsoluteFill>
  );
};
