import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import CorteEnFlexionPage from "@/app/corte-en-flexion/page";

describe("/corte-en-flexion", () => {
  test("renders both profiles, the example and real subscripts", () => {
    const { container } = render(
      <LanguageProvider>
        <CorteEnFlexionPage />
      </LanguageProvider>,
    );
    expect(container.querySelectorAll("figure svg")).toHaveLength(4); // Cauchy element, Jourawski slice, rectangle, double T
    expect(screen.getByTestId("shr-rect-example").textContent).toMatch(/7[.,]5 kg\/cm²/);
    expect(document.body.textContent).toMatch(/τ_?m|τm/);
    expect(document.body.textContent).not.toMatch(/[A-Za-z]_[A-Za-z0-9]/);
    expect(Array.from(document.querySelectorAll("sub")).map((e) => e.textContent)).toEqual(
      expect.arrayContaining(["x", "max", "1", "0"]),
    );
  });

  test("the double-T figure steps at the web–flange junction (two points at the same height, different width)", () => {
    const { container } = render(
      <LanguageProvider>
        <CorteEnFlexionPage />
      </LanguageProvider>,
    );
    const poly = Array.from(container.querySelectorAll("figure polygon")).at(-1)!; // the double-T is the last figure
    const pts = poly.getAttribute("points")!.split(" ").map((p) => p.split(",").map(Number));
    const byY = new Map<number, number[]>();
    for (const [x, y] of pts) byY.set(y, [...(byY.get(y) ?? []), x]);
    const steps = [...byY.values()].filter((xs) => xs.length >= 2 && Math.max(...xs) - Math.min(...xs) > 20);
    expect(steps.length).toBeGreaterThanOrEqual(2); // top and bottom junctions
  });
  test("figure labels use real SVG subscripts", () => {
    const { container } = render(
      <LanguageProvider>
        <CorteEnFlexionPage />
      </LanguageProvider>,
    );
    expect(container.querySelectorAll("figure svg sub")).toHaveLength(0);
    expect(container.querySelectorAll("figure svg tspan").length).toBeGreaterThanOrEqual(2);
  });
});
