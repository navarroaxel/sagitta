// Adapter: id-based FrameModel3D -> index-based Solver3DModel, calls solveFrame3D.
import { FrameModel3D } from "./types3d";
import { solveFrame3D, Solver3DModel, Solver3DResult } from "./solver3d";
import { sampleMember3D, Station3D } from "./sampling3d";
import { memberSection } from "./stress3d";

export interface SolveOutput3D {
  result: Solver3DResult;
  stations: Station3D[][];
  solverModel: Solver3DModel;
  nodeIndex: Map<string, number>;
  memberIndex: Map<string, number>;
}

// Returns null when the model is malformed (dangling ids, zero-length member): the UI
// reports it like an unstable model.
export function solveModel3D(model: FrameModel3D): SolveOutput3D | null {
  const nodeIndex = new Map(model.nodes.map((n, i) => [n.id, i]));
  const memberIndex = new Map(model.members.map((m, i) => [m.id, i]));
  const { E, G } = model.material;

  if (model.members.some((m) => !nodeIndex.has(m.n1) || !nodeIndex.has(m.n2)))
    return null;
  if (
    model.loads.some((l) =>
      l.type === "nodal" ? !nodeIndex.has(l.node) : !memberIndex.has(l.member),
    )
  )
    return null;

  const solverModel: Solver3DModel = {
    nodes: model.nodes.map(({ x, y, z, support }) => ({ x, y, z, support })),
    members: model.members.map((m) => {
      // course Ix (about x, bending in the y-z plane) is the solver's Iy (about y')
      const { A, Ix, Iy, J } = memberSection(model.material, m);
      return { i: nodeIndex.get(m.n1)!, j: nodeIndex.get(m.n2)!, E, G, A, Iy: Ix, Iz: Iy, J };
    }),
    loads: model.loads.map((l) =>
      l.type === "nodal"
        ? {
            type: "nodal" as const,
            node: nodeIndex.get(l.node)!,
            fx: l.fx,
            fy: l.fy,
            fz: l.fz,
            mx: l.mx,
            my: l.my,
            mz: l.mz,
          }
        : l.type === "mpoint"
          ? {
              type: "mpoint" as const,
              member: memberIndex.get(l.member)!,
              dist: l.dist,
              gx: l.gx,
              gy: l.gy,
              gz: l.gz,
            }
          : {
              type: "mudl" as const,
              member: memberIndex.get(l.member)!,
              gx: l.gx,
              gy: l.gy,
              gz: l.gz,
              from: l.from,
              to: l.to,
            },
    ),
  };

  try {
    const result = solveFrame3D(solverModel);
    const stations = model.members.map((_, e) =>
      sampleMember3D(solverModel, result, e, 64),
    );
    return { result, stations, solverModel, nodeIndex, memberIndex };
  } catch {
    return null; // zero-length member etc.
  }
}
