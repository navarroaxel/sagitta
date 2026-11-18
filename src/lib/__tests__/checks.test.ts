import { PRESETS } from "../presets";
import { solveModel } from "../solve";
import { getProfile } from "../profiles";
import {
  chordDeflection,
  eulerPcr,
  lightestPassing,
  runChecks,
  sigmaAt,
  sigmaMax,
  type CableCheck,
  type SizeCheck,
  type VerifyCheck,
} from "../checks";
import { equilibrium, EQ_TOL } from "../results";
import type { FrameModel } from "../types";

const preset = (name: string): FrameModel => {
  const p = PRESETS.find((p) => p.name === name);
  if (!p) throw new Error(`Preset not found: "${name}"`);
  return p.model;
};
const checksOf = (name: string) => {
  const model = preset(name);
  const solved = solveModel(model);
  return { model, solved, checks: runChecks(model, solved) };
};
const byMember = <T>(checks: unknown[], id: string) =>
  (checks as { member: string }[]).find((c) => c.member === id) as T;

describe("sigmaAt / sigmaMax / lightestPassing", () => {
  test("σ = |N|/A + |M|·100/Sx (M in force·m, section in cm)", () => {
    const p = getProfile("IPB 300")!; // A = 149 cm², Sx = 1680 cm³
    expect(sigmaAt(p, 0, 360000)).toBeCloseTo(36_000_000 / 1680, 6);
    expect(sigmaAt(p, 1490, 0)).toBeCloseTo(10, 9);
    expect(sigmaAt(p, -1490, -16800)).toBeCloseTo(10 + 1000, 9); // signs do not cancel: worst fibre
  });

  test("sigmaMax takes the worst station", () => {
    const p = getProfile("IPB 300")!;
    const { sigma, demand } = sigmaMax(p, [
      { x: 0, N: 0, Q: 0, M: 0 },
      { x: 6, N: -100, Q: 0, M: 5000 },
      { x: 12, N: 0, Q: 0, M: 0 },
    ]);
    expect(demand.x).toBe(6);
    expect(demand.compressed).toBe(true);
    expect(sigma).toBeCloseTo(100 / 149 + 500000 / 1680, 6);
  });

  test("lightestPassing: smallest section that fits, null when none does", () => {
    const st = [{ x: 0, N: 0, Q: 0, M: 12000 }]; // needs Sx ≥ 1 200 000 / 1600 = 750 cm³
    expect(lightestPassing("IPB", st, 1600)?.profile.name).toBe("IPB 240"); // Sx 938 (IPB 220 = 736 < 750)
    expect(lightestPassing("IPN", st, 1600)?.profile.name).toBe("IPN 320"); // Sx 782 (IPN 300 = 653 < 750)
    expect(
      lightestPassing("IPB", [{ x: 0, N: 0, Q: 0, M: 1e9 }], 1600),
    ).toBeNull();
  });
});

describe("Euler buckling (pinned ends, weak axis, coefficient 1)", () => {
  const E = 2.1e6; // kg/cm²

  test("P_cr = π²·E·Iy/L²", () => {
    expect(eulerPcr(getProfile("IPB 140")!, E, 5)).toBeCloseTo(
      (Math.PI ** 2 * E * 550) / 500 ** 2,
      6,
    );
    expect(eulerPcr(getProfile("IPB 100")!, E, 5)).toBeCloseTo(13845, -1);
    expect(eulerPcr(getProfile("IPB 140")!, E, 5)).toBeCloseTo(45598, -1);
  });

  test("a compressed member needs more than σ ≤ σ adm: IPB 100 has the area but buckles", () => {
    const st = [{ x: 0, N: -34641, Q: 0, M: 0 }];
    expect(lightestPassing("IPB", st, 1600)?.profile.name).toBe("IPB 100"); // by area alone
    const b = { P: 34641, L: 5, E };
    expect(lightestPassing("IPB", st, 1600, b)?.profile.name).toBe("IPB 140");
    expect(lightestPassing("IPB", st, 1600, b)?.pcr).toBeCloseTo(45598, -1);
  });
});

describe("chordDeflection", () => {
  const E = 2.1e6; // kg/cm²
  const stations = (L: number, M: (x: number) => number, n = 65) =>
    Array.from({ length: n }, (_, i) => {
      const x = (L * i) / (n - 1);
      return { x, N: 0, Q: 0, M: M(x) };
    });

  test("simply supported, UDL: 5·q·L⁴/(384·E·I) at mid-span", () => {
    const L = 10; // m
    const q = 2000; // kg/m
    const I = 14920; // cm⁴
    const d = chordDeflection(
      stations(L, (x) => (q * x * (L - x)) / 2),
      E * I,
    )!;
    expect(d.f).toBeCloseTo(
      (5 * (q / 100) * (L * 100) ** 4) / (384 * E * I),
      1,
    );
    expect(d.x).toBeCloseTo(5, 6);
    expect(d.L).toBeCloseTo(10, 9);
  });

  test("simply supported, central point load: P·L³/(48·E·I)", () => {
    const L = 10;
    const P = 20000;
    const I = 14920;
    const M = (x: number) => (x <= L / 2 ? (P * x) / 2 : (P * (L - x)) / 2);
    const d = chordDeflection(stations(L, M), E * I)!;
    expect(d.f).toBeCloseTo((P * (L * 100) ** 3) / (48 * E * I), 0);
  });

  test("no moment, no deflection", () => {
    expect(
      chordDeflection(
        stations(5, () => 0),
        E * 1000,
      )!.f,
    ).toBe(0);
  });
});

describe("Beam IPB 300 (check)", () => {
  const { solved, checks } = checksOf("Beam IPB 300 (check)");
  const c = byMember<VerifyCheck>(checks, "m1");

  test("reactions V = q·L/2 = 120 000 kg", () => {
    expect(solved.result.reactions[0].ry).toBeCloseTo(120000, 3);
    expect(solved.result.reactions[1].ry).toBeCloseTo(120000, 3);
  });

  test("σ max = 21 429 kg/cm² at mid-span: about 13 times σ adm, does not pass", () => {
    expect(c.sigma).toBeCloseTo(21428.6, 0);
    expect(c.ratio).toBeCloseTo(13.39, 2);
    expect(c.ok).toBe(false);
    expect(c.demand.x).toBeCloseTo(6, 1);
    expect(c.demand.M).toBeCloseTo(360000, 0);
  });

  test("deflection of the beam: 5·q·L⁴/(384·E·I) ≈ 102 cm (q = 200 kg/cm, L = 12 m, Ix = 25 170 cm⁴)", () => {
    expect(c.deflection!.f).toBeCloseTo(
      (5 * 200 * 1200 ** 4) / (384 * 2.1e6 * 25170),
      0,
    );
    expect(c.deflection!.x).toBeCloseTo(6, 1);
  });

  test("no IPB of the table is enough (IPB 1000: 2 793 kg/cm²)", () => {
    expect(c.suggestion).toBeNull();
  });

  test("it passes with σ adm large enough, and the suggestion is the lightest IPB", () => {
    const model = { ...preset("Beam IPB 300 (check)"), sigmaAdm: 3000 };
    const [r] = runChecks(model, solveModel(model)) as VerifyCheck[];
    expect(r.ok).toBe(false);
    expect(r.suggestion?.profile.name).toBe("IPB 1000");
    const ok = { ...model, sigmaAdm: 30000 };
    const [r2] = runChecks(ok, solveModel(ok)) as VerifyCheck[];
    expect(r2.ok).toBe(true);
  });
});

// The beam's own weight is part of what the cable carries (member.selfWeight), so the expected values
// come from statics with the weight of the profile the sizing settles on.
describe("Truss + Cable + Beam (sizing)", () => {
  const { model, solved, checks } = checksOf("Truss + Cable + Beam (sizing)");
  const r = (id: string) => solved.result.reactions[solved.nodeIndex.get(id)!];
  const wEF = getProfile("IPB 800")!.w; // the beam settles on IPB 800 (262.2 kg/m)
  const T = (40000 + wEF * 12) / 2; // cable = half of the beam's load (symmetric)
  const D = 10000 + T; // load on D: its own 10 000 kg + what the cable pulls down

  test("EF's weight is included: IPB 800 · 12 m = 3 146 kg (it only goes to the supports and the cable)", () => {
    expect(solved.selfWeight).toHaveLength(1);
    expect(solved.selfWeight[0].profile).toBe("IPB 800");
    expect(solved.selfWeight[0].w).toBeCloseTo(wEF, 6);
    expect(solved.selfWeight[0].total).toBeCloseTo(wEF * 12, 6);
    expect(solved.extraLoads).toHaveLength(1);
  });

  test("stable; reactions from statics (A and B carry D, F carries the beam's half)", () => {
    expect(solved.result.stable).toBe(true);
    expect(r("A").ry).toBeCloseTo(-D / 2, 2);
    expect(r("B").ry).toBeCloseTo(D + D / 2, 2);
    expect(r("B").rx).toBeCloseTo(0, 2);
    expect(r("F").ry).toBeCloseTo(T, 2);
    expect(r("F").rx).toBeCloseTo(0, 2);
  });

  test("the five bars are 5 m", () => {
    for (const id of ["b1", "b2", "b3", "b4", "b5"]) {
      const e = solved.memberIndex.get(id)!;
      expect(solved.result.geo[e].L).toBeCloseTo(5, 9);
    }
  });

  test("cable D-E: T = (40 000 + w·12)/2 = 21 573 kg, A = T/σ adm, d = 4.14 cm, elongation = σ adm·L/E = 0.33 cm", () => {
    const c = byMember<CableCheck>(checks, "cable");
    expect(c.tension).toBe(true);
    expect(c.N).toBeCloseTo(T, 2);
    expect(c.areaReq).toBeCloseTo(T / 1600, 6);
    expect(c.dReq).toBeCloseTo(Math.sqrt((4 * T) / 1600 / Math.PI), 6);
    expect(c.dReq).toBeCloseTo(4.143, 3);
    expect(c.L).toBeCloseTo(4.3301, 4);
    expect(c.elongation).toBeCloseTo((1600 * 433.01) / 2.1e6, 4);
  });

  test("beam E-F: sized for the load alone (M = P·L/4 = 120 000 kg·m, its weight is not in it); no IPN fits, the lightest IPB is IPB 800", () => {
    const c = byMember<SizeCheck>(checks, "EF");
    expect(c.demand.M).toBeCloseTo(120000, 0);
    expect(c.results.map((x) => x.series)).toEqual(["IPN", "IPB"]);
    expect(c.results[0].pick).toBeNull();
    expect(c.results[1].pick?.profile.name).toBe("IPB 800");
    // σ for the load alone: M / Wx = 12 000 000 / 8980 ≈ 1336 kg/cm²
    expect(c.results[1].pick!.sigma).toBeCloseTo(12_000_000 / 8980, 0);
  });

  test("b4 is in compression (D/sin 60° = 36 457 kg): IPB 140 by Euler; b5 is in tension (D/√3): IPB 100", () => {
    const b4 = byMember<SizeCheck>(checks, "b4");
    const b5 = byMember<SizeCheck>(checks, "b5");
    expect(b4.demand.N).toBeCloseTo(-D / Math.sin(Math.PI / 3), 1);
    expect(b4.compressed).toBe(true);
    expect(b4.results[0].pick?.profile.name).toBe("IPB 140"); // IPB 100 / 120: P_cr = 13 845 / 26 364 kg
    expect(b4.results[0].pick!.pcr!).toBeGreaterThan(-b4.demand.N);
    expect(b5.demand.N).toBeCloseTo(D / Math.sqrt(3), 1);
    expect(b5.compressed).toBe(false);
    expect(b5.results[0].pick?.profile.name).toBe("IPB 100"); // A ≥ 11.4 cm²; no Euler in tension
    expect(b5.results[0].pick?.pcr).toBeUndefined();
  });

  test("verifying a profile in compression: IPB 100 fails by buckling, IPB 140 passes", () => {
    const base = preset("Truss + Cable + Beam (sizing)");
    const run = (name: string) => {
      const m2: FrameModel = {
        ...base,
        members: base.members.map((m) =>
          m.id === "b4"
            ? { ...m, section: { kind: "profile" as const, name } }
            : m,
        ),
      };
      return runChecks(m2, solveModel(m2)).find(
        (c) => c.member === "b4",
      ) as VerifyCheck;
    };
    const weak = run("IPB 100");
    expect(weak.sigma).toBeLessThan(1600); // σ is fine…
    expect(weak.buckling?.ok).toBe(false); // …it buckles
    expect(weak.ok).toBe(false);
    expect(weak.suggestion?.profile.name).toBe("IPB 140");
    const strong = run("IPB 140");
    expect(strong.buckling?.ok).toBe(true);
    expect(strong.ok).toBe(true);
  });

  test("only the members that carry a section are checked", () => {
    expect(checks.map((c) => c.member).sort()).toEqual([
      "EF",
      "b4",
      "b5",
      "cable",
    ]);
    expect(model.members.filter((m) => !m.section).length).toBe(3);
  });

  test("without selfWeight the weight is ignored: T = 20 000 kg (the old numbers)", () => {
    const m2: FrameModel = {
      ...model,
      members: model.members.map((m) => ({ ...m, selfWeight: undefined })),
    };
    const s2 = solveModel(m2);
    expect(s2.selfWeight).toEqual([]);
    expect(s2.result.reactions[s2.nodeIndex.get("F")!].ry).toBeCloseTo(
      20000,
      2,
    );
  });

  test("the equilibrium check sums the self-weight too", () => {
    const eq = equilibrium(model, solved);
    expect(Math.abs(eq.fx)).toBeLessThan(EQ_TOL);
    expect(Math.abs(eq.fy)).toBeLessThan(EQ_TOL);
    expect(Math.abs(eq.m)).toBeLessThan(EQ_TOL);
  });
});

describe("Truss + Cable + Beam IPB 260", () => {
  const { model, solved, checks } = checksOf("Truss + Cable + Beam IPB 260");
  const r = (id: string) => solved.result.reactions[solved.nodeIndex.get(id)!];
  const wFG = getProfile("IPB 260")!.w; // 92.63 kg/m
  const qTot = 2000 + wFG; // kg/m on FG: q = 20 kg/cm + own weight
  const T = (20000 + qTot * 10) / 2; // cable = V_G = half of the beam's load

  test("FG's weight is included: IPB 260 · 10 m = 926 kg", () => {
    expect(solved.selfWeight).toHaveLength(1);
    expect(solved.selfWeight[0].member).toBe("FG");
    expect(solved.selfWeight[0].profile).toBe("IPB 260");
    expect(solved.selfWeight[0].total).toBeCloseTo(wFG * 10, 6);
  });

  test("the weight travels to the supports, not into the beam's own check: ownStations = load only", () => {
    const e = solved.memberIndex.get("FG")!;
    const maxM = (st: { M: number }[]) =>
      Math.max(...st.map((x) => Math.abs(x.M)));
    expect(maxM(solved.ownStations["FG"])).toBeCloseTo(75000, 0); // the load alone
    expect(maxM(solved.stations[e])).toBeCloseTo(75000 + (wFG * 100) / 8, 0); // the actual M with its weight
    expect(Object.keys(solved.ownStations)).toEqual(["FG"]);
  });

  test("stable; reactions from statics (ΣM about B with the cable's T at C, 8.66 m to its right)", () => {
    expect(solved.result.stable).toBe(true);
    const VA = (40000 * 5 - 5000 * 8.66 - T * 8.66) / 5; // negative: downward
    expect(r("A").ry).toBeCloseTo(VA, 2);
    expect(r("B").rx).toBeCloseTo(-5000, 2);
    expect(r("B").ry).toBeCloseTo(40000 + T - VA, 2);
    expect(r("G").ry).toBeCloseTo(T, 2);
    expect(r("G").rx).toBeCloseTo(0, 2);
  });

  test("a) beam F-G (IPB 260), verified for the load alone: M = P·L/4 + q·L²/8 = 75 000 kg·m, σ ≈ 6 522 kg/cm², does not pass; IPB 550 would", () => {
    const c = byMember<VerifyCheck>(checks, "FG");
    const M = (20000 * 10) / 4 + (2000 * 100) / 8; // 75 000 kg·m: q = 20 kg/cm, not its own weight
    expect(c.demand.M).toBeCloseTo(M, 0);
    expect(c.sigma).toBeCloseTo((M * 100) / 1150, 0);
    expect(c.ok).toBe(false);
    expect(c.suggestion?.profile.name).toBe("IPB 550");
  });

  test("b) deflection of FG for the load alone: 5·q·L⁴/(384·E·I) + P·L³/(48·E·I) ≈ 21.6 cm", () => {
    const c = byMember<VerifyCheck>(checks, "FG");
    const EI = 2.1e6 * 14920;
    const fq = (5 * (2000 / 100) * 1000 ** 4) / (384 * EI);
    const fp = (20000 * 1000 ** 3) / (48 * EI);
    expect(c.deflection!.f).toBeCloseTo(fq + fp, 0);
    expect(c.deflection!.f).toBeGreaterThan(21.5);
    expect(c.deflection!.f).toBeLessThan(21.7);
    expect(c.deflection!.x).toBeCloseTo(5, 1);
    expect(c.deflection!.L).toBeCloseTo(10, 9);
  });

  test("b, c) cable C-F: T = 20 463 kg, d = 4.04 cm, elongation 1.14 cm over 15 m", () => {
    const c = byMember<CableCheck>(checks, "cable");
    expect(c.L).toBeCloseTo(15, 9);
    expect(c.N).toBeCloseTo(T, 2);
    expect(c.dReq).toBeCloseTo(Math.sqrt((4 * T) / 1600 / Math.PI), 6);
    expect(c.dReq).toBeCloseTo(4.035, 3);
    expect(c.elongation).toBeCloseTo((1600 * 1500) / 2.1e6, 4);
  });

  test("e, f) bar forces and the lightest IPB of each bar", () => {
    // forces from the solver (the cable's T on C), picks by area (tension) or by Euler (compression)
    const expected: Record<string, string> = {
      b1: "IPB 120", // compressed, L = 5 m
      b2: "IPB 160", // compressed, L = 8.66 m
      b3: "IPB 200", // compressed, L = 8.66 m
      b4: "IPB 120", // tension
      b5: "IPB 220", // compressed, L = 8.66 m
      b6: "IPB 100", // tension
    };
    for (const [id, name] of Object.entries(expected)) {
      const c = byMember<SizeCheck>(checks, id);
      expect(c.results[0].pick?.profile.name).toBe(name);
      if (c.compressed)
        expect(c.results[0].pick!.pcr!).toBeGreaterThan(-c.demand.N);
    }
    const b3 = byMember<SizeCheck>(checks, "b3");
    expect(b3.demand.N).toBeCloseTo(-40000, -1); // D's 40 000 kg straight down the column
    expect(byMember<SizeCheck>(checks, "b7").unloaded).toBe(true);
    expect(model.members.find((m) => m.id === "FG")?.selfWeight).toBe(true);
  });
});

describe("runChecks edge cases", () => {
  test("without σ adm there is nothing to check", () => {
    const model = { ...preset("Beam IPB 300 (check)"), sigmaAdm: undefined };
    expect(runChecks(model, solveModel(model))).toEqual([]);
  });

  test("an unknown profile name is ignored, not a crash", () => {
    const base = preset("Beam IPB 300 (check)");
    const model: FrameModel = {
      ...base,
      members: [
        { ...base.members[0], section: { kind: "profile", name: "IPX 1" } },
      ],
    };
    expect(runChecks(model, solveModel(model))).toEqual([]);
  });

  test("a cable in compression is flagged", () => {
    const model: FrameModel = {
      nodes: [
        { id: "A", x: 0, y: 0, support: "pinned" },
        { id: "B", x: 0, y: 3, support: "roller-h" },
      ],
      members: [
        {
          id: "c",
          n1: "A",
          n2: "B",
          relI: true,
          relJ: true,
          section: { kind: "cable" },
        },
      ],
      loads: [{ id: "p", type: "nodal", node: "B", fx: 0, fy: -1000, m: 0 }],
      material: { E: 2.1e10, A: 0.01, I: 8.3e-5 },
      unit: "kg",
      sigmaAdm: 1600,
    };
    const [c] = runChecks(model, solveModel(model)) as CableCheck[];
    expect(c.N).toBeCloseTo(-1000, 3);
    expect(c.tension).toBe(false);
  });
});

describe("a profile section feeds the solver (A, Ix) but not the forces", () => {
  const cant = (
    section?: FrameModel["members"][number]["section"],
  ): FrameModel => ({
    nodes: [
      { id: "A", x: 0, y: 0, support: "fixed" },
      { id: "B", x: 4, y: 0, support: "free" },
    ],
    members: [{ id: "m", n1: "A", n2: "B", section }],
    loads: [{ id: "p", type: "nodal", node: "B", fx: 0, fy: -1000, m: 0 }],
    material: { E: 2.1e10, A: 0.01, I: 8.3e-5 },
    unit: "kg",
    sigmaAdm: 1600,
  });

  test("tip deflection uses the profile's Ix: P·L³/(3·E·I)", () => {
    const s = solveModel(cant({ kind: "profile", name: "IPB 300" }));
    const v = s.result.U[3 * 1 + 1];
    expect(v).toBeCloseTo(-(1000 * 64) / (3 * 2.1e10 * 25170e-8), 7);
  });

  test("the reactions do not change", () => {
    const a = solveModel(cant()).result.reactions[0];
    const b = solveModel(cant({ kind: "profile", name: "IPB 300" })).result
      .reactions[0];
    expect(b.ry).toBeCloseTo(a.ry, 6);
    expect(b.rm).toBeCloseTo(a.rm, 6);
  });
});
