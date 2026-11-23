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

  test("the study material sits under its own heading, after the guides", () => {
    render(
      <LanguageProvider>
        <NavMenu />
      </LanguageProvider>,
    );
    fireEvent.click(screen.getByRole("button"));
    const menu = screen.getByRole("menu");
    const sep = screen.getByRole("separator");
    expect(sep.textContent).toBe("Study");
    const items = Array.from(menu.querySelectorAll("a")).map((a) => a.getAttribute("href"));
    expect(items.slice(-2)).toEqual(["/resumen", "/definiciones"]);
    // the heading comes between the last guide and the study links
    const all = Array.from(menu.children);
    expect(all.indexOf(sep)).toBe(all.length - 3);
  });
});
