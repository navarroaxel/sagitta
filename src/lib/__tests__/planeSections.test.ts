import { centroid, gyration, principal, rectJ, rotate, steiner, steinerXY } from "../planeSections";

describe("static moments and centroids (the notes' examples)", () => {
  test("rectangle 4 × 16 with corners (6,4)–(10,20): Sx = 768, Sy = 512, centroid (8, 12)", () => {
    const c = centroid([{ A: 64, xg: 8, yg: 12 }]);
    expect(c.Sx).toBe(768);
    expect(c.Sy).toBe(512);
    expect([c.xg, c.yg]).toEqual([8, 12]);
  });

  test("three masses: Xg = 63.33 cm, Yg = 67.14 cm", () => {
    const c = centroid([
      { A: 300, xg: 30, yg: 70 },
      { A: 800, xg: 80, yg: 100 },
      { A: 1000, xg: 60, yg: 40 },
    ]);
    expect(c.A).toBe(2100);
    expect(c.Sy).toBe(133000);
    expect(c.Sx).toBe(141000);
    expect(c.xg).toBeCloseTo(63.33, 2);
    expect(c.yg).toBeCloseTo(67.14, 2);
  });

  test("irregular plate: A = 151, Sy = 981.5, Sx = 848.5, centroid (6.50, 5.62)", () => {
    const c = centroid([
      { A: 26, xg: 6.5, yg: 11 },
      { A: 50, xg: 5, yg: 7.5 },
      { A: 75, xg: 7.5, yg: 2.5 },
    ]);
    expect(c.A).toBe(151);
    expect(c.Sy).toBeCloseTo(981.5, 10);
    expect(c.Sx).toBeCloseTo(848.5, 10);
    expect(c.xg).toBeCloseTo(6.5, 2);
    expect(c.yg).toBeCloseTo(5.62, 2);
  });

  test("door with a rectangular hole: adding the pieces and subtracting the hole agree", () => {
    const added = centroid([
      { A: 1875, xg: 125, yg: 193.75 },
      { A: 3437.5, xg: 62.5, yg: 118.75 },
      { A: 6875, xg: 175, yg: 118.75 },
      { A: 7500, xg: 125, yg: 25 },
    ]);
    const subtracted = centroid([
      { A: 30000, xg: 125, yg: 100 },
      { A: -10312.5, xg: 112.5, yg: 118.75 },
    ]);
    expect(added.xg).toBeCloseTo(131.55, 2);
    expect(added.yg).toBeCloseTo(90.18, 2);
    expect(subtracted.xg).toBeCloseTo(added.xg, 8);
    expect(subtracted.yg).toBeCloseTo(added.yg, 8);
    expect(subtracted.A).toBeCloseTo(19687.5, 8);
  });
});

describe("second-order moments", () => {
  test("rectangle 8 × 16 in both positions: 2 730.67 and 682.67 cm⁴ (a factor of 4)", () => {
    expect(rectJ(8, 16)).toBeCloseTo(2730.67, 2);
    expect(rectJ(16, 8)).toBeCloseTo(682.67, 2);
    expect(rectJ(8, 16) / rectJ(16, 8)).toBeCloseTo(4, 10);
  });

  test("Steiner: a rectangle about its base is b·h³/3", () => {
    expect(steiner(rectJ(8, 16), 128, 8)).toBeCloseTo((8 * 16 ** 3) / 3, 8);
    expect(steinerXY(0, 128, 4, 8)).toBe(4096);
  });

  test("radius of gyration: J = A·i²", () => {
    const i = gyration(rectJ(8, 16), 128);
    expect(i * i * 128).toBeCloseTo(rectJ(8, 16), 8);
  });
});

// Numerical integration of a rectangle b × h centred at the origin, to check the rotation formulas independently.
function gridMoments(b: number, h: number, alpha: number, n = 400) {
  let Jx = 0, Jy = 0, Jxy = 0;
  const dA = (b / n) * (h / n);
  const c = Math.cos(alpha), s = Math.sin(alpha);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const x = -b / 2 + ((i + 0.5) * b) / n;
      const y = -h / 2 + ((j + 0.5) * h) / n;
      const xp = x * c + y * s;
      const yp = y * c - x * s;
      Jx += yp * yp * dA;
      Jy += xp * xp * dA;
      Jxy += xp * yp * dA;
    }
  }
  return { Jx, Jy, Jxy };
}

describe("rotated and principal axes", () => {
  const Jx = rectJ(8, 16);
  const Jy = rectJ(16, 8);
  test("the rotation formulas match direct integration of a rectangle", () => {
    const a = (30 * Math.PI) / 180;
    const f = rotate(Jx, Jy, 0, a);
    const g = gridMoments(8, 16, a);
    expect(f.Jx).toBeCloseTo(g.Jx, 0);
    expect(f.Jy).toBeCloseTo(g.Jy, 0);
    expect(f.Jxy).toBeCloseTo(g.Jxy, 0);
  });

  test("Jx + Jy is invariant, and 90° swaps the axes", () => {
    for (const deg of [0, 17, 45, 90, 133]) {
      const r = rotate(Jx, Jy, 120, (deg * Math.PI) / 180);
      expect(r.Jx + r.Jy).toBeCloseTo(Jx + Jy, 8);
    }
    const q = rotate(Jx, Jy, 0, Math.PI / 2);
    expect(q.Jx).toBeCloseTo(Jy, 8);
    expect(q.Jy).toBeCloseTo(Jx, 8);
  });

  test("principal axes: zero product of inertia, extreme moments, J1·J2 = Jx·Jy − Jxy²", () => {
    const Jxy = 900;
    const p = principal(Jx, Jy, Jxy);
    const at = rotate(Jx, Jy, Jxy, p.alpha1);
    expect(at.Jxy).toBeCloseTo(0, 6);
    expect([at.Jx, at.Jy].sort((a, b) => b - a)[0]).toBeCloseTo(p.J1, 6);
    expect(p.J1 * p.J2).toBeCloseTo(Jx * Jy - Jxy * Jxy, 4);
    expect(p.J1 + p.J2).toBeCloseTo(Jx + Jy, 8);
    // no other angle gives a larger moment
    let max = 0;
    for (let d = 0; d < 180; d += 0.5) max = Math.max(max, rotate(Jx, Jy, Jxy, (d * Math.PI) / 180).Jx);
    expect(max).toBeLessThanOrEqual(p.J1 + 1e-9); // the grid can only approach it from below
    expect(max).toBeCloseTo(p.J1, 0);
  });

  test("a section whose axes are already principal (Jxy = 0) has α₁ = 0 or 90°", () => {
    const p = principal(Jx, Jy, 0);
    expect(Math.abs(Math.sin(2 * p.alpha1))).toBeCloseTo(0, 10);
    expect(p.J1).toBeCloseTo(Jx, 8);
    expect(p.J2).toBeCloseTo(Jy, 8);
  });
});
