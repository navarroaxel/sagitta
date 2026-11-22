import { inertiaI, tauIFlange, tauIWeb, tauRect, tauRectMax, type ISection } from "../shear";

function integral(g: (y: number) => number, a: number, b: number, n = 4000): number {
  const h = (b - a) / n;
  let s = 0;
  for (let i = 0; i < n; i++) s += g(a + (i + 0.5) * h) * h;
  return s;
}

describe("shear stresses in bending", () => {
  test("rectangle: τ_max = 1.5·Q/(b·h) at the neutral axis, zero at the fibres", () => {
    expect(tauRect(1000, 10, 20, 0)).toBeCloseTo(tauRectMax(1000, 10, 20), 10);
    expect(tauRectMax(1000, 10, 20)).toBeCloseTo(7.5, 10);
    expect(tauRect(1000, 10, 20, 10)).toBeCloseTo(0, 10);
  });

  test("rectangle: the stresses add up to Q", () => {
    expect(integral((y) => tauRect(1000, 10, 20, y) * 10, -10, 10)).toBeCloseTo(1000, 3);
  });

  // IPB-like double-T, cm
  const s: ISection = { b: 20, h: 30, h0: 26.8, tw: 1.1 };
  test("double-T: the stresses on flanges and web add up to Q", () => {
    const Q = 5000;
    const web = integral((y) => tauIWeb(Q, s, y) * s.tw, -s.h0 / 2, s.h0 / 2);
    const flanges = 2 * integral((y) => tauIFlange(Q, s, y) * s.b, s.h0 / 2, s.h / 2);
    expect(web + flanges).toBeCloseTo(Q, 0);
    expect(web).toBeGreaterThan(0.85 * Q); // the web carries most of the shear
  });

  test("double-T: τ jumps by b/tw at the web–flange junction, and the inertia matches", () => {
    const y = s.h0 / 2;
    expect(tauIWeb(5000, s, y) / tauIFlange(5000, s, y)).toBeCloseTo(s.b / s.tw, 8);
    expect(tauIFlange(5000, s, s.h / 2)).toBeCloseTo(0, 10);
    expect(inertiaI(s)).toBeCloseTo((20 * 30 ** 3) / 12 - (18.9 * 26.8 ** 3) / 12, 6);
  });
});
