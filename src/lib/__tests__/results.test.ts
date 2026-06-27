import { clean, equilibrium, peak, TOL } from "../results";
import { solveModel } from "../solve";
import { FrameModel } from "../types";
import { Station } from "../sampling";

const mat = { E: 2.1e8, A: 0.01, I: 8.3e-5 };

function st(x: number, Q: number, M: number): Station {
  return { x, N: 0, Q, M };
}

// ─── peak(): station maximising |Q| / |M|, sign preserved ──────────────────
describe("peak", () => {
  const stations = [st(0, 5, 0), st(1, -8, 3), st(2, 2, -10)];

  test("returns the station with the largest |Q| (signed)", () => {
    expect(peak(stations, "Q")).toEqual(st(1, -8, 3));
  });
  test("returns the station with the largest |M| (signed)", () => {
    expect(peak(stations, "M")).toEqual(st(2, 2, -10));
  });
  test("returns null for an empty array", () => {
    expect(peak([], "Q")).toBeNull();
  });
  test("ties keep the first occurrence", () => {
    const tied = [st(0, 7, 0), st(1, -7, 0)];
    expect(peak(tied, "Q")).toEqual(st(0, 7, 0));
  });
});

// ─── clean(): snap near-zero noise to 0 at the TOL threshold ────────────────
describe("clean", () => {
  test("values below TOL snap to 0", () => {
    expect(clean(0.009)).toBe(0);
    expect(clean(-0.001)).toBe(0);
  });
  test("values at or above TOL pass through unchanged", () => {
    expect(clean(0.011)).toBe(0.011);
    expect(clean(-12.5)).toBe(-12.5);
    expect(clean(TOL)).toBe(TOL); // boundary is exclusive (|v| < TOL)
  });
});

// ─── equilibrium(): ΣF and ΣM of applied loads + reactions ≈ 0 ──────────────
describe("equilibrium", () => {
  const balanced = (model: FrameModel) => {
    const solved = solveModel(model);
    const eq = equilibrium(model, solved);
    expect(Math.abs(eq.fx)).toBeLessThan(1e-6);
    expect(Math.abs(eq.fy)).toBeLessThan(1e-6);
    expect(Math.abs(eq.m)).toBeLessThan(1e-6);
  };

  test("simply supported beam under a UDL (member load branch)", () => {
    balanced({
      nodes: [
        { id: "a", x: 0, y: 0, support: "pinned" },
        { id: "b", x: 10, y: 0, support: "roller-v" },
      ],
      members: [{ id: "m1", n1: "a", n2: "b" }],
      loads: [{ id: "l1", type: "mudl", member: "m1", gx: 0, gy: -10 }],
      material: mat,
      unit: "kN",
    });
  });

  test("beam with an off-centre member point load (mpoint geometry)", () => {
    balanced({
      nodes: [
        { id: "a", x: 0, y: 0, support: "pinned" },
        { id: "b", x: 8, y: 0, support: "roller-v" },
      ],
      members: [{ id: "m1", n1: "a", n2: "b" }],
      loads: [{ id: "l1", type: "mpoint", member: "m1", dist: 3, gx: 0, gy: -20 }],
      material: mat,
      unit: "kN",
    });
  });

  test("portal with combined nodal + member loads", () => {
    balanced({
      nodes: [
        { id: "a", x: 0, y: 0, support: "fixed" },
        { id: "b", x: 0, y: 4, support: "free" },
        { id: "c", x: 6, y: 4, support: "free" },
        { id: "d", x: 6, y: 0, support: "fixed" },
      ],
      members: [
        { id: "m1", n1: "a", n2: "b" },
        { id: "m2", n1: "b", n2: "c" },
        { id: "m3", n1: "c", n2: "d" },
      ],
      loads: [
        { id: "l1", type: "nodal", node: "b", fx: 15, fy: 0, m: 0 },
        { id: "l2", type: "mudl", member: "m2", gx: 0, gy: -10 },
        { id: "l3", type: "mpoint", member: "m3", dist: 2, gx: 5, gy: 0 },
      ],
      material: mat,
      unit: "kN",
    });
  });
});
