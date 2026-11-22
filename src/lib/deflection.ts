// Maximum deflection of the seven usual cases of the course's "Flechas" notes.
// f_max = k · w · l^n / (E·J). Units are the caller's: with w in kg (point load) or kg/cm (distributed),
// l in cm, E in kg/cm² and J in cm⁴ the result is in cm.

export type DeflectionCaseId =
  | "ss-udl"
  | "ss-point"
  | "cant-udl"
  | "cant-point"
  | "cant-tri-down"
  | "cant-tri-up"
  | "ss-tri";

export interface DeflectionCase {
  id: DeflectionCaseId;
  /** Coefficient of f_max = k·w·l^n/(E·J). */
  k: number;
  /** Power of l: 4 for distributed loads, 3 for point loads. */
  n: 3 | 4;
  /** The load is a point load P (kg) or a distributed one (q or p, kg/cm). */
  load: "point" | "distributed";
  /** Fraction of l, measured from the unloaded end, where the maximum sits (only the unsymmetrical case). */
  z?: number;
  /** The numerator of k as printed in the notes, for display. */
  label: string;
}

export const DEFLECTION_CASES: DeflectionCase[] = [
  { id: "ss-udl", k: 5 / 384, n: 4, load: "distributed", label: "5/384 · q·l⁴" },
  { id: "ss-point", k: 1 / 48, n: 3, load: "point", label: "1/48 · P·l³" },
  { id: "cant-udl", k: 1 / 8, n: 4, load: "distributed", label: "1/8 · q·l⁴" },
  { id: "cant-point", k: 1 / 3, n: 3, load: "point", label: "1/3 · P·l³" },
  { id: "cant-tri-down", k: 1 / 30, n: 4, load: "distributed", label: "1/30 · p·l⁴" },
  { id: "cant-tri-up", k: 11 / 120, n: 4, load: "distributed", label: "11/120 · p·l⁴" },
  { id: "ss-tri", k: 0.00652, n: 4, load: "distributed", z: 0.519, label: "0,00652 · p·l⁴" },
];

export function maxDeflection(id: DeflectionCaseId, w: number, l: number, E: number, J: number): number {
  const c = DEFLECTION_CASES.find((d) => d.id === id);
  if (!c) throw new Error(`unknown case ${id}`);
  return (c.k * w * l ** c.n) / (E * J);
}
