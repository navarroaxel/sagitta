// Casio fx-9860GIII program REACC: support reactions of a 3D frame fixed at A from its loads, and the internal
// forces at the base of a vertical column. The program text is the single source for the /casio-reacciones page;
// `reactionsFromLoads` is the same arithmetic in TypeScript so casioPrograms.test.ts can check it against the solver.
// Statically determinate (one fixed support): the reactions are minus the sum of the loads and of their moments
// about A, M = r × F (the same formula as examples/t-frame-3d-fixed-kg.svg). Units: kg, m, kg·m. Presentation only.

export interface ProgramLoad {
  x: number; // point of application measured from A, m (a distributed load: the centre of its span)
  y: number;
  z: number;
  fx: number; // force, or force per metre when `len` ≠ 1
  fy: number;
  fz: number;
  len?: number; // length of the loaded span (1 = point load)
  mx?: number; // applied moments
  my?: number;
  mz?: number;
}

export interface Reactions {
  fx: number;
  fy: number;
  fz: number;
  mx: number;
  my: number;
  mz: number;
}

export interface BaseForces {
  N: number;
  Qx: number;
  Qy: number;
  Mx: number;
  My: number;
}

export function reactionsFromLoads(loads: ProgramLoad[]): Reactions {
  const s = [0, 0, 0, 0, 0, 0]; // F, G, H, I, J, K of the program
  for (const l of loads) {
    const L = l.len ?? 1;
    const u = l.fx * L,
      v = l.fy * L,
      w = l.fz * L;
    s[0] += u;
    s[1] += v;
    s[2] += w;
    s[3] += l.y * w - l.z * v + (l.mx ?? 0);
    s[4] += l.z * u - l.x * w + (l.my ?? 0);
    s[5] += l.x * v - l.y * u + (l.mz ?? 0);
  }
  const [fx, fy, fz, mx, my, mz] = s.map((c) => (c === 0 ? 0 : -c));
  return { fx, fy, fz, mx, my, mz };
}

// Internal forces at the base of a VERTICAL column fixed at A, in the course's local triad (z down along the column,
// x = −Y, y = +X): the face of the cut carries exactly the reaction. Checked against the solver on four presets.
export const baseForces = (r: Reactions): BaseForces => ({ N: -r.fz, Qx: r.fy, Qy: r.fx, Mx: r.my, My: r.mx });

// What is typed on the calculator, line by line (PRGM mode, file name REACC).
export const REACC_NAME = "REACC";
export const REACC_LINES = [
  "0→F:0→G:0→H:0→I:0→J:0→K",
  '"N CARGAS"?→N',
  "For 1→C To N",
  '"X"?→X:"Y"?→Y:"Z"?→Z',
  '"FX"?→U:"FY"?→V:"FZ"?→W',
  '"L (1=PUNTUAL)"?→L',
  '"MX"?→P:"MY"?→Q:"MZ"?→R',
  "U×L→U:V×L→V:W×L→W",
  "F+U→F:G+V→G:H+W→H",
  "I+Y×W–Z×V+P→I",
  "J+Z×U–X×W+Q→J",
  "K+X×V–Y×U+R→K",
  "Next",
  '"FX A ="',
  "–F◢",
  '"FY A ="',
  "–G◢",
  '"FZ A ="',
  "–H◢",
  '"MX A ="',
  "–I◢",
  '"MY A ="',
  "–J◢",
  '"MZ A ="',
  "–K◢",
  '"BASE PILAR: N ="',
  "H◢",
  '"QX ="',
  "–G◢",
  '"QY ="',
  "–F◢",
  '"MX ="',
  "–J◢",
  '"MY ="',
  "–I",
];

// ---- Program PERFIL: which IPB goes in the column for a given N, Mx, My --------------------------------------------
// The IPB 100…600 of the course's table are stored in the program itself (lists 1-5), so nothing has to be typed
// into the list editor. It tries them from the lightest and stops at the first with max |σ| ≤ σ_adm; face 1 / 2 as in
// the guide (x against the strong axis / profile turned). Units: kg, kg·m, kg/cm². `chooseIPB` is the same arithmetic.
import { IPB_PROFILES } from "./profiles";

export const PERFIL_NAME = "PERFIL";
export const PERFIL_TABLE = IPB_PROFILES.filter((p) => p.h <= 600);

export interface IPBChoice {
  name: string; // "IPB 140", or null when none of IPB 100…600 passes
  sigmaMax: number; // max |σ| of that profile, kg/cm²
}

// max |σ| = |N/A| + ... at the extreme corners: the two candidates are N/A ± (|Mx|·hy/Ix + |My|·hx/Iy)
export function sigmaMaxOf(p: { A: number; Ix: number; Iy: number; h: number; bf: number }, N: number, MxKgm: number, MyKgm: number, face: 1 | 2): number {
  const [Ix, Iy, hy, hx] = face === 1 ? [p.Ix, p.Iy, p.h / 20, p.bf / 20] : [p.Iy, p.Ix, p.bf / 20, p.h / 20];
  const c = N / p.A;
  const w = (Math.abs(MxKgm) * 100 * hy) / Ix + (Math.abs(MyKgm) * 100 * hx) / Iy;
  return Math.max(Math.abs(c + w), Math.abs(c - w));
}

export function chooseIPB(N: number, MxKgm: number, MyKgm: number, sigmaAdm: number, face: 1 | 2): IPBChoice | null {
  for (const p of PERFIL_TABLE) {
    const s = sigmaMaxOf(p, N, MxKgm, MyKgm, face);
    if (s <= sigmaAdm) return { name: p.name, sigmaMax: s };
  }
  return null;
}

const list = (n: number, f: (p: (typeof PERFIL_TABLE)[number]) => number) => `{${PERFIL_TABLE.map(f).join(",")}}→List ${n}`;

export const PERFIL_LINES = [
  list(1, (p) => p.h),
  list(2, (p) => p.bf),
  list(3, (p) => p.A),
  list(4, (p) => p.Ix),
  list(5, (p) => p.Iy),
  '"N KG (TRAC POS)"?→N',
  '"MX (KG M)"?→P',
  '"MY (KG M)"?→Q',
  '"SIGMA ADM"?→S',
  '"CARA (1 O 2)"?→T',
  `For 1→I To ${PERFIL_TABLE.length}`,
  "List 1[I]÷20→D:List 2[I]÷20→E",
  "List 4[I]→X:List 5[I]→Y",
  "If T=2:Then X→Z:Y→X:Z→Y:D→Z:E→D:Z→E:IfEnd",
  "N÷List 3[I]→M",
  "Abs (P×100÷X)×D+Abs (Q×100÷Y)×E→W",
  "Abs (M+W)→U:Abs (M–W)→V",
  "If V>U:Then V→U:IfEnd",
  "If U≤S:Then",
  '"USAR IPB"',
  "List 1[I]◢",
  '"SIGMA MAX ="',
  "U◢",
  "Stop",
  "IfEnd",
  "Next",
  '"NINGUN IPB HASTA 600"',
];
