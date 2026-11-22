import { classify, invariants, principalDirection, principalStresses, stressOnPlane, tensor, type Vec3 } from "../stressState";

// The professor's exercise (MPa): σx = −20, σy = 30, σz = 0, τxy = 10, τyz = 0, τxz = 5.
const T = tensor(-20, 30, 0, 10, 0, 5);

describe("stress state: the professor's exercise", () => {
  test("invariants I1 = 10, I2 = −725, I3 = −750 and a triple (spatial) state", () => {
    const { I1, I2, I3 } = invariants(T);
    expect(I1).toBe(10);
    expect(I2).toBe(-725);
    expect(I3).toBe(-750);
    expect(classify(T)).toBe("triple");
  });

  test("stress vector on n = (0.5; 0.5; 0.7071): ρ = (−1.4645; 20; 2.5), |ρ| = 20.21, σ = 11.04, τ = 16.93", () => {
    const r = stressOnPlane(T, [0.5, 0.5, 0.7071]);
    // 0.7071 is not exactly 1/√2: the professor does not normalise (|n| = 0.999995); the difference is far below the digits shown
    expect(r.rho[0]).toBeCloseTo(-1.4645, 3);
    expect(r.rho[1]).toBeCloseTo(20, 3);
    expect(r.rho[2]).toBeCloseTo(2.5, 3);
    expect(r.rhoMag).toBeCloseTo(20.21, 2);
    expect(r.sigmaN).toBeCloseTo(11.04, 2);
    expect(r.tauMag).toBeCloseTo(16.93, 2);
    expect(r.sigma[0]).toBeCloseTo(5.5178, 3);
    expect(r.sigma[2]).toBeCloseTo(7.8032, 3);
    expect(r.tau[0]).toBeCloseTo(-6.9823, 3);
    expect(r.tau[1]).toBeCloseTo(14.4822, 3);
    expect(r.tau[2]).toBeCloseTo(-5.3032, 3);
  });

  test("principal stresses σ1 = 31.9542, σ2 = 1.02156, σ3 = −22.97576", () => {
    const [s1, s2, s3] = principalStresses(T);
    expect(s1).toBeCloseTo(31.9542, 3);
    expect(s2).toBeCloseTo(1.02156, 4);
    expect(s3).toBeCloseTo(-22.97576, 4);
    expect(s1 + s2 + s3).toBeCloseTo(10, 8); // = I1
    expect(s1 * s2 * s3).toBeCloseTo(-750, 6); // = I3
  });

  test("principal directions match the professor's up to sign, and are orthogonal", () => {
    const expected: Vec3[] = [
      [0.1917, 0.981, 0.03],
      [0.1997, -0.0689, 0.97743],
      [0.961, -0.18139, -0.20912],
    ];
    const roots = principalStresses(T);
    const dirs = roots.map((s) => principalDirection(T, s)!);
    dirs.forEach((d, i) => {
      const dp = Math.abs(d[0] * expected[i][0] + d[1] * expected[i][1] + d[2] * expected[i][2]);
      expect(dp).toBeCloseTo(1, 3);
      // T·n = σ·n
      const Tn = T.map((row) => row[0] * d[0] + row[1] * d[1] + row[2] * d[2]);
      Tn.forEach((v, k) => expect(v).toBeCloseTo(roots[i] * d[k], 8));
    });
    expect(Math.abs(dirs[0][0] * dirs[1][0] + dirs[0][1] * dirs[1][1] + dirs[0][2] * dirs[1][2])).toBeCloseTo(0, 8);
  });
});

describe("classification", () => {
  test("plane (double), uniaxial (simple) and null states", () => {
    expect(classify(tensor(50, -20, 0, 30, 0, 0))).toBe("double");
    expect(classify(tensor(80, 0, 0, 0, 0, 0))).toBe("simple");
    expect(classify(tensor(0, 0, 0, 0, 0, 0))).toBe("null");
  });
  test("a plane state has σ3 = 0 and the Mohr values", () => {
    const [s1, s2, s3] = principalStresses(tensor(50, -20, 0, 30, 0, 0));
    const c = 15;
    const r = Math.hypot(35, 30);
    expect(s1).toBeCloseTo(c + r, 8);
    expect(s2).toBeCloseTo(0, 8);
    expect(s3).toBeCloseTo(c - r, 8);
  });
  test("a hydrostatic state has no preferred direction", () => {
    expect(principalDirection(tensor(5, 5, 5, 0, 0, 0), 5)).toBeNull();
    expect(principalStresses(tensor(5, 5, 5, 0, 0, 0))).toEqual([5, 5, 5]);
  });
});
