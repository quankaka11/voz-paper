import {loadFont as loadPlayfair} from '@remotion/google-fonts/PlayfairDisplay';
import {loadFont as loadBeVietnam} from '@remotion/google-fonts/BeVietnamPro';
import {loadFont as loadOswald} from '@remotion/google-fonts/Oswald';
import {loadFont as loadPatrick} from '@remotion/google-fonts/PatrickHand';

// Bộ nhận diện VOZ STORY — đổi màu/font ở đây là đổi cho cả series.
export const fonts = {
  serif: loadPlayfair('normal', {weights: ['700', '900'], subsets: ['latin', 'vietnamese']}).fontFamily,
  sans: loadBeVietnam('normal', {weights: ['500', '700', '800'], subsets: ['latin', 'vietnamese']}).fontFamily,
  condensed: loadOswald('normal', {weights: ['500', '700'], subsets: ['latin', 'vietnamese']}).fontFamily,
  hand: loadPatrick('normal', {weights: ['400'], subsets: ['latin', 'vietnamese']}).fontFamily,
};

export const colors = {
  paper: '#F2EADB', // nền giấy kem
  paperDark: '#E4D8C2',
  ink: '#16181D', // chữ chính
  inkSoft: '#4A4C52',
  navy: '#14213D', // màu nhận diện 2
  yellow: '#FFC93C', // bút dạ quang — màu nhấn chính
  coral: '#E8553F', // cảnh báo / tăng / chi phí
  teal: '#1F8A70', // giảm / tích cực
  white: '#FFFFFF',
};

export const VIDEO = {width: 1080, height: 1920, fps: 30};

// Vùng an toàn 9:16: tránh giao diện TikTok/Shorts (thanh trên, cột nút phải, caption + nút dưới).
export const SAFE = {top: 200, bottom: 1920 - 520, left: 80, right: 1080 - 150};
