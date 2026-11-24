import { render } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import AxilPage from "@/app/axil/page";

describe("/axil", () => {
  test("renders the formulas, the figure and the three exercises", () => {
    const { container } = render(
      <LanguageProvider>
        <AxilPage />
      </LanguageProvider>,
    );
    expect(container.querySelectorAll("figure svg").length).toBe(4); // Saint-Venant, the element, the section, the bar
    expect(container.querySelectorAll("figure svg")[0].textContent).toMatch(/σ not uniform.*σ = N \/ A/);
    const sec = container.querySelectorAll("figure svg")[2];
    expect(sec.textContent).toMatch(/τxy = 0.*τxz = 0/);
    // every figure of the guide names its axes: x along the bar (or out of the page in the section view), y, z
    for (const f of Array.from(container.querySelectorAll("figure svg"))) expect(f.querySelector('[data-testid="axes"]'), f.getAttribute("aria-label") ?? "").toBeTruthy();
    expect(container.querySelectorAll("figure svg")[2].querySelector('[data-testid="axes"]')!.textContent).toBe("yzx");
    expect(container.querySelectorAll("figure svg")[3].querySelector('[data-testid="axes"]')!.textContent).toBe("xzy");
    // …and the triad is not clipped by the viewBox (arrow tips, letters)
    for (const f of Array.from(container.querySelectorAll("figure svg"))) {
      const [, , W, H] = f.getAttribute("viewBox")!.split(" ").map(Number);
      const c = f.querySelector('[data-testid="axes"] circle')!;
      const ox = Number(c.getAttribute("cx"));
      const oy = Number(c.getAttribute("cy"));
      expect(ox - 16, "left").toBeGreaterThanOrEqual(0);
      expect(ox + 28 + 18, "right").toBeLessThanOrEqual(W);
      expect(oy - 28 - 8, "top").toBeGreaterThanOrEqual(0);
      expect(oy + 20, "bottom").toBeLessThanOrEqual(H);
    }
    const el = container.querySelectorAll("figure svg")[1];
    expect(el.textContent).toMatch(/γ = 0.*τ = 0.*γ ≠ 0.*τ ≠ 0/);
    expect(document.body.textContent).toMatch(/Δl = N·l \/ \(A·E\)/);
    expect(container.querySelector('[data-testid="axl-e1"]')?.textContent).toMatch(/1\.066/);
    expect(container.querySelector('[data-testid="axl-e2"]')?.textContent).toMatch(/1 256\.6/);
    expect(container.querySelector('[data-testid="axl-e3"]')?.textContent).toMatch(/4 202/);
    expect(Array.from(document.querySelectorAll("sub")).map((e) => e.textContent)).toEqual(
      expect.arrayContaining(["adm", "nec"]),
    );
    expect(document.body.textContent).not.toMatch(/[A-Za-z]_[A-Za-z]/);
  });
});
