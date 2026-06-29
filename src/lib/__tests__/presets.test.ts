import { equilibrium } from "../results";
import { solveModel } from "../solve";
import { PRESETS } from "../presets";
import { FrameModel } from "../types";

function getPreset(name: string): FrameModel {
  const p = PRESETS.find((p) => p.name === name);
  if (!p) throw new Error(`Preset not found: "${name}"`);
  return p.model;
}

const EQ = 0.1; // equilibrium residual tolerance (kN / kN·m)
const M0 = 0.5; // hinge-moment tolerance (kN·m)

// ─── r2: pure truss — every member pinned-pinned → M = 0 everywhere ─────────
describe("Preset regression – r2 pure truss", () => {
  const model = getPreset("Simple Truss");
  const solved = solveModel(model);
  const eq = equilibrium(model, solved);

  test("stable", () => expect(solved.result.stable).toBe(true));

  test("M = 0 for every station (all members pinned-pinned)", () => {
    for (const ms of solved.stations) {
      for (const s of ms) expect(Math.abs(s.M)).toBeLessThan(1e-3);
    }
  });

  test("ΣFx = 0", () => expect(Math.abs(eq.fx)).toBeLessThan(EQ));
  test("ΣFy = 0", () => expect(Math.abs(eq.fy)).toBeLessThan(EQ));
  test("ΣM = 0", () => expect(Math.abs(eq.m)).toBeLessThan(1));
});

// ─── symmetric truss — pure truss, equilibrium, symmetric reactions ──────────
describe("Preset regression – symmetric truss", () => {
  const model = getPreset("Symmetric Truss");
  const solved = solveModel(model);
  const { result, stations, nodeIndex } = solved;
  const eq = equilibrium(model, solved);

  test("stable", () => expect(solved.result.stable).toBe(true));

  test("M = 0 for every station (all members pinned-pinned)", () => {
    for (const ms of stations) {
      for (const s of ms) expect(Math.abs(s.M)).toBeLessThan(1e-3);
    }
  });

  test("ΣFx = 0", () => expect(Math.abs(eq.fx)).toBeLessThan(EQ));
  test("ΣFy = 0", () => expect(Math.abs(eq.fy)).toBeLessThan(EQ));
  test("ΣM = 0", () => expect(Math.abs(eq.m)).toBeLessThan(1));

  test("symmetric reactions V_A = V_B = 75 T", () => {
    const ry_A = result.reactions[nodeIndex.get("A")!].ry;
    const ry_B = result.reactions[nodeIndex.get("B")!].ry;
    expect(Math.abs(ry_A - 75)).toBeLessThan(0.1);
    expect(Math.abs(ry_B - 75)).toBeLessThan(0.1);
  });
});

// ─── three-hinged frame — crown hinge M ≈ 0, symmetric reactions ────────────
describe("Preset regression – three-hinged frame", () => {
  const model = getPreset("Three-Hinged Frame");
  const solved = solveModel(model);
  const { result, stations, memberIndex, nodeIndex } = solved;
  const eq = equilibrium(model, solved);

  test("stable", () => expect(result.stable).toBe(true));
  test("ΣFx = 0", () => expect(Math.abs(eq.fx)).toBeLessThan(EQ));
  test("ΣFy = 0", () => expect(Math.abs(eq.fy)).toBeLessThan(EQ));
  test("ΣM = 0", () => expect(Math.abs(eq.m)).toBeLessThan(1));

  // left: A→B with relJ=true → hinge at B (j-end)
  test("crown hinge M ≈ 0 (left member j-end)", () => {
    const st = stations[memberIndex.get("left")!];
    expect(Math.abs(st[st.length - 1].M)).toBeLessThan(M0);
  });

  // right: B→C with relI=true → hinge at B (i-end)
  test("crown hinge M ≈ 0 (right member i-end)", () => {
    const st = stations[memberIndex.get("right")!];
    expect(Math.abs(st[0].M)).toBeLessThan(M0);
  });

  // symmetric geometry + symmetric UDL → equal vertical reactions at A and C
  test("ry_A ≈ ry_C (symmetric loading)", () => {
    const ry_A = result.reactions[nodeIndex.get("A")!].ry;
    const ry_C = result.reactions[nodeIndex.get("C")!].ry;
    expect(Math.abs(ry_A - ry_C)).toBeLessThan(M0);
  });
});

// ─── r3: portal frame with internal hinge at A12 ────────────────────────────
describe("Preset regression – r3 portal frame with internal hinge", () => {
  const model = getPreset("Portal Frame w/ Hinge");
  const solved = solveModel(model);
  const { result, stations, memberIndex } = solved;
  const eq = equilibrium(model, solved);

  test("stable", () => expect(result.stable).toBe(true));
  test("ΣFx = 0", () => expect(Math.abs(eq.fx)).toBeLessThan(EQ));
  test("ΣFy = 0", () => expect(Math.abs(eq.fy)).toBeLessThan(EQ));
  test("ΣM = 0", () => expect(Math.abs(eq.m)).toBeLessThan(1));

  // roofL: C→A12 with relJ=true → hinge at A12 (j-end)
  test("internal hinge M ≈ 0 (roofL j-end)", () => {
    const st = stations[memberIndex.get("roofL")!];
    expect(Math.abs(st[st.length - 1].M)).toBeLessThan(M0);
  });

  // roofR: A12→D with relI=true → hinge at A12 (i-end)
  test("internal hinge M ≈ 0 (roofR i-end)", () => {
    const st = stations[memberIndex.get("roofR")!];
    expect(Math.abs(st[0].M)).toBeLessThan(M0);
  });
});

// ─── r1: frame + truss — truss members M ≈ 0, equilibrium ───────────────────
describe("Preset regression – r1 frame + truss", () => {
  const model = getPreset("Portico + Reticulado");
  const solved = solveModel(model);
  const { result, stations, memberIndex } = solved;
  const eq = equilibrium(model, solved);

  const trussIds = ["b1","b2","b3","b4","b5","b6","b7","b8","b9","b10","b11"];

  test("stable", () => expect(result.stable).toBe(true));
  test("ΣFx = 0", () => expect(Math.abs(eq.fx)).toBeLessThan(EQ));
  test("ΣFy = 0", () => expect(Math.abs(eq.fy)).toBeLessThan(EQ));
  test("ΣM = 0", () => expect(Math.abs(eq.m)).toBeLessThan(2));

  test("M = 0 for all truss member stations (pinned-pinned)", () => {
    for (const id of trussIds) {
      const mi = memberIndex.get(id)!;
      for (const s of stations[mi]) {
        expect(Math.abs(s.M)).toBeLessThan(1e-3);
      }
    }
  });

  // beam member T→A12 has relJ=true → hinge at A12 end
  test("frame-truss connection hinge M ≈ 0 (beam j-end)", () => {
    const st = stations[memberIndex.get("beam")!];
    expect(Math.abs(st[st.length - 1].M)).toBeLessThan(M0);
  });
});

// ─── r4: wall-mounted parallel-chord truss (pure truss) ─────────────────────
describe("Preset regression – r4 wall truss", () => {
  const model = getPreset("Wall Truss");
  const solved = solveModel(model);
  const eq = equilibrium(model, solved);

  test("stable", () => expect(solved.result.stable).toBe(true));

  test("M = 0 for every station (all members pinned-pinned)", () => {
    for (const ms of solved.stations) {
      for (const s of ms) expect(Math.abs(s.M)).toBeLessThan(1e-3);
    }
  });

  test("ΣFx = 0", () => expect(Math.abs(eq.fx)).toBeLessThan(EQ));
  test("ΣFy = 0", () => expect(Math.abs(eq.fy)).toBeLessThan(EQ));
  test("ΣM = 0", () => expect(Math.abs(eq.m)).toBeLessThan(1));
});

// ─── r5: parallel-chord truss with cantilever overhang (pure truss) ─────────
describe("Preset regression – r5 cantilever truss", () => {
  const model = getPreset("Cantilever Truss");
  const solved = solveModel(model);
  const eq = equilibrium(model, solved);

  test("stable", () => expect(solved.result.stable).toBe(true));

  test("M = 0 for every station (all members pinned-pinned)", () => {
    for (const ms of solved.stations) {
      for (const s of ms) expect(Math.abs(s.M)).toBeLessThan(1e-3);
    }
  });

  test("ΣFx = 0", () => expect(Math.abs(eq.fx)).toBeLessThan(EQ));
  test("ΣFy = 0", () => expect(Math.abs(eq.fy)).toBeLessThan(EQ));
  test("ΣM = 0", () => expect(Math.abs(eq.m)).toBeLessThan(1));
});

// ─── r6: two-panel stacked tower truss (pure truss) ─────────────────────────
describe("Preset regression – r6 tower truss", () => {
  const model = getPreset("Tower Truss");
  const solved = solveModel(model);
  const eq = equilibrium(model, solved);

  test("stable", () => expect(solved.result.stable).toBe(true));

  test("M = 0 for every station (all members pinned-pinned)", () => {
    for (const ms of solved.stations) {
      for (const s of ms) expect(Math.abs(s.M)).toBeLessThan(1e-3);
    }
  });

  test("ΣFx = 0", () => expect(Math.abs(eq.fx)).toBeLessThan(EQ));
  test("ΣFy = 0", () => expect(Math.abs(eq.fy)).toBeLessThan(EQ));
  test("ΣM = 0", () => expect(Math.abs(eq.m)).toBeLessThan(1));
});

// ─── r7: triangular cantilever bracket truss (pure truss) ───────────────────
describe("Preset regression – r7 triangular truss", () => {
  const model = getPreset("Triangular Truss");
  const solved = solveModel(model);
  const eq = equilibrium(model, solved);

  test("stable", () => expect(solved.result.stable).toBe(true));

  test("M = 0 for every station (all members pinned-pinned)", () => {
    for (const ms of solved.stations) {
      for (const s of ms) expect(Math.abs(s.M)).toBeLessThan(1e-3);
    }
  });

  test("ΣFx = 0", () => expect(Math.abs(eq.fx)).toBeLessThan(EQ));
  test("ΣFy = 0", () => expect(Math.abs(eq.fy)).toBeLessThan(EQ));
  test("ΣM = 0", () => expect(Math.abs(eq.m)).toBeLessThan(1));
});

// ─── L-frame: Gerber beam with internal hinge at A12 ────────────────────────
describe("Preset regression – L-frame w/ hinge", () => {
  const model = getPreset("L-Frame w/ Hinge");
  const solved = solveModel(model);
  const { result, stations, memberIndex, nodeIndex } = solved;
  const eq = equilibrium(model, solved);

  test("stable", () => expect(result.stable).toBe(true));
  test("ΣFx = 0", () => expect(Math.abs(eq.fx)).toBeLessThan(EQ));
  test("ΣFy = 0", () => expect(Math.abs(eq.fy)).toBeLessThan(EQ));
  test("ΣM = 0", () => expect(Math.abs(eq.m)).toBeLessThan(1));

  // beamB: B→A12 with relJ=true → hinge at A12 (j-end)
  test("internal hinge M ≈ 0 (beamB j-end)", () => {
    const st = stations[memberIndex.get("beamB")!];
    expect(Math.abs(st[st.length - 1].M)).toBeLessThan(M0);
  });
  // beamC: A12→C with relI=true → hinge at A12 (i-end)
  test("internal hinge M ≈ 0 (beamC i-end)", () => {
    const st = stations[memberIndex.get("beamC")!];
    expect(Math.abs(st[0].M)).toBeLessThan(M0);
  });

  test("reactions: H_A=3←, V_A=16.20↓, V_B=29.2↑, V_C=5↑", () => {
    const rA = result.reactions[nodeIndex.get("A")!];
    const rB = result.reactions[nodeIndex.get("B")!];
    const rC = result.reactions[nodeIndex.get("C")!];
    expect(Math.abs(rA.rx - -3)).toBeLessThan(0.1);
    expect(Math.abs(rA.ry - -16.2)).toBeLessThan(0.1);
    expect(Math.abs(rB.ry - 29.2)).toBeLessThan(0.1);
    expect(Math.abs(rC.ry - 5)).toBeLessThan(0.1);
  });
});

// ─── L-frame: cantilever roof / overhang, all rigid joints ──────────────────
describe("Preset regression – L-frame w/ overhang", () => {
  const model = getPreset("L-Frame w/ Overhang");
  const solved = solveModel(model);
  const { result, nodeIndex } = solved;
  const eq = equilibrium(model, solved);

  test("stable", () => expect(result.stable).toBe(true));
  test("ΣFx = 0", () => expect(Math.abs(eq.fx)).toBeLessThan(EQ));
  test("ΣFy = 0", () => expect(Math.abs(eq.fy)).toBeLessThan(EQ));
  test("ΣM = 0", () => expect(Math.abs(eq.m)).toBeLessThan(1));

  test("reactions: H_A=2→, V_A=12.60↑, V_B=1.40↑", () => {
    const rA = result.reactions[nodeIndex.get("A")!];
    const rB = result.reactions[nodeIndex.get("B")!];
    expect(Math.abs(rA.rx - 2)).toBeLessThan(0.1);
    expect(Math.abs(rA.ry - 12.6)).toBeLessThan(0.1);
    expect(Math.abs(rB.ry - 1.4)).toBeLessThan(0.1);
  });
});

// ─── two-column portal frame (roller + pinned, all rigid joints) ────────────
describe("Preset regression – two-column portal", () => {
  const model = getPreset("Two-Column Portal");
  const solved = solveModel(model);
  const { result, nodeIndex } = solved;
  const eq = equilibrium(model, solved);

  test("stable", () => expect(result.stable).toBe(true));
  test("ΣFx = 0", () => expect(Math.abs(eq.fx)).toBeLessThan(EQ));
  test("ΣFy = 0", () => expect(Math.abs(eq.fy)).toBeLessThan(EQ));
  test("ΣM = 0", () => expect(Math.abs(eq.m)).toBeLessThan(1));

  test("reactions: V_A=6.80↑, V_B=17.20↑, H_B=4←", () => {
    const rA = result.reactions[nodeIndex.get("A")!];
    const rB = result.reactions[nodeIndex.get("B")!];
    expect(Math.abs(rA.ry - 6.8)).toBeLessThan(0.1);
    expect(Math.abs(rB.ry - 17.2)).toBeLessThan(0.1);
    expect(Math.abs(rB.rx - -4)).toBeLessThan(0.1);
  });
});
