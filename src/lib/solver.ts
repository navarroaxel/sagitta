// 2D frame solver: direct stiffness method.
// nodes:   [{x, y, support}]      support in free|pinned|fixed|roller-v|roller-h
// members: [{i, j, E, A, I, relI, relJ}]   relI/relJ = moment release at that end
// loads:   {type:'nodal',  node, fx, fy, m}
//          {type:'mpoint', member, dist, gx, gy}   global components, dist along member
//          {type:'mudl',   member, gx, gy}         global components, full span

export interface SolverNode {
  x: number;
  y: number;
  support: string;
}

export interface SolverMember {
  i: number;
  j: number;
  E: number;
  A: number;
  I: number;
  relI?: boolean;
  relJ?: boolean;
}

export type SolverLoad =
  | { type: "nodal"; node: number; fx?: number; fy?: number; m?: number }
  | { type: "mpoint"; member: number; dist: number; gx: number; gy: number }
  | { type: "mudl"; member: number; gx: number; gy: number };

export interface SolverModel {
  nodes: SolverNode[];
  members: SolverMember[];
  loads: SolverLoad[];
}

export interface SolverGeo {
  L: number;
  c: number;
  s: number;
}

export interface SolverResult {
  stable: boolean;
  U: number[];
  reactions: { rx: number; ry: number; rm: number }[];
  memForces: number[][];
  geo: SolverGeo[];
  memFEF: number[][];
  memDof: number[][];
  nDof: number;
}

export function solveFrame(model: SolverModel): SolverResult {
  const { nodes, members, loads } = model;
  const N = nodes.length;

  // DOF map: 3 per node (ux, uy, theta). Released member ends get extra DOFs.
  let nDof = 3 * N;
  const memDof = members.map((m) => {
    const di = [3 * m.i, 3 * m.i + 1, 0, 3 * m.j, 3 * m.j + 1, 0];
    di[2] = m.relI ? nDof++ : 3 * m.i + 2;
    di[5] = m.relJ ? nDof++ : 3 * m.j + 2;
    return di;
  });

  const geo = members.map((m) => {
    const a = nodes[m.i],
      b = nodes[m.j];
    const dx = b.x - a.x,
      dy = b.y - a.y;
    const L = Math.hypot(dx, dy);
    return { L, c: dx / L, s: dy / L };
  });

  function localK(m: SolverMember, g: SolverGeo): number[][] {
    const { E, A, I } = m,
      L = g.L;
    const ax = (E * A) / L;
    const b = (12 * E * I) / L ** 3;
    const c2 = (6 * E * I) / L ** 2;
    const d = (4 * E * I) / L;
    const e = (2 * E * I) / L;
    return [
      [ax, 0, 0, -ax, 0, 0],
      [0, b, c2, 0, -b, c2],
      [0, c2, d, 0, -c2, e],
      [-ax, 0, 0, ax, 0, 0],
      [0, -b, -c2, 0, b, -c2],
      [0, c2, e, 0, -c2, d],
    ];
  }
  // T transforms global -> local
  function transT(g: SolverGeo): number[][] {
    const { c, s } = g;
    return [
      [c, s, 0, 0, 0, 0],
      [-s, c, 0, 0, 0, 0],
      [0, 0, 1, 0, 0, 0],
      [0, 0, 0, c, s, 0],
      [0, 0, 0, -s, c, 0],
      [0, 0, 0, 0, 0, 1],
    ];
  }
  const matMul = (A: number[][], B: number[][]): number[][] => {
    const r = A.length,
      c = B[0].length,
      k = B.length;
    const out = Array.from({ length: r }, () => Array(c).fill(0));
    for (let i = 0; i < r; i++)
      for (let j = 0; j < c; j++) {
        let s = 0;
        for (let x = 0; x < k; x++) s += A[i][x] * B[x][j];
        out[i][j] = s;
      }
    return out;
  };
  const transpose = (A: number[][]): number[][] =>
    A[0].map((_, j) => A.map((row) => row[j]));
  const matVec = (A: number[][], v: number[]): number[] =>
    A.map((row) => row.reduce((s, a, i) => s + a * v[i], 0));

  // fixed-end forces (local) for member loads -> [Hx1,Hy1,M1,Hx2,Hy2,M2]
  function fefLocal(load: SolverLoad, m: SolverMember, g: SolverGeo): number[] {
    const L = g.L,
      { c, s } = g;
    const fef = [0, 0, 0, 0, 0, 0];
    if (load.type === "mudl") {
      const qx = load.gx * c + load.gy * s; // axial
      const qy = -load.gx * s + load.gy * c; // transverse
      fef[0] += (-qx * L) / 2;
      fef[3] += (-qx * L) / 2;
      fef[1] += (-qy * L) / 2;
      fef[4] += (-qy * L) / 2;
      fef[2] += (-qy * L * L) / 12;
      fef[5] += (qy * L * L) / 12;
    } else if (load.type === "mpoint") {
      const px = load.gx * c + load.gy * s;
      const py = -load.gx * s + load.gy * c;
      const a = load.dist,
        bb = L - a;
      fef[0] += (-px * bb) / L;
      fef[3] += (-px * a) / L;
      fef[1] += (-py * bb * bb * (L + 2 * a)) / L ** 3;
      fef[4] += (-py * a * a * (L + 2 * bb)) / L ** 3;
      fef[2] += (-py * a * bb * bb) / L ** 2;
      fef[5] += (py * a * a * bb) / L ** 2;
    }
    return fef;
  }

  // assemble
  const K = Array.from({ length: nDof }, () => Array(nDof).fill(0));
  const F = Array(nDof).fill(0);
  const memFEF = members.map(() => [0, 0, 0, 0, 0, 0]);

  members.forEach((m, e) => {
    const g = geo[e],
      T = transT(g);
    const kl = localK(m, g);
    const Kg = matMul(matMul(transpose(T), kl), T);
    const dof = memDof[e];
    for (let a = 0; a < 6; a++)
      for (let b = 0; b < 6; b++) K[dof[a]][dof[b]] += Kg[a][b];
  });

  loads.forEach((load) => {
    if (load.type === "nodal") {
      F[3 * load.node] += load.fx || 0;
      F[3 * load.node + 1] += load.fy || 0;
      F[3 * load.node + 2] += load.m || 0;
    } else {
      const e = load.member,
        g = geo[e],
        T = transT(g);
      const fef = fefLocal(load, members[e], g);
      for (let k = 0; k < 6; k++) memFEF[e][k] += fef[k];
      const eqv = matVec(transpose(T), fef); // equivalent nodal load = -T^T fef
      const dof = memDof[e];
      for (let k = 0; k < 6; k++) F[dof[k]] -= eqv[k];
    }
  });

  // boundary conditions
  const fixed = new Array(nDof).fill(false);
  nodes.forEach((nd, i) => {
    const sp = nd.support;
    if (sp === "pinned") {
      fixed[3 * i] = true;
      fixed[3 * i + 1] = true;
    } else if (sp === "fixed") {
      fixed[3 * i] = fixed[3 * i + 1] = fixed[3 * i + 2] = true;
    } else if (sp === "roller-v") {
      fixed[3 * i + 1] = true;
    } else if (sp === "roller-h") {
      fixed[3 * i] = true;
    }
  });
  // safety: any free DOF with zero diagonal (disconnected) -> fix it
  for (let d = 0; d < nDof; d++)
    if (!fixed[d] && Math.abs(K[d][d]) < 1e-12) fixed[d] = true;

  const freeDofs: number[] = [];
  for (let d = 0; d < nDof; d++) if (!fixed[d]) freeDofs.push(d);

  // solve K_ff u = F_f  (Gaussian elimination with partial pivoting)
  const nf = freeDofs.length;
  const Kff = freeDofs.map((r) => freeDofs.map((c) => K[r][c]));
  const Ff = freeDofs.map((r) => F[r]);
  const aug = Kff.map((row, i) => [...row, Ff[i]]);
  let stable = true;
  for (let col = 0; col < nf; col++) {
    let piv = col;
    for (let r = col + 1; r < nf; r++)
      if (Math.abs(aug[r][col]) > Math.abs(aug[piv][col])) piv = r;
    if (Math.abs(aug[piv][col]) < 1e-9) {
      stable = false;
      break;
    }
    [aug[col], aug[piv]] = [aug[piv], aug[col]];
    for (let r = col + 1; r < nf; r++) {
      const f = aug[r][col] / aug[col][col];
      for (let k = col; k <= nf; k++) aug[r][k] -= f * aug[col][k];
    }
  }
  const uf = Array(nf).fill(0);
  if (stable) {
    for (let r = nf - 1; r >= 0; r--) {
      let s = aug[r][nf];
      for (let k = r + 1; k < nf; k++) s -= aug[r][k] * uf[k];
      uf[r] = s / aug[r][r];
    }
  }
  const U = Array(nDof).fill(0);
  freeDofs.forEach((d, i) => (U[d] = uf[i]));

  // reactions
  const KU = matVec(K, U);
  const reactions = nodes.map((nd, i) => {
    const r = { rx: 0, ry: 0, rm: 0 };
    if (fixed[3 * i]) r.rx = KU[3 * i] - F[3 * i];
    if (fixed[3 * i + 1]) r.ry = KU[3 * i + 1] - F[3 * i + 1];
    if (fixed[3 * i + 2]) r.rm = KU[3 * i + 2] - F[3 * i + 2];
    return r;
  });

  // member end forces (local): [Hx1,Hy1,M1,Hx2,Hy2,M2]
  const memForces = members.map((m, e) => {
    const g = geo[e],
      T = transT(g);
    const dof = memDof[e];
    const ug = dof.map((d) => U[d]);
    const ul = matVec(T, ug);
    const fl = matVec(localK(m, g), ul);
    for (let k = 0; k < 6; k++) fl[k] += memFEF[e][k];
    return fl;
  });

  return { stable, U, reactions, memForces, geo, memFEF, memDof, nDof };
}
