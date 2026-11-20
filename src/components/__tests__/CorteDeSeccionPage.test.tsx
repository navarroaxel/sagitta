import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import CorteDeSeccionPage from "@/app/corte-de-seccion/page";

describe("/corte-de-seccion", () => {
  test("step 1 has the figure with the two parts, and the local triad is explained in step 2", () => {
    render(
      <LanguageProvider>
        <CorteDeSeccionPage />
      </LanguageProvider>,
    );
    const fig = screen.getByTestId("cut-parts-figure");
    expect(fig.textContent).toMatch(/z = 0/);
    expect(fig.querySelectorAll("text").length).toBeGreaterThan(5);
    expect(document.body.textContent).toMatch(/local triad|terna local/);
    expect(screen.getByTestId("cut-main")).toBeTruthy(); // the simulator is on the page
    // step 3: both orientations of the profile, with their inertias
    const faces = screen.getByTestId("cut-faces-figure");
    expect(faces.querySelectorAll("svg")).toHaveLength(2);
    expect(faces.textContent).toContain("Ix = 864");
    expect(faces.textContent).toContain("Ix = 318");
    expect(document.body.textContent).not.toMatch(/σ_|\|_/); // σ_max / σ_min are rendered as real subscripts
    expect(document.querySelectorAll("sub").length).toBeGreaterThan(2);
    expect(screen.getByTestId("cut-resultant-figure").querySelectorAll("tspan").length).toBeGreaterThanOrEqual(2);
    // step 8: the resultant diagram with both ordinates
    const res = screen.getByTestId("cut-resultant-figure");
    expect(res.textContent).toMatch(/1173\.\d/);
    expect(res.textContent).toMatch(/1208\.\d/);
    expect(res.querySelectorAll("polygon").length).toBeGreaterThanOrEqual(3); // section + two triangles
  });
});
