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
    expect(container.querySelectorAll("figure svg")).toHaveLength(32); // 4 bending + 12 stress–strain + 5 buckling + 9 plane areas + 2 (torsion hypotheses, Jourawski)
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

  test("every plane-area definition has a diagram with what it adds up", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Open all" }));
    const svg = (id: string) => screen.getByTestId(`def-pln.${id}`).querySelector("figure svg")!;
    for (const id of ["estatico", "baricentro", "inercia", "centrifugo", "polar", "giro", "steiner", "ppales", "mppales"]) expect(svg(id), id).toBeTruthy();
    expect(svg("estatico").textContent).toMatch(/Sx = ∫ y dA/);
    expect(svg("baricentro").textContent).toMatch(/xg = Sy \/ A.*yg = Sx \/ A/);
    expect(svg("inercia").textContent).toMatch(/Jx = ∫ y² dA/);
    expect(svg("inercia").textContent).toMatch(/far from the axis.*near the axis|near the axis.*far from the axis/);
    expect(svg("centrifugo").textContent).toMatch(/Jxy = ∫ x·y dA/);
    expect(svg("polar").textContent).toMatch(/Jp = Jx \+ Jy/);
    expect(svg("giro").textContent).toMatch(/J = A·i²/);
    expect(svg("steiner").textContent).toMatch(/Jx = Jg \+ A·d²/);
    expect(svg("ppales").textContent).toMatch(/Jxy = 0/);
    expect(svg("mppales").textContent).toMatch(/J1 = Jmax/);
    // the distance i of the radius of gyration is √(Jx / A) of the drawn L (not a made-up value)
    const dashed = svg("giro").querySelector('line[stroke-dasharray="8 4"]')!;
    const i = 160 - Number(dashed.getAttribute("y1"));
    const parts = [[20, 110, 20 + 55 - 0], [70, 20, 30]]; // [b, h, centroid height above the axis] of the two legs
    const heights = [75, 30];
    const J = [[20, 110], [70, 20]].reduce((a, [b, h], k) => a + (b * h ** 3) / 12 + b * h * heights[k] ** 2, 0);
    expect(parts.length).toBe(2);
    expect(i).toBeCloseTo(Math.sqrt(J / 3600), 1);
    // the principal axes of the L: perpendicular, through the centroid, and the product of inertia about them is zero
    const lines = svg("ppales").querySelectorAll('line[stroke="#C0392B"], line[stroke="#0B8A8A"][stroke-width="2.5"]');
    expect(lines).toHaveLength(2);
    const dir = (l: Element) => [Number(l.getAttribute("x2")) - Number(l.getAttribute("x1")), Number(l.getAttribute("y2")) - Number(l.getAttribute("y1"))];
    const [d1, d2] = [dir(lines[0]), dir(lines[1])];
    expect(d1[0] * d2[0] + d1[1] * d2[1]).toBeCloseTo(0, 6);
    // axis 1 (red) is the strong one: it turns less than 90° from x, counter-clockwise on the drawing (up and to the right)
    expect(d1[0]).toBeGreaterThan(0);
    expect(d1[1]).toBeLessThan(0);
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
    // β is the angle between the ε axis and the elastic line: its arc ends on that line (slope 70/40 in the drawing)
    const arc = screen.getByTestId("def-mat.hooke").querySelector('figure svg path[d^="M 80 170 A"]')!.getAttribute("d")!;
    const [ex, ey] = arc.split(" ").slice(-2).map(Number);
    expect((170 - ey) / (ex - 40)).toBeCloseTo(70 / 40, 1);
    expect(Math.hypot(ex - 40, 170 - ey)).toBeCloseTo(40, 0);
    // σFl highlights the yield stretch of the curve itself (a path with the same wiggles), not a straight line over it
    const fl = screen.getByTestId("def-mat.sfl").querySelector("figure svg")!;
    const hi = fl.querySelector('path[stroke="#0B8A8A"]')!;
    expect(hi.getAttribute("d")).toMatch(/^M 112 72 l 8,-4 l 8,5/);
    expect(fl.querySelector('line[stroke="#0B8A8A"]')).toBeNull();
    // ductility is the plastic period: the region under the curve from σE to the rupture (a filled path, no rect)
    const duct = screen.getByTestId("def-mat.ductilidad").querySelector("figure svg")!;
    expect(duct.querySelectorAll("rect")).toHaveLength(0);
    const plastic = duct.querySelectorAll("path[fill]:not([fill=none])");
    expect(plastic).toHaveLength(1);
    expect(plastic[0].getAttribute("d")).toMatch(/^M 96 82 .* L 318 170 L 96 170 Z$/);
    // resilience and toughness are areas: a filled path under the curve
    const fills = (id: string) => screen.getByTestId(`def-mat.${id}`).querySelectorAll("figure svg path[fill]:not([fill=none])").length;
    expect(fills("resiliencia")).toBe(1);
    expect(fills("tenacidad")).toBe(1);
    expect(fills("defelas")).toBe(2);
    expect(fills("rigidez")).toBe(0);
    // the diagram has the better name: stress–strain
    expect(screen.getByTestId("def-mat.hooke").textContent).toMatch(/stress–strain diagram/);
  });

  test("a #group.term in the URL opens that term (the links of /resumen)", () => {
    window.location.hash = "#pln.steiner";
    try {
      renderPage();
      const item = screen.getByTestId("def-pln.steiner");
      expect(item.querySelector("button")!.getAttribute("aria-expanded")).toBe("true");
      expect(item.id).toBe("def-item-pln.steiner");
      expect(screen.getByTestId("def-pln.inercia").querySelector("button")!.getAttribute("aria-expanded")).toBe("false");
      // the user can still close it
      fireEvent.click(item.querySelector("button")!);
      expect(item.querySelector("button")!.getAttribute("aria-expanded")).toBe("false");
    } finally {
      window.location.hash = "";
    }
  });

  test("the torsion hypotheses and Jourawski also have their figure (shared with /resumen)", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Open all" }));
    expect(screen.getByTestId("def-tor.htor").querySelector("figure svg")!.textContent).toMatch(/τmax.*τ = 0/);
    expect(screen.getByTestId("def-shr.jour").querySelector("figure svg")!.textContent).toMatch(/E\.N\..*S.*s.*τmax/);
  });

  // last: toggling to Spanish is persisted for the tests that follow
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
