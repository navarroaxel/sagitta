import { render } from "@testing-library/react";
import { ValLabel } from "../canvas/ValLabel";

// ValLabel renders an SVG <text>; wrap it in an <svg> host element.
function renderLabel(v: number, unit = "kN") {
  return render(
    <svg>
      <ValLabel x={0} y={0} v={v} unit={unit} />
    </svg>,
  );
}

describe("ValLabel – near-zero threshold", () => {
  test("|v| < 0.01 renders nothing", () => {
    const { container } = renderLabel(0.005);
    expect(container.querySelector("text")).toBeNull();
  });

  test("negative below threshold also renders nothing", () => {
    const { container } = renderLabel(-0.001);
    expect(container.querySelector("text")).toBeNull();
  });

  test("|v| >= 0.01 renders the value rounded to 1 dp plus the unit", () => {
    const { container } = renderLabel(12.34, "kN");
    expect(container.querySelector("text")).toHaveTextContent("12.3kN");
  });

  test("rounding follows toFixed(1)", () => {
    const { container } = renderLabel(0.05, "T");
    expect(container.querySelector("text")).toHaveTextContent("0.1T");
  });
});
