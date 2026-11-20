import { fireEvent, render, screen } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { NeutralAxisExample, SectionCutSimulator } from "../SectionCutGuide";

const setup = () =>
  render(
    <LanguageProvider>
      <SectionCutSimulator />
      <NeutralAxisExample />
    </LanguageProvider>,
  );
const text = (id: string) => screen.getByTestId(id).textContent;

describe("SectionCutSimulator (base of the preset #2 column)", () => {
  test("starts with the four corner stresses of the example", () => {
    setup();
    expect(text("cut-sigma-0")).toBe("41.3"); // (+6; +6)
    expect(text("cut-sigma-1")).toContain("−1208.7"); // (−6; +6): the critical, compressed corner
    expect(text("cut-sigma-1")).toContain("◎");
    expect(text("cut-sigma-2")).toBe("−76.6");
    expect(text("cut-sigma-3")).toBe("1173.4");
    expect(text("cut-reading")).toContain("(−6; 6)");
  });

  test("compares both faces: face 2 (turned) is the lower one for the preset #2 base, and the toggle switches the section", () => {
    setup();
    expect(text("cut-compare")).toMatch(/1924\.\d/);
    expect(text("cut-compare")).toMatch(/1208\.7|1208\.8/);
    expect(text("cut-compare")).toMatch(/→\s*(face 2|cara 2)/);
    expect(text("cut-section-line")).toContain("Ix = 318");
    fireEvent.click(screen.getByRole("button", { name: /Face 1|Cara 1/ }));
    expect(text("cut-section-line")).toContain("Ix = 864");
    expect(text("cut-sigma-0")).not.toBe("41.3"); // another face, other corner values
    expect(text("cut-sigma-1")).toContain("−1924.1");
  });

  test("neutral-axis example gives (0; −0.187) and (0.169; 0)", () => {
    setup();
    expect(text("cut-en-example")).toContain("−0.187 cm");
    expect(text("cut-en-example")).toContain("0.169 cm");
  });

  test("only N: uniform σ, no neutral axis, and the reading says so", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: /Only N|Solo N/ }));
    expect(text("cut-reading")).toMatch(/uniform|uniforme/);
    expect(text("cut-sigma-0")).toBe(text("cut-sigma-2"));
    expect(text("cut-sigma-0")).not.toContain("◎"); // no corner is the critical one
    expect(screen.getByTestId("cut-main").querySelectorAll("circle[r='11']")).toHaveLength(0);
  });

  test("typing a moment moves the critical corner to the side it tensions", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: /Only Mx|Solo Mx/ })); // Mx > 0 tensions +y
    expect(text("cut-reading")).toMatch(/tension|tracción/);
    const crit = screen.getByTestId("cut-main").querySelectorAll("circle[r='11']");
    expect(crit).toHaveLength(1);
  });
});
