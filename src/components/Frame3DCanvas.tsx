"use client";

import React, { useMemo } from "react";
import { FrameModel3D } from "@/lib/types3d";
import { SolveOutput3D } from "@/lib/solve3d";
import { makeProjection3D } from "@/lib/projection3d";
import { SVG_W, SVG_H } from "@/components/canvas/constants";
import { useColors } from "@/contexts/ColorContext";
import { Supports3D } from "./canvas3d/Supports3D";
import { Loads3DLayer, Reactions3DLayer } from "./canvas3d/Loads3DLayer";
import { Diagram3DLayer, DiagramKind } from "./canvas3d/Diagram3DLayer";
import { StressResult, ratioColor } from "@/lib/stress3d";
import { unit2 } from "./canvas3d/arrows3d";
import type { Vec3 } from "@/lib/solver3d";

export interface View3DOptions {
  diagram: DiagramKind | null;
  showLoads: boolean;
  showReactions: boolean;
  showValues: boolean;
  showMemberLabels: boolean;
  colorByStress: boolean;
  scale: number;
}

function AxesTriad({ proj }: { proj: ReturnType<typeof makeProjection3D> }) {
  const colors = useColors();
  const o: [number, number] = [SVG_W - 90, SVG_H - 60];
  const items: [string, Vec3][] = [
    ["x", [1, 0, 0]],
    ["y", [0, 1, 0]],
    ["z", [0, 0, 1]],
  ];
  return (
    <g stroke={colors.dimensions} fill={colors.dimensions} fontSize={12} fontWeight={600}>
      {items.map(([name, v]) => {
        const d = unit2(proj.dir(v))!;
        const e: [number, number] = [o[0] + d[0] * 34, o[1] + d[1] * 34];
        return (
          <g key={name}>
            <line x1={o[0]} y1={o[1]} x2={e[0]} y2={e[1]} strokeWidth={2} />
            <polygon
              points={`${e[0] + d[0] * 7},${e[1] + d[1] * 7} ${e[0] - d[1] * 4},${e[1] + d[0] * 4} ${e[0] + d[1] * 4},${e[1] - d[0] * 4}`}
              stroke="none"
            />
            <text x={e[0] + d[0] * 16} y={e[1] + d[1] * 16 + 4} stroke="none" textAnchor="middle">
              {name}
            </text>
          </g>
        );
      })}
    </g>
  );
}

export default function Frame3DCanvas({
  model,
  solved,
  viewOpts,
  stress = null,
  svgRef,
}: {
  model: FrameModel3D;
  solved: SolveOutput3D | null;
  viewOpts: View3DOptions;
  stress?: StressResult | null;
  svgRef?: React.Ref<SVGSVGElement>;
}) {
  const colors = useColors();
  const proj = useMemo(
    () =>
      makeProjection3D(
        model.nodes.map((n) => [n.x, n.y, n.z] as Vec3),
        SVG_W,
        SVG_H,
      ),
    [model.nodes],
  );
  const stable = !!solved && solved.result.stable;
  const nodePos = new Map(
    model.nodes.map((n) => [n.id, proj.project([n.x, n.y, n.z])] as const),
  );

  return (
    <svg
      ref={svgRef}
      data-testid="frame3d-canvas"
      width={SVG_W}
      height={SVG_H}
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      style={{ background: colors.paper, userSelect: "none", display: "block" }}
    >
      <Supports3D model={model} proj={proj} />

      {stable && viewOpts.diagram && (
        <Diagram3DLayer
          model={model}
          solved={solved!}
          proj={proj}
          diagram={viewOpts.diagram}
          scale={viewOpts.scale}
          showValues={viewOpts.showValues}
          stress={stress}
        />
      )}

      <g strokeWidth={5} strokeLinecap="round">
        {model.members.map((m, e) => {
          const a = nodePos.get(m.n1),
            b = nodePos.get(m.n2);
          if (!a || !b) return null;
          const r = stable && viewOpts.colorByStress ? stress?.[e] : null;
          return (
            <line
              key={m.id}
              data-testid={`member3d-${m.id}`}
              data-ratio={r ? r.ratio.toFixed(3) : undefined}
              stroke={r ? ratioColor(r.ratio) : colors.member}
              x1={a[0]}
              y1={a[1]}
              x2={b[0]}
              y2={b[1]}
            />
          );
        })}
      </g>

      {stable &&
        viewOpts.colorByStress &&
        model.members.map((m, e) => {
          const r = stress?.[e];
          const a = nodePos.get(m.n1),
            b = nodePos.get(m.n2);
          if (!r || !a || !b) return null;
          return (
            <text
              key={m.id}
              data-testid={`utilization-${m.id}`}
              x={(a[0] + b[0]) / 2 - 8}
              y={(a[1] + b[1]) / 2 + 16}
              fontSize={11}
              fontFamily="monospace"
              fontWeight={700}
              textAnchor="end"
              fill={ratioColor(r.ratio)}
              style={{ paintOrder: "stroke", stroke: "#fff", strokeWidth: 3 }}
            >
              {r.ok ? "" : "✗ "}
              {(r.ratio * 100).toFixed(0)}%
            </text>
          );
        })}

      {viewOpts.showMemberLabels &&
        model.members.map((m) => {
          const a = nodePos.get(m.n1),
            b = nodePos.get(m.n2);
          if (!a || !b) return null;
          return (
            <text
              key={m.id}
              x={(a[0] + b[0]) / 2 + 8}
              y={(a[1] + b[1]) / 2 - 8}
              fontSize={11}
              fontFamily="monospace"
              fill={colors.dimensions}
            >
              {m.id}
            </text>
          );
        })}

      <g fill={colors.node}>
        {model.nodes.map((n) => {
          const [x, y] = nodePos.get(n.id)!;
          return <circle key={n.id} cx={x} cy={y} r={4} />;
        })}
      </g>
      <g fontSize={13} fontWeight={600} fill="#6a1b9a">
        {model.nodes.map((n) => {
          const [x, y] = nodePos.get(n.id)!;
          return (
            <text key={n.id} x={x + 8} y={y - 8}>
              {n.id}
            </text>
          );
        })}
      </g>

      {stable && viewOpts.showLoads && <Loads3DLayer model={model} solved={solved!} proj={proj} />}
      {stable && viewOpts.showReactions && (
        <Reactions3DLayer model={model} solved={solved!} proj={proj} />
      )}

      <AxesTriad proj={proj} />
    </svg>
  );
}
