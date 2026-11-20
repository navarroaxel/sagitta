import { describe, expect, test, it } from "vitest";
import {
  criticalCorner,
  guideCorners,
  guideOutline,
  guideSection,
  halfPlanePolygon,
  isUniform,
  neutralIntercepts,
  neutralSegment,
  plane,
  resultantGuide,
  sigmaAt,
} from "../sectionGuide";
import { PRESETS_3D } from "../presets3d";
import { solveModel3D } from "../solve3d";
import { computeStress } from "../stress3d";

const near = (a: number, b: number, tol = 0.05) => expect(Math.abs(a - b)).toBeLessThan(tol);
const s = guideSection("IPB 120", true);
// base of the column of preset #2: N = −600 kg, Mx = −300 kg·m, My = 900 kg·m
const k = plane(-600, -300, 900, s);

describe("sectionGuide (preset #2, base of the column)", () => {
  test("the rotated IPB 120 swaps Ix / Iy and the half sides", () => {
    expect(s).toMatchObject({ A: 34, Ix: 318, Iy: 864, hx: 6, hy: 6 });
    const u = guideSection("IPB 400", false);
    expect(u.hy).toBeGreaterThan(u.hx); // unrotated: the depth runs along y
  });

  test("corner stresses: +1173.4 / −1208.7 kg/cm², the critical one is a compression corner", () => {
    const cs = guideCorners(k, s);
    near(Math.max(...cs.map((c) => c.sigma)), 1173.4);
    const crit = criticalCorner(cs);
    near(crit.sigma, -1208.7);
    expect([crit.x, crit.y]).toEqual([-6, 6]); // −x, +y fibres
    near(crit.sN, -17.6, 0.1);
    near(crit.sMx, -566.0, 0.1);
    near(crit.sMy, -625.0, 0.1);
  });

  test("face 1 (x against the strong axis) is worse for this load: max |σ| = 1924 vs 1209 kg/cm²", () => {
    const f1 = guideSection("IPB 120", false);
    expect(f1).toMatchObject({ Ix: 864, Iy: 318 });
    near(criticalCorner(guideCorners(plane(-600, -300, 900, f1), f1)).sigma, -1924.0, 0.1);
    near(criticalCorner(guideCorners(k, s)).sigma, -1208.7);
  });

  test("it is the same maximum as the app's stress check (stress3d)", () => {
    const m = PRESETS_3D.find((p) => p.key === "t_frame_kg")!.model;
    const sol = solveModel3D(m)!;
    const st = sol.stations[0].reduce((a, b) => (b.z > a.z ? b : a)); // the base: farthest from the free end
    const g = plane(st.N, st.Mx, st.My, guideSection("IPB 120", true));
    const crit = criticalCorner(guideCorners(g, s));
    near(crit.sigma, computeStress(m, sol)[0]!.max.sigma, 0.01);
  });

  test("neutral axis: (0; −0.187) and (+0.169; 0), and σ = 0 along the clipped segment", () => {
    const { x0, y0 } = neutralIntercepts(k);
    near(y0!, -0.187, 0.001);
    near(x0!, 0.169, 0.001);
    const seg = neutralSegment(k, s)!;
    seg.forEach(([x, y]) => near(sigmaAt(k, x, y), 0, 1e-6));
  });

  test("the compressed polygon holds the −σ corner, the tension polygon the +σ corner", () => {
    const inside = (poly: [number, number][], x: number, y: number) => poly.some(([px, py]) => px === x && py === y);
    expect(inside(halfPlanePolygon(k, s, -1), -6, 6)).toBe(true);
    expect(inside(halfPlanePolygon(k, s, 1), 6, -6)).toBe(true);
    // N < 0 with the centroid σ = N/A < 0: the origin is on the compression side
    expect(sigmaAt(k, 0, 0)).toBeLessThan(0);
  });

  test("uniform σ (only N): no neutral axis; each half-plane is the whole rectangle or empty", () => {
    const u = plane(-1000, 0, 0, s);
    expect(neutralSegment(u, s)).toBeNull();
    expect(halfPlanePolygon(u, s, -1)).toHaveLength(4);
    expect(halfPlanePolygon(u, s, 1)).toHaveLength(0);
  });

  test("the outline is one simple I / H polygon: 12 vertices, same area on both faces, close to the table's A", () => {
    const area = (p: [number, number][]) =>
      Math.abs(p.reduce((a, [x, y], i) => a + x * p[(i + 1) % p.length][1] - p[(i + 1) % p.length][0] * y, 0)) / 2;
    const f1 = guideOutline(guideSection("IPB 120", false)),
      f2 = guideOutline(guideSection("IPB 120", true));
    expect(f1).toHaveLength(12);
    expect(f2).toHaveLength(12);
    near(area(f1), area(f2), 1e-9);
    expect(area(f1) / 34).toBeGreaterThan(0.95); // the table's A also counts the root fillets
    expect(area(f1)).toBeLessThan(34);
    // face 1: flanges along x (wide, thin); face 2: the same shape turned a quarter (tall in y is the flange width)
    const xs = (p: [number, number][]) => Math.max(...p.map((q) => q[0])) - Math.min(...p.map((q) => q[0]));
    near(xs(f1), 12, 1e-9);
    near(xs(f2), 12, 1e-9);
  });

  test("resultant diagram: baseline ⟂ E.N., the parallels through the extreme corners, σ = gn·t on the baseline", () => {
    const r = resultantGuide(k, s, 12)!;
    near(r.u[0] * r.e[0] + r.u[1] * r.e[1], 0, 1e-12); // baseline ⟂ the E.N. direction
    near(r.hi.sigma, 1173.4);
    near(r.lo.sigma, -1208.7);
    near(r.hi.t * r.gn, r.hi.sigma, 1e-6);
    near(r.lo.t * r.gn, r.lo.sigma, 1e-6);
    // the point of the baseline at t = 0 is on the E.N., and the corner is on the line through it along e
    const [bx, by] = r.at(0);
    near(sigmaAt(k, bx - r.n[0] * 12, by - r.n[1] * 12), 0, 1e-6); // slide back along the E.N.: σ = 0
    [r.hi, r.lo].forEach((q) => {
      const [px, py] = r.at(q.t);
      const cross = (q.corner[0] - px) * r.e[1] - (q.corner[1] - py) * r.e[0]; // corner − baseline point ∥ e
      near(cross, 0, 1e-6);
    });
    expect(r.n[1]).toBeLessThan(0); // the + ordinates point down, away from the section
    expect(r.hi.t).toBeGreaterThan(r.lo.t);
  });

  test("resultant diagram: none when σ is uniform", () => {
    expect(resultantGuide(plane(-1000, 0, 0, s), s, 12)).toBeNull();
  });
});

describe("uniform stress / zero tolerance", () => {
  const s = guideSection("IPB 120", true);
  it("small nonuniform stress is not uniform; N-only is", () => {
    expect(isUniform(plane(-2000, 10, 0, s), s)).toBe(false); // neutral axis outside the section
    expect(isUniform(plane(10, 0, 0, s), s)).toBe(true);
    expect(resultantGuide(plane(0, 0.1, 0, s), s, 11)).not.toBeNull();
    expect(resultantGuide(plane(10, 0, 0, s), s, 11)).toBeNull();
  });
});
