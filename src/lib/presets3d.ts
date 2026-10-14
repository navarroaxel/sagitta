import { FrameModel3D } from "./types3d";

const material = { E: 2.1e8, G: 8.1e7, A: 0.01, Ix: 8.3e-5, Iy: 8.3e-5, J: 1.66e-4 };

// examples/t-frame-3d-fixed.svg — hat 2 m | 5 m, q_z acts on the right arm from 1 m to 5 m.
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
    { id: "L1", type: "mudl", member: "M1", gx: 0, gy: 3, gz: 0 },
    { id: "L2", type: "mudl", member: "M3", gx: 0, gy: 0, gz: -2, from: 1, to: 5 },
    { id: "L3", type: "nodal", node: "C", fx: 0, fy: 0, fz: 0, mx: 0, my: 5, mz: 0 },
  ],
  material,
  unit: "kN",
  sigmaAdm: 14, // kN/cm² (= 140 MPa)
};

// examples/t-frame-3d-fixed-kg.svg — 3 m column, 3 m beam (1 m left | 2 m right of the column),
// q_z = 200 kg/m over the whole beam, P_y = 300 kg at B. Loads converted to kN (1 kg = 0.00981 kN):
// q_z = 1.962 kN/m, P_y = 2.943 kN.
const tFrameKg: FrameModel3D = {
  nodes: [
    { id: "A", x: 0, y: 0, z: 0, support: "fixed" },
    { id: "B", x: 0, y: 0, z: 3, support: "free" },
    { id: "C", x: -1, y: 0, z: 3, support: "free" },
    { id: "D", x: 2, y: 0, z: 3, support: "free" },
  ],
  members: [
    // IPB 120 with the strong axis against M_x (8.8 kN·m): ~85% of sigmaAdm; IPB 100 would not pass.
    { id: "M1", n1: "A", n2: "B", profile: "IPB 120", rotated: true },
    { id: "M2", n1: "C", n2: "B", profile: "IPN 100" },
    { id: "M3", n1: "B", n2: "D", profile: "IPN 100" },
  ],
  loads: [
    { id: "L1", type: "mudl", member: "M2", gx: 0, gy: 0, gz: -1.962 },
    { id: "L2", type: "mudl", member: "M3", gx: 0, gy: 0, gz: -1.962 },
    { id: "L3", type: "nodal", node: "B", fx: 0, fy: 2.943, fz: 0, mx: 0, my: 0, mz: 0 },
  ],
  material,
  unit: "kN",
  sigmaAdm: 14, // kN/cm² (= 140 MPa)
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

export interface Preset3D {
  key: "t_frame" | "t_frame_kg" | "l_torsion";
  model: FrameModel3D;
}

export const PRESETS_3D: Preset3D[] = [
  { key: "t_frame", model: tFrame },
  { key: "t_frame_kg", model: tFrameKg },
  { key: "l_torsion", model: lTorsion },
];
