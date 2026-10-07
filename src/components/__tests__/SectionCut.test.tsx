import { render as rtlRender, screen, fireEvent } from "@testing-library/react";
import { useState, type ReactElement } from "react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import SectionCut, { CutState } from "../SectionCut";
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
  test("column base: corner totals match the member's σ max and are the sum of the parts", () => {
    render(<Harness />);
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
    render(<Harness />);
    ["N", "My", "Mz"].forEach((d) => expect(screen.getByTestId(`cut-diagram-${d}`)).toBeTruthy());
    expect(screen.getByTestId("cut-neutral")).toBeTruthy();
  });

  test("moving the slider changes the cut and the forces; top of the column has no Mz", () => {
    render(<Harness />);
    expect(screen.getByTestId("cut-x").textContent).toContain("x = 0.00");
    const row = (k: string) =>
      Array.from(screen.getByTestId("cut-forces").querySelectorAll("tr"))
        .find((r) => r.querySelector("td")!.textContent === k)!
        .querySelectorAll("td")[1].textContent;
    const mzBase = parseFloat(row("Mz")!);
    fireEvent.change(screen.getByLabelText("cut position"), { target: { value: "1" } });
    expect(screen.getByTestId("cut-x").textContent).toContain("x = 6.00");
    expect(Math.abs(mzBase)).toBeCloseTo(54, 1);
    expect(parseFloat(row("Mz")!)).toBeCloseTo(0, 1);
  });

  test("'go to σ max' jumps to the most stressed section", () => {
    render(<Harness start={1} />);
    fireEvent.click(screen.getByText("Go to σ max"));
    expect(screen.getByTestId("cut-x").textContent).toContain("x = 0.00");
  });

  test("writes out the check with the critical corner's numbers", () => {
    render(<Harness />);
    const eq = screen.getByTestId("cut-equation");
    expect(eq.textContent).toContain("σ = N/A − My·z'/Iy − Mz·y'/Iz ≤ σ adm");
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
    render(<Harness model={weak} />);
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
