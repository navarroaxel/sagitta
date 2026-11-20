// Casio fx-9860GIII program REACC: support reactions of a 3D frame fixed at A from its loads, and the internal
// forces at the base of a vertical column. The program text is the single source for the /casio-reacciones page;
// `reactionsFromLoads` is the same arithmetic in TypeScript so casioPrograms.test.ts can check it against the solver.
// Statically determinate (one fixed support): the reactions are minus the sum of the loads and of their moments
// about A, M = r × F (the same formula as examples/t-frame-3d-fixed-kg.svg). Units: kg, m, kg·m. Presentation only.

// An interactive menu: ▲ (28) and ▼ (37) move a > marker, EXE (31) chooses, a number key chooses that item at once and
// 0 (71) / EXIT (47) leave. Key codes: the fx-9860GIII manual's Getkey chart (cap. 8). `count` items on the lines row0..
// (default 2; the text screen has 7 lines). The choice ends in `choice` (1..n). `exit` says what 0 / EXIT do: "item" = the
// last item is "0 SALIR" and chooses 0, "zero" = chooses 0 with no item for it, a number = chooses that item (the safe one
// of a yes/no), none = nothing. `flag` is a free letter used as the loop's flag, `sel` the selection (default S) and `key`
// the key (default W): each use picks letters that are free at that point of its program. `clear: false` keeps the
// screen (the summary of a load stays above its OK / REPETIR menu).
const DIGIT_KEY = [71, 72, 62, 52, 73, 63, 53, 74, 64, 54]; // 0 1 2 3 4 5 6 7 8 9
function menuLines(o: {
  count: number;
  exit?: "item" | "zero" | number;
  choice: string;
  flag: string;
  draw: string[];
  sel?: string;
  key?: string;
  row0?: number;
  clear?: boolean;
  start?: number;
}): string[] {
  const sel = o.sel ?? "S";
  const key = o.key ?? "W";
  const row0 = o.row0 ?? 2;
  // each item ends with a superscript of its number key (the hidden shortcut): ¹ ² … and ⁰ for "SALIR"
  const draw = o.draw.map((line) => {
    const m = /^Locate 3,(\d+),"(.*)"$/.exec(line);
    if (!m || +m[1] < row0 || +m[1] >= row0 + o.count) return line;
    const idx = +m[1] - row0 + 1;
    const digit = o.exit === "item" && idx === o.count ? 0 : idx;
    return `Locate 3,${m[1]},"${m[2]}${"⁰¹²³⁴⁵⁶⁷⁸⁹"[digit]}"`;
  });
  const items = o.exit === "item" ? o.count - 1 : o.count;
  const exitSel = o.exit === "item" ? o.count : o.exit === "zero" ? 0 : o.exit;
  return [
    `${o.start ?? 1}→${sel}:1→${o.flag}`,
    ...(o.clear === false ? [] : ["ClrText"]),
    ...draw,
    `While ${o.flag}=1`,
    Array.from({ length: o.count }, (_, k) => `Locate 1,${k + row0}," "`).join(":"),
    `Locate 1,${sel}+${row0 - 1},">"`,
    "While Getkey>0:WhileEnd",
    `0→${key}`,
    `While ${key}=0`,
    `Getkey→${key}`,
    "WhileEnd",
    `If ${key}=28:Then ${sel}–1→${sel}:IfEnd`,
    `If ${key}=37:Then ${sel}+1→${sel}:IfEnd`,
    `If ${sel}<1:Then ${o.count}→${sel}:IfEnd`,
    `If ${sel}>${o.count}:Then 1→${sel}:IfEnd`,
    `If ${key}=31:Then 0→${o.flag}:IfEnd`,
    ...Array.from({ length: items }, (_, k) => `If ${key}=${DIGIT_KEY[k + 1]}:Then ${k + 1}→${sel}:0→${o.flag}:IfEnd`),
    ...(exitSel === undefined
      ? []
      : [`If ${key}=71:Then ${exitSel}→${sel}:0→${o.flag}:IfEnd`, `If ${key}=47:Then ${exitSel}→${sel}:0→${o.flag}:IfEnd`]),
    "WhileEnd",
    `${sel}→${o.choice}`,
    ...(o.exit === "item" ? [`If ${sel}=${o.count}:Then 0→${o.choice}:IfEnd`] : []),
  ];
}

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
  // the loads live in lists 11-20 (kind, centre, resultant force, applied moment: one slot each, up to 20) and their
  // number in List 21, so they survive leaving the program and running another one (the letters A-Z do not: every
  // program uses them). 0 starts over (the first time it must be 0: the lists do not exist yet), 1 goes on.
  ...menuLines({
    count: 2,
    exit: 1,
    choice: "B",
    flag: "O",
    draw: ['Locate 1,1,"REACC"', 'Locate 3,2,"SEGUIR GUARDADAS"', 'Locate 3,3,"NUEVA (BORRA TODO)"'],
  }),
  "If B=2:Then 0→B:IfEnd",
  "0→F:0→G:0→H:0→I:0→J:0→K:0→E",
  "If B=0:Then",
  ...Array.from({ length: 10 }, (_, k) => `{${Array(20).fill("0").join(",")}}→List ${k + 11}`),
  "{0}→List 21",
  "IfEnd",
  "If B<>0:Then".replace("B<>0","Abs (B)>0"),
  "List 21[1]→E",
  "If E>0:Then",
  "For 1→N To E",
  "List 12[N]→X:List 13[N]→Y:List 14[N]→Z",
  "List 15[N]→U:List 16[N]→V:List 17[N]→L",
  "List 18[N]→P:List 19[N]→Q:List 20[N]→R",
  "F+U→F:G+V→G:H+L→H",
  "I+Y×L–Z×V+P→I",
  "J+Z×U–X×L+Q→J",
  "K+X×V–Y×U+R→K",
  "Next",
  "IfEnd",
  "IfEnd",
  
  "While 1=1",
  ...menuLines({
    count: 6,
    exit: "item",
    choice: "B",
    flag: "O",
    draw: [
      'Locate 1,1,"REACC  CARGAS":Locate 15,1,E',
      'Locate 3,2,"AGREGAR CARGAS"',
      'Locate 3,3,"LISTAR CARGAS"',
      'Locate 3,4,"REACCIONES"',
      'Locate 3,5,"CORTE EN BASE"',
      'Locate 3,6,"BORRAR TODO"',
      'Locate 3,7,"SALIR"',
    ],
  }),
  // the options that do not touch B come first: loading a load reuses B for the end point of a distributed one
  "If B=0:Then Stop:IfEnd",
  "If B=5:Then",
  ...menuLines({
    count: 2,
    exit: 1,
    choice: "N",
    flag: "O",
    draw: ['Locate 1,1,"BORRAR TODO?"', 'Locate 3,2,"NO"', 'Locate 3,3,"SI, BORRAR TODO"'],
  }),
  "If N=2:Then 0→F:0→G:0→H:0→I:0→J:0→K:0→E:0→List 21[1]:IfEnd",
  "IfEnd",
  "If B=3:Then",
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
  "If B=4:Then",
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
  // 4: list the loads (3 per screen) and delete one if asked; the sums are rebuilt from the list
  "If B=2:Then",
  "If E=0:Then",
  "ClrText",
  'Locate 1,1,"NO HAY CARGAS"',
  "While Getkey>0:WhileEnd",
  "While Getkey=0:WhileEnd",
  "IfEnd",
  "If E>0:Then",
  "1→W",
  "While W>0",
  "ClrText",
  'Locate 1,1,"N T  X     Y     Z"',
  "2→R",
  "For 1→C To E",
  "List 11[C]→T",
  "Locate 1,R,C",
  'If T=1:Then Locate 3,R,"P":IfEnd',
  'If T=2:Then Locate 3,R,"D":IfEnd',
  'If T=3:Then Locate 3,R,"M":IfEnd',
  "If T<3:Then",
  "Locate 5,R,List 12[C]:Locate 11,R,List 13[C]:Locate 17,R,List 14[C]",
  'Locate 3,R+1,"F"',
  "Locate 5,R+1,List 15[C]:Locate 11,R+1,List 16[C]:Locate 17,R+1,List 17[C]",
  "IfEnd",
  "If T=3:Then",
  'Locate 3,R+1,"M"',
  "Locate 5,R+1,List 18[C]:Locate 11,R+1,List 19[C]:Locate 17,R+1,List 20[C]",
  "IfEnd",
  "R+2→R",
  "If R>7:Then",
  "If C<E:Then",
  "While Getkey>0:WhileEnd",
  "While Getkey=0:WhileEnd",
  "ClrText",
  'Locate 1,1,"N T  X     Y     Z"',
  "2→R",
  "IfEnd",
  "IfEnd",
  "Next",
  ...menuLines({
    count: 2,
    exit: 1,
    choice: "N",
    flag: "O",
    draw: ['Locate 1,1,"CARGAS"', 'Locate 3,2,"VOLVER AL MENU"', 'Locate 3,3,"BORRAR UNA CARGA"'],
  }),
  "0→W",
  "If N=2:Then",
  "ClrText",
  '"CARGA N A BORRAR"?→W',
  "IfEnd",
  "If W>0:Then",
  "If W>E:Then E→W:IfEnd",
  "If W<E:Then",
  "For W→C To E–1",
  "List 11[C+1]→List 11[C]:List 12[C+1]→List 12[C]:List 13[C+1]→List 13[C]:List 14[C+1]→List 14[C]:List 15[C+1]→List 15[C]",
  "List 16[C+1]→List 16[C]:List 17[C+1]→List 17[C]:List 18[C+1]→List 18[C]:List 19[C+1]→List 19[C]:List 20[C+1]→List 20[C]",
  "Next",
  "IfEnd",
  "E–1→E:E→List 21[1]",
  "0→F:0→G:0→H:0→I:0→J:0→K",
  "If E>0:Then",
  "For 1→N To E",
  "List 12[N]→X:List 13[N]→Y:List 14[N]→Z",
  "List 15[N]→U:List 16[N]→V:List 17[N]→L",
  "List 18[N]→P:List 19[N]→Q:List 20[N]→R",
  "F+U→F:G+V→G:H+L→H",
  "I+Y×L–Z×V+P→I",
  "J+Z×U–X×L+Q→J",
  "K+X×V–Y×U+R→K",
  "Next",
  "IfEnd",
  "If E=0:Then 0→W:IfEnd",
  "IfEnd",
  "WhileEnd",
  "IfEnd",
  "IfEnd",
  "If B=1:Then",
  "20–E→M",
  "If M=0:Then",
  "ClrText",
  'Locate 1,1,"YA HAY 20 CARGAS"',
  "While Getkey>0:WhileEnd",
  "While Getkey=0:WhileEnd",
  "IfEnd",
  "If M>0:Then",
  "ClrText",
  'Locate 1,1,"AGREGAR CARGAS"',
  '"CARGAS A AGREGAR"?→N',
  "If N>M:Then M→N:IfEnd",
  "For 1→C To N",
  "0→P:0→Q:0→R:0→U:0→V:0→W:0→X:0→Y:0→Z:1→L",
  ...menuLines({
    count: 3,
    choice: "T",
    flag: "D",
    key: "A",
    draw: ['Locate 1,1,"CARGA":Locate 7,1,E+1', 'Locate 3,2,"PUNTUAL"', 'Locate 3,3,"DISTRIBUIDA"', 'Locate 3,4,"MOMENTO"'],
  }),
  "ClrText",
  'Locate 1,1,"CARGA":Locate 7,1,E+1',
  "If T=1",
  'Then "X"?→X:"Y"?→Y:"Z"?→Z',
  '"FX"?→U:"FY"?→V:"FZ"?→W',
  "IfEnd",
  "If T=2",
  'Then "X INICIO"?→X:"X FIN"?→A',
  '"Y INICIO"?→Y:"Y FIN"?→B',
  '"Z INICIO"?→Z:"Z FIN"?→D',
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
  ...menuLines({
    count: 2,
    exit: 2,
    choice: "O",
    flag: "D",
    key: "A",
    row0: 6,
    clear: false,
    draw: ['Locate 3,6,"OK, AGREGAR"', 'Locate 3,7,"REPETIR"'],
  }),
  "If O=2:Then 0→O:IfEnd",
  "If O=0:Then C–1→C:IfEnd",
  "If Abs (O)>0:Then",
  "F+U→F:G+V→G:H+W→H",
  "I+Y×W–Z×V+P→I",
  "J+Z×U–X×W+Q→J",
  "K+X×V–Y×U+R→K",
  "T→List 11[E+1]:X→List 12[E+1]:Y→List 13[E+1]:Z→List 14[E+1]",
  "U→List 15[E+1]:V→List 16[E+1]:W→List 17[E+1]",
  "P→List 18[E+1]:Q→List 19[E+1]:R→List 20[E+1]",
  "E+1→E:E→List 21[1]",
  "IfEnd",
  "Next",
  "IfEnd",
  "IfEnd",
  "WhileEnd",
];

// ---- Program PERFIL: which IPB goes in the column for a given N, Mx, My --------------------------------------------
// The IPB 100…600 of the course's table are stored in the program itself (lists 1-5), so nothing has to be typed
// into the list editor. It tries them from the lightest and stops at the first with max |σ| ≤ σ_adm (typing 0 for σ_adm means 1400); it ends by drawing the face in XY, the face is chosen from the moments as in
// the guide: the strong axis against the larger moment (face 1 if |Mx| ≥ |My|, face 2 otherwise). Units: kg, kg·m, kg/cm². `chooseIPB` is the same arithmetic.
import { IPB_PROFILES, IPN_PROFILES } from "./profiles";
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
// ends of a truss bar, as the app does) and the profile is the lightest IPB 100…1000 with Iy ≥ I_min. The area plays no part
// in the choice; σ = P/A of that profile is shown and the program warns if it exceeds σ_adm (a short, heavily loaded bar,
// which the app would size by area). Units: kg, m, kg/cm² (σ_adm typed as 0 is 1600, β typed as 0 is 1). Table (h, A, Iy,
// kg/m) in lists 1-4.
export const PANDEO_NAME = "PANDEO";

export interface CompressionBar {
  Imin: number; // cm⁴, from Euler
  name: string | null; // lightest IPB with Iy ≥ Imin; null when none up to IPB 1000
  Iy: number;
  A: number;
  pcr: number; // kg, of that profile
  sigma: number; // kg/cm²
  sigmaOk: boolean; // σ ≤ σ_adm (when false the bar is too short / loaded for Euler to be the only check)
  w: number; // kg/m
}

export function compressionBar(P: number, L: number, beta = 0, sigmaAdm = 0): CompressionBar {
  const S = sigmaAdm || 1600;
  const Le = (beta || 1) * L * 100; // cm
  const E = 2100000;
  const Imin = (Math.abs(P) * Le * Le) / (Math.PI ** 2 * E);
  const p = IPB_PROFILES.find((q) => Imin <= q.Iy) ?? null;
  const sigma = p ? Math.abs(P) / p.A : 0;
  return {
    Imin,
    name: p?.name ?? null,
    Iy: p?.Iy ?? 0,
    A: p?.A ?? 0,
    pcr: p ? (Math.PI ** 2 * E * p.Iy) / (Le * Le) : 0,
    sigma,
    sigmaOk: sigma <= S,
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
  "0→K",
  `For 1→I To ${IPB_PROFILES.length}`,
  "If K=0:Then",
  "If M≤List 3[I]:Then I→K:IfEnd",
  "IfEnd",
  "Next",
  '"I MIN CM4 EULER"',
  "M◢",
  "If K=0:Then",
  '"NINGUN IPB HASTA 1000"',
  "IfEnd",
  "If K>0:Then",
  '"IPB"',
  "List 1[K]◢",
  '"IY CM4"',
  "List 3[K]◢",
  '"PCR KG"',
  "9.869604401×2100000×List 3[K]÷(E×E)◢",
  '"A DEL IPB CM2"',
  "List 2[K]◢",
  '"SIGMA KG CM2"',
  "Abs (P)÷List 2[K]◢",
  "If Abs (P)÷List 2[K]>S:Then",
  '"OJO SIGMA SUPERA ADM"',
  "IfEnd",
  '"PESO KG M"',
  "List 4[K]",
  "IfEnd",
];

// ---- Program RETIC: bar forces of a statically determinate truss ---------------------------------------------------
// Up to 9 bars: 2·nodes = bars + 3 reactions → 3 to 6 nodes, a pinned support and a roller (vertical or horizontal
// reaction). The program asks nodes (x, y), bars (two nodes), supports and loads — each step can be corrected — builds the
// equilibrium matrix of the joints (2 rows per node, one column per bar and per reaction, N > 0 = tension) and solves it by
// Gaussian elimination with partial pivoting written in Basic (12 × 12 at most: a few seconds; no matrix command is needed,
// so the only commands are the ones the other programs use). Result: table of N with T / C per bar, the critical bars marked
// with * (largest tension, largest compression), their length (for PANDEO) and the reactions. Units: kg and m.
// Lists: 1 x, 2 y, 3 start node, 4 end node (bars), 5 Fx, 6 Fy (per node), 7 the 12 × 13 augmented matrix (row-major),
// 8 the solution. `rowStride` 13: element (r, c) is List 7[(r−1)×13+c]; column 13 is the right-hand side.
export const RETIC_NAME = "RETIC";
export const RETIC_MAX_BARS = 9;

const PAUSE = ["While Getkey>0:WhileEnd", "While Getkey=0:WhileEnd"];
const CLAMP = (v: string) => [`If ${v}<1:Then 1→${v}:IfEnd`, `If ${v}>N:Then N→${v}:IfEnd`];

export const RETIC_LINES = [
  "{0,0,0,0,0,0}→List 1",
  "{0,0,0,0,0,0}→List 2",
  "{0,0,0,0,0,0,0,0,0}→List 3",
  "{0,0,0,0,0,0,0,0,0}→List 4",
  "{0,0,0,0,0,0}→List 5",
  "{0,0,0,0,0,0}→List 6",
  "0→N:0→P:0→Q:1→D",
  "While 1=1",
  ...menuLines({
    count: 6,
    exit: "zero",
    choice: "O",
    flag: "Y",
    draw: [
      'Locate 1,1,"RETIC N=":Locate 9,1,N:Locate 12,1,"EXIT=SALIR"',
      'Locate 3,2,"NUDOS"',
      'Locate 3,3,"BARRAS"',
      'Locate 3,4,"APOYOS"',
      'Locate 3,5,"AGREGAR CARGAS"',
      'Locate 3,6,"BORRAR CARGAS"',
      'Locate 3,7,"RESOLVER"',
    ],
  }),
  "If O=0:Then Stop:IfEnd",
  // 5: clear the loads
  "If O=5:Then",
  ...menuLines({
    count: 2,
    exit: 1,
    choice: "X",
    flag: "Z",
    sel: "S",
    key: "M",
    draw: ['Locate 1,1,"BORRAR CARGAS?"', 'Locate 3,2,"NO"', 'Locate 3,3,"SI, BORRAR CARGAS"'],
  }),
  "If X=2:Then",
  "{0,0,0,0,0,0}→List 5",
  "{0,0,0,0,0,0}→List 6",
  "IfEnd",
  "IfEnd",
  // 3: supports
  "If O=3:Then",
  "If N=0:Then",
  "ClrText",
  'Locate 1,1,"PRIMERO LOS NUDOS"',
  ...PAUSE,
  "IfEnd",
  "If N>0:Then",
  "ClrText",
  'Locate 1,1,"APOYOS"',
  '"NUDO ARTICULADO"?→P',
  ...CLAMP("P"),
  '"NUDO RODILLO"?→Q',
  ...CLAMP("Q"),
  ...menuLines({
    count: 2,
    exit: 1,
    choice: "D",
    flag: "Z",
    sel: "S",
    key: "M",
    draw: ['Locate 1,1,"REACCION DEL RODILLO"', 'Locate 3,2,"VERTICAL"', 'Locate 3,3,"HORIZONTAL"'],
  }),
  "IfEnd",
  "IfEnd",
  // 1: nodes
  "If O=1:Then",
  "ClrText",
  '"N NUDOS (3 A 6)"?→N',
  "If N<3:Then 3→N:IfEnd",
  "If N>6:Then 6→N:IfEnd",
  "For 1→K To N",
  "ClrText",
  'Locate 1,1,"NUDO":Locate 6,1,K:Locate 9,1,"DE":Locate 12,1,N',
  'Locate 1,2,"X: HORIZONTAL (M)"',
  'Locate 1,3,"Y: VERTICAL (M)"',
  'Locate 1,4,"ORIGEN: UN PUNTO FIJO"',
  'Locate 1,5,"EJ: APOYO IZQ = 0,0"',
  '"X HORIZONTAL (M)"?→X:X→List 1[K]',
  '"Y VERTICAL (M)"?→Y:Y→List 2[K]',
  "Next",
  "1→W",
  "While W>0",
  "ClrText",
  'Locate 1,1,"NUDO     X       Y"',
  "For 1→J To N",
  "Locate 1,J+1,J:Locate 4,J+1,List 1[J]:Locate 12,J+1,List 2[J]",
  "Next",
  '"CORREGIR NUDO (0=NO)"?→W',
  "If W>0:Then",
  "If W>N:Then N→W:IfEnd",
  "W→K",
  "ClrText",
  'Locate 1,1,"NUDO":Locate 6,1,K:Locate 9,1,"DE":Locate 12,1,N',
  'Locate 1,2,"X: HORIZONTAL (M)"',
  'Locate 1,3,"Y: VERTICAL (M)"',
  'Locate 1,4,"ORIGEN: UN PUNTO FIJO"',
  'Locate 1,5,"EJ: APOYO IZQ = 0,0"',
  '"X HORIZONTAL (M)"?→X:X→List 1[K]',
  '"Y VERTICAL (M)"?→Y:Y→List 2[K]',
  "IfEnd",
  "WhileEnd",
  "IfEnd",
  // 2: bars
  "If O=2:Then",
  "If N=0:Then",
  "ClrText",
  'Locate 1,1,"PRIMERO LOS NUDOS"',
  ...PAUSE,
  "IfEnd",
  "If N>0:Then",
  "2×N–3→B",
  "For 1→K To B",
  "ClrText",
  'Locate 1,1,"BARRA":Locate 7,1,K:Locate 10,1,"DE":Locate 13,1,B',
  'Locate 1,2,"UNE DOS NUDOS"',
  'Locate 1,3,"EL ORDEN NO IMPORTA"',
  '"NUDO DE UN EXTREMO"?→X',
  ...CLAMP("X"),
  "X→List 3[K]",
  '"NUDO DEL OTRO EXTREMO"?→Y',
  ...CLAMP("Y"),
  "Y→List 4[K]",
  "Next",
  "1→W",
  "While W>0",
  "ClrText",
  'Locate 1,1,"BARRAS (NUDO>NUDO)"',
  "For 1→J To B",
  "If J<6:Then J+1→R:1→C:IfEnd",
  "If J>5:Then J–4→R:12→C:IfEnd",
  "Locate C,R,J:Locate C+3,R,List 3[J]:Locate C+4,R,\">\":Locate C+5,R,List 4[J]",
  "Next",
  '"CORREGIR BARRA (0=NO)"?→W',
  "If W>0:Then",
  "If W>B:Then B→W:IfEnd",
  "W→K",
  "ClrText",
  'Locate 1,1,"BARRA":Locate 7,1,K:Locate 10,1,"DE":Locate 13,1,B',
  'Locate 1,2,"UNE DOS NUDOS"',
  'Locate 1,3,"EL ORDEN NO IMPORTA"',
  '"NUDO DE UN EXTREMO"?→X',
  ...CLAMP("X"),
  "X→List 3[K]",
  '"NUDO DEL OTRO EXTREMO"?→Y',
  ...CLAMP("Y"),
  "Y→List 4[K]",
  "IfEnd",
  "WhileEnd",
  "IfEnd",
  "IfEnd",
  // 4: loads
  "If O=4:Then",
  "If N=0:Then",
  "ClrText",
  'Locate 1,1,"PRIMERO LOS NUDOS"',
  ...PAUSE,
  "IfEnd",
  "If N>0:Then",
  "ClrText",
  '"CARGAS A AGREGAR"?→W',
  "For 1→K To W",
  "ClrText",
  'Locate 1,1,"CARGA":Locate 7,1,K',
  '"NUDO"?→X',
  ...CLAMP("X"),
  '"FX KG (HACIA DER)"?→U',
  '"FY KG (HACIA ARRIBA)"?→V',
  "ClrText",
  'Locate 1,1,"NUDO":Locate 6,1,X',
  'Locate 1,2,"FX":Locate 4,2,U',
  'Locate 1,3,"FY":Locate 4,3,V',
  ...menuLines({
    count: 2,
    exit: 2,
    choice: "Y",
    flag: "Z",
    sel: "S",
    key: "M",
    row0: 6,
    clear: false,
    draw: ['Locate 3,6,"OK, AGREGAR"', 'Locate 3,7,"REPETIR"'],
  }),
  "If Y=2:Then 0→Y:IfEnd",
  "If Y=0:Then K–1→K:IfEnd",
  "If Abs (Y)>0:Then",
  "List 5[X]+U→List 5[X]",
  "List 6[X]+V→List 6[X]",
  "IfEnd",
  "Next",
  "IfEnd",
  "IfEnd",
  // 6: solve
  "If O=6:Then",
  "0→Z",
  "If N<3:Then 1→Z:IfEnd",
  "If P=0:Then 1→Z:IfEnd",
  "If Q=0:Then 1→Z:IfEnd",
  "If Z=0:Then",
  "2×N–3→B",
  "For 1→K To B",
  "If List 3[K]=0:Then 1→Z:IfEnd",
  "If List 4[K]=0:Then 1→Z:IfEnd",
  "Next",
  "IfEnd",
  "If Z=1:Then",
  "ClrText",
  'Locate 1,1,"FALTAN DATOS"',
  'Locate 1,2,"NUDOS BARRAS APOYOS"',
  ...PAUSE,
  "IfEnd",
  "If Z=0:Then",
  // the equilibrium matrix
  "2×N→M",
  "For 1→K To 156",
  "0→List 7[K]",
  "Next",
  "For 1→K To B",
  "List 3[K]→I:List 4[K]→J",
  "List 1[J]–List 1[I]→X:List 2[J]–List 2[I]→Y",
  "√(X×X+Y×Y)→L",
  "If L>0:Then X÷L→X:Y÷L→Y:IfEnd",
  "List 7[(2×I–2)×13+K]+X→List 7[(2×I–2)×13+K]",
  "List 7[(2×I–1)×13+K]+Y→List 7[(2×I–1)×13+K]",
  "List 7[(2×J–2)×13+K]–X→List 7[(2×J–2)×13+K]",
  "List 7[(2×J–1)×13+K]–Y→List 7[(2×J–1)×13+K]",
  "Next",
  "1→List 7[(2×P–2)×13+B+1]",
  "1→List 7[(2×P–1)×13+B+2]",
  "If D=2:Then 1→List 7[(2×Q–2)×13+B+3]:IfEnd",
  "If D=1:Then 1→List 7[(2×Q–1)×13+B+3]:IfEnd",
  "For 1→K To N",
  "–List 5[K]→List 7[(2×K–2)×13+13]",
  "–List 6[K]→List 7[(2×K–1)×13+13]",
  "Next",
  // Gaussian elimination with partial pivoting
  "For 1→K To M",
  "K→S:Abs (List 7[(K–1)×13+K])→T",
  "If K<M:Then",
  "For K+1→I To M",
  "If Abs (List 7[(I–1)×13+K])>T:Then I→S:Abs (List 7[(I–1)×13+K])→T:IfEnd",
  "Next",
  "IfEnd",
  "If T<0.000001:Then 1→Z:IfEnd",
  "If Z=0:Then",
  "If S>K:Then",
  "For 1→J To 13",
  "List 7[(K–1)×13+J]→X",
  "List 7[(S–1)×13+J]→List 7[(K–1)×13+J]",
  "X→List 7[(S–1)×13+J]",
  "Next",
  "IfEnd",
  "If K<M:Then",
  "For K+1→I To M",
  "List 7[(I–1)×13+K]÷List 7[(K–1)×13+K]→X",
  "For K→J To 13",
  "List 7[(I–1)×13+J]–X×List 7[(K–1)×13+J]→List 7[(I–1)×13+J]",
  "Next",
  "Next",
  "IfEnd",
  "IfEnd",
  "Next",
  "If Z=1:Then",
  "ClrText",
  'Locate 1,1,"ESTRUCTURA INESTABLE"',
  'Locate 1,2,"O MAL DEFINIDA"',
  ...PAUSE,
  "IfEnd",
  "If Z=0:Then",
  // back substitution
  "For 1→J To M",
  "M+1–J→K",
  "List 7[(K–1)×13+13]→X",
  "If K<M:Then",
  "For K+1→I To M",
  "X–List 7[(K–1)×13+I]×List 8[I]→X",
  "Next",
  "IfEnd",
  "X÷List 7[(K–1)×13+K]→List 8[K]",
  "Next",
  "For 1→K To M",
  "If Abs (List 8[K])<0.0001:Then 0→List 8[K]:IfEnd",
  "Next",
  // the critical bars
  "0→G:0→H:0→X:0→Y",
  "For 1→K To B",
  "If List 8[K]>X:Then List 8[K]→X:K→G:IfEnd",
  "If List 8[K]<Y:Then List 8[K]→Y:K→H:IfEnd",
  "Next",
  // the table, 6 bars per screen
  "ClrText",
  'Locate 1,1,"BARRA  N KG    T/C"',
  "2→R",
  "For 1→K To B",
  "Locate 1,R,K:Locate 4,R,List 8[K]",
  'If List 8[K]>0:Then Locate 17,R,"T":IfEnd',
  'If List 8[K]<0:Then Locate 17,R,"C":IfEnd',
  'If List 8[K]=0:Then Locate 17,R,"0":IfEnd',
  'If K=G:Then Locate 20,R,"*":IfEnd',
  'If K=H:Then Locate 20,R,"*":IfEnd',
  "R+1→R",
  "If R=8:Then",
  "If K<B:Then",
  ...PAUSE,
  "ClrText",
  'Locate 1,1,"BARRA  N KG    T/C"',
  "2→R",
  "IfEnd",
  "IfEnd",
  "Next",
  ...PAUSE,
  // the critical bars
  "ClrText",
  'Locate 1,1,"BARRAS CRITICAS (*)"',
  "If G>0:Then",
  'Locate 1,2,"MAX TRACCION BARRA":Locate 20,2,G',
  'Locate 1,3,"N =":Locate 5,3,X',
  "IfEnd",
  "If H>0:Then",
  "List 3[H]→I:List 4[H]→J",
  "√((List 1[J]–List 1[I])×(List 1[J]–List 1[I])+(List 2[J]–List 2[I])×(List 2[J]–List 2[I]))→L",
  'Locate 1,5,"MAX COMPRES. BARRA":Locate 20,5,H',
  'Locate 1,6,"N =":Locate 5,6,Y',
  'Locate 1,7,"LARGO M =":Locate 11,7,L',
  "IfEnd",
  ...PAUSE,
  // the reactions
  "ClrText",
  'Locate 1,1,"REACCIONES KG"',
  'Locate 1,2,"NUDO":Locate 6,2,P:Locate 9,2,"RX":Locate 12,2,List 8[B+1]',
  'Locate 9,3,"RY":Locate 12,3,List 8[B+2]',
  'Locate 1,4,"NUDO":Locate 6,4,Q',
  'If D=2:Then Locate 9,4,"RX":IfEnd',
  'If D=1:Then Locate 9,4,"RY":IfEnd',
  "Locate 12,4,List 8[B+3]",
  ...PAUSE,
  "IfEnd",
  "IfEnd",
  "IfEnd",
  "WhileEnd",
];

// ---- Program PERFILES: look up an IPN / IPB, or find the lightest one that meets a requirement ---------------------
// The properties the course uses: A, weight, Sx, Sy, Ix, Iy.
// 1 VER: series (IPN / IPB), then ▲ ▼ scroll the profiles → A (cm²), weight (kg/m), Sx, Sy (cm³), Ix, Iy (cm⁴).
// 2 BUSCAR: series, which property (Sx, Ix, A, Iy, Sy: a menu) and the value needed → the lightest profile of the series
// whose property reaches it (the tables are in increasing size), shown with the same data and what it gives.
// The 23 IPN and 24 IPB of the course's table (profiles.ts) are in lists 1-8: series, h, A, w, Ix, Sx, Iy, Sy.
export const PERFILES_NAME = "PERFILES";
export const SEARCH_TABLE = [...IPN_PROFILES, ...IPB_PROFILES];

export type SearchProp = 1 | 2 | 3 | 4 | 5; // Sx, Ix, A, Iy, Sy
const propOf = (p: (typeof SEARCH_TABLE)[number], q: SearchProp) => [p.Sx, p.Ix, p.A, p.Iy, p.Sy][q - 1];

export function findProfile(series: 1 | 2, h: number) {
  return SEARCH_TABLE.find((p) => (series === 1 ? p.series === "IPN" : p.series === "IPB") && p.h === h) ?? null;
}

export function lightestWith(series: 1 | 2, q: SearchProp, value: number) {
  const p = SEARCH_TABLE.find((r) => (series === 1 ? r.series === "IPN" : r.series === "IPB") && value <= propOf(r, q));
  return p ? { profile: p, value: propOf(p, q) } : null;
}

const tableList = (n: number, f: (p: (typeof SEARCH_TABLE)[number]) => number) => `{${SEARCH_TABLE.map(f).join(",")}}→List ${n}`;
const PAUSE2 = ["While Getkey>0:WhileEnd", "While Getkey=0:WhileEnd"];

export const PERFILES_LINES = [
  tableList(1, (p) => (p.series === "IPN" ? 1 : 2)),
  tableList(2, (p) => p.h),
  tableList(3, (p) => p.A),
  tableList(4, (p) => p.w),
  tableList(5, (p) => p.Ix),
  tableList(6, (p) => p.Sx),
  tableList(7, (p) => p.Iy),
  tableList(8, (p) => p.Sy),
  "While 1=1",
  ...menuLines({
    count: 3,
    exit: "item",
    choice: "O",
    flag: "Y",
    sel: "R",
    draw: [
      'Locate 1,1,"PERFILES  IPN  IPB"',
      'Locate 3,2,"VER PERFILES"',
      'Locate 3,3,"BUSCAR REQUISITO"',
      'Locate 3,4,"SALIR"',
    ],
  }),
  "If O=0:Then Stop:IfEnd",
  "0→K:0→M:0→G",
  // the series, then the profile: scrolling (1) or the property and the value needed (2)
  ...menuLines({
    count: 2,
    exit: 1,
    choice: "S",
    flag: "Y",
    sel: "R",
    draw: ['Locate 1,1,"SERIE"', 'Locate 3,2,"IPN"', 'Locate 3,3,"IPB"'],
  }),
  `If S=1:Then 1→L:${IPN_PROFILES.length}→H:IfEnd`,
  `If S=2:Then ${IPN_PROFILES.length + 1}→L:${SEARCH_TABLE.length}→H:IfEnd`,
  "If O=1:Then L→K:IfEnd",
  "If O=2:Then",
  ...menuLines({
    count: 5,
    exit: 1,
    choice: "Q",
    flag: "Y",
    sel: "R",
    draw: [
      'Locate 1,1,"PROPIEDAD A BUSCAR"',
      'Locate 3,2,"SX  (CM³)"',
      'Locate 3,3,"IX  (CM⁴)"',
      'Locate 3,4,"A   (CM²)"',
      'Locate 3,5,"IY  (CM⁴)"',
      'Locate 3,6,"SY  (CM³)"',
    ],
  }),
  "ClrText",
  'Locate 1,1,"BUSCAR"',
  'If S=1:Then Locate 8,1,"IPN":IfEnd',
  'If S=2:Then Locate 8,1,"IPB":IfEnd',
  'If Q=1:Then Locate 1,2,"SX (CM³)":IfEnd',
  'If Q=2:Then Locate 1,2,"IX (CM⁴)":IfEnd',
  'If Q=3:Then Locate 1,2,"A (CM²)":IfEnd',
  'If Q=4:Then Locate 1,2,"IY (CM⁴)":IfEnd',
  'If Q=5:Then Locate 1,2,"SY (CM³)":IfEnd',
  '"VALOR NECESARIO"?→V',
  "For L→I To H",
  "If K=0:Then",
  "List 6[I]→Y",
  "If Q=2:Then List 5[I]→Y:IfEnd",
  "If Q=3:Then List 3[I]→Y:IfEnd",
  "If Q=4:Then List 7[I]→Y:IfEnd",
  "If Q=5:Then List 8[I]→Y:IfEnd",
  "If V≤Y:Then I→K:I→G:Y→Z:IfEnd",
  "IfEnd",
  "Next",
  "If K=0:Then 2→M:IfEnd",
  "IfEnd",
  "If M=2:Then",
  "ClrText",
  'Locate 1,1,"NINGUN PERFIL CUMPLE"',
  ...PAUSE2,
  "IfEnd",
  // the profile, with ▲ ▼ to go to the next smaller / larger one of the series; EXE, EXIT or 0 go back to the menu
  "If K>0:Then",
  "1→J",
  "While J=1",
  "ClrText",
  'If S=1:Then Locate 1,1,"IPN":IfEnd',
  'If S=2:Then Locate 1,1,"IPB":IfEnd',
  'Locate 5,1,List 2[K]:Locate 13,1,"EXIT=MENU"',
  'Locate 1,2,"A":Locate 4,2,List 3[K]:Locate 11,2,"PESO":Locate 16,2,List 4[K]',
  'Locate 1,3,"SX":Locate 4,3,List 6[K]:Locate 11,3,"SY":Locate 16,3,List 8[K]',
  'Locate 1,4,"IX":Locate 4,4,List 5[K]:Locate 11,4,"IY":Locate 16,4,List 7[K]',
  'Locate 1,5,"A CM²  PESO KG/M"',
  'Locate 1,6,"S CM³  I CM⁴"',
  "0→F",
  "If K=G:Then 1→F:IfEnd",
  'If F=1:Then Locate 1,7,"PIDE":Locate 6,7,V:Locate 12,7,"DA":Locate 15,7,Z:IfEnd',
  'If F=0:Then Locate 1,7,"FLECHAS: OTRO PERFIL":IfEnd',
  "While Getkey>0:WhileEnd",
  "0→W",
  "While W=0",
  "Getkey→W",
  "WhileEnd",
  "If W=28:Then",
  "If K>L:Then K–1→K:IfEnd",
  "IfEnd",
  "If W=37:Then",
  "If K<H:Then K+1→K:IfEnd",
  "IfEnd",
  "If W=31:Then 0→J:IfEnd",
  "If W=47:Then 0→J:IfEnd",
  "If W=71:Then 0→J:IfEnd",
  "WhileEnd",
  "IfEnd",
  "WhileEnd",
];
