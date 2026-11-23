import { render } from "@testing-library/react";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import { Sub, SvgSub, plain } from "@/components/Sub";
import FlexionPage from "@/app/flexion/page";
import TorsionPage from "@/app/torsion/page";
import AxilPage from "@/app/axil/page";
import FlechaPage from "@/app/flecha/page";
import CortePage from "@/app/corte-en-flexion/page";
import PlanasPage from "@/app/superficies-planas/page";
import PandeoPage from "@/app/pandeo/page";
import TensionPage from "@/app/estado-de-tension/page";
import MaterialesPage from "@/app/propiedades-materiales/page";
import ResumenPage from "@/app/resumen/page";
import React from "react";

const PAGES: [string, React.ComponentType][] = [
  ["flexion", FlexionPage],
  ["torsion", TorsionPage],
  ["axil", AxilPage],
  ["flecha", FlechaPage],
  ["corte-en-flexion", CortePage],
  ["superficies-planas", PlanasPage],
  ["pandeo", PandeoPage],
  ["estado-de-tension", TensionPage],
  ["propiedades-materiales", MaterialesPage],
  ["resumen", ResumenPage],
];

// Starts in English; one toggle switches to Spanish.
function Es({ children }: { children: React.ReactNode }) {
  const { language, toggle } = useLanguage();
  React.useEffect(() => {
    if (language !== "es") toggle();
  }, [language, toggle]);
  return <>{children}</>;
}

describe("math variables in italic", () => {
  test("{y} renders an italic y, _x a subscript, and plain() strips the marks", () => {
    const { container } = render(<Sub>{"σ = M·{y}/J_x, a distancia {y} del eje"}</Sub>);
    expect(Array.from(container.querySelectorAll("i")).map((e) => e.textContent)).toEqual(["y", "y"]);
    expect(container.querySelector("sub")!.textContent).toBe("x");
    expect(container.textContent).toBe("σ = M·y/Jx, a distancia y del eje");
    expect(plain("a {y} b")).toBe("a y b");
  });

  test("SvgSub italicises the variable and lowers the text after a subscript", () => {
    const { container } = render(
      <svg>
        <text>
          <SvgSub>{"{x}_g = 1"}</SvgSub>
        </text>
      </svg>,
    );
    const tspans = container.querySelectorAll("tspan");
    expect(tspans[0].getAttribute("font-style")).toBe("italic");
    expect(tspans[1].textContent).toBe("g");
    expect(tspans[2].getAttribute("dy")).toBe("-0.3em");
  });

  test.each(PAGES)("/%s shows no raw braces and has italic variables", (_name, Page) => {
    const { container } = render(
      <LanguageProvider>
        <Es>
          <Page />
        </Es>
      </LanguageProvider>,
    );
    expect(document.body.textContent).not.toMatch(/[{}]/);
    const labels = Array.from(container.querySelectorAll("[aria-label]")).map((e) => e.getAttribute("aria-label")!);
    for (const l of labels) expect(l).not.toMatch(/[{}]/);
    if (!["axil", "torsion", "pandeo"].includes(_name)) expect(container.querySelectorAll("i").length).toBeGreaterThan(0);
  });
});
