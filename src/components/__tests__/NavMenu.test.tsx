import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { LanguageProvider } from "@/contexts/LanguageContext";
import NavMenu from "@/components/NavMenu";

vi.mock("next/navigation", () => ({ usePathname: () => "/flecha" }));

describe("NavMenu", () => {
  test("lists the guides and marks the current page", () => {
    render(
      <LanguageProvider>
        <NavMenu />
      </LanguageProvider>,
    );
    fireEvent.click(screen.getByRole("button"));
    const items = screen.getAllByRole("menuitem");
    expect(items.length).toBeGreaterThan(8);
    const current = items.filter((i) => i.getAttribute("aria-current") === "page");
    expect(current).toHaveLength(1);
    expect(current[0].getAttribute("href")).toBe("/flecha");
  });

  test("the menu is capped to the viewport and scrolls, so every guide stays reachable on a short screen", () => {
    render(
      <LanguageProvider>
        <NavMenu />
      </LanguageProvider>,
    );
    fireEvent.click(screen.getByRole("button"));
    const menu = screen.getByRole("menu");
    expect(menu.className).toMatch(/max-h-\[calc\(100dvh-4rem\)\]/);
    expect(menu.className).toMatch(/overflow-y-auto/);
    expect(menu.className).not.toMatch(/overflow-hidden/);
  });

  test("the links are in three groups, each under its heading: Guides, Tools and Study", () => {
    render(
      <LanguageProvider>
        <NavMenu />
      </LanguageProvider>,
    );
    fireEvent.click(screen.getByRole("button"));
    const menu = screen.getByRole("menu");
    const headings = screen.getAllByRole("separator").map((s) => s.textContent);
    expect(headings).toEqual(["Guides", "Tools", "Study"]);
    // what sits under each heading: walk the menu in order
    const groups: Record<string, string[]> = {};
    let current = "";
    for (const el of Array.from(menu.children)) {
      if (el.getAttribute("role") === "separator") {
        current = el.textContent!;
        groups[current] = [];
      } else groups[current].push(el.getAttribute("href")!);
    }
    expect(groups["Guides"]).toHaveLength(13);
    expect(groups["Guides"]).toEqual(expect.arrayContaining(["/learn", "/flexion", "/pandeo", "/corte-en-flexion"]));
    expect(groups["Tools"]).toEqual(["/quiz", "/frame3d", "/perfiles"]);
    expect(groups["Study"]).toEqual(["/resumen", "/definiciones", "/preguntas-teoria"]);
    // the first heading has no divider above it, the others do
    expect(screen.getAllByRole("separator")[0].className).not.toMatch(/border-t/);
    expect(screen.getAllByRole("separator")[1].className).toMatch(/border-t/);
  });
});
