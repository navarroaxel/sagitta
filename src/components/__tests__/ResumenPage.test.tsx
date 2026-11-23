import { fireEvent, render, screen } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ResumenPage from "@/app/resumen/page";
import { EXAM_TERMS, ROWS } from "@/lib/summaryRows";

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
    // the answers are the glossary's: same term, same definition
    expect(screen.getByTestId("rs-q1").textContent).toMatch(/Hypotheses of circular torsion/);
    expect(screen.getByTestId("rs-q2").textContent).toMatch(/τm = Q·Sx \/ \(Jx·s\)/);
    expect(screen.getByTestId("rs-q3").textContent).toMatch(/F < Fk.*F = Fk.*F > Fk/);
    expect(screen.getByTestId("rs-q4").textContent).toMatch(/σ = E·ε/);
    expect(screen.getByTestId("rs-q5").textContent).toMatch(/J = Jg \+ A·d²/);
    expect(document.body.textContent).not.toMatch(/[A-Za-z]_[A-Za-z0-9]/);
  });

  test("every answer carries its figure, with the labels of the notes", () => {
    const { container } = renderPage();
    expect(container.querySelectorAll("figure svg")).toHaveLength(5);
    for (const q of ["q1", "q2", "q3", "q4", "q5"]) expect(screen.getByTestId(`rs-${q}`).querySelector("figure svg")).toBeTruthy();
    expect(screen.getByTestId("rs-q3").textContent).toMatch(/Stable.*Indifferent.*Unstable/);
    expect(screen.getByTestId("rs-q4").querySelector("svg")!.textContent).toMatch(/E = tg β/);
    expect(screen.getByTestId("rs-q5").querySelector("svg")!.textContent).toMatch(/Jx = Jg \+ A·d²/);
    expect(document.body.textContent).not.toMatch(/[A-Za-z]_[A-Za-z0-9]/);
  });

  test("each row links to its guide and to its definitions, and each question to the glossary", () => {
    renderPage();
    for (const r of ROWS) {
      const row = screen.getByTestId(`rs-row-${r.id}`);
      const hrefs = Array.from(row.querySelectorAll("a")).map((a) => a.getAttribute("href"));
      expect(hrefs[0], r.id).toBe(r.guide);
      expect(hrefs.slice(1), r.id).toEqual(r.terms.map((t) => `/definiciones#${t}`));
    }
    const links = Array.from(screen.getByTestId("rs-q5").querySelectorAll("a")).map((a) => a.getAttribute("href"));
    expect(links).toEqual(["/definiciones#pln.steiner"]);
    expect(EXAM_TERMS).toHaveLength(5);
  });

  test("the print button calls window.print", () => {
    const spy = vi.spyOn(window, "print").mockImplementation(() => {});
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Print" }));
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});
