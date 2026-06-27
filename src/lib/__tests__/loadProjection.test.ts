import {
  pointLoadPos,
  pointAlongMember,
  udlArrowFractions,
  UDL_ARROW_COUNT,
  UDL_LABEL_INDEX,
} from "../loadProjection";

const I = { x: 0, y: 0 };
const J = { x: 10, y: 0 }; // horizontal member, L = 10
const D = { x: 3, y: 4 }; // diagonal from origin, L = 5

describe("pointLoadPos – in-range placement", () => {
  test("dist = 0 sits exactly at the i-end", () => {
    expect(pointLoadPos(I, J, 0)).toEqual({ x: 0, y: 0 });
  });

  test("dist = L sits exactly at the j-end", () => {
    expect(pointLoadPos(I, J, 10)).toEqual({ x: 10, y: 0 });
  });

  test("interior dist interpolates along the axis", () => {
    expect(pointLoadPos(I, J, 5)).toEqual({ x: 5, y: 0 });
  });

  test("works on a diagonal member (unit axis × dist)", () => {
    const p = pointLoadPos(I, D, 2.5); // half of L = 5
    expect(p.x).toBeCloseTo(1.5, 9);
    expect(p.y).toBeCloseTo(2.0, 9);
  });
});

describe("pointLoadPos – out-of-range is ALLOWED (extrapolates, not clamped/rejected)", () => {
  test("dist > L extrapolates beyond the j-end", () => {
    expect(pointLoadPos(I, J, 15)).toEqual({ x: 15, y: 0 });
  });

  test("dist < 0 extrapolates before the i-end", () => {
    expect(pointLoadPos(I, J, -5)).toEqual({ x: -5, y: 0 });
  });

  test("out-of-range on a diagonal stays on the member line", () => {
    const p = pointLoadPos(I, D, 10); // 2× L
    expect(p.x).toBeCloseTo(6, 9);
    expect(p.y).toBeCloseTo(8, 9);
  });
});

describe("pointAlongMember – parametric placement", () => {
  test("t = 0 → i-end, t = 1 → j-end", () => {
    expect(pointAlongMember(I, D, 0)).toEqual({ x: 0, y: 0 });
    expect(pointAlongMember(I, D, 1)).toEqual({ x: 3, y: 4 });
  });

  test("t = 0.5 → midpoint", () => {
    expect(pointAlongMember(I, D, 0.5)).toEqual({ x: 1.5, y: 2 });
  });
});

describe("udlArrowFractions – UDL arrow placement", () => {
  test("default count spans endpoints inclusively, evenly spaced", () => {
    expect(udlArrowFractions(5)).toEqual([0, 0.25, 0.5, 0.75, 1]);
  });

  test("first and last fractions are the member endpoints", () => {
    const fr = udlArrowFractions(UDL_ARROW_COUNT);
    expect(fr[0]).toBe(0);
    expect(fr[fr.length - 1]).toBe(1);
  });

  test("the label-bearing arrow is the midpoint", () => {
    const fr = udlArrowFractions(UDL_ARROW_COUNT);
    expect(fr[UDL_LABEL_INDEX]).toBe(0.5);
  });

  test("degenerate count (≤1) returns a single arrow at the i-end", () => {
    expect(udlArrowFractions(1)).toEqual([0]);
    expect(udlArrowFractions(0)).toEqual([0]);
  });
});
