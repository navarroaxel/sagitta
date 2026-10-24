// Area, centroid and moments of inertia of the basic shapes of the course's table
// ("Características geométricas"). Axes as drawn in the table: X right, Y up, with the origin O at
// the lower-left corner of the shape's bounding box (at the vertex for the quarter circle and the
// sector); Xg, Yg are the parallels through the centroid G. Lengths are unit-less (cm, m…): the
// moments come out in that unit to the fourth.

export type ShapeId =
  | "square"
  | "rectangle"
  | "right_triangle"
  | "isosceles_triangle"
  | "rhombus"
  | "trapezoid"
  | "hexagon"
  | "circle"
  | "semicircle"
  | "quarter_circle"
  | "sector"
  | "ring";

export interface ShapeProps {
  xg: number;
  yg: number;
  F: number; // area
  Jx: number; // about the X axis through O
  Jy: number;
  Jxy: number;
  Jxg: number; // about the centroidal axes
  Jyg: number;
  Jxyg: number;
}
export type PropKey = keyof ShapeProps;

export interface ShapeParam {
  key: string;
  def: number;
  unit?: "°"; // an angle, typed in degrees (the formulas use radians)
}

export interface Loop {
  pts: [number, number][];
  hole?: boolean;
}

export interface BasicShape {
  id: ShapeId;
  params: ShapeParam[];
  valid: (p: Record<string, number>) => boolean;
  props: (p: Record<string, number>) => ShapeProps;
  outline: (p: Record<string, number>) => Loop[]; // y up
  formulas: Record<PropKey, string>; // the closed forms of the table, as text
}

const { PI, sin, cos, sqrt } = Math;
const ARC_N = 1440; // segments of a full circle: fine enough that the polygon is within ~1e-5 of the true shape
const arc = (cx: number, cy: number, r: number, a0: number, a1: number, n: number): [number, number][] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    return [cx + r * cos(a), cy + r * sin(a)];
  });
const pos = (...v: number[]) => v.every((x) => Number.isFinite(x) && x > 0);

const rect = (b: number, h: number): ShapeProps => ({
  xg: b / 2,
  yg: h / 2,
  F: b * h,
  Jx: (b * h ** 3) / 3,
  Jy: (b ** 3 * h) / 3,
  Jxy: (b * b * h * h) / 4,
  Jxg: (b * h ** 3) / 12,
  Jyg: (b ** 3 * h) / 12,
  Jxyg: 0,
});

export const SHAPES: BasicShape[] = [
  {
    id: "square",
    params: [{ key: "h", def: 4 }],
    valid: (p) => pos(p.h),
    props: (p) => rect(p.h, p.h),
    outline: (p) => [{ pts: [[0, 0], [p.h, 0], [p.h, p.h], [0, p.h]] }],
    formulas: {
      xg: "h/2", yg: "h/2", F: "h²",
      Jx: "h⁴/3", Jy: "h⁴/3", Jxy: "h⁴/4",
      Jxg: "h⁴/12", Jyg: "h⁴/12", Jxyg: "0",
    },
  },
  {
    id: "rectangle",
    params: [{ key: "b", def: 4 }, { key: "h", def: 6 }],
    valid: (p) => pos(p.b, p.h),
    props: (p) => rect(p.b, p.h),
    outline: (p) => [{ pts: [[0, 0], [p.b, 0], [p.b, p.h], [0, p.h]] }],
    formulas: {
      xg: "b/2", yg: "h/2", F: "b·h",
      Jx: "b·h³/3", Jy: "b³·h/3", Jxy: "b²·h²/4",
      Jxg: "b·h³/12", Jyg: "b³·h/12", Jxyg: "0",
    },
  },
  {
    id: "right_triangle",
    params: [{ key: "b", def: 4 }, { key: "h", def: 6 }],
    valid: (p) => pos(p.b, p.h),
    props: ({ b, h }) => ({
      xg: b / 3,
      yg: h / 3,
      F: (b * h) / 2,
      Jx: (b * h ** 3) / 12,
      Jy: (b ** 3 * h) / 12,
      Jxy: (b * b * h * h) / 24,
      Jxg: (b * h ** 3) / 36,
      Jyg: (b ** 3 * h) / 36,
      Jxyg: -(b * b * h * h) / 72,
    }),
    outline: ({ b, h }) => [{ pts: [[0, 0], [b, 0], [0, h]] }],
    formulas: {
      xg: "b/3", yg: "h/3", F: "b·h/2",
      Jx: "b·h³/12", Jy: "b³·h/12", Jxy: "b²·h²/24",
      Jxg: "b·h³/36", Jyg: "b³·h/36", Jxyg: "−b²·h²/72",
    },
  },
  {
    id: "isosceles_triangle",
    params: [{ key: "b", def: 4 }, { key: "h", def: 6 }],
    valid: (p) => pos(p.b, p.h),
    props: ({ b, h }) => ({
      xg: b / 2,
      yg: h / 3,
      F: (b * h) / 2,
      Jx: (b * h ** 3) / 12,
      Jy: (7 * b ** 3 * h) / 48,
      Jxy: (b * b * h * h) / 12,
      Jxg: (b * h ** 3) / 36,
      Jyg: (b ** 3 * h) / 48,
      Jxyg: 0,
    }),
    outline: ({ b, h }) => [{ pts: [[0, 0], [b, 0], [b / 2, h]] }],
    formulas: {
      xg: "b/2", yg: "h/3", F: "b·h/2",
      Jx: "b·h³/12", Jy: "7·b³·h/48", Jxy: "b²·h²/12",
      Jxg: "b·h³/36", Jyg: "b³·h/48", Jxyg: "0",
    },
  },
  {
    id: "rhombus",
    params: [{ key: "b", def: 4 }, { key: "h", def: 6 }],
    valid: (p) => pos(p.b, p.h),
    props: ({ b, h }) => ({
      xg: b / 2,
      yg: h / 2,
      F: (b * h) / 2,
      Jx: (7 * b * h ** 3) / 48,
      Jy: (7 * b ** 3 * h) / 48,
      Jxy: (b * b * h * h) / 8,
      Jxg: (b * h ** 3) / 48,
      Jyg: (b ** 3 * h) / 48,
      Jxyg: 0,
    }),
    outline: ({ b, h }) => [{ pts: [[b / 2, 0], [b, h / 2], [b / 2, h], [0, h / 2]] }],
    formulas: {
      xg: "b/2", yg: "h/2", F: "b·h/2",
      Jx: "7·b·h³/48", Jy: "7·b³·h/48", Jxy: "b²·h²/8",
      Jxg: "b·h³/48", Jyg: "b³·h/48", Jxyg: "0",
    },
  },
  {
    id: "trapezoid",
    // base a (on X), top b, height h, symmetric about the vertical through the middle of the base
    params: [{ key: "a", def: 6 }, { key: "b", def: 3 }, { key: "h", def: 5 }],
    valid: (p) => pos(p.a, p.b, p.h),
    props: ({ a, b, h }) => ({
      xg: a / 2,
      yg: ((h / 3) * (a + 2 * b)) / (a + b),
      F: (h / 2) * (a + b),
      Jx: ((h ** 3 / 12) * (a * a + 4 * a * b + 3 * b * b)) / (a + b),
      Jy: (h / 48) * (7 * a ** 3 + 7 * a * a * b + a * b * b + b ** 3),
      Jxy: (h * h * (a * a + 2 * a * b)) / 12,
      Jxg: ((h ** 3 / 36) * (a * a + 4 * a * b + b * b)) / (a + b),
      Jyg: (h / 48) * (a ** 3 + a * a * b + a * b * b + b ** 3),
      Jxyg: 0,
    }),
    outline: ({ a, b, h }) => [{ pts: [[0, 0], [a, 0], [(a + b) / 2, h], [(a - b) / 2, h]] }],
    formulas: {
      xg: "a/2", yg: "h/3 · (a + 2b)/(a + b)", F: "h/2 · (a + b)",
      Jx: "h³/12 · (a² + 4ab + 3b²)/(a + b)",
      Jy: "h/48 · (7a³ + 7a²b + ab² + b³)",
      Jxy: "h²/12 · (a² + 2ab)",
      Jxg: "h³/36 · (a² + 4ab + b²)/(a + b)",
      Jyg: "h/48 · (a³ + a²b + ab² + b³)",
      Jxyg: "0",
    },
  },
  {
    id: "hexagon",
    // regular, side r, with a vertex at the left and at the right (the table's drawing)
    params: [{ key: "r", def: 3 }],
    valid: (p) => pos(p.r),
    props: ({ r }) => ({
      xg: r,
      yg: (sqrt(3) * r) / 2,
      F: ((3 * sqrt(3)) / 2) * r * r,
      Jx: (207 * sqrt(3) * r ** 4) / 144,
      Jy: (261 * sqrt(3) * r ** 4) / 144,
      Jxy: (9 * r ** 4) / 4,
      Jxg: (45 * sqrt(3) * r ** 4) / 144,
      Jyg: (45 * sqrt(3) * r ** 4) / 144,
      Jxyg: 0,
    }),
    outline: ({ r }) => {
      const h = (sqrt(3) * r) / 2;
      return [{ pts: [[0, h], [r / 2, 0], [(3 * r) / 2, 0], [2 * r, h], [(3 * r) / 2, 2 * h], [r / 2, 2 * h]] }];
    },
    formulas: {
      xg: "r", yg: "√3·r/2", F: "3√3/2 · r²",
      Jx: "207·√3·r⁴/144", Jy: "261·√3·r⁴/144", Jxy: "9·r⁴/4",
      Jxg: "45·√3·r⁴/144", Jyg: "45·√3·r⁴/144", Jxyg: "0",
    },
  },
  {
    id: "circle",
    params: [{ key: "r", def: 3 }],
    valid: (p) => pos(p.r),
    props: ({ r }) => ({
      xg: r,
      yg: r,
      F: PI * r * r,
      Jx: (5 * PI * r ** 4) / 4,
      Jy: (5 * PI * r ** 4) / 4,
      Jxy: PI * r ** 4,
      Jxg: (PI * r ** 4) / 4,
      Jyg: (PI * r ** 4) / 4,
      Jxyg: 0,
    }),
    outline: ({ r }) => [{ pts: arc(r, r, r, 0, 2 * PI, ARC_N).slice(0, -1) }],
    formulas: {
      xg: "r", yg: "r", F: "π·r² = π·D²/4",
      Jx: "5π·r⁴/4 = 5π·D⁴/64", Jy: "5π·r⁴/4 = 5π·D⁴/64", Jxy: "π·r⁴ = π·D⁴/16",
      Jxg: "π·r⁴/4 = π·D⁴/64", Jyg: "π·r⁴/4 = π·D⁴/64", Jxyg: "0",
    },
  },
  {
    id: "semicircle",
    params: [{ key: "r", def: 3 }],
    valid: (p) => pos(p.r),
    props: ({ r }) => ({
      xg: r,
      yg: (4 * r) / (3 * PI),
      F: (PI * r * r) / 2,
      Jx: (PI * r ** 4) / 8,
      Jy: (5 * PI * r ** 4) / 8,
      Jxy: (2 * r ** 4) / 3,
      Jxg: r ** 4 * (PI / 8 - 8 / (9 * PI)),
      Jyg: (PI * r ** 4) / 8,
      Jxyg: 0,
    }),
    outline: ({ r }) => [{ pts: arc(r, 0, r, 0, PI, ARC_N / 2) }],
    formulas: {
      xg: "r", yg: "4r/(3π)", F: "π·r²/2 = π·D²/8",
      Jx: "π·r⁴/8 = π·D⁴/128", Jy: "5π·r⁴/8 = 5π·D⁴/128", Jxy: "2·r⁴/3",
      Jxg: "r⁴·(π/8 − 8/(9π))", Jyg: "π·r⁴/8 = π·D⁴/128", Jxyg: "0",
    },
  },
  {
    id: "quarter_circle",
    params: [{ key: "r", def: 4 }],
    valid: (p) => pos(p.r),
    props: ({ r }) => ({
      xg: (4 * r) / (3 * PI),
      yg: (4 * r) / (3 * PI),
      F: (PI * r * r) / 4,
      Jx: (PI * r ** 4) / 16,
      Jy: (PI * r ** 4) / 16,
      Jxy: r ** 4 / 8,
      Jxg: r ** 4 * (PI / 16 - 4 / (9 * PI)),
      Jyg: r ** 4 * (PI / 16 - 4 / (9 * PI)),
      Jxyg: r ** 4 * (1 / 8 - 4 / (9 * PI)),
    }),
    outline: ({ r }) => [{ pts: [[0, 0], ...arc(0, 0, r, 0, PI / 2, ARC_N / 4)] }],
    formulas: {
      xg: "4r/(3π)", yg: "4r/(3π)", F: "π·r²/4 = π·D²/16",
      Jx: "π·r⁴/16 = π·D⁴/256", Jy: "π·r⁴/16 = π·D⁴/256", Jxy: "r⁴/8",
      Jxg: "r⁴·(π/16 − 4/(9π))", Jyg: "r⁴·(π/16 − 4/(9π))", Jxyg: "r⁴·(1/8 − 4/(9π))",
    },
  },
  {
    id: "sector",
    // vertex at the origin, bisector along X, half-angle α (typed in degrees), radius r
    params: [{ key: "r", def: 4 }, { key: "alpha", def: 60, unit: "°" }],
    valid: (p) => pos(p.r, p.alpha) && p.alpha <= 180,
    props: ({ r, alpha }) => {
      const a = (alpha * PI) / 180;
      const xg = ((2 / 3) * r * sin(a)) / a;
      return {
        xg,
        yg: 0,
        F: a * r * r,
        Jx: (r ** 4 / 4) * (a - sin(2 * a) / 2),
        Jy: (r ** 4 / 4) * (a + sin(2 * a) / 2),
        Jxy: 0,
        Jxg: (r ** 4 / 4) * (a - sin(2 * a) / 2),
        Jyg: r ** 4 * (a / 4 + sin(2 * a) / 8 - (4 * sin(a) ** 2) / (9 * a)),
        Jxyg: 0,
      };
    },
    outline: ({ r, alpha }) => {
      const a = (alpha * PI) / 180;
      return [{ pts: [[0, 0], ...arc(0, 0, r, -a, a, ARC_N)] }];
    },
    formulas: {
      xg: "2/3 · r·sen(α)/α", yg: "0", F: "α·r²",
      Jx: "r⁴/4 · (α − sen(2α)/2)", Jy: "r⁴/4 · (α + sen(2α)/2)", Jxy: "0",
      Jxg: "r⁴/4 · (α − sen(2α)/2)",
      Jyg: "r⁴ · (α/4 + sen(2α)/8 − 4·sen²(α)/(9α))",
      Jxyg: "0",
    },
  },
  {
    id: "ring",
    params: [{ key: "R", def: 4 }, { key: "r", def: 3 }],
    valid: (p) => pos(p.R, p.r) && p.r < p.R,
    props: ({ R, r }) => ({
      xg: R,
      yg: R,
      F: PI * (R * R - r * r),
      Jx: (PI / 4) * (5 * R ** 4 - 4 * R * R * r * r - r ** 4),
      Jy: (PI / 4) * (5 * R ** 4 - 4 * R * R * r * r - r ** 4),
      Jxy: PI * R * R * (R * R - r * r),
      Jxg: (PI / 4) * (R ** 4 - r ** 4),
      Jyg: (PI / 4) * (R ** 4 - r ** 4),
      Jxyg: 0,
    }),
    outline: ({ R, r }) => [
      { pts: arc(R, R, R, 0, 2 * PI, ARC_N).slice(0, -1) },
      { pts: arc(R, R, r, 0, 2 * PI, ARC_N).slice(0, -1), hole: true },
    ],
    formulas: {
      xg: "R", yg: "R", F: "π·(R² − r²)",
      Jx: "π/4 · (5R⁴ − 4R²·r² − r⁴)", Jy: "π/4 · (5R⁴ − 4R²·r² − r⁴)", Jxy: "π·R²·(R² − r²)",
      Jxg: "π/4 · (R⁴ − r⁴)", Jyg: "π/4 · (R⁴ − r⁴)", Jxyg: "0",
    },
  },
];

export const shapeById = (id: ShapeId): BasicShape => SHAPES.find((s) => s.id === id)!;
export const defaults = (s: BasicShape): Record<string, number> =>
  Object.fromEntries(s.params.map((q) => [q.key, q.def]));

// The same quantities by numerical integration over the outline (Green's theorem on the polygon):
// used by the tests to check every closed form above against an independent computation.
export function integrate(loops: Loop[]): ShapeProps {
  let A = 0, Sx = 0, Sy = 0, Jx = 0, Jy = 0, Jxy = 0;
  loops.forEach(({ pts, hole }) => {
    // orient the outer loops counter-clockwise and the holes clockwise
    let area2 = 0;
    pts.forEach(([x1, y1], i) => {
      const [x2, y2] = pts[(i + 1) % pts.length];
      area2 += x1 * y2 - x2 * y1;
    });
    const sgn = (area2 > 0 ? 1 : -1) * (hole ? -1 : 1);
    pts.forEach(([x1, y1], i) => {
      const [x2, y2] = pts[(i + 1) % pts.length];
      const c = (x1 * y2 - x2 * y1) * sgn;
      A += c / 2;
      Sx += (c * (y1 + y2)) / 6;
      Sy += (c * (x1 + x2)) / 6;
      Jx += (c * (y1 * y1 + y1 * y2 + y2 * y2)) / 12;
      Jy += (c * (x1 * x1 + x1 * x2 + x2 * x2)) / 12;
      Jxy += (c * (x1 * y2 + 2 * x1 * y1 + 2 * x2 * y2 + x2 * y1)) / 24;
    });
  });
  const xg = Sy / A,
    yg = Sx / A;
  return {
    xg,
    yg,
    F: A,
    Jx,
    Jy,
    Jxy,
    Jxg: Jx - A * yg * yg,
    Jyg: Jy - A * xg * xg,
    Jxyg: Jxy - A * xg * yg,
  };
}
