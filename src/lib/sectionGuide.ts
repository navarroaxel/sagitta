// Math behind the /corte-de-seccion guide (pure, unit-testable): σ = N/A + Mx·y/Ix + My·x/Iy over the
// bounding rectangle of an I section, in the units of the course's exercises: kg and cm (moments are
// typed in kg·m, as the solver prints them). Same convention as stress3d.ts / sectionCut.ts: Mx > 0
// tensions the +y fibres, My > 0 the +x fibres, N > 0 is tension. Presentation only.
import { getProfile } from "./profiles";

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
