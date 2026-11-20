// Math behind the /corte-de-seccion guide (pure, unit-testable): σ = N/A + Mx·y/Ix + My·x/Iy over the
// bounding rectangle of an I section, in the units of the course's exercises: kg and cm (moments are
// typed in kg·m, as the solver prints them). Same convention as stress3d.ts / sectionCut.ts: Mx > 0
// tensions the +y fibres, My > 0 the +x fibres, N > 0 is tension. Presentation only.
import { getProfile } from "./profiles";
import { SIGMA_EPS } from "./sectionCut";

export interface GuideSection {
  A: number; // cm²
  Ix: number; // cm⁴, about x (stress varies with y)
  Iy: number; // cm⁴, about y (stress varies with x)
  hx: number; // half width along x, cm
  hy: number; // half depth along y, cm
  tf: number; // flange thickness, cm
  tw: number; // web thickness, cm
  rotated: boolean;
}

// Profile of the table as the section sees it: unrotated, the strong axis is x and the depth runs along y.
export function guideSection(name: string, rotated: boolean): GuideSection {
  const p = getProfile(name);
  if (!p) throw new Error(`unknown profile ${name}`);
  const h = p.h / 20,
    b = p.bf / 20;
  return rotated
    ? { A: p.A, Ix: p.Iy, Iy: p.Ix, hx: h, hy: b, tf: p.tf / 10, tw: p.tw / 10, rotated }
    : { A: p.A, Ix: p.Ix, Iy: p.Iy, hx: b, hy: h, tf: p.tf / 10, tw: p.tw / 10, rotated };
}

// σ(x, y) = c + b·y + a·x, in kg/cm² with x, y in cm.
export interface Plane {
  a: number; // My·100 / Iy
  b: number; // Mx·100 / Ix
  c: number; // N / A
}

export function plane(N: number, MxKgm: number, MyKgm: number, s: GuideSection): Plane {
  return { a: (MyKgm * 100) / s.Iy, b: (MxKgm * 100) / s.Ix, c: N / s.A };
}

export const sigmaAt = (k: Plane, x: number, y: number): number => k.c + k.b * y + k.a * x;

export interface GuideCorner {
  x: number;
  y: number;
  sN: number;
  sMx: number;
  sMy: number;
  sigma: number;
}

// (+x,+y), (−x,+y), (−x,−y), (+x,−y)
export function guideCorners(k: Plane, s: GuideSection): GuideCorner[] {
  return (
    [
      [1, 1],
      [-1, 1],
      [-1, -1],
      [1, -1],
    ] as const
  ).map(([cx, cy]) => {
    const x = cx * s.hx,
      y = cy * s.hy;
    return { x, y, sN: k.c, sMx: k.b * y, sMy: k.a * x, sigma: sigmaAt(k, x, y) };
  });
}

// σ is the same over the whole section (range of the corner values below the app's zero tolerance): no E.N.
export const isUniform = (k: Plane, s: GuideSection): boolean => {
  const sig = guideCorners(k, s).map((c) => c.sigma);
  return Math.max(...sig) - Math.min(...sig) < SIGMA_EPS;
};

export const criticalCorner = (cs: GuideCorner[]): GuideCorner =>
  cs.reduce((m, q) => (Math.abs(q.sigma) > Math.abs(m.sigma) ? q : m));

// Where the neutral axis crosses the x axis (y = 0) and the y axis (x = 0), cm. null: it does not cross
// (parallel to that axis, or σ is uniform).
export function neutralIntercepts(k: Plane): { x0: number | null; y0: number | null } {
  return {
    x0: Math.abs(k.a) > 1e-9 ? -k.c / k.a : null,
    y0: Math.abs(k.b) > 1e-9 ? -k.c / k.b : null,
  };
}

// The σ = 0 line clipped to the bounding rectangle; null when there is none (σ uniform).
export function neutralSegment(k: Plane, s: GuideSection): [[number, number], [number, number]] | null {
  if (Math.abs(k.a) < 1e-9 && Math.abs(k.b) < 1e-9) return null;
  const found: [number, number][] = [];
  const add = (x: number, y: number) => {
    if (!found.some((p) => Math.abs(p[0] - x) < 1e-6 && Math.abs(p[1] - y) < 1e-6)) found.push([x, y]);
  };
  if (Math.abs(k.b) > 1e-9)
    for (const x of [-s.hx, s.hx]) {
      const y = -(k.c + k.a * x) / k.b;
      if (Math.abs(y) <= s.hy + 1e-9) add(x, y);
    }
  if (Math.abs(k.a) > 1e-9)
    for (const y of [-s.hy, s.hy]) {
      const x = -(k.c + k.b * y) / k.a;
      if (Math.abs(x) <= s.hx + 1e-9) add(x, y);
    }
  return found.length >= 2 ? [found[0], found[1]] : null;
}

// The part of the bounding rectangle where s·σ ≥ 0 (s = +1 tension, −1 compression): Sutherland–Hodgman.
export function halfPlanePolygon(k: Plane, s: GuideSection, sign: 1 | -1): [number, number][] {
  const f = (p: [number, number]) => sign * sigmaAt(k, p[0], p[1]);
  const sq: [number, number][] = [
    [-s.hx, -s.hy],
    [s.hx, -s.hy],
    [s.hx, s.hy],
    [-s.hx, s.hy],
  ];
  const out: [number, number][] = [];
  sq.forEach((p, i) => {
    const q = sq[(i + 1) % sq.length];
    const fp = f(p),
      fq = f(q);
    if (fp >= 0) out.push(p);
    if (fp >= 0 !== fq >= 0) {
      const t = fp / (fp - fq);
      out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]);
    }
  });
  return out;
}

// One closed outline of the I section in cm (12 vertices, no fillets): flanges along x on face 1, turned (an H) on
// face 2. A single polygon, so it can be stroked without the inner lines that overlapping rectangles leave.
export function guideOutline(s: GuideSection): [number, number][] {
  const { hx, hy, tf, tw } = s,
    w = tw / 2;
  return s.rotated
    ? [
        [-hx, -hy], [-hx + tf, -hy], [-hx + tf, -w], [hx - tf, -w], [hx - tf, -hy], [hx, -hy],
        [hx, hy], [hx - tf, hy], [hx - tf, w], [-hx + tf, w], [-hx + tf, hy], [-hx, hy],
      ]
    : [
        [-hx, -hy], [hx, -hy], [hx, -hy + tf], [w, -hy + tf], [w, hy - tf], [hx, hy - tf],
        [hx, hy], [-hx, hy], [-hx, hy - tf], [-w, hy - tf], [-w, -hy + tf], [-hx, -hy + tf],
      ];
}

// Geometry of the professor's resultant diagram (the same construction as resultantDiagram.ts, here in cm with
// y up and without the screen): the E.N., two lines PARALLEL to it through the extreme fibres, and a baseline
// PERPENDICULAR to the E.N. (σ grows along it) with the ordinates lying along the parallels. null: σ uniform.
export interface GuideResultant {
  u: [number, number]; // unit direction of the baseline (σ grows along it)
  e: [number, number]; // unit direction of the E.N. and of the ordinates, e ⟂ u
  n: [number, number]; // e pointing away from the section (down): the + ordinates go this way
  gn: number; // |∇σ|, kg/cm² per cm
  hi: { corner: [number, number]; sigma: number; t: number };
  lo: { corner: [number, number]; sigma: number; t: number };
  at: (t: number) => [number, number]; // point of the baseline at t (t = 0 is where the E.N. crosses it)
}

export function resultantGuide(k: Plane, s: GuideSection, dist: number): GuideResultant | null {
  const gn = Math.hypot(k.a, k.b);
  const cs = guideCorners(k, s);
  const sig = cs.map((c) => c.sigma);
  if (gn < 1e-9 || Math.max(...sig) - Math.min(...sig) < SIGMA_EPS) return null; // uniform σ: no E.N.
  const u: [number, number] = [k.a / gn, k.b / gn];
  const e: [number, number] = [-u[1], u[0]];
  const n: [number, number] = e[1] < -1e-9 || (Math.abs(e[1]) <= 1e-9 && e[0] > 0) ? e : [-e[0], -e[1]];
  const tau = -k.c / gn; // the point of the E.N. nearest to the centroid is u·tau
  const q0: [number, number] = [u[0] * tau + n[0] * dist, u[1] * tau + n[1] * dist];
  const at = (t: number): [number, number] => [q0[0] + u[0] * t, q0[1] + u[1] * t];
  const sorted = [...cs].sort((a, b) => a.sigma - b.sigma);
  const loC = sorted[0],
    hiC = sorted[sorted.length - 1];
  const end = (c: GuideCorner) => ({ corner: [c.x, c.y] as [number, number], sigma: c.sigma, t: c.sigma / gn });
  return { u, e, n, gn, hi: end(hiC), lo: end(loC), at };
}
