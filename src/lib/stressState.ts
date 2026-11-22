// Stress state at a point (course exercise "Estado de tensión"): tensor, invariants, stress vector on a plane,
// principal stresses and directions. Any consistent units (MPa in the exercise).

export type Tensor = [[number, number, number], [number, number, number], [number, number, number]];
export type Vec3 = [number, number, number];

/** Symmetric tensor from its six independent components. */
export function tensor(sx: number, sy: number, sz: number, txy: number, tyz: number, txz: number): Tensor {
  return [
    [sx, txy, txz],
    [txy, sy, tyz],
    [txz, tyz, sz],
  ];
}

export function invariants(T: Tensor) {
  const [[sx, txy, txz], [, sy, tyz], [, , sz]] = T;
  const I1 = sx + sy + sz;
  const I2 = sx * sy - txy ** 2 + (sy * sz - tyz ** 2) + (sx * sz - txz ** 2);
  const I3 = sx * sy * sz + 2 * txy * tyz * txz - (sx * tyz ** 2 + sy * txz ** 2 + sz * txy ** 2);
  return { I1, I2, I3 };
}

export type StressKind = "triple" | "double" | "simple" | "null";

/** Triple (spatial) if I3 ≠ 0; double (plane) if I3 = 0 and I2 ≠ 0; simple (uniaxial) if only I1 ≠ 0; null otherwise. */
export function classify(T: Tensor, eps = 1e-9): StressKind {
  const scale = Math.max(1, ...T.flat().map(Math.abs));
  const { I1, I2, I3 } = invariants(T);
  if (Math.abs(I3) > eps * scale ** 3) return "triple";
  if (Math.abs(I2) > eps * scale ** 2) return "double";
  if (Math.abs(I1) > eps * scale) return "simple";
  return "null";
}

const dot = (u: Vec3, v: Vec3) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
const norm = (u: Vec3) => Math.hypot(u[0], u[1], u[2]);
const cross = (u: Vec3, v: Vec3): Vec3 => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];

/**
 * Stress vector ρ = T·n on the plane of normal n (n is normalised first), its normal component σ = (ρ·n)·n and its
 * tangential component τ = ρ − σ, with the magnitudes.
 */
export function stressOnPlane(T: Tensor, nIn: Vec3) {
  const L = norm(nIn);
  const n: Vec3 = [nIn[0] / L, nIn[1] / L, nIn[2] / L];
  const rho = T.map((row) => dot(row as Vec3, n)) as Vec3;
  const s = dot(rho, n);
  const sigma: Vec3 = [s * n[0], s * n[1], s * n[2]];
  const tau: Vec3 = [rho[0] - sigma[0], rho[1] - sigma[1], rho[2] - sigma[2]];
  return { n, rho, sigma, tau, rhoMag: norm(rho), sigmaN: s, tauMag: norm(tau) };
}

/** Principal stresses σ1 ≥ σ2 ≥ σ3: roots of σ³ − I1·σ² + I2·σ − I3 = 0 (trigonometric solution, all real). */
export function principalStresses(T: Tensor): [number, number, number] {
  const { I1, I2, I3 } = invariants(T);
  const a = -I1;
  const p = I2 - (a * a) / 3;
  const q = (2 * a ** 3) / 27 - (a * I2) / 3 - I3;
  if (Math.abs(p) < 1e-14) {
    const r = Math.cbrt(-q);
    return [r - a / 3, r - a / 3, r - a / 3];
  }
  const m = 2 * Math.sqrt(-p / 3);
  const arg = Math.max(-1, Math.min(1, ((3 * q) / (p * m))));
  const th = Math.acos(arg) / 3;
  const roots = [0, 1, 2].map((k) => m * Math.cos(th - (2 * Math.PI * k) / 3) - a / 3).sort((x, y) => y - x);
  return roots as [number, number, number];
}

/**
 * Unit vector of the principal direction for σ: solves (T − σI)·n = 0 as the course does, by fixing one unknown and
 * solving the rest (here: the cross product of two independent rows). The sign of n is arbitrary. Returns null if the
 * eigenvalue is repeated (every direction of the eigenspace is principal).
 */
export function principalDirection(T: Tensor, s: number): Vec3 | null {
  const A = T.map((row, i) => row.map((v, j) => v - (i === j ? s : 0))) as Tensor;
  let best: Vec3 = [0, 0, 0];
  let bestN = 0;
  for (const [i, j] of [[0, 1], [0, 2], [1, 2]]) {
    const c = cross(A[i] as Vec3, A[j] as Vec3);
    const n = norm(c);
    if (n > bestN) {
      bestN = n;
      best = c;
    }
  }
  const scale = Math.max(1, ...T.flat().map(Math.abs));
  if (bestN < 1e-9 * scale * scale) return null;
  return [best[0] / bestN, best[1] / bestN, best[2] / bestN];
}
