import { FrameNode } from "@/lib/types";
import { Transform } from "@/lib/geometry";
import { useColors } from "@/contexts/ColorContext";

// ─── Support symbols ────────────────────────────────────────────────────────
export function SupportSymbol({ node, tr }: { node: FrameNode; tr: Transform }) {
  const C = useColors();
  const sx = tr.toSX(node.x);
  const sy = tr.toSY(node.y);
  const sz = 18;
  const hatch = (x: number, y: number, w: number) => (
    <g>
      <line x1={x} y1={y} x2={x + w} y2={y} stroke={C.ink} strokeWidth={1.5} />
      {[0, 1, 2, 3, 4].map((i) => (
        <line
          key={i}
          x1={x + (i * w) / 4}
          y1={y}
          x2={x + (i * w) / 4 - 6}
          y2={y + 6}
          stroke={C.ink}
          strokeWidth={1}
        />
      ))}
    </g>
  );

  if (node.support === "pinned") {
    return (
      <g>
        <polygon
          points={`${sx},${sy} ${sx - sz},${sy + sz} ${sx + sz},${sy + sz}`}
          fill="none"
          stroke={C.ink}
          strokeWidth={1.5}
        />
        {hatch(sx - sz - 2, sy + sz, (sz + 2) * 2)}
      </g>
    );
  }
  if (node.support === "roller-v") {
    return (
      <g>
        <polygon
          points={`${sx},${sy} ${sx - sz},${sy + sz} ${sx + sz},${sy + sz}`}
          fill="none"
          stroke={C.ink}
          strokeWidth={1.5}
        />
        <line
          x1={sx - sz}
          y1={sy + sz + 5}
          x2={sx + sz}
          y2={sy + sz + 5}
          stroke={C.ink}
          strokeWidth={1.5}
        />
      </g>
    );
  }
  if (node.support === "roller-h") {
    // Horizontal roller: triangle pointing left
    return (
      <g>
        <polygon
          points={`${sx},${sy} ${sx - sz},${sy - sz} ${sx - sz},${sy + sz}`}
          fill="none"
          stroke={C.ink}
          strokeWidth={1.5}
        />
        <line
          x1={sx - sz - 5}
          y1={sy - sz}
          x2={sx - sz - 5}
          y2={sy + sz}
          stroke={C.ink}
          strokeWidth={1.5}
        />
      </g>
    );
  }
  if (node.support === "fixed") {
    const wallX = sx - sz * 0.5;
    return (
      <g>
        <rect
          x={wallX - sz}
          y={sy - sz}
          width={sz}
          height={sz * 2}
          fill={C.ink}
        />
        {[0, 1, 2, 3].map((i) => (
          <line
            key={i}
            x1={wallX - sz}
            y1={sy - sz + i * sz * 0.55}
            x2={wallX}
            y2={sy - sz + i * sz * 0.55 - 6}
            stroke={C.paper}
            strokeWidth={1}
          />
        ))}
      </g>
    );
  }
  return null;
}
