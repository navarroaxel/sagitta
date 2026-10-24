// Geometry of the resultant ("oblique") stress diagram as the professor draws it, in the plane of
// the section: the neutral axis (E.N.), two lines parallel to it through the extreme fibres, and
// a baseline PERPENDICULAR to the E.N. on which σ is plotted as two triangles (+ / −), the
// ordinates lying along the parallels themselves. So the whole diagram is tilted with the E.N.
// Pure, in screen px (y down). Returns null when σ is (practically) uniform.
import { SIGMA_EPS, SectionCutData, stressAt } from "./sectionCut";

export interface ResultantEnd {
  corner: [number, number]; // screen position of the extreme corner
  sigma: number; // σ there (force unit/cm²)
  t: number; // where the parallel through it meets the baseline (px along the baseline)
}

export interface ResultantLayout {
  e: [number, number]; // unit screen direction of the neutral axis
  u: [number, number]; // unit direction of the baseline (σ grows along it), ⟂ e
  n: [number, number]; // direction of the ordinates for σ > 0 (along e, pointing away from the section)
  hi: ResultantEnd; // largest σ
  lo: ResultantEnd; // smallest σ
  t0: number; // where the neutral axis meets the baseline (0: the baseline starts on it)
  at: (t: number) => [number, number]; // screen point of the baseline at t
  sigmaAt: (t: number) => number;
}

export interface ResultantOptions {
  cx: number; // screen position of the section's centroid
  cy: number;
  s: number; // px per mm of the section drawing
  dist: number; // px from the centroid to the baseline, along the E.N. direction
}

export function resultantLayout(d: SectionCutData, o: ResultantOptions): ResultantLayout | null {
  const { cx, cy, s } = o;
  const f = (X: number, Y: number) => stressAt(d, (X - cx) / (1000 * s), (cy - Y) / (1000 * s));
  const gX = f(cx + 1, cy) - f(cx, cy);
  const gY = f(cx, cy + 1) - f(cx, cy);
  const gn = Math.hypot(gX, gY);
  if (gn < 1e-14) return null; // uniform σ: there is no neutral axis
  // σ barely changes over the section (all of it noise, or only N with a bending that does not show):
  // the E.N. would be absurdly far away and the "diagram" a magnified rounding error
  const sigmas = d.corners.map((c) => c.sigma);
  if (Math.max(...sigmas) - Math.min(...sigmas) < SIGMA_EPS) return null;
  // every corner below the threshold is a zero too, however different they are from each other
  if (Math.max(...sigmas.map(Math.abs)) < SIGMA_EPS) return null;
  const u: [number, number] = [gX / gn, gY / gn];
  const e: [number, number] = [-u[1], u[0]];
  // the ordinates go away from the section, towards the bottom of the screen
  const n: [number, number] = e[1] > 1e-9 || (Math.abs(e[1]) <= 1e-9 && e[0] > 0) ? e : [-e[0], -e[1]];

  // the point of the E.N. nearest to the centroid, then slid along it to put the baseline clear
  const tau = -f(cx, cy) / gn;
  const q0: [number, number] = [cx + u[0] * tau + n[0] * o.dist, cy + u[1] * tau + n[1] * o.dist];
  const at = (t: number): [number, number] => [q0[0] + u[0] * t, q0[1] + u[1] * t];
  const sigmaAt = (t: number) => gn * t; // q0 lies on the E.N., where σ = 0

  const px = (c: { x: number; y: number }): [number, number] => [cx + c.x * 1000 * s, cy - c.y * 1000 * s];
  const sorted = [...d.corners].sort((a, b) => a.sigma - b.sigma);
  const loC = sorted[0],
    hiC = sorted[sorted.length - 1];
  return {
    e,
    u,
    n,
    hi: { corner: px(hiC), sigma: hiC.sigma, t: hiC.sigma / gn },
    lo: { corner: px(loC), sigma: loC.sigma, t: loC.sigma / gn },
    t0: 0,
    at,
    sigmaAt,
  };
}
