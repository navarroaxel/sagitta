import { render } from "@testing-library/react";
import { DimensionsLayer } from "../canvas/DimensionsLayer";
import { makeTransform } from "@/lib/geometry";
import { FrameModel } from "@/lib/types";

// L-shaped frame: a 4 m horizontal span and a 3 m vertical rise.
const model: FrameModel = {
  nodes: [
    { id: "A", x: 0, y: 0, support: "pinned" },
    { id: "B", x: 4, y: 0, support: "pinned" },
    { id: "C", x: 4, y: 3, support: "free" },
  ],
  members: [
    { id: "m1", n1: "A", n2: "B" },
    { id: "m2", n1: "B", n2: "C" },
  ],
  loads: [],
  material: { E: 1, A: 1, I: 1 },
  unit: "kN",
};

describe("DimensionsLayer", () => {
  const tr = makeTransform(model.nodes, 900, 600);

  test("labels the horizontal span and vertical rise in metres", () => {
    const { container } = render(
      <svg>
        <DimensionsLayer tr={tr} model={model} />
      </svg>,
    );
    const labels = Array.from(container.querySelectorAll("text")).map(
      (t) => t.textContent,
    );
    expect(labels).toContain("4 m");
    expect(labels).toContain("3 m");
  });

  test("omits a chain when a coordinate axis has a single value", () => {
    // A pure vertical column: all nodes share x = 0 → no horizontal chain,
    // only the vertical chain (two distinct y values).
    const column: FrameModel = {
      ...model,
      nodes: [
        { id: "A", x: 0, y: 0, support: "fixed" },
        { id: "B", x: 0, y: 2, support: "free" },
      ],
      members: [{ id: "m1", n1: "A", n2: "B" }],
    };
    const trC = makeTransform(column.nodes, 900, 600);
    const { container } = render(
      <svg>
        <DimensionsLayer tr={trC} model={column} />
      </svg>,
    );
    const labels = Array.from(container.querySelectorAll("text")).map(
      (t) => t.textContent,
    );
    // Only the vertical height label is present.
    expect(labels).toEqual(["2 m"]);
  });
});
