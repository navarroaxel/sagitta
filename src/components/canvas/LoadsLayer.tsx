import { FrameModel } from "@/lib/types";
import { Transform } from "@/lib/geometry";
import { LoadArrow, MomentMarker } from "./loads";

export function LoadsLayer({
  model,
  tr,
  scale = 1,
  highlightedLoadId,
}: {
  model: FrameModel;
  tr: Transform;
  scale?: number;
  highlightedLoadId?: string | null;
}) {
  const ARROW_BASE = 40; // px for a "unit" force arrow
  // Find max magnitude for scaling
  let maxF = 0;
  model.loads.forEach((l) => {
    if (l.type === "nodal") maxF = Math.max(maxF, Math.hypot(l.fx, l.fy));
    if (l.type === "mpoint") maxF = Math.max(maxF, Math.hypot(l.gx, l.gy));
    if (l.type === "mudl") maxF = Math.max(maxF, Math.hypot(l.gx, l.gy));
  });
  const k = (maxF > 0 ? ARROW_BASE / maxF : 1) * scale;
  const anyHighlighted = highlightedLoadId != null;

  return (
    <g>
      {model.loads.map((load) => {
        const isHL = load.id === highlightedLoadId;
        const opacity = anyHighlighted && !isHL ? 0.25 : 1;

        if (load.type === "nodal") {
          const nd = model.nodes.find((n) => n.id === load.node);
          if (!nd) return null;
          const mag = Math.hypot(load.fx, load.fy);
          const hasForce = mag >= 1e-10;
          const hasMoment = Math.abs(load.m) >= 1e-10;
          if (!hasForce && !hasMoment) return null;
          const sx = tr.toSX(nd.x),
            sy = tr.toSY(nd.y);
          const len = mag * k;
          const angle = Math.atan2(-load.fy, load.fx); // screen y is flipped
          return (
            <g key={load.id} opacity={opacity}>
              {hasForce && (
                <LoadArrow
                  x1={sx - Math.cos(angle) * len}
                  y1={sy - Math.sin(angle) * len}
                  x2={sx}
                  y2={sy}
                  label={`${mag.toFixed(0)}`}
                  highlighted={isHL}
                />
              )}
              {hasMoment && (
                <MomentMarker
                  cx={sx}
                  cy={sy}
                  m={load.m}
                  scale={scale}
                  label={`${Math.abs(load.m).toFixed(0)}`}
                  highlighted={isHL}
                />
              )}
            </g>
          );
        }
        if (load.type === "mpoint") {
          const mem = model.members.find((m) => m.id === load.member);
          if (!mem) return null;
          const ni = model.nodes.find((n) => n.id === mem.n1)!;
          const nj = model.nodes.find((n) => n.id === mem.n2)!;
          if (!ni || !nj) return null;
          const L = Math.hypot(nj.x - ni.x, nj.y - ni.y);
          const ax = (nj.x - ni.x) / L,
            ay = (nj.y - ni.y) / L;
          const wx = ni.x + ax * load.dist;
          const wy = ni.y + ay * load.dist;
          const sx = tr.toSX(wx),
            sy = tr.toSY(wy);
          const mag = Math.hypot(load.gx, load.gy);
          if (mag < 1e-10) return null;
          const len = mag * k;
          const angle = Math.atan2(-load.gy, load.gx);
          return (
            <g key={load.id} opacity={opacity}>
              <LoadArrow
                x1={sx - Math.cos(angle) * len}
                y1={sy - Math.sin(angle) * len}
                x2={sx}
                y2={sy}
                label={`${mag.toFixed(0)}`}
                highlighted={isHL}
              />
            </g>
          );
        }
        if (load.type === "mudl") {
          const mem = model.members.find((m) => m.id === load.member);
          if (!mem) return null;
          const ni = model.nodes.find((n) => n.id === mem.n1)!;
          const nj = model.nodes.find((n) => n.id === mem.n2)!;
          if (!ni || !nj) return null;
          const mag = Math.hypot(load.gx, load.gy);
          if (mag < 1e-10) return null;
          const angle = Math.atan2(-load.gy, load.gx);
          const len = mag * k * 0.6;
          const nArrows = 5;
          return (
            <g key={load.id} opacity={opacity}>
              {Array.from({ length: nArrows }).map((_, i) => {
                const t = i / (nArrows - 1);
                const wx = ni.x + (nj.x - ni.x) * t;
                const wy = ni.y + (nj.y - ni.y) * t;
                const sx = tr.toSX(wx),
                  sy = tr.toSY(wy);
                return (
                  <LoadArrow
                    key={i}
                    x1={sx - Math.cos(angle) * len}
                    y1={sy - Math.sin(angle) * len}
                    x2={sx}
                    y2={sy}
                    label={i === 2 ? `${mag.toFixed(0)}/m` : undefined}
                    highlighted={isHL}
                  />
                );
              })}
            </g>
          );
        }
        return null;
      })}
    </g>
  );
}
