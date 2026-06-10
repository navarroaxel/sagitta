import type { SolverModel, SolverResult } from "./solver";

export interface Station {
  x: number;
  N: number;
  Q: number;
  M: number;
}

// Internal force sampling along member `e`.
// Returns an array of stations { x, N, Q, M } with x measured from the i-end.
export function sampleMember(
  model: SolverModel,
  res: SolverResult,
  e: number,
  nStations = 64,
): Station[] {
  const g = res.geo[e];
  const L = g.L,
    { c, s } = g;
  const fl = res.memForces[e];
  const Hx1 = fl[0],
    Hy1 = fl[1],
    M1 = fl[2];

  // collect member loads expressed in local coordinates
  let qx = 0,
    qy = 0; // UDL local components
  const pts: { a: number; px: number; py: number }[] = []; // point loads
  model.loads.forEach((load) => {
    if (load.type === "mudl" && load.member === e) {
      qx += load.gx * c + load.gy * s;
      qy += -load.gx * s + load.gy * c;
    } else if (load.type === "mpoint" && load.member === e) {
      pts.push({
        a: load.dist,
        px: load.gx * c + load.gy * s,
        py: -load.gx * s + load.gy * c,
      });
    }
  });

  // station set: uniform grid + a pair straddling every point load (gives the
  // shear jump and the moment kink)
  const xs = new Set<number>();
  for (let k = 0; k <= nStations; k++) xs.add((k / nStations) * L);
  pts.forEach((p) => {
    xs.add(Math.max(0, p.a - 1e-6));
    xs.add(Math.min(L, p.a + 1e-6));
  });
  const sorted = [...xs].sort((a, b) => a - b);

  return sorted.map((x) => {
    let N = -Hx1 - qx * x;
    let Q = Hy1 + qy * x;
    let M = -M1 + x * Hy1 + (qy * x * x) / 2;
    pts.forEach((p) => {
      if (x > p.a) {
        N += -p.px;
        Q += p.py;
        M += p.py * (x - p.a);
      }
    });
    return { x, N, Q, M };
  });
}
