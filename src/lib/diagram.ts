import { Station } from "./sampling";
import { Transform } from "./geometry";
import { FrameNode } from "./types";

export type DiagramKey = "N" | "Q" | "M";

export interface DiagramPoint {
  bx: number; // base x (screen)
  by: number; // base y (screen)
  ox: number; // offset x (screen)
  oy: number; // offset y (screen)
  value: number;
}

export interface DiagramPolygon {
  base: [number, number];
  offset: [number, number];
  positive: boolean; // whether value >= 0
}

export interface MemberDiagram {
  key: DiagramKey;
  points: DiagramPoint[];
  offsetPolyline: string; // SVG polyline points
  quads: DiagramPolygon[][]; // groups split at zero crossings
  iLabel: { x: number; y: number; v: number };
  jLabel: { x: number; y: number; v: number };
  extremumLabel: { x: number; y: number; v: number };
}

/** Insert zero-crossings between stations that change sign. */
function withZeros(stations: Station[], key: DiagramKey): Station[] {
  const out: Station[] = [];
  for (let i = 0; i < stations.length; i++) {
    out.push(stations[i]);
    if (i < stations.length - 1) {
      const v0 = stations[i][key],
        v1 = stations[i + 1][key];
      if (v0 * v1 < 0) {
        const t = v0 / (v0 - v1);
        const xz = stations[i].x + (stations[i + 1].x - stations[i].x) * t;
        const zero: Station = { x: xz, N: 0, Q: 0, M: 0 };
        out.push(zero);
      }
    }
  }
  return out;
}

export interface BuildDiagramOptions {
  transform: Transform;
  nodeI: FrameNode;
  nodeJ: FrameNode;
  stations: Station[];
  key: DiagramKey;
  scale: number; // user slider [0.2 … 3]
  sideSign: number; // +1 or -1 per Section 6.4
  globalMax: number; // max |v| across all members for this diagram
  diagLen: number; // structure diagonal (for scale base)
}

export function buildMemberDiagram(opts: BuildDiagramOptions): MemberDiagram {
  const {
    transform,
    nodeI,
    nodeJ,
    stations,
    key,
    scale,
    sideSign,
    globalMax,
    diagLen,
  } = opts;
  const { toSX, toSY } = transform;

  // Member axis and normal in world coords
  const wiX = nodeI.x,
    wiY = nodeI.y;
  const wjX = nodeJ.x,
    wjY = nodeJ.y;
  const L = Math.hypot(wjX - wiX, wjY - wiY);
  const ax = (wjX - wiX) / L;
  const ay = (wjY - wiY) / L;
  // normal: 90° CCW from axis
  const nx = -ay;
  const ny = ax;

  // Scale factor: globalMax reaches 0.17 * diagLen * scale pixels
  const pixelPerUnit =
    globalMax > 1e-10 ? (0.17 * diagLen * scale) / globalMax : 0;

  const processed = withZeros(stations, key);

  // Build screen-space diagram points
  const points: DiagramPoint[] = processed.map((st) => {
    const v = st[key];
    const d = st.x; // distance along member
    const bwX = wiX + ax * d;
    const bwY = wiY + ay * d;
    const bx = toSX(bwX);
    const by = toSY(bwY);
    const offset = sideSign * v * pixelPerUnit;
    // screen offset: normal in screen = (nx, -ny) due to y-flip
    const snx = nx; // world x → screen x: same sign
    const sny = -ny; // world y → screen y: flipped
    const oxs = bx + snx * offset;
    const oys = by + sny * offset;
    return { bx, by, ox: oxs, oy: oys, value: v };
  });

  // Offset polyline string
  const offsetPolyline = points.map((p) => `${p.ox},${p.oy}`).join(" ");

  // Build quads grouped by sign (for two-tone N diagram)
  // Each quad connects (base[i], offset[i], offset[i+1], base[i+1])
  const quads: DiagramPolygon[][] = [];
  let currentGroup: DiagramPolygon[] = [];
  let currentSign: boolean | null = null;

  for (let i = 0; i < points.length - 1; i++) {
    const v0 = points[i].value;
    const v1 = points[i + 1].value;
    // Use the average sign for the quad; zero-crossings were already inserted,
    // so consecutive same-sign pairs are guaranteed except at exact zeros.
    const avg = (v0 + v1) / 2;
    const pos = avg >= 0;
    if (currentSign !== pos) {
      if (currentGroup.length > 0) quads.push(currentGroup);
      currentGroup = [];
      currentSign = pos;
    }
    currentGroup.push({
      base: [points[i].bx, points[i].by],
      offset: [points[i].ox, points[i].oy],
      positive: pos,
    });
    // Add closing point for last quad in group
    if (
      i === points.length - 2 ||
      (i + 1 < points.length - 1 && points[i + 1].value >= 0 !== pos)
    ) {
      currentGroup.push({
        base: [points[i + 1].bx, points[i + 1].by],
        offset: [points[i + 1].ox, points[i + 1].oy],
        positive: pos,
      });
    }
  }
  if (points.length > 0) {
    currentGroup.push({
      base: [points[points.length - 1].bx, points[points.length - 1].by],
      offset: [points[points.length - 1].ox, points[points.length - 1].oy],
      positive: points[points.length - 1].value >= 0,
    });
  }
  if (currentGroup.length > 1) quads.push(currentGroup);

  // Labels: i-end, j-end, extremum
  const iSt = points[0];
  const jSt = points[points.length - 1];
  const extIdx = points.reduce(
    (bi, p, i) => (Math.abs(p.value) > Math.abs(points[bi].value) ? i : bi),
    0,
  );
  const extSt = points[extIdx];

  const labelOffset = 10; // px beyond offset curve
  function labelPos(p: DiagramPoint): { x: number; y: number } {
    const snx = nx;
    const sny = -ny;
    const sign = p.value >= 0 ? 1 : -1;
    const extraDir = sideSign * sign;
    return {
      x: p.ox + snx * extraDir * labelOffset,
      y: p.oy + sny * extraDir * labelOffset,
    };
  }

  return {
    key,
    points,
    offsetPolyline,
    quads,
    iLabel: { ...labelPos(iSt), v: iSt.value },
    jLabel: { ...labelPos(jSt), v: jSt.value },
    extremumLabel: { ...labelPos(extSt), v: extSt.value },
  };
}

/** Build polygon SVG points string from a group of DiagramPolygon entries. */
export function quadGroupToSvgPoints(group: DiagramPolygon[]): string {
  // Forward along offsets, backward along bases
  const fwd = group.map((q) => `${q.offset[0]},${q.offset[1]}`).join(" ");
  const bwd = [...group]
    .reverse()
    .map((q) => `${q.base[0]},${q.base[1]}`)
    .join(" ");
  return `${fwd} ${bwd}`;
}
