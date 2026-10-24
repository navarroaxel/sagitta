// Only the loads of the free body count: the internal forces of a cut are the ones on the face
// with outward normal +z (see sampling3d.ts), which balance the part of the member with z smaller
// than the cut (z = 0 is its end). A reaction or a distributed load that lies on the other side
// of the cut is not drawn. Expressed in the course triad of the section cut (x right, y up,
// z into the page) so they can be drawn over the profile, rotated or not. Pure, presentation only.
import { FrameModel3D } from "./types3d";
import { SolveOutput3D } from "./solve3d";
import { courseFrame } from "./localFrame";
import { udlSpan, type Vec3 } from "./solver3d";

export interface SectionLoad {
  kind: "q" | "R"; // distributed load of the member / reaction of an end support
  id: string; // load id or support node id
  force: Vec3; // components along the section's x, y, z (force/m for q, force for R)
  moment?: Vec3; // reaction moment components (R only)
  zSpan?: [number, number]; // q only: the loaded span along the section's z, m (z = 0 at the front end)
}

const EPS = 1e-9;
const clean = (v: Vec3): Vec3 => v.map((c) => (Math.abs(c) < EPS ? 0 : c)) as Vec3;

export function sectionLoads(
  model: FrameModel3D,
  solved: SolveOutput3D,
  e: number,
  station: number,
): SectionLoad[] {
  const m = model.members[e];
  const g = solved.result.geo[e];
  const st = solved.stations[e][station];
  if (!m || !g || !st) return [];
  const f = courseFrame(g);
  const comps = (v: Vec3): Vec3 =>
    clean([
      v[0] * f.x[0] + v[1] * f.x[1] + v[2] * f.x[2],
      v[0] * f.y[0] + v[1] * f.y[1] + v[2] * f.y[2],
      v[0] * f.z[0] + v[1] * f.z[1] + v[2] * f.z[2],
    ]);
  const zOf = (x: number) => (f.flip ? g.L - x : x); // course z of a point at distance x from n1
  const out: SectionLoad[] = [];
  model.loads.forEach((l) => {
    if (l.type !== "mudl" || l.member !== m.id) return;
    const span = udlSpan(l, g.L); // same clamping and "non-empty" rule as the solver
    if (!span) return;
    const zA = zOf(span.a),
      zB = zOf(span.b);
    const zSpan: [number, number] = [Math.min(zA, zB), Math.max(zA, zB)];
    if (zSpan[0] < st.z - EPS) out.push({ kind: "q", id: l.id, force: comps([l.gx, l.gy, l.gz]), zSpan });
  });
  [m.n1, m.n2].forEach((id) => {
    const node = model.nodes.find((n) => n.id === id);
    const i = solved.nodeIndex.get(id);
    if (!node || node.support === "free" || i === undefined) return;
    if (zOf(id === m.n1 ? 0 : g.L) > st.z + EPS) return; // the support is past the cut
    const r = solved.result.reactions[i];
    out.push({
      kind: "R",
      id,
      force: comps([r.fx, r.fy, r.fz]),
      moment: node.support === "fixed" ? comps([r.mx, r.my, r.mz]) : undefined,
    });
  });
  return out;
}
