import { solveModel3D } from "../solve3d";
import { computeStress, memberSection, ratioColor } from "../stress3d";
import { PRESETS_3D } from "../presets3d";
import { getProfile } from "../profiles";
import type { FrameModel3D } from "../types3d";

const mat = { E: 2.1e8, G: 8.1e7, A: 0.01, Iy: 8.3e-5, Iz: 8.3e-5, J: 1.6e-4 };
const near = (a: number, b: number, tol = 1e-6) =>
  expect(Math.abs(a - b)).toBeLessThan(tol * Math.max(1, Math.abs(b)));

// Cantilever along x, 4 m, IPB 200, tip load.
const cantilever = (
  load: Partial<{ fx: number; fy: number; fz: number }>,
  member: Partial<FrameModel3D["members"][number]> = {},
): FrameModel3D => ({
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

const stressOf = (m: FrameModel3D) => computeStress(m, solveModel3D(m)!)[0]!;

describe("memberSection", () => {
  test("no profile -> global material, no fibre distances", () => {
    const s = memberSection(mat, { id: "M", n1: "A", n2: "B" });
    expect(s).toEqual({ A: 0.01, Iy: 8.3e-5, Iz: 8.3e-5, J: 1.6e-4 });
  });
  test("profile -> table values in m, strong axis about y' by default", () => {
    const s = memberSection(mat, { id: "M", n1: "A", n2: "B", profile: "IPB 200" });
    near(s.A, 78.1e-4);
    near(s.Iy, 5700e-8);
    near(s.Iz, 2000e-8);
    near(s.cz!, 0.1);
    near(s.cy!, 0.1);
  });
  test("rotated swaps the axes (IPN 200: depth 200, width 90)", () => {
    const s = memberSection(mat, { id: "M", n1: "A", n2: "B", profile: "IPN 200", rotated: true });
    near(s.Iy, 117e-8);
    near(s.Iz, 2140e-8);
    near(s.cz!, 0.045);
    near(s.cy!, 0.1);
  });
});

describe("computeStress", () => {
  test("strong-axis bending: σ = M / Sx, tension on top for a downward tip load", () => {
    const st = stressOf(cantilever({ fz: -10 }));
    const sx = getProfile("IPB 200")!.Sx * 1e-6; // m³
    near(st.max.sigma, 40 / sx / 1e4, 1e-3); // 40 kN·m
    expect(st.max.sigma).toBeGreaterThan(0); // tension at the top fibre
    near(st.max.x, 0);
    near(st.max.z, 0.1);
    near(st.ratio, st.max.sigma / 14, 1e-9);
  });

  test("rotated section bends about the weak axis: σ = M / Sy", () => {
    const st = stressOf(cantilever({ fz: -10 }, { rotated: true }));
    near(Math.abs(st.max.sigma), 40 / (getProfile("IPB 200")!.Sy * 1e-6) / 1e4, 1e-3);
    expect(st.ok).toBe(false); // 20 kN/cm² > 14 kN/cm²
  });

  test("axial load: σ = N / A, uniform along the member", () => {
    const st = stressOf(cantilever({ fx: 100 }));
    near(st.max.sigma, 100 / 78.1e-4 / 1e4, 1e-6);
    st.sigma.forEach((s) => near(s, st.max.sigma, 1e-6));
  });

  test("biaxial bending adds both contributions at the governing corner", () => {
    const st = stressOf(cantilever({ fz: -10, fy: 5 }));
    const p = getProfile("IPB 200")!;
    const expected = (40 / (p.Sx * 1e-6) + 20 / (p.Sy * 1e-6)) / 1e4;
    near(Math.abs(st.max.sigma), expected, 1e-3);
  });

  test("members without a profile are skipped", () => {
    const m = cantilever({ fz: -10 }, { profile: undefined });
    expect(computeStress(m, solveModel3D(m)!)).toEqual([null]);
  });

  test("a stiffer profile does not change the (determinate) reactions", () => {
    const a = solveModel3D(cantilever({ fz: -10 }))!.result.reactions[0];
    const b = solveModel3D(cantilever({ fz: -10 }, { profile: "IPB 300" }))!.result.reactions[0];
    near(a.fz, b.fz);
    near(a.my, b.my);
  });

  test("the profile's stiffness is what the solver uses (tip deflection P·L³/3EI)", () => {
    const m = cantilever({ fz: -10 });
    const res = solveModel3D(m)!.result;
    near(res.U[6 + 2], (-10 * 64) / (3 * mat.E * 5700e-8), 1e-9);
  });
});

describe("3D presets pass the stress check", () => {
  PRESETS_3D.forEach(({ key, model }) => {
    test(key, () => {
      const res = computeStress(model, solveModel3D(model)!);
      expect(res.every((r) => r !== null && r.ok)).toBe(true);
    });
  });
});

describe("ratioColor", () => {
  test("green at 0, red at 1, failing red above", () => {
    expect(ratioColor(0)).toBe("hsl(120, 70%, 40%)");
    expect(ratioColor(1)).toBe("hsl(0, 70%, 40%)");
    expect(ratioColor(1.2)).toBe("#b91c1c");
  });
});
