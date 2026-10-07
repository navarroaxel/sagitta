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

  test("column: My goes 54 -> 0 (UDL), Mx is a constant 29 kN·m (hat moment)", () => {
    const st = sampleMember3D(model, res, 0, 64);
    // course triad of the column: z down, x = −Y (out of the page), y = −X
    const base = st.reduce((b, p) => (p.z > b.z ? p : b)); // z runs downwards: the base has the largest z
    const top = st.reduce((b, p) => (p.z < b.z ? p : b));
    close(Math.abs(base.My), 54, 1e-6); // q_y·L²/2, about the in-plane axis y
    close(Math.abs(base.Mx), 29, 1e-6); // carried over from the hat, about the out-of-plane axis x
    close(top.My, 0, 1e-6);
    close(Math.abs(top.Mx), 29, 1e-6);
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
  test("N, Q and M diagrams match for every member (same magnitude, one sign per member)", () => {
    // The 2D solver uses the engineering convention of the member's own axes; the 3D one the
    // course triad (z down / left, x out of the plane), so Q and M agree up to a sign that is
    // constant along each member.
    m2.members.forEach((_, e) => {
      const s2 = sampleMember(m2, r2, e, 32);
      const s3 = sampleMember3D(m3, r3, e, 32);
      expect(s3.length).toBe(s2.length);
      let sq = 0,
        sm = 0;
      s2.forEach((s, k) => {
        close(s3[k].N, s.N, 1e-6);
        close(Math.abs(s3[k].Qy), Math.abs(s.Q), 1e-6);
        close(Math.abs(s3[k].Mx), Math.abs(s.M), 1e-6);
        if (Math.abs(s.Q) > 1e-6) {
          const f = Math.sign(s3[k].Qy * s.Q);
          if (sq === 0) sq = f;
          expect(f).toBe(sq);
        }
        if (Math.abs(s.M) > 1e-6) {
          const f = Math.sign(s3[k].Mx * s.M);
          if (sm === 0) sm = f;
          expect(f).toBe(sm);
        }
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

  test("tip load in z: PL³/(3·E·Iy), reaction, Mx = +PL (tension on top) at the support", () => {
    const m: Solver3DModel = { ...base, loads: [{ type: "nodal", node: 1, fz: -P }] };
    const res = solveFrame3D(m);
    close(res.U[6 + 2], (-P * L ** 3) / (3 * E * 2e-4), 1e-9);
    close(res.reactions[0].fz, P);
    close(res.reactions[0].my, -P * L);
    const st = sampleMember3D(m, res, 0);
    // course triad of a beam along +x: z = −X, y = Z, x = −Y
    close(st[0].Mx, P * L);
    close(st[st.length - 1].Mx, 0);
    close(st[0].Qy, P);
    close(st[0].z, L); // z runs from the tip (z = 0) towards the support
  });
  test("tip load in y: PL³/(3·E·Iz), reaction, My = +PL and Qx = −P at the support", () => {
    const m: Solver3DModel = { ...base, loads: [{ type: "nodal", node: 1, fy: -P }] };
    const res = solveFrame3D(m);
    close(res.U[6 + 1], (-P * L ** 3) / (3 * E * 5e-5), 1e-9);
    close(res.reactions[0].mz, P * L);
    const st = sampleMember3D(m, res, 0);
    close(st[0].My, P * L);
    close(st[0].Qx, -P); // x = −Y: the face carries +Y, i.e. −x
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
    close(st[0].Qy, P);
    close(st[st.length - 1].Qy, 0);
    close(st[0].Mx, P * L * 0.5);
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

// ─── Partial distributed loads ───────────────────────────────────────────────
describe("partial UDL (from/to)", () => {
  // skewed member so every local axis is exercised
  const nodes = [
    { x: 0, y: 0, z: 0, support: "fixed" as const },
    { x: 2, y: 2, z: 1, support: "pinned" as const },
  ];
  const lenOf = Math.hypot(2, 2, 1); // 3
  const g = { gx: 2, gy: -3, gz: -5 };
  const a = 0.7,
    b = 2.1;

  // one member with the partial load ...
  const single: Solver3DModel = {
    nodes: [...nodes, { x: 5, y: 1, z: 3, support: "free" }],
    members: [
      { i: 0, j: 1, ...mat },
      { i: 1, j: 2, ...mat },
    ],
    loads: [{ type: "mudl", member: 0, ...g, from: a, to: b }],
  };
  // ... and the same member cut at the load ends, full-span load on the middle piece
  const f = (s: number) => [(2 * s) / lenOf, (2 * s) / lenOf, s / lenOf] as const;
  const mesh: Solver3DModel = {
    nodes: [
      nodes[0],
      { x: f(a)[0], y: f(a)[1], z: f(a)[2], support: "free" },
      { x: f(b)[0], y: f(b)[1], z: f(b)[2], support: "free" },
      nodes[1],
      { x: 5, y: 1, z: 3, support: "free" },
    ],
    members: [
      { i: 0, j: 1, ...mat },
      { i: 1, j: 2, ...mat },
      { i: 2, j: 3, ...mat },
      { i: 3, j: 4, ...mat },
    ],
    loads: [{ type: "mudl", member: 1, ...g }],
  };
  const r1 = solveFrame3D(single);
  const r2 = solveFrame3D(mesh);

  test("same reactions as the meshed model", () => {
    [
      [0, 0],
      [1, 3],
    ].forEach(([i, j]) => {
      (["fx", "fy", "fz", "mx", "my", "mz"] as const).forEach((k) =>
        close(r1.reactions[i][k], r2.reactions[j][k], 1e-6),
      );
    });
  });
  test("same displacements at the shared nodes and the free tip", () => {
    close(r1.U[6 * 2 + 0], r2.U[6 * 4 + 0], 1e-7);
    close(r1.U[6 * 2 + 1], r2.U[6 * 4 + 1], 1e-7);
    close(r1.U[6 * 2 + 2], r2.U[6 * 4 + 2], 1e-7);
  });
  test("internal forces match the meshed model along the loaded member", () => {
    const sSingle = sampleMember3D(single, r1, 0, 60);
    const pieces = [0, 1, 2].map((e) => sampleMember3D(mesh, r2, e, 20));
    const offsets = [0, a, b];
    const ref = pieces.flatMap((st, e) => st.map((p) => ({ ...p, x: p.x + offsets[e] })));
    sSingle.forEach((s) => {
      const q = ref.reduce((best, p) => (Math.abs(p.x - s.x) < Math.abs(best.x - s.x) ? p : best));
      if (Math.abs(q.x - s.x) > 1e-3) return;
      (["N", "Qx", "Qy", "T", "Mx", "My"] as const).forEach((k) => close(s[k], q[k], 1e-4));
    });
  });
  test("global equilibrium: reactions balance the resultant g·(b−a)", () => {
    const fx = r1.reactions[0].fx + r1.reactions[1].fx;
    const fz = r1.reactions[0].fz + r1.reactions[1].fz;
    close(fx, -g.gx * (b - a), 1e-9);
    close(fz, -g.gz * (b - a), 1e-9);
  });
  test("from/to covering the whole member is the same as no span", () => {
    const m = (extra: object): Solver3DModel => ({
      ...single,
      loads: [{ type: "mudl", member: 0, ...g, ...extra }],
    });
    const full = solveFrame3D(m({}));
    const spanned = solveFrame3D(m({ from: 0, to: lenOf }));
    full.U.forEach((u, i) => close(spanned.U[i], u, 1e-10));
  });
  test("an empty or reversed span carries no load", () => {
    const m: Solver3DModel = {
      ...single,
      loads: [{ type: "mudl", member: 0, ...g, from: 2, to: 1 }],
    };
    const res = solveFrame3D(m);
    res.reactions.forEach((r) => close(r.fx + r.fy + r.fz, 0, 1e-9));
  });
});
