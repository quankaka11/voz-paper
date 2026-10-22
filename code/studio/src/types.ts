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
  /** short (9:16, mặc định) | long (16:9) */
  format?: string | null;
  brand: {name: string; handle: string};
  music?: string | null;
  /** nhạc đổi theo chương (build tính sẵn frame): thay cho `music` khi có */
  musicTracks?: {src: string; from: number; to: number; volume?: number}[];
  /** mốc chương (cho publish-kit / render theo đoạn) — Remotion không dùng */
  chapters?: {title: string; scene: string; frame: number}[];
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
  /** tiêu đề siêu lớn 1–3 chữ ("APP 0Đ"); `**chữ**` tô đỏ */
  headline?: string;
  text?: string;
  /** con dấu đỏ chéo trên vật thể ("AI TRẢ?") */
  stamp?: string;
  /** mũi tên đỏ vẽ tay: true = mặc định từ chữ xuống vật thể, hoặc {from: [x, y], to: [x, y], bend?} */
  arrow?: boolean | {from: number[]; to: number[]; bend?: number};
  /** vòng khoanh đỏ quanh chi tiết: {x, y, rx?, ry?} */
  circle?: {x: number; y: number; rx?: number; ry?: number};
  /** bề rộng ảnh tràn đáy (mặc định 1000) */
  imageW?: number;
  sub?: string;
  emoji?: string;
  image?: string | null;
  /** chồng nhãn giấy thay cho text: ["Dòng 1", {"text": "Dòng 2", "color": "yellow"}] */
  lines?: (string | {text: string; color?: string})[];
  tone?: string;
  treat?: string;
  /** lớp cắt dán ghép thêm (cú pháp như collage: image, label, tag, stamp, arrow…), vẽ ở trạng thái cuối */
  layers?: Record<string, any>[];
  /** chỉ bản 16:9: mảng giấy màu xé chéo sau vật thể ('red' | 'yellow' | 'navy' | 'teal' | false) */
  panel?: string | false;
  /** short (1080×1920) | long (thumbnail 1280×720) */
  format?: string | null;
  episodeNo?: string;
  brand: {name: string; handle: string};
};
