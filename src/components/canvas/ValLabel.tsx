import { C } from "./constants";

// ─── Value label ─────────────────────────────────────────────────────────────
export function ValLabel({
  x,
  y,
  v,
  unit,
}: {
  x: number;
  y: number;
  v: number;
  unit: string;
}) {
  if (Math.abs(v) < 0.01) return null;
  return (
    <text
      x={x}
      y={y}
      fontSize={9}
      fontFamily="monospace"
      textAnchor="middle"
      dominantBaseline="middle"
      fill={C.ink}
      style={{ paintOrder: "stroke", stroke: "#fff", strokeWidth: 3 }}
    >
      {v.toFixed(1)}
      {unit}
    </text>
  );
}
