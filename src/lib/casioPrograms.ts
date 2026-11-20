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

// What the program computes for a distributed load typed as its two end points and q per metre: the resultant acts at
// the centre of the span and its length is the distance between the points.
export function distributedLoad(
  from: [number, number, number],
  to: [number, number, number],
  q: [number, number, number],
): ProgramLoad {
  return {
    x: (from[0] + to[0]) / 2,
    y: (from[1] + to[1]) / 2,
    z: (from[2] + to[2]) / 2,
    fx: q[0],
    fy: q[1],
    fz: q[2],
    len: Math.hypot(to[0] - from[0], to[1] - from[1], to[2] - from[2]),
  };
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
  "0→F:0→G:0→H:0→I:0→J:0→K:0→E",
  "While 1=1",
  "ClrText",
  'Locate 1,1,"REACC  CARGAS":Locate 15,1,E',
  'Locate 1,2,"1 CARGAR"',
  'Locate 1,3,"2 REACCIONES"',
  'Locate 1,4,"3 CORTE EN BASE"',
  'Locate 1,5,"4 BORRAR TODO"',
  'Locate 1,6,"0 SALIR"',
  '"OPCION"?→B',
  // the options that do not touch B come first: loading a load reuses B for the end point of a distributed one
  "If B=0:Then Stop:IfEnd",
  "If B=4:Then 0→F:0→G:0→H:0→I:0→J:0→K:0→E:IfEnd",
  "If B=2:Then",
  "ClrText",
  'Locate 1,1,"REACCIONES EN A"',
  'Locate 1,2,"FX":Locate 4,2,–F',
  'Locate 1,3,"FY":Locate 4,3,–G',
  'Locate 1,4,"FZ":Locate 4,4,–H',
  'Locate 12,2,"MX":Locate 14,2,–I',
  'Locate 12,3,"MY":Locate 14,3,–J',
  'Locate 12,4,"MZ":Locate 14,4,–K',
  "While Getkey>0:WhileEnd",
  "While Getkey=0:WhileEnd",
  "IfEnd",
  "If B=3:Then",
  "ClrText",
  'Locate 1,1,"CORTE EN BASE (PILAR)"',
  'Locate 1,2,"N":Locate 5,2,H',
  'Locate 1,3,"QX":Locate 5,3,–G',
  'Locate 1,4,"QY":Locate 5,4,–F',
  'Locate 1,5,"MX":Locate 5,5,–J',
  'Locate 1,6,"MY":Locate 5,6,–I',
  "While Getkey>0:WhileEnd",
  "While Getkey=0:WhileEnd",
  "IfEnd",
  "If B=1:Then",
  '"CARGAS A AGREGAR"?→N',
  "For 1→C To N",
  "0→P:0→Q:0→R:0→U:0→V:0→W:0→X:0→Y:0→Z:1→L",
  '"CARGA"',
  "E+1◢",
  '"1 PUNT 2 DIST 3 MOM"?→T',
  "If T=1",
  'Then "X"?→X:"Y"?→Y:"Z"?→Z',
  '"FX"?→U:"FY"?→V:"FZ"?→W',
  "IfEnd",
  "If T=2",
  'Then "X INI"?→X:"Y INI"?→Y:"Z INI"?→Z',
  '"X FIN"?→A:"Y FIN"?→B:"Z FIN"?→D',
  '"QX KG/M"?→U:"QY KG/M"?→V:"QZ KG/M"?→W',
  "A–X→M:B–Y→O:D–Z→S",
  "√(M×M+O×O+S×S)→L",
  "(X+A)÷2→X:(Y+B)÷2→Y:(Z+D)÷2→Z",
  "IfEnd",
  "If T=3",
  'Then "MX"?→P:"MY"?→Q:"MZ"?→R',
  "IfEnd",
  "U×L→U:V×L→V:W×L→W",
  // what the program understood, to confirm it (or type the load again) before it is added
  "ClrText",
  'Locate 1,1,"CARGA":Locate 7,1,E+1',
  "If T<3:Then",
  'Locate 1,2,"X":Locate 3,2,X',
  'Locate 1,3,"Y":Locate 3,3,Y',
  'Locate 1,4,"Z":Locate 3,4,Z',
  'Locate 11,2,"FX":Locate 14,2,U',
  'Locate 11,3,"FY":Locate 14,3,V',
  'Locate 11,4,"FZ":Locate 14,4,W',
  "IfEnd",
  'If T=2:Then Locate 1,5,"L":Locate 3,5,L:IfEnd',
  "If T=3:Then",
  'Locate 1,2,"MX":Locate 4,2,P',
  'Locate 1,3,"MY":Locate 4,3,Q',
  'Locate 1,4,"MZ":Locate 4,4,R',
  "IfEnd",
  '"OK? 1=SI 0=REPETIR"?→O',
  "If O=0:Then C–1→C:IfEnd",
  "If Abs (O)>0:Then",
  "F+U→F:G+V→G:H+W→H",
  "I+Y×W–Z×V+P→I",
  "J+Z×U–X×W+Q→J",
  "K+X×V–Y×U+R→K",
  "E+1→E",
  "IfEnd",
  "Next",
  "IfEnd",
  "WhileEnd",
];

// ---- Program PERFIL: which IPB goes in the column for a given N, Mx, My --------------------------------------------
// The IPB 100…600 of the course's table are stored in the program itself (lists 1-5), so nothing has to be typed
// into the list editor. It tries them from the lightest and stops at the first with max |σ| ≤ σ_adm (typing 0 for σ_adm means 1400); it ends by drawing the face in XY, the face is chosen from the moments as in
// the guide: the strong axis against the larger moment (face 1 if |Mx| ≥ |My|, face 2 otherwise). Units: kg, kg·m, kg/cm². `chooseIPB` is the same arithmetic.
import { IPB_PROFILES } from "./profiles";
import { guideSection, neutralIntercepts, plane } from "./sectionGuide";

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

// Strong axis against the larger moment: face 1 (x against the strong axis, Ix) when |Mx| ≥ |My|, face 2 (turned) otherwise.
export const faceFor = (MxKgm: number, MyKgm: number): 1 | 2 => (Math.abs(MyKgm) > Math.abs(MxKgm) ? 2 : 1);

export function chooseIPB(
  N: number,
  MxKgm: number,
  MyKgm: number,
  sigmaAdm: number,
  face: 1 | 2 = faceFor(MxKgm, MyKgm),
): IPBChoice | null {
  for (const p of PERFIL_TABLE) {
    const s = sigmaMaxOf(p, N, MxKgm, MyKgm, face);
    if (s <= sigmaAdm) return { name: p.name, sigmaMax: s };
  }
  return null;
}

// Where the neutral axis (σ = 0) crosses the section's x axis (y = 0) and y axis (x = 0), cm, on the given face; null when
// it does not cross (that moment is 0). Same formulas as the guide: x₀ = −N·Iy/(A·My), y₀ = −N·Ix/(A·Mx).
export function neutralAxisOf(name: string, face: 1 | 2, N: number, MxKgm: number, MyKgm: number) {
  return neutralIntercepts(plane(N, MxKgm, MyKgm, guideSection(name, face === 2)));
}

const list = (n: number, f: (p: (typeof PERFIL_TABLE)[number]) => number) => `{${PERFIL_TABLE.map(f).join(",")}}→List ${n}`;

export const PERFIL_LINES = [
  list(1, (p) => p.h),
  list(2, (p) => p.bf),
  list(3, (p) => p.A),
  list(4, (p) => p.Ix),
  list(5, (p) => p.Iy),
  list(6, (p) => p.tf),
  list(7, (p) => p.tw),
  '"N KG (TRAC POS)"?→N',
  '"MX (KG M)"?→P',
  '"MY (KG M)"?→Q',
  '"SIGMA ADM (0=1400)"?→S',
  "If S=0:Then 1400→S:IfEnd",
  "1→T",
  "If Abs (Q)>Abs (P):Then 2→T:IfEnd",
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
  '"CARA ="',
  "T◢",
  "If Abs (Q)>0:Then",
  '"X (Y=0) ="',
  "–M÷(Q×100÷Y)◢",
  "IfEnd",
  "If Q=0:Then",
  '"E.N. NO CORTA X"',
  "IfEnd",
  "If Abs (P)>0:Then",
  '"Y (X=0) ="',
  "–M÷(P×100÷X)◢",
  "IfEnd",
  "If P=0:Then",
  '"E.N. NO CORTA Y"',
  "IfEnd",
  // the face drawn in XY: outline of the section (12 edges), the axes, the neutral axis and the critical corner
  "List 2[I]÷20→A:List 1[I]÷20→C",
  "List 6[I]÷10→F:List 7[I]÷20→H",
  "{–A,A,A,H,H,A,A,–A,–A,–H,–H,–A}→List 8",
  "{–C,–C,F–C,F–C,C–F,C–F,C,C,C–F,C–F,F–C,F–C}→List 9",
  "D→Z:If E÷2>Z:Then E÷2→Z:IfEnd",
  "1.25×Z→V:2×V→O",
  "Cls",
  "ViewWindow –O,O,1,–V,V,1",
  "For 1→J To 12",
  "J+1→K:If K=13:Then 1→K:IfEnd",
  "If T=1:Then F-Line List 8[J],List 9[J],List 8[K],List 9[K]:IfEnd",
  "If T=2:Then F-Line List 9[J],List 8[J],List 9[K],List 8[K]:IfEnd",
  "Next",
  "Horizontal 0:Vertical 0",
  "Q×100÷Y→B:P×100÷X→G",
  "If Abs (G)>0:Then F-Line –O,–(M–B×O)÷G,O,–(M+B×O)÷G:IfEnd",
  "If G=0:Then",
  "If Abs (B)>0:Then Vertical –M÷B:IfEnd",
  "IfEnd",
  "1→K:If B<0:Then –1→K:IfEnd",
  "1→L:If G<0:Then –1→L:IfEnd",
  "1→J:If Abs (M–W)>Abs (M+W):Then –1→J:IfEnd",
  "PlotOn J×K×E,J×L×D",
  "Text 1,1,M+J×W",
  "While Getkey>0:WhileEnd",
  "While Getkey=0:WhileEnd",
  "Stop",
  "IfEnd",
  "Next",
  '"NINGUN IPB HASTA 600"',
];

// ---- Program VIGACAB: the beam and the cable of truss-cable-beam(-ipb260)-kg.svg ----------------------------------
// A horizontal beam held at one end by a vertical cable and pinned at the other (so the beam has no axial force and
// only bending), loaded by ONE point load and a uniform load q over the whole span. The beam is sized/verified for the
// applied load alone (its own weight is not in its M, as the professor does) but the weight of the lightest profile goes to the cable (half) and
// to the pin (half). Cable: A = T/σ_adm, d = √(4A/π), elongation σ_adm·L/E with E = 2.1e6 kg/cm². The IPB 100…1000 of the
// course's table (h, Sx, kg/m) are stored in the program (lists 1-3). It ends by drawing the diagram of moments. Units: kg, m, kg/cm². `cableBeam` is the same
// arithmetic; casioPrograms.test.ts compares both with the app's own checks (checks.ts) on the two examples.
export const VIGACAB_NAME = "VIGACAB";

export interface CableBeamInput {
  L: number; // span of the beam, m
  Lc: number; // length of the cable, m
  loads: { P: number; a: number }[]; // point loads: kg (downward positive) and their distance from the cable end, m
  q: number; // uniform load over the whole span, kg/m
  sigmaAdm?: number; // kg/cm², default 1600
}

export interface CableBeamResult {
  Mmax: number; // kg·m, of the applied loads alone
  sxReq: number; // cm³
  min: { name: string; sigma: number; w: number } | null; // lightest IPB of 100…1000 that passes
  T: number; // cable tension, kg (with half of the weight of that lightest profile)
  A: number; // cm²
  d: number; // cm
  elongation: number; // cm
  vPin: number; // vertical reaction of the pinned end, kg
}

export function cableBeam(i: CableBeamInput): CableBeamResult {
  const S = i.sigmaAdm || 1600;
  const R = i.loads.reduce((r, { P, a }) => r + (P * (i.L - a)) / i.L, (i.q * i.L) / 2); // reaction at the cable end
  const M_at = (x: number) =>
    R * x - (i.q * x * x) / 2 - i.loads.reduce((m, { P, a }) => (a < x ? m + P * (x - a) : m), 0);
  // M is piecewise a parabola (concave with q) with corners under the loads, so the maximum is under a load or where
  // the shear is zero: the same search as the program (a grid of 200 steps + under each load, then the exact zero
  // of the shear next to the best grid point)
  const h = i.L / 200;
  const xs = [...Array.from({ length: 201 }, (_, k) => k * h), ...i.loads.map((l) => l.a)];
  let M = 0;
  let xg = 0;
  for (const x of xs) {
    const m = M_at(x);
    if (m > M) {
      M = m;
      xg = x;
    }
  }
  if (i.q > 0) {
    const left = i.loads.reduce((m, { P, a }) => (a < xg ? m + P : m), 0);
    const x1 = (R - left) / i.q; // zero shear with the loads left of the best point
    const leftAt = i.loads.reduce((m, { P, a }) => (a < x1 ? m + P : m), 0);
    if (x1 > 0 && x1 < i.L && leftAt === left) M = Math.max(M, M_at(x1));
  }
  const sx = (M * 100) / S;
  const table = IPB_PROFILES;
  const minP = table.find((p) => sx <= p.Sx) ?? null;
  const w = minP?.w ?? 0;
  const T = R + (w * i.L) / 2;
  const A = T / S;
  const total = i.loads.reduce((t, l) => t + l.P, 0);
  return {
    Mmax: M,
    sxReq: sx,
    min: minP && { name: minP.name, sigma: (M * 100) / minP.Sx, w: minP.w },
    T,
    A,
    d: Math.sqrt((4 * A) / Math.PI),
    elongation: (S * i.Lc * 100) / 2100000,
    vPin: total + i.q * i.L + w * i.L - T,
  };
}

const listOf = (n: number, f: (p: (typeof IPB_PROFILES)[number]) => number) => `{${IPB_PROFILES.map(f).join(",")}}→List ${n}`;

export const VIGACAB_LINES = [
  listOf(1, (p) => p.h),
  listOf(2, (p) => p.Sx),
  listOf(3, (p) => p.w),
  '"LUZ VIGA M"?→L',
  '"LARGO CABLE M"?→C',
  '"CARGAS PUNTUALES"?→N',
  "If N>0:Then",
  "For 1→J To N",
  '"DIST DESDE CABLE M"?→X:X→List 4[J]',
  '"P KG"?→Y:Y→List 5[J]',
  "Next",
  "IfEnd",
  '"Q KG/M"?→Q',
  '"SIGMA ADM (0=1600)"?→S',
  "If S=0:Then 1600→S:IfEnd",
  "Q×L÷2→R:0→B",
  "If N>0:Then",
  "For 1→J To N",
  "R+List 5[J]×(L–List 4[J])÷L→R:B+List 5[J]→B",
  "Next",
  "IfEnd",
  // the maximum moment: a grid of 200 steps plus the section under each load...
  "0→M:0→G",
  "For 0→K To 200+N",
  "K×L÷200→X",
  "If K>200:Then List 4[K–200]→X:IfEnd",
  "R×X–Q×X×X÷2→Y",
  "If N>0:Then",
  "For 1→J To N",
  "If List 4[J]<X:Then Y–List 5[J]×(X–List 4[J])→Y:IfEnd",
  "Next",
  "IfEnd",
  "If Y>M:Then Y→M:X→G:IfEnd",
  "Next",
  // ...and, with q, the exact zero of the shear next to the best point (the loads to its left decide it)
  "If Q>0:Then",
  "0→V",
  "If N>0:Then",
  "For 1→J To N",
  "If List 4[J]<G:Then V+List 5[J]→V:IfEnd",
  "Next",
  "IfEnd",
  "(R–V)÷Q→X",
  "0→Z",
  "If N>0:Then",
  "For 1→J To N",
  "If List 4[J]<X:Then Z+List 5[J]→Z:IfEnd",
  "Next",
  "IfEnd",
  "If X>0:Then",
  "If X<L:Then",
  "If Z=V:Then",
  "R×X–Q×X×X÷2→Y",
  "If N>0:Then",
  "For 1→J To N",
  "If List 4[J]<X:Then Y–List 5[J]×(X–List 4[J])→Y:IfEnd",
  "Next",
  "IfEnd",
  "If Y>M:Then Y→M:IfEnd",
  "IfEnd",
  "IfEnd",
  "IfEnd",
  "IfEnd",
  "M×100÷S→W",
  "0→K",
  `For 1→I To ${IPB_PROFILES.length}`,
  "If K=0:Then",
  "If W≤List 2[I]:Then I→K:IfEnd",
  "IfEnd",
  "Next",
  '"M MAX KG M"',
  "M◢",
  '"SX NEC CM3"',
  "W◢",
  "0→Z",
  "If K=0:Then",
  '"NINGUN IPB HASTA 1000"',
  "IfEnd",
  "If K>0:Then",
  "List 3[K]→Z",
  '"IPB MIN"',
  "List 1[K]◢",
  '"SIGMA CON IPB MIN"',
  "M×100÷List 2[K]◢",
  "IfEnd",
  "R+Z×L÷2→T",
  '"TENSION CABLE KG"',
  "T◢",
  "T÷S→A",
  '"A CABLE CM2"',
  "A◢",
  '"D CABLE CM"',
  "√(4×A÷3.14159265)◢",
  '"ALARG CABLE CM"',
  "S×C×100÷2100000◢",
  '"V PIN KG"',
  "B+Q×L+Z×L–T◢",
  // the diagram of moments: positive M plotted downward (the tension side), 40 segments, the value of Mmax on top;
  // it stays on screen until a key is pressed
  "If M>0:Then",
  "Cls",
  "ViewWindow 0,L,L÷4,–1.25×M,0.35×M,M",
  "Horizontal 0",
  "0→X:0→Y",
  "For 1→I To 40",
  "I×L÷40→B",
  "R×B–Q×B×B÷2→E",
  "If N>0:Then",
  "For 1→J To N",
  "If List 4[J]<B:Then E–List 5[J]×(B–List 4[J])→E:IfEnd",
  "Next",
  "IfEnd",
  "F-Line X,–Y,B,–E",
  "B→X:E→Y",
  "Next",
  "Text 1,1,M",
  "While Getkey>0:WhileEnd",
  "While Getkey=0:WhileEnd",
  "IfEnd",
];

// ---- Program TRACCION: the IPB of a bar of a truss in tension ------------------------------------------------------
// A two-force bar has no bending, so the check is σ = N/A ≤ σ_adm: A ≥ N/σ_adm and the lightest IPB 100…1000 whose area
// reaches it (no Euler in tension — the app's `size` does the same: b5 of the first truss gets IPB 100). Units: kg and
// kg/cm² (σ_adm typed as 0 means 1600). The table (h, A, kg/m) is stored in the program (lists 1-3).
export const TRACCION_NAME = "TRACCION";

export interface TensionBar {
  A: number; // cm² needed
  name: string | null; // lightest IPB that passes, null when none up to IPB 1000 does
  Aprofile: number;
  sigma: number; // kg/cm² with that profile
  w: number; // kg/m
}

export function tensionBar(N: number, sigmaAdm = 0): TensionBar {
  const S = sigmaAdm || 1600;
  const A = Math.abs(N) / S;
  const p = IPB_PROFILES.find((q) => A <= q.A) ?? null;
  return p
    ? { A, name: p.name, Aprofile: p.A, sigma: Math.abs(N) / p.A, w: p.w }
    : { A, name: null, Aprofile: 0, sigma: 0, w: 0 };
}

export const TRACCION_LINES = [
  listOf(1, (p) => p.h),
  listOf(2, (p) => p.A),
  listOf(3, (p) => p.w),
  '"N TRACCION KG"?→N',
  '"SIGMA ADM (0=1600)"?→S',
  "If S=0:Then 1600→S:IfEnd",
  "Abs (N)÷S→A",
  "0→K",
  `For 1→I To ${IPB_PROFILES.length}`,
  "If K=0:Then",
  "If A≤List 2[I]:Then I→K:IfEnd",
  "IfEnd",
  "Next",
  '"A NECESARIA CM2"',
  "A◢",
  "If K=0:Then",
  '"NINGUN IPB HASTA 1000"',
  "IfEnd",
  "If K>0:Then",
  '"IPB"',
  "List 1[K]◢",
  '"A DEL IPB CM2"',
  "List 2[K]◢",
  '"SIGMA REAL KG CM2"',
  "Abs (N)÷List 2[K]◢",
  '"PESO KG M"',
  "List 3[K]",
  "IfEnd",
];

// ---- Program PANDEO: the IPB of a bar of a truss in compression (Euler) -------------------------------------------
// P_cr = π²·E·I/(β·L)² must reach the load, so I_min = P·(β·L)²/(π²·E) (weak axis Iy; E = 2.1e6 kg/cm²; β = 1 for the pinned
// ends of a truss bar, as the app does) and the area must still reach P/σ_adm. The lightest IPB 100…1000 that meets BOTH.
// Units: kg, m, kg/cm² (σ_adm typed as 0 is 1600, β typed as 0 is 1). Table (h, A, Iy, kg/m) in lists 1-4.
export const PANDEO_NAME = "PANDEO";

export interface CompressionBar {
  Imin: number; // cm⁴, from Euler
  Amin: number; // cm², from σ_adm
  name: string | null; // lightest IPB with Iy ≥ Imin and A ≥ Amin; null when none up to IPB 1000
  Iy: number;
  A: number;
  pcr: number; // kg, of that profile
  sigma: number; // kg/cm²
  w: number; // kg/m
}

export function compressionBar(P: number, L: number, beta = 0, sigmaAdm = 0): CompressionBar {
  const S = sigmaAdm || 1600;
  const Le = (beta || 1) * L * 100; // cm
  const E = 2100000;
  const Imin = (Math.abs(P) * Le * Le) / (Math.PI ** 2 * E);
  const Amin = Math.abs(P) / S;
  const p = IPB_PROFILES.find((q) => Imin <= q.Iy && Amin <= q.A) ?? null;
  return {
    Imin,
    Amin,
    name: p?.name ?? null,
    Iy: p?.Iy ?? 0,
    A: p?.A ?? 0,
    pcr: p ? (Math.PI ** 2 * E * p.Iy) / (Le * Le) : 0,
    sigma: p ? Math.abs(P) / p.A : 0,
    w: p?.w ?? 0,
  };
}

export const PANDEO_LINES = [
  listOf(1, (p) => p.h),
  listOf(2, (p) => p.A),
  listOf(3, (p) => p.Iy),
  listOf(4, (p) => p.w),
  '"P COMPRESION KG"?→P',
  '"LARGO BARRA M"?→L',
  '"BETA (0=1)"?→B',
  "If B=0:Then 1→B:IfEnd",
  '"SIGMA ADM (0=1600)"?→S',
  "If S=0:Then 1600→S:IfEnd",
  "B×L×100→E",
  "Abs (P)×E×E÷(9.869604401×2100000)→M",
  "Abs (P)÷S→A",
  "0→K",
  `For 1→I To ${IPB_PROFILES.length}`,
  "If K=0:Then",
  "If M≤List 3[I]:Then",
  "If A≤List 2[I]:Then I→K:IfEnd",
  "IfEnd",
  "IfEnd",
  "Next",
  '"I MIN CM4 EULER"',
  "M◢",
  '"A MIN CM2"',
  "A◢",
  "If K=0:Then",
  '"NINGUN IPB HASTA 1000"',
  "IfEnd",
  "If K>0:Then",
  '"IPB"',
  "List 1[K]◢",
  '"IY CM4"',
  "List 3[K]◢",
  '"A DEL IPB CM2"',
  "List 2[K]◢",
  '"PCR KG"',
  "9.869604401×2100000×List 3[K]÷(E×E)◢",
  '"SIGMA KG CM2"',
  "Abs (P)÷List 2[K]◢",
  '"PESO KG M"',
  "List 4[K]",
  "IfEnd",
];
