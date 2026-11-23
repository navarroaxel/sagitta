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
    expect(container.querySelectorAll("figure svg")).toHaveLength(8); // Cauchy element, the 4 steps, Jourawski slice in perspective, rectangle, double T
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

  test("the Jourawski deduction has its four steps drawn: slice with M and Q, linear σ, the cut (Ω and s), the free body with dT", () => {
    render(
      <LanguageProvider>
        <CorteEnFlexionPage />
      </LanguageProvider>,
    );
    const step = (n: number) => screen.getByTestId(`shr-step-${n}`);
    for (const n of [1, 2, 3, 4]) expect(step(n).querySelector("figure svg")).toBeTruthy();
    const text = (n: number) => step(n).querySelector("svg")!.textContent!;
    // 1: both faces, M and Q on 1, M + dM and Q on 2, and the width dx
    expect(text(1)).toMatch(/1.*2/);
    expect(text(1)).toMatch(/M/);
    expect(text(1)).toMatch(/M \+ dM/);
    expect(text(1)).toMatch(/dx/);
    expect(step(1).querySelectorAll("svg path[marker-end]")).toHaveLength(2); // the two couples
    expect(step(1).querySelectorAll("svg line[marker-end]")).toHaveLength(2); // the two Q
    // 2: σ and σ + dσ, the one on face 2 larger (wider polygons)
    expect(text(2)).toMatch(/σ.*σ \+ dσ/);
    const widths = Array.from(step(2).querySelectorAll("svg polygon")).map((p) => {
      const xs = p.getAttribute("points")!.split(" ").map((q) => Number(q.split(",")[0]));
      return Math.max(...xs) - Math.min(...xs);
    });
    expect(widths).toEqual([26, 26, 36, 36]);
    // 3: the part Ω above the cut, the width s and the distance y, in a side view and on the cross-section
    expect(text(3)).toMatch(/Ω/);
    expect(text(3)).toMatch(/s/);
    expect(text(3)).toMatch(/side view.*cross-section/);
    // 4: N, N + dN and dT = dN
    expect(text(4)).toMatch(/N \+ dN/);
    expect(text(4)).toMatch(/dT = τ·s·dx/);
    expect(text(4)).toMatch(/dT = dN/);
    // Ω is above the neutral axis: compression, so N pushes into the face (arrows point to the faces) and dT points the other way
    const arrows = Array.from(step(4).querySelectorAll("svg line[marker-end]")).map((l) => [Number(l.getAttribute("x1")), Number(l.getAttribute("x2"))]);
    expect(arrows[0][1]).toBeGreaterThan(arrows[0][0]); // N on face 1 pushes right, into the slice
    expect(arrows[1][1]).toBeLessThan(arrows[1][0]); // N + dN on face 2 pushes left, into the slice
    expect(arrows[2][1]).toBeGreaterThan(arrows[2][0]); // dT on the cut points right: dT = dN balances the net (leftwards) push
    expect(document.body.textContent).not.toMatch(/[{}]/);
  });
});
