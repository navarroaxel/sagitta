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
    expect(container.querySelectorAll("figure svg").length).toBe(2);
    const el = container.querySelectorAll("figure svg")[0];
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
