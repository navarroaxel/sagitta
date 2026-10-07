import React from "react";
import { FrameModel3D } from "@/lib/types3d";
import { SolveOutput3D } from "@/lib/solve3d";
import { Projection3D } from "@/lib/projection3d";
import { Diagram3D } from "@/lib/results3d";
import { StressResult } from "@/lib/stress3d";
import { useColors } from "@/contexts/ColorContext";
import { ValueLabel } from "@/components/canvas/ValueLabel";
import { unit2, P2 } from "./arrows3d";

export type DiagramKind = Diagram3D | "S";

// Which local axis a diagram is drawn along, and on which side. Moments go on the tension
// side (-axis for positive M); N, V, T and σ are drawn along +axis.
const AXIS: Record<DiagramKind, { axis: "ey" | "ez"; side: 1 | -1 }> = {
  N: { axis: "ez", side: 1 },
  Qy: { axis: "ey", side: 1 },
  Qz: { axis: "ez", side: 1 },
  T: { axis: "ez", side: 1 },
  My: { axis: "ez", side: -1 },
  Mz: { axis: "ey", side: -1 },
  S: { axis: "ez", side: 1 },
};

export function Diagram3DLayer({
  model,
  solved,
  proj,
  diagram,
  scale,
  showValues,
  stress,
}: {
  model: FrameModel3D;
  solved: SolveOutput3D;
  proj: Projection3D;
  diagram: DiagramKind;
  scale: number;
  showValues: boolean;
  stress: StressResult | null;
}) {
  const colors = useColors();
  const nodeById = new Map(model.nodes.map((n) => [n.id, n]));
  const isStress = diagram === "S";
  const color = isStress
    ? colors.compression
    : diagram === "N"
      ? colors.tension
      : diagram === "Qy" || diagram === "Qz"
        ? colors.shear
        : diagram === "T"
          ? colors.loads
          : colors.moment;
  const unit = isStress ? "MPa" : diagram === "T" || diagram[0] === "M" ? `${model.unit}·m` : model.unit;

  // value of the drawn quantity at every station of every member (σ: only members with a profile)
  const vals: number[][] = solved.stations.map((st, e) =>
    isStress
      ? (stress?.[e]?.sigma ?? st.map(() => 0))
      : st.map((s) => s[diagram as Diagram3D]),
  );

  let globalMax = 0;
  vals.forEach((v) => v.forEach((x) => (globalMax = Math.max(globalMax, Math.abs(x)))));
  if (globalMax < 1e-9) return null;

  const pts = model.nodes.map((n) => proj.project([n.x, n.y, n.z]));
  const span = Math.hypot(
    Math.max(...pts.map((p) => p[0])) - Math.min(...pts.map((p) => p[0])),
    Math.max(...pts.map((p) => p[1])) - Math.min(...pts.map((p) => p[1])),
  );
  const px = (0.17 * span * scale) / globalMax; // screen px per unit of the drawn quantity

  const { axis, side } = AXIS[diagram];
  return (
    <g data-testid={`diagram3d-${diagram}`}>
      {model.members.map((m, e) => {
        const a = nodeById.get(m.n1)!;
        const g = solved.result.geo[e];
        const ud = unit2(proj.dir(g[axis]));
        if (!ud) return null;
        if (isStress && !stress?.[e]) return null;
        const base = (x: number): P2 =>
          proj.project([a.x + x * g.ex[0], a.y + x * g.ex[1], a.z + x * g.ex[2]]);
        const off = (x: number, v: number): P2 => {
          const b = base(x);
          return [b[0] + ud[0] * side * v * px, b[1] + ud[1] * side * v * px];
        };
        const st = solved.stations[e];
        const v = vals[e];
        const top = st.map((s, k) => off(s.x, v[k]));
        const bottom = st.map((s) => base(s.x)).reverse();
        const poly = [...top, ...bottom].map((p) => `${p[0]},${p[1]}`).join(" ");
        let kPk = 0;
        v.forEach((x, k) => {
          if (Math.abs(x) > Math.abs(v[kPk])) kPk = k;
        });
        const [lx, ly] = off(st[kPk].x, v[kPk]);
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
                x={lx + ud[0] * side * Math.sign(v[kPk] || 1) * 12}
                y={ly + ud[1] * side * Math.sign(v[kPk] || 1) * 12}
                v={v[kPk]}
                unit={unit}
              />
            )}
          </g>
        );
      })}
    </g>
  );
}
