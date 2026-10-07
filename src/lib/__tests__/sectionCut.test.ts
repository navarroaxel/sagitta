import { cutAt, nearestStation, sectionOutline } from "../sectionCut";
import { solveModel3D } from "../solve3d";
import { PRESETS_3D } from "../presets3d";
import { getProfile } from "../profiles";
import type { FrameModel3D } from "../types3d";

const near = (a: number, b: number, tol = 1e-6) =>
  expect(Math.abs(a - b)).toBeLessThan(tol * Math.max(1, Math.abs(b)));

const mat = { E: 2.1e8, G: 8.1e7, A: 0.01, Ix: 8.3e-5, Iy: 8.3e-5, J: 1.6e-4 };
const cantilever = (load: object, member: object = {}): FrameModel3D => ({
  nodes: [
    { id: "A", x: 0, y: 0, z: 0, support: "fixed" },
    { id: "B", x: 4, y: 0, z: 0, support: "free" },
  ],
  members: [{ id: "M1", n1: "A", n2: "B", profile: "IPB 200", ...member }],
  loads: [{ id: "L1", type: "nodal", node: "B", fx: 0, fy: 0, fz: 0, mx: 0, my: 0, mz: 0, ...load }],
  material: mat,
  unit: "kN",
  sigmaAdm: 14,
});
// z runs from the free end (z = 0) towards the support (z = 4 m) for this cantilever
const cut = (m: FrameModel3D, z = 4) => {
  const s = solveModel3D(m)!;
  return cutAt(m, s, 0, nearestStation(s, 0, z))!;
};

describe("cutAt", () => {
  const p = getProfile("IPB 200")!;
  const model = cantilever({ fz: -10, fy: 5, fx: 50 });
  const c = cut(model);

  test("the four corners add up the three contributions", () => {
    c.corners.forEach((k) => near(k.sigma, k.sN + k.sMx + k.sMy, 1e-12));
    near(c.corners[0].sN, 50 / (p.A * 1e-4) / 1e4);
  });
  test("Mx stress is antisymmetric in y, My stress antisymmetric in x (the 'Z' shapes)", () => {
    const [pp, pm, mp, mm] = c.corners; // (+x,+y) (+x,−y) (−x,+y) (−x,−y)
    near(pp.sMx, -pm.sMx);
    near(pp.sMy, -mp.sMy);
    near(pp.sMx, mp.sMx);
    near(mm.sMy, -pm.sMy);
    near(pp.sMx, -40 / (p.Sx * 1e-6) / 1e4, 1e-3); // Mx = −40 kN·m: the +y (bottom) fibres are in compression
    near(pp.sMy, 20 / (p.Sy * 1e-6) / 1e4, 1e-3); // fy = +5 → My = +20 → tension at +x
  });
  test("the critical corner matches the member's σ max", () => {
    near(Math.abs(c.critical.sigma), Math.abs(Math.max(...c.corners.map((k) => Math.abs(k.sigma)))));
  });
  test("neutral axis: σ = 0 at both of its end points", () => {
    expect(c.neutral).not.toBeNull();
    const k = c.corners[0]; // (+x,+y)
    const a = k.sN,
      bCoef = k.sMy / k.x, // σ = a + b·x + c·y
      cCoef = k.sMx / k.y;
    c.neutral!.forEach(([x, y]) => near(a + bCoef * x + cCoef * y, 0, 1e-6));
  });
  test("pure axial load has no neutral axis inside the box", () => {
    expect(cut(cantilever({ fx: 50 })).neutral).toBeNull();
  });
  test("a member without a profile has no cut", () => {
    const m = cantilever({ fz: -10 }, { profile: undefined });
    expect(cutAt(m, solveModel3D(m)!, 0, 0)).toBeNull();
  });
  test("stress changes along the member: zero moment at the free end", () => {
    const m = cantilever({ fz: -10 });
    const s = solveModel3D(m)!;
    const tip = cutAt(m, s, 0, nearestStation(s, 0, 0))!;
    near(tip.Mx, 0);
    near(tip.critical.sigma, 0);
  });
  test("preset cut reproduces the member peak", () => {
    const t = PRESETS_3D[0].model;
    const s = solveModel3D(t)!;
    const col = cutAt(t, s, 0, nearestStation(s, 0, 6))!; // column base (z runs downwards), IPB 260 rotated
    const p = getProfile("IPB 260")!;
    const bending = (54 / (p.Ix * 1e-8 / (p.h / 2000)) + 29 / (p.Iy * 1e-8 / (p.bf / 2000))) / 1e4;
    near(Math.abs(col.critical.sigma), bending + 8 / (p.A * 1e-4) / 1e4, 1e-3); // compression corner
  });
});

describe("sectionOutline", () => {
  test("is a 12-vertex I whose area is close to the table's A", () => {
    const p = getProfile("IPB 300")!;
    const pts = sectionOutline(p, false);
    expect(pts).toHaveLength(12);
    let area = 0;
    pts.forEach(([x, y], i) => {
      const [x2, y2] = pts[(i + 1) % pts.length];
      area += x * y2 - x2 * y;
    });
    expect(Math.abs(area) / 2 / 100).toBeGreaterThan(p.A * 0.9); // mm² -> cm², fillets ignored
    expect(Math.abs(area) / 2 / 100).toBeLessThan(p.A * 1.02);
  });
  test("rotating swaps the extents", () => {
    const p = getProfile("IPN 200")!;
    const ext = (pts: [number, number][], i: 0 | 1) =>
      Math.max(...pts.map((q) => Math.abs(q[i]))) * 2;
    const a = sectionOutline(p, false),
      b = sectionOutline(p, true);
    near(ext(a, 0), p.bf);
    near(ext(a, 1), p.h);
    near(ext(b, 0), p.h);
    near(ext(b, 1), p.bf);
  });
});
