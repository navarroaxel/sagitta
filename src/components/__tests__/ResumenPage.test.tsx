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
    // the integral for the deflection only holds for a cantilever with x from the free end: it carries its condition
    expect(screen.getByTestId("rs-row-flecha").textContent).toMatch(/1\/ρ = M\/\(E·J\)/);
    expect(screen.getByTestId("rs-row-flecha").textContent).toMatch(/cantilever, f = ∫M·x dx.*from the free end/);
    expect(screen.getByTestId("rs-row-steiner").textContent).toMatch(/J = Jg \+ A·d²/);
    for (const q of ["q1", "q2", "q3", "q4", "q5"]) expect(screen.getByTestId(`rs-${q}`)).toBeTruthy();
    expect(screen.getByTestId("rs-q3").textContent).toMatch(/F < Fk.*F = Fk.*F > Fk/);
    expect(screen.getByTestId("rs-q2").textContent).toMatch(/τ = Q·S\/\(J·s\)/);
    expect(document.body.textContent).not.toMatch(/[A-Za-z]_[A-Za-z0-9]/);
  });

  test("every answer carries its figure, with the labels of the notes", () => {
    const { container } = renderPage();
    expect(container.querySelectorAll("figure svg")).toHaveLength(5);
    for (const q of ["q1", "q2", "q3", "q4", "q5"]) expect(screen.getByTestId(`rs-${q}`).querySelector("figure svg")).toBeTruthy();
    expect(screen.getByTestId("rs-q3").textContent).toMatch(/Stable.*Indifferent.*Unstable/);
    expect(screen.getByTestId("rs-q4").querySelector("svg")!.textContent).toMatch(/σ = E·ε.*E = tg β/);
    expect(screen.getByTestId("rs-q5").querySelector("svg")!.textContent).toMatch(/Jx = Jg \+ A·d²/);
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
