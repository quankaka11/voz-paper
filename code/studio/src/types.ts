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
  /** chuyển VÀO cảnh này: cut | sheet | push | push-up | tear | zoom | auto */
  transition?: string;
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
  /** nền mặc định của tập: charcoal | cream | navy | grid | grid-blue | grid-red */
  tone?: string | null;
  sfx?: boolean;
  sfxVolume?: number;
  /** độ hạt film 0–1.5 (0 = tắt) */
  grain?: number;
  scenes: Scene[];
};

export type CoverProps = {
  kicker?: string;
  text: string;
  sub?: string;
  emoji?: string;
  image?: string | null;
  /** chồng nhãn giấy thay cho text: ["Dòng 1", {"text": "Dòng 2", "color": "yellow"}] */
  lines?: (string | {text: string; color?: string})[];
  tone?: string;
  treat?: string;
  episodeNo?: string;
  brand: {name: string; handle: string};
};
