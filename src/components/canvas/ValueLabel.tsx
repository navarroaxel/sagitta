import { useColors } from "@/contexts/ColorContext";

// ─── Value label ─────────────────────────────────────────────────────────────
export function ValueLabel({
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
  const colors = useColors();
  if (Math.abs(v) < 0.01) return null;
  return (
    <text
      x={x}
      y={y}
      fontSize={9}
      fontFamily="monospace"
      textAnchor="middle"
      dominantBaseline="middle"
      fill={colors.ink}
      style={{ paintOrder: "stroke", stroke: "#fff", strokeWidth: 3 }}
    >
      {v.toFixed(1)}
      {unit}
    </text>
  );
}
