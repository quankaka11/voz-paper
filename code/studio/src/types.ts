export type Caption = {text: string; startMs: number; endMs: number};

export type Scene = {
  id: string;
  type: string;
  durationInFrames: number;
  /** đường dẫn tương đối trong public-dir (build/), vd "audio/s01.mp3" */
  audio?: string | null;
  captions?: Caption[];
  /** dòng "Nguồn: ..." hiển thị trong khung */
  source?: string | null;
  /** gắn nhãn "Minh họa" cho số liệu giả định */
  illustrative?: boolean;
  props: Record<string, any>;
};

export type EpisodeProps = {
  id: string;
  title: string;
  brand: {name: string; handle: string};
  music?: string | null;
  musicVolume?: number;
  showCaptions?: boolean;
  showWatermark?: boolean;
  scenes: Scene[];
};

export type CoverProps = {
  kicker?: string;
  text: string;
  sub?: string;
  emoji?: string;
  image?: string | null;
  episodeNo?: string;
  brand: {name: string; handle: string};
};
