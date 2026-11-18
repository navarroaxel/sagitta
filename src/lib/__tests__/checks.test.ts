import { PRESETS } from "../presets";
import { solveModel } from "../solve";
import { getProfile } from "../profiles";
import {
  lightestPassing,
  runChecks,
  sigmaAt,
  sigmaMax,
  type CableCheck,
  type SizeCheck,
  type VerifyCheck,
} from "../checks";
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

describe("Truss + Cable + Beam (sizing)", () => {
  const { model, solved, checks } = checksOf("Truss + Cable + Beam (sizing)");
  const r = (id: string) => solved.result.reactions[solved.nodeIndex.get(id)!];

  test("stable; reactions as in examples/truss-cable-beam-kg.svg", () => {
    expect(solved.result.stable).toBe(true);
    expect(r("A").ry).toBeCloseTo(-15000, 2);
    expect(r("B").ry).toBeCloseTo(45000, 2);
    expect(r("B").rx).toBeCloseTo(0, 2);
    expect(r("F").ry).toBeCloseTo(20000, 2);
    expect(r("F").rx).toBeCloseTo(0, 2);
  });

  test("the five bars are 5 m", () => {
    for (const id of ["b1", "b2", "b3", "b4", "b5"]) {
      const e = solved.memberIndex.get(id)!;
      expect(solved.result.geo[e].L).toBeCloseTo(5, 9);
    }
  });

  test("cable D-E: T = 20 000 kg, A = 12.5 cm², d = 3.99 cm, elongation = σ adm·L/E = 0.33 cm", () => {
    const c = byMember<CableCheck>(checks, "cable");
    expect(c.tension).toBe(true);
    expect(c.N).toBeCloseTo(20000, 2);
    expect(c.areaReq).toBeCloseTo(12.5, 6);
    expect(c.dReq).toBeCloseTo(3.989, 3);
    expect(c.dAdopted).toBeCloseTo(4.0, 9);
    expect(c.L).toBeCloseTo(4.3301, 4);
    expect(c.elongation).toBeCloseTo((1600 * 433.01) / 2.1e6, 4);
  });

  test("beam E-F: M = 120 000 kg·m, no IPN fits, the lightest IPB is IPB 800", () => {
    const c = byMember<SizeCheck>(checks, "EF");
    expect(c.demand.M).toBeCloseTo(120000, 0);
    expect(c.results.map((x) => x.series)).toEqual(["IPN", "IPB"]);
    expect(c.results[0].pick).toBeNull();
    expect(c.results[1].pick?.profile.name).toBe("IPB 800");
  });

  test("bars b4 (compressed, 34 641 kg) and b5 (tension, 17 321 kg) in IPB", () => {
    const b4 = byMember<SizeCheck>(checks, "b4");
    const b5 = byMember<SizeCheck>(checks, "b5");
    expect(b4.demand.N).toBeCloseTo(-34641, -1);
    expect(b4.compressed).toBe(true);
    expect(b4.results[0].pick?.profile.name).toBe("IPB 100"); // A = 26 cm² ≥ 21.65 cm²
    expect(b5.demand.N).toBeCloseTo(17321, -1);
    expect(b5.compressed).toBe(false);
    expect(b5.results[0].pick?.profile.name).toBe("IPB 100"); // A ≥ 10.8 cm²
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
});

describe("Truss + Cable + Beam IPB 260", () => {
  const { solved, checks } = checksOf("Truss + Cable + Beam IPB 260");
  const r = (id: string) => solved.result.reactions[solved.nodeIndex.get(id)!];

  test("stable; reactions as in examples/truss-cable-beam-ipb260-kg.svg", () => {
    expect(solved.result.stable).toBe(true);
    expect(r("A").ry).toBeCloseTo(-3300, 2);
    expect(r("B").rx).toBeCloseTo(-5000, 2);
    expect(r("B").ry).toBeCloseTo(63300, 2);
    expect(r("G").ry).toBeCloseTo(20000, 2);
    expect(r("G").rx).toBeCloseTo(0, 2);
  });

  test("a) beam F-G (IPB 260): M = 75 000 kg·m, σ ≈ 6 522 kg/cm², does not pass; IPB 550 would", () => {
    const c = byMember<VerifyCheck>(checks, "FG");
    expect(c.demand.M).toBeCloseTo(75000, 0);
    expect(c.sigma).toBeCloseTo(7_500_000 / 1150, 0);
    expect(c.ok).toBe(false);
    expect(c.suggestion?.profile.name).toBe("IPB 550");
  });

  test("b, c) cable C-F: T = 20 000 kg, d = 3.99 cm, elongation 1.14 cm over 15 m", () => {
    const c = byMember<CableCheck>(checks, "cable");
    expect(c.L).toBeCloseTo(15, 9);
    expect(c.N).toBeCloseTo(20000, 2);
    expect(c.dReq).toBeCloseTo(3.989, 3);
    expect(c.elongation).toBeCloseTo((1600 * 1500) / 2.1e6, 4);
  });

  test("e, f) bar forces and the lightest IPB of each bar", () => {
    const expected: Record<string, [number, string]> = {
      b1: [-25000, "IPB 100"],
      b2: [-20000, "IPB 100"],
      b3: [-40000, "IPB 100"],
      b4: [50000, "IPB 120"],
      b5: [-63300, "IPB 140"],
      b6: [28284, "IPB 100"],
      b7: [0, "IPB 100"],
    };
    for (const [id, [N, name]] of Object.entries(expected)) {
      const c = byMember<SizeCheck>(checks, id);
      expect(c.demand.N).toBeCloseTo(N, -1);
      expect(c.results[0].pick?.profile.name).toBe(name);
    }
    expect(byMember<SizeCheck>(checks, "b7").unloaded).toBe(true);
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
