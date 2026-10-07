import {
  CHS_TUBES,
  RHS_TUBES,
  SHS_TUBES,
  circularTube,
  filterTubes,
  torsionC,
} from "../tubes";

const rel = (a: number, b: number) => Math.abs(a - b) / Math.abs(b);

describe("circular tubes are computed from D and t", () => {
  // values printed in the course PDF (so the formulas are checked against the table itself)
  test.each([
    [
      12.7,
      0.7,
      { A: 0.26, I: 0.05, S: 0.08, r: 0.42, Z: 0.1, J: 0.1, C: 0.15 },
    ],
    [
      168.3,
      6.35,
      {
        A: 32.31,
        g: 25.36,
        I: 1060.82,
        S: 126.06,
        r: 5.73,
        Z: 166.67,
        J: 2121.63,
        C: 261.48,
      },
    ],
    [219.1, 12.7, { A: 82.43, I: 4414.58, S: 402.61, Z: 542.87, J: 8829.15 }],
    [508.2, 15.87, { A: 245.46, I: 74448.1, Z: 3848.8, C: 6039.3 }],
    [
      914.4,
      12.7,
      { A: 359.76, g: 282.41, I: 365706, S: 7999, r: 31.88, Z: 10329 },
    ],
    [1828.8, 19.05, { A: 1083.09, I: 4434609, S: 48497, r: 63.99, Z: 62407 }],
  ])("CHS %s×%s", (D, t, printed) => {
    const c = circularTube(D, t);
    for (const [k, v] of Object.entries(printed)) {
      // printed values are rounded to 2 decimals (or fewer digits for the big ones)
      const got = c[k as keyof typeof c] as number;
      expect(rel(got, v) < 0.006 || Math.abs(got - v) < 0.011).toBe(true);
    }
  });
  test("size and ordering", () => {
    expect(CHS_TUBES).toHaveLength(168);
    expect(CHS_TUBES[0].name).toBe("CHS 12.7×0.7");
    expect(CHS_TUBES.at(-1)!.name).toBe("CHS 1828.8×19.05");
  });
});

describe("square tubes transcribed from the table", () => {
  test("size", () => expect(SHS_TUBES).toHaveLength(89));

  // outer radius 2t, inner t — the geometry the table uses (R = 2,00 t)
  function geometry(B: number, t: number) {
    const Ro = 2 * t,
      Ri = t,
      b = B - 2 * t,
      n = 20000;
    const w = (s: number, R: number, y: number) => {
      const h = s / 2,
        c = h - R;
      return y > h
        ? 0
        : y <= c
          ? s
          : s - 2 * (R - Math.sqrt(Math.max(R * R - (y - c) ** 2, 0)));
    };
    let A = 0,
      I = 0,
      Z = 0;
    const dy = B / 2 / n;
    for (let i = 0; i < n; i++) {
      const y = (i + 0.5) * dy,
        wn = w(B, Ro, y) - w(b, Ri, y);
      A += 2 * wn * dy;
      I += 2 * wn * y * y * dy;
      Z += 2 * wn * y * dy;
    }
    return {
      A: A / 100,
      I: I / 1e4,
      S: I / (B / 2) / 1e3,
      r: Math.sqrt(I / A) / 10,
      Z: Z / 1e3,
    };
  }

  SHS_TUBES.forEach((x) => {
    test(x.name, () => {
      const g = geometry(x.D, x.t);
      // a mistyped digit shows up well above the ~0.1 % the table itself differs by
      for (const k of ["A", "I", "S", "r", "Z"] as const)
        expect(rel(x[k], g[k])).toBeLessThan(0.01);
      expect(rel(x.g, x.A * 0.785)).toBeLessThan(0.01);
      // C = J / ((B − t)/2): the table's torsional modulus
      expect(rel(x.C, x.J / ((x.D - x.t) / 20))).toBeLessThan(0.03);
      expect(x.J).toBeGreaterThan(x.I);
    });
  });
});

describe("filterTubes", () => {
  test("by kind and number", () => {
    expect(
      filterTubes({ text: "168 6.35", kind: "CHS" }).map((x) => x.name),
    ).toEqual(["CHS 168.3×6.35"]);
    expect(
      filterTubes({ text: "100", kind: "SHS" }).every(
        (x) => x.kind === "SHS" && x.D === 100,
      ),
    ).toBe(true);
  });
  test("minimums and sort", () => {
    const r = filterTubes({
      text: "",
      kind: "SHS",
      minI: 1000,
      sortKey: "A",
      sortDir: "asc",
    });
    expect(r.every((x) => x.kind === "SHS" && x.I >= 1000)).toBe(true);
    expect(r[0].A).toBeLessThanOrEqual(r.at(-1)!.A);
  });
});

describe("rectangular tubes", () => {
  test("size and ordering", () => {
    expect(RHS_TUBES).toHaveLength(95);
    expect(RHS_TUBES[0].name).toBe("RHS 10×20×0.7");
    expect(RHS_TUBES.at(-1)!.name).toBe("RHS 100×250×12");
  });

  // exact area/inertia/plastic modulus of a rounded rectangle, corner radius 2t outside, t inside
  function geometry(B: number, H: number, t: number) {
    const Ro = 2 * t,
      Ri = t,
      n = 20000;
    const w = (s: number, d: number, R: number, y: number) => {
      // width of a rounded rectangle (s wide, d deep) at height y from its centre line
      const h = d / 2,
        c = h - R;
      return y > h
        ? 0
        : y <= c
          ? s
          : s - 2 * (R - Math.sqrt(Math.max(R * R - (y - c) ** 2, 0)));
    };
    let A = 0,
      Ix = 0,
      Zx = 0;
    const dy = H / 2 / n;
    for (let i = 0; i < n; i++) {
      const y = (i + 0.5) * dy;
      const wn = w(B, H, Ro, y) - w(B - 2 * t, H - 2 * t, Ri, y);
      A += 2 * wn * dy;
      Ix += 2 * wn * y * y * dy;
      Zx += 2 * wn * y * dy;
    }
    return { A: A / 100, Ix: Ix / 1e4, Zx: Zx / 1e3 };
  }

  RHS_TUBES.forEach((x) => {
    test(x.name, () => {
      // a mistyped digit shows up well above the ≤0.1 % (up to 0.8 % for thick walls, e.g.
      // 40×140×6.35) by which the table differs from exact geometry
      const gx = geometry(x.B, x.H, x.t); // about X-X (depth H)
      const gy = geometry(x.H, x.B, x.t); // swap to get Iy and Zy
      expect(rel(x.A, gx.A)).toBeLessThan(0.01);
      expect(rel(x.Ix, gx.Ix)).toBeLessThan(0.01);
      expect(rel(x.Zx, gx.Zx)).toBeLessThan(0.01);
      expect(rel(x.Iy, gy.Ix)).toBeLessThan(0.01);
      expect(rel(x.Zy, gy.Zx)).toBeLessThan(0.01);
      expect(x.Ix).toBeGreaterThan(x.Iy);
      expect(x.J).toBeGreaterThan(x.Iy);
      expect(rel(x.g, x.A * 0.785)).toBeLessThan(0.002);
    });
  });

  test("derived columns reproduce the printed ones", () => {
    const x = RHS_TUBES.find((r) => r.name === "RHS 100×250×12")!;
    // printed: Sx 411.90, rx 8.31, Sy 233.71, ry 3.96, C 495.98
    expect(x.Sx).toBeCloseTo(411.9, 1);
    expect(x.rx).toBeCloseTo(8.31, 2);
    expect(x.Sy).toBeCloseTo(233.71, 1);
    expect(x.ry).toBeCloseTo(3.96, 2);
    expect(x.C).toBeCloseTo(495.98, 1);
    // C = 2·A_h·t is exact against the printed 110.39 of SHS 100×6.35 too
    expect(torsionC(100, 100, 6.35)).toBeCloseTo(110.39, 1);
  });

  test("search by B and H", () => {
    const r = filterTubes({ text: "100 250", kind: "RHS" });
    expect(r).toHaveLength(5);
    expect(r.every((x) => x.kind === "RHS" && x.B === 100 && x.H === 250)).toBe(
      true,
    );
    const asc = filterTubes({
      text: "",
      kind: "RHS",
      minI: 1000,
      sortKey: "A",
      sortDir: "asc",
    });
    expect(asc.every((x) => x.kind === "RHS" && x.Ix >= 1000)).toBe(true);
  });
});
