import { fireEvent, render, screen } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { TubeExplorer } from "../TubeExplorer";

const setup = (kind: "CHS" | "SHS") =>
  render(
    <LanguageProvider>
      <TubeExplorer kind={kind} />
    </LanguageProvider>,
  );

const rowNames = () =>
  screen
    .getAllByRole("row")
    .slice(1)
    .map((r) => r.querySelector("th")?.textContent);

describe("TubeExplorer", () => {
  test("circular list and search", () => {
    setup("CHS");
    expect(rowNames()[0]).toBe("Ø12.7×0.7");
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "168 6.35" },
    });
    expect(rowNames()).toEqual(["Ø168.3×6.35"]);
  });

  test("square list only has square tubes", () => {
    setup("SHS");
    expect(rowNames().every((n) => n?.startsWith("□"))).toBe(true);
  });

  test("detail draws the marks and the legend", () => {
    setup("SHS");
    fireEvent.click(screen.getByText("□100×4.76"));
    const svg = screen.getByRole("img", { name: "□100×4.76" });
    for (const m of ["B = 100", "t = 4.76", "R = 9.52", "X-X", "Y-Y"]) {
      expect(svg.textContent).toContain(m);
    }
    expect(
      screen.getByRole("group", { name: /leyenda|legend/i }).textContent,
    ).toMatch(/2[.,]00 t/);
  });
});
