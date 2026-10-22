import { fireEvent, render, screen } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { EccentricSection } from "../EccentricSection";

const setup = () =>
  render(
    <LanguageProvider>
      <EccentricSection />
    </LanguageProvider>,
  );
const text = (id: string) => screen.getByTestId(id).textContent;
const input = (name: RegExp) => screen.getByLabelText(name) as HTMLInputElement;

describe("EccentricSection", () => {
  test("starts with the IPN 300 exercise: P_z,max ≈ 76.2 kN, corners and check", () => {
    setup();
    expect(text("ecc-pmax")).toMatch(/76\.2\d kN/);
    expect(text("ecc-corner-0")).toBe("+13.96");
    expect(text("ecc-corner-1")).toBe("+9.31");
    expect(text("ecc-corner-2")).toBe("−7.10".replace("−", "-"));
    expect(text("ecc-corner-3")).toBe("-11.76");
    expect(text("ecc-check")).toContain("✓");
    expect(screen.getByTestId("ecc-neutral")).toBeTruthy();
  });

  test("translated texts use real subscripts (P_z, e_x, e_y)", () => {
    const { container } = setup();
    const subs = Array.from(container.querySelectorAll("label sub")).map((e) => e.textContent);
    expect(subs).toEqual(expect.arrayContaining(["z", "x", "y"]));
    expect(container.textContent).not.toMatch(/[A-Za-z]_[xyz]/); // no raw "P_z" left in the page
  });

  test("the load point is outside the section for e_x = 10, e_y = 20, and inside for small e", () => {
    setup();
    expect(screen.getByTestId("ecc-outside")).toBeTruthy();
    fireEvent.change(input(/e_x/), { target: { value: "2" } });
    fireEvent.change(input(/e_y/), { target: { value: "5" } });
    expect(screen.queryByTestId("ecc-outside")).toBeNull();
  });

  test("raising P_z above P_z,max fails the check", () => {
    setup();
    fireEvent.change(input(/P_z/), { target: { value: "80" } });
    expect(text("ecc-check")).toContain("✗");
    // P_z,max does not depend on P_z
    expect(text("ecc-pmax")).toMatch(/76\.2\d kN/);
  });

  test("changing the profile and the orientation updates P_z,max", () => {
    setup();
    const before = text("ecc-pmax");
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "IPB 300" } });
    expect(text("ecc-pmax")).not.toBe(before);
    const ipb = text("ecc-pmax");
    fireEvent.click(screen.getByRole("checkbox"));
    expect(text("ecc-pmax")).not.toBe(ipb);
  });

  test("concentric load has no neutral axis and P_z,max = σ adm·A", () => {
    setup();
    fireEvent.change(input(/e_x/), { target: { value: "0" } });
    fireEvent.change(input(/e_y/), { target: { value: "0" } });
    expect(screen.queryByTestId("ecc-neutral")).toBeNull();
    expect(text("ecc-pmax")).toContain("966.00 kN"); // 14 · 69.0
  });
});
