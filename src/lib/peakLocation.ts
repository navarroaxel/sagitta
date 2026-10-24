// Where the largest |σ| of the model is: in which member, and whether at a node (a support, the
// column–beam joint…) or inside the bar. The second case is the one that needs looking for an interior
// maximum instead of just checking the ends. Pure, derived from the stress check.
import { FrameModel3D } from "./types3d";
import { SolveOutput3D } from "./solve3d";
import { StressResult } from "./stress3d";

export interface PeakLocation {
  member: string; // id of the member with the largest ratio
  profile: string;
  ratio: number; // |σ|max / σ adm
  where:
    | { kind: "node"; node: string; support: "free" | "pinned" | "fixed" }
    | { kind: "inside"; node: string; dist: number } // dist (m) from the nearest node
    | { kind: "constant" }; // σ does not change along the bar
}

const AT_NODE = 1e-3; // m: closer than this to a node counts as being at it

export function peakLocation(
  model: FrameModel3D,
  solved: SolveOutput3D,
  stress: StressResult,
): PeakLocation | null {
  let best = -1,
    bestRatio = -1;
  stress.forEach((s, e) => {
    if (s && s.ratio > bestRatio) {
      bestRatio = s.ratio;
      best = e;
    }
  });
  if (best < 0) return null;
  const m = model.members[best];
  const s = stress[best]!;
  const L = solved.result.geo[best].L;
  const st = solved.stations[best];
  const abs = s.sigma.map(Math.abs);
  const top = Math.max(...abs);
  const peak = abs.indexOf(top);
  const base = { member: m.id, profile: m.profile ?? "", ratio: bestRatio };
  if (top - Math.min(...abs) < 1e-6 * Math.max(top, 1e-12)) return { ...base, where: { kind: "constant" } };

  const x = st[peak].x; // distance from n1
  const toN1 = x,
    toN2 = L - x;
  const node = toN1 <= toN2 ? m.n1 : m.n2;
  const dist = Math.min(toN1, toN2);
  if (dist < AT_NODE) {
    const support = model.nodes.find((n) => n.id === node)?.support ?? "free";
    return { ...base, where: { kind: "node", node, support } };
  }
  return { ...base, where: { kind: "inside", node, dist } };
}
