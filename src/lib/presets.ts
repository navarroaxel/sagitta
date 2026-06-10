import { FrameModel } from "./types";

export interface Preset {
  name: string;
  model: FrameModel;
}

const defaultMat = { E: 2.1e8, A: 0.01, I: 8.3e-5 };

// 1. Simply supported beam
const simplySupported: FrameModel = {
  nodes: [
    { id: "A", x: 0, y: 0, support: "pinned" },
    { id: "B", x: 10, y: 0, support: "roller-v" },
  ],
  members: [{ id: "m1", n1: "A", n2: "B" }],
  loads: [{ id: "l1", type: "mudl", member: "m1", gx: 0, gy: -10 }],
  material: defaultMat,
  unit: "kN",
};

// 2. Cantilever
const cantilever: FrameModel = {
  nodes: [
    { id: "A", x: 0, y: 0, support: "fixed" },
    { id: "B", x: 5, y: 0, support: "free" },
  ],
  members: [{ id: "m1", n1: "A", n2: "B" }],
  loads: [{ id: "l1", type: "nodal", node: "B", fx: 0, fy: -20, m: 0 }],
  material: defaultMat,
  unit: "kN",
};

// 3. Fixed-base portal frame (indeterminate)
const portalFrame: FrameModel = {
  nodes: [
    { id: "A", x: 0, y: 0, support: "fixed" },
    { id: "B", x: 0, y: 5, support: "free" },
    { id: "C", x: 6, y: 5, support: "free" },
    { id: "D", x: 6, y: 0, support: "fixed" },
  ],
  members: [
    { id: "col-L", n1: "A", n2: "B" },
    { id: "beam", n1: "B", n2: "C" },
    { id: "col-R", n1: "C", n2: "D" },
  ],
  loads: [
    { id: "l1", type: "mudl", member: "beam", gx: 0, gy: -20 },
    { id: "l2", type: "nodal", node: "B", fx: 15, fy: 0, m: 0 },
  ],
  material: defaultMat,
  unit: "kN",
};

// 4. Three-hinged frame (determinate)
const threeHinged: FrameModel = {
  nodes: [
    { id: "A", x: 0, y: 0, support: "pinned" },
    { id: "B", x: 4, y: 4, support: "free" }, // crown hinge
    { id: "C", x: 8, y: 0, support: "pinned" },
  ],
  members: [
    { id: "left", n1: "A", n2: "B", relJ: true }, // hinge at crown B
    { id: "right", n1: "B", n2: "C", relI: true }, // hinge at crown B
  ],
  loads: [
    { id: "l1", type: "mudl", member: "left", gx: 0, gy: -15 },
    { id: "l2", type: "mudl", member: "right", gx: 0, gy: -15 },
  ],
  material: defaultMat,
  unit: "kN",
};

// 5. Compound two-bay portal frame (Test 5)
const twoBayPortal: FrameModel = {
  nodes: [
    { id: "A", x: 0, y: 0, support: "roller-v" },
    { id: "TL", x: 0, y: 6, support: "free" },
    { id: "B", x: 10, y: 0, support: "pinned" },
    { id: "H", x: 10, y: 3, support: "free" },
    { id: "TM", x: 10, y: 6, support: "free" },
    { id: "C", x: 16, y: 0, support: "roller-v" },
    { id: "TR", x: 16, y: 3, support: "free" },
  ],
  members: [
    { id: "A-TL", n1: "A", n2: "TL" },
    { id: "TL-TM", n1: "TL", n2: "TM" },
    { id: "TM-H", n1: "TM", n2: "H" },
    { id: "H-B", n1: "H", n2: "B" },
    { id: "H-TR", n1: "H", n2: "TR", relI: true }, // hinge at H end
    { id: "TR-C", n1: "TR", n2: "C" },
  ],
  loads: [
    { id: "p1", type: "mpoint", member: "TL-TM", dist: 3, gx: 0, gy: -8 },
    { id: "p2", type: "mpoint", member: "TL-TM", dist: 5, gx: 0, gy: -15 },
    { id: "p3", type: "mpoint", member: "TL-TM", dist: 7, gx: 0, gy: -10 },
    { id: "p4", type: "mpoint", member: "A-TL", dist: 3, gx: 7, gy: 0 },
    { id: "u1", type: "mudl", member: "H-TR", gx: 0, gy: -10 },
    { id: "n1", type: "nodal", node: "C", fx: 7, fy: 0, m: 0 },
  ],
  material: defaultMat,
  unit: "kN",
};

export const PRESETS: Preset[] = [
  { name: "Simply Supported Beam", model: simplySupported },
  { name: "Cantilever", model: cantilever },
  { name: "Portal Frame (fixed)", model: portalFrame },
  { name: "Three-Hinged Frame", model: threeHinged },
  { name: "Two-Bay Portal", model: twoBayPortal },
];
