import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import PropiedadesMaterialesPage from "@/app/propiedades-materiales/page";

describe("/propiedades-materiales", () => {
  test("covers the three phases, the material types and the equivalence equations", () => {
    const { container } = render(
      <LanguageProvider>
        <PropiedadesMaterialesPage />
      </LanguageProvider>,
    );
    for (const k of ["s1", "s2", "s3"]) expect(screen.getByTestId(`mat-phase-${k}`)).toBeTruthy();
    for (const k of ["m1", "m2", "m3"]) expect(screen.getByTestId(`mat-type-${k}`)).toBeTruthy();
    expect(container.querySelectorAll("figure svg")).toHaveLength(2);
    expect(document.body.textContent).toMatch(/σ = E · ε/);
    expect(document.body.textContent).toMatch(/σ_adm|σadm/);
    expect(document.body.textContent).toMatch(/M_T = ∫|MT = ∫/);
    expect(document.body.textContent).not.toMatch(/[A-Za-z]_[A-Za-z0-9]/);
    const subs = Array.from(document.querySelectorAll("sub")).map((e) => e.textContent);
    expect(subs).toEqual(expect.arrayContaining(["adm", "Rot", "xy", "xz"]));
  });
});
