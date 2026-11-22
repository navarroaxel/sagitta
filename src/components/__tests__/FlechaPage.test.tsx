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
    fireEvent.change(screen.getByLabelText("Case"), { target: { value: "cant-point" } });
    fireEvent.change(screen.getByLabelText("P (kg)"), { target: { value: "1000" } });
    // 1/3·1000·400³/(2.1e6·8000) = 1.270 cm
    expect(screen.getByTestId("deflection-result").textContent).toMatch(/1\.270 cm/);
  });

  test("rejects an impossible span or stiffness instead of showing a number", () => {
    render(
      <LanguageProvider>
        <FlechaPage />
      </LanguageProvider>,
    );
    fireEvent.change(screen.getByLabelText("l (cm)"), { target: { value: "-400" } });
    expect(screen.getByTestId("deflection-result").textContent).toMatch(/—/);
    fireEvent.change(screen.getByLabelText("l (cm)"), { target: { value: "400" } });
    fireEvent.change(screen.getByLabelText("J_x (cm⁴)".replace("_", "")), { target: { value: "Infinity" } });
    expect(screen.getByTestId("deflection-result").textContent).toMatch(/—/);
  });

  test("the ds arc of the curvature figure is concentric with C (radii end on it)", () => {
    const { container } = render(
      <LanguageProvider>
        <FlechaPage />
      </LanguageProvider>,
    );
    const lines = Array.from(container.querySelectorAll("figure line"));
    expect(lines).toHaveLength(2);
    for (const l of lines) {
      const d = Math.hypot(Number(l.getAttribute("x2")) - 130, Number(l.getAttribute("y2")) - 20);
      expect(d).toBeCloseTo(140, 0);
    }
  });
});
