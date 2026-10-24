// Stress state of one cross-section of a member (pure, unit-testable).
// Course triad (left-handed, as in the course): drawn with x to the right, y up and z into the
// page (along the member).
// Stresses in kN/cm²; forces in kN and m.
import { FrameModel3D } from "./types3d";
import { SolveOutput3D } from "./solve3d";
import { getProfile, Profile } from "./profiles";
import { memberSection } from "./stress3d";
import type { Station3D } from "./sampling3d";

export interface CutCorner {
  x: number; // m
  y: number; // m
  sN: number; // σ from N (uniform)
  sMx: number; // σ from Mx: Mx·y/Ix
  sMy: number; // σ from My: My·x/Iy
  sigma: number; // sum
}

export interface SectionCutData {
  profile: Profile;
  rotated: boolean;
  station: number; // index into solved.stations[e]
  z: number; // position along the member's z axis, m
  N: number;
  Mx: number;
  My: number;
  T: number;
  Qx: number;
  Qy: number;
  A: number; // m²
  Ix: number; // m⁴
  Iy: number; // m⁴
  halfX: number; // half width along x, m
  halfY: number; // half depth along y, m
  corners: CutCorner[]; // (+x,+y), (+x,−y), (−x,+y), (−x,−y)
  critical: CutCorner; // largest |σ|
  neutral: [[number, number], [number, number]] | null; // σ = 0 line, clipped to a box 1.25× the section
}

// Outline of the I section in (x, y) mm, centred, flanges parallel to x unless rotated.
export function sectionOutline(p: Profile, rotated: boolean): [number, number][] {
  const H = p.h / 2,
    B = p.bf / 2,
    w = p.tw / 2,
    f = p.tf;
  const pts: [number, number][] = [
    [-B, -H],
    [B, -H],
    [B, -H + f],
    [w, -H + f],
    [w, H - f],
    [B, H - f],
    [B, H],
    [-B, H],
    [-B, H - f],
    [-w, H - f],
    [-w, -H + f],
    [-B, -H + f],
  ];
  return rotated ? pts.map(([a, b]) => [b, a]) : pts;
}

// Index of the station closest to position z (m, along the member's z axis) on member e.
export function nearestStation(solved: SolveOutput3D, e: number, z: number): number {
  const st = solved.stations[e];
  let best = 0;
  st.forEach((s, k) => {
    if (Math.abs(s.z - z) < Math.abs(st[best].z - z)) best = k;
  });
  return best;
}

export function cutAt(
  model: FrameModel3D,
  solved: SolveOutput3D,
  e: number,
  station: number,
): SectionCutData | null {
  const m = model.members[e];
  const p = getProfile(m?.profile);
  if (!m || !p) return null;
  const sec = memberSection(model.material, m);
  const st = solved.stations[e][station];
  if (!st || sec.halfX === undefined || sec.halfY === undefined) return null;
  const { halfX, halfY } = sec;
  const corners: CutCorner[] = (
    [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ] as [number, number][]
  ).map(([sx, sy]) => {
    const x = sx * halfX,
      y = sy * halfY;
    const sN = st.N / sec.A / 1e4;
    const sMx = (st.Mx * y) / sec.Ix / 1e4;
    const sMy = (st.My * x) / sec.Iy / 1e4;
    return { x, y, sN, sMx, sMy, sigma: sN + sMx + sMy };
  });
  const critical = corners.reduce((b, c) => (Math.abs(c.sigma) > Math.abs(b.sigma) + 1e-12 ? c : b));

  // σ(x,y) = a + b·x + c·y = 0, clipped to the box [−k·halfX, k·halfX] × [−k·halfY, k·halfY]
  const a = st.N / sec.A / 1e4;
  const b = st.My / sec.Iy / 1e4;
  const c = st.Mx / sec.Ix / 1e4;
  const k = 1.25;
  const X = k * halfX,
    Y = k * halfY;
  const hits: [number, number][] = [];
  const push = (x: number, y: number) => {
    if (Math.abs(x) <= X + 1e-9 && Math.abs(y) <= Y + 1e-9) hits.push([x, y]);
  };
  if (Math.abs(c) > 1e-12) {
    push(-X, (-a - b * -X) / c);
    push(X, (-a - b * X) / c);
  }
  if (Math.abs(b) > 1e-12) {
    push((-a - c * -Y) / b, -Y);
    push((-a - c * Y) / b, Y);
  }
  const distinct = hits.filter(
    (h, i) => hits.findIndex((g) => Math.hypot(g[0] - h[0], g[1] - h[1]) < 1e-9) === i,
  );
  const neutral =
    distinct.length >= 2 ? ([distinct[0], distinct[1]] as [[number, number], [number, number]]) : null;

  return {
    profile: p,
    rotated: !!m.rotated,
    station,
    z: st.z,
    N: st.N,
    Mx: st.Mx,
    My: st.My,
    T: st.T,
    Qx: st.Qx,
    Qy: st.Qy,
    A: sec.A,
    Ix: sec.Ix,
    Iy: sec.Iy,
    halfX,
    halfY,
    corners,
    critical,
    neutral,
  };
}

// σ (kN/cm²) at (x, y) m of the cut: the same linear field the corners sample.
export function stressAt(d: SectionCutData, x: number, y: number): number {
  return (d.N / d.A + (d.Mx * y) / d.Ix + (d.My * x) / d.Iy) / 1e4;
}

// The I section as three rectangles [x0, y0, x1, y1] in mm (flange, web, flange), flanges
// parallel to x unless rotated. Used to paint the section cell by cell.
export function sectionRects(p: Profile, rotated: boolean): [number, number, number, number][] {
  const H = p.h / 2,
    B = p.bf / 2,
    w = p.tw / 2,
    f = p.tf;
  const rects: [number, number, number, number][] = [
    [-B, -H, B, -H + f],
    [-w, -H + f, w, H - f],
    [-B, H - f, B, H],
  ];
  return rotated ? rects.map(([a, b, c, d]) => [b, a, d, c]) : rects;
}

// σ over the whole member: the section of the cut (A, I, half sizes) with N, Mx, My taken from the
// solver's stations, linearly interpolated along z. `at` is in kN/cm² (m for x, y and z);
// `maxAbs` is the largest |σ| at any station and corner (what the colours are scaled by).
export interface StressField {
  at: (x: number, y: number, z: number) => number;
  maxAbs: number;
}

export function memberStressField(
  d: Pick<SectionCutData, "A" | "Ix" | "Iy" | "halfX" | "halfY">,
  stations: Station3D[],
): StressField {
  const st = [...stations].sort((a, b) => a.z - b.z);
  const forces = (z: number) => {
    if (st.length === 0) return { N: 0, Mx: 0, My: 0 };
    if (z <= st[0].z) return st[0];
    if (z >= st[st.length - 1].z) return st[st.length - 1];
    let lo = 0,
      hi = st.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (st[mid].z <= z) lo = mid;
      else hi = mid;
    }
    const a = st[lo],
      b = st[hi];
    const dz = b.z - a.z;
    if (dz < 1e-9) return b; // the pair of stations at a jump
    const u = (z - a.z) / dz;
    return { N: a.N + (b.N - a.N) * u, Mx: a.Mx + (b.Mx - a.Mx) * u, My: a.My + (b.My - a.My) * u };
  };
  const at = (x: number, y: number, z: number) => {
    const f = forces(z);
    return (f.N / d.A + (f.Mx * y) / d.Ix + (f.My * x) / d.Iy) / 1e4;
  };
  let maxAbs = 0;
  st.forEach((f) =>
    [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ].forEach(([sx, sy]) => {
      const v = at(sx * d.halfX, sy * d.halfY, f.z);
      maxAbs = Math.max(maxAbs, Math.abs(v));
    }),
  );
  return { at, maxAbs };
}
