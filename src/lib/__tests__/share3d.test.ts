import { PRESETS_3D } from "../presets3d";
import { decodeModel3D, encodeModel3D, findPreset3D, isModel3D, modelFromQuery3D, shareQuery3D } from "../share3d";
import { solveModel3D } from "../solve3d";

describe("3D share links", () => {
  test("every preset round-trips through encode / decode, and the code is URL-safe", () => {
    PRESETS_3D.forEach((p) => {
      const s = encodeModel3D(p.model);
      expect(s).toMatch(/^[A-Za-z0-9_-]+$/);
      expect(decodeModel3D(s)).toEqual(p.model);
    });
  });

  test("a pristine preset is shared as ?preset=<key>, an edited one as ?model=…, and both come back", () => {
    PRESETS_3D.forEach((p, i) => {
      expect(shareQuery3D(p.model)).toBe(`preset=${p.key}`);
      expect(modelFromQuery3D(`?${shareQuery3D(p.model)}`)).toBe(p.model); // the very object: the select shows it
      expect(findPreset3D(String(i + 1))).toBe(p); // by its permanent number
      expect(findPreset3D(`#${i + 1}`)).toBe(p);
    });
    const edited = { ...PRESETS_3D[0].model, sigmaAdm: 12 };
    const q = shareQuery3D(edited);
    expect(q.startsWith("model=")).toBe(true);
    expect(modelFromQuery3D(`?${q}`)).toEqual(edited);
  });

  test("garbage and unknown presets give null", () => {
    expect(decodeModel3D("")).toBeNull();
    expect(decodeModel3D("not-valid-base64!!")).toBeNull();
    expect(modelFromQuery3D("?preset=nope")).toBeNull();
    expect(modelFromQuery3D("?preset=99")).toBeNull();
    expect(modelFromQuery3D("?preset=0")).toBeNull();
    expect(modelFromQuery3D("")).toBeNull();
  });

  test("a model with dangling references, non-finite numbers or a degenerate member is rejected, not handed to the solver", () => {
    const base = PRESETS_3D[0].model;
    const bad = (f: (m: typeof base) => unknown) => expect(isModel3D(f(structuredClone(base)))).toBe(false);
    bad((m) => ({ ...m, members: [{ ...m.members[0], n2: "ZZ" }] })); // missing node
    bad((m) => ({ ...m, members: [{ ...m.members[0], n2: m.members[0].n1 }] })); // from a node to itself
    bad((m) => ({ ...m, nodes: [m.nodes[0], m.nodes[0]] })); // duplicate id
    bad((m) => ({ ...m, nodes: [{ ...m.nodes[0], x: Infinity }, ...m.nodes.slice(1)] }));
    bad((m) => ({ ...m, nodes: [{ ...m.nodes[0], support: "roller" }, ...m.nodes.slice(1)] }));
    bad((m) => ({ ...m, loads: [{ id: "L", type: "nodal", node: "ZZ", fx: 0, fy: 0, fz: 0, mx: 0, my: 0, mz: 0 }] }));
    bad((m) => ({ ...m, loads: [{ id: "L", type: "mudl", member: "ZZ", gx: 0, gy: 0, gz: 1 }] }));
    bad((m) => ({ ...m, loads: [{ id: "L", type: "weird" }] }));
    bad((m) => ({ ...m, material: { ...m.material, E: NaN } }));
    bad((m) => ({ ...m, sigmaAdm: "14" }));
    bad(() => null);
    bad(() => []);
    // and the real ones are fine and solve
    PRESETS_3D.forEach((p) => {
      expect(isModel3D(p.model)).toBe(true);
      expect(solveModel3D(p.model)).not.toBeNull();
    });
  });
});
