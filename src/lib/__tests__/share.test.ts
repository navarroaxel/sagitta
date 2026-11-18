import { encodeModel, decodeModel } from "@/lib/share";
import { PRESETS, presetSlug, findPresetBySlug } from "@/lib/presets";

describe("share links", () => {
  test("model round-trips through encode/decode", () => {
    for (const p of PRESETS) {
      const decoded = decodeModel(encodeModel(p.model));
      expect(decoded).toEqual(p.model);
    }
  });

  test("encoded string is URL-safe (no +, /, = or spaces)", () => {
    const s = encodeModel(PRESETS[0].model);
    expect(s).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  test("decodeModel returns null on garbage", () => {
    expect(decodeModel("not-valid-base64!!")).toBeNull();
    expect(decodeModel("")).toBeNull();
  });

  test("preset slugs are unique and resolvable", () => {
    const slugs = PRESETS.map((p) => presetSlug(p.name));
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const p of PRESETS) {
      expect(findPresetBySlug(presetSlug(p.name))?.name).toBe(p.name);
    }
  });

  test("malformed checks fields of a link are dropped, well-formed ones survive", () => {
    const base = PRESETS[0].model;
    const bad = {
      ...base,
      sigmaAdm: "lots",
      members: [
        {
          ...base.members[0],
          section: { kind: "size", series: "IPB" },
          selfWeight: "yes",
        },
        { ...base.members[0], id: "x", section: { kind: "wat" } },
        { ...base.members[0], id: "y", section: { kind: "profile" } },
      ],
    };
    const d = decodeModel(encodeModel(bad as never))!;
    expect(d.sigmaAdm).toBeUndefined();
    for (const m of d.members) {
      expect(m.section).toBeUndefined();
      expect(m.selfWeight).toBeUndefined();
    }
    const good = {
      ...base,
      sigmaAdm: 1600,
      members: [
        {
          ...base.members[0],
          selfWeight: true,
          section: { kind: "size", series: ["IPN", "IPB"] },
        },
      ],
    };
    const g = decodeModel(encodeModel(good as never))!;
    expect(g.sigmaAdm).toBe(1600);
    expect(g.members[0].selfWeight).toBe(true);
    expect(g.members[0].section).toEqual({
      kind: "size",
      series: ["IPN", "IPB"],
    });
  });
});
