import React, {useContext} from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {Scene} from '../types';
import {colors, fonts} from '../theme';
import {CONTENT, Heading, Kicker, Stage, useRevealFrame} from '../ui/layout';
import {boil, onTwos, useEnter} from '../ui/anim';
import {EmojiSticker, HandArrow, Sticker, Torn} from '../ui/collage';
import {DarkContext} from '../ui/RichText';
import {Sfx} from '../ui/Sfx';

type Node = {label: string; emoji?: string; note?: string; atMs?: number; highlight?: boolean};

const clampI = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const NodeCard: React.FC<{n: Node & {img?: string; treat?: string}; x: number; y: number; p: number; big?: boolean; i?: number}> = ({n, x, y, p, big, i = 0}) => {
  const frame = useCurrentFrame();
  const sc = interpolate(p, [0, 0.6, 1], [1.3, 0.95, 1]);
  const rot = (i % 2 ? 2 : -2) + boil(`n${i}`, frame, 0.3);
  const body = (
    <div style={{width: big ? 320 : 290, textAlign: 'center', fontFamily: fonts.sans, fontWeight: 800, fontSize: big ? 44 : 40, lineHeight: 1.2, color: big ? '#F4F1EA' : colors.ink}}>
      {n.img ? (
        <div style={{display: 'flex', justifyContent: 'center', marginBottom: 8}}>
          <Sticker src={n.img} h={big ? 200 : 150} treat={n.treat ?? 'color'} border={5} />
        </div>
      ) : n.emoji ? (
        <div style={{display: 'flex', justifyContent: 'center', marginBottom: 8}}>
          <EmojiSticker char={n.emoji} size={big ? 90 : 72} />
        </div>
      ) : null}
      {n.label}
      {n.note ? <div style={{fontFamily: fonts.hand, fontWeight: 400, fontSize: 32, marginTop: 4, color: big ? colors.yellow : colors.inkSoft}}>{n.note}</div> : null}
    </div>
  );
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${sc}) rotate(${rot}deg)`, opacity: p > 0 ? 1 : 0}}>
      <Torn seed={`node-${i}-${n.label}`} bg={big ? '#141414' : n.highlight ? '#F2D43D' : '#ECE4D2'} pad={big ? '28px 18px' : '16px 14px'} rough={8}>
        {body}
      </Torn>
    </div>
  );
};

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
  const ex = x2 - ux * 125;
  const ey = y2 - uy * 125;
  return (
    <g>
      <HandArrow from={[sx, sy]} to={[ex, ey]} bend={0.12} p={p} color={color} width={9} />
      {label && p > 0.6 ? (
        <text x={(sx + ex) / 2 - uy * 56} y={(sy + ey) / 2 + ux * 56 + 12} textAnchor="middle" fontFamily={fonts.hand} fontSize={44} fill={colors.yellow} stroke="#000a" strokeWidth={6} paintOrder="stroke">
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
  const dark = useContext(DarkContext);
  const ac = dark ? '#F4F1EA' : colors.ink;
  const f2 = onTwos(frame);
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
              return <Arrow key={i} x1={pos[i].x} y1={pos[i].y} x2={b.x} y2={b.y} p={clampI(f2, at - 10, at)} color={ac} label={arrowLabels[i]} />;
            })}
          </svg>
          {nodes.map((nd: Node, i: number) => {
            const at = reveal(nd, i, n, 6, 0.65);
            return (
              <React.Fragment key={i}>
                <Sfx name="paper" at={at} />
                <NodeCard n={nd} i={i} x={pos[i].x} y={pos[i].y} p={clampI(f2, at, at + 8)} />
              </React.Fragment>
            );
          })}
        </div>
      </Stage>
    );
  }

  const cx = W / 2;
  const cy = H * 0.53;
  const n = nodes.length;
  // Thẻ rộng 290 → giữ tâm thẻ trong [145, W-145] và cách node trung tâm đủ xa để không chồng.
  const RX = W / 2 - 150;
  const RY = H * 0.36;
  const pos = nodes.map((_: Node, i: number) => {
    if (n === 3) {
      return [
        {x: cx, y: cy - RY},
        {x: cx + RX, y: cy + RY * 0.8},
        {x: cx - RX, y: cy + RY * 0.8},
      ][i];
    }
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
            const pr = clampI(f2, at - 8, at + 4);
            return direction === 'in' ? (
              <Arrow key={i} x1={p.x} y1={p.y} x2={cx} y2={cy} p={pr} color={ac} label={arrowLabels[i]} />
            ) : (
              <Arrow key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} p={pr} color={ac} label={arrowLabels[i]} />
            );
          })}
        </svg>
        {center ? <NodeCard n={center} x={cx} y={cy} p={cp} big /> : null}
        {center ? <Sfx name="thud" at={2} /> : null}
        {nodes.map((nd: Node, i: number) => {
          const at = reveal(nd, i, n, 14, 0.6);
          return (
              <React.Fragment key={i}>
                <Sfx name="paper" at={at} />
                <NodeCard n={nd} i={i} x={pos[i].x} y={pos[i].y} p={clampI(f2, at, at + 8)} />
              </React.Fragment>
            );
        })}
      </div>
    </Stage>
  );
};
