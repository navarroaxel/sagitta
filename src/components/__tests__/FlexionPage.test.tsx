import { render } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import FlexionPage from "@/app/flexion/page";

describe("/flexion", () => {
  test("renders the derivation with real subscripts and the figures", () => {
    const { container } = render(
      <LanguageProvider>
        <FlexionPage />
      </LanguageProvider>,
    );
    expect(container.querySelectorAll("figure svg").length).toBeGreaterThanOrEqual(2);
    expect(document.body.textContent).toMatch(/σ = M·y/);
    const subs = Array.from(document.querySelectorAll("sub")).map((e) => e.textContent);
    expect(subs).toEqual(expect.arrayContaining(["x", "adm", "nec"]));
    // no raw "_x" left in the visible text
    expect(document.body.textContent).not.toMatch(/[A-Za-z]_[a-z]/);
  });
});
