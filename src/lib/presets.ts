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

// 6. r1 — portico de alma llena ("T") + reticulado, apoyos articulados en A y B.
//    Nodos del reticulado: A1-2, C, D, E, F, G. Barras b1..b11 biarticuladas.
const r1: FrameModel = {
  nodes: [
    { id: "A", x: 0, y: 0, support: "pinned" },
    { id: "M", x: 0, y: 4, support: "free" }, // punto de aplicacion del momento (0,4)
    { id: "T", x: 0, y: 8, support: "free" }, // encuentro pilar/techo
    { id: "L", x: -2, y: 8, support: "free" }, // punta del voladizo
    { id: "A12", x: 5, y: 8, support: "free" }, // articulacion portico <-> reticulado
    { id: "C", x: 9, y: 8, support: "free" },
    { id: "D", x: 13, y: 8, support: "free" },
    { id: "E", x: 5, y: 4, support: "free" },
    { id: "F", x: 9, y: 4, support: "free" },
    { id: "G", x: 13, y: 4, support: "free" },
    { id: "B", x: 13, y: 0, support: "pinned" },
  ],
  members: [
    // portico de alma llena (nudos rigidos). El pilar es UNO solo (A->T), partido
    // en P=(0,4) solo para poder aplicar ahi el momento (metodo de rigidez).
    { id: "col1", n1: "A", n2: "M" }, // pilar (0,0)->(0,4)
    { id: "col2", n1: "M", n2: "T" }, // pilar (0,4)->(0,8)
    // voladizo orientado L->T (mismo sentido que el techo) para que el diagrama
    // de corte sea consistente a traves del nudo T (barras colineales).
    { id: "cant", n1: "L", n2: "T" },
    { id: "beam", n1: "T", n2: "A12", relJ: true }, // articulacion en A12
    // reticulado (barras biarticuladas)
    { id: "b1", n1: "A12", n2: "C", relI: true, relJ: true },
    { id: "b2", n1: "C", n2: "D", relI: true, relJ: true },
    { id: "b3", n1: "A12", n2: "E", relI: true, relJ: true },
    { id: "b4", n1: "C", n2: "E", relI: true, relJ: true },
    { id: "b5", n1: "C", n2: "F", relI: true, relJ: true },
    { id: "b6", n1: "D", n2: "F", relI: true, relJ: true },
    { id: "b7", n1: "D", n2: "G", relI: true, relJ: true },
    { id: "b8", n1: "E", n2: "F", relI: true, relJ: true },
    { id: "b9", n1: "F", n2: "G", relI: true, relJ: true },
    { id: "b10", n1: "F", n2: "B", relI: true, relJ: true },
    { id: "b11", n1: "G", n2: "B", relI: true, relJ: true },
  ],
  loads: [
    { id: "q1", type: "mudl", member: "cant", gx: 0, gy: -5 }, // techo (-2,8)->(0,8)
    { id: "q2", type: "mudl", member: "beam", gx: 0, gy: -5 }, // techo (0,8)->(5,8)
    { id: "m1", type: "nodal", node: "M", fx: 0, fy: 0, m: -15 }, // 15 kNm horario en (0,4)
    { id: "p1", type: "nodal", node: "E", fx: 0, fy: -20, m: 0 }, // 20 kN abajo
    { id: "p2", type: "nodal", node: "D", fx: 10, fy: 0, m: 0 }, // 10 kN derecha
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
  { name: "Portico + Reticulado (r1)", model: r1 },
];
