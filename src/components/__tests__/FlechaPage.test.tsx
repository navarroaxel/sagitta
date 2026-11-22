import { fireEvent, render, screen } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import FlechaPage from "@/app/flecha/page";

describe("/flecha", () => {
  test("shows the seven cases and the deduction, without raw underscores", () => {
    const { container } = render(
      <LanguageProvider>
        <FlechaPage />
      </LanguageProvider>,
    );
    expect(container.querySelectorAll('[data-testid^="fla-case-"]')).toHaveLength(7);
    expect(container.querySelectorAll("figure svg")).toHaveLength(1);
    expect(document.body.textContent).not.toMatch(/[A-Za-z]_[A-Za-z0-9]/);
    expect(screen.getByTestId("fla-case-ss-tri").textContent).toMatch(/0,00652/);
  });

  test("the calculator gives 5/384·q·l⁴/(E·J) and follows the selected case", () => {
    render(
      <LanguageProvider>
        <FlechaPage />
      </LanguageProvider>,
    );
    // defaults: q = 10 kg/cm, l = 400 cm, E = 2.1e6, J = 8000 → 5/384·10·400⁴/(2.1e6·8000) = 0.198 cm
    expect(screen.getByTestId("deflection-result").textContent).toMatch(/0\.198 cm/);
    fireEvent.change(screen.getByLabelText("case"), { target: { value: "cant-point" } });
    fireEvent.change(screen.getByLabelText("load"), { target: { value: "1000" } });
    // 1/3·1000·400³/(2.1e6·8000) = 1.270 cm
    expect(screen.getByTestId("deflection-result").textContent).toMatch(/1\.270 cm/);
  });
});
