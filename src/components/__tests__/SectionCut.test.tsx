import { render as rtlRender, screen, fireEvent, within, act } from "@testing-library/react";
import { useState, type ReactElement } from "react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import SectionCut, { CutState } from "../SectionCut";
import { LEGEND_X } from "../SectionPrism";
import Frame3DCanvas, { View3DOptions } from "../Frame3DCanvas";
import { solveModel3D } from "@/lib/solve3d";
import { computeStress } from "@/lib/stress3d";
import { PRESETS_3D } from "@/lib/presets3d";
import type { FrameModel3D } from "@/lib/types3d";

const render = (ui: ReactElement) => rtlRender(<LanguageProvider>{ui}</LanguageProvider>);
const model = PRESETS_3D[0].model;
const solved = solveModel3D(model)!;
const stress = computeStress(model, solved);

function Harness({ model: m = model, start = 0 }: { model?: FrameModel3D; start?: number }) {
  const [cut, setCut] = useState<CutState>({ on: true, member: "M1", t: start });
  const s = solveModel3D(m)!;
  return <SectionCut model={m} solved={s} stress={computeStress(m, s)} cut={cut} onChange={setCut} />;
}

describe("SectionCut", () => {
  test("column base (z = L, the column's z runs downwards): corner totals match the member's σ max and are the sum of the parts", () => {
    render(<Harness start={1} />);
    const corners = [0, 1, 2, 3].map((i) => parseFloat(screen.getByTestId(`cut-corner-${i}`).textContent!));
    const max = Math.max(...corners.map(Math.abs));
    expect(max).toBeCloseTo(Math.abs(stress[0]!.max.sigma), 1);
    // each row of the table: N + My + Mz = Σ
    screen.getByTestId("cut-corners").querySelectorAll("tbody tr").forEach((row) => {
      const [, n, my, mz, tot] = Array.from(row.querySelectorAll("td")).map((td) => parseFloat(td.textContent!));
      expect(n + my + mz).toBeCloseTo(tot, 1);
    });
  });

  test("draws the three 'Z' diagrams and the neutral axis", () => {
    render(<Harness start={1} />);
    ["N", "Mx", "My"].forEach((d) => expect(screen.getByTestId(`cut-diagram-${d}`)).toBeTruthy());
    expect(screen.getByTestId("cut-neutral")).toBeTruthy();
  });

  test("moving the slider changes the cut and the forces; the top of the column has no My", () => {
    render(<Harness start={1} />);
    expect(screen.getByTestId("cut-x").textContent).toContain("z = 6.00");
    const row = (k: string) =>
      Array.from(screen.getByTestId("cut-forces").querySelectorAll("tr"))
        .find((r) => r.querySelector("td")!.textContent === k)!
        .querySelectorAll("td")[1].textContent;
    const myBase = parseFloat(row("My")!);
    fireEvent.change(screen.getByLabelText("cut position"), { target: { value: "0" } });
    expect(screen.getByTestId("cut-x").textContent).toContain("z = 0.00");
    expect(Math.abs(myBase)).toBeCloseTo(54, 1);
    expect(parseFloat(row("My")!)).toBeCloseTo(0, 1);
  });

  test("'go to σ max' jumps to the most stressed section", () => {
    render(<Harness start={0} />);
    fireEvent.click(screen.getByText("Go to σ max"));
    expect(screen.getByTestId("cut-x").textContent).toContain("z = 6.00"); // the base
  });

  test("writes out the check with the critical corner's numbers", () => {
    render(<Harness start={1} />);
    const eq = screen.getByTestId("cut-equation");
    expect(eq.textContent).toContain("σ = N/A + Mx·y/Ix + My·x/Iy ≤ σ adm");
    // terms add up to the member's σ max (column base) and the verdict is shown
    const sigma = stress[0]!.max.sigma;
    expect(screen.getByTestId("cut-equation-terms").textContent).toContain(`= ${sigma.toFixed(2)} kN/cm²`);
    const res = screen.getByTestId("cut-equation-result").textContent!;
    expect(res).toContain(`|σ| = ${Math.abs(sigma).toFixed(2)} ≤ σ adm = 14 kN/cm² → ✓`);
    expect(res).toContain(`${((Math.abs(sigma) / 14) * 100).toFixed(0)} %`);
  });

  test("a failing section shows > and ✗", () => {
    const weak: FrameModel3D = {
      ...model,
      members: model.members.map((m) => (m.id === "M1" ? { ...m, profile: "IPN 80" } : m)),
    };
    render(<Harness model={weak} start={1} />);
    const res = screen.getByTestId("cut-equation-result").textContent!;
    expect(res).toContain(">");
    expect(res).toContain("✗");
  });

  test("members without a profile cannot be cut", () => {
    const none: FrameModel3D = { ...model, members: model.members.map((m) => ({ ...m, profile: undefined })) };
    render(<Harness model={none} />);
    expect(screen.getByTestId("section-cut").textContent).toContain("Assign an IPN/IPB");
  });
});

describe("cut marker on the 3D canvas", () => {
  const opts: View3DOptions = {
    diagram: null,
    showLoads: false,
    showReactions: false,
    showValues: false,
    showMemberLabels: false,
    colorByStress: false,
    showLocalAxes: false,
    scale: 1,
  };
  test("shown only when a cut is given", () => {
    const { rerender } = render(
      <Frame3DCanvas model={model} solved={solved} viewOpts={opts} cut={{ member: 0, x: 3 }} />,
    );
    expect(screen.getByTestId("cut-marker")).toBeTruthy();
    rerender(
      <LanguageProvider>
        <Frame3DCanvas model={model} solved={solved} viewOpts={opts} cut={null} />
      </LanguageProvider>,
    );
    expect(screen.queryByTestId("cut-marker")).toBeNull();
  });
});

describe("SectionCut with a kg model", () => {
  test("the verification and the corner table are written in kg/cm²", () => {
    const kg = PRESETS_3D.find((p) => p.key === "cantilever_kg")!.model;
    render(<Harness model={kg} start={1} />);
    const eq = screen.getByTestId("cut-equation").textContent!;
    expect(eq).toContain("σ adm = 1600 kg/cm²");
    expect(eq).toContain("N [kg], M [kg·cm]");
    expect(screen.getByTestId("section-cut").textContent).toContain("σ (kg/cm²)");
    expect(screen.getByTestId("section-cut").textContent).not.toContain("kN");
  });
});

describe("SectionCut 3D prism", () => {
  test("paints tension and compression fibres, the sides and the neutral axis", () => {
    render(<Harness start={1} />);
    const prism = screen.getByTestId("section-prism");
    const fills = (id: string) =>
      Array.from(prism.querySelectorAll(`[data-testid="${id}"] polygon`)).map((n) => n.getAttribute("fill"));
    const front = new Set(fills("prism-front"));
    expect(front.size).toBe(2); // the base of the column has both tension and compression
    expect(fills("prism-sides").length).toBeGreaterThan(0);
    expect(screen.getByTestId("prism-neutral")).toBeTruthy();
  });
});

describe("SectionCut resultant (oblique) diagram", () => {
  test("draws the E.N., the two parallels and the + / − triangles with σ max / σ min", () => {
    render(<Harness start={1} />);
    expect(screen.getByTestId("cut-resultant-neutral")).toBeTruthy();
    expect(screen.getByTestId("cut-extreme-max")).toBeTruthy();
    expect(screen.getByTestId("cut-extreme-min")).toBeTruthy();
    expect(screen.getByTestId("cut-resultant-pos")).toBeTruthy();
    expect(screen.getByTestId("cut-resultant-neg")).toBeTruthy();
    const nums = ["max", "min"].map((k) => parseFloat(screen.getByTestId(`cut-resultant-${k}`).textContent!.split("=")[1]));
    expect(nums[0]).toBeGreaterThan(0);
    expect(nums[1]).toBeLessThan(0);
  });
});

describe("SectionCut loads drawn on the 3D prism", () => {
  test("shows the support reaction of the column, and ⊗/⊙ for its axial part", () => {
    render(<Harness start={1} />);
    expect(screen.getByTestId("section-prism").contains(screen.getByTestId("sload-R-A"))).toBe(true);
    expect(screen.getByTestId("prism-critical")).toBeTruthy();
    expect(screen.getByTestId("section-prism").textContent).toContain("most stressed corner"); // the ring is in the legend
    expect(screen.getByTestId("sload-R-A")).toBeTruthy();
    expect(screen.getByTestId("sload-z-R-A")).toBeTruthy();
  });
});

describe("SectionCut local triad", () => {
  test("draws the section's own x, y and z in the 3D prism", () => {
    render(<Harness start={1} />);
    const l = screen.getByTestId("prism-local-axes");
    ["x", "y", "z"].forEach((a) => expect(l.querySelector(`[data-axis="${a}"]`)).toBeTruthy());
  });
});

describe("SectionCut full screen", () => {
  test("each diagram has a full-screen button that asks the browser to show that figure alone", () => {
    // jsdom has no Fullscreen API: install the method for this test
    const req = vi.fn();
    const proto = HTMLElement.prototype as unknown as { requestFullscreen?: () => void };
    proto.requestFullscreen = req;
    try {
      render(<Harness start={1} />);
      const buttons = screen.getAllByRole("button", { name: "Full screen" });
      expect(buttons).toHaveLength(3); // components, resultant, 3D prism
      ["fs-cut-components", "fs-cut-resultant", "fs-cut-prism"].forEach((id) =>
        expect(screen.getByTestId(id).querySelector("svg")).toBeTruthy(),
      );
      fireEvent.click(buttons[1]);
      expect(req).toHaveBeenCalledTimes(1);
      expect(req.mock.contexts[0]).toBe(screen.getByTestId("fs-cut-resultant")); // that figure, not the page
    } finally {
      delete proto.requestFullscreen;
    }
  });
});

describe("SectionCut full screen controls", () => {
  test("while a figure is full screen it shows the Z slider, and moving it moves the cut", () => {
    const proto = HTMLElement.prototype as unknown as { requestFullscreen?: () => void };
    let fsEl: Element | null = null;
    const req = vi.fn(function () {});
    proto.requestFullscreen = req;
    Object.defineProperty(document, "fullscreenElement", { configurable: true, get: () => fsEl });
    try {
      render(<Harness start={1} />);
      const fig = screen.getByTestId("fs-cut-resultant");
      expect(within(fig).queryByLabelText("cut position (full screen)")).toBeNull(); // only when full screen
      fireEvent.click(within(fig).getByRole("button", { name: "Full screen" }));
      fsEl = req.mock.contexts[0] as Element; // the browser would now show that figure alone
      act(() => {
        document.dispatchEvent(new Event("fullscreenchange"));
      });
      const slider = within(fig).getByLabelText("cut position (full screen)");
      expect(screen.getByTestId("cut-x").textContent).toContain("z = 6.00");
      fireEvent.change(slider, { target: { value: "0" } });
      expect(screen.getByTestId("cut-x").textContent).toContain("z = 0.00"); // the cut moved
      expect(within(fig).getByRole("button", { name: "Exit full screen" })).toBeTruthy();
    } finally {
      delete proto.requestFullscreen;
      delete (document as unknown as { fullscreenElement?: unknown }).fullscreenElement;
    }
  });
});

describe("SectionCut prism legend fits in the figure", () => {
  test("the widest legend line (reaction components, kg-sized numbers) ends inside the viewBox", () => {
    // 3D T-frame in kg: reactions in the hundreds
    const kg = PRESETS_3D.find((p) => p.key === "frame_overhang")!.model;
    render(<Harness model={kg} start={1} />);
    const svg = screen.getByTestId("section-prism").querySelector<SVGSVGElement>("svg:not(.fs-icon)")!; // not the button's icon
    const vbW = svg.viewBox.baseVal.width;
    const CHAR = 6.6; // px per character of the 11 px monospace legend text
    const lines = Array.from(svg.querySelectorAll("text")).filter((t) => t.getAttribute("x") === String(LEGEND_X + 16)); // the load legend lines
    expect(lines.length).toBeGreaterThan(0);
    lines.forEach((t) => expect(LEGEND_X + 16 + t.textContent!.length * CHAR).toBeLessThan(vbW - 8));
  });
});

describe("SectionCut prism legend with many loads", () => {
  test("five distributed loads and a reaction: every legend line is inside the viewBox and clear of the triad", () => {
    const base = PRESETS_3D.find((p) => p.key === "frame_overhang")!.model;
    const many: FrameModel3D = {
      ...base,
      loads: [1, 2, 3, 4, 5].map((i) => ({ id: `Q${i}`, type: "mudl" as const, member: "M1", gx: 0, gy: 0, gz: -i })),
    };
    render(<Harness model={many} start={1} />);
    const svg = screen.getByTestId("section-prism").querySelector<SVGSVGElement>("svg:not(.fs-icon)")!;
    const vbH = svg.viewBox.baseVal.height;
    const lines = Array.from(svg.querySelectorAll("text")).filter((t) => t.getAttribute("x") === String(LEGEND_X + 16));
    expect(lines.length).toBeGreaterThanOrEqual(6 * 2);
    const bottom = Math.max(...lines.map((t) => parseFloat(t.getAttribute("y")!)));
    expect(bottom).toBeLessThan(vbH - 8);
    // the triad sits below the last legend entry
    const triad = svg.querySelector('[data-testid="prism-local-axes"] line')!;
    expect(parseFloat(triad.getAttribute("y1")!) - 42).toBeGreaterThan(bottom);
  });
});

describe("SectionCut sign marks", () => {
  test("σ(N), σ(Mx) and σ(My) areas carry their + / − (tension / compression) mark", () => {
    render(<Harness start={1} />); // base of the column: N < 0, Mx and My of both signs on the section
    const fig = screen.getByTestId("section-cut-svg");
    const signs = (id: string) =>
      Array.from(fig.querySelectorAll(`[data-testid^="${id}-sign"]`)).map((g) => g.getAttribute("data-sign"));
    expect(signs("cut-diagram-N")).toEqual(["−"]); // the column is in compression
    expect(signs("cut-diagram-Mx").sort()).toEqual(["+", "−"]);
    // the colour of each mark follows its sign: the same one as the area it labels
    const tension = fig.querySelector('[data-sign="+"] circle')!.getAttribute("stroke");
    const compression = fig.querySelector('[data-sign="−"] circle')!.getAttribute("stroke");
    expect(tension).not.toBe(compression);
  });
});

describe("SectionCut prism shows σ along z", () => {
  const sidesOpacities = () =>
    Array.from(screen.getByTestId("prism-sides").querySelectorAll("polygon")).map((n) => n.getAttribute("fill-opacity"));

  test("the sides are painted slice by slice with σ(z): many different intensities, not one per face", () => {
    render(<Harness start={1} />);
    expect(new Set(sidesOpacities()).size).toBeGreaterThan(8);
    // and tension and compression both appear on the member's sides (the column bends)
    const fills = new Set(Array.from(screen.getByTestId("prism-sides").querySelectorAll("polygon")).map((n) => n.getAttribute("fill")));
    expect(fills.size).toBe(2);
  });

  test("the sides do not depend on where the cut is; the plate (the cut) moves along z with the slider", () => {
    render(<Harness start={0} />);
    const sidesBefore = sidesOpacities().join();
    const plate = () => screen.getByTestId("prism-front").querySelector("polygon")!.getAttribute("points");
    const markerBefore = screen.getByTestId("prism-cut-marker").getAttribute("cx");
    const plateBefore = plate();
    fireEvent.change(screen.getByLabelText("cut position"), { target: { value: "1" } });
    expect(sidesOpacities().join()).toBe(sidesBefore); // σ(z) is a property of the member
    expect(plate()).not.toBe(plateBefore); // the plate moved…
    expect(parseFloat(screen.getByTestId("prism-cut-marker").getAttribute("cx")!)).toBeGreaterThan(parseFloat(markerBefore!)); // …towards the back (z grows into the page)
  });

  test("the z axis is labelled with the member's ends", () => {
    render(<Harness start={1} />);
    const axis = screen.getByTestId("prism-z-axis").textContent!;
    expect(axis).toContain("z = 0"); // the front end
    expect(axis).toContain("z = 6.00 m"); // the other end: the 6 m column of the first preset
  });
});

describe("SectionCut controls stay in reach", () => {
  test("the member / Z slider bar is sticky, so Z can be moved while looking at any figure (not only in full screen)", () => {
    render(<Harness start={1} />);
    const bar = screen.getByLabelText("cut position").closest("div")!;
    expect(bar.className).toContain("sticky");
    expect(bar.className).toContain("-top-2"); // cancels the scroll area's p-2, so nothing peeks above the bar
    expect(bar.className).toContain("bg-white"); // opaque, so the figures do not show through it
  });
});

describe("SectionCut prism: the z labels stay clear of the cut's corner values", () => {
  const num = (el: Element, a: string) => parseFloat(el.getAttribute(a)!);

  test.each([
    ["at the front end (z = 0)", 0],
    ["at the far end (z = L)", 1],
  ])("%s", (_name, start) => {
    render(<Harness start={start} />);
    const z0 = screen.getByTestId("prism-z0-label"),
      zL = screen.getByTestId("prism-zL-label");
    const FONT = 12; // px: two lines closer than this overlap
    const WIDTH = 60; // px: text wider than this can reach the neighbour's x
    [0, 1, 2, 3].forEach((i) => {
      const c = screen.getByTestId(`prism-corner-${i}`);
      [z0, zL].forEach((z) => {
        const near = Math.abs(num(z, "x") - num(c, "x")) < WIDTH;
        if (near) expect(Math.abs(num(z, "y") - num(c, "y"))).toBeGreaterThanOrEqual(FONT);
      });
    });
  });
});

describe("SectionCut prism: where a distributed load acts", () => {
  function Beam({ start }: { start: number }) {
    // M3 of the first preset: q from 1 to 5 m of a 5 m beam — NOT the whole beam
    const [cut, setCut] = useState<CutState>({ on: true, member: "M3", t: start });
    const s = solveModel3D(model)!;
    return <SectionCut model={model} solved={s} stress={computeStress(model, s)} cut={cut} onChange={setCut} />;
  }

  const zs = () =>
    Array.from(screen.getByTestId("prism-q-span-L2").children).map((a) => parseFloat(a.getAttribute("data-z")!));

  test("with the cut at the far end the arrows cover exactly the loaded span (z 0–4 of 5 m), and the legend says so", () => {
    render(<Beam start={1} />); // z = 5: the whole span is on the free body
    expect(zs().length).toBeGreaterThanOrEqual(5); // a row of them, not one
    expect(Math.min(...zs())).toBeCloseTo(0, 3);
    expect(Math.max(...zs())).toBeCloseTo(4, 3); // not up to 5: the 1 m next to B is unloaded
    expect(screen.getByTestId("section-prism").textContent).toContain("(z 0.0–4.0 m)");
  });

  test("with the cut at mid-span there are no arrows past it: they are not on the free body (like a reaction past the cut)", () => {
    render(<Beam start={0.4} />); // the station nearest to z = 2 m of 5
    const zCut = parseFloat(screen.getByTestId("cut-x").textContent!.replace("z = ", "")); // what the bar shows
    expect(Math.max(...zs())).toBeLessThanOrEqual(zCut + 0.006); // the bar rounds z to 2 decimals
    expect(Math.max(...zs())).toBeCloseTo(zCut, 1); // the row ends at the plate
    expect(screen.getByTestId("section-prism").textContent).toContain("(z 0.0–4.0 m)"); // the legend still gives the whole span
  });

  test("the thick arrows AT the cut only appear where the load acts there: not past the end of its span (z > 4)", () => {
    const { unmount } = render(<Beam start={0.5} />); // z = 2.5: inside the loaded span 0–4
    expect(screen.queryByTestId("sload-q-L2")).toBeTruthy();
    unmount();
    render(<Beam start={0.94} />); // z ≈ 4.7: the load ended at z = 4 (it is on the free body, but not acting here)
    expect(parseFloat(screen.getByTestId("cut-x").textContent!.replace("z = ", ""))).toBeGreaterThan(4);
    expect(screen.queryByTestId("sload-q-L2")).toBeNull(); // no arrows at the plate…
    expect(zs().length).toBeGreaterThanOrEqual(5); // …but the row along the span is there, ending at z = 4
    expect(Math.max(...zs())).toBeCloseTo(4, 3);
    expect(screen.getByTestId("section-prism").textContent).toContain("(z 0.0–4.0 m)"); // and the legend
  });

  test("the row grows with the slider", () => {
    render(<Beam start={0.2} />);
    const short = zs().length;
    fireEvent.change(screen.getByLabelText("cut position"), { target: { value: "0.8" } }); // z ≈ 4
    expect(zs().length).toBeGreaterThan(short);
    expect(Math.max(...zs())).toBeCloseTo(4, 1);
  });

  test("a load over the whole member (the column's q) gets no span in the legend", () => {
    render(<Harness start={1} />);
    expect(screen.getByTestId("section-prism").textContent).not.toMatch(/q L1 \(z /); // the legend line of q
  });
});

describe("SectionCut resultant when σ is uniform", () => {
  function Beam3({ start }: { start: number }) {
    const [cut, setCut] = useState<CutState>({ on: true, member: "M3", t: start });
    const s = solveModel3D(model)!;
    return <SectionCut model={model} solved={s} stress={computeStress(model, s)} cut={cut} onChange={setCut} />;
  }

  test("z = 0 of M3 (the free end: nothing before it): says σ = 0 instead of drawing an empty figure", () => {
    render(<Beam3 start={0} />);
    const note = screen.getByTestId("cut-resultant-uniform");
    expect(note.textContent).toContain("σ = 0");
    expect(screen.queryByTestId("cut-resultant-neutral")).toBeNull(); // no E.N. to draw
  });

  test("a normal cut still draws the diagram and not the note", () => {
    render(<Beam3 start={0.5} />);
    expect(screen.queryByTestId("cut-resultant-uniform")).toBeNull();
    expect(screen.getByTestId("cut-resultant-neutral")).toBeTruthy();
  });
});

describe("SectionCut prism where there is no stress", () => {
  test("at the free end (σ = 0) there is no '-0.00' and no ring on an arbitrary corner", () => {
    function Beam0() {
      const [cut, setCut] = useState<CutState>({ on: true, member: "M3", t: 0 });
      const s = solveModel3D(model)!;
      return <SectionCut model={model} solved={s} stress={computeStress(model, s)} cut={cut} onChange={setCut} />;
    }
    render(<Beam0 />);
    const prism = screen.getByTestId("section-prism");
    [0, 1, 2, 3].forEach((i) => expect(screen.getByTestId(`prism-corner-${i}`).textContent).toBe("0.00"));
    expect(prism.textContent).not.toMatch(/[-−]0\.00/);
    expect(screen.queryByTestId("prism-critical")).toBeNull();
  });
});

describe("SectionCut at the free end of M4 of the 400 kg/m preset (numerical noise, not stress)", () => {
  const over = PRESETS_3D.find((p) => p.key === "frame_overhang")!.model;
  function M4({ start }: { start: number }) {
    const [cut, setCut] = useState<CutState>({ on: true, member: "M4", t: start });
    const s = solveModel3D(over)!;
    return <SectionCut model={over} solved={s} stress={computeStress(over, s)} cut={cut} onChange={setCut} />;
  }

  test("z = 0: σ = 0 is said, not a diagram built on ~1e-13 (no 'σ max = -0.00' and no far-away E.N.)", () => {
    render(<M4 start={0} />);
    expect(screen.getByTestId("cut-resultant-uniform").textContent).toContain("σ = 0");
    expect(screen.queryByTestId("cut-resultant-neutral")).toBeNull();
    expect(screen.queryByTestId("cut-resultant-max")).toBeNull();
    expect(screen.getByTestId("section-prism").textContent).not.toMatch(/[-−]0\.00/);
    expect(screen.queryByTestId("prism-critical")).toBeNull();
    // a 0.00 has no sign, so it is not painted tension-green or compression-red
    [0, 1, 2, 3].forEach((i) => expect(screen.getByTestId(`prism-corner-${i}`).getAttribute("fill")).not.toMatch(/^#(008a00|e00000)$/i));
  });

  test("a little further along the beam the diagram is back", () => {
    render(<M4 start={0.5} />);
    expect(screen.queryByTestId("cut-resultant-uniform")).toBeNull();
    expect(screen.getByTestId("cut-resultant-neutral")).toBeTruthy();
  });
});
