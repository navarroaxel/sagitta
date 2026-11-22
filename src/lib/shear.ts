// Shear stresses in bending (Jourawski–Colignon): τ = Q·S / (J·s), S = static moment of the area on one
// side of the cut, s = width of the cut. Pure functions; any consistent units (kg, cm).

/** Rectangle b × h: τ(y) = 3/2 · Q/(b·h) · [1 − (2y/h)²], y from the neutral axis. */
export function tauRect(Q: number, b: number, h: number, y: number): number {
  return 1.5 * (Q / (b * h)) * (1 - ((2 * y) / h) ** 2);
}

/** Largest τ of the rectangle, at the neutral axis: 1.5·Q/(b·h). */
export function tauRectMax(Q: number, b: number, h: number): number {
  return (1.5 * Q) / (b * h);
}

export interface ISection {
  /** Flange width. */
  b: number;
  /** Overall depth. */
  h: number;
  /** Clear depth between flanges (so the flange thickness is (h − h0)/2). */
  h0: number;
  /** Web thickness. */
  tw: number;
}

/** Inertia about the neutral axis X of the double-T: b·h³/12 − (b − tw)·h0³/12. */
export function inertiaI(s: ISection): number {
  return (s.b * s.h ** 3) / 12 - ((s.b - s.tw) * s.h0 ** 3) / 12;
}

/** τ in the flange (h0/2 ≤ |y| ≤ h/2): Q/(2J)·(h²/4 − y²). */
export function tauIFlange(Q: number, s: ISection, y: number): number {
  return (Q / (2 * inertiaI(s))) * (s.h ** 2 / 4 - y ** 2);
}

/** τ in the web (|y| ≤ h0/2): Q/(2·tw·J)·[b/4·(h² − h0²) + tw·(h0²/4 − y²)]. */
export function tauIWeb(Q: number, s: ISection, y: number): number {
  return (Q / (2 * s.tw * inertiaI(s))) * ((s.b / 4) * (s.h ** 2 - s.h0 ** 2) + s.tw * (s.h0 ** 2 / 4 - y ** 2));
}
