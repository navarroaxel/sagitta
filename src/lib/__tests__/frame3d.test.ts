import { solveModel3D } from "../solve3d";
import { equilibrium3D, peak3D } from "../results3d";
import { PRESETS_3D } from "../presets3d";
import { makeProjection3D } from "../projection3d";
import type { FrameModel3D } from "../types3d";

const near = (a: number, b: number, tol = 1e-6) =>
  expect(Math.abs(a - b)).toBeLessThan(tol * Math.max(1, Math.abs(b)));

describe("3D presets", () => {
  PRESETS_3D.forEach(({ key, model }) => {
    describe(key, () => {
      const solved = solveModel3D(model)!;
      test("solves and is stable", () => {
        expect(solved).not.toBeNull();
        expect(solved.result.stable).toBe(true);
      });
      test("global equilibrium holds", () => {
        const eq = equilibrium3D(model, solved);
        [...eq.f, ...eq.m].forEach((v) => expect(Math.abs(v)).toBeLessThan(1e-6));
      });
    });
  });

  test("T-frame reactions match the worked example", () => {
    const model = PRESETS_3D.find((p) => p.key === "t_frame")!.model;
    const solved = solveModel3D(model)!;
    const r = solved.result.reactions[solved.nodeIndex.get("A")!];
    near(r.fx, 0);
    near(r.fy, -18);
    near(r.fz, 8);
    near(r.mx, 54);
    near(r.my, -29);
    near(r.mz, 0);
  });

  test("L-frame: first arm in torsion T = P·3, bending M = P·4", () => {
    const model = PRESETS_3D.find((p) => p.key === "l_torsion")!.model;
    const solved = solveModel3D(model)!;
    near(Math.abs(peak3D(solved.stations[0], "T")!.T), 30);
    near(Math.abs(peak3D(solved.stations[0], "Mx")!.Mx) + Math.abs(peak3D(solved.stations[0], "My")!.My), 40);
    near(Math.abs(peak3D(solved.stations[1], "Mx")!.Mx) + Math.abs(peak3D(solved.stations[1], "My")!.My), 30);
  });
});

describe("solveModel3D robustness", () => {
  const base = PRESETS_3D[0].model;
  test("dangling member node -> null", () => {
    const m: FrameModel3D = { ...base, members: [{ id: "X", n1: "A", n2: "ZZ" }] };
    expect(solveModel3D(m)).toBeNull();
  });
  test("dangling load target -> null", () => {
    const m: FrameModel3D = {
      ...base,
      loads: [{ id: "X", type: "mudl", member: "nope", gx: 0, gy: 0, gz: 1 }],
    };
    expect(solveModel3D(m)).toBeNull();
  });
  test("zero-length member -> null", () => {
    const m: FrameModel3D = {
      ...base,
      nodes: [...base.nodes, { id: "Z", x: 0, y: 0, z: 0, support: "free" }],
      members: [{ id: "X", n1: "A", n2: "Z" }],
    };
    expect(solveModel3D(m)).toBeNull();
  });
});

describe("oblique projection", () => {
  const pr = makeProjection3D(
    [
      [0, 0, 0],
      [5, 0, 6],
    ],
    900,
    600,
  );
  test("x runs right, z runs up (screen y down)", () => {
    const [x0, y0] = pr.project([0, 0, 0]);
    const [x1, y1] = pr.project([5, 0, 0]);
    const [, y2] = pr.project([0, 0, 6]);
    expect(x1).toBeGreaterThan(x0);
    expect(y1).toBeCloseTo(y0);
    expect(y2).toBeLessThan(y0);
  });
  test("y recedes up-right with the (14,-10)/40 ratio", () => {
    const [dx, dy] = pr.dir([0, 1, 0]);
    near(dx, 0.35 * pr.k);
    near(dy, -0.25 * pr.k);
  });
  test("fits inside the viewport", () => {
    [
      [0, 0, 0],
      [5, 0, 6],
    ].forEach((p) => {
      const [x, y] = pr.project(p as [number, number, number]);
      expect(x).toBeGreaterThan(0);
      expect(x).toBeLessThan(900);
      expect(y).toBeGreaterThan(0);
      expect(y).toBeLessThan(600);
    });
  });
});

describe("T-frame preset uses a partial load on a single hat member", () => {
  const model = PRESETS_3D.find((p) => p.key === "t_frame")!.model;
  test("3 members, no helper node", () => {
    expect(model.members).toHaveLength(3);
    expect(model.nodes.map((n) => n.id)).toEqual(["A", "B", "C", "D"]);
  });
  test("q_z spans 1..5 m of B-D", () => {
    expect(model.loads.find((l) => l.id === "L2")).toMatchObject({ member: "M3", from: 1, to: 5 });
  });
  test("the hat moment at B is the same −24 + 5 as with the split model", () => {
    const solved = solveModel3D(model)!;
    const atB = solved.stations[2][0]; // start of M3
    near(atB.Mx, -24); // hogging: tension on top, which is −y for the hat (y points down)
  });
});

describe("T-frame hat M3 (partial load q_z = 2 kN/m on 1..5 m): shape of Qy and Mx", () => {
  const model = PRESETS_3D.find((p) => p.key === "t_frame")!.model;
  const st = solveModel3D(model)!.stations[2]; // B -> D, x from B
  const at = (x: number) => st.reduce((m, s) => (Math.abs(s.x - x) < Math.abs(m.x - x) ? s : m));

  test("Qy is a constant −8 up to x = 1 m, then falls linearly to 0 at D", () => {
    st.filter((s) => s.x <= 1 + 1e-9).forEach((s) => near(s.Qy, -8));
    st.filter((s) => s.x >= 1 + 1e-6).forEach((s) => near(s.Qy, -8 + 2 * (s.x - 1)));
    near(at(5).Qy, 0);
  });

  test("Mx is linear (slope 8) on 0..1 m and a parabola (curvature −2) on 1..5 m", () => {
    const d2 = (a: number, b: number) => {
      const pts = st.filter((s) => s.x >= a && s.x <= b);
      const k = Math.floor(pts.length / 2);
      const [p0, p1, p2] = [pts[k - 1], pts[k], pts[k + 1]];
      const s1 = (p1.Mx - p0.Mx) / (p1.x - p0.x),
        s2 = (p2.Mx - p1.Mx) / (p2.x - p1.x);
      return { slope: s1, curv: (s2 - s1) / ((p2.x - p0.x) / 2) };
    };
    const lin = d2(0, 1 - 1e-6);
    near(lin.slope, 8);
    near(lin.curv, 0);
    const par = d2(1 + 1e-6, 5);
    near(par.curv, -2, 1e-3);
  });

  test("there is no kink at x = 1 m: the slope of Mx is continuous (8 on both sides) and only the curvature changes", () => {
    const k = st.findIndex((s) => s.x >= 1 - 1e-9);
    const before = (st[k].Mx - st[k - 1].Mx) / (st[k].x - st[k - 1].x);
    const after = (st[k + 1].Mx - st[k].Mx) / (st[k + 1].x - st[k].x);
    near(before, 8);
    expect(Math.abs(after - 8)).toBeLessThan(0.05); // 8 − q·Δx for the next, 1/64-of-the-span, station
    near(at(1).Mx, -16);
    near(at(5).Mx, 0);
  });
});
