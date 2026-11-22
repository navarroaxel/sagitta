// Moments of plane areas (static moments, centroids, Steiner, rotated and principal axes), as in the course notes
// "Momentos de superficies planas". Pure functions, any consistent units.

export interface AreaPart {
  /** Area (negative for a hole) — or a mass, for a discrete system of weights. */
  A: number;
  xg: number;
  yg: number;
}

/** Static moments about X and Y and the centroid of a set of parts: xg = Σ Ai·xi / ΣAi, yg = Σ Ai·yi / ΣAi. */
export function centroid(parts: AreaPart[]) {
  const A = parts.reduce((s, p) => s + p.A, 0);
  const Sx = parts.reduce((s, p) => s + p.A * p.yg, 0);
  const Sy = parts.reduce((s, p) => s + p.A * p.xg, 0);
  return { A, Sx, Sy, xg: Sy / A, yg: Sx / A };
}

/** Jx of a rectangle b × h about its horizontal centroidal axis. */
export function rectJ(b: number, h: number): number {
  return (b * h ** 3) / 12;
}

/** Steiner: J about an axis at distance d from the parallel centroidal one: J = Jg + A·d². */
export function steiner(Jg: number, A: number, d: number): number {
  return Jg + A * d * d;
}

/** Product of inertia about axes displaced a (in x) and b (in y) from the centroidal ones: Jxy = Jxgyg + A·a·b. */
export function steinerXY(Jxgyg: number, A: number, a: number, b: number): number {
  return Jxgyg + A * a * b;
}

/** Radius of gyration i = √(J/A). */
export function gyration(J: number, A: number): number {
  return Math.sqrt(J / A);
}

/** Moments about axes X′, Y′ rotated an angle α (radians) about the same origin (x′ = x·cosα + y·sinα). */
export function rotate(Jx: number, Jy: number, Jxy: number, alpha: number) {
  const c2 = Math.cos(alpha) ** 2;
  const s2 = Math.sin(alpha) ** 2;
  const s2a = Math.sin(2 * alpha);
  return {
    Jx: Jx * c2 + Jy * s2 - Jxy * s2a,
    Jy: Jx * s2 + Jy * c2 + Jxy * s2a,
    Jxy: Jxy * Math.cos(2 * alpha) + ((Jx - Jy) / 2) * s2a,
  };
}

/**
 * Principal axes: tg 2α₁ = 2·Jxy / (Jy − Jx) (the notes' formula, α₁ in radians; the other principal axis is at
 * α₁ + 90°). The principal moments are the extremes, J1 ≥ J2, with zero product of inertia about those axes.
 */
export function principal(Jx: number, Jy: number, Jxy: number) {
  const alpha1 = 0.5 * Math.atan2(2 * Jxy, Jy - Jx);
  const m = (Jx + Jy) / 2;
  const r = Math.hypot((Jx - Jy) / 2, Jxy);
  return { alpha1, J1: m + r, J2: m - r };
}
