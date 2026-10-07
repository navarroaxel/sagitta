import React from "react";
import { FrameModel3D } from "@/lib/types3d";
import { SolveOutput3D } from "@/lib/solve3d";
import { Projection3D } from "@/lib/projection3d";
import { Diagram3D, peak3D } from "@/lib/results3d";
import { useColors } from "@/contexts/ColorContext";
import { ValueLabel } from "@/components/canvas/ValueLabel";
import { unit2, P2 } from "./arrows3d";

// Which local axis a diagram is drawn along, and on which side. Moments go on the tension
// side (-axis for positive M); N, V and T are drawn along +axis.
const AXIS: Record<Diagram3D, { axis: "ey" | "ez"; side: 1 | -1 }> = {
  N: { axis: "ez", side: 1 },
  Qy: { axis: "ey", side: 1 },
  Qz: { axis: "ez", side: 1 },
  T: { axis: "ez", side: 1 },
  My: { axis: "ez", side: -1 },
  Mz: { axis: "ey", side: -1 },
};

export function Diagram3DLayer({
  model,
  solved,
  proj,
  diagram,
  scale,
  showValues,
}: {
  model: FrameModel3D;
  solved: SolveOutput3D;
  proj: Projection3D;
  diagram: Diagram3D;
  scale: number;
  showValues: boolean;
}) {
  const colors = useColors();
  const nodeById = new Map(model.nodes.map((n) => [n.id, n]));
  const color =
    diagram === "N"
      ? colors.tension
      : diagram === "Qy" || diagram === "Qz"
        ? colors.shear
        : diagram === "T"
          ? colors.loads
          : colors.moment;
  const unit = diagram === "T" || diagram[0] === "M" ? `${model.unit}·m` : model.unit;

  let globalMax = 0;
  solved.stations.forEach((st) =>
    st.forEach((s) => (globalMax = Math.max(globalMax, Math.abs(s[diagram])))),
  );
  if (globalMax < 1e-9) return null;

  const pts = model.nodes.map((n) => proj.project([n.x, n.y, n.z]));
  const span = Math.hypot(
    Math.max(...pts.map((p) => p[0])) - Math.min(...pts.map((p) => p[0])),
    Math.max(...pts.map((p) => p[1])) - Math.min(...pts.map((p) => p[1])),
  );
  const px = (0.17 * span * scale) / globalMax; // screen px per unit of force

  const { axis, side } = AXIS[diagram];
  return (
    <g data-testid={`diagram3d-${diagram}`}>
      {model.members.map((m, e) => {
        const a = nodeById.get(m.n1)!;
        const g = solved.result.geo[e];
        const ud = unit2(proj.dir(g[axis]));
        if (!ud) return null;
        const base = (x: number): P2 =>
          proj.project([a.x + x * g.ex[0], a.y + x * g.ex[1], a.z + x * g.ex[2]]);
        const off = (x: number, v: number): P2 => {
          const b = base(x);
          return [b[0] + ud[0] * side * v * px, b[1] + ud[1] * side * v * px];
        };
        const st = solved.stations[e];
        const top = st.map((s) => off(s.x, s[diagram]));
        const bottom = st.map((s) => base(s.x)).reverse();
        const poly = [...top, ...bottom].map((p) => `${p[0]},${p[1]}`).join(" ");
        const pk = peak3D(st, diagram)!;
        const [lx, ly] = off(pk.x, pk[diagram]);
        return (
          <g key={m.id}>
            <polygon points={poly} fill={color} fillOpacity={0.28} stroke="none" />
            <polyline
              points={top.map((p) => `${p[0]},${p[1]}`).join(" ")}
              fill="none"
              stroke={color}
              strokeWidth={1.5}
            />
            {showValues && (
              <ValueLabel
                x={lx + ud[0] * side * Math.sign(pk[diagram] || 1) * 12}
                y={ly + ud[1] * side * Math.sign(pk[diagram] || 1) * 12}
                v={pk[diagram]}
                unit={unit}
              />
            )}
          </g>
        );
      })}
    </g>
  );
}
