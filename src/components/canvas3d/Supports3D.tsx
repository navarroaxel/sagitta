import React from "react";
import { FrameModel3D } from "@/lib/types3d";
import { Projection3D } from "@/lib/projection3d";
import type { Vec3 } from "@/lib/solver3d";
import { supportPlate } from "@/lib/supportPlate3d";
import { useColors } from "@/contexts/ColorContext";

// Drawn BEFORE the members so the member sits in front of the plate, centred on the node.
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
          // wall perpendicular to the member that arrives at the node (a horizontal plate for a
          // column, a vertical wall for a beam), hatch on the side away from the member
          const m = model.members.find((q) => q.n1 === n.id || q.n2 === n.id);
          const other = m && model.nodes.find((q) => q.id === (m.n1 === n.id ? m.n2 : m.n1));
          const d: Vec3 = other ? [other.x - n.x, other.y - n.y, other.z - n.z] : [0, 0, 1];
          const plate = supportPlate(d);
          const pts = plate.pts.map(([dx, dy]) => `${x + dx},${y + dy}`).join(" ");
          return (
            <g key={n.id} data-testid={`support-fixed-${n.id}`} data-axis={plate.axis}>
              <polygon points={pts} fill={colors.paper} fillOpacity={0.85} />
              {plate.ticks.map(([x1, y1, x2, y2], i) => (
                <line key={i} x1={x + x1} y1={y + y1} x2={x + x2} y2={y + y2} />
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
