import React from "react";
import { FrameModel3D } from "@/lib/types3d";
import { SolveOutput3D } from "@/lib/solve3d";
import { Projection3D } from "@/lib/projection3d";
import { Diagram3D } from "@/lib/results3d";
import { udlSpan } from "@/lib/solver3d";
import { StressResult } from "@/lib/stress3d";
import { useColors } from "@/contexts/ColorContext";
import { ValueLabel } from "@/components/canvas/ValueLabel";
import { courseFrame } from "@/lib/localFrame";
import { unit2, P2 } from "./arrows3d";

export type DiagramKind = Diagram3D | "S";

// Which course axis a diagram is drawn along, and on which side. Moments go on the tension
// side (Mx > 0: +y; My > 0: +x); N, Q, T and σ are drawn along +axis.
const AXIS: Record<DiagramKind, { axis: "x" | "y"; side: 1 | -1 }> = {
  N: { axis: "y", side: 1 },
  Qx: { axis: "x", side: 1 },
  Qy: { axis: "y", side: 1 },
  T: { axis: "y", side: 1 },
  Mx: { axis: "y", side: 1 },
  My: { axis: "x", side: 1 },
  S: { axis: "y", side: 1 },
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
      : diagram === "Qx" || diagram === "Qy"
        ? colors.shear
        : diagram === "T"
          ? colors.loads
          : colors.moment;
  const unit = isStress
    ? "kN/cm²"
    : diagram === "T" || diagram[0] === "M"
      ? `${model.unit}·m`
      : model.unit;

  // value of the drawn quantity at every station of every member (σ: only members with a profile)
  const vals: number[][] = solved.stations.map((st, e) =>
    isStress
      ? (stress?.[e]?.sigma ?? st.map(() => 0))
      : st.map((s) => s[diagram as Diagram3D]),
  );

  let globalMax = 0;
  vals.forEach((v) =>
    v.forEach((x) => (globalMax = Math.max(globalMax, Math.abs(x)))),
  );
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
        const ud = unit2(proj.dir(courseFrame(g)[axis]));
        if (!ud) return null;
        if (isStress && !stress?.[e]) return null;
        const base = (x: number): P2 =>
          proj.project([
            a.x + x * g.ex[0],
            a.y + x * g.ex[1],
            a.z + x * g.ex[2],
          ]);
        const off = (x: number, v: number): P2 => {
          const b = base(x);
          return [b[0] + ud[0] * side * v * px, b[1] + ud[1] * side * v * px];
        };
        const st = solved.stations[e];
        const v = vals[e];
        const top = st.map((s, k) => off(s.x, v[k]));
        const bottom = st.map((s) => base(s.x)).reverse();
        const poly = [...top, ...bottom]
          .map((p) => `${p[0]},${p[1]}`)
          .join(" ");
        let kPk = 0;
        v.forEach((x, k) => {
          if (Math.abs(x) > Math.abs(v[kPk])) kPk = k;
        });
        const [lx, ly] = off(st[kPk].x, v[kPk]);
        // where the loads of this member start/end (partial distributed loads) or act (point
        // loads): a dashed guide and a dot on the curve, to see where its shape changes
        const L = g.L;
        const marks: number[] = [];
        model.loads.forEach((l) => {
          if (l.type === "nodal" || l.member !== m.id) return;
          if (l.type === "mpoint") marks.push(l.dist);
          else {
            const span = udlSpan(l, L);
            if (span && (span.a > 1e-9 || span.b < L - 1e-9))
              marks.push(span.a, span.b);
          }
        });
        return (
          <g key={m.id}>
            <polygon
              points={poly}
              fill={color}
              fillOpacity={0.28}
              stroke="none"
            />
            <polyline
              points={top.map((p) => `${p[0]},${p[1]}`).join(" ")}
              fill="none"
              stroke={color}
              strokeWidth={1.5}
            />
            {marks.map((xm, i) => {
              const k = st.reduce(
                (best, q, j) =>
                  Math.abs(q.x - xm) < Math.abs(st[best].x - xm) ? j : best,
                0,
              );
              const [bx, by] = base(xm);
              const [cx, cy] = off(xm, v[k]);
              return (
                <g key={i} data-testid={`diagram-mark-${m.id}-${i}`}>
                  <line
                    x1={bx}
                    y1={by}
                    x2={cx}
                    y2={cy}
                    stroke={colors.ink}
                    strokeWidth={1}
                    strokeDasharray="4 3"
                  />
                  <circle
                    cx={cx}
                    cy={cy}
                    r={3.5}
                    fill={color}
                    stroke={colors.paper}
                    strokeWidth={1.5}
                  />
                </g>
              );
            })}
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
