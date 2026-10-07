// Normal-stress check for members with a tabulated profile (pure, unit-testable).
//   σ(y', z') = N/A − My·z'/Iy − Mz·y'/Iz
// (positive My / Mz put tension on the −z' / −y' side, see sampling3d.ts). For a doubly
// symmetric I section the extreme values are at the four corners of the bounding box.
// Forces in kN and lengths in m give kN/m²; results are reported in MPa.
import { FrameModel3D, Member3D, Material3D } from "./types3d";
import { SolveOutput3D } from "./solve3d";
import { getProfile } from "./profiles";

export interface Section {
  A: number; // m²
  Iy: number; // m⁴, bending in the x'-z' plane
  Iz: number; // m⁴, bending in the x'-y' plane
  J: number; // m⁴
  cy?: number; // half width along y', m (only with a profile)
  cz?: number; // half depth along z', m
}

// Section of a member: the tabulated profile when assigned, otherwise the global material.
export function memberSection(material: Material3D, member: Member3D): Section {
  const p = getProfile(member.profile);
  if (!p) return { A: material.A, Iy: material.Iy, Iz: material.Iz, J: material.J };
  const strong = p.Ix * 1e-8,
    weak = p.Iy * 1e-8;
  const half = p.h / 2000,
    halfB = p.bf / 2000;
  return member.rotated
    ? { A: p.A * 1e-4, Iy: weak, Iz: strong, J: p.J * 1e-8, cy: half, cz: halfB }
    : { A: p.A * 1e-4, Iy: strong, Iz: weak, J: p.J * 1e-8, cy: halfB, cz: half };
}

export interface MemberStress {
  profile: string;
  sigma: number[]; // governing signed σ (MPa) at every station
  max: { sigma: number; x: number; y: number; z: number }; // largest |σ|, y'/z' of its corner
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
    if (sec.cy === undefined || sec.cz === undefined) return null;
    let best = { sigma: 0, x: 0, y: 0, z: 0 };
    const sigma = solved.stations[e].map((st) => {
      let gov = 0,
        gy = 0,
        gz = 0;
      for (const [sy, sz] of CORNERS) {
        const y = sy * sec.cy!,
          z = sz * sec.cz!;
        const s = (st.N / sec.A - (st.My * z) / sec.Iy - (st.Mz * y) / sec.Iz) / 1000; // MPa
        if (Math.abs(s) > Math.abs(gov) + 1e-12) {
          gov = s;
          gy = y;
          gz = z;
        }
      }
      if (Math.abs(gov) > Math.abs(best.sigma))
        best = { sigma: gov, x: st.x, y: gy, z: gz };
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
