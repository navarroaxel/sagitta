import React from "react";
import { Transform } from "@/lib/geometry";
import { C, SNAP, SVG_W, SVG_H } from "./constants";

export function GridLayer({ tr }: { tr: Transform }) {
  const step = SNAP;
  const minWX = (0 - tr.ox) / tr.k;
  const maxWX = (SVG_W - tr.ox) / tr.k;
  const minWY = (tr.oy - SVG_H) / tr.k;
  const maxWY = tr.oy / tr.k;

  const lines: React.ReactNode[] = [];
  for (let x = Math.ceil(minWX / step) * step; x <= maxWX; x += step) {
    lines.push(
      <line
        key={`gx${x}`}
        x1={tr.toSX(x)}
        y1={0}
        x2={tr.toSX(x)}
        y2={SVG_H}
        stroke={C.grid}
        strokeWidth={0.5}
      />,
    );
  }
  for (let y = Math.ceil(minWY / step) * step; y <= maxWY; y += step) {
    lines.push(
      <line
        key={`gy${y}`}
        x1={0}
        y1={tr.toSY(y)}
        x2={SVG_W}
        y2={tr.toSY(y)}
        stroke={C.grid}
        strokeWidth={0.5}
      />,
    );
  }
  return <g data-testid="grid-layer">{lines}</g>;
}
