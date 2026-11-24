import { render } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import PreguntasTeoriaPage from "@/app/preguntas-teoria/page";

describe("/preguntas-teoria", () => {
  test("the illustration is right: rectangle 10 × 4, F1 its left quarter, axis y_G at x = 5", () => {
    // S about x = 5 of a strip [a, b] of height 4: ∫ (x − 5)·4 dx
    const S = (a: number, b: number) => (4 * ((b - 5) ** 2 - (a - 5) ** 2)) / 2;
    const f1 = 4 * 2.5;
    const f2 = 4 * 7.5;
    expect(f2).toBeCloseTo(3 * f1, 9); // F1 = F2 / 3
    expect(S(0, 2.5)).toBeCloseTo(-37.5, 9);
    expect(S(2.5, 10)).toBeCloseTo(37.5, 9);
    expect(S(0, 2.5) + S(2.5, 10)).toBeCloseTo(0, 9);
    expect(f1 * 3.75).toBeCloseTo(37.5, 9); // d1 = 3.75 (centroid of F1 at x = 1.25)
    expect(f2 * 1.25).toBeCloseTo(37.5, 9); // d2 = 1.25 (centroid of F2 at x = 6.25)
  });

  test("renders the question, the answer, the figure and the illustration", () => {
    const { container } = render(
      <LanguageProvider>
        <PreguntasTeoriaPage />
      </LanguageProvider>,
    );
    const text = document.body.textContent!;
    expect(text).toMatch(/static moments of the areas F1 and F2 about the axis yG/);
    expect(text).toMatch(/SyG\(F1\) = −SyG\(F2\)/);
    expect(text).toMatch(/SyG\(F1\) \+ SyG\(F2\) = 0/);
    expect(text).toMatch(/gives no measurements, and none are needed/);
    // the answer comes first, the example that justifies it after
    expect(text.indexOf("equal in absolute value and of opposite sign")).toBeLessThan(text.indexOf("Rectangle of 10 cm"));
    expect(container.querySelectorAll("figure svg")).toHaveLength(1);
    const svg = container.querySelector("figure svg")!;
    expect(svg.textContent).toMatch(/G1.*G2.*yG.*xG.*F1.*F2.*d1.*d2/);
    expect(svg.querySelectorAll("pattern")).toHaveLength(2);
    expect(svg.querySelectorAll("polygon")).toHaveLength(0);
    // the exam's figure: F1 is a quarter of the rectangle, F2 the other three quarters, y_G crosses F2
    const w1 = Number(svg.querySelector('[data-part="F1"]')!.getAttribute("width"));
    const f2 = svg.querySelector('[data-part="F2"]')!;
    const w2 = Number(f2.getAttribute("width"));
    expect(w2).toBeCloseTo(3 * w1, 9);
    const yg = Number(svg.querySelector('line[stroke="#7A2A9A"]')!.getAttribute("x1"));
    expect(yg).toBeGreaterThan(Number(f2.getAttribute("x")));
    expect(yg).toBeLessThan(Number(f2.getAttribute("x")) + w2);
    expect(container.querySelector('[data-testid="qt-ex"]')!.textContent).toMatch(/10 cm²[\s\S]*−37\.5 cm³[\s\S]*30 cm²[\s\S]*\+37\.5 cm³[\s\S]*= 0/);
    expect(container.querySelector('[data-testid="qt-answer"]')!.textContent).toMatch(/opposite sign/);
    expect(container.querySelector('a[href="/definiciones#pln.estatico"]')).toBeTruthy();
  });
});
