// Pure geometry helpers for placing load glyphs along a member.
// Extracted from FrameCanvas/LoadsLayer so the placement math can be unit-tested
// without a DOM. These operate purely in world coordinates (metres, y-up); the
// screen transform is applied by the caller.

export interface Vec2 {
  x: number;
  y: number;
}

/**
 * World position of a point load placed `dist` metres from the i-end of the
 * member running i→j.
 *
 * Out-of-range `dist` is **allowed** and extrapolates along the member axis:
 * `dist < 0` lies before the i-end, `dist > L` lies beyond the j-end. This
 * matches the historical rendering behaviour — placement is not clamped or
 * rejected here. (Note the solver in `sampling.ts` effectively ignores the
 * internal-force contribution of an out-of-range point load, so an arrow drawn
 * outside the member is purely cosmetic.)
 *
 * For a zero-length member (i and j coincident) the axis is undefined and the
 * result is `NaN` — callers already guard against drawing such members.
 */
export function pointLoadPos(ni: Vec2, nj: Vec2, dist: number): Vec2 {
  const L = Math.hypot(nj.x - ni.x, nj.y - ni.y);
  const ax = (nj.x - ni.x) / L;
  const ay = (nj.y - ni.y) / L;
  return { x: ni.x + ax * dist, y: ni.y + ay * dist };
}

/**
 * Linear interpolation between the i-end (`t = 0`) and j-end (`t = 1`) of a
 * member. `t` outside `[0, 1]` extrapolates.
 */
export function pointAlongMember(ni: Vec2, nj: Vec2, t: number): Vec2 {
  return {
    x: ni.x + (nj.x - ni.x) * t,
    y: ni.y + (nj.y - ni.y) * t,
  };
}

/**
 * Parametric positions (0..1) of `nArrows` equally-spaced UDL arrows along a
 * member: `[0, …, 1]`, endpoints included. With `nArrows = 1` returns `[0]`.
 */
export function udlArrowFractions(nArrows: number): number[] {
  if (nArrows <= 1) return [0];
  return Array.from({ length: nArrows }, (_, i) => i / (nArrows - 1));
}

/** Number of UDL arrows drawn per member, and which one carries the value label. */
export const UDL_ARROW_COUNT = 5;
/** Index into `udlArrowFractions(UDL_ARROW_COUNT)` of the label-bearing (middle) arrow. */
export const UDL_LABEL_INDEX = 2;
