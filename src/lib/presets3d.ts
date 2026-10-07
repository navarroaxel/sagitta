import { FrameModel3D } from "./types3d";

const material = { E: 2.1e8, G: 8.1e7, A: 0.01, Iy: 8.3e-5, Iz: 8.3e-5, J: 1.66e-4 };

// examples/t-frame-3d-fixed.svg — hat 2 m | 1 m | 4 m, node E marks the start of q_z.
const tFrame: FrameModel3D = {
  nodes: [
    { id: "A", x: 0, y: 0, z: 0, support: "fixed" },
    { id: "B", x: 0, y: 0, z: 6, support: "free" },
    { id: "C", x: -2, y: 0, z: 6, support: "free" },
    { id: "E", x: 1, y: 0, z: 6, support: "free" },
    { id: "D", x: 5, y: 0, z: 6, support: "free" },
  ],
  members: [
    { id: "M1", n1: "A", n2: "B", profile: "IPB 300" },
    { id: "M2", n1: "C", n2: "B", profile: "IPB 200" },
    { id: "M3", n1: "B", n2: "E", profile: "IPB 200" },
    { id: "M4", n1: "E", n2: "D", profile: "IPB 200" },
  ],
  loads: [
    { id: "L1", type: "mudl", member: "M1", gx: 0, gy: 3, gz: 0 },
    { id: "L2", type: "mudl", member: "M4", gx: 0, gy: 0, gz: -2 },
    { id: "L3", type: "nodal", node: "C", fx: 0, fy: 0, fz: 0, mx: 0, my: 5, mz: 0 },
  ],
  material,
  unit: "kN",
  sigmaAdm: 140, // MPa (≈ 0.6 · Fy, steel F-24)
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
  sigmaAdm: 140, // MPa (≈ 0.6 · Fy, steel F-24)
};

export interface Preset3D {
  key: "t_frame" | "l_torsion";
  model: FrameModel3D;
}

export const PRESETS_3D: Preset3D[] = [
  { key: "t_frame", model: tFrame },
  { key: "l_torsion", model: lTorsion },
];
