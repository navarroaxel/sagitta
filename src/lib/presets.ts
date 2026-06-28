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

// 6. frameTruss — portico de alma llena ("T") + reticulado, apoyos articulados en A y B.
//    Nodos del reticulado: A1-2, C, D, E, F, G. Barras b1..b11 biarticuladas.
const frameTruss: FrameModel = {
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

// 7. simpleTruss — reticulado de cordones paralelos (12 m x 4 m, 3 paneles).
//    b5/b7 bajan a la izquierda, b9 (ultimo panel) a la derecha. Barras b1..b13 biarticuladas.
//    Apoyos: A movil (roller-v), B fijo (pinned). Cargas en T.
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

// 9. wallTruss — reticulado de cordones paralelos 12x4 m (3 paneles), diagonales a la
//    derecha, en voladizo desde el muro izquierdo. (examples/truss2.svg)
const wallTruss: FrameModel = {
  nodes: [
    { id: "A", x: 0, y: 0, support: "pinned" },   // apoyo fijo a la pared (H+V)
    { id: "C", x: 4, y: 0, support: "free" },
    { id: "D", x: 8, y: 0, support: "free" },
    { id: "E", x: 12, y: 0, support: "free" },
    { id: "B", x: 0, y: 4, support: "roller-h" }, // movil vertical -> reaccion horizontal
    { id: "F", x: 4, y: 4, support: "free" },
    { id: "G", x: 8, y: 4, support: "free" },
    { id: "H", x: 12, y: 4, support: "free" },
  ],
  members: [
    { id: "b1", n1: "A", n2: "C", relI: true, relJ: true },  // cordon inferior
    { id: "b2", n1: "C", n2: "D", relI: true, relJ: true },
    { id: "b3", n1: "D", n2: "E", relI: true, relJ: true },
    { id: "b4", n1: "B", n2: "F", relI: true, relJ: true },  // cordon superior
    { id: "b5", n1: "F", n2: "G", relI: true, relJ: true },
    { id: "b6", n1: "G", n2: "H", relI: true, relJ: true },
    { id: "b7", n1: "A", n2: "B", relI: true, relJ: true },  // montantes
    { id: "b8", n1: "C", n2: "F", relI: true, relJ: true },
    { id: "b9", n1: "D", n2: "G", relI: true, relJ: true },
    { id: "b10", n1: "E", n2: "H", relI: true, relJ: true },
    { id: "b11", n1: "B", n2: "C", relI: true, relJ: true }, // diagonales (bajan a la derecha)
    { id: "b12", n1: "F", n2: "D", relI: true, relJ: true },
    { id: "b13", n1: "G", n2: "E", relI: true, relJ: true },
  ],
  loads: [
    { id: "p1", type: "nodal", node: "F", fx: 0, fy: -40, m: 0 },
    { id: "p2", type: "nodal", node: "G", fx: 0, fy: -60, m: 0 },
    { id: "p3", type: "nodal", node: "H", fx: 0, fy: -10, m: 0 },
    { id: "p4", type: "nodal", node: "E", fx: 14.142, fy: -14.142, m: 0 }, // 20 T a 45° abajo-der
  ],
  material: defaultMat,
  unit: "T",
};
// Reacciones esperadas: A: V=124.14 arriba, H=218.29 derecha ; B: H=232.43 izquierda

// 10. cantileverTruss — reticulado 12x4 m con 3er panel en voladizo (sin piso ni montante
//     derecho). Diagonales suben a la derecha. (examples/truss3.svg)
const cantileverTruss: FrameModel = {
  nodes: [
    { id: "A", x: 0, y: 4, support: "pinned" },    // apoyo fijo (H+V)
    { id: "B", x: 0, y: 0, support: "roller-h" },  // movil -> reaccion horizontal
    { id: "C", x: 4, y: 4, support: "free" },
    { id: "D", x: 4, y: 0, support: "free" },
    { id: "E", x: 8, y: 4, support: "free" },
    { id: "F", x: 8, y: 0, support: "free" },
    { id: "G", x: 12, y: 4, support: "free" },     // punta del voladizo
  ],
  members: [
    { id: "b1", n1: "B", n2: "D", relI: true, relJ: true },  // piso (solo 2 paneles)
    { id: "b2", n1: "D", n2: "F", relI: true, relJ: true },
    { id: "b3", n1: "A", n2: "B", relI: true, relJ: true },  // montantes
    { id: "b4", n1: "B", n2: "C", relI: true, relJ: true },  // diagonales (suben a la derecha)
    { id: "b5", n1: "C", n2: "D", relI: true, relJ: true },
    { id: "b6", n1: "D", n2: "E", relI: true, relJ: true },
    { id: "b7", n1: "E", n2: "F", relI: true, relJ: true },
    { id: "b8", n1: "F", n2: "G", relI: true, relJ: true },
    { id: "b9", n1: "A", n2: "C", relI: true, relJ: true },  // techo (3 paneles)
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
// Reacciones esperadas: A: H=22 izquierda, V=9 arriba ; B: H=22 derecha

// 11. towerTruss — reticulado de 2 paneles apilados 5x6 m (12 m alto), diagonales que
//     bajan a la izquierda. (examples/truss4.svg)
const towerTruss: FrameModel = {
  nodes: [
    { id: "A", x: 0, y: 0, support: "pinned" },    // apoyo fijo (H+V)
    { id: "B", x: 5, y: 0, support: "roller-v" },  // movil -> reaccion vertical
    { id: "C", x: 0, y: 6, support: "free" },
    { id: "D", x: 5, y: 6, support: "free" },
    { id: "E", x: 0, y: 12, support: "free" },
    { id: "F", x: 5, y: 12, support: "free" },
  ],
  members: [
    { id: "b1", n1: "A", n2: "B", relI: true, relJ: true }, // piso
    { id: "b2", n1: "A", n2: "C", relI: true, relJ: true }, // columna izq inf
    { id: "b3", n1: "A", n2: "D", relI: true, relJ: true }, // diagonal inf (baja a la izq)
    { id: "b4", n1: "B", n2: "D", relI: true, relJ: true }, // columna der inf
    { id: "b5", n1: "C", n2: "D", relI: true, relJ: true }, // cordon intermedio
    { id: "b6", n1: "C", n2: "E", relI: true, relJ: true }, // columna izq sup
    { id: "b7", n1: "C", n2: "F", relI: true, relJ: true }, // diagonal sup (baja a la izq)
    { id: "b8", n1: "D", n2: "F", relI: true, relJ: true }, // columna der sup
    { id: "b9", n1: "E", n2: "F", relI: true, relJ: true }, // cordon superior
  ],
  loads: [
    { id: "p1", type: "nodal", node: "C", fx: 2, fy: 0, m: 0 },  // 2 T derecha
    { id: "p2", type: "nodal", node: "E", fx: 3, fy: -4, m: 0 }, // 3 T derecha + 4 T abajo
    { id: "p3", type: "nodal", node: "F", fx: 0, fy: -5, m: 0 }, // 5 T abajo
  ],
  material: defaultMat,
  unit: "T",
};
// Reacciones esperadas: A: H=5 izquierda, V=5.6 abajo ; B: V=14.6 arriba

// 12. triangularTruss — reticulado triangular (mensula contra muro izquierdo), 1 triangulo
//     2x1 m. Diagonal b3 baja hacia la izquierda. (examples/truss5.svg)
const triangularTruss: FrameModel = {
  nodes: [
    { id: "A", x: 0, y: 0, support: "roller-h" }, // movil sobre muro -> reaccion horizontal
    { id: "B", x: 0, y: 1, support: "pinned" },   // apoyo fijo (H+V)
    { id: "C", x: 2, y: 1, support: "free" },     // extremo libre
  ],
  members: [
    { id: "b1", n1: "A", n2: "B", relI: true, relJ: true }, // columna (vertical)
    { id: "b2", n1: "B", n2: "C", relI: true, relJ: true }, // techo (horizontal)
    { id: "b3", n1: "A", n2: "C", relI: true, relJ: true }, // diagonal (baja a la izquierda)
  ],
  loads: [
    { id: "p1", type: "nodal", node: "C", fx: 0, fy: -500, m: 0 }, // 500 kg abajo
  ],
  material: defaultMat,
  unit: "kg",
};
// Reacciones esperadas: A: H=1000 derecha ; B: H=1000 izquierda, V=500 arriba

export const PRESETS: Preset[] = [
  { name: "Simply Supported Beam", model: simplySupported },
  { name: "Cantilever", model: cantilever },
  { name: "Portal Frame (fixed)", model: portalFrame },
  { name: "Three-Hinged Frame", model: threeHinged },
  { name: "Two-Bay Portal", model: twoBayPortal },
  { name: "Portal Frame w/ Hinge", model: portalHinged },
  { name: "Simple Truss", model: simpleTruss },
  { name: "Wall Truss", model: wallTruss },
  { name: "Cantilever Truss", model: cantileverTruss },
  { name: "Tower Truss", model: towerTruss },
  { name: "Triangular Truss", model: triangularTruss },
  { name: "Portico + Reticulado", model: frameTruss },
];
