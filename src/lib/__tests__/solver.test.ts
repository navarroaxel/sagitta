import { solveFrame, SolverModel } from "../solver";
import { sampleMember } from "../sampling";

const E = 2.1e8,
  A = 0.01,
  I = 8.3e-5;
const mat = { E, A, I };
const tol = 1e-3; // relative tolerance helper

function near(a: number, b: number, t = tol): boolean {
  if (Math.abs(b) < 1e-10) return Math.abs(a) < 1e-6;
  return Math.abs(a - b) / Math.abs(b) < t;
}

// ─── Test 1: Simply supported beam, span 10, UDL w=10 down ─────────────────
describe("Test 1 – simply supported beam, UDL", () => {
  const model: SolverModel = {
    nodes: [
      { x: 0, y: 0, support: "pinned" },
      { x: 10, y: 0, support: "roller-v" },
    ],
    members: [{ i: 0, j: 1, ...mat }],
    loads: [{ type: "mudl", member: 0, gx: 0, gy: -10 }],
  };
  const res = solveFrame(model);
  const st = sampleMember(model, res, 0, 64);

  test("stable", () => expect(res.stable).toBe(true));
  test("R0.ry = 50", () => expect(near(res.reactions[0].ry, 50)).toBe(true));
  test("R1.ry = 50", () => expect(near(res.reactions[1].ry, 50)).toBe(true));
  test("R0.rx = 0", () =>
    expect(Math.abs(res.reactions[0].rx)).toBeLessThan(1e-6));

  test("mid-span M ≈ 125 (wL²/8)", () => {
    const mid = st.reduce((best, s) =>
      Math.abs(s.x - 5) < Math.abs(best.x - 5) ? s : best,
    );
    expect(near(mid.M, 125, 0.01)).toBe(true);
  });
  test("end M ≈ 0 at x=0", () => expect(Math.abs(st[0].M)).toBeLessThan(0.5));
  test("end M ≈ 0 at x=L", () =>
    expect(Math.abs(st[st.length - 1].M)).toBeLessThan(0.5));
  test("Q at left end ≈ +50", () => expect(near(st[0].Q, 50, 0.01)).toBe(true));
  test("Q at right end ≈ -50", () =>
    expect(near(st[st.length - 1].Q, -50, 0.01)).toBe(true));
});

// ─── Test 2: Cantilever, span 5, point load P=20 down at tip ───────────────
describe("Test 2 – cantilever, point load at tip", () => {
  const model: SolverModel = {
    nodes: [
      { x: 0, y: 0, support: "fixed" },
      { x: 5, y: 0, support: "free" },
    ],
    members: [{ i: 0, j: 1, ...mat }],
    loads: [{ type: "nodal", node: 1, fx: 0, fy: -20, m: 0 }],
  };
  const res = solveFrame(model);
  const st = sampleMember(model, res, 0, 64);

  test("stable", () => expect(res.stable).toBe(true));
  test("R0.ry = 20", () => expect(near(res.reactions[0].ry, 20)).toBe(true));
  test("|R0.rm| = 100", () =>
    expect(near(Math.abs(res.reactions[0].rm), 100)).toBe(true));
  test("|M| at support ≈ 100", () =>
    expect(near(Math.abs(st[0].M), 100)).toBe(true));
  test("M at tip ≈ 0", () =>
    expect(Math.abs(st[st.length - 1].M)).toBeLessThan(0.5));
  test("Q constant along span", () => {
    const qs = st.map((s) => s.Q);
    const range = Math.max(...qs) - Math.min(...qs);
    expect(range).toBeLessThan(0.1);
  });
});

// ─── Test 3: Cantilever, span 4, UDL w=6 down ──────────────────────────────
describe("Test 3 – cantilever, UDL", () => {
  const model: SolverModel = {
    nodes: [
      { x: 0, y: 0, support: "fixed" },
      { x: 4, y: 0, support: "free" },
    ],
    members: [{ i: 0, j: 1, ...mat }],
    loads: [{ type: "mudl", member: 0, gx: 0, gy: -6 }],
  };
  const res = solveFrame(model);
  const st = sampleMember(model, res, 0, 64);

  test("stable", () => expect(res.stable).toBe(true));
  test("R0.ry = 24 (=wL)", () =>
    expect(near(res.reactions[0].ry, 24)).toBe(true));
  test("|R0.rm| = 48 (=wL²/2)", () =>
    expect(near(Math.abs(res.reactions[0].rm), 48)).toBe(true));
  test("|M| at support ≈ 48", () =>
    expect(near(Math.abs(st[0].M), 48)).toBe(true));
  test("M at tip ≈ 0", () =>
    expect(Math.abs(st[st.length - 1].M)).toBeLessThan(0.1));
});

// ─── Test 4: Moment release ─────────────────────────────────────────────────
describe("Test 4 – moment release (hinge)", () => {
  // Two-span beam: supports at x=0,5,10; second member hinged at start (relI)
  // UDL on the second span
  const model: SolverModel = {
    nodes: [
      { x: 0, y: 0, support: "pinned" },
      { x: 5, y: 0, support: "pinned" },
      { x: 10, y: 0, support: "roller-v" },
    ],
    members: [
      { i: 0, j: 1, ...mat },
      { i: 1, j: 2, ...mat, relI: true }, // hinge at start (n1 end = node 1)
    ],
    loads: [{ type: "mudl", member: 1, gx: 0, gy: -8 }],
  };
  const res = solveFrame(model);
  const st1 = sampleMember(model, res, 1, 64);

  test("stable", () => expect(res.stable).toBe(true));
  test("M at released end ≈ 0", () =>
    expect(Math.abs(st1[0].M)).toBeLessThan(0.5));
});

// ─── Test 5: Compound two-bay portal frame ──────────────────────────────────
describe("Test 5 – compound two-bay portal frame", () => {
  // Nodes: A(0,0,roller-v), TL(0,6,free), B(10,0,pinned), H(10,3,free),
  //        TM(10,6,free), C(16,0,roller-v), TR(16,3,free)
  const nodeIndex: Record<string, number> = {
    A: 0,
    TL: 1,
    B: 2,
    H: 3,
    TM: 4,
    C: 5,
    TR: 6,
  };
  const model: SolverModel = {
    nodes: [
      { x: 0, y: 0, support: "roller-v" }, // A
      { x: 0, y: 6, support: "free" }, // TL
      { x: 10, y: 0, support: "pinned" }, // B
      { x: 10, y: 3, support: "free" }, // H
      { x: 10, y: 6, support: "free" }, // TM
      { x: 16, y: 0, support: "roller-v" }, // C
      { x: 16, y: 3, support: "free" }, // TR
    ],
    members: [
      { i: nodeIndex.A, j: nodeIndex.TL, ...mat }, // 0: A-TL
      { i: nodeIndex.TL, j: nodeIndex.TM, ...mat }, // 1: TL-TM
      { i: nodeIndex.TM, j: nodeIndex.H, ...mat }, // 2: TM-H
      { i: nodeIndex.H, j: nodeIndex.B, ...mat }, // 3: H-B
      { i: nodeIndex.H, j: nodeIndex.TR, ...mat, relI: true }, // 4: H-TR, hinge at H
      { i: nodeIndex.TR, j: nodeIndex.C, ...mat }, // 5: TR-C
    ],
    loads: [
      // Point loads on TL-TM (member 1) at x=3,5,7 (down)
      { type: "mpoint", member: 1, dist: 3, gx: 0, gy: -8 },
      { type: "mpoint", member: 1, dist: 5, gx: 0, gy: -15 },
      { type: "mpoint", member: 1, dist: 7, gx: 0, gy: -10 },
      // Point load on A-TL (member 0) at 3m up, global +x
      { type: "mpoint", member: 0, dist: 3, gx: 7, gy: 0 },
      // UDL q=10 down on H-TR (member 4)
      { type: "mudl", member: 4, gx: 0, gy: -10 },
      // Nodal load at C (node 5), global +x
      { type: "nodal", node: nodeIndex.C, fx: 7, fy: 0, m: 0 },
    ],
  };
  const res = solveFrame(model);

  test("solver stable", () => expect(res.stable).toBe(true));

  // Global equilibrium
  // Applied: 3 point loads on TL-TM + UDL on H-TR; H(10,3)->TR(16,3): L=6
  const totalAppliedFx = 7 + 7; // lateral point load on A-TL + nodal at C
  // UDL on H-TR: gx=0, gy=-10 * L(H-TR)
  // H(10,3)->TR(16,3): L=6, so total transverse = -10*6 = -60
  const totalAppliedFy = -8 - 15 - 10 + -10 * 6;

  const sumRx = res.reactions.reduce((s, r) => s + r.rx, 0);
  const sumRy = res.reactions.reduce((s, r) => s + r.ry, 0);

  test("ΣFx = 0 (applied + reactions)", () =>
    expect(Math.abs(sumRx + totalAppliedFx)).toBeLessThan(0.1));
  test("ΣFy = 0 (applied + reactions)", () =>
    expect(Math.abs(sumRy + totalAppliedFy)).toBeLessThan(0.5));

  // ΣM about origin = 0
  // Reaction moments: A(0,0)->rx=0,ry=RA_ry; B(10,0)->rx,ry; C(16,0)->ry
  // Applied moment about origin:
  //   - point loads on TL-TM at global positions: TL=(0,6), member 1 goes TL->TM=(10,6)
  //     axis direction: (10,0)/10 = (1,0). a=3,5,7 along, so positions (3,6),(5,6),(7,6)
  //     fy=-8,-15,-10 => moments about O: 8*3,15*5,10*7 (x-dist, fy is downward)
  //     Actually M = r x F: for fy at (x,y): M = x*fy - y*fx
  //     P at (3,6): m = 3*(-8) - 6*0 = -24
  //     P at (5,6): m = 5*(-15) = -75
  //     P at (7,6): m = 7*(-10) = -70
  //   - lateral point on A-TL at 3m up from A(0,0): A-TL is vertical (0,6), a=3 => pos (0,3)
  //     gx=7, gy=0: m = 0*0 - 3*7 = -21 (wait, M = x*Fy - y*Fx = 0*0 - 3*7 = -21)
  //   - nodal at C(16,0): fx=7 => m = 16*0 - 0*7 = 0
  //   - UDL on H-TR: H(10,3)->TR(16,3), uniform gy=-10 over L=6: resultant at centroid (13,3)
  //     m = 13*(-60) - 3*0 = -780
  // Reactions about origin:
  //   A(0,0): ry*0 + rx: but roller-v means only ry, rx=0, rm=0. So M_A = 0*ry_A - 0*rx_A = 0
  //   B(10,0): pinned: M_B = 10*ry_B - 0*rx_B = 10*ry_B + 0 (wait, cross product: x*Fy - y*Fx)
  //            = 10*ry_B - 0*rx_B = 10*ry_B
  //   C(16,0): roller-v: M_C = 16*ry_C

  const sumM_reactions =
    0 * res.reactions[0].ry + // A at (0,0): x*ry - y*rx = 0
    (10 * res.reactions[2].ry - 0 * res.reactions[2].rx) + // B at (10,0)
    16 * res.reactions[5].ry; // C at (16,0): x*ry

  const sumM_applied =
    3 * -8 +
    5 * -15 +
    7 * -10 + // point loads on TL-TM
    (0 * 0 - 3 * 7) + // lateral on A-TL at (0,3)
    (0 * 0 - 0 * 7) + // nodal at C(16,0): x*fy - y*fx = 16*0 - 0*7 = 0
    13 * -60; // UDL resultant on H-TR

  test("ΣM about origin ≈ 0", () =>
    expect(Math.abs(sumM_reactions + sumM_applied)).toBeLessThan(2));

  // Hinge end moment ≈ 0 (member 4, i-end is H)
  const st4 = sampleMember(model, res, 4, 64);
  test("hinge end M ≈ 0", () => expect(Math.abs(st4[0].M)).toBeLessThan(0.5));

  // Per-member local equilibrium on UDL member (member 4: H-TR, L=6)
  const fl4 = res.memForces[4];
  const g4 = res.geo[4];
  // local transverse: qy in local = gx*(-s)+gy*c = 0*(-0)+(-10)*1 = -10 (H-TR horizontal)
  const qy4 = -0 * g4.s + -10 * g4.c; // local transverse component of UDL
  const L4 = g4.L; // should be 6
  // Hy1 + Hy2 + qy*L = 0 (local y equilibrium)
  test("local Hy equilibrium on UDL member", () =>
    expect(Math.abs(fl4[1] + fl4[4] + qy4 * L4)).toBeLessThan(0.5));
  // Hx1 + Hx2 = 0 (local x equilibrium, no axial UDL since gx=0 and member is horizontal)
  test("local Hx equilibrium on UDL member", () =>
    expect(Math.abs(fl4[0] + fl4[3])).toBeLessThan(0.5));

  // Expected reactions (approximate)
  test("R_A.ry ≈ 11.90", () =>
    expect(near(res.reactions[0].ry, 11.9, 0.05)).toBe(true));
  test("R_B.rx ≈ -14.00", () =>
    expect(near(res.reactions[2].rx, -14.0, 0.05)).toBe(true));
  test("R_B.ry ≈ 54.60", () =>
    expect(near(res.reactions[2].ry, 54.6, 0.05)).toBe(true));
  test("R_C.ry ≈ 26.50", () =>
    expect(near(res.reactions[5].ry, 26.5, 0.05)).toBe(true));
});
