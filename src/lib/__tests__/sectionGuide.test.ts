import { describe, expect, test } from "vitest";
import {
  criticalCorner,
  guideCorners,
  guideSection,
  halfPlanePolygon,
  neutralIntercepts,
  neutralSegment,
  plane,
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
});
