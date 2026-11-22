import { DEFLECTION_CASES, maxDeflection, type DeflectionCaseId } from "../deflection";

const N = 4000;
const coef = (id: DeflectionCaseId) => DEFLECTION_CASES.find((c) => c.id === id)!.k;

// ∫₀^l g(x) dx, midpoint rule.
function integral(g: (x: number) => number, l = 1): number {
  const h = l / N;
  let s = 0;
  for (let i = 0; i < N; i++) s += g((i + 0.5) * h) * h;
  return s;
}

describe("deflection cases (l = EJ = load = 1)", () => {
  // Cantilever, x from the free end: f = ∫ M·x dx / EJ (the notes' f = ∫ M·x·dx/(E·J)).
  test("cantilever cases match f = ∫M·x dx", () => {
    expect(integral((x) => (x * x) / 2 * x)).toBeCloseTo(coef("cant-udl"), 6);
    expect(integral((x) => x * x)).toBeCloseTo(coef("cant-point"), 6);
    // load p at the fixed end, 0 at the free end: w = p·x/l, M = p·x³/(6l)
    expect(integral((x) => (x ** 3 / 6) * x)).toBeCloseTo(coef("cant-tri-down"), 6);
    // load p at the free end, 0 at the fixed one: M = p(x²/2 − x³/6)
    expect(integral((x) => (x * x / 2 - x ** 3 / 6) * x)).toBeCloseTo(coef("cant-tri-up"), 6);
  });

  // Simply supported: y'' = M/EJ with y(0) = y(l) = 0, solved by double integration.
  function simplySupported(M: (x: number) => number) {
    const h = 1 / N;
    const th: number[] = [0];
    const y: number[] = [0];
    for (let i = 1; i <= N; i++) {
      th[i] = th[i - 1] + M((i - 0.5) * h) * h;
      y[i] = y[i - 1] + th[i] * h;
    }
    let max = 0;
    let at = 0;
    for (let i = 0; i <= N; i++) {
      const v = y[i] - (y[N] * i) / N;
      if (Math.abs(v) > max) {
        max = Math.abs(v);
        at = i / N;
      }
    }
    return { max, at };
  }

  test("simply supported cases", () => {
    expect(simplySupported((x) => (x * (1 - x)) / 2).max).toBeCloseTo(coef("ss-udl"), 5);
    expect(simplySupported((x) => (x <= 0.5 ? x / 2 : (1 - x) / 2)).max).toBeCloseTo(coef("ss-point"), 5);
  });

  test("triangular load on a simply supported beam: 0.00652 and z = 0.519·l from the unloaded end", () => {
    // load p at x = 0, 0 at x = l: reaction pl/3 on the heavy side; M = x/3 − (x²/2 − x³/6)
    const { max, at } = simplySupported((x) => x / 3 - (x * x) / 2 + x ** 3 / 6);
    expect(max).toBeCloseTo(coef("ss-tri"), 5);
    expect(1 - at).toBeCloseTo(DEFLECTION_CASES.find((c) => c.id === "ss-tri")!.z!, 3);
  });

  test("maxDeflection scales as w·l^n/(E·J)", () => {
    expect(maxDeflection("ss-udl", 2, 3, 5, 7)).toBeCloseTo((5 / 384) * 2 * 81 / 35, 10);
    expect(maxDeflection("cant-point", 1000, 200, 2.1e6, 800)).toBeCloseTo((1 / 3) * 1000 * 8e6 / (2.1e6 * 800), 10);
  });
});
