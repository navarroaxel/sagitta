import { render } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import PreguntasTeoriaPage from "@/app/preguntas-teoria/page";

// Right triangle, legs 9 (x) and 6 (y), x measured from the vertical leg; its centroid is at x = 3.
// Midpoint rule over the strip x in [a, b], measured from the axis x = 3.
function moment(a: number, b: number) {
  const n = 20000;
  const dx = (b - a) / n;
  let area = 0;
  let s = 0;
  for (let i = 0; i < n; i++) {
    const x = a + (i + 0.5) * dx;
    const h = 6 * (1 - x / 9);
    area += h * dx;
    s += (x - 3) * h * dx;
  }
  return { area, s };
}

describe("/preguntas-teoria", () => {
  test("the example's numbers are right: S(F1) = −S(F2), F1·d1 = F2·d2", () => {
    const f1 = moment(0, 3);
    const f2 = moment(3, 9);
    expect(f1.area).toBeCloseTo(15, 3);
    expect(f2.area).toBeCloseTo(12, 3);
    expect(f1.s).toBeCloseTo(-24, 3);
    expect(f2.s).toBeCloseTo(24, 3);
    expect(f1.s + f2.s).toBeCloseTo(0, 6);
    expect(f1.area * 1.6).toBeCloseTo(24, 3);
    expect(f2.area * 2).toBeCloseTo(24, 3);
  });

  test("renders the question, the answer, the figure and the example", () => {
    const { container } = render(
      <LanguageProvider>
        <PreguntasTeoriaPage />
      </LanguageProvider>,
    );
    const text = document.body.textContent!;
    expect(text).toMatch(/static moments of the areas F1 and F2 about the axis yG/);
    expect(text).toMatch(/SyG\(F1\) = −SyG\(F2\)/);
    expect(text).toMatch(/SyG\(F1\) \+ SyG\(F2\) = 0/);
    expect(container.querySelectorAll("figure svg")).toHaveLength(1);
    const svg = container.querySelector("figure svg")!;
    expect(svg.textContent).toMatch(/yG.*xG.*F1.*F2.*d1.*d2/);
    expect(container.querySelector('[data-testid="qt-ex"]')!.textContent).toMatch(/15 cm²[\s\S]*−24 cm³[\s\S]*12 cm²[\s\S]*\+24 cm³[\s\S]*= 0/);
    expect(container.querySelector('[data-testid="qt-answer"]')!.textContent).toMatch(/opposite sign/);
    expect(container.querySelector('a[href="/definiciones#pln.estatico"]')).toBeTruthy();
  });
});
