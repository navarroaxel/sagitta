"use client";

import React from "react";
import { SectionCutData, sectionOutline, sectionRects, stressAt } from "@/lib/sectionCut";
import { SectionLoad } from "@/lib/sectionLoads";
import { Head, unit2, P2 } from "./canvas3d/arrows3d";
import FullscreenFigure from "./FullscreenFigure";
import { useColors } from "@/contexts/ColorContext";
import { useLanguage } from "@/contexts/LanguageContext";

// Oblique view of a short stub of the member behind the cut: x right, y up, z (the member's axis)
// receding up and to the right. σ is constant along the stub, so the sides are painted with the
// cut's σ(x, y) field; the front face is the cut itself. Tension and compression fibres use the
// app's tension / compression colours, with the opacity proportional to |σ| / |σ|max.
const W = 620,
  H = 330;
const CX = 190,
  CY = 190;
const DEPTH = 0.9; // stub length as a multiple of the section's larger side
const DX = 0.62,
  DY = 0.42; // screen direction of the member axis (per unit of depth)
const N_EDGE = 10; // cells per side edge
const N_FRONT = 14; // cells along the longer side of a front rectangle

const LOAD_COLORS = { q: "#2563eb", R: "#9333ea" } as const;
const MAX_ARROW = 95; // px of the largest component of each kind
// two decimals, none from 100 up: the legend has to fit in the figure with kg-sized numbers
const fmt = (v: number) => (Math.abs(v) < 5e-3 ? "0" : Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(2));

export default function SectionPrism({
  data,
  loads = [],
  unit = "",
  controls,
}: {
  data: SectionCutData;
  loads?: SectionLoad[];
  unit?: string;
  controls?: React.ReactNode; // shown inside the figure while it is full screen
}) {
  const { t } = useLanguage();
  const colors = useColors();
  const p = data.profile;
  const wMm = data.rotated ? p.h : p.bf,
    hMm = data.rotated ? p.bf : p.h;
  const s = 150 / Math.max(wMm, hMm); // px per mm
  const depth = DEPTH * Math.max(wMm, hMm) * s; // px
  const off: [number, number] = [DX * depth, -DY * depth]; // screen offset of the far end
  const sMax = Math.max(1e-9, ...data.corners.map((c) => Math.abs(c.sigma)));

  const sig = (xMm: number, yMm: number) => stressAt(data, xMm / 1000, yMm / 1000);
  const paint = (v: number) => ({
    fill: v >= 0 ? colors.tension : colors.compression,
    fillOpacity: 0.12 + 0.83 * Math.min(1, Math.abs(v) / sMax),
  });
  const scr = (xMm: number, yMm: number, far = false): [number, number] => [
    CX + xMm * s + (far ? off[0] : 0),
    CY - yMm * s + (far ? off[1] : 0),
  ];
  const pts = (...ps: [number, number][]) => ps.map(([a, b]) => `${a},${b}`).join(" ");

  // side faces: outline edges whose outward normal tilts toward the receding direction
  const outline = sectionOutline(p, data.rotated);
  const cw = outline.reduce((acc, [x1, y1], i) => {
    const [x2, y2] = outline[(i + 1) % outline.length];
    return acc + (x2 - x1) * (y2 + y1);
  }, 0); // > 0: clockwise in y-up coordinates
  const sides: React.ReactElement[] = [];
  outline.forEach(([x1, y1], i) => {
    const [x2, y2] = outline[(i + 1) % outline.length];
    const ex = x2 - x1,
      ey = y2 - y1;
    const nx = cw > 0 ? ey : -ey,
      ny = cw > 0 ? -ex : ex; // outward normal
    if (nx * DX + ny * DY <= 1e-9) return;
    for (let k = 0; k < N_EDGE; k++) {
      const a = k / N_EDGE,
        b = (k + 1) / N_EDGE;
      const xa = x1 + ex * a,
        ya = y1 + ey * a,
        xb = x1 + ex * b,
        yb = y1 + ey * b;
      sides.push(
        <polygon
          key={`s${i}-${k}`}
          points={pts(scr(xa, ya), scr(xb, yb), scr(xb, yb, true), scr(xa, ya, true))}
          {...paint(sig((xa + xb) / 2, (ya + yb) / 2))}
          stroke="none"
        />,
      );
    }
  });
  const front: React.ReactElement[] = [];
  sectionRects(p, data.rotated).forEach(([x0, y0, x1, y1], r) => {
    const long = Math.max(x1 - x0, y1 - y0);
    const nx = Math.max(1, Math.round(((x1 - x0) / long) * N_FRONT)),
      ny = Math.max(1, Math.round(((y1 - y0) / long) * N_FRONT));
    for (let i = 0; i < nx; i++)
      for (let j = 0; j < ny; j++) {
        const xa = x0 + ((x1 - x0) * i) / nx,
          xb = x0 + ((x1 - x0) * (i + 1)) / nx,
          ya = y0 + ((y1 - y0) * j) / ny,
          yb = y0 + ((y1 - y0) * (j + 1)) / ny;
        front.push(
          <polygon
            key={`f${r}-${i}-${j}`}
            points={pts(scr(xa, ya), scr(xb, ya), scr(xb, yb), scr(xa, yb))}
            {...paint(sig((xa + xb) / 2, (ya + yb) / 2))}
            stroke="none"
          />,
        );
      }
  });

  const frontOutline = pts(...outline.map(([x, y]) => scr(x, y)));
  const backOutline = pts(...outline.map(([x, y]) => scr(x, y, true)));
  const lbl: [number, number][] = [
    [data.halfX, data.halfY],
    [data.halfX, -data.halfY],
    [-data.halfX, data.halfY],
    [-data.halfX, -data.halfY],
  ];
  return (
    <div data-testid="section-prism">
      <FullscreenFigure testId="fs-cut-prism" controls={controls}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ background: colors.paper, maxWidth: W }}>
        {/* far end of the stub, then the visible sides, then the cut */}
        <polygon points={backOutline} fill="none" stroke={colors.ink} strokeOpacity={0.35} strokeDasharray="3 3" />
        <g data-testid="prism-sides">{sides}</g>
        {outline.map(([x, y], i) => {
          const [x2, y2] = outline[(i + 1) % outline.length];
          const ex = x2 - x,
            ey = y2 - y;
          const vis = (cw > 0 ? ey : -ey) * DX + (cw > 0 ? -ex : ex) * DY > 1e-9;
          return vis ? (
            <line key={i} x1={scr(x, y)[0]} y1={scr(x, y)[1]} x2={scr(x, y, true)[0]} y2={scr(x, y, true)[1]} stroke={colors.ink} strokeOpacity={0.3} />
          ) : null;
        })}
        <g data-testid="prism-front">{front}</g>
        <polygon points={frontOutline} fill="none" stroke={colors.ink} strokeWidth={1.5} />

        {/* neutral axis on the cut */}
        {data.neutral && (
          <line
            data-testid="prism-neutral"
            x1={scr(data.neutral[0][0] * 1000, data.neutral[0][1] * 1000)[0]}
            y1={scr(data.neutral[0][0] * 1000, data.neutral[0][1] * 1000)[1]}
            x2={scr(data.neutral[1][0] * 1000, data.neutral[1][1] * 1000)[0]}
            y2={scr(data.neutral[1][0] * 1000, data.neutral[1][1] * 1000)[1]}
            stroke="#ca8a04"
            strokeWidth={2}
            strokeDasharray="7 4"
          />
        )}

        {/* loads of the member in the section's axes: tip at the centroid, shaft trailing the force */}
        {loads.map((l) => {
          const color = LOAD_COLORS[l.kind];
          const big = Math.max(
            1e-9,
            ...loads.filter((o) => o.kind === l.kind).map((o) => Math.max(...o.force.map(Math.abs))),
          );
          const k = MAX_ARROW / big;
          const o: P2 = [CX, CY];
          const parts: { key: string; v: P2 }[] = [
            { key: "xy", v: [l.force[0] * k, -l.force[1] * k] },
            { key: "z", v: [l.force[2] * k * DX, -l.force[2] * k * DY] },
          ];
          return (
            <g key={`${l.kind}-${l.id}`} data-testid={`sload-${l.kind}-${l.id}`}>
              {parts.map(({ key, v }) => {
                const d = unit2(v);
                if (!d || Math.hypot(...v) < 6) return null;
                return (l.kind === "q" && key === "xy" ? [-1, 0, 1] : [0]).map((j) => {
                  const tip: P2 = [o[0] - d[1] * j * 16, o[1] + d[0] * j * 16];
                  const tail: P2 = [tip[0] - v[0], tip[1] - v[1]];
                  return (
                    <g key={`${key}${j}`} data-testid={key === "z" ? `sload-z-${l.kind}-${l.id}` : undefined}>
                      <line x1={tail[0]} y1={tail[1]} x2={tip[0]} y2={tip[1]} stroke={color} strokeWidth={2.5} />
                      <Head tip={tip} d={d} size={9} color={color} />
                    </g>
                  );
                });
              })}
            </g>
          );
        })}

        {/* the most stressed corner: where the loads above end up (black ring with a white halo, to read over red) */}
        {(() => {
          const [px, py] = scr(data.critical.x * 1000, data.critical.y * 1000);
          return (
            <g data-testid="prism-critical">
              <circle cx={px} cy={py} r={9} fill="none" stroke="#fff" strokeWidth={3} />
              <circle cx={px} cy={py} r={9} fill="none" stroke={colors.ink} strokeWidth={2} />
            </g>
          );
        })()}

        {/* corner σ on the cut */}
        {data.corners.map((c, i) => {
          const [px, py] = scr(lbl[i][0] * 1000, lbl[i][1] * 1000);
          return (
            <text
              key={i}
              x={px + (lbl[i][0] > 0 ? 6 : -6)}
              y={py + (lbl[i][1] > 0 ? -6 : 14)}
              textAnchor={lbl[i][0] > 0 ? "start" : "end"}
              fontSize={11}
              fontFamily="monospace"
              fontWeight={700}
              fill={c.sigma >= 0 ? colors.tension : colors.compression}
              style={{ paintOrder: "stroke", stroke: "#fff", strokeWidth: 3 }}
            >
              {c.sigma >= 0 ? "+" : ""}
              {c.sigma.toFixed(2)}
            </text>
          );
        })}

        {/* member axis */}
        <g stroke={colors.dimensions} fill={colors.dimensions} fontSize={11} fontWeight={600}>
          <line x1={CX} y1={CY} x2={CX + off[0] + 30} y2={CY + off[1] - 20} strokeDasharray="2 3" />
          <text x={CX + off[0] + 34} y={CY + off[1] - 20} stroke="none">
            z
          </text>
        </g>

        {/* the section's own triad: x right, y up, z into the page (same colours as the canvas) */}
        <g data-testid="prism-local-axes" fontSize={12} fontWeight={700}>
          {(
            [
              { name: "x", v: [1, 0] as P2, color: "#dc2626" },
              { name: "y", v: [0, -1] as P2, color: "#16a34a" },
              { name: "z", v: [DX, -DY] as P2, color: "#2563eb" },
            ] as const
          ).map(({ name, v, color }) => {
            const d = unit2([...v] as P2)!;
            const o: P2 = [440, 280];
            const tip: P2 = [o[0] + d[0] * 42, o[1] + d[1] * 42];
            return (
              <g key={name} data-axis={name}>
                <line x1={o[0]} y1={o[1]} x2={tip[0]} y2={tip[1]} stroke={color} strokeWidth={2} />
                <Head tip={tip} d={d} size={7} color={color} />
                <text x={tip[0] + d[0] * 8 - 4} y={tip[1] + d[1] * 8 + 4} fill={color}>
                  {name}
                </text>
              </g>
            );
          })}
          <text x={370} y={322} fontSize={10} fontWeight={400} fill={colors.dimensions}>
            {t("f3d.cut.local")}
          </text>
        </g>

        {/* legend */}
        <g fontSize={12} fill={colors.ink}>
          <rect x={400} y={20} width={14} height={14} fill={colors.tension} fillOpacity={0.8} />
          <text x={420} y={32}>
            {t("f3d.cut.tension")}
          </text>
          <rect x={400} y={42} width={14} height={14} fill={colors.compression} fillOpacity={0.8} />
          <text x={420} y={54}>
            {t("f3d.cut.compression")}
          </text>
          <line x1={400} y1={72} x2={414} y2={72} stroke="#ca8a04" strokeWidth={2} strokeDasharray="4 2" />
          <text x={420} y={76}>
            {t("f3d.cut.neutral")}
          </text>
          <circle cx={407} cy={92} r={7} fill="none" stroke={colors.ink} strokeWidth={2} />
          <text x={420} y={96}>
            {t("f3d.cut.critical")}
          </text>
          {loads.map((l, i) => {
            const y = 126 + i * 56;
            const [fx, fy, fz] = l.force;
            return (
              <g key={`${l.kind}-${l.id}`} fontFamily="monospace" fontSize={11}>
                <rect x={400} y={y - 10} width={10} height={10} fill={LOAD_COLORS[l.kind]} />
                <text x={416} y={y}>
                  {l.kind === "q" ? `q ${l.id}` : `${t("f3d.cut.reaction")} ${l.id}`}
                </text>
                <text x={416} y={y + 13}>
                  ({fmt(fx)}, {fmt(fy)}, {fmt(fz)}) {unit}
                  {l.kind === "q" ? "/m" : ""}
                </text>
                {l.moment && (
                  <text x={416} y={y + 26}>
                    M ({fmt(l.moment[0])}, {fmt(l.moment[1])}, {fmt(l.moment[2])}) {unit}·m
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
      </FullscreenFigure>
      <p className="text-xs text-stone-500 dark:text-stone-400">{t("f3d.cut.prism_note")}</p>
    </div>
  );
}
