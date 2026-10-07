// Normal-stress check for members with a tabulated profile (pure, unit-testable).
//   σ(x, y) = N/A + Mx·y/Ix + My·x/Iy
// in the course triad (z along the member, x out of the plane, y the section depth for an
// unrotated profile; Mx, My positive when they tension the +y / +x fibres, see sampling3d.ts). For a doubly symmetric I
// section the extreme values are at the four corners of the bounding box.
// Forces in kN and lengths in m give kN/m²; results are reported in kN/cm² (1 kN/cm² = 10 MPa).
import { FrameModel3D, Member3D, Material3D } from "./types3d";
import { SolveOutput3D } from "./solve3d";
import { getProfile } from "./profiles";

export interface Section {
  A: number; // m²
  Ix: number; // m⁴, about the x axis (bending in the y-z plane)
  Iy: number; // m⁴, about the y axis
  J: number; // m⁴
  halfX?: number; // half width along x, m (only with a profile)
  halfY?: number; // half depth along y, m
}

// Section of a member: the tabulated profile when assigned, otherwise the global material.
// Unrotated: the profile's strong axis is x (depth along y); rotated swaps them.
export function memberSection(material: Material3D, member: Member3D): Section {
  const p = getProfile(member.profile);
  if (!p) return { A: material.A, Ix: material.Ix, Iy: material.Iy, J: material.J };
  const strong = p.Ix * 1e-8,
    weak = p.Iy * 1e-8;
  const half = p.h / 2000,
    halfB = p.bf / 2000;
  return member.rotated
    ? { A: p.A * 1e-4, Ix: weak, Iy: strong, J: p.J * 1e-8, halfX: half, halfY: halfB }
    : { A: p.A * 1e-4, Ix: strong, Iy: weak, J: p.J * 1e-8, halfX: halfB, halfY: half };
}

export interface MemberStress {
  profile: string;
  sigma: number[]; // governing signed σ (kN/cm²) at every station
  max: { sigma: number; z: number; cx: number; cy: number }; // largest |σ|: position z, corner (x, y)
  ratio: number; // |σ|max / σ adm
  ok: boolean;
}

export type StressResult = (MemberStress | null)[]; // null: member without a profile

const CORNERS: [number, number][] = [
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

export function computeStress(model: FrameModel3D, solved: SolveOutput3D): StressResult {
  return model.members.map((m, e) => {
    const sec = memberSection(model.material, m);
    if (sec.halfX === undefined || sec.halfY === undefined) return null;
    let best = { sigma: 0, z: 0, cx: 0, cy: 0 };
    const sigma = solved.stations[e].map((st) => {
      let gov = 0,
        gx = 0,
        gy = 0;
      for (const [sx, sy] of CORNERS) {
        const x = sx * sec.halfX!,
          y = sy * sec.halfY!;
        const s = (st.N / sec.A + (st.Mx * y) / sec.Ix + (st.My * x) / sec.Iy) / 1e4; // kN/cm²
        if (Math.abs(s) > Math.abs(gov) + 1e-12) {
          gov = s;
          gx = x;
          gy = y;
        }
      }
      if (Math.abs(gov) > Math.abs(best.sigma)) best = { sigma: gov, z: st.z, cx: gx, cy: gy };
      return gov;
    });
    const ratio = model.sigmaAdm > 0 ? Math.abs(best.sigma) / model.sigmaAdm : Infinity;
    return { profile: m.profile!, sigma, max: best, ratio, ok: ratio <= 1 };
  });
}

// green (0) -> red (1); anything above 1 is the failing red
export function ratioColor(ratio: number): string {
  if (ratio > 1) return "#b91c1c";
  return `hsl(${Math.round(120 * (1 - ratio))}, 70%, 40%)`;
}
