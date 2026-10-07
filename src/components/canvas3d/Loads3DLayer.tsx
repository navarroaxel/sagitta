import React from "react";
import { FrameModel3D } from "@/lib/types3d";
import { SolveOutput3D } from "@/lib/solve3d";
import { Projection3D } from "@/lib/projection3d";
import { useColors } from "@/contexts/ColorContext";
import { ForceArrow3D, MomentArrow3D, P2 } from "./arrows3d";
import { udlSpan, type Vec3 } from "@/lib/solver3d";

const TOL = 1e-6;
const f = (v: number) => v.toFixed(2);
const axes: Vec3[] = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];
const NAMES = ["x", "y", "z"] as const;

export function Loads3DLayer({
  model,
  solved,
  proj,
}: {
  model: FrameModel3D;
  solved: SolveOutput3D;
  proj: Projection3D;
}) {
  const colors = useColors();
  const nodeById = new Map(model.nodes.map((n) => [n.id, n]));
  const els: React.ReactNode[] = [];
  const u = model.unit;

  model.loads.forEach((load) => {
    if (load.type === "nodal") {
      const n = nodeById.get(load.node);
      if (!n) return;
      const at = proj.project([n.x, n.y, n.z]);
      const F = [load.fx, load.fy, load.fz];
      const M = [load.mx, load.my, load.mz];
      axes.forEach((ax, k) => {
        if (Math.abs(F[k]) > TOL)
          els.push(
            <ForceArrow3D
              key={`${load.id}-f${k}`}
              testId={`load-${load.id}-f${NAMES[k]}`}
              at={at}
              dir={proj.dir(ax.map((c) => c * Math.sign(F[k])) as Vec3)}
              color={colors.loads}
              label={`F${NAMES[k]} = ${f(Math.abs(F[k]))} ${u}`}
            />,
          );
        if (Math.abs(M[k]) > TOL)
          els.push(
            <MomentArrow3D
              key={`${load.id}-m${k}`}
              testId={`load-${load.id}-m${NAMES[k]}`}
              at={at}
              dir={proj.dir(ax.map((c) => c * Math.sign(M[k])) as Vec3)}
              color={colors.loads}
              label={`M${NAMES[k]} = ${f(Math.abs(M[k]))} ${u}·m`}
            />,
          );
      });
      return;
    }
    const e = solved.memberIndex.get(load.member);
    if (e === undefined) return;
    const a = nodeById.get(model.members[e].n1)!;
    const { L, ex } = solved.result.geo[e];
    const g: Vec3 = [load.gx, load.gy, load.gz];
    const mag = Math.hypot(...g);
    if (mag < TOL) return;
    const at = (s: number): P2 =>
      proj.project([a.x + s * ex[0], a.y + s * ex[1], a.z + s * ex[2]]);
    const dir = proj.dir(g);
    if (load.type === "mpoint") {
      els.push(
        <ForceArrow3D
          key={load.id}
          testId={`load-${load.id}`}
          at={at(load.dist)}
          dir={dir}
          color={colors.loads}
          label={`${f(mag)} ${u}`}
        />,
      );
      return;
    }
    const span = udlSpan(load, L);
    if (!span) return;
    const n = Math.max(3, Math.round((span.b - span.a) / 1.5) + 1);
    for (let k = 0; k < n; k++)
      els.push(
        <ForceArrow3D
          key={`${load.id}-${k}`}
          testId={k === 0 ? `load-${load.id}` : undefined}
          at={at(span.a + (k / (n - 1)) * (span.b - span.a))}
          dir={dir}
          len={30}
          color={colors.loads}
          label={k === Math.floor((n - 1) / 2) ? `${f(mag)} ${u}/m` : undefined}
        />,
      );
  });

  return <g data-testid="loads3d-layer">{els}</g>;
}

export function Reactions3DLayer({
  model,
  solved,
  proj,
}: {
  model: FrameModel3D;
  solved: SolveOutput3D;
  proj: Projection3D;
}) {
  const colors = useColors();
  const u = model.unit;
  return (
    <g data-testid="reactions3d-layer">
      {model.nodes.map((n, i) => {
        if (n.support === "free") return null;
        const r = solved.result.reactions[i];
        const at = proj.project([n.x, n.y, n.z]);
        const F = [r.fx, r.fy, r.fz];
        const M = [r.mx, r.my, r.mz];
        return (
          <g key={n.id}>
            {axes.map((ax, k) => (
              <React.Fragment key={k}>
                {Math.abs(F[k]) > 1e-3 && (
                  <ForceArrow3D
                    testId={`reaction-${n.id}-f${NAMES[k]}`}
                    at={at}
                    dir={proj.dir(ax.map((c) => c * Math.sign(F[k])) as Vec3)}
                    color={colors.reactions}
                    label={`F${NAMES[k]} = ${f(Math.abs(F[k]))} ${u}`}
                  />
                )}
                {Math.abs(M[k]) > 1e-3 && (
                  <MomentArrow3D
                    testId={`reaction-${n.id}-m${NAMES[k]}`}
                    at={at}
                    dir={proj.dir(ax.map((c) => c * Math.sign(M[k])) as Vec3)}
                    color={colors.reactions}
                    label={`M${NAMES[k]} = ${f(Math.abs(M[k]))} ${u}·m`}
                  />
                )}
              </React.Fragment>
            ))}
          </g>
        );
      })}
    </g>
  );
}
