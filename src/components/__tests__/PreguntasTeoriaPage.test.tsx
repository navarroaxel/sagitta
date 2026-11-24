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
  test("the rectangle of the exam: halves of 20 cm², d = 2.5 cm, S = ∓50 cm³", () => {
    // rectangle 10 × 4, axis at x = 5: S = ∫ (x − 5)·4 dx on each half
    const half = (a: number, b: number) => 4 * ((b - 5) ** 2 - (a - 5) ** 2) / 2;
    expect(half(0, 5)).toBeCloseTo(-50, 9);
    expect(half(5, 10)).toBeCloseTo(50, 9);
    expect(20 * 2.5).toBeCloseTo(50, 9);
  });

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
    expect(container.querySelectorAll("figure svg")).toHaveLength(2);
    for (const svg of Array.from(container.querySelectorAll("figure svg"))) expect(svg.textContent).toMatch(/yG.*xG.*F1.*F2.*d1.*d2/);
    // the exam's figure: a rectangle, two hatched halves
    const rect = container.querySelectorAll("figure svg")[0];
    expect(rect.querySelectorAll("pattern")).toHaveLength(2);
    expect(rect.querySelectorAll("polygon")).toHaveLength(0);
    expect(container.querySelector('[data-testid="qt-ex"]')!.textContent).toMatch(/20 cm²[\s\S]*−50 cm³, S2 = \+50 cm³[\s\S]*= 0/);
    expect(container.querySelector('[data-testid="qt-ex2"]')!.textContent).toMatch(/15 cm²[\s\S]*−24 cm³[\s\S]*12 cm²[\s\S]*\+24 cm³[\s\S]*= 0/);
    expect(container.querySelector('[data-testid="qt-answer"]')!.textContent).toMatch(/opposite sign/);
    expect(container.querySelector('a[href="/definiciones#pln.estatico"]')).toBeTruthy();
  });
});
