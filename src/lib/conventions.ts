import { DiagramKey } from "@/lib/diagram";

export type SignConvention = "international" | "argentina";

/**
 * Returns the presentation-layer sign factors for a given convention and
 * diagram type.
 *
 * - sideSign: which side of the member axis the curve is drawn.
 *   Passed to buildMemberDiagram(); the math inside is untouched.
 * - dispSign: multiplier applied ONLY to the numeric value shown in labels
 *   and the Results panel. It never affects geometry, colors, or the
 *   N tension/compression (T/C) physical state.
 *
 * Under Argentina a value shown as negative is drawn to the left of columns /
 * above beams (positive on the right / below) — the UTN FRBA rule. That side is
 * kept independent of i→j node ordering by the canonical normal in
 * buildMemberDiagram; here we only choose, per diagram, whether the number shown
 * is flipped relative to the physical value. N keeps its sign (tension +), Q is
 * flipped, and M keeps its sign (drawn on the tension side, as international).
 *
 * Convention table:
 * | key | international              | argentina (default)       |
 * |-----|----------------------------|---------------------------|
 * | N   | sideSign +1, dispSign +1   | sideSign -1, dispSign +1  |
 * | Q   | sideSign +1, dispSign +1   | sideSign +1, dispSign -1  |
 * | M   | sideSign -1, dispSign +1   | sideSign -1, dispSign +1  |
 */
export function diagramSigns(
  conv: SignConvention,
  key: DiagramKey,
): { sideSign: number; dispSign: number } {
  if (conv === "international") {
    if (key === "M") return { sideSign: -1, dispSign: 1 };
    return { sideSign: 1, dispSign: 1 };
  }
  // argentina (UTN FRBA, default)
  if (key === "N") return { sideSign: -1, dispSign: 1 };
  if (key === "Q") return { sideSign: 1, dispSign: -1 };
  // M — physical value shown, drawn on the tension (sagging) side; same as the
  // international setting. Combined with the canonical normal this still lands a
  // negative-labelled moment on the left (columns) / above (beams).
  return { sideSign: -1, dispSign: 1 };
}
