import { SHAPES, defaults, integrate, shapeById, type PropKey } from "../basicShapes";

const KEYS: PropKey[] = ["xg", "yg", "F", "Jx", "Jy", "Jxy", "Jxg", "Jyg", "Jxyg"];

// A few dimension sets per shape (the defaults and others), so a formula that only works for
// b = h or for the default numbers does not pass.
const SETS: Record<string, Record<string, number>[]> = {
  square: [{ h: 4 }, { h: 0.7 }],
  rectangle: [{ b: 4, h: 6 }, { b: 9, h: 2 }],
  right_triangle: [{ b: 4, h: 6 }, { b: 1.5, h: 7 }],
  isosceles_triangle: [{ b: 4, h: 6 }, { b: 8, h: 1.5 }],
  rhombus: [{ b: 4, h: 6 }, { b: 2, h: 9 }],
  trapezoid: [{ a: 6, b: 3, h: 5 }, { a: 2, b: 7, h: 4 }, { a: 5, b: 5, h: 3 }],
  hexagon: [{ r: 3 }, { r: 0.8 }],
  circle: [{ r: 3 }, { r: 12 }],
  semicircle: [{ r: 3 }, { r: 10 }],
  quarter_circle: [{ r: 4 }, { r: 9 }],
  sector: [{ r: 4, alpha: 60 }, { r: 3, alpha: 25 }, { r: 5, alpha: 120 }, { r: 2, alpha: 180 }],
  ring: [{ R: 4, r: 3 }, { R: 10, r: 1 }],
};

describe("basic shapes: every closed form of the table matches numerical integration of the outline", () => {
  SHAPES.forEach((shape) => {
    SETS[shape.id].forEach((p) => {
      test(`${shape.id} ${JSON.stringify(p)}`, () => {
        expect(shape.valid(p)).toBe(true);
        const got = shape.props(p);
        const ref = integrate(shape.outline(p));
        KEYS.forEach((k) => {
          // relative to the largest quantity of its kind (a zero must come out as ~0, not as a ratio of noise)
          const kind = k.startsWith("J") ? Math.max(ref.Jx, ref.Jy) : k === "F" ? ref.F : Math.max(ref.xg, ref.yg, 1e-9);
          expect(Math.abs(got[k] - ref[k])).toBeLessThan(2e-4 * kind);
        });
      });
    });
  });

  test("every shape has a set of dimensions in this test, and its defaults are valid", () => {
    SHAPES.forEach((s) => {
      expect(SETS[s.id]).toBeDefined();
      expect(s.valid(defaults(s))).toBe(true);
      KEYS.forEach((k) => expect(typeof s.formulas[k]).toBe("string"));
    });
  });
});

describe("relations that hold for any shape", () => {
  test("Steiner: J = Jg + F·d², Jxy = Jxyg + F·xg·yg", () => {
    SHAPES.forEach((s) => {
      const q = s.props(defaults(s));
      expect(q.Jx).toBeCloseTo(q.Jxg + q.F * q.yg ** 2, 6);
      expect(q.Jy).toBeCloseTo(q.Jyg + q.F * q.xg ** 2, 6);
      expect(q.Jxy).toBeCloseTo(q.Jxyg + q.F * q.xg * q.yg, 6);
    });
  });

  test("invalid dimensions are rejected (ring with r ≥ R, sector over 180°, non-positive sizes)", () => {
    expect(shapeById("ring").valid({ R: 3, r: 3 })).toBe(false);
    expect(shapeById("ring").valid({ R: 3, r: 4 })).toBe(false);
    expect(shapeById("sector").valid({ r: 2, alpha: 181 })).toBe(false);
    expect(shapeById("rectangle").valid({ b: 0, h: 2 })).toBe(false);
    expect(shapeById("trapezoid").valid({ a: 1, b: -1, h: 2 })).toBe(false);
  });
});
