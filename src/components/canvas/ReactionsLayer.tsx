import React from "react";
import { FrameModel } from "@/lib/types";
import { SolveOutput } from "@/lib/solve";
import { Transform } from "@/lib/geometry";
import { useColors } from "@/contexts/ColorContext";

export function ReactionsLayer({
  model,
  solved,
  tr,
  unit,
}: {
  model: FrameModel;
  solved: SolveOutput;
  tr: Transform;
  unit: string;
}) {
  const C = useColors();
  const ARROW_LEN = 50;
  const reactions = solved.result.reactions;
  return (
    <g data-testid="reactions-layer">
      {model.nodes.map((nd, i) => {
        const r = reactions[i];
        if (!r) return null;
        const sx = tr.toSX(nd.x),
          sy = tr.toSY(nd.y);
        const elements: React.ReactNode[] = [];
        if (Math.abs(r.rx) > 0.01) {
          const sign = r.rx > 0 ? 1 : -1;
          elements.push(
            <g key="rx">
              <line
                x1={sx - sign * ARROW_LEN}
                y1={sy}
                x2={sx}
                y2={sy}
                stroke={C.reactions}
                strokeWidth={2}
              />
              <polygon
                points={`${sx},${sy} ${sx - sign * 10},${sy - 5} ${sx - sign * 10},${sy + 5}`}
                fill={C.reactions}
              />
              <text
                x={sx - sign * ARROW_LEN * 0.5}
                y={sy - 8}
                fontSize={9}
                fontFamily="monospace"
                fill={C.reactions}
                textAnchor="middle"
                style={{ paintOrder: "stroke", stroke: "#fff", strokeWidth: 2 }}
              >
                {r.rx.toFixed(1)}
                {unit}
              </text>
            </g>,
          );
        }
        if (Math.abs(r.ry) > 0.01) {
          const sign = r.ry > 0 ? -1 : 1; // positive ry means upward (screen y decreases)
          elements.push(
            <g key="ry">
              <line
                x1={sx}
                y1={sy - sign * ARROW_LEN}
                x2={sx}
                y2={sy}
                stroke={C.reactions}
                strokeWidth={2}
              />
              <polygon
                points={`${sx},${sy} ${sx - 5},${sy - sign * 10} ${sx + 5},${sy - sign * 10}`}
                fill={C.reactions}
              />
              <text
                x={sx + 12}
                y={sy - sign * ARROW_LEN * 0.5}
                fontSize={9}
                fontFamily="monospace"
                fill={C.reactions}
                style={{ paintOrder: "stroke", stroke: "#fff", strokeWidth: 2 }}
              >
                {r.ry.toFixed(1)}
                {unit}
              </text>
            </g>,
          );
        }
        if (Math.abs(r.rm) > 0.01) {
          elements.push(
            <g key="rm">
              <path
                d={`M${sx + 18},${sy} A18,18 0 1,1 ${sx + 18 * Math.cos(Math.PI * 1.5)},${sy + 18 * Math.sin(Math.PI * 1.5)}`}
                fill="none"
                stroke={C.reactions}
                strokeWidth={2}
              />
              <text
                x={sx + 24}
                y={sy - 18}
                fontSize={9}
                fontFamily="monospace"
                fill={C.reactions}
                style={{ paintOrder: "stroke", stroke: "#fff", strokeWidth: 2 }}
              >
                {r.rm.toFixed(1)}
                {unit}
              </text>
            </g>,
          );
        }
        return <g key={nd.id}>{elements}</g>;
      })}
    </g>
  );
}
