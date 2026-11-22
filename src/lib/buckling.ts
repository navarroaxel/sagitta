// Euler buckling of straight bars (course notes "Pandeo AMS"). Units are the caller's; with E in kg/cm², J in cm⁴,
// A in cm², lengths in cm the loads come out in kg and the stresses in kg/cm².

/** Buckling length coefficient c = l0 / l of the four classic end conditions. */
export const END_CONDITIONS = [
  { id: "cantilever", c: 2 },
  { id: "pinned", c: 1 },
  { id: "fixed-pinned", c: 0.7 },
  { id: "fixed-fixed", c: 0.5 },
] as const;
export type EndConditionId = (typeof END_CONDITIONS)[number]["id"];

/** Equivalent (buckling) length l0 = c·l: the distance between two consecutive inflection points. */
export function bucklingLength(c: number, l: number): number {
  return c * l;
}

/** Euler's critical load Fk = π²·E·J_min / (c²·l²). */
export function criticalLoad(E: number, Jmin: number, c: number, l: number): number {
  return (Math.PI ** 2 * E * Jmin) / (c * c * l * l);
}

/** Radius of gyration i = √(J/A). */
export function radiusOfGyration(J: number, A: number): number {
  return Math.sqrt(J / A);
}

/** Slenderness λ = l0 / i_min. */
export function slenderness(c: number, l: number, iMin: number): number {
  return (c * l) / iMin;
}

/** Critical stress σk = Fk/A = π²·E / λ² (the Euler hyperbola). Valid only while σk ≤ σ at the elastic limit. */
export function criticalStress(E: number, lambda: number): number {
  return (Math.PI ** 2 * E) / (lambda * lambda);
}

/** Largest length that still carries F: l = (1/c)·√(π²·E·J/F). */
export function maxLength(E: number, Jmin: number, c: number, F: number): number {
  return Math.sqrt((Math.PI ** 2 * E * Jmin) / F) / c;
}

export type Equilibrium = "stable" | "indifferent" | "unstable";

/** State of the straight position under a compression F: F < Fk stable, F = Fk indifferent, F > Fk unstable. */
export function equilibriumState(F: number, Fk: number, tol = 1e-9): Equilibrium {
  if (Math.abs(F - Fk) <= tol * Fk) return "indifferent";
  return F < Fk ? "stable" : "unstable";
}

/** The notes' rule of thumb: a bar with l < 30·b (b the smallest width) is "short" and σ = F/A ≤ σadm is enough. */
export function isShortBar(l: number, bMin: number): boolean {
  return l < 30 * bMin;
}
