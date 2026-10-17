import {interpolate, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';

/** Giá trị 0→1 dạng lò xo, bắt đầu sau `delay` frame. */
export const useEnter = (delay = 0, damping = 200) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping}});
};

/** Giá trị 0→1 có easing trong [start, start+dur] frame. */
export const useProgress = (start: number, dur: number) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.33, 1, 0.68, 1),
  });
};

/** Chia đều thời điểm xuất hiện cho n phần tử trong khoảng [from, to] frame. */
export const stagger = (i: number, n: number, from: number, to: number) =>
  n <= 1 ? from : from + ((to - from) * i) / (n - 1);
