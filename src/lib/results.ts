// Pure derived-results helpers used by the Results panel.
// Kept free of React so the math can be unit-tested in isolation.
import { FrameModel } from "./types";
import { SolveOutput } from "./solve";
import { Station } from "./sampling";

export const TOL = 1e-2; // below this a force/moment value is treated as zero
export const EQ_TOL = 1e-3; // equilibrium residual tolerance for the ✓/✗ flag

// Station maximising |key| along a member (signed value preserved). Returns
// null for an empty station array.
export function peak(stations: Station[], key: "Q" | "M"): Station | null {
  if (!stations.length) return null;
  return stations.reduce((best, s) =>
    Math.abs(s[key]) > Math.abs(best[key]) ? s : best,
  );
}

// Snap near-zero numeric noise to exactly 0 for display.
export function clean(v: number): number {
  return Math.abs(v) < TOL ? 0 : v;
}

export interface Equilibrium {
  fx: number; // ΣFx of applied loads + reactions (should be ≈ 0)
  fy: number; // ΣFy
  m: number; // ΣM about the global origin
}

// Global equilibrium residual: sum of every applied load and every support
// reaction. For a self-consistent solver result all three components are ≈ 0.
export function equilibrium(model: FrameModel, solved: SolveOutput): Equilibrium {
  const { result, nodeIndex, memberIndex } = solved;
  const nodeById = new Map(model.nodes.map((n) => [n.id, n]));
  let fx = 0;
  let fy = 0;
  let m = 0;
  // moment of a force (Fx,Fy) at (px,py) plus a concentrated moment, about origin
  const add = (px: number, py: number, ax: number, ay: number, am = 0) => {
    fx += ax;
    fy += ay;
    m += px * ay - py * ax + am;
  };

  for (const load of model.loads) {
    if (load.type === "nodal") {
      const n = nodeById.get(load.node);
      if (n) add(n.x, n.y, load.fx, load.fy, load.m);
    } else {
      const e = memberIndex.get(load.member);
      if (e === undefined) continue;
      const mem = model.members[e]; // memberIndex maps id → index in model.members
      const ni = nodeById.get(mem.n1);
      if (!ni) continue;
      const { L, c, s } = result.geo[e];
      if (load.type === "mpoint") {
        add(ni.x + load.dist * c, ni.y + load.dist * s, load.gx, load.gy);
      } else {
        // mudl: total resultant gx·L, gy·L acting at the member midpoint
        add(ni.x + (L / 2) * c, ni.y + (L / 2) * s, load.gx * L, load.gy * L);
      }
    }
  }

  for (const n of model.nodes) {
    if (n.support === "free") continue;
    const r = result.reactions[nodeIndex.get(n.id)!];
    add(n.x, n.y, r.rx, r.ry, r.rm);
  }

  return { fx, fy, m };
}
