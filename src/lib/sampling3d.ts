import type { Solver3DModel, Solver3DResult } from "./solver3d";

export interface Station3D {
  x: number;
  N: number; // axial, + = tension
  Qy: number; // shear along local y' (same convention as the 2D Q)
  Qz: number; // shear along local z'
  T: number; // torque, + = vector along +x' on the face whose outward normal is +x'
  My: number; // moment about y', + = sagging in the x'-z' plane (tension on the -z' side)
  Mz: number; // moment about z', + = sagging in the x'-y' plane (tension on the -y' side)
}

// Internal force sampling along member `e`: stations with x measured from the i-end.
// Mirrors `sampleMember` (2D): Qy/Mz are the 2D Q/M of the x'-y' plane; Qz/My are the same
// quantities for the x'-z' plane.
export function sampleMember3D(
  model: Solver3DModel,
  res: Solver3DResult,
  e: number,
  nStations = 64,
): Station3D[] {
  const g = res.geo[e];
  const L = g.L;
  const fl = res.memForces[e];
  const [Fx1, Fy1, Fz1, Mx1, My1, Mz1] = fl;

  let qx = 0,
    qy = 0,
    qz = 0;
  const pts: { a: number; px: number; py: number; pz: number }[] = [];
  const loc = (gx: number, gy: number, gz: number): [number, number, number] => [
    gx * g.ex[0] + gy * g.ex[1] + gz * g.ex[2],
    gx * g.ey[0] + gy * g.ey[1] + gz * g.ey[2],
    gx * g.ez[0] + gy * g.ez[1] + gz * g.ez[2],
  ];
  model.loads.forEach((load) => {
    if (load.type === "mudl" && load.member === e) {
      const [x, y, z] = loc(load.gx, load.gy, load.gz);
      qx += x;
      qy += y;
      qz += z;
    } else if (load.type === "mpoint" && load.member === e) {
      const [px, py, pz] = loc(load.gx, load.gy, load.gz);
      pts.push({ a: load.dist, px, py, pz });
    }
  });

  const xs = new Set<number>();
  for (let k = 0; k <= nStations; k++) xs.add((k / nStations) * L);
  pts.forEach((p) => {
    xs.add(Math.max(0, p.a - 1e-6));
    xs.add(Math.min(L, p.a + 1e-6));
  });
  const sorted = [...xs].sort((a, b) => a - b);

  return sorted.map((x) => {
    let N = -Fx1 - qx * x;
    let Qy = Fy1 + qy * x;
    let Qz = Fz1 + qz * x;
    let Mz = -Mz1 + x * Fy1 + (qy * x * x) / 2;
    let My = My1 + x * Fz1 + (qz * x * x) / 2;
    pts.forEach((p) => {
      if (x > p.a) {
        N += -p.px;
        Qy += p.py;
        Qz += p.pz;
        Mz += p.py * (x - p.a);
        My += p.pz * (x - p.a);
      }
    });
    return { x, N, Qy, Qz, T: -Mx1, My, Mz };
  });
}
