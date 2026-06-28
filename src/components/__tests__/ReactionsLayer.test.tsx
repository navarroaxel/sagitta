import { render } from "@testing-library/react";
import { ReactionsLayer } from "../canvas/ReactionsLayer";
import { makeTransform } from "@/lib/geometry";
import { FrameModel } from "@/lib/types";
import { SolveOutput } from "@/lib/solve";

// Two nodes; A gets a downward (negative ry) reaction, B an upward (positive ry)
// one. ReactionsLayer only reads solved.result.reactions[i], so we stub the rest.
const model: FrameModel = {
  nodes: [
    { id: "A", x: 0, y: 0, support: "roller-v" },
    { id: "B", x: 10, y: 0, support: "pinned" },
  ],
  members: [{ id: "m1", n1: "A", n2: "B" }],
  loads: [],
  material: { E: 1, A: 1, I: 1 },
  unit: "T",
};

function solvedWith(
  reactions: { rx: number; ry: number; rm: number }[],
): SolveOutput {
  return { result: { reactions } } as unknown as SolveOutput;
}

// Parse "x1,y1 x2,y2 x3,y3" → split into the apex (unique y) and the base (the
// two points that share a y). The arrow points toward the apex.
function arrowTip(points: string): { apexY: number; baseY: number } {
  const pts = points
    .trim()
    .split(/\s+/)
    .map((p) => p.split(",").map(Number) as [number, number]);
  const ys = pts.map((p) => p[1]);
  // base = the two with equal y; apex = the remaining one
  const baseY = ys.find((y, i) => ys.indexOf(y) !== i)!;
  const apexY = ys.find((y) => y !== baseY)!;
  return { apexY, baseY };
}

describe("ReactionsLayer – vertical reaction arrow direction", () => {
  const tr = makeTransform(model.nodes, 800, 400);

  test("negative ry (downward reaction) draws an arrow pointing down", () => {
    const solved = solvedWith([
      { rx: 0, ry: -10, rm: 0 }, // A: down
      { rx: 0, ry: 50, rm: 0 }, // B: up
    ]);
    const { container } = render(
      <svg>
        <ReactionsLayer model={model} solved={solved} tr={tr} unit="T" />
      </svg>,
    );
    const polys = container.querySelectorAll("polygon");
    expect(polys).toHaveLength(2); // one vertical arrowhead per node

    // A (index 0): downward → apex is below the base (larger screen y).
    const a = arrowTip(polys[0].getAttribute("points")!);
    expect(a.apexY).toBeGreaterThan(a.baseY);

    // B (index 1): upward → apex is above the base (smaller screen y).
    const b = arrowTip(polys[1].getAttribute("points")!);
    expect(b.apexY).toBeLessThan(b.baseY);
  });

  test("arrowhead tip sits at the node and shaft trails opposite the force", () => {
    const solved = solvedWith([
      { rx: 0, ry: -10, rm: 0 },
      { rx: 0, ry: 0, rm: 0 },
    ]);
    const { container } = render(
      <svg>
        <ReactionsLayer model={model} solved={solved} tr={tr} unit="T" />
      </svg>,
    );
    const syA = tr.toSY(0); // node A screen-y
    const poly = container.querySelector("polygon")!;
    const line = container.querySelector("line")!;
    const { apexY } = arrowTip(poly.getAttribute("points")!);
    // apex (tip) is at the node; shaft starts above it (downward force trails up)
    expect(apexY).toBeCloseTo(syA, 3);
    expect(Number(line.getAttribute("y1"))).toBeLessThan(syA);
    expect(Number(line.getAttribute("y2"))).toBeCloseTo(syA, 3);
  });
});
