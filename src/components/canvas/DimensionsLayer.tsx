import React from "react";
import { Transform } from "@/lib/geometry";
import { FrameModel } from "@/lib/types";
import { useColors } from "@/contexts/ColorContext";

// Distance between the structure bounding box and the dimension line, in px
// (inside the pan/zoom group, so it scales with zoom like the member labels).
const GAP = 32;
const EPS = 1e-6;

/** Distinct, ascending coordinate values (grouped within EPS). */
function distinct(values: number[]): number[] {
  const sorted = [...values].sort((a, b) => a - b);
  const out: number[] = [];
  for (const v of sorted) {
    if (out.length === 0 || Math.abs(v - out[out.length - 1]) > EPS) out.push(v);
  }
  return out;
}

/** Format a distance in metres, trimming trailing zeros (e.g. 4, 2.5). */
function fmt(d: number): string {
  return `${parseFloat(d.toFixed(3))} m`;
}

/**
 * Automatic dimension lines (cotas). Draws a horizontal chain below the
 * structure measuring the spans between distinct node X coordinates, and a
 * vertical chain to the left measuring the heights between distinct Y
 * coordinates. Pure geometry — no solver state required.
 */
export function DimensionsLayer({
  tr,
  model,
}: {
  tr: Transform;
  model: FrameModel;
}) {
  const colors = useColors();
  const c = colors.dimensions;
  const xs = distinct(model.nodes.map((n) => n.x));
  const ys = distinct(model.nodes.map((n) => n.y));

  const els: React.ReactNode[] = [];

  // Oblique surveyor's tick centred on (sx, sy).
  const tick = (key: string, sx: number, sy: number) => (
    <line
      key={key}
      x1={sx - 3}
      y1={sy + 3}
      x2={sx + 3}
      y2={sy - 3}
      stroke={c}
      strokeWidth={1}
    />
  );

  // ── Horizontal chain (below the structure) ──────────────────────────────
  if (xs.length >= 2) {
    const yStruct = tr.toSY(tr.box.minY); // bottom of structure (screen y)
    const yDim = yStruct + GAP;
    // Extension lines down to (just past) the dimension line.
    for (const x of xs) {
      const sx = tr.toSX(x);
      els.push(
        <line
          key={`hx-ext-${x}`}
          x1={sx}
          y1={yStruct + 4}
          x2={sx}
          y2={yDim + 4}
          stroke={c}
          strokeWidth={0.5}
        />,
      );
      els.push(tick(`hx-tick-${x}`, sx, yDim));
    }
    // Dimension line spanning the full width.
    els.push(
      <line
        key="hx-dim"
        x1={tr.toSX(xs[0])}
        y1={yDim}
        x2={tr.toSX(xs[xs.length - 1])}
        y2={yDim}
        stroke={c}
        strokeWidth={1}
      />,
    );
    // Per-segment labels.
    for (let i = 0; i < xs.length - 1; i++) {
      const mid = tr.toSX((xs[i] + xs[i + 1]) / 2);
      els.push(
        <text
          key={`hx-lbl-${i}`}
          x={mid}
          y={yDim - 4}
          fontSize={9}
          fontFamily="monospace"
          textAnchor="middle"
          fill={c}
          style={{ paintOrder: "stroke", stroke: colors.paper, strokeWidth: 3 }}
        >
          {fmt(xs[i + 1] - xs[i])}
        </text>,
      );
    }
  }

  // ── Vertical chain (left of the structure) ──────────────────────────────
  if (ys.length >= 2) {
    const xStruct = tr.toSX(tr.box.minX); // left edge of structure (screen x)
    const xDim = xStruct - GAP;
    for (const y of ys) {
      const sy = tr.toSY(y);
      els.push(
        <line
          key={`vy-ext-${y}`}
          x1={xStruct - 4}
          y1={sy}
          x2={xDim - 4}
          y2={sy}
          stroke={c}
          strokeWidth={0.5}
        />,
      );
      els.push(tick(`vy-tick-${y}`, xDim, sy));
    }
    els.push(
      <line
        key="vy-dim"
        x1={xDim}
        y1={tr.toSY(ys[0])}
        x2={xDim}
        y2={tr.toSY(ys[ys.length - 1])}
        stroke={c}
        strokeWidth={1}
      />,
    );
    for (let i = 0; i < ys.length - 1; i++) {
      const mid = tr.toSY((ys[i] + ys[i + 1]) / 2);
      els.push(
        <text
          key={`vy-lbl-${i}`}
          x={xDim - 4}
          y={mid}
          fontSize={9}
          fontFamily="monospace"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={c}
          transform={`rotate(-90 ${xDim - 4} ${mid})`}
          style={{ paintOrder: "stroke", stroke: colors.paper, strokeWidth: 3 }}
        >
          {fmt(ys[i + 1] - ys[i])}
        </text>,
      );
    }
  }

  return <g data-testid="dimensions-layer">{els}</g>;
}
