// Stress state of one cross-section of a member (pure, unit-testable).
// Axes follow the member's local frame: y' to the right, z' up, x' out of the page
// (looking from the j end back towards i). Stresses in kN/cm²; forces in kN and m.
import { FrameModel3D } from "./types3d";
import { SolveOutput3D } from "./solve3d";
import { getProfile, Profile } from "./profiles";
import { memberSection } from "./stress3d";

export interface CutCorner {
  y: number; // m
  z: number; // m
  sN: number; // σ from N (uniform)
  sMy: number; // σ from My: −My·z/Iy
  sMz: number; // σ from Mz: −Mz·y/Iz
  sigma: number; // sum
}

export interface SectionCutData {
  profile: Profile;
  rotated: boolean;
  station: number; // index into solved.stations[e]
  x: number; // position along the member, m
  N: number;
  My: number;
  Mz: number;
  T: number;
  Qy: number;
  Qz: number;
  cy: number; // half width along y', m
  cz: number; // half depth along z', m
  corners: CutCorner[]; // (+y,+z), (+y,−z), (−y,+z), (−y,−z)
  critical: CutCorner; // largest |σ|
  neutral: [[number, number], [number, number]] | null; // σ = 0 line, clipped to a box 1.25× the section
}

// Outline of the I section in (y', z') mm, centred, flanges parallel to y' unless rotated.
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

// Index of the station closest to position x (m) on member e.
export function nearestStation(solved: SolveOutput3D, e: number, x: number): number {
  const st = solved.stations[e];
  let best = 0;
  st.forEach((s, k) => {
    if (Math.abs(s.x - x) < Math.abs(st[best].x - x)) best = k;
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
  if (!st || sec.cy === undefined || sec.cz === undefined) return null;
  const { cy, cz } = sec;
  const corners: CutCorner[] = (
    [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ] as [number, number][]
  ).map(([sy, sz]) => {
    const y = sy * cy,
      z = sz * cz;
    const sN = st.N / sec.A / 1e4;
    const sMy = (-st.My * z) / sec.Iy / 1e4;
    const sMz = (-st.Mz * y) / sec.Iz / 1e4;
    return { y, z, sN, sMy, sMz, sigma: sN + sMy + sMz };
  });
  const critical = corners.reduce((b, c) => (Math.abs(c.sigma) > Math.abs(b.sigma) + 1e-12 ? c : b));

  // σ(y,z) = a + b·y + c·z = 0, clipped to the box [−k·cy, k·cy] × [−k·cz, k·cz]
  const a = st.N / sec.A / 1e4;
  const b = -st.Mz / sec.Iz / 1e4;
  const c = -st.My / sec.Iy / 1e4;
  const k = 1.25;
  const Y = k * cy,
    Z = k * cz;
  const hits: [number, number][] = [];
  const push = (y: number, z: number) => {
    if (Math.abs(y) <= Y + 1e-9 && Math.abs(z) <= Z + 1e-9) hits.push([y, z]);
  };
  if (Math.abs(c) > 1e-12) {
    push(-Y, (-a - b * -Y) / c);
    push(Y, (-a - b * Y) / c);
  }
  if (Math.abs(b) > 1e-12) {
    push((-a - c * -Z) / b, -Z);
    push((-a - c * Z) / b, Z);
  }
  // keep two distinct end points
  const distinct = hits.filter(
    (h, i) => hits.findIndex((g) => Math.hypot(g[0] - h[0], g[1] - h[1]) < 1e-9) === i,
  );
  const neutral =
    distinct.length >= 2 ? ([distinct[0], distinct[1]] as [[number, number], [number, number]]) : null;

  return {
    profile: p,
    rotated: !!m.rotated,
    station,
    x: st.x,
    N: st.N,
    My: st.My,
    Mz: st.Mz,
    T: st.T,
    Qy: st.Qy,
    Qz: st.Qz,
    cy,
    cz,
    corners,
    critical,
    neutral,
  };
}
