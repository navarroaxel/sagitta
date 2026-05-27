// Adapter: maps id-based FrameModel -> index-based SolverModel, calls solveFrame.
import { FrameModel } from './types';
import { solveFrame, SolverModel, SolverResult } from './solver';
import { sampleMember, Station } from './sampling';

export interface SolveOutput {
  result: SolverResult;
  stations: Station[][];
  nodeIndex: Map<string, number>;
  memberIndex: Map<string, number>;
}

export function solveModel(model: FrameModel): SolveOutput {
  const nodeIndex = new Map<string, number>(model.nodes.map((n, i) => [n.id, i]));
  const memberIndex = new Map<string, number>(model.members.map((m, i) => [m.id, i]));

  const solverModel: SolverModel = {
    nodes: model.nodes.map((n) => ({ x: n.x, y: n.y, support: n.support })),
    members: model.members.map((m) => ({
      i: nodeIndex.get(m.n1)!,
      j: nodeIndex.get(m.n2)!,
      E: model.material.E,
      A: model.material.A,
      I: model.material.I,
      relI: m.relI,
      relJ: m.relJ,
    })),
    loads: model.loads.map((load) => {
      if (load.type === 'nodal') {
        return {
          type: 'nodal' as const,
          node: nodeIndex.get(load.node)!,
          fx: load.fx,
          fy: load.fy,
          m: load.m,
        };
      } else if (load.type === 'mpoint') {
        return {
          type: 'mpoint' as const,
          member: memberIndex.get(load.member)!,
          dist: load.dist,
          gx: load.gx,
          gy: load.gy,
        };
      } else {
        return {
          type: 'mudl' as const,
          member: memberIndex.get(load.member)!,
          gx: load.gx,
          gy: load.gy,
        };
      }
    }),
  };

  const result = solveFrame(solverModel);
  const stations = model.members.map((_, e) => sampleMember(solverModel, result, e, 64));

  return { result, stations, nodeIndex, memberIndex };
}
