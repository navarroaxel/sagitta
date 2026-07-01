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

// 6. frameTruss — solid-web portal frame ("T") + truss, pinned supports at A and B.
//    Truss nodes: A1-2, C, D, E, F, G. Members b1..b11 are pin-jointed.
const frameTruss: FrameModel = {
  nodes: [
    { id: "A", x: 0, y: 0, support: "pinned" },
    { id: "M", x: 0, y: 4, support: "free" }, // where the moment is applied (0,4)
    { id: "T", x: 0, y: 8, support: "free" }, // column/roof junction
    { id: "L", x: -2, y: 8, support: "free" }, // cantilever tip
    { id: "A12", x: 5, y: 8, support: "free" }, // hinge frame <-> truss
    { id: "C", x: 9, y: 8, support: "free" },
    { id: "D", x: 13, y: 8, support: "free" },
    { id: "E", x: 5, y: 4, support: "free" },
    { id: "F", x: 9, y: 4, support: "free" },
    { id: "G", x: 13, y: 4, support: "free" },
    { id: "B", x: 13, y: 0, support: "pinned" },
  ],
  members: [
    // solid-web portal frame (rigid joints). The column is a SINGLE member (A->T),
    // split at P=(0,4) only so the moment can be applied there (stiffness method).
    { id: "col1", n1: "A", n2: "M" }, // column (0,0)->(0,4)
    { id: "col2", n1: "M", n2: "T" }, // column (0,4)->(0,8)
    // cantilever oriented L->T (same direction as the roof) so the shear diagram
    // is consistent across node T (collinear members).
    { id: "cant", n1: "L", n2: "T" },
    { id: "beam", n1: "T", n2: "A12", relJ: true }, // hinge at A12
    // truss (pin-jointed members)
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
    { id: "q1", type: "mudl", member: "cant", gx: 0, gy: -5 }, // roof (-2,8)->(0,8)
    { id: "q2", type: "mudl", member: "beam", gx: 0, gy: -5 }, // roof (0,8)->(5,8)
    { id: "m1", type: "nodal", node: "M", fx: 0, fy: 0, m: -15 }, // 15 kNm clockwise at (0,4)
    { id: "p1", type: "nodal", node: "E", fx: 0, fy: -20, m: 0 }, // 20 kN down
    { id: "p2", type: "nodal", node: "D", fx: 10, fy: 0, m: 0 }, // 10 kN right
  ],
  material: defaultMat,
  unit: "kN",
};

// 7. simpleTruss — parallel-chord truss (12 m x 4 m, 3 panels).
//    b5/b7 descend to the left, b9 (last panel) to the right. Members b1..b13 pin-jointed.
//    Supports: A roller (roller-v), B pinned. Loads in T.
const simpleTruss: FrameModel = {
  nodes: [
    { id: "A", x: 0, y: 0, support: "roller-v" },
    { id: "C", x: 4, y: 0, support: "free" },
    { id: "B", x: 8, y: 0, support: "pinned" },
    { id: "D", x: 12, y: 0, support: "free" },
    { id: "E", x: 0, y: 4, support: "free" },
    { id: "F", x: 4, y: 4, support: "free" },
    { id: "G", x: 8, y: 4, support: "free" },
    { id: "H", x: 12, y: 4, support: "free" },
  ],
  members: [
    { id: "b1", n1: "A", n2: "C", relI: true, relJ: true },
    { id: "b2", n1: "C", n2: "B", relI: true, relJ: true },
    { id: "b3", n1: "B", n2: "D", relI: true, relJ: true },
    { id: "b4", n1: "A", n2: "E", relI: true, relJ: true },
    { id: "b5", n1: "F", n2: "A", relI: true, relJ: true },
    { id: "b6", n1: "C", n2: "F", relI: true, relJ: true },
    { id: "b7", n1: "G", n2: "C", relI: true, relJ: true },
    { id: "b8", n1: "B", n2: "G", relI: true, relJ: true },
    { id: "b9", n1: "G", n2: "D", relI: true, relJ: true },
    { id: "b10", n1: "D", n2: "H", relI: true, relJ: true },
    { id: "b11", n1: "E", n2: "F", relI: true, relJ: true },
    { id: "b12", n1: "F", n2: "G", relI: true, relJ: true },
    { id: "b13", n1: "G", n2: "H", relI: true, relJ: true },
  ],
  loads: [
    { id: "p1", type: "nodal", node: "C", fx: 0, fy: -10, m: 0 },
    { id: "p2", type: "nodal", node: "F", fx: 0, fy: -5, m: 0 },
    { id: "p3", type: "nodal", node: "D", fx: 0, fy: -25, m: 0 },
    { id: "p4", type: "nodal", node: "H", fx: 10, fy: 0, m: 0 },
  ],
  material: defaultMat,
  unit: "T",
};

// 8. Portal frame, solid-web, with internal hinge A1-2 (matches examples/portal-frame.svg)
const portalHinged: FrameModel = {
  nodes: [
    { id: "A", x: 0, y: 0, support: "pinned" },
    { id: "C", x: 2, y: 3, support: "free" }, // rigid knee: diagonal meets roof
    { id: "A12", x: 4, y: 3, support: "free" }, // internal hinge A1-2
    { id: "D", x: 7, y: 3, support: "free" }, // top of column
    { id: "B", x: 7, y: 0, support: "pinned" },
  ],
  members: [
    { id: "diag", n1: "A", n2: "C" },
    { id: "roofL", n1: "C", n2: "A12", relJ: true }, // hinge at A12 ...
    { id: "roofR", n1: "A12", n2: "D", relI: true }, // ... released both sides (cf. threeHinged)
    { id: "col", n1: "D", n2: "B" },
  ],
  loads: [
    // q1 = 5 kN/m perpendicular to diagonal A-C -> global (3,-2)/sqrt(13) * 5
    { id: "q1", type: "mudl", member: "diag", gx: 4.1603, gy: -2.7735 },
    // q2 = 10 kN/m vertical down on the right roof
    { id: "q2", type: "mudl", member: "roofR", gx: 0, gy: -10 },
    // P = 50 kN down, 1.5 m from A12 (x = 5.5 m, i.e. 1.5 m left of D)
    { id: "p1", type: "mpoint", member: "roofR", dist: 1.5, gx: 0, gy: -50 },
  ],
  material: defaultMat,
  unit: "kN",
};

// 9. wallTruss — parallel-chord truss 12x4 m (3 panels), diagonals to the
//    right, cantilevered from the left wall. (examples/wall-truss.svg)
const wallTruss: FrameModel = {
  nodes: [
    { id: "A", x: 0, y: 0, support: "pinned" },   // pinned to the wall (H+V)
    { id: "C", x: 4, y: 0, support: "free" },
    { id: "D", x: 8, y: 0, support: "free" },
    { id: "E", x: 12, y: 0, support: "free" },
    { id: "B", x: 0, y: 4, support: "roller-h" }, // vertical roller -> horizontal reaction
    { id: "F", x: 4, y: 4, support: "free" },
    { id: "G", x: 8, y: 4, support: "free" },
    { id: "H", x: 12, y: 4, support: "free" },
  ],
  members: [
    { id: "b1", n1: "A", n2: "C", relI: true, relJ: true },  // bottom chord
    { id: "b2", n1: "C", n2: "D", relI: true, relJ: true },
    { id: "b3", n1: "D", n2: "E", relI: true, relJ: true },
    { id: "b4", n1: "B", n2: "F", relI: true, relJ: true },  // top chord
    { id: "b5", n1: "F", n2: "G", relI: true, relJ: true },
    { id: "b6", n1: "G", n2: "H", relI: true, relJ: true },
    { id: "b7", n1: "A", n2: "B", relI: true, relJ: true },  // verticals
    { id: "b8", n1: "C", n2: "F", relI: true, relJ: true },
    { id: "b9", n1: "D", n2: "G", relI: true, relJ: true },
    { id: "b10", n1: "E", n2: "H", relI: true, relJ: true },
    { id: "b11", n1: "B", n2: "C", relI: true, relJ: true }, // diagonals (descend to the right)
    { id: "b12", n1: "F", n2: "D", relI: true, relJ: true },
    { id: "b13", n1: "G", n2: "E", relI: true, relJ: true },
  ],
  loads: [
    { id: "p1", type: "nodal", node: "F", fx: 0, fy: -40, m: 0 },
    { id: "p2", type: "nodal", node: "G", fx: 0, fy: -60, m: 0 },
    { id: "p3", type: "nodal", node: "H", fx: 0, fy: -10, m: 0 },
    { id: "p4", type: "nodal", node: "E", fx: 14.142, fy: -14.142, m: 0 }, // 20 T at 45° down-right
  ],
  material: defaultMat,
  unit: "T",
};
// Expected reactions: A: V=124.14 up, H=218.29 right ; B: H=232.43 left

// 10. cantileverTruss — 12x4 m truss with a cantilevered 3rd panel (no floor or right
//     vertical). Diagonals rise to the right. (examples/cantilever-truss.svg)
const cantileverTruss: FrameModel = {
  nodes: [
    { id: "A", x: 0, y: 4, support: "pinned" },    // pinned support (H+V)
    { id: "B", x: 0, y: 0, support: "roller-h" },  // roller -> horizontal reaction
    { id: "C", x: 4, y: 4, support: "free" },
    { id: "D", x: 4, y: 0, support: "free" },
    { id: "E", x: 8, y: 4, support: "free" },
    { id: "F", x: 8, y: 0, support: "free" },
    { id: "G", x: 12, y: 4, support: "free" },     // cantilever tip
  ],
  members: [
    { id: "b1", n1: "B", n2: "D", relI: true, relJ: true },  // floor (only 2 panels)
    { id: "b2", n1: "D", n2: "F", relI: true, relJ: true },
    { id: "b3", n1: "A", n2: "B", relI: true, relJ: true },  // verticals
    { id: "b4", n1: "B", n2: "C", relI: true, relJ: true },  // diagonals (rise to the right)
    { id: "b5", n1: "C", n2: "D", relI: true, relJ: true },
    { id: "b6", n1: "D", n2: "E", relI: true, relJ: true },
    { id: "b7", n1: "E", n2: "F", relI: true, relJ: true },
    { id: "b8", n1: "F", n2: "G", relI: true, relJ: true },
    { id: "b9", n1: "A", n2: "C", relI: true, relJ: true },  // roof (3 panels)
    { id: "b10", n1: "C", n2: "E", relI: true, relJ: true },
    { id: "b11", n1: "E", n2: "G", relI: true, relJ: true },
  ],
  loads: [
    { id: "p1", type: "nodal", node: "C", fx: 0, fy: -1, m: 0 },
    { id: "p2", type: "nodal", node: "E", fx: 0, fy: -3, m: 0 },
    { id: "p3", type: "nodal", node: "G", fx: 0, fy: -5, m: 0 },
  ],
  material: defaultMat,
  unit: "T",
};
// Expected reactions: A: H=22 left, V=9 up ; B: H=22 right

// 11. towerTruss — 2 stacked panels 5x6 m (12 m tall), diagonals that
//     descend to the left. (examples/tower-truss.svg)
const towerTruss: FrameModel = {
  nodes: [
    { id: "A", x: 0, y: 0, support: "pinned" },    // pinned support (H+V)
    { id: "B", x: 5, y: 0, support: "roller-v" },  // roller -> vertical reaction
    { id: "C", x: 0, y: 6, support: "free" },
    { id: "D", x: 5, y: 6, support: "free" },
    { id: "E", x: 0, y: 12, support: "free" },
    { id: "F", x: 5, y: 12, support: "free" },
  ],
  members: [
    { id: "b1", n1: "A", n2: "B", relI: true, relJ: true }, // floor
    { id: "b2", n1: "A", n2: "C", relI: true, relJ: true }, // lower left column
    { id: "b3", n1: "A", n2: "D", relI: true, relJ: true }, // lower diagonal (descends left)
    { id: "b4", n1: "B", n2: "D", relI: true, relJ: true }, // lower right column
    { id: "b5", n1: "C", n2: "D", relI: true, relJ: true }, // middle chord
    { id: "b6", n1: "C", n2: "E", relI: true, relJ: true }, // upper left column
    { id: "b7", n1: "C", n2: "F", relI: true, relJ: true }, // upper diagonal (descends left)
    { id: "b8", n1: "D", n2: "F", relI: true, relJ: true }, // upper right column
    { id: "b9", n1: "E", n2: "F", relI: true, relJ: true }, // top chord
  ],
  loads: [
    { id: "p1", type: "nodal", node: "C", fx: 2, fy: 0, m: 0 },  // 2 T right
    { id: "p2", type: "nodal", node: "E", fx: 3, fy: -4, m: 0 }, // 3 T right + 4 T down
    { id: "p3", type: "nodal", node: "F", fx: 0, fy: -5, m: 0 }, // 5 T down
  ],
  material: defaultMat,
  unit: "T",
};
// Expected reactions: A: H=5 left, V=5.6 down ; B: V=14.6 up

// 12. triangularTruss — triangular truss (cantilever against the left wall), 1 triangle
//     2x1 m. Diagonal b3 descends to the left. (examples/triangular-truss.svg)
const triangularTruss: FrameModel = {
  nodes: [
    { id: "A", x: 0, y: 0, support: "roller-h" }, // roller on the wall -> horizontal reaction
    { id: "B", x: 0, y: 1, support: "pinned" },   // pinned support (H+V)
    { id: "C", x: 2, y: 1, support: "free" },     // free end
  ],
  members: [
    { id: "b1", n1: "A", n2: "B", relI: true, relJ: true }, // column (vertical)
    { id: "b2", n1: "B", n2: "C", relI: true, relJ: true }, // roof (horizontal)
    { id: "b3", n1: "A", n2: "C", relI: true, relJ: true }, // diagonal (descends to the left)
  ],
  loads: [
    { id: "p1", type: "nodal", node: "C", fx: 0, fy: -500, m: 0 }, // 500 kg down
  ],
  material: defaultMat,
  unit: "kg",
};
// Expected reactions: A: H=1000 right ; B: H=1000 left, V=500 up

// 13. symmetricTruss — symmetric parallel-chord truss, 20 m x 8.66 m
//     (4 panels of 5 m). Diagonals b6/b8 descend to the right, b10/b12 to the
//     left; b8 (G-D) and b10 (I-D) meet at center node D. Supports: A roller
//     (roller-v), B pinned. Symmetric vertical loads 20/30/50/30/20 T ->
//     V_A = V_B = 75 T. (examples/symmetric-truss.svg)
const symmetricTruss: FrameModel = {
  nodes: [
    { id: "A", x: 0,  y: 0,    support: "roller-v" },
    { id: "C", x: 5,  y: 0,    support: "free" },
    { id: "D", x: 10, y: 0,    support: "free" },
    { id: "E", x: 15, y: 0,    support: "free" },
    { id: "B", x: 20, y: 0,    support: "pinned" },
    { id: "F", x: 0,  y: 8.66, support: "free" },
    { id: "G", x: 5,  y: 8.66, support: "free" },
    { id: "H", x: 10, y: 8.66, support: "free" },
    { id: "I", x: 15, y: 8.66, support: "free" },
    { id: "J", x: 20, y: 8.66, support: "free" },
  ],
  members: [
    { id: "b1",  n1: "A", n2: "C", relI: true, relJ: true },
    { id: "b2",  n1: "C", n2: "D", relI: true, relJ: true },
    { id: "b3",  n1: "D", n2: "E", relI: true, relJ: true },
    { id: "b4",  n1: "E", n2: "B", relI: true, relJ: true },
    { id: "b5",  n1: "A", n2: "F", relI: true, relJ: true },
    { id: "b6",  n1: "F", n2: "C", relI: true, relJ: true },
    { id: "b7",  n1: "C", n2: "G", relI: true, relJ: true },
    { id: "b8",  n1: "G", n2: "D", relI: true, relJ: true },
    { id: "b9",  n1: "D", n2: "H", relI: true, relJ: true },
    { id: "b10", n1: "I", n2: "D", relI: true, relJ: true },
    { id: "b11", n1: "E", n2: "I", relI: true, relJ: true },
    { id: "b12", n1: "J", n2: "E", relI: true, relJ: true },
    { id: "b13", n1: "B", n2: "J", relI: true, relJ: true },
    { id: "b14", n1: "F", n2: "G", relI: true, relJ: true },
    { id: "b15", n1: "G", n2: "H", relI: true, relJ: true },
    { id: "b16", n1: "H", n2: "I", relI: true, relJ: true },
    { id: "b17", n1: "I", n2: "J", relI: true, relJ: true },
  ],
  loads: [
    { id: "p1", type: "nodal", node: "F", fx: 0, fy: -20, m: 0 },
    { id: "p2", type: "nodal", node: "G", fx: 0, fy: -30, m: 0 },
    { id: "p3", type: "nodal", node: "H", fx: 0, fy: -50, m: 0 },
    { id: "p4", type: "nodal", node: "I", fx: 0, fy: -30, m: 0 },
    { id: "p5", type: "nodal", node: "J", fx: 0, fy: -20, m: 0 },
  ],
  material: defaultMat,
  unit: "T",
};

// L-frame, continuous Gerber beam with internal hinge (examples/l-frame-hinge.svg)
const lFrameHinge: FrameModel = {
  nodes: [
    { id: "A", x: 0, y: 0, support: "pinned" },
    { id: "K", x: 0, y: 2, support: "free" }, // rigid corner (column top)
    { id: "B", x: 5, y: 2, support: "roller-v" },
    { id: "A12", x: 10, y: 2, support: "free" }, // internal hinge
    { id: "C", x: 15, y: 2, support: "roller-v" },
  ],
  members: [
    { id: "col", n1: "A", n2: "K" },
    { id: "beamKB", n1: "K", n2: "B" },
    { id: "beamB", n1: "B", n2: "A12", relJ: true }, // hinge at A12 (cf. portalHinged)
    { id: "beamC", n1: "A12", n2: "C", relI: true }, // hinge at A12
  ],
  loads: [
    { id: "pK", type: "nodal", node: "K", fx: -3, fy: 0, m: 0 }, // 3 kN ← at corner
    { id: "mB", type: "nodal", node: "B", fx: 0, fy: 0, m: -10 }, // 10 kNm clockwise
    { id: "pA12", type: "nodal", node: "A12", fx: 8, fy: -8, m: 0 }, // 8 kN → + 8 kN ↓
    { id: "q", type: "mudl", member: "beamC", gx: 0, gy: -2 }, // 2 kN/m ↓ on A12–C
    { id: "pC", type: "nodal", node: "C", fx: -2, fy: 0, m: 0 }, // 2 kN ← at C
  ],
  material: defaultMat,
  unit: "kN",
};

// L-frame, cantilever roof / overhang, all rigid joints (examples/l-frame-overhang.svg)
const lFrameOverhang: FrameModel = {
  nodes: [
    { id: "A", x: 0, y: 0, support: "pinned" },
    { id: "K", x: 0, y: 6, support: "free" }, // rigid corner
    { id: "C", x: -6, y: 6, support: "free" }, // overhang free end
    { id: "D", x: 4, y: 6, support: "free" }, // UDL end — split point so mudl maps to whole members
    { id: "B", x: 10, y: 6, support: "roller-v" },
  ],
  members: [
    { id: "col", n1: "A", n2: "K" },
    { id: "roofCK", n1: "C", n2: "K" }, // overhang  x -6..0
    { id: "roofKD", n1: "K", n2: "D" }, //           x  0..4
    { id: "roofDB", n1: "D", n2: "B" }, //           x  4..10
  ],
  loads: [
    { id: "pC", type: "nodal", node: "C", fx: -2, fy: 0, m: 0 }, // 2 kN ← at overhang tip
    { id: "q1", type: "mudl", member: "roofCK", gx: 0, gy: -1 }, // 1 kN/m ↓  x -6..0
    { id: "q2", type: "mudl", member: "roofKD", gx: 0, gy: -1 }, // 1 kN/m ↓  x  0..4
    { id: "pV", type: "mpoint", member: "roofDB", dist: 4, gx: 0, gy: -4 }, // 4 kN ↓ at x=8 (4 m from D)
    { id: "mB", type: "nodal", node: "B", fx: 0, fy: 0, m: -4 }, // 4 kNm clockwise
  ],
  material: defaultMat,
  unit: "kN",
};

// Two-column portal, solid web, rigid joints (examples/two-column-portal.svg)
const twoColumnPortal: FrameModel = {
  nodes: [
    { id: "A", x: 0, y: 0, support: "roller-v" }, // base of left column
    { id: "B", x: 10, y: 0, support: "pinned" }, // base of right column
    { id: "C", x: 0, y: 8, support: "free" }, // top-left corner
    { id: "E", x: 4, y: 8, support: "free" }, // UDL end — split point so mudl maps to a whole member
    { id: "D", x: 10, y: 8, support: "free" }, // top-right corner
  ],
  members: [
    { id: "colL", n1: "A", n2: "C" },
    { id: "colR", n1: "B", n2: "D" },
    { id: "roofCE", n1: "C", n2: "E" }, // roof  x 0..4
    { id: "roofED", n1: "E", n2: "D" }, // roof  x 4..10
  ],
  loads: [
    { id: "h8", type: "mpoint", member: "colL", dist: 4, gx: -8, gy: 0 }, // 8 T ← at mid-column (0,4)
    { id: "h5", type: "nodal", node: "C", fx: 5, fy: 0, m: 0 }, // 5 T → at C
    { id: "h7", type: "nodal", node: "D", fx: 7, fy: 0, m: 0 }, // 7 T → at D
    { id: "q", type: "mudl", member: "roofCE", gx: 0, gy: -3 }, // 3 T/m ↓ on roof x 0..4
    { id: "p12", type: "mpoint", member: "roofED", dist: 3, gx: 0, gy: -12 }, // 12 T ↓ at (7,8)
  ],
  material: defaultMat,
  unit: "T",
};

// Fixed-ended beam, internal hinge A1-2, roller + overhang (examples/fixed-beam-hinge-overhang.svg)
// 14 m beam: A fixed, hinge at x=10, roller B at x=12, free tip at x=14. Loads in T.
const fixedBeamHingeOverhang: FrameModel = {
  nodes: [
    { id: "A", x: 0, y: 0, support: "fixed" },
    { id: "N3", x: 3, y: 0, support: "free" }, // 10 T point load
    { id: "N7", x: 7, y: 0, support: "free" }, // 4 T point load + UDL start
    { id: "A12", x: 10, y: 0, support: "free" }, // internal hinge (2 m left of B)
    { id: "B", x: 12, y: 0, support: "roller-v" },
    { id: "D", x: 14, y: 0, support: "free" }, // free tip
  ],
  members: [
    { id: "m1", n1: "A", n2: "N3" }, //  x 0..3
    { id: "m2", n1: "N3", n2: "N7" }, // x 3..7
    { id: "m3", n1: "N7", n2: "A12", relJ: true }, // x 7..10, hinge at A12
    { id: "m4", n1: "A12", n2: "B", relI: true }, //  x 10..12, hinge at A12
    { id: "m5", n1: "B", n2: "D" }, //   x 12..14
  ],
  loads: [
    { id: "p1", type: "nodal", node: "N3", fx: 0, fy: -10, m: 0 }, // 10 T ↓ at x=3
    { id: "p2", type: "nodal", node: "N7", fx: 0, fy: -4, m: 0 }, //  4 T ↓ at x=7
    { id: "q1", type: "mudl", member: "m3", gx: 0, gy: -4 }, // 4 T/m ↓ x 7..10
    { id: "q2", type: "mudl", member: "m4", gx: 0, gy: -4 }, // 4 T/m ↓ x 10..12
    { id: "p3", type: "nodal", node: "D", fx: -7, fy: -5, m: 0 }, // 5 T ↓ + 7 T ← at tip
  ],
  material: defaultMat,
  unit: "T",
};
// Expected reactions: A: H=7 →, V=25 ↑, M=150 T·m CCW ; B: V=14 ↑

// Fixed-ended beam, full-span UDL, internal hinge, roller + overhang.
// 10 m beam, loads in kN.
const fixedBeamUdlHinge: FrameModel = {
  nodes: [
    { id: "A", x: 0, y: 0, support: "fixed" },
    { id: "A12", x: 4, y: 0, support: "free" }, // internal hinge (4 m right of A)
    { id: "B", x: 7, y: 0, support: "roller-v" },
    { id: "D", x: 10, y: 0, support: "free" }, // free tip
  ],
  members: [
    { id: "m1", n1: "A", n2: "A12", relJ: true }, // x 0..4, hinge at A12
    { id: "m2", n1: "A12", n2: "B", relI: true }, // x 4..7, hinge at A12
    { id: "m3", n1: "B", n2: "D" }, //              x 7..10
  ],
  loads: [
    { id: "q1", type: "mudl", member: "m1", gx: 0, gy: -5 }, // 5 kN/m ↓ x 0..4
    { id: "q2", type: "mudl", member: "m2", gx: 0, gy: -5 }, // 5 kN/m ↓ x 4..7
    { id: "q3", type: "mudl", member: "m3", gx: 0, gy: -5 }, // 5 kN/m ↓ x 7..10
    { id: "h1", type: "nodal", node: "D", fx: -2, fy: 0, m: 0 }, // 2 kN ← at tip
  ],
  material: defaultMat,
  unit: "kN",
};
// Expected reactions: A: H=2 →, V=20 ↑, M=40 kN·m CCW ; B: V=30 ↑

// T-frame — column fixed to the ground, horizontal beam on top (examples/t-frame-fixed.svg)
// Column 8 m; left arm 4 m, right arm 7 m. Loads in T.
const tFrameFixed: FrameModel = {
  nodes: [
    { id: "A", x: 0, y: 0, support: "fixed" }, // fixed base
    { id: "B", x: 0, y: 8, support: "free" }, // T-junction (top of column)
    { id: "C", x: -4, y: 8, support: "free" }, // left arm tip
    { id: "D", x: 7, y: 8, support: "free" }, // right arm tip
  ],
  members: [
    { id: "col", n1: "A", n2: "B" }, //  column (8 m)
    { id: "armL", n1: "C", n2: "B" }, // left arm (4 m)
    { id: "armR", n1: "B", n2: "D" }, // right arm (7 m)
  ],
  loads: [
    { id: "pC", type: "nodal", node: "C", fx: 0, fy: -10, m: 0 }, // 10 T ↓ at C
    { id: "pD", type: "nodal", node: "D", fx: 10, fy: -10, m: 0 }, // 10 T ↓ + 10 T → at D
  ],
  material: defaultMat,
  unit: "T",
};
// Expected reactions: A: H=10 ←, V=20 ↑, M=110 T·m CCW

export const PRESETS: Preset[] = [
  { name: "Simply Supported Beam", model: simplySupported },
  { name: "Cantilever", model: cantilever },
  { name: "Portal Frame (fixed)", model: portalFrame },
  { name: "Three-Hinged Frame", model: threeHinged },
  { name: "Two-Bay Portal", model: twoBayPortal },
  { name: "Portal Frame w/ Hinge", model: portalHinged },
  { name: "L-Frame w/ Hinge", model: lFrameHinge },
  { name: "L-Frame w/ Overhang", model: lFrameOverhang },
  { name: "Two-Column Portal", model: twoColumnPortal },
  { name: "Simple Truss", model: simpleTruss },
  { name: "Symmetric Truss", model: symmetricTruss },
  { name: "Wall Truss", model: wallTruss },
  { name: "Cantilever Truss", model: cantileverTruss },
  { name: "Tower Truss", model: towerTruss },
  { name: "Triangular Truss", model: triangularTruss },
  { name: "Portico + Reticulado", model: frameTruss },
  { name: "Fixed Beam w/ Hinge & Overhang", model: fixedBeamHingeOverhang },
  { name: "Fixed Beam (UDL + Hinge)", model: fixedBeamUdlHinge },
  { name: "T-Frame (fixed base)", model: tFrameFixed },
];
