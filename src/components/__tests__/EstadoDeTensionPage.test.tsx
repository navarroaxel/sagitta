import { fireEvent, render, screen } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import EstadoDeTensionPage from "@/app/estado-de-tension/page";

const renderPage = () =>
  render(
    <LanguageProvider>
      <EstadoDeTensionPage />
    </LanguageProvider>,
  );

describe("/estado-de-tension", () => {
  test("shows the professor's tensor, invariants, plane and principal values", () => {
    renderPage();
    expect(screen.getAllByTestId("tensor-matrix")).toHaveLength(2);
    expect(screen.getByTestId("tns-invariants").textContent).toMatch(/−725.*−750/);
    expect(screen.getByTestId("tns-plane").textContent).toMatch(/20\.21.*11\.04.*16\.93/);
    expect(screen.getByTestId("tns-principal").textContent).toMatch(/31\.9542.*1\.02156.*−22\.97576/);
    expect(screen.getByTestId("tns-dir-3").textContent).toMatch(/0\.961/);
    expect(document.body.textContent).not.toMatch(/[A-Za-z]_[A-Za-z0-9]/);
  });

  test("the calculator reproduces the exercise from the tensor", () => {
    renderPage();
    expect(screen.getByTestId("stress-inv").textContent).toMatch(/I1 = 10\s+I2 = -725\s+I3 = -750/);
    expect(screen.getByTestId("stress-plane").textContent).toMatch(/20\.20\d\d/);
    const principal = screen.getByTestId("stress-principal").textContent!;
    expect(principal).toMatch(/σ1 = 31\.9542/);
    expect(principal).toMatch(/σ3 = -22\.9758/);
  });

  test("a plane state is classified as double", () => {
    renderPage();
    fireEvent.change(screen.getByLabelText("σz"), { target: { value: "0" } });
    fireEvent.change(screen.getByLabelText("τxz"), { target: { value: "0" } });
    fireEvent.change(screen.getByLabelText("τyz"), { target: { value: "0" } });
    expect(screen.getByTestId("stress-calc").textContent).toMatch(/double \(plane\)/);
  });
});
