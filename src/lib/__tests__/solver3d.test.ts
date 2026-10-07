import { solveFrame3D, Solver3DModel, Solver3DMember } from "../solver3d";
import { sampleMember3D } from "../sampling3d";
import { solveFrame, SolverModel } from "../solver";
import { sampleMember } from "../sampling";

const E = 2.1e8,
  G = 8.1e7,
  A = 0.01,
  I = 8.3e-5,
  J = 1.6e-4;
const mat: Omit<Solver3DMember, "i" | "j"> = { E, G, A, Iy: I, Iz: I, J };

const close = (a: number, b: number, tol = 1e-6) =>
  expect(Math.abs(a - b)).toBeLessThan(tol * Math.max(1, Math.abs(b)));

// ─── 3D T-frame, fixed at A (examples/t-frame-3d-fixed.svg) ──────────────────
describe("3D T-frame, fixed base", () => {
  const model: Solver3DModel = {
    nodes: [
      { x: 0, y: 0, z: 0, support: "fixed" }, // 0 A
      { x: 0, y: 0, z: 6, support: "free" }, // 1 B
      { x: -2, y: 0, z: 6, support: "free" }, // 2 C
      { x: 1, y: 0, z: 6, support: "free" }, // 3 E (start of q_z)
      { x: 5, y: 0, z: 6, support: "free" }, // 4 D
    ],
    members: [
      { i: 0, j: 1, ...mat }, // column
      { i: 2, j: 1, ...mat }, // left arm
      { i: 1, j: 3, ...mat },
      { i: 3, j: 4, ...mat },
    ],
    loads: [
      { type: "mudl", member: 0, gx: 0, gy: 3, gz: 0 },
      { type: "mudl", member: 3, gx: 0, gy: 0, gz: -2 },
      { type: "nodal", node: 2, my: 5 },
    ],
  };
  const res = solveFrame3D(model);
  const R = res.reactions[0];

  test("stable", () => expect(res.stable).toBe(true));
  test("Fx = 0", () => close(R.fx, 0));
  test("Fy = -18 (18 kN along -y)", () => close(R.fy, -18));
  test("Fz = 8 (up)", () => close(R.fz, 8));
  test("Mx = 54", () => close(R.mx, 54));
  test("My = -29 (29 kN·m along -y)", () => close(R.my, -29));
  test("Mz = 0", () => close(R.mz, 0));

  test("column: Mz goes 54 -> 0 (UDL), My is a constant 29 kN·m (hat moment)", () => {
    const st = sampleMember3D(model, res, 0, 64);
    close(Math.abs(st[0].Mz), 54, 1e-6); // q_y·L²/2 (local y' = global y)
    close(Math.abs(st[0].My), 29, 1e-6); // carried over from the hat
    close(st[st.length - 1].Mz, 0, 1e-6);
    close(Math.abs(st[st.length - 1].My), 29, 1e-6);
  });
});

// ─── Planar frame in the x-z plane must reproduce the 2D solver ──────────────
describe("planar portal in x-z == 2D solver", () => {
  const mat2 = { E, A, I };
  const m2: SolverModel = {
    nodes: [
      { x: 0, y: 0, support: "fixed" },
      { x: 0, y: 4, support: "free" },
      { x: 6, y: 4, support: "free" },
      { x: 6, y: 0, support: "pinned" },
    ],
    members: [
      { i: 0, j: 1, ...mat2 },
      { i: 1, j: 2, ...mat2 },
      { i: 3, j: 2, ...mat2 },
    ],
    loads: [
      { type: "mudl", member: 1, gx: 0, gy: -12 },
      { type: "mpoint", member: 0, dist: 1.5, gx: 7, gy: 0 },
      { type: "nodal", node: 2, fx: 3, fy: -2, m: 0 },
    ],
  };
  const m3: Solver3DModel = {
    nodes: m2.nodes.map((n) => ({
      x: n.x,
      y: 0,
      z: n.y,
      support: n.support === "free" ? "free" : "fixed",
      restraint:
        n.support === "pinned"
          ? [true, true, true, false, false, false]
          : n.support === "fixed"
            ? [true, true, true, true, true, true]
            : undefined,
    })),
    members: m2.members.map((m) => ({ i: m.i, j: m.j, ...mat })),
    loads: [
      { type: "mudl", member: 1, gx: 0, gy: 0, gz: -12 },
      { type: "mpoint", member: 0, dist: 1.5, gx: 7, gy: 0, gz: 0 },
      { type: "nodal", node: 2, fx: 3, fz: -2 },
    ],
  };
  // out-of-plane DOFs of the pinned node would be a mechanism; restrain y there
  m3.nodes[3].restraint = [true, true, true, false, false, false];
  // keep the structure planar: restrain out-of-plane motion/rotation of every free node
  m3.nodes.forEach((n, i) => {
    const r = n.restraint ?? [false, false, false, false, false, false];
    if (i !== 0)
      n.restraint = [r[0], true, r[2], true, r[4], true] as typeof r;
  });
  const r2 = solveFrame(m2);
  const r3 = solveFrame3D(m3);

  test("both stable", () => {
    expect(r2.stable).toBe(true);
    expect(r3.stable).toBe(true);
  });
  test("reactions match (rx, ry<->fz, moment<->-my)", () => {
    m2.nodes.forEach((n, i) => {
      if (n.support === "free") return;
      close(r3.reactions[i].fx, r2.reactions[i].rx, 1e-7);
      close(r3.reactions[i].fz, r2.reactions[i].ry, 1e-7);
    });
    close(r3.reactions[0].my, -r2.reactions[0].rm, 1e-7);
  });
  test("displacements match (ux, uz<->uy, ry<->-rz)", () => {
    m2.nodes.forEach((_, i) => {
      close(r3.U[6 * i], r2.U[3 * i], 1e-7);
      close(r3.U[6 * i + 2], r2.U[3 * i + 1], 1e-7);
      close(r3.U[6 * i + 4], -r2.U[3 * i + 2], 1e-7);
    });
  });
  test("N, V and M diagrams match for every member", () => {
    m2.members.forEach((_, e) => {
      const s2 = sampleMember(m2, r2, e, 32);
      const s3 = sampleMember3D(m3, r3, e, 32);
      expect(s3.length).toBe(s2.length);
      s2.forEach((s, k) => {
        close(s3[k].N, s.N, 1e-6);
        close(s3[k].Qz, s.Q, 1e-6);
        close(s3[k].My, s.M, 1e-6);
      });
    });
  });
});

// ─── Cantilever: deflection in both bending planes, and torsion ──────────────
describe("cantilever along x", () => {
  const L = 4,
    P = 10;
  const base: Solver3DModel = {
    nodes: [
      { x: 0, y: 0, z: 0, support: "fixed" },
      { x: L, y: 0, z: 0, support: "free" },
    ],
    members: [{ i: 0, j: 1, ...mat, Iy: 2e-4, Iz: 5e-5 }],
    loads: [],
  };

  test("tip load in z: PL³/(3·E·Iy), reaction and hogging My", () => {
    const m: Solver3DModel = { ...base, loads: [{ type: "nodal", node: 1, fz: -P }] };
    const res = solveFrame3D(m);
    close(res.U[6 + 2], (-P * L ** 3) / (3 * E * 2e-4), 1e-9);
    close(res.reactions[0].fz, P);
    close(res.reactions[0].my, -P * L);
    const st = sampleMember3D(m, res, 0);
    close(st[0].My, -P * L);
    close(st[st.length - 1].My, 0);
    close(st[0].Qz, P);
  });
  test("tip load in y: PL³/(3·E·Iz), reaction and hogging Mz", () => {
    const m: Solver3DModel = { ...base, loads: [{ type: "nodal", node: 1, fy: -P }] };
    const res = solveFrame3D(m);
    close(res.U[6 + 1], (-P * L ** 3) / (3 * E * 5e-5), 1e-9);
    close(res.reactions[0].mz, P * L);
    const st = sampleMember3D(m, res, 0);
    close(st[0].Mz, -P * L);
    close(st[0].Qy, P);
  });
  test("tip torque: twist T·L/(G·J), constant torsor", () => {
    const m: Solver3DModel = { ...base, loads: [{ type: "nodal", node: 1, mx: 7 }] };
    const res = solveFrame3D(m);
    close(res.U[6 + 3], (7 * L) / (G * J), 1e-9);
    close(res.reactions[0].mx, -7);
    const st = sampleMember3D(m, res, 0);
    st.forEach((s) => close(s.T, 7));
  });
  test("axial tip load: tension is positive", () => {
    const m: Solver3DModel = { ...base, loads: [{ type: "nodal", node: 1, fx: 5 }] };
    const res = solveFrame3D(m);
    close(res.U[6], (5 * L) / (E * A), 1e-9);
    sampleMember3D(m, res, 0).forEach((s) => close(s.N, 5));
  });
  test("point load at mid-span: shear jump of P across the load", () => {
    const m: Solver3DModel = {
      ...base,
      loads: [{ type: "mpoint", member: 0, dist: L / 2, gx: 0, gy: 0, gz: -P }],
    };
    const res = solveFrame3D(m);
    const st = sampleMember3D(m, res, 0);
    close(st[0].Qz, P);
    close(st[st.length - 1].Qz, 0);
    close(st[0].My, -P * L * 0.5);
  });
});

// ─── Global equilibrium of a skewed, fully 3D structure ──────────────────────
describe("skewed 3D frame: global equilibrium", () => {
  const model: Solver3DModel = {
    nodes: [
      { x: 0, y: 0, z: 0, support: "fixed" },
      { x: 3, y: 2, z: 4, support: "free" },
      { x: 6, y: -1, z: 5, support: "free" },
      { x: 7, y: 3, z: 0, support: "pinned" },
    ],
    members: [
      { i: 0, j: 1, ...mat },
      { i: 1, j: 2, ...mat },
      { i: 3, j: 2, ...mat },
    ],
    loads: [
      { type: "mudl", member: 1, gx: 1, gy: -2, gz: -5 },
      { type: "mpoint", member: 2, dist: 2, gx: 3, gy: 4, gz: -6 },
      { type: "nodal", node: 1, fx: 2, fy: -1, fz: 3, mx: 1, my: -2, mz: 4 },
    ],
  };
  const res = solveFrame3D(model);

  test("stable", () => expect(res.stable).toBe(true));
  test("sum of forces and moments about the origin is zero", () => {
    const sum = { f: [0, 0, 0], m: [0, 0, 0] };
    const add = (p: number[], f: number[], mom: number[] = [0, 0, 0]) => {
      sum.f[0] += f[0];
      sum.f[1] += f[1];
      sum.f[2] += f[2];
      sum.m[0] += mom[0] + p[1] * f[2] - p[2] * f[1];
      sum.m[1] += mom[1] + p[2] * f[0] - p[0] * f[2];
      sum.m[2] += mom[2] + p[0] * f[1] - p[1] * f[0];
    };
    res.reactions.forEach((r, i) => {
      const n = model.nodes[i];
      add([n.x, n.y, n.z], [r.fx, r.fy, r.fz], [r.mx, r.my, r.mz]);
    });
    model.loads.forEach((l) => {
      if (l.type === "nodal") {
        const n = model.nodes[l.node];
        add(
          [n.x, n.y, n.z],
          [l.fx || 0, l.fy || 0, l.fz || 0],
          [l.mx || 0, l.my || 0, l.mz || 0],
        );
      } else {
        const m = model.members[l.member];
        const a = model.nodes[m.i],
          b = model.nodes[m.j];
        const L = res.geo[l.member].L;
        if (l.type === "mudl") {
          add(
            [(a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2],
            [l.gx * L, l.gy * L, l.gz * L],
          );
        } else {
          const t = l.dist / L;
          add(
            [a.x + t * (b.x - a.x), a.y + t * (b.y - a.y), a.z + t * (b.z - a.z)],
            [l.gx, l.gy, l.gz],
          );
        }
      }
    });
    sum.f.forEach((v) => expect(Math.abs(v)).toBeLessThan(1e-6));
    sum.m.forEach((v) => expect(Math.abs(v)).toBeLessThan(1e-6));
  });

  test("end forces are in equilibrium member by member (axial)", () => {
    // free end of a member with no load: local end forces sum to zero along x'
    const e = 0;
    const fl = res.memForces[e];
    expect(Math.abs(fl[0] + fl[6])).toBeLessThan(1e-6);
  });
});

describe("mechanism detection", () => {
  test("a free-floating member is reported unstable", () => {
    const res = solveFrame3D({
      nodes: [
        { x: 0, y: 0, z: 0, support: "pinned" },
        { x: 4, y: 0, z: 0, support: "free" },
      ],
      members: [{ i: 0, j: 1, ...mat }],
      loads: [{ type: "nodal", node: 1, fz: -1 }],
    });
    // pinned at one end only: it can rotate about the support
    expect(res.stable).toBe(false);
  });
});
