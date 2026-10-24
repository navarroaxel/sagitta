import { FrameModel3D } from "./types3d";

const material = { E: 2.1e8, G: 8.1e7, A: 0.01, Ix: 8.3e-5, Iy: 8.3e-5, J: 1.66e-4 };

// examples/t-frame-3d-fixed.svg — hat 2 m | 5 m, q_z acts on the right arm from 1 m to 5 m.
// q_y = 3 kN/m acts toward -Y (backward, away from the viewer: the course's Y points toward the viewer).
const tFrame: FrameModel3D = {
  nodes: [
    { id: "A", x: 0, y: 0, z: 0, support: "fixed" },
    { id: "B", x: 0, y: 0, z: 6, support: "free" },
    { id: "C", x: -2, y: 0, z: 6, support: "free" },
    { id: "D", x: 5, y: 0, z: 6, support: "free" },
  ],
  members: [
    // IPB 260 with the strong axis against q_y (54 kN·m): ~12.1 kN/cm²; IPB 240 would not pass.
    { id: "M1", n1: "A", n2: "B", profile: "IPB 260", rotated: true },
    { id: "M2", n1: "C", n2: "B", profile: "IPN 200" },
    { id: "M3", n1: "B", n2: "D", profile: "IPN 200" },
  ],
  loads: [
    { id: "L1", type: "mudl", member: "M1", gx: 0, gy: -3, gz: 0 },
    { id: "L2", type: "mudl", member: "M3", gx: 0, gy: 0, gz: -2, from: 1, to: 5 },
    { id: "L3", type: "nodal", node: "C", fx: 0, fy: 0, fz: 0, mx: 0, my: 5, mz: 0 },
  ],
  material,
  unit: "kN",
  sigmaAdm: 14, // kN/cm² (= 140 MPa)
};

// examples/t-frame-3d-fixed-kg.svg — 3 m column, 3 m beam (1 m left | 2 m right of the column),
// q_z = 200 kg/m over the whole beam, P_y = 300 kg at B. Kept in kg and kg/cm² as in the exercise
// (forces in kg, lengths in m -> stresses in kg/cm²), so E and G are in kg/m² (E = 2.1e6 kg/cm²).
const tFrameKg: FrameModel3D = {
  nodes: [
    { id: "A", x: 0, y: 0, z: 0, support: "fixed" },
    { id: "B", x: 0, y: 0, z: 3, support: "free" },
    { id: "C", x: -1, y: 0, z: 3, support: "free" },
    { id: "D", x: 2, y: 0, z: 3, support: "free" },
  ],
  members: [
    // IPB 120 with the strong axis against M_x (900 kg·m): ~86% of sigmaAdm (1209 kg/cm²); IPB 100 would not pass (137%).
    { id: "M1", n1: "A", n2: "B", profile: "IPB 120", rotated: true },
    { id: "M2", n1: "C", n2: "B", profile: "IPN 100" },
    { id: "M3", n1: "B", n2: "D", profile: "IPN 100" },
  ],
  loads: [
    { id: "L1", type: "mudl", member: "M2", gx: 0, gy: 0, gz: -200 },
    { id: "L2", type: "mudl", member: "M3", gx: 0, gy: 0, gz: -200 },
    { id: "L3", type: "nodal", node: "B", fx: 0, fy: 300, fz: 0, mx: 0, my: 0, mz: 0 },
  ],
  material: { ...material, E: 2.1e10, G: 8.1e9 },
  unit: "kg",
  sigmaAdm: 1400, // kg/cm²
};

// examples/t-frame-3d-fixed-kg-qy.svg — 4 m column fixed at A, 5 m beam (2 m left | 3 m right of the
// column). Loads in kg as in the figure: P_z1 = 100 kg in total spread over the 2 m left arm (the
// figure prints "100 kg" over distributed arrows, so 50 kg/m), P_z2 = 300 kg at the right tip and
// q_y1 = 500 kg/m on the lower 2 m of the column, along the course's +Y (toward the viewer, as y is
// drawn here: the solver's y is the course's Y, no sign change). The figure gives no
// profiles: these are the smallest that pass at sigmaAdm = 1400 kg/cm² (the global material only
// carries E/G, in kg/m²).
const tFrameQy: FrameModel3D = {
  nodes: [
    { id: "A", x: 0, y: 0, z: 0, support: "fixed" },
    { id: "B", x: 0, y: 0, z: 4, support: "free" },
    { id: "C", x: -2, y: 0, z: 4, support: "free" },
    { id: "D", x: 3, y: 0, z: 4, support: "free" },
  ],
  members: [
    // IPB 160 with the strong axis against q_y1 (75%); IPB 140 would not pass (107%)
    { id: "M1", n1: "A", n2: "B", profile: "IPB 160", rotated: true },
    // the beam arms share one profile: IPN 140 (79% at the right arm); IPN 120 would not pass (118%)
    { id: "M2", n1: "C", n2: "B", profile: "IPN 140" },
    { id: "M3", n1: "B", n2: "D", profile: "IPN 140" },
  ],
  loads: [
    { id: "L1", type: "mudl", member: "M1", gx: 0, gy: 500, gz: 0, from: 0, to: 2 },
    { id: "L2", type: "mudl", member: "M2", gx: 0, gy: 0, gz: -50 }, // 100 kg over 2 m
    { id: "L3", type: "nodal", node: "D", fx: 0, fy: 0, fz: -300, mx: 0, my: 0, mz: 0 },
  ],
  material: { ...material, E: 2.1e10, G: 8.1e9 },
  unit: "kg",
  sigmaAdm: 1400, // kg/cm²
};

// examples/frame-3d-fixed-kg-right-beam.svg — the professor's exercise: 5 m column fixed at A (the beam
// leaves it at z = 4 m, 1 m below the top C), 4 m beam to the right. Loads in kg as drawn: P_y1 = 200 kg
// at C along -Y (away from the viewer), q_x1 = 150 kg/m along +X on the lower 2 m of the column and
// q_z1 = 100 kg/m (-Z) on the beam from x = 2 to 4 m. Reactions at A: R_x = -300, R_y = 200,
// R_z = 200 kg, M_x = -1000, M_y = -900 kg·m (the professor's resolution, tested). The figure gives no
// profiles: the column is one IPB 160 (strong axis against q_x1 and the beam load, 81%; IPB 140 would
// not pass, 115%) and the beam an IPN 120 (78%; IPN 100 would not pass, 125%), at sigmaAdm = 1400 kg/cm².
const frameRightBeam: FrameModel3D = {
  nodes: [
    { id: "A", x: 0, y: 0, z: 0, support: "fixed" },
    { id: "B", x: 0, y: 0, z: 4, support: "free" },
    { id: "C", x: 0, y: 0, z: 5, support: "free" },
    { id: "D", x: 4, y: 0, z: 4, support: "free" },
  ],
  members: [
    { id: "M1", n1: "A", n2: "B", profile: "IPB 160", rotated: true },
    { id: "M2", n1: "B", n2: "C", profile: "IPB 160", rotated: true },
    { id: "M3", n1: "B", n2: "D", profile: "IPN 120" },
  ],
  loads: [
    { id: "L1", type: "mudl", member: "M1", gx: 150, gy: 0, gz: 0, from: 0, to: 2 },
    { id: "L2", type: "nodal", node: "C", fx: 0, fy: -200, fz: 0, mx: 0, my: 0, mz: 0 },
    { id: "L3", type: "mudl", member: "M3", gx: 0, gy: 0, gz: -100, from: 2, to: 4 },
  ],
  material: { ...material, E: 2.1e10, G: 8.1e9 },
  unit: "kg",
  sigmaAdm: 1400, // kg/cm²
};

// examples/frame-3d-fixed-kg-overhang.svg — 5 m column fixed at A, crossed by a beam at z = 4 m (1 m below the
// top C): 1 m to the left (E) and 4 m to the right (D). Loads in kg as drawn: P_z1 = 200 kg down at E,
// P_y1 = 100 kg at C along -Y (away from the viewer), q_z1 = 300 kg/m (-Z) on the beam from x = 2 to 4 m
// and q_x1 = 400 kg/m along -X on the lower 2 m of the column. Reactions at A (statics, tested):
// R_x = 800, R_y = 100, R_z = 800 kg, M_x = -500, M_y = -800 kg·m. The figure gives no profiles: the
// column is one IPB 140 (85%; IPB 120 would not pass, 126%) and the beam one IPN 180 (80%; IPN 160 would
// not pass, 110%), none of them rotated, at sigmaAdm = 1400 kg/cm².
const frameOverhang: FrameModel3D = {
  nodes: [
    { id: "A", x: 0, y: 0, z: 0, support: "fixed" },
    { id: "B", x: 0, y: 0, z: 4, support: "free" },
    { id: "C", x: 0, y: 0, z: 5, support: "free" },
    { id: "D", x: 4, y: 0, z: 4, support: "free" },
    { id: "E", x: -1, y: 0, z: 4, support: "free" },
  ],
  members: [
    { id: "M1", n1: "A", n2: "B", profile: "IPB 140" },
    { id: "M2", n1: "B", n2: "C", profile: "IPB 140" },
    { id: "M3", n1: "E", n2: "B", profile: "IPN 180" },
    { id: "M4", n1: "B", n2: "D", profile: "IPN 180" },
  ],
  loads: [
    { id: "L1", type: "mudl", member: "M1", gx: -400, gy: 0, gz: 0, from: 0, to: 2 },
    { id: "L2", type: "nodal", node: "C", fx: 0, fy: -100, fz: 0, mx: 0, my: 0, mz: 0 },
    { id: "L3", type: "nodal", node: "E", fx: 0, fy: 0, fz: -200, mx: 0, my: 0, mz: 0 },
    { id: "L4", type: "mudl", member: "M4", gx: 0, gy: 0, gz: -300, from: 2, to: 4 },
  ],
  material: { ...material, E: 2.1e10, G: 8.1e9 },
  unit: "kg",
  sigmaAdm: 1400, // kg/cm²
};

// Horizontal L in the xy plane, fixed at A, vertical load at the free end: the first arm
// works in torsion, the second in bending.
const lTorsion: FrameModel3D = {
  nodes: [
    { id: "A", x: 0, y: 0, z: 0, support: "fixed" },
    { id: "B", x: 4, y: 0, z: 0, support: "free" },
    { id: "C", x: 4, y: 3, z: 0, support: "free" },
  ],
  members: [
    { id: "M1", n1: "A", n2: "B", profile: "IPB 200" },
    { id: "M2", n1: "B", n2: "C", profile: "IPB 200" },
  ],
  loads: [{ id: "L1", type: "nodal", node: "C", fx: 0, fy: 0, fz: -10, mx: 0, my: 0, mz: 0 }],
  material,
  unit: "kN",
  sigmaAdm: 14, // kN/cm² (= 140 MPa)
};

// Eccentric tension on a horizontal IPN 300 beam fixed at A: P_z = 76 kN along the member axis
// (global x), applied e_y = 20 cm (depth, vertical) and e_x = 10 cm (flange width, out of the
// plane, global y) off the centroid. Reduced to the free end as N = P_z, M_y = P_z·e_y,
// M_z = -P_z·e_x (r × F). Constant along the member; sigma_max = P_z·(1/A + e_y/Wx + e_x/Wy)
// ≈ 13.96 kN/cm² ≈ sigmaAdm, so P_z,max ≈ 76.25 kN.
const eccentricTension: FrameModel3D = {
  nodes: [
    { id: "A", x: 0, y: 0, z: 0, support: "fixed" },
    { id: "B", x: 2, y: 0, z: 0, support: "free" },
  ],
  members: [{ id: "M1", n1: "A", n2: "B", profile: "IPN 300" }],
  loads: [{ id: "L1", type: "nodal", node: "B", fx: 76, fy: 0, fz: 0, mx: 0, my: 15.2, mz: -7.6 }],
  material,
  unit: "kN",
  sigmaAdm: 14, // kN/cm² (= 140 MPa)
};

// examples/cantilever-ipn320-kg.svg — cantilever IPN 320, 4.17 m (the maximum admissible length:
// L = sigma_adm·W_x/P = 1600·782/3000 = 417 cm), P = 3000 kg at the free end. Kept in kg and
// kg/cm² as in the exercise (forces in kg, lengths in m -> stresses in kg/cm²), so E and G are in
// kg/m² (E = 2.1e6 kg/cm²).
const cantileverKg: FrameModel3D = {
  nodes: [
    { id: "A", x: 0, y: 0, z: 0, support: "fixed" },
    { id: "B", x: 4.169, y: 0, z: 0, support: "free" },
  ],
  members: [{ id: "M1", n1: "A", n2: "B", profile: "IPN 320" }],
  loads: [{ id: "L1", type: "nodal", node: "B", fx: 0, fy: 0, fz: -3000, mx: 0, my: 0, mz: 0 }],
  material: { ...material, E: 2.1e10, G: 8.1e9 },
  unit: "kg",
  sigmaAdm: 1600, // kg/cm²
};

export interface Preset3D {
  key: "t_frame" | "t_frame_kg" | "l_torsion" | "eccentric_tension" | "cantilever_kg" | "t_frame_qy" | "frame_right_beam" | "frame_overhang";
  model: FrameModel3D;
}

// The "#N" in the label of each preset (LanguageContext, f3d.example.*) is its position in this list and
// is PERMANENT: people say "preset #3". Never reorder or renumber; a new preset goes at the END (#9, #10…)
// and a removed one leaves a gap.
export const PRESETS_3D: Preset3D[] = [
  { key: "t_frame", model: tFrame },
  { key: "t_frame_kg", model: tFrameKg },
  { key: "t_frame_qy", model: tFrameQy },
  { key: "frame_right_beam", model: frameRightBeam },
  { key: "frame_overhang", model: frameOverhang },
  // other cases, from the simplest to the most advanced: bending, eccentric axial load, torsion
  { key: "cantilever_kg", model: cantileverKg },
  { key: "eccentric_tension", model: eccentricTension },
  { key: "l_torsion", model: lTorsion },
];
