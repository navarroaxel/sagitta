import { render } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import FlexionPage from "@/app/flexion/page";

describe("/flexion", () => {
  test("renders the derivation with real subscripts and the figures", () => {
    const { container } = render(
      <LanguageProvider>
        <FlexionPage />
      </LanguageProvider>,
    );
    expect(container.querySelectorAll("figure svg").length).toBeGreaterThanOrEqual(2);
    expect(document.body.textContent).toMatch(/σ = M·y/);
    const subs = Array.from(document.querySelectorAll("sub")).map((e) => e.textContent);
    expect(subs).toEqual(expect.arrayContaining(["x", "adm", "nec"]));
    // no raw "_x" left in the visible text
    expect(document.body.textContent).not.toMatch(/[A-Za-z]_[a-z]/);
  });
});

describe("/flexion figures", () => {
  test("the stress diagram is zero at the neutral axis and largest at the outer fibres", () => {
    const { container } = render(
      <LanguageProvider>
        <FlexionPage />
      </LanguageProvider>,
    );
    const polys = Array.from(container.querySelectorAll("polygon")).filter((p) => p.getAttribute("points")?.startsWith("120,90"));
    expect(polys).toHaveLength(2);
    // vertices: neutral axis (120,90) first, then the outer fibre level (y = 20 / 160) at x = 120 and the wide tip
    for (const p of polys) {
      const pts = p.getAttribute("points")!.split(" ").map((v) => v.split(",").map(Number));
      expect(pts[0]).toEqual([120, 90]);
      expect([20, 160]).toContain(pts[1][1]);
      expect(pts[2][1]).toBe(pts[1][1]);
    }
  });

  test("the bending figure labels the neutral axis through the translation", () => {
    const { container } = render(
      <LanguageProvider>
        <FlexionPage />
      </LanguageProvider>,
    );
    expect(container.textContent).toMatch(/N\.A\./);
  });
});
