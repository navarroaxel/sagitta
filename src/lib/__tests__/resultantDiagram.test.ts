import { resultantLayout } from "../resultantDiagram";
import { cutAt, nearestStation, stressAt } from "../sectionCut";
import { solveModel3D } from "../solve3d";
import { PRESETS_3D } from "../presets3d";

const near = (a: number, b: number, tol = 1e-6) =>
  expect(Math.abs(a - b)).toBeLessThan(tol * Math.max(1, Math.abs(b)));

const model = PRESETS_3D.find((p) => p.key === "frame_overhang")!.model;
const solved = solveModel3D(model)!;
const cut = (z: number) => cutAt(model, solved, 0, nearestStation(solved, 0, z))!;
const opts = { cx: 300, cy: 170, s: 0.5, dist: 200 };

describe("resultantLayout", () => {
  test("the baseline reads σ max / σ min where the parallels through the extreme corners cross it, and 0 on the E.N.", () => {
    const d = cut(1); // two moments: an oblique neutral axis
    const l = resultantLayout(d, opts)!;
    near(l.sigmaAt(l.hi.t), Math.max(...d.corners.map((c) => c.sigma)));
    near(l.sigmaAt(l.lo.t), Math.min(...d.corners.map((c) => c.sigma)));
    near(l.sigmaAt(l.t0), 0, 1e-9);
  });

  test("the extreme lines really are lines of constant σ: moving along the E.N. direction keeps it", () => {
    const d = cut(1);
    const l = resultantLayout(d, opts)!;
    const f = (X: number, Y: number) =>
      stressAt(d, (X - opts.cx) / (1000 * opts.s), (opts.cy - Y) / (1000 * opts.s));
    [l.hi, l.lo].forEach((end) => {
      const [X, Y] = end.corner;
      near(f(X + l.e[0] * 120, Y + l.e[1] * 120), end.sigma, 1e-9);
      // and the same line meets the baseline at end.t
      near(f(...l.at(end.t)), end.sigma, 1e-9);
    });
  });

  test("the baseline is perpendicular to the E.N. and the ordinates lie along it (the parallels): the diagram is tilted with the E.N.", () => {
    const l = resultantLayout(cut(1), opts)!;
    near(l.u[0] * l.e[0] + l.u[1] * l.e[1], 0, 1e-9);
    near(Math.abs(l.n[0] * l.e[0] + l.n[1] * l.e[1]), 1, 1e-9);
    // an oblique E.N. (two moments) gives a baseline that is neither horizontal nor vertical
    expect(Math.abs(l.u[0])).toBeGreaterThan(0.05);
    expect(Math.abs(l.u[1])).toBeGreaterThan(0.05);
  });

  test("the baseline starts on the E.N. (σ = 0 there) and the ordinates point down the screen, away from the section", () => {
    const d = cut(1);
    const l = resultantLayout(d, opts)!;
    const [bx, by] = l.at(0);
    const f = (X: number, Y: number) =>
      stressAt(d, (X - opts.cx) / (1000 * opts.s), (opts.cy - Y) / (1000 * opts.s));
    near(f(bx, by), 0, 1e-9);
    expect(l.n[1]).toBeGreaterThanOrEqual(0);
  });

  test("returns null when σ is uniform (only N)", () => {
    const d = { ...cut(1), Mx: 0, My: 0 };
    d.corners = d.corners.map((c) => ({ ...c, sigma: c.sN }));
    expect(resultantLayout(d, opts)).toBeNull();
  });
});
