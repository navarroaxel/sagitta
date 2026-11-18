import { fireEvent, render, screen } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ProfileExplorer } from "../ProfileExplorer";

const setup = () =>
  render(
    <LanguageProvider>
      <ProfileExplorer />
    </LanguageProvider>,
  );

const rowNames = () =>
  screen
    .getAllByRole("row")
    .slice(1)
    .map((r) => r.querySelector("th")?.textContent);

describe("ProfileExplorer", () => {
  test("lists IPN first and all series are reachable", () => {
    setup();
    expect(rowNames()[0]).toBe("IPN 80");
    for (const s of ["IPE", "IPBl", "IPBv", "UPN"]) {
      expect(screen.getByRole("button", { name: s })).toBeTruthy();
    }
  });

  test("search narrows the table", () => {
    setup();
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "ipe 270" },
    });
    expect(rowNames()).toEqual(["IPE 270"]);
  });

  test("series button filters", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "UPN" }));
    expect(rowNames().every((n) => n?.startsWith("UPN"))).toBe(true);
  });

  test("clicking a row shows the profile detail", () => {
    setup();
    fireEvent.click(screen.getByText("IPB 200"));
    expect(screen.getByRole("region")).toBeTruthy();
    expect(screen.getByRole("img", { name: "IPB 200" })).toBeTruthy();
  });

  test("detail draws every dimension mark and the legend", () => {
    setup();
    fireEvent.click(screen.getByText("IPB 200"));
    const svg = screen.getByRole("img", { name: "IPB 200" });
    for (const m of [
      "bf = 200",
      "d = 200",
      "hw = 134",
      "tf = 15",
      "tw = 9",
      "r = 18",
      "X-X",
      "Y-Y",
    ]) {
      expect(svg.textContent).toContain(m);
    }
    expect(
      screen.getByRole("group", { name: /leyenda|legend/i }).textContent,
    ).toContain("r = √(I / A)");
  });

  test("tapered series show the toe radius in the legend", () => {
    setup();
    fireEvent.click(screen.getByText("IPN 200"));
    expect(
      screen.getByRole("group", { name: /leyenda|legend/i }).textContent,
    ).toContain("r2");
  });

  test("table has a weight column", () => {
    setup();
    expect(screen.getAllByText("kg/m").length).toBeGreaterThan(0);
  });

  test("detail cards are grouped, X and Y rows aligned, weight included", () => {
    setup();
    fireEvent.click(screen.getByText("IPN 80"));
    const region = screen.getByRole("region");
    const heads = [...region.querySelectorAll("h3")].map((h) => h.textContent);
    expect(heads).toHaveLength(4);
    const cards = (h: Element) =>
      [...(h.nextElementSibling?.querySelectorAll("button") ?? [])].map(
        (b) => b.textContent?.split(" ")[0],
      );
    const h3s = [...region.querySelectorAll("h3")];
    expect(cards(h3s[0])).toEqual(["h", "b", "tf", "tw", "hw", "r"]);
    expect(cards(h3s[1])).toEqual(["A", "w", "J"]);
    expect(cards(h3s[2])).toEqual(["Ix", "Sx", "rx"]);
    expect(cards(h3s[3])).toEqual(["Iy", "Sy", "ry"]);
    expect(region.textContent).toContain("5.94");
  });
});
