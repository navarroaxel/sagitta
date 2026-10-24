import { peakLocation } from "../peakLocation";
import { PRESETS_3D } from "../presets3d";
import { solveModel3D } from "../solve3d";
import { computeStress } from "../stress3d";

const where = (key: string) => {
  const model = PRESETS_3D.find((p) => p.key === key)!.model;
  const solved = solveModel3D(model)!;
  return peakLocation(model, solved, computeStress(model, solved))!;
};

describe("peakLocation", () => {
  test("#1 (6 m T-frame): the column's σ max is at the fixed support A", () => {
    const p = where("t_frame");
    expect(p.member).toBe("M1");
    expect(p.where).toEqual({ kind: "node", node: "A", support: "fixed" });
  });

  test("#5 (400 kg/m): σ max is INSIDE the column, 1.31 m above the support — not at any node", () => {
    const p = where("frame_overhang");
    expect(p.member).toBe("M1");
    expect(p.where.kind).toBe("inside");
    if (p.where.kind === "inside") {
      expect(p.where.node).toBe("A");
      expect(p.where.dist).toBeCloseTo(1.31, 1);
    }
  });

  test("#5 is the only preset whose σ max is inside a bar (the others peak at a node, or along a constant stretch)", () => {
    const inside = PRESETS_3D.filter((p) => where(p.key).where.kind === "inside").map((p) => p.key);
    expect(inside).toEqual(["frame_overhang"]);
  });

  test("#3: the critical bar is the beam M3 and its σ max is at the joint B — a node, but not the support", () => {
    const p = where("t_frame_qy");
    expect(p.member).toBe("M3");
    expect(p.where).toEqual({ kind: "node", node: "B", support: "free" });
  });

  test("#7 (eccentric tension): σ is the same all along the bar", () => {
    expect(where("eccentric_tension").where.kind).toBe("constant");
  });
});
