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
});
