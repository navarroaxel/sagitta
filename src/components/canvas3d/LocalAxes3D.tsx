import React from "react";
import { FrameModel3D } from "@/lib/types3d";
import { SolveOutput3D } from "@/lib/solve3d";
import { Projection3D } from "@/lib/projection3d";
import { courseFrame } from "@/lib/localFrame";
import { Head, unit2, P2 } from "./arrows3d";

const AXES = [
  { key: "x", color: "#dc2626" },
  { key: "y", color: "#16a34a" },
  { key: "z", color: "#2563eb" },
] as const;

// Local triad (course convention: z' along the member, down or to the left; x' out of the
// plane; y') of every member, drawn a quarter of
// the way along it so it does not collide with the nodes.
export function LocalAxes3D({
  model,
  solved,
  proj,
}: {
  model: FrameModel3D;
  solved: SolveOutput3D;
  proj: Projection3D;
}) {
  const nodeById = new Map(model.nodes.map((n) => [n.id, n]));
  const LEN = 30;
  return (
    <g data-testid="local-axes-layer" fontSize={11} fontWeight={700}>
      {model.members.map((m, e) => {
        const a = nodeById.get(m.n1);
        const g = solved.result.geo[e];
        if (!a || !g) return null;
        const s = 0.25 * g.L;
        const o: P2 = proj.project([
          a.x + s * g.ex[0],
          a.y + s * g.ex[1],
          a.z + s * g.ex[2],
        ]);
        return (
          <g key={m.id} data-testid={`local-axes-${m.id}`}>
            {AXES.map(({ key, color }) => {
              const d = unit2(proj.dir(courseFrame(g)[key]));
              if (!d) return null;
              const tip: P2 = [o[0] + d[0] * LEN, o[1] + d[1] * LEN];
              return (
                <g key={key}>
                  <line
                    data-axis={key}
                    x1={o[0]}
                    y1={o[1]}
                    x2={tip[0]}
                    y2={tip[1]}
                    stroke={color}
                    strokeWidth={2}
                  />
                  <Head tip={tip} d={d} size={7} color={color} />
                  <text
                    x={tip[0] + d[0] * 9 - 3}
                    y={tip[1] + d[1] * 9 + 4}
                    fill={color}
                    style={{ paintOrder: "stroke", stroke: "#fff", strokeWidth: 3 }}
                  >
                    {key}&apos;
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}
    </g>
  );
}
