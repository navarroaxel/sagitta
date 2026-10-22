import { dominantAxis, supportPlate } from "../supportPlate3d";

describe("supportPlate", () => {
  test("dominant axis and direction of the member", () => {
    expect(dominantAxis([0, 0, 3])).toEqual({ axis: "z", sign: 1 });
    expect(dominantAxis([0, 0, -3])).toEqual({ axis: "z", sign: -1 });
    expect(dominantAxis([4, 0, 0])).toEqual({ axis: "x", sign: 1 });
    expect(dominantAxis([-4, 1, 0])).toEqual({ axis: "x", sign: -1 });
    expect(dominantAxis([0, 2, 0.5])).toEqual({ axis: "y", sign: 1 });
    expect(dominantAxis([1, 1, 1]).axis).toBe("z"); // ties: z first
  });

  test("column going up: horizontal plate, hatch below (unchanged)", () => {
    const p = supportPlate([0, 0, 2]);
    expect(p.pts[0]).toEqual([-54, 10]);
    expect(p.ticks).toHaveLength(8);
    p.ticks.forEach(([, y1, , y2]) => {
      expect(y1).toBe(10);
      expect(y2).toBe(18);
    });
  });

  test("column going down: hatch above the plate", () => {
    supportPlate([0, 0, -2]).ticks.forEach(([, y1, , y2]) => {
      expect(y1).toBe(-10);
      expect(y2).toBe(-18);
    });
  });

  test("horizontal beam to the right: vertical wall on the left, hatch trailing left", () => {
    const p = supportPlate([4, 0, 0]);
    const xs = p.pts.map(([x]) => x);
    expect(Math.min(...xs)).toBe(-28);
    expect(p.pts.some(([, y]) => y < -50)).toBe(true); // the wall is tall (it rises along z)
    p.ticks.forEach(([x1, , x2]) => {
      expect(x1).toBe(-28);
      expect(x2).toBeLessThan(x1); // away from the member
    });
  });

  test("horizontal beam to the left: hatch on the right", () => {
    supportPlate([-4, 0, 0]).ticks.forEach(([x1, , x2]) => {
      expect(x1).toBe(28);
      expect(x2).toBeGreaterThan(x1);
    });
  });

  test("member along y (toward the viewer for +y): wall face-on, hatch trailing up-right", () => {
    const p = supportPlate([0, 3, 0]);
    expect(p.axis).toBe("y");
    p.ticks.forEach(([x1, y1, x2, y2]) => {
      expect(x2).toBeGreaterThan(x1);
      expect(y2).toBeLessThan(y1);
    });
    supportPlate([0, -3, 0]).ticks.forEach(([x1, y1, x2, y2]) => {
      expect(x2).toBeLessThan(x1);
      expect(y2).toBeGreaterThan(y1);
    });
  });
});
