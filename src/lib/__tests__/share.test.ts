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
});
