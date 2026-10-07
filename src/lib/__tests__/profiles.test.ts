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
      // clear web height: h − 2·tf − 2·r for the parallel-flange IPB; tapered IPN just
      // has to be inside the web span
      if (p.series === "IPB")
        expect(Math.abs(p.hw - (p.h - 2 * p.tf - 2 * p.r))).toBeLessThanOrEqual(
          1,
        );
      else expect(p.hw).toBeLessThan(p.h - 2 * p.tf);
    });
  });

  test("known values from the table", () => {
    expect(getProfile("IPN 200")).toMatchObject({
      A: 33.4,
      Ix: 2140,
      Iy: 117,
      J: 11.2,
    });
    expect(getProfile("IPB 300")).toMatchObject({
      A: 149,
      Ix: 25170,
      Iy: 8560,
      J: 149,
    });
  });
  test("IPN keeps r1 = tw and a toe radius; IPB has none", () => {
    expect(getProfile("IPN 200")).toMatchObject({ hw: 159, r: 7.5, r2: 4.5 });
    expect(getProfile("IPB 200")).toMatchObject({ hw: 134, r: 18 });
    expect(getProfile("IPB 200")?.r2).toBeUndefined();
    expect(getProfile("IPB 1000")).toMatchObject({
      A: 400,
      Ix: 644700,
      J: 1145,
      hw: 868,
    });
  });
  test("series sizes and lookup", () => {
    expect(IPN_PROFILES).toHaveLength(23);
    expect(IPB_PROFILES).toHaveLength(24);
    expect(getProfile("IPX 1")).toBeUndefined();
    expect(getProfile(undefined)).toBeUndefined();
  });
});
