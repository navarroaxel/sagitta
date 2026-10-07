import {
  IPBL_PROFILES,
  IPBV_PROFILES,
  IPE_PROFILES,
  UPN_PROFILES,
} from "../profilesExtra";
import { getProfile } from "../profiles";

// Sx values that are printed as is in the course PDF but disagree with Ix/(h/2) (checked against
// the scan: not transcription slips). Kept as printed; Ix/(h/2) would give 11190 and 3800.
const SOURCE_SX_TYPOS = new Set(["IPBl 1000", "IPBv 320"]);

const rel = (a: number, b: number) => Math.abs(a - b) / Math.abs(b);

// Transcribed from the scanned CIRSOC tables: the same geometric relations used for IPN/IPB
// catch a mistyped digit. h is the real depth here (the designation is only in the name).
describe.each([
  ["IPBl", IPBL_PROFILES],
  ["IPBv", IPBV_PROFILES],
  ["IPE", IPE_PROFILES],
  ["UPN", UPN_PROFILES],
])("%s table is internally consistent", (_s, list) => {
  list.forEach((p) => {
    test(p.name, () => {
      if (!SOURCE_SX_TYPOS.has(p.name))
        expect(rel(p.Sx, p.Ix / (p.h / 20))).toBeLessThan(0.02);
      expect(rel(p.rx, Math.sqrt(p.Ix / p.A))).toBeLessThan(0.02);
      expect(rel(p.ry, Math.sqrt(p.Iy / p.A))).toBeLessThan(0.02);
      // a channel's centroid is off-centre, so Sy is taken at the far fibre: Sy < Iy / (bf/2)
      if (p.series !== "UPN")
        expect(rel(p.Sy, p.Iy / (p.bf / 20))).toBeLessThan(0.02);
      else expect(p.Sy).toBeLessThan(p.Iy / (p.bf / 20));
      expect(p.Ix).toBeGreaterThan(p.Iy);
      // parallel-flange series: hw = h − 2·tf − 2·r (UPN has tapered flanges)
      if (p.series === "UPN") expect(p.hw).toBeLessThan(p.h - 2 * p.tf);
      else
        expect(Math.abs(p.hw - (p.h - 2 * p.tf - 2 * p.r))).toBeLessThanOrEqual(
          1,
        );
    });
  });
});

test("sizes, designation vs depth, and isolation from the 3D lookup", () => {
  expect(IPBL_PROFILES).toHaveLength(24);
  expect(IPBV_PROFILES).toHaveLength(25);
  expect(IPE_PROFILES).toHaveLength(18);
  expect(UPN_PROFILES).toHaveLength(16);
  expect(IPBL_PROFILES[0]).toMatchObject({ name: "IPBl 100", h: 96, A: 21.2 });
  expect(IPE_PROFILES.find((p) => p.name === "IPE 270")).toMatchObject({
    Ix: 5790,
    J: 11.9,
  });
  expect(getProfile("UPN 200")).toBeUndefined();
  expect(getProfile("IPE 200")).toBeUndefined();
});
