import React from 'react';
import {Composition, Still} from 'remotion';
import {Episode} from './Episode';
import {BrandMark, Cover} from './Cover';
import {EpisodeProps, CoverProps} from './types';
import {resolveFormat, VIDEO} from './theme';
import demo from './demo.json';

const demoCover: CoverProps = {
  kicker: 'Ai đang trả tiền?',
  text: 'App ==miễn phí== kiếm tiền từ đâu?',
  emoji: '📱',
  episodeNo: '01',
  brand: {name: 'VOZ STORY', handle: '@vozstory'},
};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Episode"
      component={Episode as unknown as React.FC<Record<string, unknown>>}
      width={VIDEO.width}
      height={VIDEO.height}
      fps={VIDEO.fps}
      durationInFrames={300}
      defaultProps={demo as unknown as Record<string, unknown>}
      calculateMetadata={({props}: {props: Record<string, unknown>}) => {
        const p = props as unknown as EpisodeProps;
        const total = p.scenes.reduce((a, s) => a + s.durationInFrames, 0);
        const f = resolveFormat(p.format);
        return {durationInFrames: Math.max(1, total), width: f.width, height: f.height};
      }}
    />
    <Still id="Cover" component={Cover as unknown as React.FC<Record<string, unknown>>} width={1080} height={1920} defaultProps={demoCover as unknown as Record<string, unknown>} />
    <Still id="LogoMark" component={BrandMark as unknown as React.FC<Record<string, unknown>>} width={800} height={800} defaultProps={{variant: 'mark', bg: false}} />
    <Still id="LogoFull" component={BrandMark as unknown as React.FC<Record<string, unknown>>} width={640} height={260} defaultProps={{variant: 'full', bg: false}} />
    <Still id="LogoFullDark" component={BrandMark as unknown as React.FC<Record<string, unknown>>} width={640} height={260} defaultProps={{variant: 'full', dark: true, bg: true}} />
  </>
);
