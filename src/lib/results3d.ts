// Derived results for the 3D view (pure, unit-testable).
import { FrameModel3D } from "./types3d";
import { SolveOutput3D } from "./solve3d";
import { Station3D } from "./sampling3d";
import { udlSpan } from "./solver3d";

export type Diagram3D = "N" | "Qy" | "Qz" | "T" | "My" | "Mz";
export const DIAGRAMS_3D: Diagram3D[] = ["N", "Qy", "Qz", "T", "My", "Mz"];

export function peak3D(stations: Station3D[], key: Diagram3D): Station3D | null {
  if (!stations.length) return null;
  return stations.reduce((best, s) =>
    Math.abs(s[key]) > Math.abs(best[key]) ? s : best,
  );
}

export interface Equilibrium3D {
  f: [number, number, number];
  m: [number, number, number]; // about the global origin
}

// Sum of every applied load and every support reaction; ≈ 0 for a correct solution.
export function equilibrium3D(
  model: FrameModel3D,
  solved: SolveOutput3D,
): Equilibrium3D {
  const { result, nodeIndex, memberIndex } = solved;
  const nodeById = new Map(model.nodes.map((n) => [n.id, n]));
  const f: [number, number, number] = [0, 0, 0];
  const m: [number, number, number] = [0, 0, 0];
  const add = (
    p: [number, number, number],
    a: [number, number, number],
    mom: [number, number, number] = [0, 0, 0],
  ) => {
    f[0] += a[0];
    f[1] += a[1];
    f[2] += a[2];
    m[0] += mom[0] + p[1] * a[2] - p[2] * a[1];
    m[1] += mom[1] + p[2] * a[0] - p[0] * a[2];
    m[2] += mom[2] + p[0] * a[1] - p[1] * a[0];
  };

  for (const load of model.loads) {
    if (load.type === "nodal") {
      const n = nodeById.get(load.node);
      if (n) add([n.x, n.y, n.z], [load.fx, load.fy, load.fz], [load.mx, load.my, load.mz]);
      continue;
    }
    const e = memberIndex.get(load.member);
    if (e === undefined) continue;
    const mem = model.members[e];
    const a = nodeById.get(mem.n1)!;
    const { L, ex } = result.geo[e];
    const at = (s: number): [number, number, number] => [
      a.x + s * ex[0],
      a.y + s * ex[1],
      a.z + s * ex[2],
    ];
    if (load.type === "mpoint") add(at(load.dist), [load.gx, load.gy, load.gz]);
    else {
      const span = udlSpan(load, L);
      if (!span) continue;
      const len = span.b - span.a;
      add(at((span.a + span.b) / 2), [load.gx * len, load.gy * len, load.gz * len]);
    }
  }

  for (const n of model.nodes) {
    if (n.support === "free") continue;
    const r = result.reactions[nodeIndex.get(n.id)!];
    add([n.x, n.y, n.z], [r.fx, r.fy, r.fz], [r.mx, r.my, r.mz]);
  }
  return { f, m };
}
