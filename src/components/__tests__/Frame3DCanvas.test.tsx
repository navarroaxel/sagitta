import { render, screen } from "@testing-library/react";
import Frame3DCanvas, { View3DOptions } from "../Frame3DCanvas";
import { solveModel3D } from "@/lib/solve3d";
import { PRESETS_3D } from "@/lib/presets3d";
import type { FrameModel3D } from "@/lib/types3d";

const tFrame = PRESETS_3D[0].model;
const opts: View3DOptions = {
  diagram: null,
  showLoads: true,
  showReactions: true,
  showValues: true,
  showMemberLabels: true,
  scale: 1,
};

describe("Frame3DCanvas", () => {
  test("draws members, loads, reactions and the fixed plate", () => {
    render(<Frame3DCanvas model={tFrame} solved={solveModel3D(tFrame)} viewOpts={opts} />);
    tFrame.members.forEach((m) => expect(screen.getByTestId(`member3d-${m.id}`)).toBeTruthy());
    expect(screen.getByTestId("loads3d-layer")).toBeTruthy();
    expect(screen.getByTestId("reactions3d-layer")).toBeTruthy();
    expect(screen.getByTestId("support-fixed-A")).toBeTruthy();
  });

  test("reaction components of the worked example are all drawn (Fy, Fz, Mx, My; no Fx/Mz)", () => {
    render(<Frame3DCanvas model={tFrame} solved={solveModel3D(tFrame)} viewOpts={opts} />);
    ["fy", "fz", "mx", "my"].forEach((c) =>
      expect(screen.getByTestId(`reaction-A-${c}`)).toBeTruthy(),
    );
    ["fx", "mz"].forEach((c) => expect(screen.queryByTestId(`reaction-A-${c}`)).toBeNull());
    expect(screen.getByTestId("reaction-A-fy").textContent).toContain("18.00");
    expect(screen.getByTestId("reaction-A-my").textContent).toContain("29.00");
  });

  test("F_y reaction tip sits at the node (collinear with the M_y vector through A)", () => {
    const { container } = render(
      <Frame3DCanvas model={tFrame} solved={solveModel3D(tFrame)} viewOpts={opts} />,
    );
    const head = screen
      .getByTestId("reaction-A-fy")
      .querySelector("polygon")!
      .getAttribute("points")!
      .split(" ")[0];
    const plate = container.querySelector("[data-testid=support-fixed-A] polygon")!;
    // the first plate vertex is node + (-54, 10); the arrow tip is the node itself
    const [px, py] = plate.getAttribute("points")!.split(" ")[0].split(",").map(Number);
    const [hx, hy] = head.split(",").map(Number);
    expect(hx).toBeCloseTo(px + 54);
    expect(hy).toBeCloseTo(py - 10);
  });

  test("diagram layer renders for the selected diagram only", () => {
    const { rerender } = render(
      <Frame3DCanvas model={tFrame} solved={solveModel3D(tFrame)} viewOpts={{ ...opts, diagram: "My" }} />,
    );
    expect(screen.getByTestId("diagram3d-My")).toBeTruthy();
    expect(screen.queryByTestId("diagram3d-Mz")).toBeNull();
    rerender(
      <Frame3DCanvas model={tFrame} solved={solveModel3D(tFrame)} viewOpts={{ ...opts, diagram: null }} />,
    );
    expect(screen.queryByTestId("diagram3d-My")).toBeNull();
  });

  test("hides loads/reactions/diagrams when the model is unstable", () => {
    const unstable: FrameModel3D = {
      ...tFrame,
      nodes: tFrame.nodes.map((n) => ({ ...n, support: "free" as const })),
    };
    render(
      <Frame3DCanvas model={unstable} solved={solveModel3D(unstable)} viewOpts={{ ...opts, diagram: "My" }} />,
    );
    expect(screen.queryByTestId("loads3d-layer")).toBeNull();
    expect(screen.queryByTestId("reactions3d-layer")).toBeNull();
    expect(screen.queryByTestId("diagram3d-My")).toBeNull();
  });
});
