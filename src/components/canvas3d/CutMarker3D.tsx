import React from "react";
import { FrameModel3D } from "@/lib/types3d";
import { SolveOutput3D } from "@/lib/solve3d";
import { Projection3D } from "@/lib/projection3d";

// Small parallelogram in the member's local y'-z' plane at the cut position.
export function CutMarker3D({
  model,
  solved,
  proj,
  cut,
}: {
  model: FrameModel3D;
  solved: SolveOutput3D;
  proj: Projection3D;
  cut: { member: number; x: number };
}) {
  const m = model.members[cut.member];
  const a = model.nodes.find((n) => n.id === m?.n1);
  const g = solved.result.geo[cut.member];
  if (!m || !a || !g) return null;
  const w = 0.35; // m
  const c: [number, number, number] = [
    a.x + cut.x * g.ex[0],
    a.y + cut.x * g.ex[1],
    a.z + cut.x * g.ex[2],
  ];
  const corner = (sy: number, sz: number) =>
    proj.project([
      c[0] + w * (sy * g.ey[0] + sz * g.ez[0]),
      c[1] + w * (sy * g.ey[1] + sz * g.ez[1]),
      c[2] + w * (sy * g.ey[2] + sz * g.ez[2]),
    ]);
  const pts = [corner(1, 1), corner(1, -1), corner(-1, -1), corner(-1, 1)]
    .map((p) => `${p[0]},${p[1]}`)
    .join(" ");
  return (
    <polygon
      data-testid="cut-marker"
      points={pts}
      fill="#0ea5e9"
      fillOpacity={0.25}
      stroke="#0284c7"
      strokeWidth={2}
    />
  );
}
