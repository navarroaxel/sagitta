import { fireEvent, render, screen } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import SuperficiesPlanasPage from "@/app/superficies-planas/page";

const renderPage = () =>
  render(
    <LanguageProvider>
      <SuperficiesPlanasPage />
    </LanguageProvider>,
  );

describe("/superficies-planas", () => {
  test("has the Steiner statement, its use and the worked examples, without raw underscores", () => {
    const { container } = renderPage();
    expect(screen.getByTestId("pln-steiner-use").textContent).toMatch(/Steiner|parallel/);
    expect(document.body.textContent).toMatch(/J_?x\s*=\s*J_?xg\s*\+\s*A·b²|Jxg/);
    expect(screen.getByTestId("pln-ex1").textContent).toMatch(/768/);
    expect(screen.getByTestId("pln-ex2").textContent).toMatch(/63\.33/);
    expect(screen.getByTestId("pln-ex3").textContent).toMatch(/5\.62/);
    expect(screen.getByTestId("pln-add").textContent).toMatch(/131\.55/);
    expect(screen.getByTestId("pln-sub").textContent).toMatch(/131\.55/);
    expect(container.querySelectorAll("figure svg")).toHaveLength(1);
    expect(document.body.textContent).not.toMatch(/[A-Za-z]_[A-Za-z0-9]/);
    expect(Array.from(document.querySelectorAll("sub")).map((e) => e.textContent)).toEqual(
      expect.arrayContaining(["x", "g", "xg", "xy", "1"]),
    );
  });

  test("the Steiner calculator gives b·h³/3 about the base (d = h/2) and follows the inputs", () => {
    renderPage();
    // defaults: 8 × 16, d = 8 → Jg = 2730.67, A·d² = 8192, J = 10922.67 = 8·16³/3
    expect(screen.getByTestId("steiner-result").textContent).toMatch(/2 730\.67/);
    expect(screen.getByTestId("steiner-result").textContent).toMatch(/10 922\.67/);
    fireEvent.change(screen.getByLabelText("d (cm)"), { target: { value: "0" } });
    expect(screen.getByTestId("steiner-result").textContent).toMatch(/2 730\.67 cm⁴.*128\.00 cm².*0\.00 cm⁴.*2 730\.67 cm⁴/);
    fireEvent.change(screen.getByLabelText("b (cm)"), { target: { value: "-1" } });
    expect(screen.getByTestId("steiner-result").textContent).toMatch(/—/);
  });
});
