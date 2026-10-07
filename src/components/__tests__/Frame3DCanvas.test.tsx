import { render, screen } from "@testing-library/react";
import Frame3DCanvas, { View3DOptions } from "../Frame3DCanvas";
import { solveModel3D } from "@/lib/solve3d";
import { computeStress } from "@/lib/stress3d";
import { PRESETS_3D } from "@/lib/presets3d";
import type { FrameModel3D } from "@/lib/types3d";

const tFrame = PRESETS_3D[0].model;
const opts: View3DOptions = {
  diagram: null,
  showLoads: true,
  showReactions: true,
  showValues: true,
  showMemberLabels: true,
  colorByStress: false,
  showLocalAxes: false,
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
      <Frame3DCanvas model={tFrame} solved={solveModel3D(tFrame)} viewOpts={{ ...opts, diagram: "Mx" }} />,
    );
    expect(screen.getByTestId("diagram3d-Mx")).toBeTruthy();
    expect(screen.queryByTestId("diagram3d-My")).toBeNull();
    rerender(
      <Frame3DCanvas model={tFrame} solved={solveModel3D(tFrame)} viewOpts={{ ...opts, diagram: null }} />,
    );
    expect(screen.queryByTestId("diagram3d-Mx")).toBeNull();
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

describe("Frame3DCanvas stress view", () => {
  const solved = solveModel3D(tFrame)!;
  const stress = computeStress(tFrame, solved);

  test("colorByStress shades every member and shows its utilisation", () => {
    render(
      <Frame3DCanvas model={tFrame} solved={solved} stress={stress} viewOpts={{ ...opts, colorByStress: true }} />,
    );
    tFrame.members.forEach((m, e) => {
      const line = screen.getByTestId(`member3d-${m.id}`);
      expect(line.getAttribute("data-ratio")).toBe(stress[e]!.ratio.toFixed(3));
      expect(screen.getByTestId(`utilization-${m.id}`).textContent).toContain(
        `${(stress[e]!.ratio * 100).toFixed(0)}%`,
      );
    });
  });

  test("no shading when the option is off", () => {
    render(<Frame3DCanvas model={tFrame} solved={solved} stress={stress} viewOpts={opts} />);
    expect(screen.getByTestId("member3d-M1").getAttribute("data-ratio")).toBeNull();
    expect(screen.queryByTestId("utilization-M1")).toBeNull();
  });

  test("a failing member is flagged with ✗", () => {
    const weak: FrameModel3D = {
      ...tFrame,
      members: tFrame.members.map((m) => (m.id === "M1" ? { ...m, profile: "IPN 80" } : m)),
    };
    const s = solveModel3D(weak)!;
    render(
      <Frame3DCanvas
        model={weak}
        solved={s}
        stress={computeStress(weak, s)}
        viewOpts={{ ...opts, colorByStress: true }}
      />,
    );
    expect(screen.getByTestId("utilization-M1").textContent).toContain("✗");
    expect(screen.getByTestId("utilization-M2").textContent).not.toContain("✗");
  });

  test("σ diagram draws only members that have a profile", () => {
    const mixed: FrameModel3D = {
      ...tFrame,
      members: tFrame.members.map((m) => (m.id === "M2" ? { ...m, profile: undefined } : m)),
    };
    const s = solveModel3D(mixed)!;
    const { container } = render(
      <Frame3DCanvas model={mixed} solved={s} stress={computeStress(mixed, s)} viewOpts={{ ...opts, diagram: "S" }} />,
    );
    const layer = container.querySelector("[data-testid=diagram3d-S]")!;
    expect(layer).toBeTruthy();
    expect(layer.querySelectorAll("polygon").length).toBe(2); // M1, M3
  });
});

describe("partial UDL on the canvas", () => {
  test("the arrows of q_z stay inside 1..5 m of the hat (first arrow is right of B)", () => {
    render(<Frame3DCanvas model={tFrame} solved={solveModel3D(tFrame)} viewOpts={opts} />);
    const hat = screen.getByTestId("member3d-M3");
    const bx = parseFloat(hat.getAttribute("x1")!);
    const dx = parseFloat(hat.getAttribute("x2")!);
    const tipX = parseFloat(
      screen.getByTestId("load-L2").querySelector("polygon")!.getAttribute("points")!.split(" ")[0],
    );
    expect(tipX).toBeGreaterThan(bx + 5);
    expect(tipX).toBeLessThan(dx);
    expect(tipX).toBeCloseTo(bx + (dx - bx) / 5, 0); // 1 m of 5 m
  });
});

describe("local axes", () => {
  const axis = (m: string, a: string) => {
    const l = screen.getByTestId(`local-axes-${m}`).querySelector(`line[data-axis=${a}]`)!;
    const n = (k: string) => parseFloat(l.getAttribute(k)!);
    return [n("x2") - n("x1"), n("y2") - n("y1")]; // screen vector (y down)
  };
  const on = { ...opts, showLocalAxes: true };

  test("hidden unless enabled", () => {
    render(<Frame3DCanvas model={tFrame} solved={solveModel3D(tFrame)} viewOpts={opts} />);
    expect(screen.queryByTestId("local-axes-layer")).toBeNull();
  });

  test("a triad (x', y', z') is drawn on every member", () => {
    render(<Frame3DCanvas model={tFrame} solved={solveModel3D(tFrame)} viewOpts={on} />);
    tFrame.members.forEach((m) =>
      expect(screen.getByTestId(`local-axes-${m.id}`).querySelectorAll("line")).toHaveLength(3),
    );
  });

  // Course convention (left-handed): z along the member (down / to the left), x out of the page,
  // y to the right (columns) or down (beams). Screen vectors have y pointing down.
  test("column: z' points down, y' to the right, x' out of the page (down-left on the oblique view)", () => {
    render(<Frame3DCanvas model={tFrame} solved={solveModel3D(tFrame)} viewOpts={on} />);
    const [zx, zy] = axis("M1", "z");
    expect(Math.abs(zx)).toBeLessThan(1e-6);
    expect(zy).toBeGreaterThan(0);
    const [yx, yy] = axis("M1", "y");
    expect(yx).toBeGreaterThan(0);
    expect(Math.abs(yy)).toBeLessThan(1e-6);
    const [xx, xy] = axis("M1", "x");
    expect(xx).toBeLessThan(0);
    expect(xy).toBeGreaterThan(0);
  });

  test("hat: z' points to the left, y' down, x' out of the page", () => {
    render(<Frame3DCanvas model={tFrame} solved={solveModel3D(tFrame)} viewOpts={on} />);
    const [zx, zy] = axis("M3", "z");
    expect(zx).toBeLessThan(0);
    expect(Math.abs(zy)).toBeLessThan(1e-6);
    const [yx, yy] = axis("M3", "y");
    expect(Math.abs(yx)).toBeLessThan(1e-6);
    expect(yy).toBeGreaterThan(0);
    const [xx, xy] = axis("M3", "x");
    expect(xx).toBeLessThan(0);
    expect(xy).toBeGreaterThan(0);
  });

  test("the triad does not depend on the direction in which the member was defined", () => {
    const flipped: FrameModel3D = {
      ...tFrame,
      members: tFrame.members.map((m) => ({ ...m, n1: m.n2, n2: m.n1 })),
    };
    render(<Frame3DCanvas model={flipped} solved={solveModel3D(flipped)} viewOpts={on} />);
    ["x", "y", "z"].forEach((k) => {
      const [fx, fy] = axis("M3", k);
      expect(Math.hypot(fx, fy)).toBeCloseTo(30, 3); // length of the drawn arrows
    });
    expect(axis("M3", "z")[0]).toBeLessThan(0);
    expect(axis("M3", "y")[1]).toBeGreaterThan(0);
  });

  test("not drawn when the model is unstable", () => {
    const unstable: FrameModel3D = {
      ...tFrame,
      nodes: tFrame.nodes.map((n) => ({ ...n, support: "free" as const })),
    };
    render(<Frame3DCanvas model={unstable} solved={solveModel3D(unstable)} viewOpts={on} />);
    expect(screen.queryByTestId("local-axes-layer")).toBeNull();
  });
});
