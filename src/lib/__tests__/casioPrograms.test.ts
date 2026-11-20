import { solveModel3D } from "../solve3d";
import { PRESETS_3D } from "../presets3d";
import { PRESETS } from "../presets";
import { criticalCorner, guideCorners, guideOutline, guideSection, plane, sigmaAt } from "../sectionGuide";
import { solveModel } from "../solve";
import { runChecks, type CableCheck, type SizeCheck, type VerifyCheck } from "../checks";
import { newGfx, newMem, runBasic, type Mem } from "./casioBasic";
import {
  baseForces, distributedLoad,
  chooseIPB,
  PERFIL_LINES,
  PERFIL_TABLE,
  reactionsFromLoads,
  REACC_LINES,
  sigmaMaxOf,
  faceFor,
  neutralAxisOf,
  cableBeam,
  VIGACAB_LINES,
  tensionBar,
  compressionBar,
  PANDEO_LINES,
  RETIC_LINES,
  RETIC_MAX_BARS,
  PERFILES_LINES,
  SEARCH_TABLE,
  findProfile,
  lightestWith,
  TRACCION_LINES,
  type ProgramLoad,
} from "../casioPrograms";

const near = (a: number, b: number) => expect(Math.abs(a - b)).toBeLessThan(1e-6 * Math.max(1, Math.abs(b)));

// The loads of a preset typed as the program asks for them (nodal: at its node; distributed: resultant at the span's centre).
function programLoads(key: string): ProgramLoad[] {
  const model = PRESETS_3D.find((p) => p.key === key)!.model;
  const out: ProgramLoad[] = [];
  for (const l of model.loads) {
    if (l.type === "nodal") {
      const n = model.nodes.find((q) => q.id === l.node)!;
      out.push({ x: n.x, y: n.y, z: n.z, fx: l.fx, fy: l.fy, fz: l.fz, mx: l.mx, my: l.my, mz: l.mz });
    } else if (l.type === "mudl") {
      const m = model.members.find((q) => q.id === l.member)!;
      const a = model.nodes.find((q) => q.id === m.n1)!,
        b = model.nodes.find((q) => q.id === m.n2)!;
      const L = Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
      const from = Math.min(Math.max(l.from ?? 0, 0), L),
        to = Math.min(Math.max(l.to ?? L, 0), L);
      const t = (from + to) / 2 / L;
      out.push({
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
        z: a.z + (b.z - a.z) * t,
        fx: l.gx, fy: l.gy, fz: l.gz,
        len: to - from,
      });
    }
  }
  return out;
}

describe("Casio program REACC", () => {
  // presets with a single fixed support at A and only nodal / uniform loads
  const keys = ["t_frame_kg", "t_frame_qy", "column_kg", "cantilever_kg"] as const;
  keys.forEach((key) => {
    test(`${key}: reactions = the solver's`, () => {
      const model = PRESETS_3D.find((p) => p.key === key)!.model;
      const solved = solveModel3D(model)!;
      const r = solved.result.reactions[solved.nodeIndex.get("A")!];
      const mine = reactionsFromLoads(programLoads(key));
      near(mine.fx, r.fx); near(mine.fy, r.fy); near(mine.fz, r.fz);
      near(mine.mx, r.mx); near(mine.my, r.my); near(mine.mz, r.mz);
    });
  });

  test("worked example of the T-frame (kg): −300, 600, 900, −300", () => {
    const r = reactionsFromLoads([
      { x: 0.5, y: 0, z: 3, fx: 0, fy: 0, fz: -200, len: 3 },
      { x: 0, y: 0, z: 3, fx: 0, fy: 300, fz: 0 },
    ]);
    expect([r.fx, r.fy, r.fz, r.mx, r.my, r.mz]).toEqual([0, -300, 600, 900, -300, 0]);
  });

  ["t_frame_kg", "t_frame_qy", "column_kg"].forEach((key) => {
    test(`${key}: base of the column = the solver's N, Qx, Qy, Mx, My`, () => {
      const model = PRESETS_3D.find((p) => p.key === key)!.model;
      const st = solveModel3D(model)!.stations[0].reduce((b, p) => (p.z > b.z ? p : b)); // column A→B: the base has the largest z
      const b = baseForces(reactionsFromLoads(programLoads(key)));
      near(b.N, st.N); near(b.Qx, st.Qx); near(b.Qy, st.Qy); near(b.Mx, st.Mx); near(b.My, st.My);
    });
  });

  // The listing RUN by a small Casio Basic interpreter (casioBasic.ts), typed as on the calculator, vs the solver.
  type Screen = [number, number, number | string][];
  const screenOf = (gfx: ReturnType<typeof newGfx>, title: string): Screen | undefined =>
    [...gfx.screens].reverse().find((sc) => sc[0] && sc[0][0] === 1 && sc[0][1] === 1 && sc[0][2] === title);
  const at = (sc: Screen | undefined, col: number, row: number) => {
    const v = sc?.find((l) => l[0] === col && l[1] === row)?.[2];
    return typeof v === "number" ? (v === 0 ? 0 : v) : v; // no -0
  };
  const reacciones = (sc: Screen | undefined) => [at(sc, 4, 2), at(sc, 4, 3), at(sc, 4, 4), at(sc, 14, 2), at(sc, 14, 3), at(sc, 14, 4)];
  const corte = (sc: Screen | undefined) => [2, 3, 4, 5, 6].map((r) => at(sc, 5, r));
  // the first prompt is 0 = NUEVA (start over) or 1 = SEGUIR (go on with the loads saved in the lists)
  const reacc = (inputs: number[], start = 0, mem: Mem = newMem()) => {
    const gfx = newGfx();
    const out = runBasic(REACC_LINES, [start, ...inputs], gfx, mem);
    return { gfx, out, rea: reacciones(screenOf(gfx, "REACCIONES EN A")), base: corte(screenOf(gfx, "CORTE EN BASE (PILAR)")) };
  };
  // menu: 1 AGREGAR CARGAS, 2 LISTAR CARGAS, 3 REACCIONES, 4 CORTE EN BASE, 5 BORRAR TODO, 0 SALIR; each load ends with 1 = OK

  test("running REACC: t-frame-3d-fixed-kg typed as the page says (distributed = its two end points and q)", () => {
    const r = reacc([
      1, 2, // CARGAR, 2 loads
      2, -1, 2, 0, 0, 3, 3, 0, 0, -200, 1, // load 1: distributed, X from −1 to 2, Y 0 to 0, Z 3 to 3, q = (0, 0, −200), OK
      1, 0, 0, 3, 0, 300, 0, 1, // load 2: point at B, F = (0, 300, 0), OK
      3, 4, 0, // REACCIONES, CORTE EN BASE, SALIR
    ]);
    expect(r.rea).toEqual([0, -300, 600, 900, -300, 0]);
    expect(r.base).toEqual([-600, -300, 0, -300, 900]); // N, QX, QY, MX, MY at the base of the column
    expect(r.out).toEqual(["CARGA", 1, "CARGA", 2]); // the marker and the number of each load
  });

  test("running REACC: column-3d-fixed-kg (q_y on the whole column + a point load at the top) = the solver's reactions", () => {
    const r = reacc([1, 2, 2, 0, 0, 0, 0, 0, 5, 0, 200, 0, 1, 1, 0, 0, 5, 1500, 0, -20000, 1, 3, 4, 0]);
    expect(r.rea).toEqual([-1500, -1000, 20000, 2500, -7500, 0]);
    expect(r.base).toEqual([-20000, -1000, -1500, -7500, 2500]);
  });

  test("running REACC: a moment alone has no arm (type 3)", () => {
    const r = reacc([1, 1, 3, 10, -20, 30, 1, 3, 0]);
    expect(r.rea).toEqual([0, 0, 0, -10, 20, -30]); // the reactions are minus the applied moment
    expect(distributedLoad([-1, 0, 3], [2, 0, 3], [0, 0, -200])).toEqual({ x: 0.5, y: 0, z: 3, fx: 0, fy: 0, fz: -200, len: 3 });
  });

  test("running REACC: a load can be typed again (0) without touching the others, and the number does not advance", () => {
    const r = reacc([
      1, 1,
      1, 9, 9, 9, 9, 9, 9, 0, // a wrong point load → REPETIR
      1, 0, 0, 3, 0, 300, 0, 1, // the right one
      3, 0,
    ]);
    expect(r.rea).toEqual([0, -300, 0, 900, 0, 0]);
    expect(r.out).toEqual(["CARGA", 1, "CARGA", 1]); // the same load number twice
  });

  test("running REACC: the summary screen shows what the program understood (centre and length of a distributed load)", () => {
    const { gfx } = reacc([1, 1, 2, -1, 2, 0, 0, 3, 3, 0, 0, -200, 1, 0]);
    const sc = [...gfx.screens].find((x) => x[0]?.[2] === "CARGA")!;
    expect([at(sc, 3, 2), at(sc, 3, 3), at(sc, 3, 4)]).toEqual([0.5, 0, 3]); // X, Y, Z of the centre
    expect([at(sc, 14, 2), at(sc, 14, 3), at(sc, 14, 4)]).toEqual([0, 0, -600]); // the resultant: q × L
    expect(at(sc, 3, 5)).toBe(3); // L
    expect(at(sc, 7, 1)).toBe(1); // load number
  });

  const pointLoad = (x: number, y: number, z: number, fx: number, fy: number, fz: number) => [1, x, y, z, fx, fy, fz, 1];

  test("running REACC: LISTAR CARGAS shows the loads three per screen (kind, centre, resultant or moment)", () => {
    const { gfx } = reacc([
      1, 4,
      ...pointLoad(0, 0, 3, 0, 300, 0),
      2, -1, 2, 0, 0, 3, 3, 0, 0, -200, 1, // distributed: centre (0.5, 0, 3), resultant −600 along z
      3, 10, -20, 30, 1, // a moment
      ...pointLoad(1, 2, 3, 4, 5, 6),
      2, 0, // LISTAR, no deletion
      0,
    ]);
    const pages = gfx.screens.filter((sc) => sc[0]?.[2] === "N T  X     Y     Z");
    expect(pages).toHaveLength(2); // 3 loads and then the 4th
    const [p1, p2] = pages;
    expect([at(p1, 1, 2), at(p1, 3, 2), at(p1, 5, 2), at(p1, 11, 2), at(p1, 17, 2)]).toEqual([1, "P", 0, 0, 3]);
    expect([at(p1, 3, 3), at(p1, 5, 3), at(p1, 11, 3), at(p1, 17, 3)]).toEqual(["F", 0, 300, 0]);
    expect([at(p1, 1, 4), at(p1, 3, 4), at(p1, 5, 4), at(p1, 11, 4), at(p1, 17, 4)]).toEqual([2, "D", 0.5, 0, 3]);
    expect([at(p1, 5, 5), at(p1, 11, 5), at(p1, 17, 5)]).toEqual([0, 0, -600]);
    expect([at(p1, 1, 6), at(p1, 3, 6), at(p1, 3, 7), at(p1, 5, 7), at(p1, 11, 7), at(p1, 17, 7)]).toEqual([3, "M", "M", 10, -20, 30]);
    expect([at(p2, 1, 2), at(p2, 3, 2), at(p2, 5, 2), at(p2, 11, 2), at(p2, 17, 2), at(p2, 5, 3), at(p2, 11, 3), at(p2, 17, 3)]).toEqual([4, "P", 1, 2, 3, 4, 5, 6]);
  });

  test("running REACC: a load can be deleted from the list, and the reactions are rebuilt without it", () => {
    const keep = reacc([1, 1, ...pointLoad(0, 0, 3, 0, 300, 0), 3, 0]).rea; // only the second load, as the reference
    const both = reacc([1, 2, ...pointLoad(0, 0, 3, 0, 300, 0), ...pointLoad(0, 0, 3, 0, 300, 0), 3, 0]).rea;
    expect(both).not.toEqual(keep);
    const { gfx, rea } = reacc([
      1, 3,
      ...pointLoad(2, 0, 3, 100, 0, 0), // the one to delete
      ...pointLoad(0, 0, 3, 0, 300, 0),
      ...pointLoad(5, 5, 5, 7, 7, 7), // and another one after it
      2, 1, // LISTAR → BORRAR CARGA 1
      3, // the list again, now with two: 3 is beyond the end, so it deletes the last one (the 7s)
      0, // the list once more, with one left: no more
      3, 0,
    ]);
    const lists = gfx.screens.filter((sc) => sc[0]?.[2] === "N T  X     Y     Z");
    expect(lists).toHaveLength(3); // the list is shown again after each deletion
    expect(at(lists[1], 5, 2)).toBe(0); // after the first deletion the old load 2 is load 1 (x = 0)
    expect(at(lists[1], 11, 3)).toBe(300);
    expect([at(lists[2], 1, 2), at(lists[2], 11, 3), at(lists[2], 1, 4)]).toEqual([1, 300, undefined]); // one load left
    expect(rea).toEqual(keep); // 100 kg at x = 2 and the 7s are gone: only the 300 kg at B is left
    expect(gfx.screens.filter((sc) => sc[0]?.[2] === "REACC  CARGAS").map((sc) => at(sc, 15, 1)).slice(-2)).toEqual([1, 1]);
    // an empty list says so
    expect(reacc([2, 0]).gfx.screens.some((sc) => sc[0]?.[2] === "NO HAY CARGAS")).toBe(true);
  });

  test("running REACC: at most 20 loads (the batch is cut to what is left, then the program says it is full)", () => {
    const one = pointLoad(0, 0, 0, 0, 0, -1);
    const { gfx, rea } = reacc([1, 25, ...Array.from({ length: 20 }, () => one).flat(), 1, 3, 0]);
    expect(rea[2]).toBe(20); // FZ: twenty loads of −1 kg
    expect(gfx.screens.some((sc) => sc[0]?.[2] === "YA HAY 20 CARGAS")).toBe(true);
  });

  test("running REACC: the loads survive leaving the program, and even running other programs in between (SEGUIR)", () => {
    const mem = newMem();
    const first = reacc([1, 2, ...pointLoad(0, 0, 3, 0, 300, 0), 2, -1, 2, 0, 0, 3, 3, 0, 0, -200, 1, 3, 4, 0], 0, mem);
    expect(first.rea).toEqual([0, -300, 600, 900, -300, 0]);
    // other programs use the letters and the lists 1-9: PERFIL and TRACCION run in between
    runBasic(PERFIL_LINES, [-600, -300, 900, 0], newGfx(), mem);
    runBasic(TRACCION_LINES, [18229, 0], newGfx(), mem);
    // back in REACC: SEGUIR keeps the two loads, the count in the title and the sums
    const again = reacc([3, 4, 0], 1, mem);
    expect(again.rea).toEqual(first.rea);
    expect(again.base).toEqual(first.base);
    expect(again.gfx.screens.find((sc) => sc[0]?.[2] === "REACC  CARGAS")!.find((l) => l[0] === 15)![2]).toBe(2);
    // and the list shows them; adding one more on top of the saved ones works
    const more = reacc([1, 1, ...pointLoad(1, 0, 0, 0, 0, 50), 3, 2, 0, 0], 1, mem);
    expect(more.rea[2]).toBe(550); // FZ: 600 up (the saved loads) minus the 50 kg of the new one
    expect(more.gfx.screens.filter((sc) => sc[0]?.[2] === "N T  X     Y     Z")).toHaveLength(1);
    // NUEVA starts over even with loads saved
    expect(reacc([2, 0], 0, mem).gfx.screens.some((sc) => sc[0]?.[2] === "NO HAY CARGAS")).toBe(true);
  });

  test("running REACC: the menu shows how many loads are in, adds batches, and BORRAR TODO empties them", () => {
    const { gfx, rea } = reacc([
      1, 1, 1, 0, 0, 3, 0, 300, 0, 1,
      1, 1, 1, 0, 0, 3, 0, 300, 0, 1, // the same load again: two in
      3, // REACCIONES with both
      5, // BORRAR TODO
      3, 0, // REACCIONES again, SALIR
    ]);
    const counts = gfx.screens.filter((sc) => sc[0]?.[2] === "REACC  CARGAS").map((sc) => at(sc, 15, 1));
    expect(counts).toEqual([0, 1, 2, 2, 0, 0]);
    const reas = gfx.screens.filter((sc) => sc[0]?.[2] === "REACCIONES EN A").map(reacciones);
    expect(reas).toEqual([[0, -600, 0, 1800, 0, 0], [0, 0, 0, 0, 0, 0]]);
    expect(rea).toEqual([0, 0, 0, 0, 0, 0]);
  });

  test("running PERFIL = chooseIPB: the face comes from the moments (strong axis against the larger one), and none passing", () => {
    for (const [N, Mx, My, adm, face] of [
      [-600, -300, 900, 1400, 2], // |My| > |Mx|: the turned profile
      [-600, 900, -300, 1400, 1], // |Mx| > |My|: x against the strong axis
      [-5000, 400, -1200, 1600, 2],
      [-5000, 1200, -400, 1600, 1],
      [-3000, 500, 500, 1400, 1], // equal moments: face 1
      [-1e7, 0, 0, 1400, 1],
    ] as const) {
      const out = runBasic(PERFIL_LINES, [N, Mx, My, adm]);
      expect(faceFor(Mx, My)).toBe(face);
      const c = chooseIPB(N, Mx, My, adm, face);
      if (c) {
        expect(out.slice(0, 6)).toEqual(["USAR IPB", +c.name.replace("IPB ", ""), "SIGMA MAX =", expect.closeTo(c.sigmaMax, 6), "CARA =", face]);
        // the neutral axis: where it crosses X (Y = 0) and Y (X = 0), cm; "NO CORTA" when that moment is 0
        const en = neutralAxisOf(c.name, face, N, Mx, My);
        const fix = (n: number | null, label: string, none: string) => (n === null ? [none] : [label, expect.closeTo(n === 0 ? 0 : n, 6)]);
        expect(out.slice(6)).toEqual([...fix(en.x0, "X (Y=0) =", "E.N. NO CORTA X"), ...fix(en.y0, "Y (X=0) =", "E.N. NO CORTA Y")]);
      } else expect(out).toEqual(["NINGUN IPB HASTA 600"]);
    }
  });

  test("running PERFIL: neutral axis intercepts of the base of preset #2, and when a moment is 0", () => {
    const out = runBasic(PERFIL_LINES, [-600, -300, 900, 0]);
    expect(out.slice(6, 8)).toEqual(["X (Y=0) =", expect.closeTo(0.16941, 4)]);
    expect(out.slice(8)).toEqual(["Y (X=0) =", expect.closeTo(-0.18707, 4)]);
    expect(runBasic(PERFIL_LINES, [-600, 0, 900, 1400]).slice(8)).toEqual(["E.N. NO CORTA Y"]); // Mx = 0: parallel to the x axis
    expect(runBasic(PERFIL_LINES, [-600, 900, 0, 1400]).slice(6, 7)).toEqual(["E.N. NO CORTA X"]);
  });

  test("running PERFIL draws the face in XY: outline, axes, neutral axis and critical corner", () => {
    const run = (N: number, Mx: number, My: number) => {
      const gfx = newGfx();
      const out = runBasic(PERFIL_LINES, [N, Mx, My, 0], gfx);
      return { gfx, name: `IPB ${out[1]}`, face: out[5] as 1 | 2 };
    };
    // base of preset #2: face 2, IPB 120. The 12 edges are the closed outline of guideOutline (the guide's figure)
    const { gfx, name, face } = run(-600, -300, 900);
    expect([name, face]).toEqual(["IPB 120", 2]);
    const s = guideSection(name, true);
    const outline = guideOutline(s);
    expect(gfx.segments.slice(0, 12)).toHaveLength(12);
    // the same 12 edges (the program walks the vertices in its own order, so compare them as undirected edges)
    const edge = (a: number[], b: number[]) => [a, b].map((v) => v.map((c) => c.toFixed(6)).join(",")).sort().join("|");
    expect(new Set(gfx.segments.slice(0, 12).map(([x1, y1, x2, y2]) => edge([x1, y1], [x2, y2])))).toEqual(
      new Set(outline.map((p, k) => edge(p, outline[(k + 1) % 12]))),
    );
    // equal scale on a 127 x 63 screen, the section inside the window
    const [xmin, xmax, , ymin, ymax] = gfx.window!;
    expect(xmax).toBeCloseTo(-xmin, 9);
    expect(ymax).toBeCloseTo(-ymin, 9);
    expect(xmax / ymax).toBeCloseTo(2, 9);
    expect(ymax).toBeGreaterThan(s.hy);
    expect(xmax).toBeGreaterThan(s.hx);
    expect([gfx.horizontals, gfx.verticals]).toEqual([[0], [0]]); // the two axes
    // the neutral axis (the 13th segment): both ends have σ = 0
    expect(gfx.segments).toHaveLength(13);
    const k = plane(-600, -300, 900, s);
    const [ex1, ey1, ex2, ey2] = gfx.segments[12];
    expect(Math.abs(sigmaAt(k, ex1, ey1))).toBeLessThan(1e-6);
    expect(Math.abs(sigmaAt(k, ex2, ey2))).toBeLessThan(1e-6);
    // the critical corner and its signed σ
    const cc = criticalCorner(guideCorners(k, s));
    expect(gfx.plots).toEqual([[expect.closeTo(cc.x, 9), expect.closeTo(cc.y, 9)]]);
    expect(gfx.texts).toEqual([[1, 1, expect.closeTo(cc.sigma, 6)]]);
    // face 1 (|Mx| > |My|) is the outline as drawn, not swapped
    const f1 = run(-600, 900, -300);
    expect(f1.face).toBe(1);
    const s1 = guideSection(f1.name, false);
    const o1 = guideOutline(s1);
    expect(new Set(f1.gfx.segments.slice(0, 12).map(([x1, y1, x2, y2]) => edge([x1, y1], [x2, y2])))).toEqual(
      new Set(o1.map((p, k) => edge(p, o1[(k + 1) % 12]))),
    );
    // a moment of 0: the neutral axis is parallel to an axis (Mx = 0: vertical line) or there is none (only N)
    const mx0 = run(-600, 0, 900);
    expect(mx0.gfx.segments).toHaveLength(12); // no sloped line: Mx = 0 makes the neutral axis the vertical x = −N·Iy/(A·My)
    const sMx0 = guideSection(mx0.name, mx0.face === 2);
    expect(mx0.gfx.verticals).toEqual([0, expect.closeTo(neutralAxisOf(mx0.name, mx0.face, -600, 0, 900).x0!, 9)]);
    expect(sMx0.A).toBeGreaterThan(0);
    const onlyN = run(-600, 0, 0);
    expect(onlyN.gfx.segments).toHaveLength(12); // only N: σ is uniform, no neutral axis
    expect(onlyN.gfx.verticals).toEqual([0]); // just the axis
  });

  test("running PERFIL: σ_adm typed as 0 means the default, 1400", () => {
    const withDefault = runBasic(PERFIL_LINES, [-600, -300, 900, 0]);
    expect(withDefault).toEqual(runBasic(PERFIL_LINES, [-600, -300, 900, 1400]));
    expect(withDefault[1]).toBe(120); // preset #2's base: the larger moment is My, so face 2: IPB 120 passes at 1400 (1208.7)
    expect(runBasic(PERFIL_LINES, [-600, -300, 900, 1000])).not.toEqual(withDefault); // another σ_adm is respected
  });

  test("the program text asks for what the TypeScript uses and prints every result", () => {
    const text = REACC_LINES.join("\n");
    for (const v of ["F", "G", "H", "I", "J", "K"]) expect(text).toContain(`→${v}`);
    expect(text.match(/◢/g)!.length).toBe(REACC_LINES.filter((l) => l.endsWith("◢")).length);
    expect(REACC_LINES.every((l) => l.length <= 120)).toBe(true); // lines the calculator's editor can wrap
  });
});

describe("Casio program PERFIL", () => {
  test("table: IPB 100…600 (19 profiles) typed into the lists", () => {
    expect(PERFIL_TABLE).toHaveLength(19);
    expect(PERFIL_TABLE[0].name).toBe("IPB 100");
    expect(PERFIL_TABLE[18].name).toBe("IPB 600");
    expect(PERFIL_LINES[0]).toMatch(/^\{100,120,.*,600\}→List 1$/);
    expect(PERFIL_LINES[2]).toMatch(/^\{26,34,.*,270\}→List 3$/);
  });

  test("the base of preset #2 (N −600, Mx −300, My 900): face 1 = 1924.1 and face 2 = 1208.7 on IPB 120 (the guide's values)", () => {
    const p = PERFIL_TABLE[1];
    expect(sigmaMaxOf(p, -600, -300, 900, 1)).toBeCloseTo(1924.1, 0);
    expect(sigmaMaxOf(p, -600, -300, 900, 2)).toBeCloseTo(1208.7, 0);
  });

  test("the chosen profile passes, the previous one does not, and agrees with the solver's stress check", () => {
    const sigmaAdm = 1400;
    for (const face of [1, 2] as const) {
      const c = chooseIPB(-600, -300, 900, sigmaAdm, face)!;
      expect(c.sigmaMax).toBeLessThanOrEqual(sigmaAdm);
      const i = PERFIL_TABLE.findIndex((p) => p.name === c.name);
      if (i > 0) expect(sigmaMaxOf(PERFIL_TABLE[i - 1], -600, -300, 900, face)).toBeGreaterThan(sigmaAdm);
    }
    expect(chooseIPB(-600, -300, 900, 1400, 2)!.name).toBe("IPB 120"); // 1208.7 ≤ 1400 already on IPB 120
    expect(chooseIPB(-600, -300, 900, 1400, 1)!.name).not.toBe("IPB 120"); // 1924.1 > 1400
  });

  test("no IPB up to 600 passes → null; pure axial load uses N/A", () => {
    expect(chooseIPB(-1e7, 0, 0, 1400, 1)).toBeNull();
    near(chooseIPB(-26 * 1000, 0, 0, 1000, 1)!.sigmaMax, 1000); // IPB 100: A = 26 cm²
  });

  test("the program text matches: every variable it reads is assigned first", () => {
    expect(PERFIL_LINES.join("\n")).toContain("If T=2:Then X→Z:Y→X:Z→Y:D→Z:E→D:Z→E:IfEnd");
    expect(PERFIL_LINES.filter((l) => l.includes("→List")).length).toBe(9); // 7 table lists + the 2 of the outline's vertices
  });
});

describe("Casio program VIGACAB (beam + cable of the two truss-cable-beam examples)", () => {
  const preset = (name: string) => PRESETS.find((p) => p.name === name)!.model;
  const cableOf = (checks: unknown[]) => (checks as { kind: string }[]).find((c) => c.kind === "cable") as CableCheck;
  const run = (model: ReturnType<typeof preset>) => runChecks(model, solveModel(model));

  test("truss-cable-beam-kg: M = 120 000 kg·m, IPB 800, T = (40 000 + w·12)/2, d = 4.14 cm — the app's own numbers", () => {
    const checks = run(preset("Truss + Cable + Beam (sizing)"));
    const c = cableOf(checks);
    const beam = (checks as SizeCheck[]).find((x) => x.kind === "size" && x.member === "EF")!;
    const r = cableBeam({ L: 12, Lc: 4.33013, loads: [{ P: 40000, a: 6 }], q: 0 });
    expect(r.Mmax).toBeCloseTo(beam.demand.M, 0);
    expect(r.min!.name).toBe(beam.results[1].pick!.profile.name); // IPB 800 (no IPN fits; the series is IPB)
    expect(r.min!.sigma).toBeCloseTo(beam.results[1].pick!.sigma, 6);
    expect(r.T).toBeCloseTo(c.N, 2);
    expect(r.A).toBeCloseTo(c.areaReq, 6);
    expect(r.d).toBeCloseTo(c.dReq, 6);
    expect(r.elongation).toBeCloseTo(c.elongation, 4);
  });

  test("truss-cable-beam-ipb260-kg: the lightest IPB (the app's suggestion) and the cable it implies — the app's numbers with that beam", () => {
    const base = preset("Truss + Cable + Beam IPB 260");
    const given = run(base).find((x) => x.kind === "verify" && x.member === "FG") as VerifyCheck;
    const r = cableBeam({ L: 10, Lc: 15, loads: [{ P: 20000, a: 5 }], q: 2000 });
    expect(given.ok).toBe(false); // the IPB 260 of the drawing does not pass...
    expect(r.Mmax).toBeCloseTo(given.demand.M, 0); // 75 000 kg·m (the load alone)
    expect(r.min!.name).toBe(given.suggestion!.profile.name); // ...and the lightest that does is the app's suggestion (IPB 550)
    // the same structure with that profile in the beam: its cable is the program's
    const withMin = {
      ...base,
      members: base.members.map((m) => (m.id === "FG" ? { ...m, section: { kind: "profile" as const, name: r.min!.name } } : m)),
    };
    const checks = run(withMin);
    const c = cableOf(checks);
    const beam = (checks as VerifyCheck[]).find((x) => x.kind === "verify" && x.member === "FG")!;
    expect(beam.ok).toBe(true);
    expect(beam.sigma).toBeCloseTo(r.min!.sigma, 6);
    expect(r.T).toBeCloseTo(c.N, 2);
    expect(r.d).toBeCloseTo(c.dReq, 6);
    expect(r.elongation).toBeCloseTo(c.elongation, 4);
  });

  // a brute-force reference for the maximum moment of any set of point loads + q
  const scan = (L: number, loads: { P: number; a: number }[], q: number) => {
    const R = loads.reduce((r, { P, a }) => r + (P * (L - a)) / L, (q * L) / 2);
    let m = 0;
    const at = (x: number) =>
      (m = Math.max(m, R * x - (q * x * x) / 2 - loads.reduce((t, { P, a }) => (x > a ? t + P * (x - a) : t), 0)));
    for (let k = 0; k <= 40000; k++) at((k / 40000) * L);
    loads.forEach((l) => at(l.a)); // the corners under the loads, which a grid can miss
    return m;
  };

  test("the maximum moment, whatever the load: one or several point loads, with or without q, in any order — compared with a fine scan", () => {
    const cases: [number, { P: number; a: number }[], number][] = [
      [12, [{ P: 40000, a: 6 }], 0],
      [10, [], 2000],
      [10, [{ P: 20000, a: 5 }], 2000],
      [8, [{ P: 1000, a: 1 }], 3000],
      [8, [{ P: 1000, a: 7 }], 3000],
      [6, [{ P: 50000, a: 2 }], 100],
      [9, [{ P: 1000, a: 6 }, { P: 1000, a: 3 }], 0], // typed from the far one
      [10, [{ P: 5000, a: 7 }, { P: 12000, a: 2 }, { P: 3000, a: 4.5 }], 800],
      [14, [{ P: 9000, a: 3 }, { P: 9000, a: 11 }], 1500],
      [7, [{ P: 200, a: 3.5 }, { P: 8000, a: 5.5 }], 4000],
    ];
    for (const [L, loads, q] of cases) expect(cableBeam({ L, Lc: 1, loads, q }).Mmax).toBeCloseTo(scan(L, loads, q), 0);
    expect(cableBeam({ L: 9, Lc: 1, loads: [{ P: 1000, a: 3 }, { P: 1000, a: 6 }], q: 0 }).Mmax).toBeCloseTo(3000, 9); // two equal loads at the thirds
  });

  test("running the listing: both examples, typed as on the calculator", () => {
    const expected = (r: ReturnType<typeof cableBeam>) => [
      "M MAX KG M", expect.closeTo(r.Mmax, 6), "SX NEC CM3", expect.closeTo(r.sxReq, 6),
      "IPB MIN", +r.min!.name.replace("IPB ", ""), "SIGMA CON IPB MIN", expect.closeTo(r.min!.sigma, 6),
      "TENSION CABLE KG", expect.closeTo(r.T, 6), "A CABLE CM2", expect.closeTo(r.A, 6),
      "D CABLE CM", expect.closeTo(r.d, 6), "ALARG CABLE CM", expect.closeTo(r.elongation, 6),
      "V PIN KG", expect.closeTo(r.vPin, 6),
    ];
    // truss-cable-beam-kg: L 12, cable 4.33 m, P 40 000 at 6 m, q 0, σ_adm default
    expect(runBasic(VIGACAB_LINES, [12, 4.33013, 1, 6, 40000, 0, 0])).toEqual(expected(cableBeam({ L: 12, Lc: 4.33013, loads: [{ P: 40000, a: 6 }], q: 0 })));
    // truss-cable-beam-ipb260-kg: L 10, cable 15 m, P 20 000 at 5 m, q = 2 000 kg/m
    const b = runBasic(VIGACAB_LINES, [10, 15, 1, 5, 20000, 2000, 1600]);
    expect(b).toEqual(expected(cableBeam({ L: 10, Lc: 15, loads: [{ P: 20000, a: 5 }], q: 2000, sigmaAdm: 1600 })));
    expect(b[5]).toBe(550);
  });

  test("running the listing with several point loads (typed in any order) = cableBeam = the fine scan", () => {
    const loads = [{ P: 5000, a: 7 }, { P: 12000, a: 2 }, { P: 3000, a: 4.5 }];
    const out = runBasic(VIGACAB_LINES, [10, 3, 3, ...loads.flatMap((l) => [l.a, l.P]), 800, 0]);
    const r = cableBeam({ L: 10, Lc: 3, loads, q: 800 });
    expect(out[1]).toBeCloseTo(r.Mmax, 6);
    expect(out[1]).toBeCloseTo(scan(10, loads, 800), 0);
    expect(out[out.indexOf("V PIN KG") + 1]).toBeCloseTo(r.vPin, 6);
    expect(out[out.indexOf("TENSION CABLE KG") + 1]).toBeCloseTo(r.T, 6);
    // with no point load at all (only q) it still works
    expect(runBasic(VIGACAB_LINES, [10, 3, 0, 800, 0])[1]).toBeCloseTo((800 * 100) / 8, 6);
  });

  test("running the listing draws the diagram of moments: positive M downward, 40 segments, Mmax written on top", () => {
    const gfx = newGfx();
    runBasic(VIGACAB_LINES, [10, 15, 1, 5, 20000, 2000, 1600], gfx);
    const M = cableBeam({ L: 10, Lc: 15, loads: [{ P: 20000, a: 5 }], q: 2000 }).Mmax;
    expect(gfx.clears).toBe(1);
    expect(gfx.window).toEqual([0, 10, 2.5, expect.closeTo(-1.25 * M, 6), expect.closeTo(0.35 * M, 6), M]);
    expect(gfx.horizontals).toEqual([0]);
    expect(gfx.segments).toHaveLength(40);
    // every segment joins two points of −M(x), and they chain from x = 0 to x = L
    const R = (20000 * 5) / 10 + (2000 * 10) / 2;
    const Mx = (x: number) => R * x - (2000 * x * x) / 2 - (x > 5 ? 20000 * (x - 5) : 0);
    gfx.segments.forEach(([x1, y1, x2, y2], k) => {
      expect(x1).toBeCloseTo(k * 0.25, 9);
      expect(x2).toBeCloseTo((k + 1) * 0.25, 9);
      expect(y1).toBeCloseTo(-Mx(x1), 6);
      expect(y2).toBeCloseTo(-Mx(x2), 6);
    });
    expect(Math.min(...gfx.segments.map((s) => s[3]))).toBeCloseTo(-M, 6); // x = 5 is on the grid: the peak is drawn
    expect(gfx.texts).toEqual([[1, 1, expect.closeTo(M, 6)]]);
    // nothing to draw when there is no moment
    const none = newGfx();
    runBasic(VIGACAB_LINES, [10, 15, 0, 0, 1600], none);
    expect(none.segments).toHaveLength(0);
  });

  test("running the listing: a load no IPB can carry says so and still gives the cable without the beam's weight", () => {
    const none = runBasic(VIGACAB_LINES, [12, 5, 1, 6, 4e6, 0, 1600]);
    expect(none).toContain("NINGUN IPB HASTA 1000");
    expect(none).not.toContain("IPB MIN");
    expect(cableBeam({ L: 12, Lc: 5, loads: [{ P: 4e6, a: 6 }], q: 0 }).min).toBeNull();
    expect(none).toContain("TENSION CABLE KG");
  });
});

describe("Casio program TRACCION (IPB of a bar in tension)", () => {
  test("the app's own sizing: every bar in tension, no bending, of the presets at 1600 kg/cm² gets the same IPB", () => {
    let compared = 0;
    for (const { name, model } of PRESETS) {
      if (model.sigmaAdm !== 1600) continue;
      const checks = runChecks(model, solveModel(model)) as SizeCheck[];
      for (const c of checks) {
        if (c.kind !== "size" || c.compressed || c.unloaded || Math.abs(c.demand.M) > 1e-6) continue;
        const pick = c.results.find((r) => r.series === "IPB")?.pick;
        if (!pick) continue;
        const t = tensionBar(c.demand.N, 1600);
        expect([name, c.member, t.name]).toEqual([name, c.member, pick.profile.name]);
        expect(t.sigma).toBeCloseTo(pick.sigma, 6);
        compared++;
      }
    }
    expect(compared).toBeGreaterThan(0);
  });

  test("b5 of the first truss: N = D/√3 → A ≥ 11.4 cm², IPB 100", () => {
    const r = tensionBar(31573.14 / Math.sqrt(3), 0);
    expect(r.A).toBeCloseTo(11.39, 2);
    expect(r.name).toBe("IPB 100");
    expect(r.sigma).toBeCloseTo(18229.4 / 26, 0);
  });

  test("the profile is the first one whose area reaches N/σ_adm (and none when it is too much)", () => {
    expect(tensionBar(26 * 1600).name).toBe("IPB 100"); // A = 26 cm² exactly: IPB 100 has 26
    expect(tensionBar(26 * 1600 + 1).name).toBe("IPB 120");
    expect(tensionBar(-26 * 1600 - 1).name).toBe("IPB 120"); // the sign does not matter
    expect(tensionBar(500000, 2000).name).toBe(tensionBar(500000, 2000).name);
    expect(tensionBar(1e7).name).toBeNull();
  });

  test("running the listing = tensionBar", () => {
    for (const [N, S] of [[18229.4, 0], [60000, 1600], [60000, 2400], [-30000, 0]] as const) {
      const r = tensionBar(N, S);
      expect(runBasic(TRACCION_LINES, [N, S])).toEqual([
        "A NECESARIA CM2", expect.closeTo(r.A, 6), "IPB", +r.name!.replace("IPB ", ""),
        "A DEL IPB CM2", r.Aprofile, "SIGMA REAL KG CM2", expect.closeTo(r.sigma, 6), "PESO KG M", r.w,
      ]);
    }
    expect(runBasic(TRACCION_LINES, [1e7, 0])).toEqual(["A NECESARIA CM2", expect.closeTo(1e7 / 1600, 6), "NINGUN IPB HASTA 1000"]);
  });
});

describe("Casio program PANDEO (IPB of a bar in compression: Euler)", () => {
  test("the app's own sizing: every bar in compression, no bending, of the presets at 1600 kg/cm² gets the same IPB and P_cr", () => {
    let compared = 0;
    for (const { name, model } of PRESETS) {
      if (model.sigmaAdm !== 1600) continue;
      const solved = solveModel(model);
      for (const c of runChecks(model, solved) as SizeCheck[]) {
        if (c.kind !== "size" || !c.compressed || c.unloaded || Math.abs(c.demand.M) > 1e-6) continue;
        const pick = c.results.find((r) => r.series === "IPB")?.pick;
        if (!pick) continue;
        const L = solved.result.geo[solved.memberIndex.get(c.member)!].L;
        const r = compressionBar(c.demand.N, L);
        expect([name, c.member, r.name]).toEqual([name, c.member, pick.profile.name]);
        expect(r.pcr).toBeCloseTo(pick.pcr!, 4);
        expect(r.sigma).toBeCloseTo(pick.sigma, 6);
        compared++;
      }
    }
    expect(compared).toBeGreaterThan(0);
  });

  test("b4 of the first truss: P = D/sin 60° = 36 457 kg, L = 5 m → I min = 36 457 · 500² / (π² · 2.1e6) = 439.7 cm⁴ → IPB 140 (IPB 100 and 120 fall short)", () => {
    const r = compressionBar(31573.14 / Math.sin(Math.PI / 3), 5);
    expect(r.Imin).toBeCloseTo(439.7, 0);
    expect(r.name).toBe("IPB 140");
    expect(r.Iy).toBe(550);
    expect(r.pcr).toBeGreaterThan(36457);
    expect(compressionBar(36457, 5).name).toBe("IPB 140");
  });

  test("Euler decides, β scales the buckling length, a stocky bar gets a warning, and no profile may fit", () => {
    expect(compressionBar(30000, 5, 2).Imin).toBeCloseTo(4 * compressionBar(30000, 5).Imin, 9); // β = 2: Le doubles, I × 4
    expect(compressionBar(30000, 5, 0).Imin).toBe(compressionBar(30000, 5, 1).Imin); // 0 = default 1
    const stocky = compressionBar(80000, 0.5); // short and heavily loaded: Euler alone gives the lightest IPB...
    expect(stocky.name).toBe("IPB 100");
    expect(stocky.sigmaOk).toBe(false); // ...whose σ = 80 000 / 26 = 3 077 kg/cm² is over 1600: the program warns
    expect(compressionBar(36457, 5).sigmaOk).toBe(true);
    expect(compressionBar(1e7, 8).name).toBeNull();
  });

  test("running the listing = compressionBar (with the warning only when σ is over σ_adm)", () => {
    for (const [P, L, beta, S] of [[36457, 5, 0, 0], [-36457, 5, 1, 1600], [30000, 5, 2, 0], [80000, 0.5, 0, 2000]] as const) {
      const r = compressionBar(P, L, beta, S);
      const out = runBasic(PANDEO_LINES, [P, L, beta, S]);
      expect(out).toEqual([
        "I MIN CM4 EULER", expect.closeTo(r.Imin, 6),
        "IPB", +r.name!.replace("IPB ", ""), "IY CM4", r.Iy, "PCR KG", expect.closeTo(r.pcr, 3),
        "A DEL IPB CM2", r.A, "SIGMA KG CM2", expect.closeTo(r.sigma, 6),
        ...(r.sigmaOk ? [] : ["OJO SIGMA SUPERA ADM"]),
        "PESO KG M", r.w,
      ]);
    }
    expect(runBasic(PANDEO_LINES, [80000, 0.5, 0, 0])).toContain("OJO SIGMA SUPERA ADM");
    expect(runBasic(PANDEO_LINES, [36457, 5, 0, 0])).not.toContain("OJO SIGMA SUPERA ADM");
    expect(runBasic(PANDEO_LINES, [1e7, 8, 0, 0])).toEqual(["I MIN CM4 EULER", expect.any(Number), "NINGUN IPB HASTA 1000"]);
  });
});

describe("Casio program RETIC (bar forces of a truss of up to 9 bars)", () => {
  const trussPreset = (name: string) => PRESETS.find((p) => p.name === name)!.model;
  const NAMES = ["Triangular Truss", "Tower Truss", "Wall Truss (2 panels)"]; // 3, 9 and 9 bars; pinned + roller
  type M2 = ReturnType<typeof trussPreset>;

  // typed as on the calculator: option 1 nodes, 2 bars, 3 supports, 4 loads, 6 solve, 0 exit
  const inputsFor = (m: M2, opts: { bars?: number[][]; extra?: number[] } = {}) => {
    const idx = (id: string) => m.nodes.findIndex((n) => n.id === id) + 1;
    const pinned = m.nodes.find((n) => n.support === "pinned")!;
    const roller = m.nodes.find((n) => n.support === "roller-v" || n.support === "roller-h")!;
    const loads = m.loads.filter((l) => l.type === "nodal") as { node: string; fx: number; fy: number }[];
    const bars = opts.bars ?? m.members.map((b) => [idx(b.n1), idx(b.n2)]);
    return [
      1, m.nodes.length, ...m.nodes.flatMap((n) => [n.x, n.y]), 0,
      2, ...bars.flat(), 0,
      3, idx(pinned.id), idx(roller.id), roller.support === "roller-h" ? 2 : 1,
      4, loads.length, ...loads.flatMap((l) => [idx(l.node), l.fx, l.fy, 1]),
      6, ...(opts.extra ?? []), 0,
    ];
  };
  type Screen = [number, number, number | string][];
  const first = (gfx: ReturnType<typeof newGfx>, title: string) => gfx.screens.filter((sc) => sc[0]?.[2] === title);
  const at = (sc: Screen, col: number, row: number) => sc.find((l) => l[0] === col && l[1] === row)?.[2];

  test.each(NAMES)("%s: every bar's N, its T / C, the critical bars and the reactions are the app's", (name) => {
    const m = trussPreset(name);
    const solved = solveModel(m);
    const gfx = newGfx();
    runBasic(RETIC_LINES, inputsFor(m), gfx);
    const bars = m.members.map((b, e) => ({ k: e + 1, N: solved.stations[e][0].N }));
    expect(bars.length).toBeLessThanOrEqual(RETIC_MAX_BARS);
    // the table (pages of 6 bars: the text screen has 7 lines)
    const rows = new Map<number, { N: number; tc: string; star: boolean }>();
    for (const sc of first(gfx, "BARRA  N KG    T/C"))
      for (const r of [2, 3, 4, 5, 6, 7]) {
        const k = at(sc, 1, r);
        if (typeof k === "number") rows.set(k, { N: at(sc, 4, r) as number, tc: at(sc, 17, r) as string, star: at(sc, 20, r) === "*" });
      }
    expect(rows.size).toBe(bars.length);
    const tol = (v: number) => 1e-6 * Math.max(1, Math.abs(v));
    for (const { k, N } of bars) {
      const row = rows.get(k)!;
      expect(Math.abs(row.N - (Math.abs(N) < 1e-3 ? 0 : N))).toBeLessThan(tol(N) + 1e-3);
      expect(row.tc).toBe(Math.abs(N) < 1e-3 ? "0" : N > 0 ? "T" : "C");
    }
    // the critical bars: the largest tension and the largest compression, marked with *
    const maxT = bars.reduce((a, b) => (b.N > a.N ? b : a));
    const maxC = bars.reduce((a, b) => (b.N < a.N ? b : a));
    const marked = [...rows].filter(([, r]) => r.star).map(([k]) => k).sort();
    expect(marked).toEqual([...new Set([maxT.N > 0 ? maxT.k : 0, maxC.N < 0 ? maxC.k : 0])].filter(Boolean).sort());
    const crit = first(gfx, "BARRAS CRITICAS (*)")[0];
    if (maxT.N > 0) {
      expect(at(crit, 20, 2)).toBe(maxT.k);
      expect(at(crit, 5, 3) as number).toBeCloseTo(maxT.N, 2);
    }
    if (maxC.N < 0) {
      expect(at(crit, 20, 5)).toBe(maxC.k);
      expect(at(crit, 5, 6) as number).toBeCloseTo(maxC.N, 2);
      expect(at(crit, 11, 7) as number).toBeCloseTo(solved.result.geo[maxC.k - 1].L, 6); // its length, for PANDEO
    }
    // the reactions
    const pinned = m.nodes.find((n) => n.support === "pinned")!;
    const roller = m.nodes.find((n) => n.support?.startsWith("roller"))!;
    const rea = first(gfx, "REACCIONES KG")[0];
    const rp = solved.result.reactions[solved.nodeIndex.get(pinned.id)!];
    const rr = solved.result.reactions[solved.nodeIndex.get(roller.id)!];
    expect(at(rea, 12, 2) as number).toBeCloseTo(rp.rx, 2);
    expect(at(rea, 12, 3) as number).toBeCloseTo(rp.ry, 2);
    expect(at(rea, 12, 4) as number).toBeCloseTo(roller.support === "roller-h" ? rr.rx : rr.ry, 2);
  });

  test("the node and bar screens say what is asked: X horizontal, Y vertical, in metres from a fixed origin; a bar joins two nodes in any order", () => {
    const m = trussPreset("Triangular Truss");
    const gfx = newGfx();
    runBasic(RETIC_LINES, inputsFor(m), gfx);
    const nodeScreens = gfx.screens.filter((sc) => at(sc, 1, 2) === "X: HORIZONTAL (M)");
    expect(nodeScreens).toHaveLength(3); // one per node
    nodeScreens.forEach((sc, k) => {
      expect([at(sc, 1, 1), at(sc, 6, 1), at(sc, 9, 1), at(sc, 12, 1)]).toEqual(["NUDO", k + 1, "DE", 3]);
      expect([at(sc, 1, 3), at(sc, 1, 4), at(sc, 1, 5)]).toEqual(["Y: VERTICAL (M)", "ORIGEN: UN PUNTO FIJO", "EJ: APOYO IZQ = 0,0"]);
    });
    const barScreens = gfx.screens.filter((sc) => at(sc, 1, 2) === "UNE DOS NUDOS");
    expect(barScreens).toHaveLength(3);
    expect([at(barScreens[0], 1, 1), at(barScreens[0], 7, 1), at(barScreens[0], 10, 1), at(barScreens[0], 13, 1)]).toEqual(["BARRA", 1, "DE", 3]);
    expect(at(barScreens[0], 1, 3)).toBe("EL ORDEN NO IMPORTA");
  });

  test("a mechanism (one bar twice) is detected instead of giving numbers", () => {
    const m = trussPreset("Tower Truss");
    const idx = (id: string) => m.nodes.findIndex((n) => n.id === id) + 1;
    const bars = m.members.map((b) => [idx(b.n1), idx(b.n2)]);
    bars[8] = bars[0].slice(); // the last bar is the first again: the matrix is singular
    const gfx = newGfx();
    runBasic(RETIC_LINES, inputsFor(m, { bars }), gfx);
    expect(first(gfx, "ESTRUCTURA INESTABLE")).toHaveLength(1);
    expect(first(gfx, "BARRA  N KG    T/C")).toHaveLength(0);
  });

  test("solving before entering the data says what is missing; nodes need to come first", () => {
    const gfx = newGfx();
    runBasic(RETIC_LINES, [2, 3, 4, 6, 0], gfx);
    expect(first(gfx, "PRIMERO LOS NUDOS")).toHaveLength(3);
    expect(first(gfx, "FALTAN DATOS")).toHaveLength(1);
  });

  test("corrections: a node, a bar and a load typed again leave the rest alone", () => {
    const m = trussPreset("Triangular Truss");
    const solved = solveModel(m);
    const idx = (id: string) => m.nodes.findIndex((n) => n.id === id) + 1;
    const pinned = m.nodes.find((n) => n.support === "pinned")!;
    const roller = m.nodes.find((n) => n.support?.startsWith("roller"))!;
    const loads = m.loads.filter((l) => l.type === "nodal") as { node: string; fx: number; fy: number }[];
    const bars = m.members.map((b) => [idx(b.n1), idx(b.n2)]);
    const gfx = newGfx();
    const [n1, n2, n3] = m.nodes;
    runBasic(
      RETIC_LINES,
      [
        1, 3, 9, 9, n2.x, n2.y, n3.x, n3.y, 1, n1.x, n1.y, 0, // node 1 typed wrong → CORREGIR NUDO 1 → the right values → no more
        2, 3, 3, ...bars[1], ...bars[2], 1, ...bars[0], 0, // bar 1 typed wrong (3 to 3) → CORREGIR BARRA 1
        3, idx(pinned.id), idx(roller.id), roller.support === "roller-h" ? 2 : 1,
        4, loads.length, 1, 7, 7, 0, // a wrong load → REPETIR: the slot is typed again, the count does not move
        ...loads.flatMap((l) => [idx(l.node), l.fx, l.fy, 1]),
        6, 0,
      ],
      gfx,
    );
    const sc = first(gfx, "BARRA  N KG    T/C")[0];
    m.members.forEach((_, e) => expect(at(sc, 4, e + 2) as number).toBeCloseTo(Math.abs(solved.stations[e][0].N) < 1e-3 ? 0 : solved.stations[e][0].N, 2));
  });
});

describe("Casio program PERFILES (look up an IPN / IPB, or find the lightest that meets a requirement)", () => {
  type Screen = [number, number, number | string][];
  const at = (sc: Screen, col: number, row: number) => sc.find((l) => l[0] === col && l[1] === row)?.[2];
  const dataScreens = (gfx: ReturnType<typeof newGfx>) => gfx.screens.filter((sc) => at(sc, 1, 2) === "A");
  const run = (inputs: number[]) => {
    const gfx = newGfx();
    runBasic(PERFILES_LINES, inputs, gfx);
    return gfx;
  };

  test("the table is the course's: 23 IPN and 24 IPB, in the 8 lists of what the course uses", () => {
    expect(SEARCH_TABLE).toHaveLength(47);
    expect(SEARCH_TABLE.filter((p) => p.series === "IPN")).toHaveLength(23);
    expect(PERFILES_LINES.filter((l) => l.includes("→List")).length).toBe(8);
  });

  test.each([[1, 80], [1, 200], [1, 500], [2, 100], [2, 260], [2, 1000]] as const)("DATOS of series %i, %i: every value is the table's", (series, h) => {
    const p = findProfile(series, h)!;
    const [sc] = dataScreens(run([1, series, h, 0]));
    expect([at(sc, 1, 1), at(sc, 5, 1)]).toEqual([series === 1 ? "IPN" : "IPB", h]);
    // the six properties the course uses: A, weight, Sx, Sy, Ix, Iy
    expect([at(sc, 4, 2), at(sc, 16, 2)]).toEqual([p.A, p.w]);
    expect([at(sc, 4, 3), at(sc, 16, 3)]).toEqual([p.Sx, p.Sy]);
    expect([at(sc, 4, 4), at(sc, 16, 4)]).toEqual([p.Ix, p.Iy]);
    expect([at(sc, 1, 5), at(sc, 1, 6)]).toEqual(["A CM²  PESO KG/M", "S CM³  I CM⁴"]);
  });

  test("DATOS of a profile that does not exist (or of the other series) says so; a series out of range is clamped", () => {
    expect(run([1, 1, 123, 0]).screens.some((sc) => at(sc, 1, 1) === "NO EXISTE ESE PERFIL")).toBe(true);
    expect(run([1, 1, 1000, 0]).screens.some((sc) => at(sc, 1, 1) === "NO EXISTE ESE PERFIL")).toBe(true); // no IPN 1000
    const [sc] = dataScreens(run([1, 7, 260, 0])); // 7 → IPB
    expect([at(sc, 1, 1), at(sc, 5, 1)]).toEqual(["IPB", 260]);
  });

  test.each([
    [2, 1, 7500], // Sx ≥ 7 500 cm³: IPB 800
    [2, 1, 1150], // exactly the Sx of IPB 260
    [2, 1, 1151],
    [1, 1, 100],
    [2, 2, 25000],
    [1, 3, 33],
    [2, 4, 5000],
    [1, 5, 30],
    [2, 5, 900],
  ] as const)("BUSCAR series %i, property %i, value %i: the lightest of the series that reaches it", (series, q, v) => {
    const r = lightestWith(series, q, v)!;
    const [sc] = dataScreens(run([2, series, q, v, 0]));
    expect([at(sc, 1, 1), at(sc, 5, 1)]).toEqual([series === 1 ? "IPN" : "IPB", r.profile.h]);
    expect([at(sc, 1, 7), at(sc, 6, 7), at(sc, 12, 7), at(sc, 15, 7)]).toEqual(["PIDE", v, "DA", r.value]);
  });

  test("BUSCAR: the previous profile does not reach it; nothing may reach it", () => {
    const r = lightestWith(2, 1, 7500)!;
    const ipb = SEARCH_TABLE.filter((p) => p.series === "IPB");
    const prev = ipb[ipb.indexOf(r.profile) - 1];
    expect(prev.Sx).toBeLessThan(7500);
    expect(r.profile.name).toBe("IPB 800");
    expect(lightestWith(2, 1, 1e9)).toBeNull();
    expect(run([2, 2, 1, 1e9, 0]).screens.some((sc) => at(sc, 1, 1) === "NINGUN PERFIL CUMPLE")).toBe(true);
    expect(dataScreens(run([2, 2, 1, 1e9, 0]))).toHaveLength(0);
    // a property out of range is clamped to the last one (Sy)
    const [sc] = dataScreens(run([2, 2, 9, 900, 0]));
    expect(at(sc, 5, 1)).toBe(lightestWith(2, 5, 900)!.profile.h);
  });

  test("the lists of the program are the table's columns", () => {
    const lines = PERFILES_LINES.filter((l) => l.includes("→List"));
    expect(lines[1]).toBe(`{${SEARCH_TABLE.map((p) => p.h).join(",")}}→List 2`);
    expect(lines[5]).toBe(`{${SEARCH_TABLE.map((p) => p.Sx).join(",")}}→List 6`);
    expect(lines[3]).toBe(`{${SEARCH_TABLE.map((p) => p.w).join(",")}}→List 4`);
  });
});

describe("Casio menus with the arrow keys (▲ 28, ▼ 37, EXE 31, EXIT 47, number keys, 0)", () => {
  const rows = (gfx: ReturnType<typeof newGfx>) => gfx.locates.filter((l) => l[2] === ">").map((l) => l[1]); // where the > marker was drawn
  const titles = (gfx: ReturnType<typeof newGfx>, t: string) => gfx.screens.filter((sc) => sc[0]?.[2] === t).length;
  const run = (lines: string[], inputs: number[], keys: number[]) => {
    const gfx = newGfx();
    runBasic(lines, inputs, gfx, newMem(), keys);
    return gfx;
  };

  test("the DIGIT keys used by the test interpreter are the manual's chart (0 = 71, 1 = 72, 2 = 62 ... 5 = 63)", () => {
    // the generated menu tests each of those codes: 1..5 choose the item, 0 / EXIT leave
    const text = REACC_LINES.join("\\n");
    for (const [code, item] of [[72, 1], [62, 2], [52, 3], [73, 4], [63, 5]]) expect(text).toContain(`If W=${code}:Then ${item}→S:0→O:IfEnd`);
    expect(text).toContain("If W=28:Then S–1→S:IfEnd");
    expect(text).toContain("If W=37:Then S+1→S:IfEnd");
    expect(text).toContain("If W=31:Then 0→O:IfEnd");
    expect(text).toContain("If W=47:Then 6→S:0→O:IfEnd");
  });

  test("REACC: ▼ ▼ EXE chooses REACCIONES (the marker follows), EXIT leaves", () => {
    const gfx = run(REACC_LINES, [0], [37, 37, 31, 47]);
    expect(rows(gfx).slice(0, 3)).toEqual([2, 3, 4]); // starts on item 1 and goes down twice
    expect(gfx.screens.some((sc) => sc[0]?.[2] === "REACCIONES EN A")).toBe(true);
  });

  test("REACC: ▲ from the first item wraps to the last (0 SALIR); ▼ from the last wraps to the first", () => {
    const up = run(REACC_LINES, [0], [28, 31]); // S = 6 = SALIR: the program stops
    expect(rows(up)).toEqual([2, 7]);
    expect(titles(up, "REACC  CARGAS")).toBe(1);
    const down = run(REACC_LINES, [0, 1, 1, 0, 0, 0, 0, 0, -1, 1], [37, 37, 37, 37, 37, 37, 31, 47]); // 6 × ▼ = back to item 1 → AGREGAR
    expect(rows(down).slice(0, 7)).toEqual([2, 3, 4, 5, 6, 7, 2]);
    expect(down.screens.some((sc) => sc[0]?.[2] === "CARGA")).toBe(true); // the summary of the load
  });

  test("REACC: a number key chooses at once, and 0 leaves", () => {
    const gfx = run(REACC_LINES, [0], [52, 71]); // 3 = REACCIONES, then 0
    expect(gfx.screens.some((sc) => sc[0]?.[2] === "REACCIONES EN A")).toBe(true);
    expect(titles(gfx, "REACC  CARGAS")).toBe(2);
  });

  test("RETIC: six items on lines 2-7; ▼ EXE is BARRAS (it asks for the nodes first), ▲ from the first wraps to RESOLVER; EXIT or 0 leave", () => {
    const g1 = run(RETIC_LINES, [], [37, 31, 47]);
    expect(rows(g1).slice(0, 2)).toEqual([2, 3]);
    expect(g1.screens.some((sc) => sc[0]?.[2] === "PRIMERO LOS NUDOS")).toBe(true);
    const g2 = run(RETIC_LINES, [], [28, 31, 71]);
    expect(rows(g2).slice(0, 2)).toEqual([2, 7]);
    expect(g2.screens.some((sc) => sc[0]?.[2] === "FALTAN DATOS")).toBe(true);
  });

  test("PERFILES: ▼ EXE is BUSCAR REQUISITO, ▼ ▼ EXE is SALIR", () => {
    const g = run(PERFILES_LINES, [2, 1, 100], [37, 31, 47]);
    expect(rows(g).slice(0, 2)).toEqual([2, 3]);
    expect(g.screens.some((sc) => sc.some((l) => l[1] === 2 && l[2] === "A"))).toBe(true); // the data screen of the profile found
    const exit = run(PERFILES_LINES, [], [37, 37, 31]);
    expect(rows(exit)).toEqual([2, 3, 4]);
  });

  test("the menus never draw outside the 21 × 7 screen (the interpreter would throw) and the key loop waits for a key", () => {
    expect(() => run(REACC_LINES, [0], [])).toThrow(/no key left/);
  });
});
