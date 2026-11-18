import { fireEvent, render, screen } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ChecksPanel from "../ChecksPanel";
import ModelEditor from "../ModelEditor";
import { PRESETS } from "@/lib/presets";
import { solveModel } from "@/lib/solve";
import type { FrameModel } from "@/lib/types";

const preset = (name: string): FrameModel =>
  PRESETS.find((p) => p.name === name)!.model;

const renderChecks = (model: FrameModel) =>
  render(
    <LanguageProvider>
      <ChecksPanel model={model} solved={solveModel(model)} />
    </LanguageProvider>,
  );

describe("ChecksPanel", () => {
  test("a profile that does not pass: σ max, ratio, ✗ and no IPB in the table", () => {
    renderChecks(preset("Beam IPB 300 (check)"));
    const region = screen.getByRole("region");
    const text = region.textContent!.replace(/\u00a0/g, " ");
    expect(text).toContain("IPB 300");
    expect(text).toContain("21 429");
    expect(text).toMatch(/1 ?339 ?%|1339 ?%/);
    expect(text).toMatch(/✗/);
    expect(text).toMatch(/ninguno de la tabla|none in the table/);
  });

  test("σ adm is shown in the title", () => {
    renderChecks(preset("Beam IPB 300 (check)"));
    expect(
      screen.getByRole("region").textContent!.replace(/\u00a0/g, " "),
    ).toMatch(/1 600 kg\/cm²/);
  });

  test("cable: diameter and elongation; sizing: the lightest profile and its weight", () => {
    renderChecks(preset("Truss + Cable + Beam (sizing)"));
    const text = screen
      .getByRole("region")
      .textContent!.replace(/\u00a0/g, " ");
    expect(text).toContain("cable");
    expect(text).toContain("20 000"); // T
    expect(text).toContain("3.99"); // d req
    expect(text).toContain("0.33"); // elongation, cm
    expect(text).toContain("IPB 800"); // beam EF
    expect(text).toContain("IPB 100"); // b4, b5
    expect(text).toMatch(/pandeo|buckling/); // b4 is compressed
  });

  test("a model with no sections renders nothing", () => {
    const { container } = renderChecks(preset("Simple Truss"));
    expect(container.firstChild).toBeNull();
  });

  test("sections without σ adm ask for it instead of checking", () => {
    const { container } = renderChecks({
      ...preset("Beam IPB 300 (check)"),
      sigmaAdm: undefined,
    });
    expect(container.textContent).toMatch(/σ adm/);
    expect(container.textContent!.replace(/\u00a0/g, " ")).not.toContain(
      "21 429",
    );
  });
});

describe("Members tab: section selector", () => {
  test("choosing 'cable' / a profile / a sizing series sets member.section", () => {
    const onChange = vi.fn();
    const model = preset("Simple Truss");
    render(
      <LanguageProvider>
        <ModelEditor
          model={model}
          onChange={onChange}
          solved={solveModel(model)}
        />
      </LanguageProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: /members|barras/i }));
    const selects = screen
      .getAllByRole("combobox")
      .filter((s) =>
        (s as HTMLSelectElement).querySelector('option[value="cable"]'),
      );
    expect(selects.length).toBe(model.members.length);

    fireEvent.change(selects[0], { target: { value: "cable" } });
    expect(onChange.mock.calls.at(-1)![0].members[0].section).toEqual({
      kind: "cable",
    });
    fireEvent.change(selects[0], { target: { value: "profile:IPB 300" } });
    expect(onChange.mock.calls.at(-1)![0].members[0].section).toEqual({
      kind: "profile",
      name: "IPB 300",
    });
    fireEvent.change(selects[0], { target: { value: "size:IPN,IPB" } });
    expect(onChange.mock.calls.at(-1)![0].members[0].section).toEqual({
      kind: "size",
      series: ["IPN", "IPB"],
    });
    fireEvent.change(selects[0], { target: { value: "" } });
    expect(onChange.mock.calls.at(-1)![0].members[0].section).toBeUndefined();
  });

  test("σ adm is editable in the Material tab", () => {
    const onChange = vi.fn();
    const model = preset("Beam IPB 300 (check)");
    render(
      <LanguageProvider>
        <ModelEditor
          model={model}
          onChange={onChange}
          solved={solveModel(model)}
        />
      </LanguageProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: /material/i }));
    const input = screen.getByDisplayValue("1600");
    fireEvent.change(input, { target: { value: "1400" } });
    expect(onChange.mock.calls.at(-1)![0].sigmaAdm).toBe(1400);
  });
});
