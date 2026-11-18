import { sectionLoads } from "../sectionLoads";
import { nearestStation } from "../sectionCut";
import { solveModel3D } from "../solve3d";
import { PRESETS_3D } from "../presets3d";

const near = (a: number, b: number, tol = 1e-6) =>
  expect(Math.abs(a - b)).toBeLessThan(tol * Math.max(1, Math.abs(b)));

describe("sectionLoads", () => {
  const model = PRESETS_3D.find((p) => p.key === "frame_overhang")!.model;
  const solved = solveModel3D(model)!;
  const at = (z: number) =>
    sectionLoads(model, solved, 0, nearestStation(solved, 0, z));

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

  test("a member with no load of its own, no support on the free-body side and only a joint at its end has none", () => {
    // tFrameKg: M1 is the column; B (its z = 0 end) is a joint with the beams, so L3 (a nodal load at B) is not
    // listed, and the support A is past the cut
    const kg = PRESETS_3D.find((p) => p.key === "t_frame_kg")!.model;
    const s = solveModel3D(kg)!;
    expect(sectionLoads(kg, s, 0, nearestStation(s, 0, 0))).toEqual([]);
  });

  test("a point load on a FREE end is listed when that end is on the free-body side of the cut (z < cut)", () => {
    const e = (id: string) => model.members.findIndex((m) => m.id === id);
    const at2 = (id: string, f: (L: number) => number) => {
      const i = e(id);
      const L = solved.result.geo[i].L;
      return sectionLoads(model, solved, i, nearestStation(solved, i, f(L)))
        .filter((l) => l.kind === "P")
        .map((l) => l.id);
    };
    // M2 (B to C, z down): its free end C is z = 0, so L2 is on the free body at every cut
    for (const f of [(L: number) => 0, (L: number) => L / 2, (L: number) => L])
      expect(at2("M2", f)).toEqual(["L2"]);
    // M3 (E to B, z to the left): its free end E is z = L: L3 only counts once the cut reaches the tip
    expect(at2("M3", () => 0)).toEqual([]);
    expect(at2("M3", (L) => L / 2)).toEqual([]);
    expect(at2("M3", (L) => L)).toEqual(["L3"]);
  });
});

describe("sectionLoads: point loads on the 3D column (preset #9)", () => {
  const col = PRESETS_3D.find((p) => p.key === "column_kg")!.model;
  const colSolved = solveModel3D(col)!;
  const loadsAt = (z: number) =>
    sectionLoads(col, colSolved, 0, nearestStation(colSolved, 0, z));

  test("the tip load (Fx = 1500, Fz = −20 000 kg at B) is listed, in the section's axes", () => {
    const P = loadsAt(2.5).find((l) => l.kind === "P")!;
    expect(P.id).toBe("L2");
    // the column's triad: y to the right (= +X), z down: Fx = 1500 along y, the weight 20 000 along +z (down the member)
    near(P.force[0], 0);
    near(P.force[1], 1500);
    near(P.force[2], 20000);
    expect(P.moment).toBeUndefined();
  });

  test("it is on the free body at every cut (the tip is z = 0); q_y up to the cut; the base reaction only at the base", () => {
    for (const z of [0, 1, 2.5, 5]) {
      expect(loadsAt(z).some((l) => l.kind === "P")).toBe(true);
    }
    expect(loadsAt(5).filter((l) => l.kind === "q")).toHaveLength(1);
    expect(loadsAt(5).some((l) => l.kind === "R")).toBe(true);
    expect(loadsAt(2.5).some((l) => l.kind === "R")).toBe(false);
  });
});

describe("sectionLoads: the loaded span (zSpan)", () => {
  test("M3 of the first preset: q from 1 to 5 m of a 5 m beam whose z runs from D to B is loaded over z in [0, 4]", () => {
    const model = PRESETS_3D[0].model;
    const solved = solveModel3D(model)!;
    const e = model.members.findIndex((m) => m.id === "M3");
    const q = sectionLoads(
      model,
      solved,
      e,
      nearestStation(solved, e, 2.5),
    ).find((l) => l.kind === "q")!;
    expect(q.id).toBe("L2");
    near(q.zSpan![0], 0);
    near(q.zSpan![1], 4); // not the whole 5 m: the 1 m next to B (z in [4, 5]) is unloaded
  });

  test("a load over the whole member has the whole member as its span", () => {
    const model = PRESETS_3D[0].model;
    const solved = solveModel3D(model)!;
    const q = sectionLoads(model, solved, 0, nearestStation(solved, 0, 6)).find(
      (l) => l.kind === "q",
    )!;
    near(q.zSpan![0], 0);
    near(q.zSpan![1], 6); // M1: the 6 m column, q_y over all of it
  });

  test("a distributed load whose span is empty, reversed or outside the member is not listed (the solver ignores it)", () => {
    const base = PRESETS_3D.find((p) => p.key === "frame_overhang")!.model;
    const withLoad = (from: number, to: number) => ({
      ...base,
      loads: [
        {
          id: "Lz",
          type: "mudl" as const,
          member: "M1",
          gx: 0,
          gy: 0,
          gz: -100,
          from,
          to,
        },
      ],
    });
    const qAt = (m: typeof base) => {
      const sv = solveModel3D(m)!;
      return sectionLoads(m, sv, 0, nearestStation(sv, 0, 4)).some(
        (l) => l.kind === "q",
      );
    };
    expect(qAt(withLoad(1, 1))).toBe(false); // empty
    expect(qAt(withLoad(3, 1))).toBe(false); // reversed
    expect(qAt(withLoad(50, 60))).toBe(false); // past the end of the 4 m column
    expect(qAt(withLoad(1, 3))).toBe(true); // a real span still shows
  });
});
