import { act, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import DefinicionesPage from "@/app/definiciones/page";
import { DEFINITION_GROUPS } from "@/lib/definitions";

// there is no "open all" button: open every term one by one
const openAll = () => {
  for (const b of Array.from(document.querySelectorAll("li button[aria-expanded=false]"))) fireEvent.click(b);
};

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

  test("a term opens and closes", () => {
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

    // there is no open-all / close-all button: the terms are opened one by one
    expect(screen.queryByRole("button", { name: /open all|close all/i })).toBeNull();
    expect(document.querySelectorAll("section > button, main > div > button")).toHaveLength(0);
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
    expect(svg.getAttribute("aria-label")).toMatch(/bending couple/);
    expect(svg.textContent).toMatch(/Pure bending.*Bending and shear/);
    expect(svg.querySelectorAll("path[marker-end]")).toHaveLength(4); // a couple at each face, twice
    expect(svg.querySelectorAll("line[marker-end]")).toHaveLength(2); // Q only in the second segment
    expect(item.querySelectorAll("figure svg")).toHaveLength(1);
    expect(container.querySelectorAll("figure svg")).toHaveLength(41); // 4 bending + 12 stress–strain + 5 buckling + 9 plane areas + 6 shear + 5 state of stress
  });

  test("the bending plane and the oblique bending have their diagrams", () => {
    renderPage();
    openAll();
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
    openAll();
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
    openAll();
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
    openAll();
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
    openAll();
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

  test("every shear-in-bending definition has a diagram: pure shear, Q, Cauchy, sliding stresses and Jourawski", () => {
    renderPage();
    openAll();
    const svg = (id: string) => screen.getByTestId(`def-shr.${id}`).querySelector("figure svg")!;
    for (const id of ["cpuro", "corte", "cauchy", "resbal", "jour"]) expect(svg(id), id).toBeTruthy();
    expect(svg("cpuro").textContent).toMatch(/rivet.*shear plane.*Q = P.*area A of the rivet.*τ = Q \/ A/);
    expect(svg("cpuro").querySelectorAll("line[marker-end]").length).toBeGreaterThanOrEqual(5); // the two P and the uniform τ
    expect(svg("corte").textContent).toMatch(/P.*R.*A–A.*Q.*Q.*Q = R/);
    // Q on the left face points down and on the right face up (equal and opposite)
    const qs = Array.from(svg("corte").querySelectorAll('line[stroke="#0B8A8A"]')).map((l) => Number(l.getAttribute("y2")) - Number(l.getAttribute("y1")));
    expect(qs[0]).toBeGreaterThan(0);
    expect(qs[1]).toBeLessThan(0);
    expect(svg("cauchy").textContent).toMatch(/τyx.*τyx.*τxy.*τxy/);
    expect(svg("cauchy").querySelectorAll("line[marker-end]")).toHaveLength(4);
    expect(svg("resbal").textContent).toMatch(/not joined: they slide.*τL.*joined: τL holds them/);
    expect(svg("resbal").querySelectorAll("path[fill-opacity]")).toHaveLength(6); // three planks, twice
    expect(svg("jour").textContent).toMatch(/E\.N\./);
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

  test("every state-of-stress definition has a diagram: tensor, stress vector, invariants, principal stresses, classification", () => {
    renderPage();
    openAll();
    const svg = (id: string) => screen.getByTestId(`def-tns.${id}`).querySelector("figure svg")!;
    for (const id of ["tensor", "vector", "invariantes", "tppales", "clasif"]) expect(svg(id), id).toBeTruthy();
    // the tensor: the six components on the three visible faces; the principal element: only σ1, σ2, σ3, no τ
    for (const c of ["σx", "σy", "σz", "τxy", "τyx", "τyz", "τzy", "τxz", "τzx"]) expect(svg("tensor").textContent, c).toContain(c);
    // on each face the normal stress and the two shear stresses start at the same point: the centre of the face
    const starts = (sel: string) =>
      Array.from(svg("tensor").querySelectorAll(sel)).map((l) => `${l.getAttribute("x1")},${l.getAttribute("y1")}`);
    const normals = starts('line[marker-end="url(#tns-el-g-n)"]');
    const shears = starts('line[marker-end="url(#tns-el-g-t)"]');
    expect(normals).toHaveLength(3);
    expect(shears).toHaveLength(6);
    for (const c of normals) expect(shears.filter((s) => s === c), c).toHaveLength(2);
    expect(svg("tppales").textContent).toMatch(/σ1/);
    expect(svg("tppales").textContent).not.toMatch(/τ/);
    expect(svg("vector").textContent).toMatch(/ρ/);
    // the invariants figure: Mohr's circle with two diameters sharing the same centre (I1 does not change) and the same radius
    const inv = svg("invariantes");
    expect(inv.textContent).toMatch(/I1 = σx \+ σy.*= σx′ \+ σy′/);
    const diam = Array.from(inv.querySelectorAll("line[stroke-width='3']")).map((l) => ["x1", "y1", "x2", "y2"].map((a) => Number(l.getAttribute(a))));
    expect(diam).toHaveLength(2);
    const mid = (d: number[]) => [(d[0] + d[2]) / 2, (d[1] + d[3]) / 2];
    const len = (d: number[]) => Math.hypot(d[2] - d[0], d[3] - d[1]);
    expect(mid(diam[0])[0]).toBeCloseTo(mid(diam[1])[0], 6);
    expect(mid(diam[0])[1]).toBeCloseTo(mid(diam[1])[1], 6);
    expect(len(diam[0])).toBeCloseTo(len(diam[1]), 6);
    expect(Math.atan2(diam[0][3] - diam[0][1], diam[0][2] - diam[0][0])).not.toBeCloseTo(Math.atan2(diam[1][3] - diam[1][1], diam[1][2] - diam[1][0]), 2); // really turned
    // the classification: three arrows (a cube), four (a square) and two (a bar)
    const cl = screen.getByTestId("def-tns.clasif").querySelector("figure svg")!;
    expect(cl.textContent).toMatch(/Triple.*I3 ≠ 0.*Double.*I3 = 0, I2 ≠ 0.*Simple.*only I1 ≠ 0/);
    expect(cl.querySelectorAll("line[marker-end]")).toHaveLength(3 + 4 + 2);
  });

  test("a malformed fragment (#%, #%E0%A4) is ignored instead of crashing the page", () => {
    for (const bad of ["#%", "#%E0%A4"]) {
      window.location.hash = bad;
      try {
        const { unmount } = renderPage();
        expect(screen.getByTestId("def-pln.steiner")).toBeTruthy();
        expect(document.querySelectorAll("[role=region]:not([hidden])")).toHaveLength(0);
        unmount();
      } finally {
        window.location.hash = "";
      }
    }
  });

  test("a fragment opens its term, the reader can close it, and a new fragment (or coming back to one) shows its target again", () => {
    window.location.hash = "#pln.steiner";
    try {
      renderPage();
      const btn = (id: string) => screen.getByTestId(`def-${id}`).querySelector("button")!;
      const go = (hash: string) =>
        act(() => {
          window.location.hash = hash;
          window.dispatchEvent(new HashChangeEvent("hashchange"));
        });
      expect(btn("pln.steiner").getAttribute("aria-expanded")).toBe("true");
      fireEvent.click(btn("pln.steiner")); // the reader closes it
      expect(btn("pln.steiner").getAttribute("aria-expanded")).toBe("false");
      go("#pln.inercia");
      expect(btn("pln.inercia").getAttribute("aria-expanded")).toBe("true");
      expect(btn("pln.steiner").getAttribute("aria-expanded")).toBe("false");
      go("#pln.steiner"); // coming back to the first one shows it again
      expect(btn("pln.steiner").getAttribute("aria-expanded")).toBe("true");
      expect(btn("pln.inercia").getAttribute("aria-expanded")).toBe("false");
    } finally {
      window.location.hash = "";
    }
  });

  test("bending and shear: the moments of the two faces differ (M and M + dM), in pure bending they are equal", () => {
    renderPage();
    openAll();
    const svg = screen.getByTestId("def-flx.fsimple").querySelector("figure svg")!;
    const ms = Array.from(svg.querySelectorAll("text")).map((t) => t.textContent).filter((t) => t === "M" || t === "M + dM");
    expect(ms).toEqual(["M", "M", "M", "M + dM"]); // pure bending: M, M; with shear: M, M + dM
    expect(screen.getByTestId("def-flx.fsimple").textContent).toMatch(/dM = Q·dx/);
  });

  test("the torsion hypotheses and Jourawski also have their figure (shared with /resumen)", () => {
    renderPage();
    openAll();
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
    expect(screen.getByTestId("def-pln.inercia").textContent).toMatch(/Momento de inercia/);
  });
});
