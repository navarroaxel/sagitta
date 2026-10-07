import React from "react";
import { FrameModel3D } from "@/lib/types3d";
import { Projection3D } from "@/lib/projection3d";
import { useColors } from "@/contexts/ColorContext";

// Drawn BEFORE the members so the column sits in front of the plate, centred on the node.
export function Supports3D({
  model,
  proj,
}: {
  model: FrameModel3D;
  proj: Projection3D;
}) {
  const colors = useColors();
  return (
    <g data-testid="supports3d-layer" stroke={colors.ink} strokeWidth={2}>
      {model.nodes.map((n) => {
        if (n.support === "free") return null;
        const [x, y] = proj.project([n.x, n.y, n.z]);
        if (n.support === "fixed") {
          // ground plate in the xy plane (oblique) + hatch below
          const pts = [
            [-54, 10],
            [26, 10],
            [54, -10],
            [-26, -10],
          ]
            .map(([dx, dy]) => `${x + dx},${y + dy}`)
            .join(" ");
          return (
            <g key={n.id} data-testid={`support-fixed-${n.id}`}>
              <polygon points={pts} fill={colors.paper} fillOpacity={0.85} />
              {[-46, -36, -26, -16, -6, 4, 14, 24].map((dx) => (
                <line
                  key={dx}
                  x1={x + dx}
                  y1={y + 10}
                  x2={x + dx - 8}
                  y2={y + 18}
                />
              ))}
            </g>
          );
        }
        // pinned: triangle + base line
        return (
          <g key={n.id} data-testid={`support-pinned-${n.id}`}>
            <polygon
              points={`${x},${y} ${x - 14},${y + 22} ${x + 14},${y + 22}`}
              fill={colors.paper}
            />
            <line x1={x - 20} y1={y + 22} x2={x + 20} y2={y + 22} />
          </g>
        );
      })}
    </g>
  );
}
