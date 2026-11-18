// Adapter: maps id-based FrameModel -> index-based SolverModel, calls solveFrame.
import { FrameModel, Load } from "./types";
import { getProfile, type Profile } from "./profiles";
import { bestPick } from "./checks";
import { solveFrame, SolverModel, SolverResult } from "./solver";
import { sampleMember, Station } from "./sampling";

export interface SelfWeight {
  member: string;
  profile: string;
  w: number; // force per metre in the model's unit (kg/m for kg)
  total: number; // w · L
}

export interface SolveOutput {
  result: SolverResult;
  stations: Station[][];
  nodeIndex: Map<string, number>;
  memberIndex: Map<string, number>;
  // Loads added by the solver on top of model.loads (the self-weight of the members that ask for it),
  // already included in `result` / `stations`; the equilibrium check sums them too.
  extraLoads: Load[];
  selfWeight: SelfWeight[];
  // Stations of the members with `selfWeight` WITHOUT their own weight (member id -> stations): the
  // weight only travels to the supports and the other members, a beam is verified / sized for the
  // applied loads alone (how the course does it). Members without selfWeight are not listed.
  ownStations: Record<string, Station[]>;
  // false when the pick ↔ weight loop (several sized members) did not settle in its pass limit
  selfWeightConverged: boolean;
}

// Profile weights are in kg/m; the model's force unit decides the factor (0: unknown unit, no weight).
export function weightFactor(unit: string): number {
  const u = unit.trim().toLowerCase();
  if (u === "kg") return 1;
  if (u === "t") return 1e-3;
  if (u === "kn") return 9.80665e-3;
  return 0;
}

function weightLoads(weights: Map<string, Profile>, k: number): Load[] {
  return [...weights].map(([member, p]) => ({
    id: `sw:${member}`,
    type: "mudl" as const,
    member,
    gx: 0,
    gy: -p.w * k,
  }));
}

// Self-weight of the members with `selfWeight`: the weight of a `profile` section is fixed; for a
// `size` section the pick depends on the loads, and the loads on the pick, so iterate (the weight only
// grows, the loop settles in a few passes).
export function solveModel(model: FrameModel): SolveOutput {
  const flagged = model.members.filter((m) => m.selfWeight && m.section);
  if (flagged.length === 0) return solveWith(model, new Map());

  const weights = new Map<string, Profile>();
  for (const m of flagged) {
    if (m.section?.kind === "profile") {
      const p = getProfile(m.section.name);
      if (p) weights.set(m.id, p);
    }
  }
  const without = (id: string) => {
    const w = new Map(weights);
    w.delete(id);
    return w;
  };
  // A `size` pick comes from the member's stations without its own weight, so with one sized member
  // it does not depend on the weight at all; with several, their weights reach each other: iterate.
  const sized = flagged.filter((m) => m.section?.kind === "size");
  let converged = true;
  if (sized.length && model.sigmaAdm && model.sigmaAdm > 0) {
    converged = false;
    for (let pass = 0; pass < 12; pass++) {
      let changed = false;
      for (const m of sized) {
        const e = model.members.findIndex((x) => x.id === m.id);
        const pick = bestPick(model, solveWith(model, without(m.id)), e);
        if (pick && pick.profile.name !== weights.get(m.id)?.name) {
          weights.set(m.id, pick.profile);
          changed = true;
        }
      }
      if (!changed) {
        converged = true;
        break;
      }
    }
  }
  const out = solveWith(model, weights);
  const ownStations: Record<string, Station[]> = {};
  for (const m of flagged) {
    if (!weights.has(m.id)) continue;
    ownStations[m.id] = solveWith(model, without(m.id)).stations[
      out.memberIndex.get(m.id)!
    ];
  }
  return { ...out, ownStations, selfWeightConverged: converged };
}

function solveWith(
  model: FrameModel,
  weights: Map<string, Profile>,
): SolveOutput {
  const k = weightFactor(model.unit);
  const extra = k > 0 ? weightLoads(weights, k) : [];
  const nodeIndex = new Map<string, number>(
    model.nodes.map((n, i) => [n.id, i]),
  );
  const memberIndex = new Map<string, number>(
    model.members.map((m, i) => [m.id, i]),
  );

  const solverModel: SolverModel = {
    nodes: model.nodes.map((n) => ({ x: n.x, y: n.y, support: n.support })),
    members: model.members.map((m) => {
      // A member checked against a profile uses the profile's A and Ix (cm² -> m², cm⁴ -> m⁴;
      // lengths are metres). They only matter for displacements: forces of a determinate model
      // do not depend on the section.
      const prof =
        m.section?.kind === "profile" ? getProfile(m.section.name) : undefined;
      return {
        i: nodeIndex.get(m.n1)!,
        j: nodeIndex.get(m.n2)!,
        E: model.material.E,
        A: prof ? prof.A * 1e-4 : model.material.A,
        I: prof ? prof.Ix * 1e-8 : model.material.I,
        relI: m.relI,
        relJ: m.relJ,
      };
    }),
    loads: [...model.loads, ...extra].map((load) => {
      if (load.type === "nodal") {
        return {
          type: "nodal" as const,
          node: nodeIndex.get(load.node)!,
          fx: load.fx,
          fy: load.fy,
          m: load.m,
        };
      } else if (load.type === "mpoint") {
        return {
          type: "mpoint" as const,
          member: memberIndex.get(load.member)!,
          dist: load.dist,
          gx: load.gx,
          gy: load.gy,
        };
      } else {
        return {
          type: "mudl" as const,
          member: memberIndex.get(load.member)!,
          gx: load.gx,
          gy: load.gy,
        };
      }
    }),
  };

  const result = solveFrame(solverModel);
  const stations = model.members.map((_, e) =>
    sampleMember(solverModel, result, e, 64),
  );

  const selfWeight: SelfWeight[] =
    k > 0
      ? [...weights].map(([member, p]) => ({
          member,
          profile: p.name,
          w: p.w * k,
          total: p.w * k * result.geo[memberIndex.get(member)!].L,
        }))
      : [];
  return {
    result,
    stations,
    nodeIndex,
    memberIndex,
    extraLoads: extra,
    selfWeight,
    ownStations: {},
    selfWeightConverged: true,
  };
}
