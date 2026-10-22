// Eccentric axial load on a rolled I section (oblique compound bending), pure and unit-testable.
// Section axes as in sectionCut/stress3d: x-x is perpendicular to the web (flange width),
// y-y is parallel to the web (depth); unrotated, the profile's strong axis is x (Ix) and the
// depth runs along y. A load P_z (N > 0 tension) applied at (ex, ey) from the centroid reduces to
//   N = P_z,  Mx = P_z·ey (bends about x, acts on Ix),  My = P_z·ex (bends about y, acts on Iy)
// and σ(x, y) = N/A + Mx·y/Ix + My·x/Iy — tension on the side of the load, as in stress3d.
// Units: kN and cm (stresses in kN/cm²), unlike sectionCut which works in m.
import { Profile } from "./profiles";

export interface EccentricInput {
  profile: Profile;
  rotated: boolean;
  P: number; // kN, > 0 tension
  ex: number; // cm, along x (perpendicular to the web)
  ey: number; // cm, along y (parallel to the web)
  sigmaAdm: number; // kN/cm²
}

export interface EccentricCorner {
  x: number; // cm
  y: number; // cm
  sN: number; // σ from N
  sMx: number; // σ from Mx = Mx·y/Ix
  sMy: number; // σ from My = My·x/Iy
  sigma: number; // sum
  perKN: number; // σ per kN of P_z (the coefficient 1/A ± ey/Wx ± ex/Wy)
}

export interface EccentricResult {
  A: number; // cm²
  Ix: number; // cm⁴ (about x)
  Iy: number; // cm⁴ (about y)
  halfX: number; // cm
  halfY: number; // cm
  Wx: number; // cm³ = Ix / halfY
  Wy: number; // cm³ = Iy / halfX
  N: number; // kN
  Mx: number; // kN·cm
  My: number; // kN·cm
  corners: EccentricCorner[]; // (+x,+y), (+x,−y), (−x,+y), (−x,−y)
  critical: EccentricCorner; // largest |σ|
  ratio: number; // |σ|max / σ adm
  ok: boolean;
  kMax: number; // cm⁻², the largest |σ| per kN of P_z over the corners (1/A ± ey/Wx ± ex/Wy)
  Pmax: number; // kN, the |P_z| that brings the critical corner to σ adm (0 if σ adm ≤ 0; Infinity if σ doesn't depend on P)
  inside: boolean; // the load point lies within the section's bounding box
  neutral: [[number, number], [number, number]] | null; // σ = 0 line (cm), clipped to 1.25× the section box
}

// Section properties as used by the 3D stress check (profile table in cm).
export function sectionProps(profile: Profile, rotated: boolean) {
  const half = profile.h / 20,
    halfB = profile.bf / 20;
  return rotated
    ? { A: profile.A, Ix: profile.Iy, Iy: profile.Ix, halfX: half, halfY: halfB }
    : { A: profile.A, Ix: profile.Ix, Iy: profile.Iy, halfX: halfB, halfY: half };
}

export function eccentricLoad(input: EccentricInput): EccentricResult {
  const { profile, rotated, P, ex, ey, sigmaAdm } = input;
  const { A, Ix, Iy, halfX, halfY } = sectionProps(profile, rotated);
  const N = P,
    Mx = P * ey,
    My = P * ex;
  const corners: EccentricCorner[] = (
    [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ] as [number, number][]
  ).map(([sx, sy]) => {
    const x = sx * halfX,
      y = sy * halfY;
    const perKN = 1 / A + (ey * y) / Ix + (ex * x) / Iy;
    return { x, y, sN: N / A, sMx: (Mx * y) / Ix, sMy: (My * x) / Iy, sigma: P * perKN, perKN };
  });
  const critical = corners.reduce((b, c) => (Math.abs(c.sigma) > Math.abs(b.sigma) + 1e-12 ? c : b));
  const k = Math.max(...corners.map((c) => Math.abs(c.perKN)));
  const ratio = sigmaAdm > 0 ? Math.abs(critical.sigma) / sigmaAdm : Infinity;

  // σ = a + b·x + c·y = 0 per kN (the line does not depend on the magnitude of P)
  const a = 1 / A,
    b = ex / Iy,
    c = ey / Ix;
  const X = 1.25 * halfX,
    Y = 1.25 * halfY;
  const hits: [number, number][] = [];
  const push = (x: number, y: number) => {
    if (Math.abs(x) <= X + 1e-9 && Math.abs(y) <= Y + 1e-9) hits.push([x, y]);
  };
  if (Math.abs(c) > 1e-12) {
    push(-X, (-a + b * X) / c);
    push(X, (-a - b * X) / c);
  }
  if (Math.abs(b) > 1e-12) {
    push((-a + c * Y) / b, -Y);
    push((-a - c * Y) / b, Y);
  }
  const distinct = hits.filter(
    (h, i) => hits.findIndex((g) => Math.hypot(g[0] - h[0], g[1] - h[1]) < 1e-9) === i,
  );
  const neutral =
    distinct.length >= 2 ? ([distinct[0], distinct[1]] as [[number, number], [number, number]]) : null;

  return {
    A,
    Ix,
    Iy,
    halfX,
    halfY,
    Wx: Ix / halfY,
    Wy: Iy / halfX,
    N,
    Mx,
    My,
    corners,
    critical,
    ratio,
    ok: ratio <= 1,
    kMax: k,
    Pmax: k > 0 ? Math.max(sigmaAdm, 0) / k : Infinity,
    inside: Math.abs(ex) <= halfX && Math.abs(ey) <= halfY,
    neutral,
  };
}
