import {
  bucklingLength,
  criticalLoad,
  criticalStress,
  END_CONDITIONS,
  equilibriumState,
  isShortBar,
  maxLength,
  radiusOfGyration,
  slenderness,
} from "../buckling";

const E = 2_100_000;

describe("Euler buckling (the notes' exercises)", () => {
  test("IPN 10, h = 7 m: pinned 516 kg, fixed-fixed 2 064 kg", () => {
    expect(criticalLoad(E, 12.2, 1, 700)).toBeCloseTo(516, 0);
    expect(criticalLoad(E, 12.2, 0.5, 700)).toBeCloseTo(2064, 0);
  });

  test("IPN 23 (Jy = 189): 7 994 kg pinned, 31 978 kg fixed-fixed", () => {
    expect(criticalLoad(E, 189, 1, 700)).toBeCloseTo(7994, 0);
    expect(criticalLoad(E, 189, 0.5, 700)).toBeCloseTo(31978, 0);
  });

  test("15 × 24 bar, 8 m, 350 t: σ = 972.2 < 1200 yet Fk = 218 596 kg < 350 000 kg: it buckles", () => {
    const A = 15 * 24;
    const Jmin = (24 * 15 ** 3) / 12;
    expect(Jmin).toBe(6750);
    expect(350_000 / A).toBeCloseTo(972.22, 2);
    const Fk = criticalLoad(E, Jmin, 1, 800);
    expect(Fk).toBeCloseTo(218_596, 0);
    expect(equilibriumState(350_000, Fk)).toBe("unstable");
    expect(1200 * A).toBe(432_000); // the stress-only "admissible" load, 432 t, is not the real limit
    expect(maxLength(E, Jmin, 1, 350_000)).toBeCloseTo(632.2, 1);
  });

  test("cantilever (c = 2), 135 000 kg, Jy = 14 435 cm⁴: lmax = 744.34 cm = 7.44 m", () => {
    expect(maxLength(E, 14_435, 2, 135_000)).toBeCloseTo(744.34, 2);
  });
});

describe("slenderness and the Euler hyperbola", () => {
  test("Fk = π²·E·A / (c²·λ²) and σk = π²·E/λ² agree with Fk/A", () => {
    const A = 360;
    const J = 6750;
    const i = radiusOfGyration(J, A);
    const lam = slenderness(1, 800, i);
    const Fk = criticalLoad(E, J, 1, 800);
    expect(criticalStress(E, lam)).toBeCloseTo(Fk / A, 8);
    expect((Math.PI ** 2 * E * A) / lam ** 2).toBeCloseTo(Fk, 4);
    expect(lam).toBeCloseTo(800 / 4.33, 0); // i = 15/√12 = 4.33 cm
  });

  test("end conditions: l0 = c·l with c = 2, 1, 0.7, 0.5; the load scales as 1/c²", () => {
    expect(END_CONDITIONS.map((e) => e.c)).toEqual([2, 1, 0.7, 0.5]);
    expect(bucklingLength(0.7, 1000)).toBeCloseTo(700, 10);
    expect(criticalLoad(E, 100, 0.5, 300) / criticalLoad(E, 100, 1, 300)).toBeCloseTo(4, 10);
    expect(criticalLoad(E, 100, 1, 300) / criticalLoad(E, 100, 2, 300)).toBeCloseTo(4, 10);
  });
});

describe("equilibrium states and the short-bar rule", () => {
  test("F < Fk stable, F = Fk indifferent, F > Fk unstable", () => {
    expect(equilibriumState(100, 200)).toBe("stable");
    expect(equilibriumState(200, 200)).toBe("indifferent");
    expect(equilibriumState(300, 200)).toBe("unstable");
  });
  test("l < 30·b is a short bar", () => {
    expect(isShortBar(29, 1)).toBe(true);
    expect(isShortBar(31, 1)).toBe(false);
  });
});
