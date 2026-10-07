import { udlSpan, type Solver3DModel, type Solver3DResult } from "./solver3d";
import { courseFrame, inSolverBasis } from "./localFrame";

// Internal forces in the course convention (see localFrame.ts): local triad with z along the
// member. Axial force and shears are the components of the force on the face whose outward
// normal is +z (N > 0 is tension); T is the torque, the component of the moment along z.
// The bending moments follow the tension-side rule: Mx > 0 tensions the +y fibres and
// My > 0 the +x fibres, so the stress is σ = N/A + Mx·y/Ix + My·x/Iy.
export interface Station3D {
  x: number; // distance from node n1 (used to place the station on the member), m
  z: number; // coordinate along the course z axis, m (z = x, or L − x when z points to n1)
  N: number; // axial, + = tension
  Qx: number; // shear along x
  Qy: number; // shear along y
  T: number; // torque (moment about z)
  Mx: number; // bending moment: tension on the +y side when positive
  My: number; // bending moment: tension on the +x side when positive
}

// Internal force sampling along member `e`.
export function sampleMember3D(
  model: Solver3DModel,
  res: Solver3DResult,
  e: number,
  nStations = 64,
): Station3D[] {
  const g = res.geo[e];
  const L = g.L;
  const fl = res.memForces[e];
  const [Fx1, Fy1, Fz1, Mx1, My1, Mz1] = fl; // solver local end forces at i

  // distributed loads over [a, b] (solver-local components per unit length)
  const udls: { a: number; b: number; qx: number; qy: number; qz: number }[] = [];
  const pts: { a: number; px: number; py: number; pz: number }[] = [];
  const loc = (gx: number, gy: number, gz: number): [number, number, number] => [
    gx * g.ex[0] + gy * g.ex[1] + gz * g.ex[2],
    gx * g.ey[0] + gy * g.ey[1] + gz * g.ey[2],
    gx * g.ez[0] + gy * g.ez[1] + gz * g.ez[2],
  ];
  model.loads.forEach((load) => {
    if (load.type === "mudl" && load.member === e) {
      const span = udlSpan(load, L);
      if (!span) return;
      const [qx, qy, qz] = loc(load.gx, load.gy, load.gz);
      udls.push({ ...span, qx, qy, qz });
    } else if (load.type === "mpoint" && load.member === e) {
      const [px, py, pz] = loc(load.gx, load.gy, load.gz);
      pts.push({ a: load.dist, px, py, pz });
    }
  });

  const xs = new Set<number>();
  for (let k = 0; k <= nStations; k++) xs.add((k / nStations) * L);
  udls.forEach((u) => {
    xs.add(u.a);
    xs.add(u.b);
  });
  pts.forEach((p) => {
    xs.add(Math.max(0, p.a - 1e-6));
    xs.add(Math.min(L, p.a + 1e-6));
  });
  const sorted = [...xs].sort((a, b) => a - b);

  // course axes expressed in the solver's local basis
  const f = courseFrame(g);
  const lx = inSolverBasis(g, f.x),
    ly = inSolverBasis(g, f.y),
    lz = inSolverBasis(g, f.z);
  const sgn = f.flip ? -1 : 1;
  const d = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

  return sorted.map((x) => {
    // engineering-convention quantities of the solver frame (shear: sum of the forces to the
    // left; moments: sagging)
    let N = -Fx1;
    let Qy = Fy1;
    let Qz = Fz1;
    let Mz = -Mz1 + x * Fy1;
    let My = My1 + x * Fz1;
    udls.forEach((u) => {
      const len = Math.min(Math.max(x - u.a, 0), u.b - u.a);
      if (len === 0) return;
      const arm = x - (u.a + len / 2);
      N -= u.qx * len;
      Qy += u.qy * len;
      Qz += u.qz * len;
      Mz += u.qy * len * arm;
      My += u.qz * len * arm;
    });
    pts.forEach((p) => {
      if (x > p.a) {
        N += -p.px;
        Qy += p.py;
        Qz += p.pz;
        Mz += p.py * (x - p.a);
        My += p.pz * (x - p.a);
      }
    });
    // resultants on the face with outward normal +x' (solver), as vectors: force (N, −Qy, −Qz),
    // moment (T, −My, Mz); on the opposite face (z pointing to node i) they change sign.
    const force = [N, -Qy, -Qz];
    const moment = [-Mx1, -My, Mz];
    return {
      x,
      z: f.flip ? L - x : x,
      N: sgn * d(force, lz),
      Qx: sgn * d(force, lx),
      Qy: sgn * d(force, ly),
      T: sgn * d(moment, lz),
      // moment-vector components on the +z face, turned into "tension on the +side" moments:
      // in this left-handed triad that is −component for x and +component for y
      Mx: -sgn * d(moment, lx),
      My: sgn * d(moment, ly),
    };
  });
}
