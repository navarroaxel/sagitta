import { eccentricLoad, sectionProps } from "../eccentric";
import { getProfile } from "../profiles";

const ipn300 = getProfile("IPN 300")!;
const base = { profile: ipn300, rotated: false, P: 76, ex: 10, ey: 20, sigmaAdm: 14 };
const near = (a: number, b: number, tol = 1e-9) =>
  expect(Math.abs(a - b)).toBeLessThan(tol * Math.max(1, Math.abs(b)));

describe("eccentricLoad — IPN 300, e_x = 10 cm, e_y = 20 cm", () => {
  const r = eccentricLoad(base);
  const k = 1 / 69 + 20 / (9800 / 15) + 10 / (451 / 6.25); // 1/A + ey/Wx + ex/Wy

  test("reduction to the centroid", () => {
    near(r.N, 76);
    near(r.Mx, 76 * 20); // strong axis: P·ey
    near(r.My, 76 * 10); // weak axis: P·ex
    near(r.Wx, 9800 / 15);
    near(r.Wy, 451 / 6.25);
  });

  test("corner stresses and critical corner", () => {
    near(r.critical.sigma, 76 * k);
    expect(r.critical.x).toBeGreaterThan(0);
    expect(r.critical.y).toBeGreaterThan(0); // same quadrant as the load
    expect(r.corners.map((c) => +c.sigma.toFixed(2))).toEqual([13.96, 9.31, -7.1, -11.76]);
    expect(r.ok).toBe(true);
    expect(r.ratio).toBeGreaterThan(0.99);
  });

  test("P_max = sigma_adm / (1/A + ey/Wx + ex/Wy) ≈ 76.2 kN", () => {
    near(r.Pmax, 14 / k);
    expect(r.Pmax).toBeGreaterThan(76);
    expect(r.Pmax).toBeLessThan(76.5);
    // loading with P_max puts the critical corner exactly at sigma_adm
    near(eccentricLoad({ ...base, P: r.Pmax }).ratio, 1);
  });

  test("neutral axis meets x at −0.65 cm and y at −7.10 cm", () => {
    const [p, q] = r.neutral!;
    for (const [x, y] of [p, q]) near(1 / 69 + (10 * x) / 451 + (20 * y) / 9800, 0, 1e-9);
    // line y = −7.10 − 10.865·x
    near((p[1] - q[1]) / (p[0] - q[0]), -10.865, 1e-3);
    near(p[1] - ((p[1] - q[1]) / (p[0] - q[0])) * p[0], -7.1, 1e-3);
  });

  test("load point outside the section (e_x > b/2, e_y > h/2)", () => {
    expect(r.inside).toBe(false);
    expect(eccentricLoad({ ...base, ex: 5, ey: 10 }).inside).toBe(true);
  });
});

describe("eccentricLoad — variants", () => {
  test("compression flips every stress, P_max is unchanged", () => {
    const t = eccentricLoad(base);
    const c = eccentricLoad({ ...base, P: -76 });
    t.corners.forEach((corner, i) => near(c.corners[i].sigma, -corner.sigma));
    near(c.Pmax, t.Pmax);
  });

  test("negative eccentricity mirrors the stresses", () => {
    const a = eccentricLoad(base);
    const b = eccentricLoad({ ...base, ex: -10, ey: -20 });
    near(b.critical.sigma, a.critical.sigma);
    expect(b.critical.x).toBeLessThan(0);
    expect(b.critical.y).toBeLessThan(0);
  });

  test("rotated swaps the axes of the profile", () => {
    const s = sectionProps(ipn300, true);
    near(s.Ix, 451);
    near(s.Iy, 9800);
    near(s.halfX, 15);
    near(s.halfY, 6.25);
    // 23.3 kN/cm² with the web horizontal (stress3d orientation)
    near(eccentricLoad({ ...base, rotated: true }).critical.sigma, 23.33, 2e-3);
  });

  test("concentric load: uniform stress, P_max = sigma_adm·A, no neutral axis", () => {
    const r = eccentricLoad({ ...base, ex: 0, ey: 0 });
    r.corners.forEach((c) => near(c.sigma, 76 / 69));
    near(r.Pmax, 14 * 69);
    expect(r.neutral).toBeNull();
  });

  test("P = 0 and sigma_adm = 0 don't blow up", () => {
    const z = eccentricLoad({ ...base, P: 0 });
    near(z.critical.sigma, 0);
    expect(z.ok).toBe(true);
    near(z.Pmax, eccentricLoad(base).Pmax);
    expect(eccentricLoad({ ...base, sigmaAdm: 0 }).ratio).toBe(Infinity);
  });
});
