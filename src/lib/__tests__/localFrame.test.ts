import { courseFrame } from "../localFrame";
import { memberGeo, type Vec3, type Solver3DNode } from "../solver3d";
import { solveModel3D } from "../solve3d";
import { PRESETS_3D } from "../presets3d";
import type { FrameModel3D } from "../types3d";

const node = (x: number, y: number, z: number): Solver3DNode => ({ x, y, z, support: "free" });
const frame = (a: Solver3DNode, b: Solver3DNode) => courseFrame(memberGeo(a, b));
const near3 = (a: Vec3, b: Vec3) => a.forEach((v, i) => expect(v).toBeCloseTo(b[i], 9));
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

// Professor's convention: z along the member (down, or to the left when horizontal),
// x out of the plane (towards the viewer, −Y), y to the right (columns) or down (beams).
// It is a LEFT-handed triad: x × y = −z.
describe("courseFrame", () => {
  test("column: z down, x out of the page, y to the right — however the member is defined", () => {
    [frame(node(0, 0, 0), node(0, 0, 6)), frame(node(0, 0, 6), node(0, 0, 0))].forEach((f) => {
      near3(f.z, [0, 0, -1]);
      near3(f.x, [0, -1, 0]);
      near3(f.y, [1, 0, 0]);
    });
  });
  test("beam: z to the left, x out of the page, y down — however the member is defined", () => {
    [frame(node(0, 0, 6), node(5, 0, 6)), frame(node(5, 0, 6), node(0, 0, 6))].forEach((f) => {
      near3(f.z, [-1, 0, 0]);
      near3(f.x, [0, -1, 0]);
      near3(f.y, [0, 0, -1]);
    });
  });
  test("flip tells whether z points from node j to node i", () => {
    expect(frame(node(0, 0, 0), node(0, 0, 6)).flip).toBe(true); // up, z down
    expect(frame(node(0, 0, 6), node(0, 0, 0)).flip).toBe(false);
    expect(frame(node(0, 0, 6), node(5, 0, 6)).flip).toBe(true); // right, z left
    expect(frame(node(5, 0, 6), node(0, 0, 6)).flip).toBe(false);
  });
  test("inclined member in the x-z plane: z points down, x still out of the page", () => {
    const f = frame(node(0, 0, 0), node(-3, 0, -4)); // going down-left
    near3(f.z, [-0.6, 0, -0.8]);
    near3(f.x, [0, -1, 0]);
    const g = frame(node(0, 0, 0), node(3, 0, 4)); // going up-right: z reversed
    near3(g.z, [-0.6, 0, -0.8]);
  });
  test("member along Y: z = −Y, y down, x = +X", () => {
    const f = frame(node(0, 0, 0), node(0, 3, 0));
    near3(f.z, [0, -1, 0]);
    near3(f.y, [0, 0, -1]);
    near3(f.x, [1, 0, 0]);
  });
  test("always an orthonormal left-handed triad (x × y = −z)", () => {
    const ends: [Solver3DNode, Solver3DNode][] = [
      [node(0, 0, 0), node(1, 2, 3)],
      [node(2, -1, 4), node(-3, 5, 4)],
      [node(0, 0, 0), node(0, 0, -2)],
      [node(1, 1, 1), node(1, 7, 1)],
    ];
    ends.forEach(([a, b]) => {
      const f = frame(a, b);
      [f.x, f.y, f.z].forEach((v) => expect(Math.hypot(...v)).toBeCloseTo(1, 9));
      expect(dot(f.x, f.y)).toBeCloseTo(0, 9);
      expect(dot(f.y, f.z)).toBeCloseTo(0, 9);
      near3(cross(f.x, f.y), [-f.z[0], -f.z[1], -f.z[2]]);
    });
  });
});

describe("internal forces in the course convention do not depend on how the member is defined", () => {
  const cantilever = (reversed: boolean): FrameModel3D => ({
    nodes: reversed
      ? [
          { id: "B", x: 4, y: 0, z: 0, support: "free" },
          { id: "A", x: 0, y: 0, z: 0, support: "fixed" },
        ]
      : [
          { id: "A", x: 0, y: 0, z: 0, support: "fixed" },
          { id: "B", x: 4, y: 0, z: 0, support: "free" },
        ],
    members: [reversed ? { id: "M", n1: "B", n2: "A" } : { id: "M", n1: "A", n2: "B" }],
    loads: [
      { id: "L", type: "nodal", node: "B", fx: 5, fy: -3, fz: -10, mx: 2, my: 0, mz: 0 },
      { id: "Q", type: "mudl", member: "M", gx: 0, gy: 1, gz: -2 },
    ],
    material: { E: 2.1e8, G: 8.1e7, A: 0.01, Ix: 8.3e-5, Iy: 4e-5, J: 1.6e-4 },
    unit: "kN",
    sigmaAdm: 14,
  });
  test("same N, Qx, Qy, T, Mx, My at the same z", () => {
    const a = solveModel3D(cantilever(false))!.stations[0];
    const b = solveModel3D(cantilever(true))!.stations[0];
    const at = (st: typeof a, z: number) => st.reduce((m, s) => (Math.abs(s.z - z) < Math.abs(m.z - z) ? s : m));
    [0, 0.5, 1.7, 3, 4].forEach((z) => {
      const p = at(a, z),
        q = at(b, z);
      (["N", "Qx", "Qy", "T", "Mx", "My"] as const).forEach((k) =>
        expect(p[k]).toBeCloseTo(q[k], 6),
      );
    });
  });
});

describe("T-frame preset: forces on the column", () => {
  const model = PRESETS_3D[0].model;
  const st = solveModel3D(model)!.stations[0]; // column, defined A (bottom) -> B (top)
  test("z grows downwards: the base is at z = L, the top at z = 0", () => {
    const base = st.find((s) => Math.abs(s.x) < 1e-9)!;
    expect(base.z).toBeCloseTo(6, 9);
    expect(st.find((s) => Math.abs(s.x - 6) < 1e-9)!.z).toBeCloseTo(0, 9);
  });
  test("N is compression (the 8 kN reaction pushes up on the column)", () => {
    st.forEach((s) => expect(s.N).toBeCloseTo(-8, 6));
  });
});
