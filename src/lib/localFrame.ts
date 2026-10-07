// Local triad used by the course (presentation only — the solver keeps its own x'-along-member
// frame, see solver3d.ts):
//   z: along the member, pointing down (or to the left when the member is horizontal),
//   x: out of the plane (towards the viewer, −Y, for a frame in the x-z plane),
//   y: completes the right-handed triad (x × y = z); it is the depth direction of the section.
// For the planar frame in the x-z plane this gives, for a column: z down, x out of the page,
// y to the left; for a beam: z to the left, x out of the page, y up.
import type { Solver3DGeo, Vec3 } from "./solver3d";

export interface CourseFrame {
  x: Vec3;
  y: Vec3;
  z: Vec3;
  flip: boolean; // true when z points from node j to node i (z = −x' of the solver)
}

const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const neg = (a: Vec3): Vec3 => [-a[0], -a[1], -a[2]];
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const unit = (a: Vec3): Vec3 => {
  const n = Math.hypot(...a);
  return [a[0] / n, a[1] / n, a[2] / n];
};

export function courseFrame(g: Solver3DGeo): CourseFrame {
  const e = g.ex;
  const EPS = 1e-9;
  let z: Vec3;
  if (Math.abs(e[2]) > EPS) z = e[2] > 0 ? neg(e) : e; // not horizontal: down
  else if (Math.abs(e[0]) > EPS) z = e[0] > 0 ? neg(e) : e; // horizontal: to the left (−X)
  else z = e[1] > 0 ? neg(e) : e; // along Y: −Y
  const vertical = Math.abs(z[2]) > 1 - EPS;
  const ref: Vec3 = vertical ? [-1, 0, 0] : [0, 0, 1];
  const k = dot(ref, z);
  const y = unit([ref[0] - k * z[0], ref[1] - k * z[1], ref[2] - k * z[2]]);
  const x = cross(y, z);
  return { x, y, z, flip: dot(z, e) < 0 };
}

// components of a global vector in the solver's local basis (x', y', z')
export const inSolverBasis = (g: Solver3DGeo, v: Vec3): Vec3 => [
  dot(v, g.ex),
  dot(v, g.ey),
  dot(v, g.ez),
];
