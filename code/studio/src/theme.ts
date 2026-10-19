import {loadFont as loadPlayfair} from '@remotion/google-fonts/PlayfairDisplay';
import {loadFont as loadFraunces} from '@remotion/google-fonts/Fraunces';
import {loadFont as loadBeVietnam} from '@remotion/google-fonts/BeVietnamPro';
import {loadFont as loadOswald} from '@remotion/google-fonts/Oswald';
import {loadFont as loadAnton} from '@remotion/google-fonts/Anton';
import {loadFont as loadSpaceMono} from '@remotion/google-fonts/SpaceMono';
import {loadFont as loadPatrick} from '@remotion/google-fonts/PatrickHand';

// Bộ nhận diện VOZ STORY — đổi màu/font ở đây là đổi cho cả series. Mọi font phải có subset 'vietnamese'.
export const fonts = {
  /** serif cổ điển cho tiêu đề, nhãn giấy, số lớn kiểu in typo (2430 m) */
  serif: loadFraunces('normal', {weights: ['700', '900'], subsets: ['latin', 'vietnamese']}).fontFamily,
  /** serif cũ — giữ cho ảnh bìa cũ / logo */
  classic: loadPlayfair('normal', {weights: ['700', '900'], subsets: ['latin', 'vietnamese']}).fontFamily,
  sans: loadBeVietnam('normal', {weights: ['500', '700', '800'], subsets: ['latin', 'vietnamese']}).fontFamily,
  condensed: loadOswald('normal', {weights: ['500', '700'], subsets: ['latin', 'vietnamese']}).fontFamily,
  /** chữ đậm hẹp cho số "poster" cắt giấy (1819) */
  heavy: loadAnton('normal', {weights: ['400'], subsets: ['latin', 'vietnamese']}).fontFamily,
  /** đánh máy: chữ cắt rời, hồ sơ, dòng nguồn */
  mono: loadSpaceMono('normal', {weights: ['400', '700'], subsets: ['latin', 'vietnamese']}).fontFamily,
  hand: loadPatrick('normal', {weights: ['400'], subsets: ['latin', 'vietnamese']}).fontFamily,
};

export const colors = {
  paper: '#F2EADB', // giấy kem (nhãn, thẻ, nền sáng)
  paperDark: '#E4D8C2',
  ink: '#16181D', // chữ chính
  inkSoft: '#4A4C52',
  charcoal: '#262628', // nền than chì — nền mặc định
  navy: '#14213D',
  yellow: '#F4C430', // màu nhấn chính: dạ quang, số poster, nhãn
  coral: '#E8553F', // cảnh báo / tăng / chi phí
  red: '#D7262E', // tô điểm duy nhất trên ảnh đen trắng, bản đồ
  teal: '#2A9D8F', // dây nối, giảm / tích cực
  kraft: '#5B3F2C', // giấy kraft nâu
  tape: 'rgba(232,222,190,0.78)', // băng dính giấy
  white: '#FFFFFF',
};

/** Nền giấy dựng sẵn (code/voz/tools/make_paper.py). `dark` = chữ sáng. */
export const TONES: Record<string, {dark: boolean}> = {
  charcoal: {dark: true}, // than chì — mặc định
  cream: {dark: false}, // giấy kem
  navy: {dark: true},
  grid: {dark: true}, // giấy kẻ ô xanh lá
  'grid-blue': {dark: true},
  'grid-red': {dark: true},
  map: {dark: false}, // biển xám nhạt cho cảnh bản đồ
};
/** Tên cũ trước bản cắt dán. */
export const TONE_ALIAS: Record<string, string> = {light: 'cream', dark: 'navy'};
export const DEFAULT_TONE = 'charcoal';
export const resolveTone = (t?: string | null) => {
  const k = t ? TONE_ALIAS[t] ?? t : DEFAULT_TONE;
  return TONES[k] ? k : DEFAULT_TONE;
};

export const VIDEO = {width: 1080, height: 1920, fps: 30};

// Vùng an toàn 9:16: tránh giao diện TikTok/Shorts (thanh trên, cột nút phải, caption + nút dưới).
// Ảnh/nền được phép tràn ra ngoài vùng này; chữ quan trọng thì không.
export const SAFE = {top: 200, bottom: 1920 - 520, left: 80, right: 1080 - 150};
