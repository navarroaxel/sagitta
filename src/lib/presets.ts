import { FrameModel } from "./types";

export interface Preset {
  name: string;
  model: FrameModel;
}

// Stable URL slug derived from a preset name (e.g. "Wall Truss (2 panels)" ->
// "wall-truss-2-panels"). Used by the share-link feature.
export function presetSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function findPresetBySlug(slug: string): Preset | undefined {
  return PRESETS.find((p) => presetSlug(p.name) === slug);
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

// L-frame, Gerber beam with hinge + inclined load (examples/l-frame-hinge-inclined.svg)
// Spans K-B 3 m | B-A12 4 m | A12-C 6 m; column 2 m. Loads in T.
// Expected reactions: A: H=1.93 →, V=21.81 ↓ ; B: V=37.88 ↑ ; C: V=9 ↑.
const lFrameHingeInclined: FrameModel = {
  nodes: [
    { id: "A", x: 0, y: 0, support: "pinned" },
    { id: "K", x: 0, y: 2, support: "free" }, // rigid corner (column top)
    { id: "B", x: 3, y: 2, support: "roller-v" },
    { id: "A12", x: 7, y: 2, support: "free" }, // internal hinge
    { id: "C", x: 13, y: 2, support: "roller-v" },
  ],
  members: [
    { id: "col", n1: "A", n2: "K" },
    { id: "beamKB", n1: "K", n2: "B" },
    { id: "beamB", n1: "B", n2: "A12", relJ: true }, // hinge at A12
    { id: "beamC", n1: "A12", n2: "C", relI: true }, // hinge at A12
  ],
  loads: [
    { id: "pK", type: "nodal", node: "K", fx: -4, fy: 0, m: 0 }, // 4 T ← at corner
    { id: "mB", type: "nodal", node: "B", fx: 0, fy: 0, m: -5 }, // 5 T·m clockwise
    { id: "pA12", type: "nodal", node: "A12", fx: 7.071, fy: -7.071, m: 0 }, // 10 T at 45° down-right
    { id: "q", type: "mudl", member: "beamC", gx: 0, gy: -3 }, // 3 T/m ↓ on A12–C
    { id: "pC", type: "nodal", node: "C", fx: -5, fy: 0, m: 0 }, // 5 T ← at C
  ],
  material: defaultMat,
  unit: "T",
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

// Symmetric two-bay portal, internal hinge A1-2 (examples/symmetric-two-bay-portal-hinge.svg)
// Left bay symmetric (columns A & B both 5 m, horizontal roof, 8 m wide); right bay
// 3 m tall, 4 m wide, hung from the hinge at mid-height of the continuous column B.
// Supports: A pinned, B & C roller-v -> 4 reactions + 1 hinge = determinate. Loads in kN.
const symmetricTwoBayPortal: FrameModel = {
  nodes: [
    { id: "A", x: 0, y: 0, support: "pinned" },
    { id: "G", x: 0, y: 5, support: "free" }, // top-left corner
    { id: "Btop", x: 8, y: 5, support: "free" }, // top of central column
    { id: "A12", x: 8, y: 3, support: "free" }, // internal hinge (mid-height of col B)
    { id: "B", x: 8, y: 0, support: "roller-v" },
    { id: "F", x: 12, y: 3, support: "free" }, // top of right column
    { id: "C", x: 12, y: 0, support: "roller-v" },
  ],
  members: [
    { id: "A-G", n1: "A", n2: "G" }, // left column (5 m)
    { id: "G-Btop", n1: "G", n2: "Btop" }, // left roof (8 m, horizontal)
    { id: "Btop-A12", n1: "Btop", n2: "A12" }, // upper central column
    { id: "A12-B", n1: "A12", n2: "B" }, // lower central column (continuous through A12)
    { id: "A12-F", n1: "A12", n2: "F", relI: true }, // right roof, hinge at A12 end
    { id: "F-C", n1: "F", n2: "C" }, // right column (3 m)
  ],
  loads: [
    { id: "p1", type: "mpoint", member: "A-G", dist: 1, gx: 2, gy: 0 }, // 2 kN → at (0,1)
    { id: "p2", type: "mpoint", member: "A-G", dist: 4, gx: -4, gy: 0 }, // 4 kN ← at (0,4)
    { id: "p3", type: "mpoint", member: "G-Btop", dist: 4, gx: 0, gy: 6 }, // 6 kN ↑ at (4,5)
    { id: "p4", type: "mpoint", member: "A12-F", dist: 2, gx: 0, gy: -8 }, // 8 kN ↓ at (10,3)
    { id: "p5", type: "nodal", node: "F", fx: 10, fy: 0, m: 0 }, // 10 kN → at (12,3)
  ],
  material: defaultMat,
  unit: "kN",
};
// Expected reactions: A: H=8 ←, V=5 ↓ ; B: V=3 ↑ ; C: V=4 ↑

// Asymmetric two-bay portal with a concentrated moment (examples/asymmetric-two-bay-portal-hinge.svg)
// Left bay 6 m tall, right bay 10 m tall; both 8 m wide. Central column B continuous to 10 m
// with internal hinge A1-2 at 6 m (where the low left roof attaches). Supports: A & B roller-v,
// C pinned -> 4 reactions + 1 hinge = determinate. Loads in kN.
// Expected reactions: A: V=7.25 up ; B: V=13.5 down ; C: H=17 left, V=17.25 up.
const portalMoment: FrameModel = {
  nodes: [
    { id: "A", x: 0, y: 0, support: "roller-v" },
    { id: "G", x: 0, y: 6, support: "free" }, // top-left corner
    { id: "Lm", x: 4, y: 6, support: "free" }, // mid left roof (moment applied here)
    { id: "A12", x: 8, y: 6, support: "free" }, // internal hinge
    { id: "Btop", x: 8, y: 10, support: "free" }, // top of central column
    { id: "B", x: 8, y: 0, support: "roller-v" },
    { id: "F", x: 16, y: 10, support: "free" }, // top of right column
    { id: "C", x: 16, y: 0, support: "pinned" },
  ],
  members: [
    { id: "A-G", n1: "A", n2: "G" }, // left column (6 m)
    { id: "G-Lm", n1: "G", n2: "Lm" }, // left roof, first half
    { id: "Lm-A12", n1: "Lm", n2: "A12", relJ: true }, // left roof, hinge at A12 end
    { id: "A12-Btop", n1: "A12", n2: "Btop" }, // upper central column
    { id: "A12-B", n1: "A12", n2: "B" }, // lower central column (continuous through A12)
    { id: "Btop-F", n1: "Btop", n2: "F" }, // right roof (8 m)
    { id: "F-C", n1: "F", n2: "C" }, // right column (10 m)
  ],
  loads: [
    { id: "q", type: "mudl", member: "A-G", gx: 2, gy: 0 }, // 2 kN/m -> (perp. to left column)
    { id: "pG", type: "nodal", node: "G", fx: 0, fy: -3, m: 0 }, // 3 kN down at top-left
    { id: "mo", type: "nodal", node: "Lm", fx: 0, fy: 0, m: -2 }, // 2 kNm clockwise at mid roof
    { id: "pBt", type: "nodal", node: "Btop", fx: 0, fy: -5, m: 0 }, // 5 kN down at top of col B
    { id: "pF", type: "nodal", node: "F", fx: 0, fy: -3, m: 0 }, // 3 kN down at top of col C
    { id: "pH", type: "nodal", node: "A12", fx: 7, fy: 0, m: 0 }, // 7 kN right at hinge (6 m up col B)
    { id: "pB", type: "nodal", node: "B", fx: -2, fy: 0, m: 0 }, // 2 kN left at node B
  ],
  material: defaultMat,
  unit: "kN",
};

// Z / crank frame — ceiling roller at A, pinned at B (examples/z-frame-ceiling-roller.svg)
// Left column 5 m rises from the bar's left end D to A (roller on a ceiling -> vertical reaction);
// horizontal bar 8 m (D-E); right column 5 m drops from E to the pinned base B. The bar is split
// at its midspan Mid=(4,5) to carry the concentrated 8 kN load + 3 kN·m clockwise moment there.
// Supports: A roller-v, B pinned -> 3 reactions = 3 equations, statically determinate. Loads in kN.
// Expected reactions: A: V=12.65 down ; B: H=28.54 left, V=24.18 up.
const zFrame: FrameModel = {
  nodes: [
    { id: "A", x: 0, y: 10, support: "roller-v" }, // ceiling roller -> vertical reaction
    { id: "D", x: 0, y: 5, support: "free" }, // rigid corner (bar left end)
    { id: "Mid", x: 4, y: 5, support: "free" }, // bar midspan (point load + moment)
    { id: "E", x: 8, y: 5, support: "free" }, // rigid corner (bar right end / top of right column)
    { id: "B", x: 8, y: 0, support: "pinned" },
  ],
  members: [
    { id: "colL", n1: "A", n2: "D" }, // left column (5 m)
    { id: "barDM", n1: "D", n2: "Mid" }, // bar, left half
    { id: "barME", n1: "Mid", n2: "E" }, // bar, right half (continuous through Mid)
    { id: "colR", n1: "E", n2: "B" }, // right column (5 m)
  ],
  loads: [
    { id: "q1", type: "mudl", member: "colL", gx: 2, gy: 0 }, // 2 kN/m -> (perp. to left column)
    { id: "p8", type: "nodal", node: "Mid", fx: 0, fy: -8, m: -3 }, // 8 kN down + 3 kN·m clockwise at midspan
    { id: "q2", type: "mudl", member: "colR", gx: 3, gy: 0 }, // 3 kN/m -> (perp. to right column)
    { id: "pE", type: "nodal", node: "E", fx: 3.5355, fy: -3.5355, m: 0 }, // 5 kN at 45° down-right
  ],
  material: defaultMat,
  unit: "kN",
};

// Three-panel triangle truss — parallel-chord truss 15x5 m (3 square panels),
// right panel triangular (no top node at x=15). Diagonal b5 descends to the LEFT,
// b7/b9 descend to the RIGHT. Floor-supported: A roller-v, B pinned.
// (examples/three-panel-triangle-truss.svg) Loads in kN.
// Expected reactions: A: V=1 down ; B: H=5 left, V=14 up.
const threePanelTriangleTruss: FrameModel = {
  nodes: [
    { id: "A", x: 0, y: 0, support: "roller-v" }, // roller on floor -> vertical reaction
    { id: "C", x: 5, y: 0, support: "free" },
    { id: "B", x: 10, y: 0, support: "pinned" }, // pinned support (H+V)
    { id: "D", x: 15, y: 0, support: "free" }, // triangle tip
    { id: "E", x: 0, y: 5, support: "free" }, // top-left corner
    { id: "F", x: 5, y: 5, support: "free" },
    { id: "G", x: 10, y: 5, support: "free" }, // triangle apex (left)
  ],
  members: [
    { id: "b1", n1: "A", n2: "C", relI: true, relJ: true }, // floor (bottom chord)
    { id: "b2", n1: "C", n2: "B", relI: true, relJ: true },
    { id: "b3", n1: "B", n2: "D", relI: true, relJ: true },
    { id: "b4", n1: "E", n2: "A", relI: true, relJ: true }, // posts (verticals)
    { id: "b5", n1: "F", n2: "A", relI: true, relJ: true }, // diagonal panel 1 (descends left)
    { id: "b6", n1: "F", n2: "C", relI: true, relJ: true },
    { id: "b7", n1: "F", n2: "B", relI: true, relJ: true }, // diagonal panel 2 (descends right)
    { id: "b8", n1: "G", n2: "B", relI: true, relJ: true },
    { id: "b9", n1: "G", n2: "D", relI: true, relJ: true }, // diagonal panel 3 (descends right)
    { id: "b10", n1: "E", n2: "F", relI: true, relJ: true }, // roof (top chord)
    { id: "b11", n1: "F", n2: "G", relI: true, relJ: true },
  ],
  loads: [
    { id: "p1", type: "nodal", node: "E", fx: 2, fy: 0, m: 0 }, // 2 kN → at top-left
    { id: "p2", type: "nodal", node: "F", fx: 0, fy: -5, m: 0 }, // 5 kN ↓
    { id: "p3", type: "nodal", node: "C", fx: 0, fy: -3, m: 0 }, // 3 kN ↓
    { id: "p4", type: "nodal", node: "G", fx: 3, fy: 0, m: 0 }, // 3 kN → at triangle apex
    { id: "p5", type: "nodal", node: "D", fx: 0, fy: -5, m: 0 }, // 5 kN ↓ at tip
  ],
  material: defaultMat,
  unit: "kN",
};

// Asymmetric portal, horizontal roof, stepped supports (B 4 m above A), left overhang.
// (examples/asymmetric-portal-overhang.svg) Unequal columns (A 8 m, B 4 m) share one
// horizontal roof. Supports: A roller-v, B pinned -> 3 reactions = determinate. Loads in T.
// Expected reactions: A: V=24 up ; B: H=1 right, V=0.
const asymmetricPortalOverhang: FrameModel = {
  nodes: [
    { id: "A", x: 0, y: 0, support: "roller-v" }, // base of the 8 m left column
    { id: "C", x: 0, y: 8, support: "free" }, // top-left corner
    { id: "E", x: -4, y: 8, support: "free" }, // overhang free tip
    { id: "Mid", x: 4, y: 8, support: "free" }, // mid roof (moment applied here)
    { id: "D", x: 8, y: 8, support: "free" }, // top-right corner
    { id: "B", x: 8, y: 4, support: "pinned" }, // base of the 4 m right column (4 m above A)
  ],
  members: [
    { id: "colA", n1: "A", n2: "C" }, // left column (8 m)
    { id: "colB", n1: "B", n2: "D" }, // right column (4 m)
    { id: "overhang", n1: "E", n2: "C" }, // overhang  x -4..0
    { id: "roofCM", n1: "C", n2: "Mid" }, // roof  x 0..4
    { id: "roofMD", n1: "Mid", n2: "D" }, // roof  x 4..8
  ],
  loads: [
    { id: "q", type: "mudl", member: "overhang", gx: 0, gy: -6 }, // 6 T/m ↓ on overhang
    { id: "pA", type: "nodal", node: "A", fx: -5, fy: 0, m: 0 }, // 5 T ← at A
    { id: "mMid", type: "nodal", node: "Mid", fx: 0, fy: 0, m: -12 }, // 12 T·m clockwise at mid-roof
    { id: "pD", type: "nodal", node: "D", fx: 4, fy: 0, m: 0 }, // 4 T → at top of right column
  ],
  material: defaultMat,
  unit: "T",
};

// Wall-cantilever parallel-chord truss, 2 panels of 6x6 m (examples/wall-truss-two-panel.svg).
// Both supports on the LEFT wall: B pinned (bottom), A vertical roller (top, horizontal reaction).
// Diagonals spring from the top-middle node D: b4 descends left, b6 descends right. Loads in T.
// Expected reactions: A: H=34 left ; B: H=32 right, V=22 up.
const wallTrussTwoPanel: FrameModel = {
  nodes: [
    { id: "B", x: 0, y: 0, support: "pinned" }, // pinned to the wall (H + V)
    { id: "C", x: 6, y: 0, support: "free" },
    { id: "F", x: 12, y: 0, support: "free" }, // bottom free tip
    { id: "A", x: 0, y: 6, support: "roller-h" }, // vertical roller on the wall -> horizontal reaction
    { id: "D", x: 6, y: 6, support: "free" },
    { id: "E", x: 12, y: 6, support: "free" }, // top free tip
  ],
  members: [
    { id: "b1", n1: "B", n2: "C", relI: true, relJ: true }, // bottom chord
    { id: "b2", n1: "C", n2: "F", relI: true, relJ: true },
    { id: "b3", n1: "A", n2: "B", relI: true, relJ: true }, // posts + diagonals (middle)
    { id: "b4", n1: "D", n2: "B", relI: true, relJ: true }, // diagonal (descends left)
    { id: "b5", n1: "D", n2: "C", relI: true, relJ: true },
    { id: "b6", n1: "D", n2: "F", relI: true, relJ: true }, // diagonal (descends right)
    { id: "b7", n1: "E", n2: "F", relI: true, relJ: true },
    { id: "b8", n1: "A", n2: "D", relI: true, relJ: true }, // top chord
    { id: "b9", n1: "D", n2: "E", relI: true, relJ: true },
  ],
  loads: [
    { id: "pD", type: "nodal", node: "D", fx: 0, fy: -12, m: 0 }, // 12 T ↓
    { id: "pF", type: "nodal", node: "F", fx: 0, fy: -5, m: 0 }, //  5 T ↓
    { id: "pE", type: "nodal", node: "E", fx: 2, fy: -5, m: 0 }, //  5 T ↓ + 2 T →
  ],
  material: defaultMat,
  unit: "T",
};

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
  { name: "Three-Panel Triangle Truss", model: threePanelTriangleTruss },
  { name: "Portico + Reticulado", model: frameTruss },
  { name: "Fixed Beam w/ Hinge & Overhang", model: fixedBeamHingeOverhang },
  { name: "Fixed Beam (UDL + Hinge)", model: fixedBeamUdlHinge },
  { name: "T-Frame (fixed base)", model: tFrameFixed },
  { name: "Symmetric Two-Bay Portal", model: symmetricTwoBayPortal },
  { name: "Portal w/ Moment", model: portalMoment },
  { name: "Z-Frame (ceiling roller)", model: zFrame },
  { name: "L-Frame w/ Hinge (inclined load)", model: lFrameHingeInclined },
  { name: "Asymmetric Portal w/ Overhang", model: asymmetricPortalOverhang },
  { name: "Wall Truss (2 panels)", model: wallTrussTwoPanel },
];
