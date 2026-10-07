import React from "react";

const HALO = { paintOrder: "stroke", stroke: "#fff", strokeWidth: 2 } as const;

export type P2 = [number, number];

// unit screen direction of a projected vector; null when it collapses to a point
export function unit2(v: P2): P2 | null {
  const n = Math.hypot(v[0], v[1]);
  return n < 1e-9 ? null : [v[0] / n, v[1] / n];
}

function Head({
  tip,
  d,
  size = 10,
  color,
}: {
  tip: P2;
  d: P2;
  size?: number;
  color: string;
}) {
  const bx = tip[0] - d[0] * size,
    by = tip[1] - d[1] * size;
  const w = size * 0.5;
  return (
    <polygon
      points={`${tip[0]},${tip[1]} ${bx - d[1] * w},${by + d[0] * w} ${bx + d[1] * w},${by - d[0] * w}`}
      fill={color}
    />
  );
}

// Force: tip AT the node, shaft trailing opposite the force (same rule as the 2D layers).
export function ForceArrow3D({
  at,
  dir,
  len = 40,
  color,
  label,
  testId,
}: {
  at: P2;
  dir: P2; // projected direction of the force
  len?: number;
  color: string;
  label?: string;
  testId?: string;
}) {
  const d = unit2(dir);
  if (!d) return null;
  const tail: P2 = [at[0] - d[0] * len, at[1] - d[1] * len];
  return (
    <g data-testid={testId}>
      <line
        x1={tail[0]}
        y1={tail[1]}
        x2={at[0] - d[0] * 8}
        y2={at[1] - d[1] * 8}
        stroke={color}
        strokeWidth={2}
      />
      <Head tip={at} d={d} color={color} />
      {label && (
        <text
          x={tail[0] - d[0] * 4 + (d[0] >= 0 ? -4 : 4)}
          y={tail[1] - d[1] * 4}
          fontSize={10}
          fontFamily="monospace"
          fill={color}
          textAnchor={d[0] >= 0 ? "end" : "start"}
          style={HALO}
        >
          {label}
        </text>
      )}
    </g>
  );
}

// Moment vector (right-hand rule): double arrow starting at the node and pointing along
// the vector.
export function MomentArrow3D({
  at,
  dir,
  len = 44,
  color,
  label,
  testId,
}: {
  at: P2;
  dir: P2;
  len?: number;
  color: string;
  label?: string;
  testId?: string;
}) {
  const d = unit2(dir);
  if (!d) return null;
  const end: P2 = [at[0] + d[0] * len, at[1] + d[1] * len];
  const mid: P2 = [end[0] - d[0] * 9, end[1] - d[1] * 9];
  return (
    <g data-testid={testId}>
      <line
        x1={at[0]}
        y1={at[1]}
        x2={mid[0]}
        y2={mid[1]}
        stroke={color}
        strokeWidth={2.5}
      />
      <Head tip={end} d={d} size={9} color={color} />
      <Head tip={mid} d={d} size={9} color={color} />
      {label && (
        <text
          x={end[0] + (d[0] >= 0 ? 8 : -8)}
          y={end[1] + 4}
          fontSize={10}
          fontFamily="monospace"
          fill={color}
          textAnchor={d[0] >= 0 ? "start" : "end"}
          style={HALO}
        >
          {label}
        </text>
      )}
    </g>
  );
}
