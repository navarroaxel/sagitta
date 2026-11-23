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

  test("simple bending keeps the notes' wording and carries a figure of pure bending and of bending with shear", () => {
    const { container } = renderPage();
    const item = screen.getByTestId("def-flx.fsimple");
    fireEvent.click(item.querySelector("button")!);
    expect(item.textContent).toMatch(/two couples normal to the plane of the section/);
    const svg = item.querySelector("figure svg")!;
    expect(svg.getAttribute("aria-label")).toMatch(/bending couple M/);
    expect(svg.textContent).toMatch(/Pure bending.*Bending and shear/);
    expect(svg.querySelectorAll("path[marker-end]")).toHaveLength(4); // a couple at each face, twice
    expect(svg.querySelectorAll("line[marker-end]")).toHaveLength(2); // Q only in the second segment
    expect(item.querySelectorAll("figure svg")).toHaveLength(1);
    expect(container.querySelectorAll("figure svg")).toHaveLength(21); // 4 bending (simple, plane, oblique, neutral axis) + 12 stress–strain + 5 buckling
  });

  test("the bending plane and the oblique bending have their diagrams", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Open all" }));
    const plane = screen.getByTestId("def-flx.plano").querySelector("figure svg")!;
    expect(plane.textContent).toMatch(/Bending plane/);
    expect(plane.textContent).toMatch(/the plane of the drawing/);
    expect(plane.textContent).toMatch(/Section A–A/);
    expect(plane.textContent).toMatch(/Line of forces/);
    expect(plane.querySelectorAll("rect")).toHaveLength(3); // the plane, the beam seen from the side, the section
    expect(plane.querySelectorAll('line[stroke="#C0392B"]').length).toBeGreaterThanOrEqual(3); // load, trace in the cut, line of forces
    const obl = screen.getByTestId("def-flx.normal").querySelector("figure svg")!;
    expect(obl.textContent).toMatch(/Normal \(straight\) bending.*Oblique bending/);
    expect(obl.textContent).toMatch(/α/);
    expect(obl.querySelectorAll("rect")).toHaveLength(2); // the section, drawn twice
    expect(document.body.textContent).not.toMatch(/[{}]/);
  });

  test("the neutral axis has its diagram: the bent segment and the linear σ with zero on the axis", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Open all" }));
    const svg = screen.getByTestId("def-flx.en").querySelector("figure svg")!;
    expect(svg.textContent).toMatch(/shortens.*lengthens/);
    expect(svg.textContent).toMatch(/Compression/);
    expect(svg.textContent).toMatch(/Tension/);
    expect(svg.textContent).toMatch(/σ = 0/);
    expect((svg.textContent!.match(/N\.A\./g) ?? []).length).toBe(2); // on the bent segment and on the section
    expect(svg.querySelectorAll("polygon")).toHaveLength(2); // σ: compression above, tension below
  });

  test("the buckling definitions have their diagrams: bars, bifurcation, hyperbola, end conditions, ideal bar", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Open all" }));
    const svg = (id: string) => screen.getByTestId(`def-pnd.${id}`).querySelector("figure svg")!;
    expect(svg("equil").textContent).toMatch(/Stable.*Indifferent.*Unstable/);
    expect(svg("equil").textContent).toMatch(/F < Fk.*F = Fk.*F > Fk/);
    expect(svg("equil").textContent).toMatch(/goes back to straight.*stays deviated.*keeps deforming/);
    expect(svg("fk").textContent).toMatch(/Fk/);
    expect(svg("fk").textContent).toMatch(/Stable.*Unstable|Unstable.*Stable/);
    expect(svg("esbeltez").textContent).toMatch(/σk = π²·E \/ λ²/);
    expect(svg("l0").textContent).toMatch(/c = 2.*c = 1.*c = 0\.7.*c = 0\.5/);
    expect(svg("l0").querySelectorAll("path[stroke='#7A2A9A']")).toHaveLength(4); // one buckled shape per end condition
    expect(svg("hipotesis").textContent).toMatch(/axis of the bar.*pinned.*no lateral forces/);
    expect(document.body.textContent).not.toMatch(/[{}]/);
  });

  test("the material definitions show the stress–strain diagram with the thing they define highlighted", () => {
    renderPage();
    const ids = ["hooke", "rigidez", "sp", "se", "sfl", "srot", "seguridad", "defelas", "ductilidad", "resiliencia", "tenacidad", "tipos"];
    fireEvent.click(screen.getByRole("button", { name: "Open all" }));
    for (const id of ids) {
      const svg = screen.getByTestId(`def-mat.${id}`).querySelector("figure svg");
      expect(svg, id).toBeTruthy();
      expect(svg!.getAttribute("aria-label")).toBeTruthy();
      expect(svg!.getAttribute("aria-label")).not.toMatch(/[{}_]/);
    }
    const text = (id: string) => screen.getByTestId(`def-mat.${id}`).querySelector("figure svg")!.textContent!;
    expect(text("sp")).toMatch(/σP/);
    expect(text("srot")).toMatch(/σRot/);
    expect(text("seguridad")).toMatch(/σadm = σE \/ ν/);
    expect(text("seguridad")).toMatch(/σP/); // σP stays marked: the working stress sits on the proportional line
    expect(screen.getByTestId("def-mat.seguridad").querySelectorAll('figure svg line[stroke="#0B8A8A"][stroke-width="4.5"]')).toHaveLength(1);
    expect(text("resiliencia")).toMatch(/U = ½·σe² \/ E/);
    expect(text("tipos")).toMatch(/Brittle.*Ductile|Ductile.*Brittle/);
    expect(text("defelas")).toMatch(/permanent strain/);
    // σE keeps the proportional line (teal, up to σP) marked, to see where proportionality is lost
    const se = screen.getByTestId("def-mat.se").querySelector("figure svg")!;
    expect(se.textContent).toMatch(/σP.*σE|σE.*σP/);
    expect(se.querySelectorAll('line[stroke="#0B8A8A"][stroke-width="4.5"]')).toHaveLength(1);
    expect(screen.getByTestId("def-mat.se").textContent).toMatch(/proportionality is lost/);
    // σFl highlights the yield stretch of the curve itself (a path with the same wiggles), not a straight line over it
    const fl = screen.getByTestId("def-mat.sfl").querySelector("figure svg")!;
    const hi = fl.querySelector('path[stroke="#0B8A8A"]')!;
    expect(hi.getAttribute("d")).toMatch(/^M 112 72 l 8,-4 l 8,5/);
    expect(fl.querySelector('line[stroke="#0B8A8A"]')).toBeNull();
    // ductility is an interval of strain: a band over ε (a rect), no filled area under the curve
    const duct = screen.getByTestId("def-mat.ductilidad").querySelector("figure svg")!;
    expect(duct.querySelectorAll("rect")).toHaveLength(1);
    expect(duct.querySelectorAll("path[fill]:not([fill=none])")).toHaveLength(0);
    // resilience and toughness are areas: a filled path under the curve
    const fills = (id: string) => screen.getByTestId(`def-mat.${id}`).querySelectorAll("figure svg path[fill]:not([fill=none])").length;
    expect(fills("resiliencia")).toBe(1);
    expect(fills("tenacidad")).toBe(1);
    expect(fills("defelas")).toBe(2);
    expect(fills("rigidez")).toBe(0);
    // the diagram has the better name: stress–strain
    expect(screen.getByTestId("def-mat.hooke").textContent).toMatch(/stress–strain diagram/);
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
