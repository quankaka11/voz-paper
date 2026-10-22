import {useVideoConfig} from 'remotion';
import {formatOf} from '../theme';

/** Định dạng của khung đang render (short 9:16 | long 16:9) — kích thước, vùng an toàn, vùng nội dung. */
export const useFormat = () => {
  const {width, height} = useVideoConfig();
  return formatOf(width, height);
};
