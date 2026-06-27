import { makeTransform, worldBounds } from "../geometry";
import { FrameNode } from "../types";

let _id = 0;
function node(x: number, y: number): FrameNode {
  return { id: `n${_id++}`, x, y, support: "free" };
}

const SVG_W = 900;
const SVG_H = 600;

const finiteTransform = (tr: ReturnType<typeof makeTransform>) =>
  Number.isFinite(tr.k) &&
  Number.isFinite(tr.ox) &&
  Number.isFinite(tr.oy) &&
  tr.k > 0;

describe("worldBounds", () => {
  test("empty node list returns a safe default box", () => {
    expect(worldBounds([])).toEqual({
      minX: 0,
      maxX: 10,
      minY: 0,
      maxY: 5,
      diagLen: 11,
    });
  });

  test("single node has zero extent but a non-zero diagLen (|| 1 fallback)", () => {
    const b = worldBounds([node(3, 7)]);
    expect(b).toMatchObject({ minX: 3, maxX: 3, minY: 7, maxY: 7 });
    expect(b.diagLen).toBeCloseTo(Math.SQRT2, 9); // hypot(1, 1)
  });
});

describe("makeTransform – degenerate geometries stay finite", () => {
  const cases: Array<[string, FrameNode[]]> = [
    ["single node", [node(0, 0)]],
    ["vertical-only model", [node(0, 0), node(0, 10)]],
    ["horizontal-only model", [node(0, 0), node(10, 0)]],
    ["tiny coordinates", [node(0, 0), node(1e-9, 1e-9)]],
    ["huge coordinates", [node(0, 0), node(1e9, 1e9)]],
  ];

  test.each(cases)("%s → finite k, ox, oy with k > 0", (_label, nodes) => {
    const tr = makeTransform(nodes, SVG_W, SVG_H);
    expect(finiteTransform(tr)).toBe(true);
  });

  test("maxScale padding keeps the transform finite", () => {
    const tr = makeTransform([node(0, 0), node(10, 0)], SVG_W, SVG_H, 3);
    expect(finiteTransform(tr)).toBe(true);
  });
});

describe("makeTransform – round-trip mapping", () => {
  test("inverting toSX / toSY recovers world coordinates", () => {
    const nodes = [node(0, 0), node(8, 6)];
    const tr = makeTransform(nodes, SVG_W, SVG_H);
    const invX = (sx: number) => (sx - tr.ox) / tr.k;
    const invY = (sy: number) => (tr.oy - sy) / tr.k;
    for (const [wx, wy] of [
      [0, 0],
      [8, 6],
      [4, 3],
      [-2.5, 5.25],
    ]) {
      expect(invX(tr.toSX(wx))).toBeCloseTo(wx, 9);
      expect(invY(tr.toSY(wy))).toBeCloseTo(wy, 9);
    }
  });

  test("y is flipped (world y-up → screen y-down)", () => {
    const tr = makeTransform([node(0, 0), node(10, 10)], SVG_W, SVG_H);
    // a higher world y maps to a smaller screen y
    expect(tr.toSY(10)).toBeLessThan(tr.toSY(0));
  });
});
