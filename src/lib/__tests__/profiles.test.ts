import { PROFILES, IPN_PROFILES, IPB_PROFILES, getProfile } from "../profiles";

const rel = (a: number, b: number) => Math.abs(a - b) / Math.abs(b);

// The table was transcribed from a scanned PDF, so every row is checked against the
// geometry: these relations catch any mistyped digit.
describe("profile table is internally consistent", () => {
  PROFILES.forEach((p) => {
    test(p.name, () => {
      expect(rel(p.Sx, p.Ix / (p.h / 20))).toBeLessThan(0.02); // S = I / (h/2), in cm
      expect(rel(p.Sy, p.Iy / (p.bf / 20))).toBeLessThan(0.02);
      expect(rel(p.rx, Math.sqrt(p.Ix / p.A))).toBeLessThan(0.02);
      expect(rel(p.ry, Math.sqrt(p.Iy / p.A))).toBeLessThan(0.02);
      // A and J against the thin-walled estimate (flange taper and fillets: loose bound)
      const hw = p.h - 2 * p.tf;
      expect(rel(p.A, (2 * p.bf * p.tf + hw * p.tw) / 100)).toBeLessThan(0.15);
      const jThin = (2 * p.bf * p.tf ** 3 + hw * p.tw ** 3) / 3 / 1e4;
      expect(rel(p.J, jThin)).toBeLessThan(0.2);
      expect(p.Ix).toBeGreaterThan(p.Iy);
    });
  });

  test("known values from the table", () => {
    expect(getProfile("IPN 200")).toMatchObject({ A: 33.4, Ix: 2140, Iy: 117, J: 11.2 });
    expect(getProfile("IPB 300")).toMatchObject({ A: 149, Ix: 25170, Iy: 8560, J: 149 });
  });
  test("series sizes and lookup", () => {
    expect(IPN_PROFILES).toHaveLength(23);
    expect(IPB_PROFILES).toHaveLength(19);
    expect(getProfile("IPX 1")).toBeUndefined();
    expect(getProfile(undefined)).toBeUndefined();
  });
});
