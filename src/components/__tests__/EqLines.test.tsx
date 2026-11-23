import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { eqLines } from "@/components/Sub";
import { Eq } from "@/components/guide/GuideBits";
import MaterialesPage from "@/app/propiedades-materiales/page";
import PlanasPage from "@/app/superficies-planas/page";
import AxilPage from "@/app/axil/page";
import PandeoPage from "@/app/pandeo/page";

const wrap = (ui: React.ReactNode) => <LanguageProvider>{ui}</LanguageProvider>;

describe("several equations in one box go one per line", () => {
  test("eqLines splits on a run of spaces or a newline, not on the spaces inside a formula", () => {
    expect(eqLines("Q_y = ∫ τ_xy dF        Q_z = ∫ τ_xz dF")).toEqual(["Q_y = ∫ τ_xy dF", "Q_z = ∫ τ_xz dF"]);
    expect(eqLines("a = 1\nb = 2")).toEqual(["a = 1", "b = 2"]);
    expect(eqLines("σ = E · ε")).toEqual(["σ = E · ε"]);
    expect(eqLines("σ_1 = σ / y   →   σ = σ_1·y")).toEqual(["σ_1 = σ / y   →   σ = σ_1·y"]); // a derivation chain stays together
  });

  test("Eq renders one block per equation", () => {
    const { container } = render(wrap(<Eq>{"A = 1        B = 2        C = 3"}</Eq>));
    expect(container.firstElementChild!.children).toHaveLength(3);
  });

  test("the equivalence equations of the materials guide: dN / dQy / dQz and Qy / Qz, My / Mz each on its own line", () => {
    const { container } = render(wrap(<MaterialesPage />));
    const boxes = Array.from(container.querySelectorAll("div.font-mono")).filter((d) => d.children.length > 0);
    const lines = (re: RegExp) => boxes.find((b) => re.test(b.textContent!))!.querySelectorAll(":scope > div");
    expect(lines(/dN = σ/)).toHaveLength(3);
    expect(lines(/Qy = ∫ τxy/)).toHaveLength(2);
    expect(lines(/My = ∫ σ·z/)).toHaveLength(2);
  });

  test("the other guides split too: Sx / Sy, Jx / Jy, the two axial conditions and λ with Fk", () => {
    const count = (ui: React.ReactNode, re: RegExp) => {
      const { container, unmount } = render(wrap(ui));
      const box = Array.from(container.querySelectorAll("div.font-mono")).find((b) => re.test(b.textContent!))!;
      const n = box.querySelectorAll(":scope > div").length;
      unmount();
      return n;
    };
    expect(count(<PlanasPage />, /Sx = ∫ y dA/)).toBe(2);
    expect(count(<PlanasPage />, /Jx = ∫ y² dA/)).toBe(2);
    expect(count(<AxilPage />, /0 = ∫ τxy dA/)).toBe(2);
    expect(count(<PandeoPage />, /λ = l0 \/ imin/)).toBe(2);
    expect(screen.queryAllByText(/\{|\}/)).toHaveLength(0);
  });
});
