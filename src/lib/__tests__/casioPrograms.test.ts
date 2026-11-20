import { solveModel3D } from "../solve3d";
import { PRESETS_3D } from "../presets3d";
import { PRESETS } from "../presets";
import { eccentricLoad } from "../eccentric";
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
  EXCENTR_LINES,
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
    const out = runBasic(REACC_LINES, [start === 0 ? 2 : 1, ...inputs], gfx, mem); // the first menu: 1 SEGUIR, 2 NUEVA
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
    // each load starts on a screen that says which one it is (CARGA 1, CARGA 2) with the kinds to choose from
    const heads = r.gfx.screens.filter((sc) => sc[0]?.[2] === "CARGA" && sc.some((l) => l[2] === "PUNTUAL¹")).map((sc) => at(sc, 7, 1));
    expect(heads).toEqual([1, 2]);
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
      1, 9, 9, 9, 9, 9, 9, 2, // a wrong point load → 2 = REPETIR
      1, 0, 0, 3, 0, 300, 0, 1, // the right one
      3, 0,
    ]);
    expect(r.rea).toEqual([0, -300, 0, 900, 0, 0]);
    const heads = r.gfx.screens.filter((sc) => sc[0]?.[2] === "CARGA" && sc.some((l) => l[2] === "PUNTUAL¹")).map((sc) => at(sc, 7, 1));
    expect(heads).toEqual([1, 1]); // the same load number twice
  });

  test("running REACC: the summary screen shows what the program understood (centre and length of a distributed load)", () => {
    const { gfx } = reacc([1, 1, 2, -1, 2, 0, 0, 3, 3, 0, 0, -200, 1, 0]);
    const sc = [...gfx.screens].find((x) => x[0]?.[2] === "CARGA" && at(x, 1, 2) === "X")!; // the summary, not the menu of kinds
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
      2, 1, 0, // LISTAR → VOLVER AL MENU, then SALIR
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

  test("running REACC: every page of the list waits for a key before the screen is cleared (the last one too: the menu clears it)", () => {
    // 1 to 5 loads: 1 page (≤ 3 loads) or 2 pages; each page is a screen and must be followed by a wait
    for (const n of [1, 3, 4, 5]) {
      const loads = Array.from({ length: n }, () => pointLoad(0, 0, 3, 0, 300, 0)).flat();
      const { gfx } = reacc([1, n, ...loads, 2, 1, 0]);
      const listIdx = gfx.screens.map((sc, i) => [sc, i] as const).filter(([sc]) => sc[0]?.[2] === "N T  X     Y     Z").map(([, i]) => i);
      expect(listIdx).toHaveLength(Math.ceil(n / 3));
      // a wait happened while each page was the last screen (the screens count is its index + 1)
      listIdx.forEach((i) => expect(gfx.waits).toContain(i + 1));
    }
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
      2, 2, 1, // LISTAR → 2 BORRAR UNA CARGA → load 1
      2, 3, // the list again, now with two: BORRAR UNA → 3 is beyond the end, so it deletes the last one (the 7s)
      1, // the list once more, with one left: 1 VOLVER AL MENU
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
      5, 2, // BORRAR TODO → 2 SI
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
        expect(out.slice(0, 6)).toEqual(["USAR IPB", +c.name.replace("IPB ", ""), "SIGMAₘₐₓ =", expect.closeTo(c.sigmaMax, 6), "CARA =", face]);
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
      return { gfx, pg: gfx.pages[1], name: `IPB ${out[1]}`, face: out[5] as 1 | 2 };
    };
    // base of preset #2: face 2, IPB 120. The 12 edges are the closed outline of guideOutline (the guide's figure)
    const { pg, name, face } = run(-600, -300, 900);
    expect([name, face]).toEqual(["IPB 120", 2]);
    const s = guideSection(name, true);
    const outline = guideOutline(s);
    expect(pg.segments.slice(0, 12)).toHaveLength(12);
    // the same 12 edges (the program walks the vertices in its own order, so compare them as undirected edges)
    const edge = (a: number[], b: number[]) => [a, b].map((v) => v.map((c) => c.toFixed(6)).join(",")).sort().join("|");
    expect(new Set(pg.segments.slice(0, 12).map(([x1, y1, x2, y2]) => edge([x1, y1], [x2, y2])))).toEqual(
      new Set(outline.map((p, k) => edge(p, outline[(k + 1) % 12]))),
    );
    // equal scale on a 127 x 63 screen, the section inside the window
    const [xmin, xmax, , ymin, ymax] = pg.window!;
    expect(xmax).toBeCloseTo(-xmin, 9);
    expect(ymax).toBeCloseTo(-ymin, 9);
    expect(xmax / ymax).toBeCloseTo(2, 9);
    expect(ymax).toBeGreaterThan(s.hy);
    expect(xmax).toBeGreaterThan(s.hx);
    expect([pg.horizontals, pg.verticals]).toEqual([[0], [0]]); // the two axes
    // the neutral axis (the 13th segment): both ends have σ = 0
    expect(pg.segments).toHaveLength(13);
    const k = plane(-600, -300, 900, s);
    const [ex1, ey1, ex2, ey2] = pg.segments[12];
    expect(Math.abs(sigmaAt(k, ex1, ey1))).toBeLessThan(1e-6);
    expect(Math.abs(sigmaAt(k, ex2, ey2))).toBeLessThan(1e-6);
    // the critical corner and its signed σ
    const cc = criticalCorner(guideCorners(k, s));
    expect(pg.plots).toEqual([[expect.closeTo(cc.x, 9), expect.closeTo(cc.y, 9)]]);
    expect(pg.texts).toEqual([[1, 1, expect.closeTo(cc.sigma, 6)]]);
    // face 1 (|Mx| > |My|) is the outline as drawn, not swapped
    const f1 = run(-600, 900, -300);
    expect(f1.face).toBe(1);
    const s1 = guideSection(f1.name, false);
    const o1 = guideOutline(s1);
    expect(new Set(f1.pg.segments.slice(0, 12).map(([x1, y1, x2, y2]) => edge([x1, y1], [x2, y2])))).toEqual(
      new Set(o1.map((p, k) => edge(p, o1[(k + 1) % 12]))),
    );
    // a moment of 0: the neutral axis is parallel to an axis (Mx = 0: vertical line) or there is none (only N)
    const mx0 = run(-600, 0, 900);
    expect(mx0.pg.segments).toHaveLength(12); // no sloped line: Mx = 0 makes the neutral axis the vertical x = −N·Iy/(A·My)
    const sMx0 = guideSection(mx0.name, mx0.face === 2);
    expect(mx0.pg.verticals).toEqual([0, expect.closeTo(neutralAxisOf(mx0.name, mx0.face, -600, 0, 900).x0!, 9)]);
    expect(sMx0.A).toBeGreaterThan(0);
    const onlyN = run(-600, 0, 0);
    expect(onlyN.pg.segments).toHaveLength(12); // only N: σ is uniform, no neutral axis
    expect(onlyN.pg.verticals).toEqual([0]); // just the axis
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
    expect((text.match(/◢/g) ?? []).length).toBe(REACC_LINES.filter((l) => l.endsWith("◢")).length);
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
    expect(PERFIL_LINES.filter((l) => l.includes("→List")).length).toBe(12); // 7 table lists, the vertices of the outline (its own drawing and the diagrams) and the data of the diagrams
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
      "Mₘₐₓ KG M", expect.closeTo(r.Mmax, 6), "SX NEC CM3", expect.closeTo(r.sxReq, 6),
      "IPBₘᵢₙ", +r.min!.name.replace("IPB ", ""), "SIGMA CON IPBₘᵢₙ", expect.closeTo(r.min!.sigma, 6),
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
    expect(none).not.toContain("IPBₘᵢₙ");
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
        "Iₘᵢₙ CM4 EULER", expect.closeTo(r.Imin, 6),
        "IPB", +r.name!.replace("IPB ", ""), "IY CM4", r.Iy, "PCR KG", expect.closeTo(r.pcr, 3),
        "A DEL IPB CM2", r.A, "SIGMA KG CM2", expect.closeTo(r.sigma, 6),
        ...(r.sigmaOk ? [] : ["OJO SIGMA SUPERA ADM"]),
        "PESO KG M", r.w,
      ]);
    }
    expect(runBasic(PANDEO_LINES, [80000, 0.5, 0, 0])).toContain("OJO SIGMA SUPERA ADM");
    expect(runBasic(PANDEO_LINES, [36457, 5, 0, 0])).not.toContain("OJO SIGMA SUPERA ADM");
    expect(runBasic(PANDEO_LINES, [1e7, 8, 0, 0])).toEqual(["Iₘᵢₙ CM4 EULER", expect.any(Number), "NINGUN IPB HASTA 1000"]);
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

describe("Casio program PERFILES (scroll the IPN / IPB, or find the lightest that meets a requirement)", () => {
  type Screen = [number, number, number | string][];
  const at = (sc: Screen, col: number, row: number) => sc.find((l) => l[0] === col && l[1] === row)?.[2];
  const dataScreens = (gfx: ReturnType<typeof newGfx>) => gfx.screens.filter((sc) => at(sc, 1, 2) === "A");
  const run = (inputs: number[]) => {
    const gfx = newGfx();
    runBasic(PERFILES_LINES, inputs, gfx);
    return gfx;
  };
  const DOWN = 37;
  const UP = 28;
  const EXIT = 47;
  // menu choices are number keys (1 VER / 2 BUSCAR; 1 IPN / 2 IPB; 1..5 the property) and the arrows are raw key codes
  const ver = (series: 1 | 2, steps: number[]) => run([1, series, ...steps, EXIT, 0]);

  test("the table is the course's: 23 IPN and 24 IPB, in the 8 lists of what the course uses", () => {
    expect(SEARCH_TABLE).toHaveLength(47);
    expect(SEARCH_TABLE.filter((p) => p.series === "IPN")).toHaveLength(23);
    expect(PERFILES_LINES.filter((l) => l.includes("→List")).length).toBe(8);
  });

  test.each([[1, 80], [1, 200], [1, 500], [2, 100], [2, 260], [2, 1000]] as const)("VER series %i, scrolling to %i: every value is the table's", (series, h) => {
    const same = SEARCH_TABLE.filter((p) => (series === 1 ? p.series === "IPN" : p.series === "IPB"));
    const p = findProfile(series, h)!;
    const gfx = ver(series, Array(same.indexOf(p)).fill(DOWN));
    const sc = dataScreens(gfx).at(-1)!;
    expect([at(sc, 1, 1), at(sc, 5, 1), at(sc, 13, 1)]).toEqual([series === 1 ? "IPN" : "IPB", h, "EXIT=MENU"]);
    // the six properties the course uses: A, weight, Sx, Sy, Ix, Iy
    expect([at(sc, 4, 2), at(sc, 16, 2)]).toEqual([p.A, p.w]);
    expect([at(sc, 4, 3), at(sc, 16, 3)]).toEqual([p.Sx, p.Sy]);
    expect([at(sc, 4, 4), at(sc, 16, 4)]).toEqual([p.Ix, p.Iy]);
    expect([at(sc, 1, 5), at(sc, 1, 6)]).toEqual(["A CM²  PESO KG/M", "S CM³  I CM⁴"]);
    expect(at(sc, 1, 7)).toBe("FLECHAS: OTRO PERFIL");
    expect(dataScreens(gfx)).toHaveLength(same.indexOf(p) + 1); // one screen per step
  });

  test("VER starts on the smallest profile of the series, ▲ and ▼ stop at the ends, and the two series do not mix", () => {
    const ipn = SEARCH_TABLE.filter((p) => p.series === "IPN");
    const ipb = SEARCH_TABLE.filter((p) => p.series === "IPB");
    const first = dataScreens(ver(1, [UP, UP]));
    expect(first.map((sc) => at(sc, 5, 1))).toEqual([ipn[0].h, ipn[0].h, ipn[0].h]); // ▲ at the first: stays
    const last = dataScreens(ver(2, Array(40).fill(DOWN))).at(-1)!;
    expect(at(last, 5, 1)).toBe(ipb[ipb.length - 1].h); // ▼ past the last: stays on IPB 1000
    expect(at(dataScreens(ver(2, []))[0], 5, 1)).toBe(ipb[0].h); // IPB 100, not the IPN 80 before it in the table
    // going back up
    expect(dataScreens(ver(1, [DOWN, DOWN, UP])).map((sc) => at(sc, 5, 1))).toEqual([ipn[0].h, ipn[1].h, ipn[2].h, ipn[1].h]);
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
    const [sc] = dataScreens(run([2, series, q, v, EXIT, 0]));
    expect([at(sc, 1, 1), at(sc, 5, 1)]).toEqual([series === 1 ? "IPN" : "IPB", r.profile.h]);
    expect([at(sc, 1, 7), at(sc, 6, 7), at(sc, 12, 7), at(sc, 15, 7)]).toEqual(["PIDE", v, "DA", r.value]);
  });

  test("BUSCAR: from the result ▼ goes to the next larger profile (the request line only shows on the one found); nothing may reach it", () => {
    const r = lightestWith(2, 1, 7500)!;
    const ipb = SEARCH_TABLE.filter((p) => p.series === "IPB");
    const prev = ipb[ipb.indexOf(r.profile) - 1];
    expect(prev.Sx).toBeLessThan(7500);
    expect(r.profile.name).toBe("IPB 800");
    const screens = dataScreens(run([2, 2, 1, 7500, DOWN, UP, UP, EXIT, 0]));
    expect(screens.map((sc) => at(sc, 5, 1))).toEqual([800, 900, 800, 700]);
    expect(screens.map((sc) => at(sc, 1, 7))).toEqual(["PIDE", "FLECHAS: OTRO PERFIL", "PIDE", "FLECHAS: OTRO PERFIL"]);
    expect(lightestWith(2, 1, 1e9)).toBeNull();
    expect(run([2, 2, 1, 1e9, 0]).screens.some((sc) => at(sc, 1, 1) === "NINGUN PERFIL CUMPLE")).toBe(true);
    expect(dataScreens(run([2, 2, 1, 1e9, 0]))).toHaveLength(0);
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
    const gfx = run(REACC_LINES, [], [62, 37, 37, 31, 47]); // 62 = the 2 key: NUEVA in the first menu
    expect(rows(gfx).slice(1, 4)).toEqual([2, 3, 4]); // (the first menu drew its own marker) starts on item 1 and goes down twice
    expect(gfx.screens.some((sc) => sc[0]?.[2] === "REACCIONES EN A")).toBe(true);
  });

  test("REACC: ▲ from the first item wraps to the last (0 SALIR); ▼ from the last wraps to the first", () => {
    const up = run(REACC_LINES, [], [62, 28, 31]); // S = 6 = SALIR: the program stops
    expect(rows(up).slice(1)).toEqual([2, 7]);
    expect(titles(up, "REACC  CARGAS")).toBe(1);
    // 6 × ▼ = back to item 1 → AGREGAR; the kind (1 PUNTUAL) and the OK come from the keys too
    const down = run(REACC_LINES, [1, 0, 0, 0, 0, 0, -1], [62, 37, 37, 37, 37, 37, 37, 31, 72, 72, 47]);
    expect(rows(down).slice(1, 8)).toEqual([2, 3, 4, 5, 6, 7, 2]);
    expect(down.screens.some((sc) => sc[0]?.[2] === "CARGA")).toBe(true); // the summary of the load
  });

  test("REACC: a number key chooses at once, and 0 leaves", () => {
    const gfx = run(REACC_LINES, [], [62, 52, 71]); // NUEVA, then 3 = REACCIONES, then 0
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

  test("PERFILES: ▼ EXE is BUSCAR REQUISITO, then series, property and the value; ▼ ▼ EXE is SALIR", () => {
    const g = run(PERFILES_LINES, [100], [37, 31, 62, 72, 37, 47, 71]); // BUSCAR, IPB, Sx, value 100 → IPB 120, ▼ → IPB 140, EXIT, 0
    expect(rows(g).slice(0, 2)).toEqual([2, 3]);
    const data = g.screens.filter((sc) => sc.some((l) => l[1] === 2 && l[2] === "A"));
    expect(data.map((sc) => sc.find((l) => l[0] === 5 && l[1] === 1)![2])).toEqual([120, 140]);
    const exit = run(PERFILES_LINES, [], [37, 37, 31]);
    expect(rows(exit)).toEqual([2, 3, 4]);
  });

  test("each menu item ends with a superscript of its number key (¹ ² … , ⁰ for SALIR): the hidden shortcut, shown small", () => {
    for (const lines of [REACC_LINES, RETIC_LINES, PERFILES_LINES]) {
      const items = lines.flatMap((l) => [...l.matchAll(/Locate 3,(\d),"([^"]*)"/g)].map((m) => [+m[1], m[2]] as [number, string]));
      expect(items.length).toBeGreaterThan(0);
      items.forEach(([, t]) => expect(t).toMatch(/[⁰¹²³⁴⁵⁶⁷⁸⁹]$/));
    }
    // the order of the main menu of REACC: ¹ AGREGAR … ⁵ BORRAR TODO, ⁰ SALIR
    const reacc = REACC_LINES.join("\n");
    ["AGREGAR CARGAS¹", "LISTAR CARGAS²", "REACCIONES³", "CORTE EN BASE⁴", "BORRAR TODO⁵", "SALIR⁰"].forEach((t) => expect(reacc).toContain(`"${t}"`));
    // the safe answer of a yes / no is the first one: NO¹ SI, BORRAR TODO²
    expect(reacc).toContain('"NO¹"');
    // and the number keys still choose, which the screens run in the tests above show
  });

  test("the prompts that follow a menu start on a clean screen (no menu left behind the question)", () => {
    // PERFILES: the value needed is asked under its own title, not under the list of properties
    const g = run(PERFILES_LINES, [100], [37, 31, 62, 72, 47, 71]);
    const ask = g.screens.find((sc) => sc[0]?.[2] === "BUSCAR")!;
    expect(ask.map((l) => l[2])).toEqual(["BUSCAR", "IPB", "SX (CM³)"]);
    // REACC: the data of a load are asked under CARGA n, without the kinds
    const r = run(REACC_LINES, [1, 0, 0, 3, 0, 300, 0], [62, 72, 72, 72, 47]); // NUEVA, AGREGAR, PUNTUAL, ..., OK, EXIT
    const load = r.screens.filter((sc) => sc[0]?.[2] === "CARGA" && sc.length === 2);
    expect(load.length).toBeGreaterThan(0);
    load.forEach((sc) => expect(sc.map((l) => l[2])).toEqual(["CARGA", 1]));
  });

  test("the menus never draw outside the 21 × 7 screen (the interpreter would throw) and the key loop waits for a key", () => {
    expect(() => run(REACC_LINES, [], [])).toThrow(/no key left/);
  });
});

describe("the exam example truss-cable-beam-ipb260-kg, start to finish with the programs", () => {
  const base = PRESETS.find((p) => p.name === "Truss + Cable + Beam IPB 260")!.model;

  test("VIGACAB → RETIC (the cable's T as a load on C) → TRACCION / PANDEO for each bar = what the app gives", () => {
    // 1. the beam F-G and the cable (the program sizes the beam: IPB 550 is the lightest, and its weight is what the cable carries)
    const beam = cableBeam({ L: 10, Lc: 15, loads: [{ P: 20000, a: 5 }], q: 2000 });
    const withMin = {
      ...base,
      members: base.members.map((m) => (m.id === "FG" ? { ...m, section: { kind: "profile" as const, name: beam.min!.name } } : m)),
    };
    const solved = solveModel(withMin);
    const checks = runChecks(withMin, solved);
    // 2. RETIC: the 7 bars of the truss (nodes A B C D E), T hangs from C
    const ids = ["A", "B", "C", "D", "E"];
    const bars = ["b1", "b2", "b3", "b4", "b5", "b6", "b7"].map((id) => withMin.members.find((m) => m.id === id)!);
    const idx = (id: string) => ids.indexOf(id) + 1;
    const nodes = ids.map((id) => withMin.nodes.find((n) => n.id === id)!);
    const gfx = newGfx();
    runBasic(RETIC_LINES, [
      1, 5, ...nodes.flatMap((n) => [n.x, n.y]), 0,
      2, ...bars.flatMap((b) => [idx(b.n1), idx(b.n2)]), 0,
      3, idx("B"), idx("A"), 1, // pinned B, roller A with a vertical reaction
      4, 3, idx("D"), 0, -40000, 1, idx("E"), 5000, 0, 1, idx("C"), 0, -beam.T, 1, // D 40 000 kg down, E 5 000 kg right, the cable's T at C
      6, 0,
    ], gfx);
    const rows = new Map<number, { N: number; tc: string }>();
    for (const sc of gfx.screens.filter((x) => x[0]?.[2] === "BARRA  N KG    T/C"))
      for (const r of [2, 3, 4, 5, 6, 7]) {
        const k = sc.find((l) => l[0] === 1 && l[1] === r)?.[2];
        if (typeof k === "number") rows.set(k, { N: sc.find((l) => l[0] === 4 && l[1] === r)![2] as number, tc: sc.find((l) => l[0] === 17 && l[1] === r)![2] as string });
      }
    expect(rows.size).toBe(7);
    // 3. each bar: N like the app, then its IPB by TRACCION (tension) or PANDEO (compression, with the bar's length)
    bars.forEach((b, i) => {
      const e = solved.memberIndex.get(b.id)!;
      const N = solved.stations[e][0].N;
      expect(rows.get(i + 1)!.N).toBeCloseTo(Math.abs(N) < 1e-3 ? 0 : N, 1);
      const pick = (checks as SizeCheck[]).find((c) => c.kind === "size" && c.member === b.id)!.results.find((r) => r.series === "IPB")!.pick!;
      const L = solved.result.geo[e].L;
      const mine = N >= 0 ? tensionBar(N, 1600).name : compressionBar(N, L).name;
      expect([b.id, N >= 0 ? "T" : "C", mine]).toEqual([b.id, N >= 0 ? "T" : "C", pick.profile.name]);
    });
    // the cable
    const c = (checks as { kind: string }[]).find((x) => x.kind === "cable") as CableCheck;
    expect(beam.T).toBeCloseTo(c.N, 2);
    expect(beam.d).toBeCloseTo(c.dReq, 6);
    expect(beam.elongation).toBeCloseTo(c.elongation, 4);
  });
});

describe("Casio program EXCENTR (eccentric axial load on an IPN / IPB: ipn300-eccentric-tension.svg)", () => {
  type Screen = [number, number, number | string][];
  const at = (sc: Screen | undefined, col: number, row: number) => sc?.find((l) => l[0] === col && l[1] === row)?.[2];
  const scr = (gfx: ReturnType<typeof newGfx>, title: string) => gfx.screens.find((sc) => sc[0]?.[2] === title);
  const EXE = 31, DOWN = 37, UP = 28, LEFT = 38, RIGHT = 27;
  // series (1 IPN / 2 IPB) · moves of the profile list ending with EXE · face · unit · P, ex, ey, σ adm · 0 = SALIR
  const run = (series: 1 | 2, moves: number[], face: 1 | 2, unit: 1 | 2, P: number, ex: number, ey: number, S: number) => {
    const gfx = newGfx();
    runBasic(EXCENTR_LINES, [series, ...moves, EXE, face, unit, P, ex, ey, S, 0], gfx);
    return gfx;
  };
  const profileAt = (series: 1 | 2, steps: number) => {
    const same = SEARCH_TABLE.filter((p) => p.series === (series === 1 ? "IPN" : "IPB"));
    const start = same.findIndex((p) => p.h === 300);
    return same[Math.min(Math.max(start + steps, 0), same.length - 1)];
  };

  test.each([
    ["the example: IPN 300, 76 kN at ex = 10, ey = 20 cm", 1, [], 1, 1, 76, 10, 20, 0, 0],
    ["a compression, IPB 300 turned, in kg", 2, [], 2, 2, -5000, 3, -5, 0, 0],
    ["another profile (IPN 300 ◄ ▼: five and one smaller)", 1, [LEFT, DOWN, UP, DOWN], 1, 1, 30, -2, 7, 0, -5 + 1 - 1 + 1],
    ["σ adm typed", 2, [RIGHT, UP], 1, 1, 100, 4, 4, 12, 5 - 1],
  ] as const)("%s", (_name, series, moves, face, unit, P, ex, ey, S, steps) => {
    const prof = profileAt(series, steps);
    const r = eccentricLoad({ profile: prof, rotated: face === 2, P, ex, ey, sigmaAdm: S || (unit === 1 ? 14 : 1600) });
    const gfx = run(series, [...moves], face, unit, P, ex, ey, S);
    const pg = gfx.pages[1]; // the face drawing: the first graph screen
    // the profile chosen with the arrows
    const list = gfx.screens.filter((sc) => sc.some((l) => l[2] === "EXE=ACEPTAR"));
    expect(at(list.at(-1), 5, 1)).toBe(prof.h);
    // what it reduces to
    const c = scr(gfx, "EN EL CENTRO DE GRAV.");
    expect([at(c, 5, 2), at(c, 5, 3), at(c, 5, 4)].map(Number)).toEqual([P, (P * ey) / 100, (P * ex) / 100].map((v) => (v === 0 ? 0 : v)));
    // σ at the four corners, the critical one marked, and whether it passes
    const k = scr(gfx, "SIGMA EN LAS ESQUINAS")!;
    r.corners.forEach((corner, i) => expect(at(k, 13, i + 2) as number).toBeCloseTo(corner.sigma, 6));
    expect(at(k, 21, r.corners.indexOf(r.critical) + 2)).toBe("*");
    expect(at(k, 5, 6)).toBe(S || (unit === 1 ? 14 : 1600));
    expect(at(k, 1, 7)).toBe(r.ok ? "CUMPLE" : "NO CUMPLE");
    expect(at(k, 18, 6) as number).toBeCloseTo(r.ratio, 6);
    // the neutral axis and the largest load
    const n = scr(gfx, "EJE NEUTRO (CM)")!;
    const a = 1 / r.A, b = ex / r.Iy, cc = ey / r.Ix;
    if (Math.abs(b) > 0) expect(at(n, 11, 2) as number).toBeCloseTo(-a / b, 6);
    else expect(at(n, 1, 2)).toBe("NO CORTA EL EJE X");
    if (Math.abs(cc) > 0) expect(at(n, 11, 3) as number).toBeCloseTo(-a / cc, 6);
    else expect(at(n, 1, 3)).toBe("NO CORTA EL EJE Y");
    expect(at(n, 8, 5) as number).toBeCloseTo(r.Pmax, 6);
    // the drawing: the outline (12 edges, as the guide's), the load point and the critical corner, the neutral axis
    const s = guideSection(prof.name, face === 2);
    const outline = guideOutline(s);
    const edge = (p: number[], q: number[]) => [p, q].map((v) => v.map((x) => x.toFixed(6)).join(",")).sort().join("|");
    expect(new Set(pg.segments.slice(0, 12).map(([x1, y1, x2, y2]) => edge([x1, y1], [x2, y2])))).toEqual(
      new Set(outline.map((p, i) => edge(p, outline[(i + 1) % 12]))),
    );
    expect(pg.plots).toEqual([[ex, ey], [expect.closeTo(r.critical.x, 9), expect.closeTo(r.critical.y, 9)]]);
    expect(pg.texts).toEqual([[1, 1, expect.closeTo(r.critical.sigma, 6)]]);
    if (Math.abs(cc) > 0) {
      const [x1, y1, x2, y2] = pg.segments[12];
      for (const [px, py] of [[x1, y1], [x2, y2]]) expect(Math.abs(a + b * px + cc * py)).toBeLessThan(1e-9); // σ = 0 per kN along the drawn line
    } else if (Math.abs(b) > 0) expect(pg.verticals).toContain(-a / b);
  });

  test("the SVG's own numbers: σ max 13.96 kN/cm² ≤ 14, P max 76.25 kN (IPN 300, P = 76, ex = 10, ey = 20)", () => {
    const gfx = run(1, [], 1, 1, 76, 10, 20, 0);
    const k = scr(gfx, "SIGMA EN LAS ESQUINAS")!;
    expect(Math.max(...[2, 3, 4, 5].map((r) => Math.abs(at(k, 13, r) as number)))).toBeCloseTo(13.96, 2);
    expect(at(k, 1, 7)).toBe("CUMPLE");
    expect(at(scr(gfx, "EJE NEUTRO (CM)")!, 8, 5) as number).toBeCloseTo(76.25, 1);
    const c = scr(gfx, "EN EL CENTRO DE GRAV.");
    expect([at(c, 5, 2), at(c, 5, 3), at(c, 5, 4)]).toEqual([76, 15.2, 7.6]); // N, M_y = P·ey, M_z = P·ex of the SVG
  });

  test("a centred load (ex = ey = 0) is a uniform σ = P/A: no neutral axis, the first corner is the critical one", () => {
    const gfx = run(2, [], 1, 2, -2000, 0, 0, 0);
    const n = scr(gfx, "EJE NEUTRO (CM)")!;
    expect([at(n, 1, 2), at(n, 1, 3)]).toEqual(["NO CORTA EL EJE X", "NO CORTA EL EJE Y"]);
    const prof = profileAt(2, 0);
    expect(at(scr(gfx, "SIGMA EN LAS ESQUINAS")!, 13, 2) as number).toBeCloseTo(-2000 / prof.A, 6);
    expect(gfx.pages[1].segments).toHaveLength(12); // no line
  });

  test("after the results a menu offers another load or leaving", () => {
    const gfx = newGfx();
    runBasic(EXCENTR_LINES, [1, EXE, 1, 1, 76, 10, 20, 0, 1, /* OTRA CARGA */ 2, EXE, 2, 2, -1000, 1, 1, 0, 0], gfx);
    expect(gfx.screens.filter((sc) => sc[0]?.[2] === "SIGMA EN LAS ESQUINAS")).toHaveLength(2);
    expect(gfx.screens.filter((sc) => sc[0]?.[2] === "OTRO CALCULO?")).toHaveLength(2);
  });
});

describe("the diagrams of the normal stresses σ(Mx) and σ(My) (PERFIL and EXCENTR) and the lists left to REACC", () => {
  const near = (v: number[], w: number[]) => v.forEach((x, i) => expect(x).toBeCloseTo(w[i], 6));
  const inside = (pg: { window: number[] | null; segments: number[][] }) => {
    const [xmin, xmax, , ymin, ymax] = pg.window!;
    expect((xmax - xmin) / (ymax - ymin)).toBeCloseTo(4.032 / 2, 3); // equal scale on the 127 x 63 screen (2.016)
    pg.segments.forEach(([x1, y1, x2, y2]) =>
      [[x1, y1], [x2, y2]].forEach(([x, y]) => {
        expect(x).toBeGreaterThanOrEqual(xmin - 1e-9);
        expect(x).toBeLessThanOrEqual(xmax + 1e-9);
        expect(y).toBeGreaterThanOrEqual(ymin - 1e-9);
        expect(y).toBeLessThanOrEqual(ymax + 1e-9);
      }),
    );
  };
  // pages: 0 before any Cls, 1 the face drawing, 2 σ(Mx), 3 σ(My)
  const perfil = (N: number, Mx: number, My: number) => {
    const gfx = newGfx();
    const out = runBasic(PERFIL_LINES, [N, Mx, My, 0], gfx);
    const name = `IPB ${out[1]}`;
    const face = out[5] as 1 | 2;
    const sec = guideSection(name, face === 2);
    return { gfx, sec, k: plane(N, Mx, My, sec) };
  };

  test("PERFIL, the base of preset #2 (IPB 120 turned): σ(Mx) and σ(My) are bow ties, compression hatched", () => {
    const { gfx, sec, k } = perfil(-600, -300, 900);
    expect(gfx.pages).toHaveLength(4); // σ(N) is uniform and has no diagram
    const [, , pMx, pMy] = gfx.pages;
    [pMx, pMy].forEach((pg) => inside(pg));
    const L = 0.9 * sec.hy;
    const X = 1.1 * sec.hx + L;
    // σ(Mx) = b·y: ends ±b·hy, zero on the baseline's middle, the slope joins the two tips
    const K = L / Math.abs(k.b * sec.hy);
    const tip = k.b * sec.hy * K;
    expect(pMx.segments[12]).toEqual([X, sec.hy, X, -sec.hy]);
    near(pMx.segments[13], [X, sec.hy, X + tip, sec.hy]);
    near(pMx.segments[14], [X, -sec.hy, X - tip, -sec.hy]);
    near(pMx.segments[15], [X + tip, sec.hy, X - tip, -sec.hy]);
    expect((pMx.segments[15][0] + pMx.segments[15][2]) / 2).toBeCloseTo(X, 9); // the bow tie's waist is on the baseline
    expect(Math.abs(tip)).toBeCloseTo(L, 9);
    // the hatch is the compressed half only: σ < 0 at those y, drawn from the baseline to the sloped side
    const hatch = pMx.segments.slice(16);
    expect(hatch).toHaveLength(8);
    hatch.forEach(([x1, y1, x2, y2]) => {
      expect(y1).toBe(y2);
      expect(k.b * y1).toBeLessThan(0);
      expect(x1).toBe(X);
      expect(x2).toBeCloseTo(X + K * k.b * y1, 9);
    });
    expect(pMx.texts.map((t) => t[2])).toEqual(["S(MX)", expect.closeTo(k.b * sec.hy, 6), expect.closeTo(-k.b * sec.hy, 6)]);
    // σ(My) = a·x: the diagram below the section
    const L2 = 0.6 * sec.hy;
    const yb = -1.1 * sec.hy - L2;
    const K2 = L2 / Math.abs(k.a * sec.hx);
    const tip2 = k.a * sec.hx * K2;
    near(pMy.segments[12], [-sec.hx, yb, sec.hx, yb]);
    near(pMy.segments[13], [-sec.hx, yb, -sec.hx, yb + tip2]);
    near(pMy.segments[14], [sec.hx, yb, sec.hx, yb - tip2]);
    near(pMy.segments[15], [-sec.hx, yb + tip2, sec.hx, yb - tip2]);
    const hatch2 = pMy.segments.slice(16);
    expect(hatch2).toHaveLength(8);
    hatch2.forEach(([x1, y1, x2, y2]) => {
      expect(x1).toBe(x2);
      expect(k.a * x1).toBeLessThan(0);
      expect(y1).toBe(yb);
      expect(y2).toBeCloseTo(yb - K2 * k.a * x1, 9);
    });
    expect(pMy.texts.map((t) => t[2])).toEqual(["S(MY)", expect.closeTo(-k.a * sec.hx, 6), expect.closeTo(k.a * sec.hx, 6)]);
  });

  test("a diagram of an effect that is zero is not drawn (only the section and its label); σ(N) never has a screen", () => {
    const noMx = perfil(-600, 0, 900).gfx.pages;
    expect(noMx).toHaveLength(4);
    expect(noMx[2].segments).toHaveLength(12); // Mx = 0
    expect(noMx[3].segments.length).toBeGreaterThan(12);
    const noMy = perfil(-600, -300, 0).gfx.pages;
    expect(noMy[3].segments).toHaveLength(12); // My = 0
    const onlyN = perfil(-600, 0, 0).gfx.pages;
    expect(onlyN[2].segments).toHaveLength(12);
    expect(onlyN[3].segments).toHaveLength(12);
  });

  test("EXCENTR: the same diagrams from the eccentric load (σ(Mx) at the top, σ(My) at the right)", () => {
    const prof = SEARCH_TABLE.find((p) => p.series === "IPN" && p.h === 300)!;
    const r = eccentricLoad({ profile: prof, rotated: false, P: 76, ex: 10, ey: 20, sigmaAdm: 14 });
    const gfx = newGfx();
    runBasic(EXCENTR_LINES, [1, 31, 1, 1, 76, 10, 20, 0, 0], gfx);
    expect(gfx.pages).toHaveLength(4);
    const [, , pMx, pMy] = gfx.pages;
    [pMx, pMy].forEach((pg) => inside(pg));
    const top = r.corners[0]; // (+x, +y)
    expect(pMx.texts.map((t) => t[2])).toEqual(["S(MX)", expect.closeTo(top.sMx, 9), expect.closeTo(-top.sMx, 9)]);
    expect(pMy.texts.map((t) => t[2])).toEqual(["S(MY)", expect.closeTo(-top.sMy, 9), expect.closeTo(top.sMy, 9)]);
    // Mx = P·ey > 0 tensions the +y side: the compression (hatched) is below, where σ(Mx) < 0
    expect(pMx.segments.slice(16).every(([, y1]) => y1 < 0)).toBe(true);
  });

  test("only REACC uses the lists above 10 (it keeps its loads in 11-21): no other program touches them", () => {
    for (const [name, lines] of [["PERFIL", PERFIL_LINES], ["VIGACAB", VIGACAB_LINES], ["TRACCION", TRACCION_LINES], ["PANDEO", PANDEO_LINES], ["RETIC", RETIC_LINES], ["PERFILES", PERFILES_LINES], ["EXCENTR", EXCENTR_LINES]] as const) {
      const used = [...new Set(lines.flatMap((l) => [...l.matchAll(/List (\\d+)/g)].map((m) => +m[1])))];
      expect([name, Math.max(...used)]).toEqual([name, expect.any(Number)]);
      expect(Math.max(...used)).toBeLessThanOrEqual(10);
    }
    const reacc = [...new Set(REACC_LINES.flatMap((l) => [...l.matchAll(/List (\\d+)/g)].map((m) => +m[1])))];
    expect(Math.min(...reacc)).toBeGreaterThanOrEqual(11);
  });
});
