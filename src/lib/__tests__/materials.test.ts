import { admissibleStress, hooke, nominalStress, resilience, strain, youngModulus } from "../materials";

describe("material properties", () => {
  test("Young's modulus is the slope of the straight part; Hooke's law inverts it", () => {
    const E = youngModulus(2000, 2000 / 2_100_000);
    expect(E).toBeCloseTo(2_100_000, 6);
    expect(hooke(E, 0.0005)).toBeCloseTo(1050, 8);
  });

  test("σ_adm = σ_E/ν: the course's St 37 gives about 1 200 kg/cm² with ν = 3 (σ = 3 700 → 1 233)", () => {
    expect(admissibleStress(3700, 3)).toBeCloseTo(1233.33, 2);
    expect(admissibleStress(4200, 3)).toBe(1400);
  });

  test("resilience U = ½σe²/E equals the area under the elastic line", () => {
    const sE = 2400;
    const E = 2_100_000;
    // numerical area under σ = E·ε from 0 to ε_e = σe/E
    const n = 10000;
    const ee = sE / E;
    let area = 0;
    for (let i = 0; i < n; i++) area += E * ((i + 0.5) * ee / n) * (ee / n);
    expect(resilience(sE, E)).toBeCloseTo(area, 10);
    expect(resilience(sE, E)).toBeCloseTo(1.3714, 3); // kg·cm/cm³
  });

  test("tensile-test quantities", () => {
    expect(strain(0.5, 100)).toBe(0.005);
    expect(nominalStress(5000, 2)).toBe(2500);
  });
});
