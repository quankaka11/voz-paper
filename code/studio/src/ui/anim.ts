import {interpolate, random, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';

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

/**
 * "Quay hai" (on twos) — giữ mỗi tư thế 2 frame như hoạt hình cắt giấy stop-motion của Vox.
 * Chỉ dùng cho chuyển động của đồ vật cắt dán; máy quay và chuyển cảnh vẫn mượt.
 */
export const onTwos = (frame: number, step = 2) => Math.floor(frame / step) * step;

/** Lò xo 0→1 (có vượt nhẹ) chạy "on twos" — đập giấy xuống bàn. */
export const useSlap = (delay = 0, damping = 13) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: onTwos(frame) - delay, fps, config: {damping, stiffness: 170, mass: 0.6}});
};

/** Rung tay rất nhẹ (độ) đổi mỗi 4 frame — đồ vật như được đặt bằng tay, không đứng im tuyệt đối. */
export const boil = (seed: string | number, frame: number, amp = 0.35) =>
  (random(`${seed}-${Math.floor(frame / 4)}`) - 0.5) * 2 * amp;

export const clamp01 = (frame: number, a: number, b: number) =>
  interpolate(frame, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

export const ease = Easing.bezier(0.33, 1, 0.68, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
