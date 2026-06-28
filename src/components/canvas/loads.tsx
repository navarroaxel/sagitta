// ─── Load arrows ────────────────────────────────────────────────────────────
// These primitives take their color via props (`fill` / `loadColor`) rather than
// reading the color store themselves: they're instantiated many times per render
// (e.g. one LoadArrow per UDL arrow), so a per-instance useColors() subscription
// would multiply window listeners. LoadsLayer reads useColors() once and passes
// the load color down.
export function ArrowHead({
  x,
  y,
  angle,
  fill,
}: {
  x: number;
  y: number;
  angle: number;
  fill: string;
}) {
  const len = 8,
    wid = 4;
  const cos = Math.cos(angle),
    sin = Math.sin(angle);
  const p1 = `${x},${y}`;
  const p2 = `${x - len * cos + wid * sin},${y - len * sin - wid * cos}`;
  const p3 = `${x - len * cos - wid * sin},${y - len * sin + wid * cos}`;
  return <polygon points={`${p1} ${p2} ${p3}`} fill={fill} />;
}

export function LoadArrow({
  x1,
  y1,
  x2,
  y2,
  label,
  highlighted,
  loadColor,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label?: string;
  highlighted?: boolean;
  loadColor: string;
}) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const color = highlighted ? "#ea580c" : loadColor;
  const sw = highlighted ? 2.5 : 1.5;
  return (
    <g>
      {highlighted && (
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={color}
          strokeWidth={9}
          opacity={0.18}
          strokeLinecap="round"
        />
      )}
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={sw} />
      <ArrowHead x={x2} y={y2} angle={angle} fill={color} />
      {label && (
        <text
          x={(x1 + x2) / 2 + 6}
          y={(y1 + y2) / 2}
          fontSize={highlighted ? 10 : 9}
          fontFamily="monospace"
          fill={color}
          fontWeight={highlighted ? "bold" : "normal"}
          style={{ paintOrder: "stroke", stroke: "#fff", strokeWidth: 2 }}
        >
          {label}
        </text>
      )}
    </g>
  );
}

// ─── Moment marker (curved arrow) ────────────────────────────────────────────
export function MomentMarker({
  cx,
  cy,
  m,
  scale = 1,
  label,
  highlighted,
  loadColor,
}: {
  cx: number;
  cy: number;
  m: number;
  scale?: number;
  label?: string;
  highlighted?: boolean;
  loadColor: string;
}) {
  const color = highlighted ? "#ea580c" : loadColor;
  const sw = highlighted ? 2.5 : 1.5;
  const r = Math.min(34, 13 * scale);
  const cw = m < 0; // positive m = counter-clockwise; negative = clockwise
  const startDeg = cw ? -50 : 230;
  const endDeg = cw ? 230 : -50;
  const toXY = (deg: number) => {
    const a = (deg * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
  };
  const [sx, sy] = toXY(startDeg);
  const [ex, ey] = toXY(endDeg);
  const sweep = cw ? 1 : 0;
  const aEnd = (endDeg * Math.PI) / 180;
  // tangent direction at the arrow end (along the rotation sense)
  const tang = cw
    ? Math.atan2(Math.cos(aEnd), -Math.sin(aEnd))
    : Math.atan2(-Math.cos(aEnd), Math.sin(aEnd));
  return (
    <g>
      <path
        d={`M ${sx} ${sy} A ${r} ${r} 0 1 ${sweep} ${ex} ${ey}`}
        fill="none"
        stroke={color}
        strokeWidth={sw}
      />
      <ArrowHead x={ex} y={ey} angle={tang} fill={color} />
      {label && (
        <text
          x={cx + r + 5}
          y={cy}
          fontSize={highlighted ? 10 : 9}
          fontFamily="monospace"
          fill={color}
          fontWeight={highlighted ? "bold" : "normal"}
          style={{ paintOrder: "stroke", stroke: "#fff", strokeWidth: 2 }}
        >
          {label}
        </text>
      )}
    </g>
  );
}
