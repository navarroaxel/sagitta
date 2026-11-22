import { fireEvent, render, screen } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ResumenPage from "@/app/resumen/page";
import { ROWS } from "@/lib/summaryRows";

const renderPage = () =>
  render(
    <LanguageProvider>
      <ResumenPage />
    </LanguageProvider>,
  );

describe("/resumen", () => {
  test("has one row per guide with its formula, and the five theory questions", () => {
    renderPage();
    expect(ROWS).toHaveLength(10);
    for (const r of ROWS) expect(screen.getByTestId(`rs-row-${r.id}`)).toBeTruthy();
    expect(screen.getByTestId("rs-row-flexion").textContent).toMatch(/σ = M·y\/J/);
    expect(screen.getByTestId("rs-row-pandeo").textContent).toMatch(/π²·E·Jmin\/\(c²·l²\)/);
    expect(screen.getByTestId("rs-row-steiner").textContent).toMatch(/J = Jg \+ A·d²/);
    for (const q of ["q1", "q2", "q3", "q4", "q5"]) expect(screen.getByTestId(`rs-${q}`)).toBeTruthy();
    expect(screen.getByTestId("rs-q3").textContent).toMatch(/F < Fk.*F = Fk.*F > Fk/);
    expect(screen.getByTestId("rs-q2").textContent).toMatch(/τ = Q·S\/\(J·s\)/);
    expect(document.body.textContent).not.toMatch(/[A-Za-z]_[A-Za-z0-9]/);
  });

  test("the print button calls window.print", () => {
    const spy = vi.spyOn(window, "print").mockImplementation(() => {});
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Print" }));
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});
