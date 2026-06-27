import { buildMemberDiagram, quadGroupToSvgPoints, DiagramKey } from "@/lib/diagram";
import { C } from "./constants";
import { ValLabel } from "./ValLabel";

export function DiagramLayer({
  diag,
  type,
  unit,
  showValues,
}: {
  diag: ReturnType<typeof buildMemberDiagram>;
  type: DiagramKey;
  unit: string;
  showValues: boolean;
}) {
  const fillPos = type === "N" ? C.tension : type === "Q" ? C.shear : C.moment;
  const fillNeg =
    type === "N" ? C.compression : type === "Q" ? C.shear : C.moment;
  const strokeColor =
    type === "N" ? C.tension : type === "Q" ? C.shear : C.moment;

  return (
    <g data-testid={`diagram-${type}`} opacity={0.85}>
      {/* Filled quads */}
      {diag.quads.map((group, gi) => {
        const pts = quadGroupToSvgPoints(group);
        const fill = group[0]?.positive ? fillPos : fillNeg;
        return (
          <polygon
            key={gi}
            points={pts}
            fill={fill}
            fillOpacity={0.26}
            stroke="none"
          />
        );
      })}
      {/* Outline */}
      <polyline
        points={diag.offsetPolyline}
        fill="none"
        stroke={strokeColor}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {/* Baseline */}
      <polyline
        points={diag.points.map((p) => `${p.bx},${p.by}`).join(" ")}
        fill="none"
        stroke={strokeColor}
        strokeWidth={0.5}
        strokeDasharray="3,2"
        opacity={0.4}
      />
      {/* Labels */}
      {showValues && (
        <g>
          <ValLabel
            x={diag.iLabel.x}
            y={diag.iLabel.y}
            v={diag.iLabel.v}
            unit={unit}
          />
          <ValLabel
            x={diag.jLabel.x}
            y={diag.jLabel.y}
            v={diag.jLabel.v}
            unit={unit}
          />
          <ValLabel
            x={diag.extremumLabel.x}
            y={diag.extremumLabel.y}
            v={diag.extremumLabel.v}
            unit={unit}
          />
        </g>
      )}
    </g>
  );
}
