import { render, screen } from "@testing-library/react";
import FrameCanvas, { ViewOptions } from "../FrameCanvas";
import { FrameModel } from "@/lib/types";
import { solveModel } from "@/lib/solve";

const material = { E: 2.1e8, A: 0.01, I: 8.3e-5 };

// Minimal stable model: simply supported beam, 1 member, 2 nodes, UDL.
const stableModel: FrameModel = {
  nodes: [
    { id: "A", x: 0, y: 0, support: "pinned" },
    { id: "B", x: 10, y: 0, support: "roller-v" },
  ],
  members: [{ id: "M1", n1: "A", n2: "B" }],
  loads: [{ id: "L1", type: "mudl", member: "M1", gx: 0, gy: -10 }],
  material,
  unit: "kN",
};

// Unconstrained (both supports free) → rigid-body modes → singular/unstable.
const unstableModel: FrameModel = {
  nodes: [
    { id: "A", x: 0, y: 0, support: "free" },
    { id: "B", x: 10, y: 0, support: "free" },
  ],
  members: [{ id: "M1", n1: "A", n2: "B" }],
  loads: [],
  material,
  unit: "kN",
};

// Two nodal loads, for highlight behaviour.
const loadsModel: FrameModel = {
  ...stableModel,
  loads: [
    { id: "L1", type: "nodal", node: "A", fx: 0, fy: -10, m: 0 },
    { id: "L2", type: "nodal", node: "B", fx: 0, fy: -10, m: 0 },
  ],
};

const allOn: ViewOptions = {
  showN: true,
  showQ: true,
  showM: true,
  showReactions: true,
  showLoads: true,
  showValues: true,
  showGrid: true,
  showMemberLabels: true,
  scaleN: 1,
  scaleQ: 1,
  scaleM: 1,
  scaleLoads: 1,
};

const noop = () => {};

describe("FrameCanvas – render smoke", () => {
  test("renders one member and two nodes for a minimal stable model", () => {
    const solved = solveModel(stableModel);
    render(
      <FrameCanvas
        model={stableModel}
        solved={solved}
        viewOpts={allOn}
        onNodeMove={noop}
      />,
    );
    expect(screen.getAllByTestId("member")).toHaveLength(1);
    expect(screen.getAllByTestId("node")).toHaveLength(2);
  });

  test("grid / loads / reactions layers present when their toggles are on", () => {
    const solved = solveModel(stableModel);
    render(
      <FrameCanvas
        model={stableModel}
        solved={solved}
        viewOpts={allOn}
        onNodeMove={noop}
      />,
    );
    expect(screen.getByTestId("grid-layer")).toBeInTheDocument();
    expect(screen.getByTestId("loads-layer")).toBeInTheDocument();
    expect(screen.getByTestId("reactions-layer")).toBeInTheDocument();
  });

  test("toggling those flags off removes the corresponding layers", () => {
    const solved = solveModel(stableModel);
    render(
      <FrameCanvas
        model={stableModel}
        solved={solved}
        viewOpts={{
          ...allOn,
          showGrid: false,
          showLoads: false,
          showReactions: false,
        }}
        onNodeMove={noop}
      />,
    );
    expect(screen.queryByTestId("grid-layer")).toBeNull();
    expect(screen.queryByTestId("loads-layer")).toBeNull();
    expect(screen.queryByTestId("reactions-layer")).toBeNull();
    // members/nodes are unaffected by those toggles
    expect(screen.getAllByTestId("member")).toHaveLength(1);
  });
});

describe("FrameCanvas – unstable model", () => {
  test("shows the warning and suppresses diagrams + reactions, keeps members", () => {
    const solved = solveModel(unstableModel);
    expect(solved.result.stable).toBe(false); // guard the fixture

    render(
      <FrameCanvas
        model={unstableModel}
        solved={solved}
        viewOpts={allOn}
        onNodeMove={noop}
      />,
    );

    expect(screen.getByText(/unstable/i)).toBeInTheDocument();
    expect(screen.queryByTestId("diagram-N")).toBeNull();
    expect(screen.queryByTestId("diagram-Q")).toBeNull();
    expect(screen.queryByTestId("diagram-M")).toBeNull();
    expect(screen.queryByTestId("reactions-layer")).toBeNull();
    // structure geometry is still drawn
    expect(screen.getAllByTestId("member")).toHaveLength(1);
  });
});

describe("FrameCanvas – load highlight", () => {
  test("matching load is highlighted and others dim to opacity 0.25", () => {
    render(
      <FrameCanvas
        model={loadsModel}
        solved={null}
        viewOpts={allOn}
        onNodeMove={noop}
        highlightedLoadId="L1"
      />,
    );

    const matched = screen.getByTestId("load-L1");
    const other = screen.getByTestId("load-L2");

    // non-matching load dims
    expect(other).toHaveAttribute("opacity", "0.25");
    // matching load stays fully opaque
    expect(matched).toHaveAttribute("opacity", "1");
    // the highlighted style draws a thick halo line only on the matched load
    expect(matched.querySelector('line[stroke-width="9"]')).not.toBeNull();
    expect(other.querySelector('line[stroke-width="9"]')).toBeNull();
  });

  test("with no highlight, all loads render at full opacity", () => {
    render(
      <FrameCanvas
        model={loadsModel}
        solved={null}
        viewOpts={allOn}
        onNodeMove={noop}
        highlightedLoadId={null}
      />,
    );
    expect(screen.getByTestId("load-L1")).toHaveAttribute("opacity", "1");
    expect(screen.getByTestId("load-L2")).toHaveAttribute("opacity", "1");
  });
});
