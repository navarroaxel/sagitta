import { render as rtlRender, screen, fireEvent } from "@testing-library/react";
import type { ReactElement } from "react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useState } from "react";
import Model3DEditor from "../Model3DEditor";
import Results3DPanel from "../Results3DPanel";
import { solveModel3D } from "@/lib/solve3d";
import { computeStress } from "@/lib/stress3d";
import { PRESETS_3D } from "@/lib/presets3d";
import type { FrameModel3D } from "@/lib/types3d";

const base = PRESETS_3D[0].model;
const render = (ui: ReactElement) => rtlRender(<LanguageProvider>{ui}</LanguageProvider>);

function Harness({ onModel }: { onModel: (m: FrameModel3D) => void }) {
  const [model, setModel] = useState(base);
  const solved = solveModel3D(model);
  return (
    <Model3DEditor
      model={model}
      onChange={(m) => {
        setModel(m);
        onModel(m);
      }}
      solved={solved}
      stress={solved ? computeStress(model, solved) : null}
    />
  );
}

describe("Model3DEditor", () => {
  test("choosing a profile and rotating it updates the member", () => {
    let last = base;
    render(<Harness onModel={(m) => (last = m)} />);
    fireEvent.click(screen.getByText("members"));
    fireEvent.change(screen.getByLabelText("M1 profile"), { target: { value: "IPN 300" } });
    expect(last.members[0].profile).toBe("IPN 300");
    expect(last.members[0].rotated).toBe(true); // the preset's column is already rotated
    fireEvent.click(screen.getByLabelText("M1 rotated"));
    expect(last.members[0].rotated).toBe(false);
    fireEvent.click(screen.getByLabelText("M1 rotated"));
    expect(last.members[0].rotated).toBe(true);
    fireEvent.change(screen.getByLabelText("M1 profile"), { target: { value: "" } });
    expect(last.members[0].profile).toBeUndefined();
  });

  test("rotate is disabled without a profile", () => {
    const m: FrameModel3D = {
      ...base,
      members: base.members.map((x) => ({ ...x, profile: undefined })),
    };
    render(<Model3DEditor model={m} onChange={() => {}} solved={solveModel3D(m)} />);
    fireEvent.click(screen.getByText("members"));
    expect((screen.getByLabelText("M1 rotated") as HTMLInputElement).disabled).toBe(true);
  });

  test("σ adm is editable from the material tab", () => {
    let last = base;
    render(<Harness onModel={(m) => (last = m)} />);
    fireEvent.click(screen.getByText("material"));
    fireEvent.change(screen.getByLabelText("sigma adm"), { target: { value: "16" } });
    expect(last.sigmaAdm).toBe(16);
  });
});

describe("Results3DPanel stress table", () => {
  test("lists every member with σ max, ratio and ✓/✗", () => {
    const solved = solveModel3D(base)!;
    render(<Results3DPanel model={base} solved={solved} stress={computeStress(base, solved)} />);
    base.members.forEach((m) => expect(screen.getByTestId(`stress-row-${m.id}`)).toBeTruthy());
    expect(screen.getByTestId("stress-row-M1").textContent).toContain("IPB 260");
    expect(screen.getByTestId("stress-row-M1").textContent).toContain("✓");
  });

  test("a failing member shows ✗ and the hint appears when no member has a profile", () => {
    const weak: FrameModel3D = {
      ...base,
      members: base.members.map((m) => ({ ...m, profile: m.id === "M1" ? "IPN 80" : m.profile })),
    };
    const s = solveModel3D(weak)!;
    const { unmount } = render(
      <Results3DPanel model={weak} solved={s} stress={computeStress(weak, s)} />,
    );
    expect(screen.getByTestId("stress-row-M1").textContent).toContain("✗");
    unmount();

    const none: FrameModel3D = { ...base, members: base.members.map((m) => ({ ...m, profile: undefined })) };
    const s2 = solveModel3D(none)!;
    render(<Results3DPanel model={none} solved={s2} stress={computeStress(none, s2)} />);
    expect(screen.queryByTestId("stress-row-M1")).toBeNull();
    expect(screen.getByTestId("stress-section").textContent).toContain("Assign an IPN/IPB");
  });
});
