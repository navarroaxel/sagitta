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
    expect(container.querySelectorAll("figure svg")).toHaveLength(2);
    expect(screen.getByTestId("shr-rect-example").textContent).toMatch(/7[.,]5 kg\/cm²/);
    expect(document.body.textContent).toMatch(/τ_?m|τm/);
    expect(document.body.textContent).not.toMatch(/[A-Za-z]_[A-Za-z0-9]/);
    expect(Array.from(document.querySelectorAll("sub")).map((e) => e.textContent)).toEqual(
      expect.arrayContaining(["x", "max", "1", "0"]),
    );
  });
});
