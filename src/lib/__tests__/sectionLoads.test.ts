import { sectionLoads } from "../sectionLoads";
import { nearestStation } from "../sectionCut";
import { solveModel3D } from "../solve3d";
import { PRESETS_3D } from "../presets3d";

const near = (a: number, b: number, tol = 1e-6) =>
  expect(Math.abs(a - b)).toBeLessThan(tol * Math.max(1, Math.abs(b)));

describe("sectionLoads", () => {
  const model = PRESETS_3D.find((p) => p.key === "frame_overhang")!.model;
  const solved = solveModel3D(model)!;
  const at = (z: number) => sectionLoads(model, solved, 0, nearestStation(solved, 0, z));

  test("column M1: the distributed load q_x and the support reaction at A, in the section's axes", () => {
    const loads = at(4);
    const q = loads.find((l) => l.kind === "q")!;
    const R = loads.find((l) => l.kind === "R")!;
    // |q| = 400 kg/m along global X, the section's y (column: y to the right = +X) — in-plane only
    near(Math.hypot(...q.force), 400);
    near(q.force[2], 0);
    expect(R.id).toBe("A");
    // |R| components: Rx = 800 (in-plane), Ry = 100, Rz = 800 (axial); moments 500 / 800 kg·m
    near(Math.hypot(R.force[0], R.force[1]), Math.hypot(800, 100));
    near(Math.abs(R.force[2]), 800);
    near(Math.hypot(...R.moment!), Math.hypot(500, 800));
  });

  test("only the loads of the free body (z < cut) are listed: the reaction at A only shows at the base", () => {
    // the column's z runs down from B (z = 0) to A (z = 4 m)
    expect(at(4).some((l) => l.kind === "R")).toBe(true);
    expect(at(3.9).some((l) => l.kind === "R")).toBe(false);
    expect(at(0).some((l) => l.kind === "R")).toBe(false);
  });

  test("q (lower 2 m of the column = z from 2 to 4) shows from z = 2 down, not above", () => {
    expect(at(4).some((l) => l.kind === "q")).toBe(true);
    expect(at(3).some((l) => l.kind === "q")).toBe(true);
    expect(at(1.5).some((l) => l.kind === "q")).toBe(false);
  });

  test("a member without loads or supports has none", () => {
    expect(sectionLoads(model, solved, 2, 0)).toEqual([]);
  });
});
