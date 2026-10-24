import React from "react";

// A circled + or − marking a tension (+) or compression (−) area of a stress diagram, as the
// professor draws them. `x`, `y`: centre in the SVG's coordinates.
export default function SignMark({
  x,
  y,
  sign,
  color,
  testId,
}: {
  x: number;
  y: number;
  sign: 1 | -1;
  color: string;
  testId?: string;
}) {
  return (
    <g data-testid={testId} data-sign={sign > 0 ? "+" : "−"}>
      <circle cx={x} cy={y} r={7} fill="#fff" fillOpacity={0.85} stroke={color} />
      <text x={x} y={y + 4} fontSize={12} fontWeight={700} textAnchor="middle" fill={color}>
        {sign > 0 ? "+" : "−"}
      </text>
    </g>
  );
}
