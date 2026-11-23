import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import DefinicionesPage from "@/app/definiciones/page";
import { DEFINITION_GROUPS } from "@/lib/definitions";

const renderPage = () =>
  render(
    <LanguageProvider>
      <DefinicionesPage />
    </LanguageProvider>,
  );

describe("/definiciones", () => {
  test("every group and term is there, closed at the start", () => {
    renderPage();
    const total = DEFINITION_GROUPS.reduce((n, g) => n + g.terms.length, 0);
    expect(total).toBeGreaterThanOrEqual(50);
    for (const g of DEFINITION_GROUPS) {
      expect(screen.getByTestId(`def-group-${g.id}`)).toBeTruthy();
      for (const t of g.terms) {
        const item = screen.getByTestId(`def-${g.id}.${t}`);
        expect(item.querySelector("button")!.getAttribute("aria-expanded")).toBe("false");
        expect(item.querySelector("[role=region]")!.hasAttribute("hidden")).toBe(true);
      }
    }
  });

  test("a term opens and closes, and open / close all work", () => {
    renderPage();
    const steiner = screen.getByTestId("def-pln.steiner");
    const button = steiner.querySelector("button")!;
    fireEvent.click(button);
    expect(button.getAttribute("aria-expanded")).toBe("true");
    const panel = steiner.querySelector("[role=region]")!;
    expect(panel.hasAttribute("hidden")).toBe(false);
    expect(panel.textContent).toMatch(/Jg \+ A·d²/);
    fireEvent.click(button);
    expect(button.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(screen.getByRole("button", { name: "Open all" }));
    expect(document.querySelectorAll("[role=region][hidden]")).toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: "Close all" }));
    expect(document.querySelectorAll("[role=region]:not([hidden])")).toHaveLength(0);
  });

  test("each group links to its guide and the key definitions carry the notes' formulas", () => {
    renderPage();
    const hrefs = Array.from(document.querySelectorAll("section a")).map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual(DEFINITION_GROUPS.map((g) => g.href));
    const text = (id: string) => screen.getByTestId(`def-${id}`).textContent!;
    expect(text("pln.estatico")).toMatch(/Sx = ∫ y dA/);
    expect(text("pln.giro")).toMatch(/J = A·i²/);
    expect(text("shr.jour")).toMatch(/τm = Q·Sx \/ \(Jx·s\)/);
    expect(text("pnd.equil")).toMatch(/F < Fk.*F = Fk.*F > Fk/);
    expect(text("mat.resiliencia")).toMatch(/U = ½·σe² \/ E/);
    expect(document.body.textContent).not.toMatch(/[A-Za-z]_[A-Za-z0-9]/);
  });

  test("in Spanish the terms are translated too", () => {
    function Es({ children }: { children: React.ReactNode }) {
      const { language, toggle } = useLanguage();
      React.useEffect(() => {
        if (language !== "es") toggle();
      }, [language, toggle]);
      return <>{children}</>;
    }
    render(
      <LanguageProvider>
        <Es>
          <DefinicionesPage />
        </Es>
      </LanguageProvider>,
    );
    expect(screen.getByTestId("def-pln.estatico").textContent).toMatch(/Momento estático/);
    expect(screen.getByRole("button", { name: "Abrir todas" })).toBeTruthy();
  });
});
