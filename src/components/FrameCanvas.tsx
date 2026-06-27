"use client";

import React, {
  useMemo,
  useCallback,
  useRef,
  useState,
  useEffect,
} from "react";
import { FrameModel, FrameNode } from "@/lib/types";
import { SolveOutput } from "@/lib/solve";
import { makeTransform, Transform } from "@/lib/geometry";
import {
  buildMemberDiagram,
  quadGroupToSvgPoints,
  DiagramKey,
} from "@/lib/diagram";

// ─── Palette ────────────────────────────────────────────────────────────────
const C = {
  ink: "#1c1917",
  paper: "#fbfaf7",
  tension: "#0f766e",
  compression: "#be123c",
  shear: "#1d4ed8",
  moment: "#7c3aed",
  loads: "#c2410c",
  reactions: "#15803d",
  member: "#292524",
  node: "#44403c",
  grid: "#e7e5e4",
};

export interface ViewOptions {
  showN: boolean;
  showQ: boolean;
  showM: boolean;
  showReactions: boolean;
  showLoads: boolean;
  showValues: boolean;
  showGrid: boolean;
  scaleN: number;
  scaleQ: number;
  scaleM: number;
  scaleLoads: number;
}

interface Props {
  model: FrameModel;
  solved: SolveOutput | null;
  viewOpts: ViewOptions;
  onNodeMove: (id: string, x: number, y: number) => void;
  svgRef?: React.RefObject<SVGSVGElement | null>;
  highlightedLoadId?: string | null;
}

const SVG_W = 900;
const SVG_H = 600;
const SNAP = 0.25;
const ZOOM_MIN = 0.15;
const ZOOM_MAX = 10;

// ─── Support symbols ────────────────────────────────────────────────────────
function SupportSymbol({ node, tr }: { node: FrameNode; tr: Transform }) {
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

// ─── Load arrows ────────────────────────────────────────────────────────────
function ArrowHead({
  x,
  y,
  angle,
  fill = C.loads,
}: {
  x: number;
  y: number;
  angle: number;
  fill?: string;
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

function LoadArrow({
  x1,
  y1,
  x2,
  y2,
  label,
  highlighted,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label?: string;
  highlighted?: boolean;
}) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const color = highlighted ? "#ea580c" : C.loads;
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
function MomentMarker({
  cx,
  cy,
  m,
  scale = 1,
  label,
  highlighted,
}: {
  cx: number;
  cy: number;
  m: number;
  scale?: number;
  label?: string;
  highlighted?: boolean;
}) {
  const color = highlighted ? "#ea580c" : C.loads;
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

// ─── Value label ─────────────────────────────────────────────────────────────
function ValLabel({
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

// ─── Main component ──────────────────────────────────────────────────────────
export default function FrameCanvas({
  model,
  solved,
  viewOpts,
  onNodeMove,
  svgRef,
  highlightedLoadId,
}: Props) {
  const internalRef = useRef<SVGSVGElement>(null);
  const ref = svgRef ?? internalRef;

  // ── Zoom / pan state ────────────────────────────────────────────────────
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Refs to access latest values without stale closures in event handlers
  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  // Sync inside an effect — refs must not be written during render
  useEffect(() => {
    zoomRef.current = zoom;
    panRef.current = pan;
  }, [zoom, pan]);

  // Drag node state
  const dragging = useRef<{
    id: string;
    ox: number;
    oy: number;
    sx: number;
    sy: number;
  } | null>(null);
  // Pan state
  const panning = useRef<{
    startX: number;
    startY: number;
    startPanX: number;
    startPanY: number;
  } | null>(null);

  const tr = useMemo(
    () =>
      makeTransform(
        model.nodes,
        SVG_W,
        SVG_H,
        Math.max(viewOpts.scaleN, viewOpts.scaleQ, viewOpts.scaleM),
      ),
    [model.nodes, viewOpts.scaleN, viewOpts.scaleQ, viewOpts.scaleM],
  );

  // ── Non-passive wheel listener for zoom (prevents page scroll) ──────────
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      const rect = el.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      setZoom((prevZoom) => {
        const newZoom = Math.max(
          ZOOM_MIN,
          Math.min(ZOOM_MAX, prevZoom * factor),
        );
        const ratio = newZoom / prevZoom;
        setPan((p) => ({
          x: cx - (cx - p.x) * ratio,
          y: cy - (cy - p.y) * ratio,
        }));
        return newZoom;
      });
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [ref]);

  // Compute diagram polygons if solved
  const diagrams = useMemo(() => {
    if (!solved || !solved.result.stable) return null;
    const diags: {
      N: ReturnType<typeof buildMemberDiagram>[];
      Q: ReturnType<typeof buildMemberDiagram>[];
      M: ReturnType<typeof buildMemberDiagram>[];
    } = { N: [], Q: [], M: [] };

    // Global maxima
    let maxN = 0,
      maxQ = 0,
      maxM = 0;
    solved.stations.forEach((sts) => {
      sts.forEach((s) => {
        maxN = Math.max(maxN, Math.abs(s.N));
        maxQ = Math.max(maxQ, Math.abs(s.Q));
        maxM = Math.max(maxM, Math.abs(s.M));
      });
    });

    const diagLen = tr.box.diagLen * tr.k; // in pixels

    model.members.forEach((mem, e) => {
      const ni = model.nodes.find((n) => n.id === mem.n1)!;
      const nj = model.nodes.find((n) => n.id === mem.n2)!;
      const stations = solved.stations[e];

      const base = {
        transform: tr,
        nodeI: ni,
        nodeJ: nj,
        stations,
        diagLen,
      };

      (["N", "Q", "M"] as DiagramKey[]).forEach((key) => {
        const gmax = key === "N" ? maxN : key === "Q" ? maxQ : maxM;
        const scale =
          key === "N"
            ? viewOpts.scaleN
            : key === "Q"
              ? viewOpts.scaleQ
              : viewOpts.scaleM;
        const sideSign = key === "M" ? -1 : 1;
        diags[key].push(
          buildMemberDiagram({
            ...base,
            key,
            scale,
            sideSign,
            globalMax: gmax,
          }),
        );
      });
    });
    return diags;
  }, [
    solved,
    tr,
    model.members,
    model.nodes,
    viewOpts.scaleN,
    viewOpts.scaleQ,
    viewOpts.scaleM,
  ]);

  // ── Node drag handling ──────────────────────────────────────────────────
  // (no useCallback — handlers access ref.current; React Compiler auto-memoizes)
  const onNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    const svgEl = ref.current;
    if (!svgEl) return;
    const rect = svgEl.getBoundingClientRect();
    dragging.current = {
      id: nodeId,
      ox: e.clientX - rect.left,
      oy: e.clientY - rect.top,
      sx: e.clientX,
      sy: e.clientY,
    };
  };

  // ── Pan handling (left-click drag on empty canvas) ──────────────────────
  const onSvgMouseDown = (e: React.MouseEvent) => {
    // Only start panning if a node drag isn't already active
    if (dragging.current) return;
    panning.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPanX: panRef.current.x,
      startPanY: panRef.current.y,
    };
    if (ref.current) ref.current.style.cursor = "grabbing";
  };

  const onMouseMove = (e: React.MouseEvent) => {
    // Handle pan
    if (panning.current) {
      const dx = e.clientX - panning.current.startX;
      const dy = e.clientY - panning.current.startY;
      setPan({
        x: panning.current.startPanX + dx,
        y: panning.current.startPanY + dy,
      });
      return;
    }
    // Handle node drag
    if (!dragging.current) return;
    const svgEl = ref.current;
    if (!svgEl) return;
    const rect = svgEl.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    // Undo pan+zoom to get SVG content coordinates, then undo makeTransform
    const contentX = (px - panRef.current.x) / zoomRef.current;
    const contentY = (py - panRef.current.y) / zoomRef.current;
    let wx = (contentX - tr.ox) / tr.k;
    let wy = (tr.oy - contentY) / tr.k;
    // Snap to 0.25m grid
    wx = Math.round(wx / SNAP) * SNAP;
    wy = Math.round(wy / SNAP) * SNAP;
    onNodeMove(dragging.current.id, wx, wy);
  };

  const onMouseUp = () => {
    dragging.current = null;
    panning.current = null;
    if (ref.current) ref.current.style.cursor = "crosshair";
  };

  // ── Zoom button handlers ────────────────────────────────────────────────
  const handleZoomBtn = useCallback((factor: number) => {
    setZoom((z) => {
      const newZ = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z * factor));
      const ratio = newZ / z;
      const cx = SVG_W / 2;
      const cy = SVG_H / 2;
      setPan((p) => ({
        x: cx - (cx - p.x) * ratio,
        y: cy - (cy - p.y) * ratio,
      }));
      return newZ;
    });
  }, []);

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const stable = solved?.result.stable ?? true;

  const btnCls =
    "w-7 h-7 flex items-center justify-center text-sm font-bold " +
    "bg-white/90 dark:bg-stone-800/90 backdrop-blur-sm " +
    "border border-stone-200 dark:border-stone-600 rounded shadow-sm " +
    "hover:bg-stone-50 dark:hover:bg-stone-700 " +
    "text-stone-600 dark:text-stone-300 " +
    "transition-colors select-none";

  return (
    <div className="relative" style={{ display: "inline-block" }}>
      <svg
        ref={ref}
        width={SVG_W}
        height={SVG_H}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        style={{
          background: C.paper,
          userSelect: "none",
          cursor: "crosshair",
          display: "block",
        }}
        onMouseDown={onSvgMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {/* All content inside pan+zoom group */}
        <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
          {/* Grid */}
          {viewOpts.showGrid && <GridLayer tr={tr} />}

          {/* Unstable overlay */}
          {solved && !stable && (
            <text
              x={SVG_W / 2}
              y={SVG_H / 2}
              textAnchor="middle"
              fontSize={18}
              fill="#ef4444"
              fontFamily="monospace"
            >
              Unstable / singular model
            </text>
          )}

          {/* Diagram fills */}
          {diagrams && stable && (
            <>
              {viewOpts.showN &&
                diagrams.N.map((d, e) => (
                  <DiagramLayer
                    key={`N-${e}`}
                    diag={d}
                    type="N"
                    unit={model.unit}
                    showValues={viewOpts.showValues}
                  />
                ))}
              {viewOpts.showQ &&
                diagrams.Q.map((d, e) => (
                  <DiagramLayer
                    key={`Q-${e}`}
                    diag={d}
                    type="Q"
                    unit={model.unit}
                    showValues={viewOpts.showValues}
                  />
                ))}
              {viewOpts.showM &&
                diagrams.M.map((d, e) => (
                  <DiagramLayer
                    key={`M-${e}`}
                    diag={d}
                    type="M"
                    unit={model.unit}
                    showValues={viewOpts.showValues}
                  />
                ))}
            </>
          )}

          {/* Members */}
          {model.members.map((mem) => {
            const ni = model.nodes.find((n) => n.id === mem.n1)!;
            const nj = model.nodes.find((n) => n.id === mem.n2)!;
            if (!ni || !nj) return null;
            return (
              <line
                key={mem.id}
                x1={tr.toSX(ni.x)}
                y1={tr.toSY(ni.y)}
                x2={tr.toSX(nj.x)}
                y2={tr.toSY(nj.y)}
                stroke={stable ? C.member : "#a8a29e"}
                strokeWidth={2.5}
                strokeLinecap="round"
              />
            );
          })}

          {/* Hinges */}
          {model.members.map((mem) => {
            const ni = model.nodes.find((n) => n.id === mem.n1)!;
            const nj = model.nodes.find((n) => n.id === mem.n2)!;
            if (!ni || !nj) return null;
            return (
              <React.Fragment key={`h-${mem.id}`}>
                {mem.relI && (
                  <circle
                    cx={tr.toSX(ni.x)}
                    cy={tr.toSY(ni.y)}
                    r={5}
                    fill={C.paper}
                    stroke={C.member}
                    strokeWidth={1.5}
                  />
                )}
                {mem.relJ && (
                  <circle
                    cx={tr.toSX(nj.x)}
                    cy={tr.toSY(nj.y)}
                    r={5}
                    fill={C.paper}
                    stroke={C.member}
                    strokeWidth={1.5}
                  />
                )}
              </React.Fragment>
            );
          })}

          {/* Supports */}
          {model.nodes
            .filter((n) => n.support !== "free")
            .map((n) => (
              <SupportSymbol key={`sup-${n.id}`} node={n} tr={tr} />
            ))}

          {/* Loads */}
          {viewOpts.showLoads && (
            <LoadsLayer
              model={model}
              tr={tr}
              scale={viewOpts.scaleLoads}
              highlightedLoadId={highlightedLoadId}
            />
          )}

          {/* Reactions */}
          {viewOpts.showReactions && solved && stable && (
            <ReactionsLayer
              model={model}
              solved={solved}
              tr={tr}
              unit={model.unit}
            />
          )}

          {/* Nodes (draggable) */}
          {model.nodes.map((n) => (
            <circle
              key={n.id}
              cx={tr.toSX(n.x)}
              cy={tr.toSY(n.y)}
              r={5}
              fill={stable ? C.node : "#a8a29e"}
              stroke={C.paper}
              strokeWidth={1.5}
              style={{ cursor: "grab" }}
              onMouseDown={(e) => onNodeMouseDown(e, n.id)}
            />
          ))}
        </g>
      </svg>

      {/* ── Zoom controls overlay ─────────────────────────────────────────── */}
      <div className="pointer-events-auto absolute right-2 bottom-2 flex flex-col gap-1">
        <button
          onClick={() => handleZoomBtn(1.25)}
          title="Zoom in"
          className={btnCls}
        >
          +
        </button>
        <button
          onClick={() => handleZoomBtn(1 / 1.25)}
          title="Zoom out"
          className={btnCls}
        >
          −
        </button>
        <button
          onClick={resetView}
          title="Reset view"
          className={`${btnCls} text-xs`}
        >
          ⊙
        </button>
      </div>

      {/* ── Zoom level indicator ──────────────────────────────────────────── */}
      {zoom !== 1 && (
        <div className="pointer-events-none absolute bottom-2 left-2 font-mono text-xs text-stone-400 select-none dark:text-stone-500">
          {Math.round(zoom * 100)}%
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function GridLayer({ tr }: { tr: Transform }) {
  const step = SNAP;
  const minWX = (0 - tr.ox) / tr.k;
  const maxWX = (SVG_W - tr.ox) / tr.k;
  const minWY = (tr.oy - SVG_H) / tr.k;
  const maxWY = tr.oy / tr.k;

  const lines: React.ReactNode[] = [];
  for (let x = Math.ceil(minWX / step) * step; x <= maxWX; x += step) {
    lines.push(
      <line
        key={`gx${x}`}
        x1={tr.toSX(x)}
        y1={0}
        x2={tr.toSX(x)}
        y2={SVG_H}
        stroke={C.grid}
        strokeWidth={0.5}
      />,
    );
  }
  for (let y = Math.ceil(minWY / step) * step; y <= maxWY; y += step) {
    lines.push(
      <line
        key={`gy${y}`}
        x1={0}
        y1={tr.toSY(y)}
        x2={SVG_W}
        y2={tr.toSY(y)}
        stroke={C.grid}
        strokeWidth={0.5}
      />,
    );
  }
  return <g>{lines}</g>;
}

function DiagramLayer({
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
    <g opacity={0.85}>
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

function LoadsLayer({
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

function ReactionsLayer({
  model,
  solved,
  tr,
  unit,
}: {
  model: FrameModel;
  solved: SolveOutput;
  tr: Transform;
  unit: string;
}) {
  const ARROW_LEN = 50;
  const reactions = solved.result.reactions;
  return (
    <g>
      {model.nodes.map((nd, i) => {
        const r = reactions[i];
        if (!r) return null;
        const sx = tr.toSX(nd.x),
          sy = tr.toSY(nd.y);
        const elements: React.ReactNode[] = [];
        if (Math.abs(r.rx) > 0.01) {
          const sign = r.rx > 0 ? 1 : -1;
          elements.push(
            <g key="rx">
              <line
                x1={sx - sign * ARROW_LEN}
                y1={sy}
                x2={sx}
                y2={sy}
                stroke={C.reactions}
                strokeWidth={2}
              />
              <polygon
                points={`${sx},${sy} ${sx - sign * 10},${sy - 5} ${sx - sign * 10},${sy + 5}`}
                fill={C.reactions}
              />
              <text
                x={sx - sign * ARROW_LEN * 0.5}
                y={sy - 8}
                fontSize={9}
                fontFamily="monospace"
                fill={C.reactions}
                textAnchor="middle"
                style={{ paintOrder: "stroke", stroke: "#fff", strokeWidth: 2 }}
              >
                {r.rx.toFixed(1)}
                {unit}
              </text>
            </g>,
          );
        }
        if (Math.abs(r.ry) > 0.01) {
          const sign = r.ry > 0 ? -1 : 1; // positive ry means upward (screen y decreases)
          elements.push(
            <g key="ry">
              <line
                x1={sx}
                y1={sy - sign * ARROW_LEN}
                x2={sx}
                y2={sy}
                stroke={C.reactions}
                strokeWidth={2}
              />
              <polygon
                points={`${sx},${sy} ${sx - 5},${sy + sign * 10} ${sx + 5},${sy + sign * 10}`}
                fill={C.reactions}
              />
              <text
                x={sx + 12}
                y={sy - sign * ARROW_LEN * 0.5}
                fontSize={9}
                fontFamily="monospace"
                fill={C.reactions}
                style={{ paintOrder: "stroke", stroke: "#fff", strokeWidth: 2 }}
              >
                {r.ry.toFixed(1)}
                {unit}
              </text>
            </g>,
          );
        }
        if (Math.abs(r.rm) > 0.01) {
          elements.push(
            <g key="rm">
              <path
                d={`M${sx + 18},${sy} A18,18 0 1,1 ${sx + 18 * Math.cos(Math.PI * 1.5)},${sy + 18 * Math.sin(Math.PI * 1.5)}`}
                fill="none"
                stroke={C.reactions}
                strokeWidth={2}
              />
              <text
                x={sx + 24}
                y={sy - 18}
                fontSize={9}
                fontFamily="monospace"
                fill={C.reactions}
                style={{ paintOrder: "stroke", stroke: "#fff", strokeWidth: 2 }}
              >
                {r.rm.toFixed(1)}
                {unit}
              </text>
            </g>,
          );
        }
        return <g key={nd.id}>{elements}</g>;
      })}
    </g>
  );
}
