import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {evolvePath} from '@remotion/paths';
import {Scene} from '../types';
import {colors, fonts} from '../theme';
import {CONTENT, Heading, Kicker, Stage, useRevealFrame} from '../ui/layout';
import {useEnter} from '../ui/anim';

type Node = {label: string; emoji?: string; note?: string; atMs?: number; highlight?: boolean};

const clampI = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const NodeCard: React.FC<{n: Node; x: number; y: number; p: number; big?: boolean}> = ({n, x, y, p, big}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      transform: `translate(-50%,-50%) scale(${0.6 + 0.4 * p})`,
      opacity: p,
      width: big ? 320 : 290,
      textAlign: 'center',
      background: big ? colors.navy : n.highlight ? colors.yellow : colors.white,
      color: big ? colors.paper : colors.ink,
      borderRadius: big ? 150 : 22,
      padding: big ? '34px 18px' : '18px 14px',
      boxShadow: '0 10px 0 rgba(22,24,29,0.12)',
      fontFamily: fonts.sans,
      fontWeight: 800,
      fontSize: big ? 44 : 40,
      lineHeight: 1.2,
    }}
  >
    {n.emoji ? <div style={{fontSize: big ? 90 : 76, marginBottom: 6}}>{n.emoji}</div> : null}
    {n.label}
    {n.note ? <div style={{fontFamily: fonts.hand, fontWeight: 400, fontSize: 30, marginTop: 4, color: big ? colors.yellow : colors.inkSoft}}>{n.note}</div> : null}
  </div>
);

const Arrow: React.FC<{x1: number; y1: number; x2: number; y2: number; p: number; color: string; label?: string}> = ({
  x1, y1, x2, y2, p, color, label,
}) => {
  // dừng mũi tên trước tâm node để không đè lên thẻ
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const sx = x1 + ux * 130;
  const sy = y1 + uy * 130;
  const ex = x2 - ux * 120;
  const ey = y2 - uy * 120;
  const d = `M ${sx} ${sy} L ${ex} ${ey}`;
  const ev = evolvePath(p, d);
  const ang = (Math.atan2(uy, ux) * 180) / Math.PI;
  return (
    <g>
      <path d={d} stroke={color} strokeWidth={10} fill="none" strokeLinecap="round" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />
      {p > 0.95 ? (
        <polygon points="0,-18 30,0 0,18" fill={color} transform={`translate(${ex},${ey}) rotate(${ang})`} />
      ) : null}
      {label && p > 0.6 ? (
        <text x={(sx + ex) / 2} y={(sy + ey) / 2 - 14} textAnchor="middle" fontFamily={fonts.hand} fontSize={34} fill={colors.inkSoft}>
          {label}
        </text>
      ) : null}
    </g>
  );
};

/**
 * flow — sơ đồ hệ thống.
 * layout "radial": center + nodes tỏa xung quanh (direction out|in).
 * layout "chain": các node nối tiếp từ trên xuống (dòng tiền, quy trình).
 * props: kicker?, title?, layout?, center?: Node, nodes: Node[], direction?, arrowLabels?: string[]
 */
export const FlowScene: React.FC<{scene: Scene}> = ({scene}) => {
  const {kicker, title, layout = 'radial', center, nodes = [], direction = 'out', arrowLabels = []} = scene.props;
  const frame = useCurrentFrame();
  const reveal = useRevealFrame(scene.durationInFrames);
  const cp = useEnter(2);
  const W = CONTENT.width;
  const H = CONTENT.bottom - CONTENT.top - (title ? 170 : 40);

  if (layout === 'chain') {
    const n = nodes.length;
    const gap = H / Math.max(n, 1);
    const pos = nodes.map((_: Node, i: number) => ({x: i % 2 === 0 ? W * 0.3 : W * 0.7, y: gap * (i + 0.5)}));
    return (
      <Stage align="top">
        <Kicker text={kicker} />
        {title ? <Heading text={title} size={68} /> : null}
        <div style={{position: 'relative', width: W, height: H, marginTop: 20}}>
          <svg width={W} height={H} style={{position: 'absolute', overflow: 'visible'}}>
            {pos.slice(1).map((b: any, i: number) => {
              const at = reveal(nodes[i + 1], i + 1, n, 6, 0.65);
              return <Arrow key={i} x1={pos[i].x} y1={pos[i].y} x2={b.x} y2={b.y} p={clampI(frame, at - 10, at)} color={colors.coral} label={arrowLabels[i]} />;
            })}
          </svg>
          {nodes.map((nd: Node, i: number) => {
            const at = reveal(nd, i, n, 6, 0.65);
            return <NodeCard key={i} n={nd} x={pos[i].x} y={pos[i].y} p={clampI(frame, at, at + 10)} />;
          })}
        </div>
      </Stage>
    );
  }

  const cx = W / 2;
  const cy = H / 2;
  const RX = W * 0.36;
  const RY = H * 0.38;
  const n = nodes.length;
  const pos = nodes.map((_: Node, i: number) => {
    const a = -Math.PI / 2 + (Math.PI * 2 * i) / n + (n === 2 ? Math.PI / 2 : 0);
    return {x: cx + Math.cos(a) * RX, y: cy + Math.sin(a) * RY};
  });
  return (
    <Stage align="top">
      <Kicker text={kicker} />
      {title ? <Heading text={title} size={68} /> : null}
      <div style={{position: 'relative', width: W, height: H, marginTop: 20}}>
        <svg width={W} height={H} style={{position: 'absolute', overflow: 'visible'}}>
          {pos.map((p: any, i: number) => {
            const at = reveal(nodes[i], i, n, 14, 0.6);
            const pr = clampI(frame, at - 8, at + 4);
            return direction === 'in' ? (
              <Arrow key={i} x1={p.x} y1={p.y} x2={cx} y2={cy} p={pr} color={colors.coral} label={arrowLabels[i]} />
            ) : (
              <Arrow key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} p={pr} color={colors.coral} label={arrowLabels[i]} />
            );
          })}
        </svg>
        {center ? <NodeCard n={center} x={cx} y={cy} p={cp} big /> : null}
        {nodes.map((nd: Node, i: number) => {
          const at = reveal(nd, i, n, 14, 0.6);
          return <NodeCard key={i} n={nd} x={pos[i].x} y={pos[i].y} p={clampI(frame, at, at + 10)} />;
        })}
      </div>
    </Stage>
  );
};
