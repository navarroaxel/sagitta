"use client";

import React, {
  useMemo,
  useCallback,
  useRef,
  useState,
  useEffect,
} from "react";
import { FrameModel } from "@/lib/types";
import { SolveOutput } from "@/lib/solve";
import { makeTransform } from "@/lib/geometry";
import { buildMemberDiagram, DiagramKey } from "@/lib/diagram";
import { SVG_W, SVG_H, ZOOM_MIN, ZOOM_MAX } from "./canvas/constants";
import { useColors } from "@/contexts/ColorContext";
import { usePrefs } from "@/contexts/PrefsContext";
import { SupportSymbol } from "./canvas/SupportSymbol";
import { GridLayer } from "./canvas/GridLayer";
import { DimensionsLayer } from "./canvas/DimensionsLayer";
import { DiagramLayer } from "./canvas/DiagramLayer";
import { LoadsLayer } from "./canvas/LoadsLayer";
import { ReactionsLayer } from "./canvas/ReactionsLayer";

export interface ViewOptions {
  showN: boolean;
  showQ: boolean;
  showM: boolean;
  showReactions: boolean;
  showLoads: boolean;
  showValues: boolean;
  showGrid: boolean;
  showMemberLabels: boolean;
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
  svgOverlay?: React.ReactNode;
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function FrameCanvas({
  model,
  solved,
  viewOpts,
  onNodeMove,
  svgRef,
  highlightedLoadId,
  svgOverlay,
}: Props) {
  const colors = useColors();
  const { snap, showLoadUnits, showDimensions } = usePrefs();
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
    // Snap to the grid increment (preference)
    wx = Math.round(wx / snap) * snap;
    wy = Math.round(wy / snap) * snap;
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
          background: colors.paper,
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
          {viewOpts.showGrid && <GridLayer tr={tr} snap={snap} />}

          {/* Dimension lines (cotas) */}
          {showDimensions && <DimensionsLayer tr={tr} model={model} />}

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
                data-testid="member"
                x1={tr.toSX(ni.x)}
                y1={tr.toSY(ni.y)}
                x2={tr.toSX(nj.x)}
                y2={tr.toSY(nj.y)}
                stroke={stable ? colors.member : "#a8a29e"}
                strokeWidth={2.5}
                strokeLinecap="round"
              />
            );
          })}

          {/* Member labels */}
          {viewOpts.showMemberLabels &&
            model.members.map((mem) => {
              const ni = model.nodes.find((n) => n.id === mem.n1)!;
              const nj = model.nodes.find((n) => n.id === mem.n2)!;
              if (!ni || !nj) return null;
              const sx1 = tr.toSX(ni.x), sy1 = tr.toSY(ni.y);
              const sx2 = tr.toSX(nj.x), sy2 = tr.toSY(nj.y);
              const mx = (sx1 + sx2) / 2;
              const my = (sy1 + sy2) / 2;
              const segLen = Math.hypot(sx2 - sx1, sy2 - sy1);
              const px = segLen > 0 ? -(sy2 - sy1) / segLen : 0;
              const py = segLen > 0 ? (sx2 - sx1) / segLen : -1;
              return (
                <text
                  key={`lbl-${mem.id}`}
                  x={mx + px * 10}
                  y={my + py * 10}
                  fontSize={9}
                  fontFamily="monospace"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={colors.member}
                  style={{ paintOrder: "stroke", stroke: colors.paper, strokeWidth: 3 }}
                >
                  {mem.id}
                </text>
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
                    fill={colors.paper}
                    stroke={colors.member}
                    strokeWidth={1.5}
                  />
                )}
                {mem.relJ && (
                  <circle
                    cx={tr.toSX(nj.x)}
                    cy={tr.toSY(nj.y)}
                    r={5}
                    fill={colors.paper}
                    stroke={colors.member}
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
              unit={model.unit}
              showUnit={showLoadUnits}
            />
          )}

          {/* Reactions */}
          {viewOpts.showReactions && solved && stable && (
            <ReactionsLayer
              model={model}
              solved={solved}
              tr={tr}
              unit={model.unit}
              showUnit={showLoadUnits}
            />
          )}

          {/* Nodes (draggable) */}
          {model.nodes.map((n) => (
            <circle
              key={n.id}
              data-testid="node"
              cx={tr.toSX(n.x)}
              cy={tr.toSY(n.y)}
              r={5}
              fill={stable ? colors.node : "#a8a29e"}
              stroke={colors.paper}
              strokeWidth={1.5}
              style={{ cursor: "grab" }}
              onMouseDown={(e) => onNodeMouseDown(e, n.id)}
            />
          ))}

          {/* Optional overlay (learn page construction geometry) */}
          {svgOverlay}
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
