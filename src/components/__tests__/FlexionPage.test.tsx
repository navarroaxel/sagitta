import { render } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import FlexionPage from "@/app/flexion/page";
import { getProfile } from "@/lib/profiles";

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

describe("/flexion figures", () => {
  test("the stress diagram is zero at the neutral axis and largest at the outer fibres", () => {
    const { container } = render(
      <LanguageProvider>
        <FlexionPage />
      </LanguageProvider>,
    );
    const polys = Array.from(container.querySelectorAll("polygon")).filter((p) => p.getAttribute("points")?.startsWith("120,90"));
    expect(polys).toHaveLength(2);
    // vertices: neutral axis (120,90) first, then the outer fibre level (y = 20 / 160) at x = 120 and the wide tip
    for (const p of polys) {
      const pts = p.getAttribute("points")!.split(" ").map((v) => v.split(",").map(Number));
      expect(pts[0]).toEqual([120, 90]);
      expect([20, 160]).toContain(pts[1][1]);
      expect(pts[2][1]).toBe(pts[1][1]);
    }
  });

  test("the bending figure labels the neutral axis through the translation", () => {
    const { container } = render(
      <LanguageProvider>
        <FlexionPage />
      </LanguageProvider>,
    );
    expect(container.textContent).toMatch(/N\.A\./);
  });

  test("simple bending has the line-of-forces figure and the angle α figure", () => {
    const { container } = render(
      <LanguageProvider>
        <FlexionPage />
      </LanguageProvider>,
    );
    const figs = Array.from(container.querySelectorAll("figure svg"));
    expect(figs).toHaveLength(6); // line of forces, α, principal axes, straight bending, neutral axis, stress
    const ipb = figs[2];
    expect(ipb.textContent).toMatch(/xy.*Jmax.*Jmin.*G.*Jxy = 0/);
    // drawn from the table: depth h, flange width bf (0.7 px/mm), centred on G; and the caption quotes its J_x, J_y
    const pr = getProfile("IPB 200")!;
    const pts = ipb.querySelector('[data-testid="ipb"]')!.getAttribute("points")!.split(" ").map((v) => v.split(",").map(Number));
    const xs = pts.map((q) => q[0]);
    const ys = pts.map((q) => q[1]);
    expect(Math.max(...ys) - Math.min(...ys)).toBeCloseTo(pr.h * 0.7, 6);
    expect(Math.max(...xs) - Math.min(...xs)).toBeCloseTo(pr.bf * 0.7, 6);
    expect(pr.Ix).toBe(5700);
    expect(pr.Iy).toBe(2000);
    expect(document.body.textContent).toMatch(/Jx = 5 700 cm⁴.*Jy = 2 000 cm⁴/);
    // straight bending (the notes' sketch): three loads on the top face, in the plane α, and the couple M
    const straight = figs[3];
    expect(straight.textContent).toMatch(/P1.*P2.*P3.*M.*y.*G.*plane α.*symmetry axis of the section.*geometric axis/);
    expect(straight.querySelectorAll("line[marker-end]")).toHaveLength(3);
    expect(straight.querySelectorAll("path[marker-end]")).toHaveLength(1);
    const tops = Array.from(straight.querySelectorAll("line[marker-end]")).map((l) => Number(l.getAttribute("x1")));
    expect(tops).toEqual([112, 172, 232]); // evenly spaced along the top face
    const plane = figs[0];
    expect(plane.textContent).toMatch(/Bending plane.*Section.*Line of forces/);
    // the α figure: the line of forces is turned α from the y axis and the arc ends on it
    const alpha = figs[1];
    expect(alpha.textContent).toMatch(/x.*y.*Line of forces.*α.*G/);
    const line = alpha.querySelector('line[stroke="#C0392B"]')!;
    const [x1, y1, x2, y2] = ["x1", "y1", "x2", "y2"].map((k) => Number(line.getAttribute(k)));
    const turned = (Math.atan2(x2 - x1, y1 - y2) * 180) / Math.PI; // from the vertical (y axis)
    expect(turned).toBeCloseTo(25, 6);
    const arc = alpha.querySelector("path")!.getAttribute("d")!;
    const [, ex, ey] = arc.match(/A [\d.]+ [\d.]+ 0 0 1 ([\d.]+) ([\d.]+)/)!.map(Number);
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2;
    expect((Math.atan2(ex - cx, cy - ey) * 180) / Math.PI).toBeCloseTo(25, 4); // the arc ends on the line of forces
    expect(ex - cx).toBeGreaterThan(0);
  });
});
