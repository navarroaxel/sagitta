import { solveModel3D } from "../solve3d";
import { PRESETS_3D } from "../presets3d";
import { PRESETS } from "../presets";
import { solveModel } from "../solve";
import { runChecks, type CableCheck, type SizeCheck, type VerifyCheck } from "../checks";
import { runBasic } from "./casioBasic";
import {
  baseForces, distributedLoad,
  chooseIPB,
  PERFIL_LINES,
  PERFIL_TABLE,
  reactionsFromLoads,
  REACC_LINES,
  sigmaMaxOf,
  faceFor,
  neutralAxisOf,
  cableBeam,
  VIGACAB_LINES,
  type ProgramLoad,
} from "../casioPrograms";

const near = (a: number, b: number) => expect(Math.abs(a - b)).toBeLessThan(1e-6 * Math.max(1, Math.abs(b)));

// The loads of a preset typed as the program asks for them (nodal: at its node; distributed: resultant at the span's centre).
function programLoads(key: string): ProgramLoad[] {
  const model = PRESETS_3D.find((p) => p.key === key)!.model;
  const out: ProgramLoad[] = [];
  for (const l of model.loads) {
    if (l.type === "nodal") {
      const n = model.nodes.find((q) => q.id === l.node)!;
      out.push({ x: n.x, y: n.y, z: n.z, fx: l.fx, fy: l.fy, fz: l.fz, mx: l.mx, my: l.my, mz: l.mz });
    } else if (l.type === "mudl") {
      const m = model.members.find((q) => q.id === l.member)!;
      const a = model.nodes.find((q) => q.id === m.n1)!,
        b = model.nodes.find((q) => q.id === m.n2)!;
      const L = Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
      const from = Math.min(Math.max(l.from ?? 0, 0), L),
        to = Math.min(Math.max(l.to ?? L, 0), L);
      const t = (from + to) / 2 / L;
      out.push({
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
        z: a.z + (b.z - a.z) * t,
        fx: l.gx, fy: l.gy, fz: l.gz,
        len: to - from,
      });
    }
  }
  return out;
}

describe("Casio program REACC", () => {
  // presets with a single fixed support at A and only nodal / uniform loads
  const keys = ["t_frame_kg", "t_frame_qy", "column_kg", "cantilever_kg"] as const;
  keys.forEach((key) => {
    test(`${key}: reactions = the solver's`, () => {
      const model = PRESETS_3D.find((p) => p.key === key)!.model;
      const solved = solveModel3D(model)!;
      const r = solved.result.reactions[solved.nodeIndex.get("A")!];
      const mine = reactionsFromLoads(programLoads(key));
      near(mine.fx, r.fx); near(mine.fy, r.fy); near(mine.fz, r.fz);
      near(mine.mx, r.mx); near(mine.my, r.my); near(mine.mz, r.mz);
    });
  });

  test("worked example of the T-frame (kg): −300, 600, 900, −300", () => {
    const r = reactionsFromLoads([
      { x: 0.5, y: 0, z: 3, fx: 0, fy: 0, fz: -200, len: 3 },
      { x: 0, y: 0, z: 3, fx: 0, fy: 300, fz: 0 },
    ]);
    expect([r.fx, r.fy, r.fz, r.mx, r.my, r.mz]).toEqual([0, -300, 600, 900, -300, 0]);
  });

  ["t_frame_kg", "t_frame_qy", "column_kg"].forEach((key) => {
    test(`${key}: base of the column = the solver's N, Qx, Qy, Mx, My`, () => {
      const model = PRESETS_3D.find((p) => p.key === key)!.model;
      const st = solveModel3D(model)!.stations[0].reduce((b, p) => (p.z > b.z ? p : b)); // column A→B: the base has the largest z
      const b = baseForces(reactionsFromLoads(programLoads(key)));
      near(b.N, st.N); near(b.Qx, st.Qx); near(b.Qy, st.Qy); near(b.Mx, st.Mx); near(b.My, st.My);
    });
  });

  // The listing RUN by a small Casio Basic interpreter (casioBasic.ts), typed as on the calculator, vs the solver.
  const numbers = (out: (string | number)[]) => out.filter((o): o is number => typeof o === "number").map((n) => (n === 0 ? 0 : n));

  test("running REACC: t-frame-3d-fixed-kg typed as the page says (distributed = its two end points and q)", () => {
    const out = runBasic(REACC_LINES, [
      2,
      2, -1, 0, 3, 2, 0, 3, 0, 0, -200, // load 1: distributed, from (−1,0,3) to (2,0,3), q = (0, 0, −200)
      1, 0, 0, 3, 0, 300, 0, // load 2: point at B, F = (0, 300, 0)
    ]);
    const r = numbers(out);
    // the marker "CARGA" and its number (1, 2) come before each load; then the 6 reactions and the 5 forces at the base
    expect(out.filter((o) => o === "CARGA")).toHaveLength(2);
    expect(r).toEqual([1, 2, 0, -300, 600, 900, -300, 0, -600, -300, 0, -300, 900]);
  });

  test("running REACC: column-3d-fixed-kg (q_y on the whole column + a point load at the top) = the solver's reactions", () => {
    const r = numbers(runBasic(REACC_LINES, [2, 2, 0, 0, 0, 0, 0, 5, 0, 200, 0, 1, 0, 0, 5, 1500, 0, -20000]));
    expect(r.slice(2)).toEqual([-1500, -1000, 20000, 2500, -7500, 0, -20000, -1000, -1500, -7500, 2500]);
  });

  test("running REACC: a moment alone has no arm (type 3), and loads can be mixed in any order", () => {
    const r = numbers(runBasic(REACC_LINES, [1, 3, 10, -20, 30]));
    expect(r.slice(1, 7)).toEqual([0, 0, 0, -10, 20, -30]); // the reactions are minus the applied moment
    expect(distributedLoad([-1, 0, 3], [2, 0, 3], [0, 0, -200])).toEqual({ x: 0.5, y: 0, z: 3, fx: 0, fy: 0, fz: -200, len: 3 });
  });

  test("running PERFIL = chooseIPB: the face comes from the moments (strong axis against the larger one), and none passing", () => {
    for (const [N, Mx, My, adm, face] of [
      [-600, -300, 900, 1400, 2], // |My| > |Mx|: the turned profile
      [-600, 900, -300, 1400, 1], // |Mx| > |My|: x against the strong axis
      [-5000, 400, -1200, 1600, 2],
      [-5000, 1200, -400, 1600, 1],
      [-3000, 500, 500, 1400, 1], // equal moments: face 1
      [-1e7, 0, 0, 1400, 1],
    ] as const) {
      const out = runBasic(PERFIL_LINES, [N, Mx, My, adm]);
      expect(faceFor(Mx, My)).toBe(face);
      const c = chooseIPB(N, Mx, My, adm, face);
      if (c) {
        expect(out.slice(0, 6)).toEqual(["USAR IPB", +c.name.replace("IPB ", ""), "SIGMA MAX =", expect.closeTo(c.sigmaMax, 6), "CARA =", face]);
        // the neutral axis: where it crosses X (Y = 0) and Y (X = 0), cm; "NO CORTA" when that moment is 0
        const en = neutralAxisOf(c.name, face, N, Mx, My);
        const fix = (n: number | null, label: string, none: string) => (n === null ? [none] : [label, expect.closeTo(n === 0 ? 0 : n, 6)]);
        expect(out.slice(6)).toEqual([...fix(en.x0, "X (Y=0) =", "E.N. NO CORTA X"), ...fix(en.y0, "Y (X=0) =", "E.N. NO CORTA Y")]);
      } else expect(out).toEqual(["NINGUN IPB HASTA 600"]);
    }
  });

  test("running PERFIL: neutral axis intercepts of the base of preset #2, and when a moment is 0", () => {
    const out = runBasic(PERFIL_LINES, [-600, -300, 900, 0]);
    expect(out.slice(6, 8)).toEqual(["X (Y=0) =", expect.closeTo(0.16941, 4)]);
    expect(out.slice(8)).toEqual(["Y (X=0) =", expect.closeTo(-0.18707, 4)]);
    expect(runBasic(PERFIL_LINES, [-600, 0, 900, 1400]).slice(8)).toEqual(["E.N. NO CORTA Y"]); // Mx = 0: parallel to the x axis
    expect(runBasic(PERFIL_LINES, [-600, 900, 0, 1400]).slice(6, 7)).toEqual(["E.N. NO CORTA X"]);
  });

  test("running PERFIL: σ_adm typed as 0 means the default, 1400", () => {
    const withDefault = runBasic(PERFIL_LINES, [-600, -300, 900, 0]);
    expect(withDefault).toEqual(runBasic(PERFIL_LINES, [-600, -300, 900, 1400]));
    expect(withDefault[1]).toBe(120); // preset #2's base: the larger moment is My, so face 2: IPB 120 passes at 1400 (1208.7)
    expect(runBasic(PERFIL_LINES, [-600, -300, 900, 1000])).not.toEqual(withDefault); // another σ_adm is respected
  });

  test("the program text asks for what the TypeScript uses and prints every result", () => {
    const text = REACC_LINES.join("\n");
    for (const v of ["F", "G", "H", "I", "J", "K"]) expect(text).toContain(`→${v}`);
    expect(text.match(/◢/g)!.length).toBe(REACC_LINES.filter((l) => l.endsWith("◢")).length);
    expect(REACC_LINES.every((l) => l.length <= 40)).toBe(true); // short lines: easy to type
  });
});

describe("Casio program PERFIL", () => {
  test("table: IPB 100…600 (19 profiles) typed into the five lists", () => {
    expect(PERFIL_TABLE).toHaveLength(19);
    expect(PERFIL_TABLE[0].name).toBe("IPB 100");
    expect(PERFIL_TABLE[18].name).toBe("IPB 600");
    expect(PERFIL_LINES[0]).toMatch(/^\{100,120,.*,600\}→List 1$/);
    expect(PERFIL_LINES[2]).toMatch(/^\{26,34,.*,270\}→List 3$/);
  });

  test("the base of preset #2 (N −600, Mx −300, My 900): face 1 = 1924.1 and face 2 = 1208.7 on IPB 120 (the guide's values)", () => {
    const p = PERFIL_TABLE[1];
    expect(sigmaMaxOf(p, -600, -300, 900, 1)).toBeCloseTo(1924.1, 0);
    expect(sigmaMaxOf(p, -600, -300, 900, 2)).toBeCloseTo(1208.7, 0);
  });

  test("the chosen profile passes, the previous one does not, and agrees with the solver's stress check", () => {
    const sigmaAdm = 1400;
    for (const face of [1, 2] as const) {
      const c = chooseIPB(-600, -300, 900, sigmaAdm, face)!;
      expect(c.sigmaMax).toBeLessThanOrEqual(sigmaAdm);
      const i = PERFIL_TABLE.findIndex((p) => p.name === c.name);
      if (i > 0) expect(sigmaMaxOf(PERFIL_TABLE[i - 1], -600, -300, 900, face)).toBeGreaterThan(sigmaAdm);
    }
    expect(chooseIPB(-600, -300, 900, 1400, 2)!.name).toBe("IPB 120"); // 1208.7 ≤ 1400 already on IPB 120
    expect(chooseIPB(-600, -300, 900, 1400, 1)!.name).not.toBe("IPB 120"); // 1924.1 > 1400
  });

  test("no IPB up to 600 passes → null; pure axial load uses N/A", () => {
    expect(chooseIPB(-1e7, 0, 0, 1400, 1)).toBeNull();
    near(chooseIPB(-26 * 1000, 0, 0, 1000, 1)!.sigmaMax, 1000); // IPB 100: A = 26 cm²
  });

  test("the program text matches: every variable it reads is assigned first", () => {
    expect(PERFIL_LINES.join("\n")).toContain("If T=2:Then X→Z:Y→X:Z→Y:D→Z:E→D:Z→E:IfEnd");
    expect(PERFIL_LINES.filter((l) => l.includes("→List")).length).toBe(5);
  });
});

describe("Casio program VIGACAB (beam + cable of the two truss-cable-beam examples)", () => {
  const preset = (name: string) => PRESETS.find((p) => p.name === name)!.model;
  const checksOf = (name: string) => {
    const model = preset(name);
    const solved = solveModel(model);
    return runChecks(model, solved);
  };
  const cableOf = (checks: unknown[]) => (checks as { kind: string }[]).find((c) => c.kind === "cable") as CableCheck;

  test("truss-cable-beam-kg: M = 120 000 kg·m, IPB 800, T = (40 000 + w·12)/2, d = 4.14 cm — the app's own numbers", () => {
    const checks = checksOf("Truss + Cable + Beam (sizing)");
    const c = cableOf(checks);
    const beam = (checks as SizeCheck[]).find((x) => x.kind === "size" && x.member === "EF")!;
    const r = cableBeam({ L: 12, Lc: 4.33013, P: 40000, a: 6, q: 0 });
    expect(r.Mmax).toBeCloseTo(beam.demand.M, 0);
    expect(r.min!.name).toBe(beam.results[1].pick!.profile.name); // IPB 800 (no IPN fits; the series is IPB)
    expect(r.min!.sigma).toBeCloseTo(beam.results[1].pick!.sigma, 6);
    expect(r.T).toBeCloseTo(c.N, 2);
    expect(r.A).toBeCloseTo(c.areaReq, 6);
    expect(r.d).toBeCloseTo(c.dReq, 6);
    expect(r.elongation).toBeCloseTo(c.elongation, 4);
  });

  test("truss-cable-beam-ipb260-kg: the given IPB 260 fails; the lightest IPB; cable T = 20 463 — the app's own numbers", () => {
    const checks = checksOf("Truss + Cable + Beam IPB 260");
    const c = cableOf(checks);
    const beam = (checks as VerifyCheck[]).find((x) => x.kind === "verify" && x.member === "FG")!;
    const r = cableBeam({ L: 10, Lc: 15, P: 20000, a: 5, q: 2000, given: 260 });
    expect(r.Mmax).toBeCloseTo(beam.demand.M, 0); // 75 000 kg·m (the load alone)
    expect(r.given!.sigma).toBeCloseTo(beam.sigma, 6);
    expect(r.given!.ok).toBe(beam.ok);
    expect(r.given!.ok).toBe(false);
    expect(r.min!.name).toBe(beam.suggestion!.profile.name);
    expect(r.T).toBeCloseTo(c.N, 2); // with the weight of the GIVEN profile
    expect(r.d).toBeCloseTo(c.dReq, 6);
    expect(r.elongation).toBeCloseTo(c.elongation, 4);
    expect(c.N).toBeCloseTo(20463, -1);
  });

  test("the maximum moment, whatever the load: point only, q only, point + q (zero shear on either side), compared with a fine scan", () => {
    const scan = (L: number, P: number, a: number, q: number) => {
      const R = (P * (L - a)) / L + (q * L) / 2;
      let m = 0;
      const at = (x: number) => (m = Math.max(m, R * x - (q * x * x) / 2 - (x > a ? P * (x - a) : 0)));
      for (let k = 0; k <= 20000; k++) at((k / 20000) * L);
      at(a); // the corner under the point load, which a grid can miss
      return m;
    };
    for (const [L, P, a, q] of [[12, 40000, 6, 0], [10, 0, 5, 2000], [10, 20000, 5, 2000], [8, 1000, 1, 3000], [8, 1000, 7, 3000], [6, 50000, 2, 100]] as const)
      expect(cableBeam({ L, Lc: 1, P, a, q }).Mmax).toBeCloseTo(scan(L, P, a, q), 0);
  });

  test("running the listing: both examples, typed as on the calculator", () => {
    // truss-cable-beam-kg: L 12, cable 4.33 m, P 40 000 at 6 m, q 0, σ_adm default, no given profile
    const a = runBasic(VIGACAB_LINES, [12, 4.33013, 40000, 6, 0, 0, 0]);
    const ra = cableBeam({ L: 12, Lc: 4.33013, P: 40000, a: 6, q: 0 });
    expect(a).toEqual([
      "M MAX KG M", expect.closeTo(ra.Mmax, 6), "SX NEC CM3", expect.closeTo(ra.sxReq, 6),
      "IPB MIN", 800, "SIGMA CON IPB MIN", expect.closeTo(ra.min!.sigma, 6),
      "TENSION CABLE KG", expect.closeTo(ra.T, 6), "A CABLE CM2", expect.closeTo(ra.A, 6),
      "D CABLE CM", expect.closeTo(ra.d, 6), "ALARG CABLE CM", expect.closeTo(ra.elongation, 6),
      "V PIN KG", expect.closeTo(ra.vPin, 6),
    ]);
    // truss-cable-beam-ipb260-kg with the given IPB 260 (it does not pass) and σ_adm typed
    const b = runBasic(VIGACAB_LINES, [10, 15, 20000, 5, 2000, 1600, 260]);
    const rb = cableBeam({ L: 10, Lc: 15, P: 20000, a: 5, q: 2000, sigmaAdm: 1600, given: 260 });
    expect(b).toEqual([
      "M MAX KG M", expect.closeTo(rb.Mmax, 6), "SX NEC CM3", expect.closeTo(rb.sxReq, 6),
      "IPB MIN", 550, "SIGMA CON IPB MIN", expect.closeTo(rb.min!.sigma, 6),
      "SIGMA IPB DADO", expect.closeTo(rb.given!.sigma, 6), "CUMPLE 1=SI 0=NO", 0,
      "TENSION CABLE KG", expect.closeTo(rb.T, 6), "A CABLE CM2", expect.closeTo(rb.A, 6),
      "D CABLE CM", expect.closeTo(rb.d, 6), "ALARG CABLE CM", expect.closeTo(rb.elongation, 6),
      "V PIN KG", expect.closeTo(rb.vPin, 6),
    ]);
  });

  test("running the listing: a given profile that passes, an unknown one, and a load no IPB can carry", () => {
    const ok = runBasic(VIGACAB_LINES, [10, 15, 20000, 5, 2000, 1600, 600]); // IPB 600 passes (5 700 cm³ ≥ 4 688)
    expect(ok.slice(8, 12)).toEqual(["SIGMA IPB DADO", expect.any(Number), "CUMPLE 1=SI 0=NO", 1]);
    expect(runBasic(VIGACAB_LINES, [10, 15, 20000, 5, 2000, 1600, 123])).toContain("IPB DADO NO ESTA");
    const none = runBasic(VIGACAB_LINES, [12, 5, 4e6, 6, 0, 1600, 0]);
    expect(none).toContain("NINGUN IPB HASTA 1000");
    expect(none).not.toContain("IPB MIN");
    expect(cableBeam({ L: 12, Lc: 5, P: 4e6, a: 6, q: 0 }).min).toBeNull();
  });
});
