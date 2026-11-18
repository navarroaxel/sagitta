// Verification and sizing of the members of a solved 2D model (the "checks" panel of the editor).
// Pure and React-free. Units: forces in the model's unit (kg for the course), lengths in metres,
// sections in cm (profile table), so stresses come out in force/cm² and M·100 is force·cm.
//
// σ = N/A + M/W ≤ σadm is checked at every station, and a member in compression also has to
// stay below Euler's critical load P_cr = π²·E·Iy/L² (pinned ends, L = the member's length,
// weak axis, safety coefficient 1, as in the course). No shear check.
import type { FrameModel, Member } from "./types";
import type { SolveOutput } from "./solve";
import type { Station } from "./sampling";
import {
  IPB_PROFILES,
  IPN_PROFILES,
  getProfile,
  type Profile,
} from "./profiles";
import { TOL } from "./results";

const SERIES: Record<"IPN" | "IPB", Profile[]> = {
  IPN: IPN_PROFILES,
  IPB: IPB_PROFILES,
};

export interface Demand {
  N: number; // normal force at the critical station (+ tension)
  M: number; // bending moment at the critical station, force·m
  x: number; // distance from the member's start, m
  compressed: boolean; // some station is in compression
}

// σ of a doubly symmetric section at one station: the extreme fibre where N/A and M/W add up.
export function sigmaAt(p: Profile, N: number, M: number): number {
  return Math.abs(N) / p.A + (Math.abs(M) * 100) / p.Sx;
}

// Euler's critical load of the profile (weak axis, pinned ends): force, with E in force/cm², L in m.
export function eulerPcr(p: Profile, E: number, L: number): number {
  const Lcm = L * 100;
  return (Math.PI ** 2 * E * p.Iy) / (Lcm * Lcm);
}

// A member in compression: the largest compressive force (> 0), its length and E (force/cm²).
export interface Buckling {
  P: number;
  L: number;
  E: number;
}

// Largest σ of the profile along the member, and where it is.
export function sigmaMax(
  p: Profile,
  stations: Station[],
): { sigma: number; demand: Demand } {
  let best: Demand = { N: 0, M: 0, x: 0, compressed: false };
  let sigma = -1;
  let compressed = false;
  for (const s of stations) {
    const v = sigmaAt(p, s.N, s.M);
    if (s.N < -TOL) compressed = true;
    if (v > sigma) {
      sigma = v;
      best = { N: s.N, M: s.M, x: s.x, compressed: false };
    }
  }
  best.compressed = compressed;
  return { sigma: Math.max(sigma, 0), demand: best };
}

// Lightest profile of the series (the table is ordered by size) whose σ max is within sigmaAdm.
export interface Pick {
  profile: Profile;
  sigma: number;
  pcr?: number; // Euler's critical load, only for members in compression
}

export function lightestPassing(
  series: "IPN" | "IPB",
  stations: Station[],
  sigmaAdm: number,
  buckling?: Buckling,
): Pick | null {
  for (const p of SERIES[series]) {
    const { sigma } = sigmaMax(p, stations);
    if (sigma > sigmaAdm) continue;
    if (!buckling) return { profile: p, sigma };
    const pcr = eulerPcr(p, buckling.E, buckling.L);
    if (buckling.P <= pcr) return { profile: p, sigma, pcr };
  }
  return null;
}

export interface VerifyCheck {
  kind: "verify";
  member: string;
  profile: Profile;
  sigma: number;
  ratio: number; // sigma / sigmaAdm
  ok: boolean;
  demand: Demand;
  // member in compression: Euler's critical load of this profile and whether P stays below it
  buckling: { P: number; pcr: number; ok: boolean } | null;
  // lightest profile of the same series that passes (null when none of the table does)
  suggestion: Pick | null;
}

export interface SizeCheck {
  kind: "size";
  member: string;
  demand: Demand; // largest |N| and largest |M| of the member (not necessarily at the same station)
  results: {
    series: "IPN" | "IPB";
    pick: Pick | null;
  }[];
  unloaded: boolean; // the member carries no force: any profile passes
  compressed: boolean; // in compression: the profiles are also checked against Euler
}

export interface CableCheck {
  kind: "cable";
  member: string;
  N: number;
  L: number; // m
  tension: boolean; // a cable only works in tension
  areaReq: number; // cm²
  dReq: number; // cm, exact diameter for sigmaAdm
  dAdopted: number; // cm, rounded up to the next mm
  elongation: number; // cm, N·L/(E·A) with the required area (= sigmaAdm·L/E)
}

export type MemberCheck = VerifyCheck | SizeCheck | CableCheck;

const maxAbs = (stations: Station[], key: "N" | "M"): Station =>
  stations.reduce(
    (b, s) => (Math.abs(s[key]) > Math.abs(b[key]) ? s : b),
    stations[0],
  );

// Compression of member `e` (null when no station is in compression).
function bucklingOf(
  model: FrameModel,
  solved: SolveOutput,
  e: number,
): Buckling | null {
  const st = solved.stations[e];
  const P = -Math.min(...st.map((s) => s.N));
  if (!(P > TOL)) return null;
  return { P, L: solved.result.geo[e].L, E: model.material.E / 1e4 };
}

// One entry per member that has a `section`; [] when the model has no sigmaAdm or no sections.
export function runChecks(
  model: FrameModel,
  solved: SolveOutput,
): MemberCheck[] {
  const sigmaAdm = model.sigmaAdm;
  if (!sigmaAdm || !(sigmaAdm > 0)) return [];
  const out: MemberCheck[] = [];
  model.members.forEach((m: Member, e) => {
    const sec = m.section;
    const st = solved.stations[e];
    if (!sec || !st || st.length === 0) return;

    if (sec.kind === "profile") {
      const p = getProfile(sec.name);
      if (!p) return;
      const { sigma, demand } = sigmaMax(p, st);
      const buck = bucklingOf(model, solved, e);
      const pcr = buck ? eulerPcr(p, buck.E, buck.L) : 0;
      const bOk = !buck || buck.P <= pcr;
      out.push({
        kind: "verify",
        member: m.id,
        profile: p,
        sigma,
        ratio: sigma / sigmaAdm,
        ok: sigma <= sigmaAdm && bOk,
        demand,
        buckling: buck ? { P: buck.P, pcr, ok: bOk } : null,
        suggestion:
          p.series === "IPN" || p.series === "IPB"
            ? lightestPassing(p.series, st, sigmaAdm, buck ?? undefined)
            : null,
      });
    } else if (sec.kind === "size") {
      const nPk = maxAbs(st, "N");
      const mPk = maxAbs(st, "M");
      const unloaded = Math.abs(nPk.N) < TOL && Math.abs(mPk.M) < TOL;
      const series = sec.series.length ? sec.series : (["IPB"] as const);
      out.push({
        kind: "size",
        member: m.id,
        demand: {
          N: nPk.N,
          M: mPk.M,
          x: mPk.x,
          compressed: st.some((s) => s.N < -TOL),
        },
        results: series.map((s) => ({
          series: s,
          pick: lightestPassing(
            s,
            st,
            sigmaAdm,
            bucklingOf(model, solved, e) ?? undefined,
          ),
        })),
        unloaded,
        compressed: st.some((s) => s.N < -TOL),
      });
    } else {
      const N = maxAbs(st, "N").N;
      const L = solved.result.geo[e].L;
      const E = model.material.E / 1e4; // force/m² -> force/cm²
      const areaReq = Math.abs(N) / sigmaAdm;
      const dReq = Math.sqrt((4 * areaReq) / Math.PI);
      out.push({
        kind: "cable",
        member: m.id,
        N,
        L,
        tension: N > TOL,
        areaReq,
        dReq,
        dAdopted: Math.ceil(dReq * 10 - 1e-9) / 10,
        elongation: (Math.abs(N) * L * 100) / (E * areaReq || 1),
      });
    }
  });
  return out;
}
