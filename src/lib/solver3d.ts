// 3D frame solver: direct stiffness method, 6 DOF per node (ux, uy, uz, rx, ry, rz).
// Independent of the 2D solver (solver.ts) — it does not share or modify its code.
//
// nodes:   [{x, y, z, support}]    support in free|pinned|fixed (or a custom `restraint`)
// members: [{i, j, E, G, A, Iy, Iz, J, ref?}]   prismatic, rigid end connections
// loads:   {type:'nodal',  node, fx, fy, fz, mx, my, mz}   global components
//          {type:'mpoint', member, dist, gx, gy, gz}        global force, dist along member
//          {type:'mudl',   member, gx, gy, gz}              global force/length, full span
//
// Local member axes: x' runs i -> j. z' is the component of `ref` perpendicular to x'
// (default ref = global Z, or ∓X for a member parallel to Z, up/down); y' = z' × x'.
// Iy is the second moment about y' (bending in the x'-z' plane), Iz about z'.
//
// Not supported (yet): member end releases (hinges), member-internal torques/moments,
// inclined supports, member self-weight.

export type Vec3 = [number, number, number];

// restraint order: [ux, uy, uz, rx, ry, rz]; true = restrained
export type Restraint = [boolean, boolean, boolean, boolean, boolean, boolean];

export interface Solver3DNode {
  x: number;
  y: number;
  z: number;
  support: "free" | "pinned" | "fixed";
  restraint?: Restraint;
}

export interface Solver3DMember {
  i: number;
  j: number;
  E: number;
  G: number;
  A: number;
  Iy: number;
  Iz: number;
  J: number;
  ref?: Vec3;
}

export type Solver3DLoad =
  | {
      type: "nodal";
      node: number;
      fx?: number;
      fy?: number;
      fz?: number;
      mx?: number;
      my?: number;
      mz?: number;
    }
  | {
      type: "mpoint";
      member: number;
      dist: number;
      gx: number;
      gy: number;
      gz: number;
    }
  | { type: "mudl"; member: number; gx: number; gy: number; gz: number };

export interface Solver3DModel {
  nodes: Solver3DNode[];
  members: Solver3DMember[];
  loads: Solver3DLoad[];
}

export interface Solver3DGeo {
  L: number;
  ex: Vec3;
  ey: Vec3;
  ez: Vec3;
}

export interface Reaction3D {
  fx: number;
  fy: number;
  fz: number;
  mx: number;
  my: number;
  mz: number;
}

export interface Solver3DResult {
  stable: boolean;
  U: number[];
  reactions: Reaction3D[];
  // local end forces on the member: [Fx,Fy,Fz,Mx,My,Mz] at i, then the same at j
  memForces: number[][];
  geo: Solver3DGeo[];
  memFEF: number[][];
  nDof: number;
}

const dot = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const norm = (a: Vec3): number => Math.hypot(a[0], a[1], a[2]);
const unit = (a: Vec3): Vec3 => {
  const n = norm(a);
  return [a[0] / n, a[1] / n, a[2] / n];
};

export function memberGeo(
  a: Solver3DNode,
  b: Solver3DNode,
  ref?: Vec3,
): Solver3DGeo {
  const d: Vec3 = [b.x - a.x, b.y - a.y, b.z - a.z];
  const L = norm(d);
  if (L < 1e-12) throw new Error("zero-length member");
  const ex = unit(d);
  // Vertical members: -X (upward) / +X (downward) keeps z' continuous with the inclined case
  // and gives the same local frame as the 2D solver (y' = x' rotated +90° in the x-z plane).
  let r: Vec3 =
    ref ??
    (Math.abs(ex[2]) > 1 - 1e-9 ? [ex[2] > 0 ? -1 : 1, 0, 0] : [0, 0, 1]);
  const k = dot(r, ex);
  r = [r[0] - k * ex[0], r[1] - k * ex[1], r[2] - k * ex[2]];
  if (norm(r) < 1e-9) throw new Error("member reference vector is parallel to the member");
  const ez = unit(r);
  const ey = cross(ez, ex);
  return { L, ex, ey, ez };
}

const zeros = (n: number): number[] => new Array(n).fill(0);
const zeros2 = (r: number, c: number): number[][] =>
  Array.from({ length: r }, () => zeros(c));

const matMul = (A: number[][], B: number[][]): number[][] => {
  const r = A.length,
    c = B[0].length,
    k = B.length;
  const out = zeros2(r, c);
  for (let i = 0; i < r; i++)
    for (let x = 0; x < k; x++) {
      const a = A[i][x];
      if (a === 0) continue;
      for (let j = 0; j < c; j++) out[i][j] += a * B[x][j];
    }
  return out;
};
const transpose = (A: number[][]): number[][] =>
  A[0].map((_, j) => A.map((row) => row[j]));
const matVec = (A: number[][], v: number[]): number[] =>
  A.map((row) => row.reduce((s, a, i) => s + a * v[i], 0));

// 12x12 local stiffness matrix of a prismatic 3D beam (Euler-Bernoulli)
export function localK3D(m: Solver3DMember, L: number): number[][] {
  const { E, G, A, Iy, Iz, J } = m;
  const k = zeros2(12, 12);
  const set = (r: number, c: number, v: number) => {
    k[r][c] = v;
    k[c][r] = v;
  };
  // axial
  const ea = (E * A) / L;
  set(0, 0, ea);
  set(6, 6, ea);
  set(0, 6, -ea);
  // torsion
  const gj = (G * J) / L;
  set(3, 3, gj);
  set(9, 9, gj);
  set(3, 9, -gj);
  // bending in x'-y' (v, rz)
  const a1 = (12 * E * Iz) / L ** 3,
    a2 = (6 * E * Iz) / L ** 2,
    a3 = (4 * E * Iz) / L,
    a4 = (2 * E * Iz) / L;
  set(1, 1, a1);
  set(7, 7, a1);
  set(1, 7, -a1);
  set(1, 5, a2);
  set(1, 11, a2);
  set(5, 7, -a2);
  set(7, 11, -a2);
  set(5, 5, a3);
  set(11, 11, a3);
  set(5, 11, a4);
  // bending in x'-z' (w, ry): rotation about y' is -dw/dx, hence the sign flips
  const b1 = (12 * E * Iy) / L ** 3,
    b2 = (6 * E * Iy) / L ** 2,
    b3 = (4 * E * Iy) / L,
    b4 = (2 * E * Iy) / L;
  set(2, 2, b1);
  set(8, 8, b1);
  set(2, 8, -b1);
  set(2, 4, -b2);
  set(2, 10, -b2);
  set(4, 8, b2);
  set(8, 10, b2);
  set(4, 4, b3);
  set(10, 10, b3);
  set(4, 10, b4);
  return k;
}

// global -> local transform for the 12 member DOFs
function transT(g: Solver3DGeo): number[][] {
  const T = zeros2(12, 12);
  const rows = [g.ex, g.ey, g.ez];
  for (let blk = 0; blk < 4; blk++)
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++) T[3 * blk + r][3 * blk + c] = rows[r][c];
  return T;
}

// local components of a global vector
const toLocal = (g: Solver3DGeo, v: Vec3): Vec3 => [
  dot(v, g.ex),
  dot(v, g.ey),
  dot(v, g.ez),
];

// Fixed-end forces (local, reactions of the clamped ends on the member) for the member loads.
// Same sign convention as the 2D solver's `fefLocal`.
function fefLocal(load: Solver3DLoad, g: Solver3DGeo): number[] {
  const L = g.L;
  const fef = zeros(12);
  if (load.type === "mudl") {
    const [qx, qy, qz] = toLocal(g, [load.gx, load.gy, load.gz]);
    fef[0] = fef[6] = (-qx * L) / 2;
    fef[1] = fef[7] = (-qy * L) / 2;
    fef[5] = (-qy * L * L) / 12;
    fef[11] = (qy * L * L) / 12;
    fef[2] = fef[8] = (-qz * L) / 2;
    fef[4] = (qz * L * L) / 12;
    fef[10] = (-qz * L * L) / 12;
  } else if (load.type === "mpoint") {
    const [px, py, pz] = toLocal(g, [load.gx, load.gy, load.gz]);
    const a = load.dist,
      b = L - a;
    fef[0] = (-px * b) / L;
    fef[6] = (-px * a) / L;
    fef[1] = (-py * b * b * (L + 2 * a)) / L ** 3;
    fef[7] = (-py * a * a * (L + 2 * b)) / L ** 3;
    fef[5] = (-py * a * b * b) / L ** 2;
    fef[11] = (py * a * a * b) / L ** 2;
    fef[2] = (-pz * b * b * (L + 2 * a)) / L ** 3;
    fef[8] = (-pz * a * a * (L + 2 * b)) / L ** 3;
    fef[4] = (pz * a * b * b) / L ** 2;
    fef[10] = (-pz * a * a * b) / L ** 2;
  }
  return fef;
}

const SUPPORT_RESTRAINT: Record<Solver3DNode["support"], Restraint> = {
  free: [false, false, false, false, false, false],
  pinned: [true, true, true, false, false, false],
  fixed: [true, true, true, true, true, true],
};

export function solveFrame3D(model: Solver3DModel): Solver3DResult {
  const { nodes, members, loads } = model;
  const nDof = 6 * nodes.length;
  const memDof = members.map((m) => [
    ...Array.from({ length: 6 }, (_, k) => 6 * m.i + k),
    ...Array.from({ length: 6 }, (_, k) => 6 * m.j + k),
  ]);
  const geo = members.map((m) => memberGeo(nodes[m.i], nodes[m.j], m.ref));

  const K = zeros2(nDof, nDof);
  const F = zeros(nDof);
  const memFEF = members.map(() => zeros(12));

  members.forEach((m, e) => {
    const T = transT(geo[e]);
    const Kg = matMul(matMul(transpose(T), localK3D(m, geo[e].L)), T);
    const dof = memDof[e];
    for (let a = 0; a < 12; a++)
      for (let b = 0; b < 12; b++) K[dof[a]][dof[b]] += Kg[a][b];
  });

  loads.forEach((load) => {
    if (load.type === "nodal") {
      const base = 6 * load.node;
      F[base] += load.fx || 0;
      F[base + 1] += load.fy || 0;
      F[base + 2] += load.fz || 0;
      F[base + 3] += load.mx || 0;
      F[base + 4] += load.my || 0;
      F[base + 5] += load.mz || 0;
    } else {
      const e = load.member;
      const fef = fefLocal(load, geo[e]);
      for (let k = 0; k < 12; k++) memFEF[e][k] += fef[k];
      const eqv = matVec(transpose(transT(geo[e])), fef);
      const dof = memDof[e];
      for (let k = 0; k < 12; k++) F[dof[k]] -= eqv[k];
    }
  });

  // boundary conditions
  const fixed = new Array<boolean>(nDof).fill(false);
  nodes.forEach((nd, i) => {
    const r = nd.restraint ?? SUPPORT_RESTRAINT[nd.support];
    r.forEach((on, k) => {
      if (on) fixed[6 * i + k] = true;
    });
  });
  // safety: a free DOF with zero diagonal (disconnected node) is fixed, as in the 2D solver
  let maxDiag = 0;
  for (let d = 0; d < nDof; d++) maxDiag = Math.max(maxDiag, K[d][d]);
  for (let d = 0; d < nDof; d++)
    if (!fixed[d] && Math.abs(K[d][d]) < 1e-12 * Math.max(maxDiag, 1))
      fixed[d] = true;

  const freeDofs: number[] = [];
  for (let d = 0; d < nDof; d++) if (!fixed[d]) freeDofs.push(d);

  // K_ff u = F_f by Gaussian elimination with partial pivoting
  const nf = freeDofs.length;
  const aug = freeDofs.map((r) => [...freeDofs.map((c) => K[r][c]), F[r]]);
  const tol = 1e-11 * Math.max(maxDiag, 1);
  let stable = true;
  for (let col = 0; col < nf; col++) {
    let piv = col;
    for (let r = col + 1; r < nf; r++)
      if (Math.abs(aug[r][col]) > Math.abs(aug[piv][col])) piv = r;
    if (Math.abs(aug[piv][col]) < tol) {
      stable = false;
      break;
    }
    [aug[col], aug[piv]] = [aug[piv], aug[col]];
    for (let r = col + 1; r < nf; r++) {
      const f = aug[r][col] / aug[col][col];
      if (f === 0) continue;
      for (let k = col; k <= nf; k++) aug[r][k] -= f * aug[col][k];
    }
  }
  const uf = zeros(nf);
  if (stable) {
    for (let r = nf - 1; r >= 0; r--) {
      let s = aug[r][nf];
      for (let k = r + 1; k < nf; k++) s -= aug[r][k] * uf[k];
      uf[r] = s / aug[r][r];
    }
  }
  const U = zeros(nDof);
  freeDofs.forEach((d, i) => (U[d] = uf[i]));

  // reactions = K U - F at restrained DOFs
  const KU = matVec(K, U);
  const reactions: Reaction3D[] = nodes.map((_, i) => {
    const v = [0, 0, 0, 0, 0, 0].map((_, k) =>
      fixed[6 * i + k] ? KU[6 * i + k] - F[6 * i + k] : 0,
    );
    return { fx: v[0], fy: v[1], fz: v[2], mx: v[3], my: v[4], mz: v[5] };
  });

  // member end forces (local)
  const memForces = members.map((m, e) => {
    const ul = matVec(transT(geo[e]), memDof[e].map((d) => U[d]));
    const fl = matVec(localK3D(m, geo[e].L), ul);
    for (let k = 0; k < 12; k++) fl[k] += memFEF[e][k];
    return fl;
  });

  return { stable, U, reactions, memForces, geo, memFEF, nDof };
}
