import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {EpisodeProps, Scene} from './types';
import {NO_WATERMARK, SCENES, SCENE_TONE, SELF_CAMERA} from './scenes';
import {FilmGrain, Paper} from './ui/Paper';
import {Watermark} from './ui/Watermark';
import {Captions} from './ui/Captions';
import {SourceLine} from './ui/SourceLine';
import {colors, fonts, resolveTone, TONES} from './theme';
import {DarkContext} from './ui/RichText';
import {Camera} from './ui/Camera';
import {Sfx, SfxContext} from './ui/Sfx';
import {pickTransition, presentationFor, TRANSITION_FRAMES, TRANSITION_SFX} from './ui/transitions';

const Missing: React.FC<{type: string}> = ({type}) => (
  <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', fontFamily: fonts.sans, fontSize: 50, color: colors.coral}}>
    Thiếu loại cảnh: {type}
  </AbsoluteFill>
);

const sceneTone = (sc: Scene, fallback?: string | null) => resolveTone(sc.props?.tone ?? sc.props?.bg ?? SCENE_TONE[sc.type] ?? fallback);

/** Một cảnh: nền + nội dung trong máy quay, dòng nguồn đứng yên ngoài máy quay. */
const SceneView: React.FC<{sc: Scene; tone: string}> = ({sc, tone}) => {
  const Comp = SCENES[sc.type];
  const dark = TONES[tone].dark;
  const cam = SELF_CAMERA.has(sc.type) ? 'none' : sc.props?.camera;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <DarkContext.Provider value={dark}>
        <Camera camera={cam} dur={sc.durationInFrames} handheld={sc.props?.handheld}>
          <Paper tone={tone} />
          {Comp ? <Comp scene={sc} /> : <Missing type={sc.type} />}
        </Camera>
      </DarkContext.Provider>
      <SourceLine source={sc.source} illustrative={sc.illustrative} dark={dark} />
    </AbsoluteFill>
  );
};

/**
 * Bố cục thời gian: âm thanh + phụ đề đi theo mốc gốc của từng cảnh; hình của cảnh i kéo dài thêm T frame
 * để chồng lên đầu cảnh i+1 trong lúc chuyển cảnh → cảnh mới bắt đầu đúng lúc giọng đọc của nó bắt đầu.
 */
export const Episode: React.FC<EpisodeProps> = ({
  scenes,
  music,
  musicTracks,
  musicVolume = 0.08,
  showCaptions = true,
  showWatermark = true,
  tone,
  sfx = true,
  sfxVolume = 1,
  grain = 1,
}) => {
  const trans = scenes.map((sc, i) => pickTransition(sc.transition, i));
  const tlen = (i: number) => (i + 1 < scenes.length && trans[i + 1] !== 'cut' && presentationFor(trans[i + 1]) ? TRANSITION_FRAMES : 0);
  const starts: number[] = [];
  const total = scenes.reduce((a, s, i) => ((starts[i] = a), a + s.durationInFrames), 0);

  return (
    <SfxContext.Provider value={{enabled: sfx !== false, volume: sfxVolume}}>
      <AbsoluteFill style={{backgroundColor: colors.charcoal}}>
        <TransitionSeries>
          {scenes.flatMap((sc, i) => {
            const items: React.ReactNode[] = [];
            const pres = i > 0 ? presentationFor(trans[i]) : null;
            if (pres && tlen(i - 1)) {
              items.push(<TransitionSeries.Transition key={`t${sc.id}`} presentation={pres} timing={linearTiming({durationInFrames: TRANSITION_FRAMES})} />);
            }
            items.push(
              <TransitionSeries.Sequence key={sc.id} durationInFrames={sc.durationInFrames + tlen(i)} name={`${sc.id} · ${sc.type}`}>
                <SceneView sc={sc} tone={sceneTone(sc, tone)} />
              </TransitionSeries.Sequence>,
            );
            return items;
          })}
        </TransitionSeries>

        {grain ? <FilmGrain strength={grain} /> : null}

        {scenes.map((sc, i) => {
          const dark = TONES[sceneTone(sc, tone)].dark;
          return (
            <Sequence key={`a${sc.id}`} from={starts[i]} durationInFrames={sc.durationInFrames} name={`${sc.id} · lời + phụ đề`}>
              {showCaptions && sc.captions?.length ? <Captions captions={sc.captions} dark={dark} /> : null}
              {showWatermark && !NO_WATERMARK.has(sc.type) ? <Watermark dark={dark} /> : null}
              {sc.audio ? <Audio src={staticFile(sc.audio)} /> : null}
            </Sequence>
          );
        })}
        {scenes.map((sc, i) =>
          i > 0 && TRANSITION_SFX[trans[i]] ? <Sfx key={`ts${sc.id}`} name={TRANSITION_SFX[trans[i]]} at={Math.max(0, starts[i] - 2)} volume={0.9} /> : null,
        )}
        {musicTracks?.length ? (
          // nhạc theo chương: mỗi bài vào nhẹ 0,5s, nhỏ dần 1,2s cuối đoạn của nó
          musicTracks.map((t, i) => (
            <Sequence key={`m${i}`} from={t.from} durationInFrames={Math.max(1, t.to - t.from)} name={`nhạc · ${t.src}`}>
              <Audio src={staticFile(t.src)} loop volume={(f) => (t.volume ?? musicVolume) * Math.min(1, f / 15, Math.max(0, (t.to - t.from - f) / 36))} />
            </Sequence>
          ))
        ) : music ? (
          <Audio
            src={staticFile(music)}
            loop
            // vào nhẹ 0,5s, nhỏ dần 1,2s cuối để không cắt cụt câu nhạc
            volume={(f) => musicVolume * Math.min(1, f / 15, Math.max(0, (total - f) / 36))}
          />
        ) : null}
      </AbsoluteFill>
    </SfxContext.Provider>
  );
};
