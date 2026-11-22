import { fireEvent, render, screen } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import PandeoPage from "@/app/pandeo/page";

const renderPage = () =>
  render(
    <LanguageProvider>
      <PandeoPage />
    </LanguageProvider>,
  );

describe("/pandeo", () => {
  test("defines the three equilibria, the four end conditions and the notes' exercises", () => {
    const { container } = renderPage();
    expect(screen.getByTestId("pnd-c1").textContent).toMatch(/stable/);
    expect(screen.getByTestId("pnd-c2").textContent).toMatch(/indifferent/);
    expect(screen.getByTestId("pnd-c3").textContent).toMatch(/unstable/);
    for (const id of ["cantilever", "pinned", "fixed-pinned", "fixed-fixed"]) expect(screen.getByTestId(`pnd-end-${id}`)).toBeTruthy();
    expect(screen.getByTestId("pnd-e1").textContent).toMatch(/516 kg.*2 064 kg/);
    expect(screen.getByTestId("pnd-e2").textContent).toMatch(/7 994 kg.*31 978 kg/);
    expect(screen.getByTestId("pnd-e3").textContent).toMatch(/218 596 kg.*632 cm/);
    expect(screen.getByTestId("pnd-e4").textContent).toMatch(/744\.34 cm = 7\.44 m/);
    expect(container.querySelectorAll("figure svg")).toHaveLength(1);
    expect(document.body.textContent).not.toMatch(/[A-Za-z]_[A-Za-z0-9]/);
  });

  test("the calculator reproduces the 15 × 24 exercise and flips with the load", () => {
    renderPage();
    // defaults: E 2.1e6, Jmin 6750, A 360, l 800, c 1, F 350 000 → Fk 218 596 kg, unstable
    expect(screen.getByTestId("pandeo-result").textContent).toMatch(/218 596 kg/);
    expect(screen.getByTestId("pandeo-state").textContent).toMatch(/unstable/);
    fireEvent.change(screen.getByLabelText("F (kg)"), { target: { value: "100000" } });
    expect(screen.getByTestId("pandeo-state").textContent).toBe("stable");
    fireEvent.change(screen.getByLabelText("l (cm)"), { target: { value: "-1" } });
    expect(screen.getByTestId("pandeo-result").textContent).toMatch(/—/);
  });
});
