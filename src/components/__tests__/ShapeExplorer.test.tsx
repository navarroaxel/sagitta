import { fireEvent, render, screen } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ShapeExplorer } from "../ShapeExplorer";
import { SHAPES } from "@/lib/basicShapes";
import PerfilesPage from "@/app/perfiles/page";

const setup = () =>
  render(
    <LanguageProvider>
      <ShapeExplorer />
    </LanguageProvider>,
  );
const val = (k: string) => screen.getByTestId(`shape-val-${k}`).textContent!.replace(/\s*u[²⁴]?$/, "");

describe("ShapeExplorer", () => {
  test("starts on the rectangle 4 × 6 with the table's values", () => {
    setup();
    expect(val("F")).toBe("24");
    expect(val("xg")).toBe("2");
    expect(val("yg")).toBe("3");
    expect(val("Jx")).toBe("288"); // b·h³/3
    expect(val("Jxg")).toBe("72"); // b·h³/12
    expect(val("Jxyg")).toBe("0");
  });

  test("there is a button for every shape of the table (12), and picking one loads its defaults", () => {
    setup();
    expect(SHAPES).toHaveLength(12);
    SHAPES.forEach((s) => expect(screen.getByTestId(`shape-pick-${s.id}`)).toBeTruthy());
    fireEvent.click(screen.getByTestId("shape-pick-circle"));
    expect(screen.getByTestId("shape-pick-circle").getAttribute("aria-checked")).toBe("true");
    expect(val("F")).toBe(String(Number((Math.PI * 9).toPrecision(6)))); // r = 3 by default
    expect(val("Jxg")).toBe(String(Number(((Math.PI * 81) / 4).toPrecision(6))));
  });

  test("typing new dimensions recalculates; an invalid ring (r ≥ R) shows the warning instead of numbers", () => {
    setup();
    fireEvent.change(screen.getByLabelText("h"), { target: { value: "10" } });
    expect(val("F")).toBe("40");
    fireEvent.click(screen.getByTestId("shape-pick-ring"));
    fireEvent.change(screen.getByLabelText("r"), { target: { value: "5" } }); // R is 4
    expect(screen.getByTestId("shape-invalid")).toBeTruthy();
    expect(screen.getByTestId("shape-val-F").textContent).toBe("—");
    expect(screen.queryByTestId("shape-figure")).toBeNull();
    fireEvent.change(screen.getByLabelText("r"), { target: { value: "3" } });
    expect(screen.queryByTestId("shape-invalid")).toBeNull();
    expect(val("F")).toBe(String(Number((Math.PI * 7).toPrecision(6))));
  });

  test("the sector takes the half-angle in degrees", () => {
    setup();
    fireEvent.click(screen.getByTestId("shape-pick-sector"));
    fireEvent.change(screen.getByLabelText("alpha"), { target: { value: "90" } });
    // r = 4, α = 90° = π/2: F = α·r² = 8π
    expect(val("F")).toBe(String(Number((8 * Math.PI).toPrecision(6))));
    expect(val("yg")).toBe("0");
  });

  test("it is a tab of the profiles page", () => {
    render(
      <LanguageProvider>
        <PerfilesPage />
      </LanguageProvider>,
    );
    fireEvent.click(screen.getByRole("tab", { name: "Basic shapes" }));
    expect(screen.getByTestId("shape-explorer")).toBeTruthy();
  });
});
