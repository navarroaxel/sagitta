// Geometry (screen px, relative to the node) of the built-in support symbol in the oblique view:
// a plate perpendicular to the member that arrives at the node, with hatch ticks on the side away
// from the member. Basis (px per unit, as in projection3d): x = (40, 0), y = (14, -10), z = (0, -40).
import type { Vec3 } from "./solver3d";

export type Axis = "x" | "y" | "z";

export interface SupportPlate {
  axis: Axis; // dominant axis of the member (the plate is perpendicular to it)
  sign: 1 | -1; // the member runs toward +axis (1) or -axis (-1)
  pts: [number, number][]; // plate polygon
  ticks: [number, number, number, number][]; // hatch segments x1, y1, x2, y2
}

// Dominant axis of a world direction; ties prefer z, then x (a column or a beam over a depth member).
export function dominantAxis(d: Vec3): { axis: Axis; sign: 1 | -1 } {
  const [ax, ay, az] = d.map(Math.abs);
  const axis: Axis = az >= ax && az >= ay ? "z" : ax >= ay ? "x" : "y";
  const v = axis === "x" ? d[0] : axis === "y" ? d[1] : d[2];
  return { axis, sign: v < 0 ? -1 : 1 };
}

const range = (from: number, step: number, n: number) => Array.from({ length: n }, (_, i) => from + i * step);

// d: world direction from the support node along the member that is attached to it.
export function supportPlate(d: Vec3): SupportPlate {
  const { axis, sign } = dominantAxis(d);
  if (axis === "z") {
    // horizontal plate in the xy plane; hatch below a column that goes up, above one that goes down
    const pts: [number, number][] = [
      [-54, 10],
      [26, 10],
      [54, -10],
      [-26, -10],
    ];
    const ticks = (sign > 0 ? range(-46, 10, 8) : range(-22, 10, 8)).map(
      (dx): [number, number, number, number] =>
        sign > 0 ? [dx, 10, dx - 8, 18] : [dx, -10, dx - 8, -18],
    );
    return { axis, sign, pts, ticks };
  }
  if (axis === "x") {
    // vertical wall in the yz plane; hatch on the side opposite the member
    const pts: [number, number][] = [
      [-28, -16],
      [28, -56],
      [28, 16],
      [-28, 56],
    ];
    const ticks = (sign > 0 ? range(-10, 10, 7) : range(-50, 10, 7)).map(
      (y): [number, number, number, number] =>
        sign > 0 ? [-28, y, -36, y + 8] : [28, y, 36, y + 8],
    );
    return { axis, sign, pts, ticks };
  }
  // y: wall in the xz plane seen face-on; y points toward the viewer (down-left), so the hatch trails
  // up-right behind a member that comes toward +y and down-left toward the viewer behind one going -y
  const pts: [number, number][] = [
    [-36, -30],
    [36, -30],
    [36, 30],
    [-36, 30],
  ];
  const ticks = range(-24, 8, 7).map(
    (y): [number, number, number, number] =>
      sign > 0 ? [36, y, 44, y - 6] : [-36, y, -44, y + 6],
  );
  return { axis, sign, pts, ticks };
}
