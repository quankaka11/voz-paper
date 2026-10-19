import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {noise2D} from '@remotion/noise';
import {easeInOut} from './anim';
import {layerFrame} from './Layers';

/**
 * Máy quay của cảnh. `camera` trong props:
 *  - chuỗi preset: "in" (mặc định, đẩy chậm) | "out" | "left" | "right" | "up" | "down" | "none"
 *  - hoặc danh sách điểm nhìn khớp lời đọc: [{cue, x, y, zoom, rot?, move?}] — máy lia/zoom tới điểm (x,y)
 *    của khung 1080×1920 khi giọng đọc tới `cue` (Vox: một bảng cắt dán lớn, máy đi từ chi tiết này sang chi tiết khác).
 *  - `handheld: true` thêm rung tay nhẹ.
 */
export type CamKey = {x?: number; y?: number; zoom?: number; rot?: number; move?: number; atMs?: number; at?: number};

const W = 1080;
const H = 1920;

const PRESET: Record<string, [CamKey, CamKey]> = {
  in: [{zoom: 1}, {zoom: 1.045}],
  out: [{zoom: 1.08}, {zoom: 1}],
  left: [{x: 590, zoom: 1.06}, {x: 490, zoom: 1.06}],
  right: [{x: 490, zoom: 1.06}, {x: 590, zoom: 1.06}],
  up: [{y: 1040, zoom: 1.06}, {y: 880, zoom: 1.06}],
  down: [{y: 880, zoom: 1.06}, {y: 1040, zoom: 1.06}],
  none: [{zoom: 1}, {zoom: 1}],
};

const full = (k: CamKey, prev?: Required<Pick<CamKey, 'x' | 'y' | 'zoom' | 'rot'>>) => ({
  x: k.x ?? prev?.x ?? W / 2,
  y: k.y ?? prev?.y ?? H / 2,
  zoom: k.zoom ?? prev?.zoom ?? 1,
  rot: k.rot ?? prev?.rot ?? 0,
});

export const useCameraTransform = (camera: string | CamKey[] | undefined, dur: number, handheld = false) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  let x: number;
  let y: number;
  let zoom: number;
  let rot: number;
  if (!Array.isArray(camera)) {
    const [a, b] = PRESET[camera ?? 'in'] ?? PRESET.in;
    const fa = full(a);
    const fb = full(b, fa);
    const t = interpolate(frame, [0, dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    x = fa.x + (fb.x - fa.x) * t;
    y = fa.y + (fb.y - fa.y) * t;
    zoom = fa.zoom + (fb.zoom - fa.zoom) * t;
    rot = fa.rot + (fb.rot - fa.rot) * t;
  } else {
    // điểm đầu (không cue) = trạng thái mở cảnh; mỗi điểm sau lia tới trong `move` frame kể từ cue
    let cur = full(camera[0] && layerFrame(camera[0], fps, -1) <= 0 ? camera[0] : {});
    for (let i = 0; i < camera.length; i++) {
      const k = camera[i];
      const at = layerFrame(k, fps, i === 0 ? 0 : Math.round((dur * i) / camera.length));
      if (at <= 0 && i === 0) continue;
      const nxt = full(k, cur);
      const mv = k.move ?? 20;
      if (frame <= at) break;
      const p = easeInOut(Math.min(1, (frame - at) / mv));
      cur = {
        x: cur.x + (nxt.x - cur.x) * p,
        y: cur.y + (nxt.y - cur.y) * p,
        zoom: Math.exp(Math.log(cur.zoom) + (Math.log(nxt.zoom) - Math.log(cur.zoom)) * p),
        rot: cur.rot + (nxt.rot - cur.rot) * p,
      };
    }
    // trôi rất chậm để khung không bao giờ đứng hình
    const drift = 1 + 0.025 * (frame / Math.max(1, dur));
    x = cur.x;
    y = cur.y;
    zoom = cur.zoom * drift;
    rot = cur.rot;
  }
  // không lia quá mép bảng: vùng nhìn [x ± 540/zoom] luôn nằm trong khung gốc (zoom ≥ 1)
  if (zoom >= 1) {
    x = Math.min(W - W / 2 / zoom, Math.max(W / 2 / zoom, x));
    y = Math.min(H - H / 2 / zoom, Math.max(H / 2 / zoom, y));
  }
  if (handheld) {
    x += noise2D('cx', frame / 40, 0) * 6;
    y += noise2D('cy', frame / 40, 0) * 6;
    rot += noise2D('cr', frame / 50, 0) * 0.35;
  }
  return `translate(${W / 2}px, ${H / 2}px) rotate(${rot}deg) scale(${zoom}) translate(${-x}px, ${-y}px)`;
};

export const Camera: React.FC<{camera?: string | CamKey[]; dur: number; handheld?: boolean; children: React.ReactNode}> = ({
  camera,
  dur,
  handheld,
  children,
}) => {
  const tf = useCameraTransform(camera, dur, handheld);
  return <AbsoluteFill style={{transform: tf, transformOrigin: '0 0'}}>{children}</AbsoluteFill>;
};
