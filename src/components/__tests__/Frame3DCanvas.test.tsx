import { render, screen, fireEvent } from "@testing-library/react";
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
    render(
      <Frame3DCanvas
        model={tFrame}
        solved={solveModel3D(tFrame)}
        viewOpts={opts}
      />,
    );
    tFrame.members.forEach((m) =>
      expect(screen.getByTestId(`member3d-${m.id}`)).toBeTruthy(),
    );
    expect(screen.getByTestId("loads3d-layer")).toBeTruthy();
    expect(screen.getByTestId("reactions3d-layer")).toBeTruthy();
    expect(screen.getByTestId("support-fixed-A")).toBeTruthy();
  });

  test("reaction components of the worked example are all drawn (Fy, Fz, Mx, My; no Fx/Mz)", () => {
    render(
      <Frame3DCanvas
        model={tFrame}
        solved={solveModel3D(tFrame)}
        viewOpts={opts}
      />,
    );
    ["fy", "fz", "mx", "my"].forEach((c) =>
      expect(screen.getByTestId(`reaction-A-${c}`)).toBeTruthy(),
    );
    ["fx", "mz"].forEach((c) =>
      expect(screen.queryByTestId(`reaction-A-${c}`)).toBeNull(),
    );
    expect(screen.getByTestId("reaction-A-fy").textContent).toContain("18.00");
    expect(screen.getByTestId("reaction-A-my").textContent).toContain("29.00");
  });

  test("F_y reaction tip sits at the node (collinear with the M_y vector through A)", () => {
    const { container } = render(
      <Frame3DCanvas
        model={tFrame}
        solved={solveModel3D(tFrame)}
        viewOpts={opts}
      />,
    );
    const head = screen
      .getByTestId("reaction-A-fy")
      .querySelector("polygon")!
      .getAttribute("points")!
      .split(" ")[0];
    const plate = container.querySelector(
      "[data-testid=support-fixed-A] polygon",
    )!;
    // the first plate vertex is node + (-54, 10); the arrow tip is the node itself
    const [px, py] = plate
      .getAttribute("points")!
      .split(" ")[0]
      .split(",")
      .map(Number);
    const [hx, hy] = head.split(",").map(Number);
    expect(hx).toBeCloseTo(px + 54);
    expect(hy).toBeCloseTo(py - 10);
  });

  test("diagram layer renders for the selected diagram only", () => {
    const { rerender } = render(
      <Frame3DCanvas
        model={tFrame}
        solved={solveModel3D(tFrame)}
        viewOpts={{ ...opts, diagram: "Mx" }}
      />,
    );
    expect(screen.getByTestId("diagram3d-Mx")).toBeTruthy();
    expect(screen.queryByTestId("diagram3d-My")).toBeNull();
    rerender(
      <Frame3DCanvas
        model={tFrame}
        solved={solveModel3D(tFrame)}
        viewOpts={{ ...opts, diagram: null }}
      />,
    );
    expect(screen.queryByTestId("diagram3d-Mx")).toBeNull();
  });

  test("hides loads/reactions/diagrams when the model is unstable", () => {
    const unstable: FrameModel3D = {
      ...tFrame,
      nodes: tFrame.nodes.map((n) => ({ ...n, support: "free" as const })),
    };
    render(
      <Frame3DCanvas
        model={unstable}
        solved={solveModel3D(unstable)}
        viewOpts={{ ...opts, diagram: "My" }}
      />,
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
      <Frame3DCanvas
        model={tFrame}
        solved={solved}
        stress={stress}
        viewOpts={{ ...opts, colorByStress: true }}
      />,
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
    render(
      <Frame3DCanvas
        model={tFrame}
        solved={solved}
        stress={stress}
        viewOpts={opts}
      />,
    );
    expect(
      screen.getByTestId("member3d-M1").getAttribute("data-ratio"),
    ).toBeNull();
    expect(screen.queryByTestId("utilization-M1")).toBeNull();
  });

  test("a failing member is flagged with ✗", () => {
    const weak: FrameModel3D = {
      ...tFrame,
      members: tFrame.members.map((m) =>
        m.id === "M1" ? { ...m, profile: "IPN 80" } : m,
      ),
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
      members: tFrame.members.map((m) =>
        m.id === "M2" ? { ...m, profile: undefined } : m,
      ),
    };
    const s = solveModel3D(mixed)!;
    const { container } = render(
      <Frame3DCanvas
        model={mixed}
        solved={s}
        stress={computeStress(mixed, s)}
        viewOpts={{ ...opts, diagram: "S" }}
      />,
    );
    const layer = container.querySelector("[data-testid=diagram3d-S]")!;
    expect(layer).toBeTruthy();
    expect(layer.querySelectorAll("polygon").length).toBe(2); // M1, M3
  });
});

describe("partial UDL on the canvas", () => {
  test("the arrows of q_z stay inside 1..5 m of the hat (first arrow is right of B)", () => {
    render(
      <Frame3DCanvas
        model={tFrame}
        solved={solveModel3D(tFrame)}
        viewOpts={opts}
      />,
    );
    const hat = screen.getByTestId("member3d-M3");
    const bx = parseFloat(hat.getAttribute("x1")!);
    const dx = parseFloat(hat.getAttribute("x2")!);
    const tipX = parseFloat(
      screen
        .getByTestId("load-L2")
        .querySelector("polygon")!
        .getAttribute("points")!
        .split(" ")[0],
    );
    expect(tipX).toBeGreaterThan(bx + 5);
    expect(tipX).toBeLessThan(dx);
    expect(tipX).toBeCloseTo(bx + (dx - bx) / 5, 0); // 1 m of 5 m
  });
});

describe("local axes", () => {
  const axis = (m: string, a: string) => {
    const l = screen
      .getByTestId(`local-axes-${m}`)
      .querySelector(`line[data-axis=${a}]`)!;
    const n = (k: string) => parseFloat(l.getAttribute(k)!);
    return [n("x2") - n("x1"), n("y2") - n("y1")]; // screen vector (y down)
  };
  const on = { ...opts, showLocalAxes: true };

  test("hidden unless enabled", () => {
    render(
      <Frame3DCanvas
        model={tFrame}
        solved={solveModel3D(tFrame)}
        viewOpts={opts}
      />,
    );
    expect(screen.queryByTestId("local-axes-layer")).toBeNull();
  });

  test("a triad (x', y', z') is drawn on every member", () => {
    render(
      <Frame3DCanvas
        model={tFrame}
        solved={solveModel3D(tFrame)}
        viewOpts={on}
      />,
    );
    tFrame.members.forEach((m) =>
      expect(
        screen.getByTestId(`local-axes-${m.id}`).querySelectorAll("line"),
      ).toHaveLength(3),
    );
  });

  // Course convention (left-handed): z along the member (down / to the left), x out of the page,
  // y to the right (columns) or down (beams). Screen vectors have y pointing down.
  test("column: z' points down, y' to the right, x' out of the page (down-left on the oblique view)", () => {
    render(
      <Frame3DCanvas
        model={tFrame}
        solved={solveModel3D(tFrame)}
        viewOpts={on}
      />,
    );
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
    render(
      <Frame3DCanvas
        model={tFrame}
        solved={solveModel3D(tFrame)}
        viewOpts={on}
      />,
    );
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
    render(
      <Frame3DCanvas
        model={flipped}
        solved={solveModel3D(flipped)}
        viewOpts={on}
      />,
    );
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
    render(
      <Frame3DCanvas
        model={unstable}
        solved={solveModel3D(unstable)}
        viewOpts={on}
      />,
    );
    expect(screen.queryByTestId("local-axes-layer")).toBeNull();
  });
});

describe("zoom and pan (as in the 2D canvas)", () => {
  const content = () =>
    screen.getByTestId("canvas3d-content").getAttribute("transform")!;
  const renderIt = () =>
    render(
      <Frame3DCanvas
        model={tFrame}
        solved={solveModel3D(tFrame)}
        viewOpts={opts}
      />,
    );

  test("starts at 100% with no indicator", () => {
    renderIt();
    expect(content()).toBe("translate(0,0) scale(1)");
    expect(screen.queryByTestId("zoom-level")).toBeNull();
  });

  test("wheel zooms in and out in 15 % steps and shows the level", () => {
    renderIt();
    const svg = screen.getByTestId("frame3d-canvas");
    fireEvent.wheel(svg, { deltaY: -100 });
    expect(screen.getByTestId("zoom-level").textContent).toBe("115%");
    expect(content()).toContain("scale(1.15)");
    fireEvent.wheel(svg, { deltaY: 100 });
    expect(screen.queryByTestId("zoom-level")).toBeNull(); // back to exactly 100 %
  });

  test("+ / − buttons zoom by 25 % and ⊙ resets", () => {
    renderIt();
    fireEvent.click(screen.getByTitle("Zoom in"));
    expect(screen.getByTestId("zoom-level").textContent).toBe("125%");
    fireEvent.click(screen.getByTitle("Zoom out"));
    fireEvent.click(screen.getByTitle("Zoom out"));
    expect(screen.getByTestId("zoom-level").textContent).toBe("80%");
    fireEvent.click(screen.getByTitle("Reset view"));
    expect(content()).toBe("translate(0,0) scale(1)");
    expect(screen.queryByTestId("zoom-level")).toBeNull();
  });

  test("zoom is limited", () => {
    renderIt();
    for (let i = 0; i < 40; i++) fireEvent.click(screen.getByTitle("Zoom in"));
    expect(screen.getByTestId("zoom-level").textContent).toBe("1000%");
    for (let i = 0; i < 80; i++) fireEvent.click(screen.getByTitle("Zoom out"));
    expect(screen.getByTestId("zoom-level").textContent).toBe("15%");
  });

  test("dragging pans the view", () => {
    renderIt();
    const svg = screen.getByTestId("frame3d-canvas");
    fireEvent.mouseDown(svg, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(svg, { clientX: 140, clientY: 80 });
    expect(content()).toBe("translate(40,-20) scale(1)");
    fireEvent.mouseUp(svg);
    fireEvent.mouseMove(svg, { clientX: 300, clientY: 300 }); // no longer dragging
    expect(content()).toBe("translate(40,-20) scale(1)");
  });

  test("the global axes triad does not move with the view", () => {
    renderIt();
    fireEvent.click(screen.getByTitle("Zoom in"));
    const svg = screen.getByTestId("frame3d-canvas");
    const group = screen.getByTestId("canvas3d-content");
    // the triad's lines are direct children of the svg, not of the zoomed group
    expect(
      Array.from(svg.children).some(
        (c) => c.tagName === "g" && c !== group && c.querySelector("line"),
      ),
    ).toBe(true);
  });
});

describe("load markers on the diagrams", () => {
  const draw = (diagram: View3DOptions["diagram"], model = tFrame) =>
    render(
      <Frame3DCanvas
        model={model}
        solved={solveModel3D(model)}
        viewOpts={{ ...opts, diagram }}
      />,
    );

  test("the partial q_z of the hat is marked where it starts and ends (M3 only)", () => {
    draw("Mx");
    expect(screen.getByTestId("diagram-mark-M3-0")).toBeTruthy();
    expect(screen.getByTestId("diagram-mark-M3-1")).toBeTruthy();
    expect(screen.queryByTestId("diagram-mark-M3-2")).toBeNull();
    // full-span loads (the column's q_y) and unloaded members get no marker
    expect(screen.queryByTestId("diagram-mark-M1-0")).toBeNull();
    expect(screen.queryByTestId("diagram-mark-M2-0")).toBeNull();
  });

  test("the first marker sits 1 m of 5 along the hat, on the curve", () => {
    draw("Mx");
    const hat = screen.getByTestId("member3d-M3");
    const [x1, x2] = [
      parseFloat(hat.getAttribute("x1")!),
      parseFloat(hat.getAttribute("x2")!),
    ];
    const guide = screen
      .getByTestId("diagram-mark-M3-0")
      .querySelector("line")!;
    expect(parseFloat(guide.getAttribute("x1")!)).toBeCloseTo(
      x1 + (x2 - x1) / 5,
      3,
    );
  });

  test("point loads on a member are marked too", () => {
    const m: FrameModel3D = {
      ...tFrame,
      loads: [
        {
          id: "P",
          type: "mpoint",
          member: "M3",
          dist: 2,
          gx: 0,
          gy: 0,
          gz: -5,
        },
      ],
    };
    draw("Qy", m);
    expect(screen.getByTestId("diagram-mark-M3-0")).toBeTruthy();
  });
});

describe("values at the load markers", () => {
  const draw = (
    showValues: boolean,
    diagram: View3DOptions["diagram"] = "Mx",
  ) =>
    render(
      <Frame3DCanvas
        model={tFrame}
        solved={solveModel3D(tFrame)}
        viewOpts={{ ...opts, diagram, showValues }}
      />,
    );

  test("Mx at x = 1 m of the hat (−16 kN·m) is written next to its marker", () => {
    draw(true);
    expect(screen.getByTestId("diagram-mark-M3-0").textContent).toContain(
      "-16.0kN·m",
    );
  });

  test("the peak (−24 at B) keeps a single label; the marker at D (0) has none", () => {
    draw(true);
    expect(screen.getByTestId("diagram-mark-M3-1").textContent).toBe(""); // value 0 is not printed
  });

  test("no marker value when values are hidden", () => {
    draw(false);
    expect(screen.getByTestId("diagram-mark-M3-0").textContent).toBe("");
  });

  test("Qy: the marker at x = 1 m shows the shear there (−8 kN)", () => {
    draw(true, "Qy");
    expect(screen.getByTestId("diagram-mark-M3-0").textContent).toContain(
      "-8.0kN",
    );
  });
});
