import { FrameNode } from "./types";

export interface WorldBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  diagLen: number;
}

export interface Transform {
  toSX: (x: number) => number;
  toSY: (y: number) => number;
  k: number; // pixels per metre
  ox: number;
  oy: number;
  box: WorldBox;
}

/** Compute the bounding box of the structure in world coords. */
export function worldBounds(nodes: FrameNode[]): WorldBox {
  if (nodes.length === 0)
    return { minX: 0, maxX: 10, minY: 0, maxY: 5, diagLen: 11 };
  const xs = nodes.map((n) => n.x);
  const ys = nodes.map((n) => n.y);
  const minX = Math.min(...xs),
    maxX = Math.max(...xs);
  const minY = Math.min(...ys),
    maxY = Math.max(...ys);
  const diagLen = Math.hypot(maxX - minX || 1, maxY - minY || 1);
  return { minX, maxX, minY, maxY, diagLen };
}

/**
 * Build a world→screen transform that fits the structure into the given SVG
 * viewport, with padding so that diagrams (which extend outside the structure)
 * are not clipped.
 *
 * @param nodes         frame nodes
 * @param svgW          SVG viewport width in px
 * @param svgH          SVG viewport height in px
 * @param maxScale      maximum diagram scale slider value (for padding)
 */
export function makeTransform(
  nodes: FrameNode[],
  svgW: number,
  svgH: number,
  maxScale = 1,
): Transform {
  const box = worldBounds(nodes);
  // padding: allow diagrams to extend ~25% of diagonal on each side, plus fixed margin
  const pad = 0.25 * box.diagLen * maxScale + 1.5;

  const padMinX = box.minX - pad;
  const padMaxX = box.maxX + pad;
  const padMinY = box.minY - pad;
  const padMaxY = box.maxY + pad;

  const worldW = padMaxX - padMinX || 1;
  const worldH = padMaxY - padMinY || 1;

  const k = Math.min(svgW / worldW, svgH / worldH);
  const ox = (svgW - worldW * k) / 2 - padMinX * k;
  const oy = (svgH - worldH * k) / 2 + padMaxY * k;

  return {
    toSX: (x) => ox + x * k,
    toSY: (y) => oy - y * k, // y-up → y-down
    k,
    ox,
    oy,
    box,
  };
}
