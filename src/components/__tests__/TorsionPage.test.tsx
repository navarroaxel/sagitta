import { render } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import TorsionPage from "@/app/torsion/page";

describe("/torsion", () => {
  test("renders the formulas, figures and the recomputed examples", () => {
    const { container } = render(
      <LanguageProvider>
        <TorsionPage />
      </LanguageProvider>,
    );
    expect(container.querySelectorAll("figure svg").length).toBe(2);
    expect(document.body.textContent).toMatch(/τ = M.*ρ/);
    expect(container.querySelector('[data-testid="tor-e1"]')?.textContent).toMatch(/472/);
    expect(container.querySelector('[data-testid="tor-e2"]')?.textContent).toMatch(/D = 8 cm/);
    expect(Array.from(document.querySelectorAll("sub")).map((e) => e.textContent)).toEqual(
      expect.arrayContaining(["t", "max", "0"]),
    );
    expect(document.body.textContent).not.toMatch(/[A-Za-z]_[A-Za-z0-9]/);
  });
});
