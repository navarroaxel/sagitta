// Oblique projection for the 3D view: x to the right, z up, y receding up-right.
// Same convention as examples/t-frame-3d-fixed.svg: one metre along y is drawn as
// (14, -10) px when one metre along x/z is 40 px.
import type { Vec3 } from "./solver3d";

export const DEPTH_X = 14 / 40;
export const DEPTH_Y = 10 / 40;

export interface Projection3D {
  k: number; // px per metre along x / z
  project: (p: Vec3) => [number, number];
  // projected direction (screen px per unit length) of a world vector
  dir: (v: Vec3) => [number, number];
}

export function makeProjection3D(
  points: Vec3[],
  svgW: number,
  svgH: number,
  padX = 170, // room for reaction labels that trail to the left of a support
  padY = 130,
): Projection3D {
  // projected extents at k = 1, origin at 0
  const raw = (p: Vec3): [number, number] => [
    p[0] + p[1] * DEPTH_X,
    -(p[2] + p[1] * DEPTH_Y),
  ];
  const pts = points.length ? points.map(raw) : [[0, 0] as [number, number]];
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const minX = Math.min(...xs),
    maxX = Math.max(...xs),
    minY = Math.min(...ys),
    maxY = Math.max(...ys);
  const w = Math.max(maxX - minX, 1),
    h = Math.max(maxY - minY, 1);
  const k = Math.min((svgW - 2 * padX) / w, (svgH - 2 * padY) / h);
  const ox = svgW / 2 - ((minX + maxX) / 2) * k;
  const oy = svgH / 2 - ((minY + maxY) / 2) * k;
  return {
    k,
    project: (p) => {
      const [x, y] = raw(p);
      return [ox + x * k, oy + y * k];
    },
    dir: (v) => {
      const [x, y] = raw(v);
      return [x * k, y * k];
    },
  };
}
