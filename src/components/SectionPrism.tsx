"use client";

import React, { useMemo } from "react";
import { SectionCutData, StressField, memberStressField, sectionOutline, sectionRects, stressAt } from "@/lib/sectionCut";
import type { Profile } from "@/lib/profiles";
import type { Station3D } from "@/lib/sampling3d";
import { SectionLoad } from "@/lib/sectionLoads";
import { Head, unit2, P2 } from "./canvas3d/arrows3d";
import FullscreenFigure from "./FullscreenFigure";
import { useColors } from "@/contexts/ColorContext";
import { useLanguage } from "@/contexts/LanguageContext";

// Oblique view of the whole member: x right, y up, z (the member's axis) receding up and to the
// right, z = 0 at the front end. The sides are painted with σ at every z (so you see it vary along
// the member, e.g. the column's base against its top); the plate that slides along z with the
// slider is the cut, painted with the σ of that section. Tension and compression fibres use the
// app's tension / compression colours, the opacity proportional to |σ| / the member's largest |σ|.
const W = 700,
  H = 330;
export const LEGEND_X = 470; // left edge of the legend (exported for the test that checks it fits)
const CX = 190,
  CY = 200;
const DEPTH = 1.3; // drawn length of the member as a multiple of the section's larger side
const DX = 0.62,
  DY = 0.42; // screen direction of the member axis (per unit of depth)
const N_EDGE = 8; // cells per side edge
const N_Z = 26; // slices along z
const N_FRONT = 14; // cells along the longer side of a front rectangle

const LOAD_COLORS = { q: "#2563eb", R: "#9333ea" } as const;
const MAX_ARROW = 95; // px of the largest component of each kind
// two decimals, none from 100 up: the legend has to fit in the figure with kg-sized numbers
const fmt = (v: number) => (Math.abs(v) < 5e-3 ? "0" : Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(2));

// The sides of the member, painted slice by slice with σ(z). They depend on the member only, not on
// where the cut is, so this is memoised: moving the slider must not repaint ~1300 polygons.
const PrismSides = React.memo(function PrismSides({
  profile,
  rotated,
  field,
  L,
  s,
  offX,
  offY,
  sMax,
  tension,
  compression,
}: {
  profile: Profile;
  rotated: boolean;
  field: StressField;
  L: number;
  s: number;
  offX: number;
  offY: number;
  sMax: number;
  tension: string;
  compression: string;
}) {
  const scr = (xMm: number, yMm: number, f = 0): [number, number] => [CX + xMm * s + offX * f, CY - yMm * s + offY * f];
  const pts = (...ps: [number, number][]) => ps.map(([a, b]) => `${a},${b}`).join(" ");
  const paint = (v: number) => ({
    fill: v >= 0 ? tension : compression,
    fillOpacity: 0.12 + 0.83 * Math.min(1, Math.abs(v) / sMax),
  });
  const outline = sectionOutline(profile, rotated);
  const cw = outline.reduce((acc, [x1, y1], i) => {
    const [x2, y2] = outline[(i + 1) % outline.length];
    return acc + (x2 - x1) * (y2 + y1);
  }, 0); // > 0: clockwise in y-up coordinates
  const sides: React.ReactElement[] = [];
  // far edges first: the viewer is on the +x, +y side, so a larger x·DX + y·DY is nearer
  const edges = outline
    .map(([x1, y1], i) => {
      const [x2, y2] = outline[(i + 1) % outline.length];
      return { i, x1, y1, ex: x2 - x1, ey: y2 - y1 };
    })
    .filter(({ ex, ey }) => (cw > 0 ? ey : -ey) * DX + (cw > 0 ? -ex : ex) * DY > 1e-9) // faces towards the viewer
    .sort((a, b) => (a.x1 + a.ex / 2) * DX + (a.y1 + a.ey / 2) * DY - ((b.x1 + b.ex / 2) * DX + (b.y1 + b.ey / 2) * DY));
  edges.forEach(({ i, x1, y1, ex, ey }) => {
    for (let k = 0; k < N_EDGE; k++) {
      const a = k / N_EDGE,
        b = (k + 1) / N_EDGE;
      const xa = x1 + ex * a,
        ya = y1 + ey * a,
        xb = x1 + ex * b,
        yb = y1 + ey * b;
      for (let j = 0; j < N_Z; j++) {
        const f0 = j / N_Z,
          f1 = (j + 1) / N_Z;
        const v = field.at((xa + xb) / 2000, (ya + yb) / 2000, ((f0 + f1) / 2) * L);
        sides.push(
          <polygon
            key={`s${i}-${k}-${j}`}
            points={pts(scr(xa, ya, f0), scr(xb, yb, f0), scr(xb, yb, f1), scr(xa, ya, f1))}
            {...paint(v)}
            stroke="none"
          />,
        );
      }
    }
  });
  return <g data-testid="prism-sides">{sides}</g>;
});

export default function SectionPrism({
  data,
  loads = [],
  unit = "",
  controls,
  stations,
  L,
}: {
  data: SectionCutData;
  loads?: SectionLoad[];
  unit?: string;
  controls?: React.ReactNode; // shown inside the figure while it is full screen
  stations: Station3D[]; // the member's stations: σ(z) comes from them
  L: number; // member length, m
}) {
  const { t } = useLanguage();
  const colors = useColors();
  const p = data.profile;
  const wMm = data.rotated ? p.h : p.bf,
    hMm = data.rotated ? p.bf : p.h;
  const s = 150 / Math.max(wMm, hMm); // px per mm
  const depth = DEPTH * Math.max(wMm, hMm) * s; // px
  const off: [number, number] = [DX * depth, -DY * depth]; // screen offset of the far end
  const { A, Ix, Iy, halfX, halfY } = data;
  const field = useMemo(() => memberStressField({ A, Ix, Iy, halfX, halfY }, stations), [A, Ix, Iy, halfX, halfY, stations]);
  const sMax = Math.max(1e-9, field.maxAbs);
  const zf = L > 0 ? Math.min(1, Math.max(0, data.z / L)) : 0; // where the cut is, 0..1 along the member

  const sig = (xMm: number, yMm: number) => stressAt(data, xMm / 1000, yMm / 1000);
  const paint = (v: number) => ({
    fill: v >= 0 ? colors.tension : colors.compression,
    fillOpacity: 0.12 + 0.83 * Math.min(1, Math.abs(v) / sMax),
  });
  // screen point of (x, y) mm on the section at fraction f (0..1) of the member's length
  const scr = (xMm: number, yMm: number, f = 0): [number, number] => [CX + xMm * s + off[0] * f, CY - yMm * s + off[1] * f];
  const pts = (...ps: [number, number][]) => ps.map(([a, b]) => `${a},${b}`).join(" ");

  // side faces: outline edges whose outward normal tilts toward the receding direction
  const outline = sectionOutline(p, data.rotated);
  const cw = outline.reduce((acc, [x1, y1], i) => {
    const [x2, y2] = outline[(i + 1) % outline.length];
    return acc + (x2 - x1) * (y2 + y1);
  }, 0); // > 0: clockwise in y-up coordinates
  // the section painted cell by cell at fraction f of the member, with σ given by `sigmaOf`
  const plate = (keyPrefix: string, f: number, sigmaOf: (xMm: number, yMm: number) => number) => {
    const cells: React.ReactElement[] = [];
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
          cells.push(
            <polygon
              key={`${keyPrefix}${r}-${i}-${j}`}
              points={pts(scr(xa, ya, f), scr(xb, ya, f), scr(xb, yb, f), scr(xa, yb, f))}
              {...paint(sigmaOf((xa + xb) / 2, (ya + yb) / 2))}
              stroke="none"
            />,
          );
        }
    });
    return cells;
  };
  const front = plate("f", zf, sig); // the cut
  const cutC = scr(0, 0, zf); // centroid of the cut
  const startOutline = pts(...outline.map(([x, y]) => scr(x, y)));
  const cutOutline = pts(...outline.map(([x, y]) => scr(x, y, zf)));
  const backOutline = pts(...outline.map(([x, y]) => scr(x, y, 1)));
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
        {/* far end of the member, then the visible sides (σ along z), the z = 0 end, the z axis and the cut */}
        <polygon points={backOutline} fill="none" stroke={colors.ink} strokeOpacity={0.35} strokeDasharray="3 3" />
        <PrismSides
          profile={p}
          rotated={data.rotated}
          field={field}
          L={L}
          s={s}
          offX={off[0]}
          offY={off[1]}
          sMax={sMax}
          tension={colors.tension}
          compression={colors.compression}
        />
        {outline.map(([x, y], i) => {
          const [x2, y2] = outline[(i + 1) % outline.length];
          const ex = x2 - x,
            ey = y2 - y;
          const vis = (cw > 0 ? ey : -ey) * DX + (cw > 0 ? -ex : ex) * DY > 1e-9;
          return vis ? (
            <line key={i} x1={scr(x, y)[0]} y1={scr(x, y)[1]} x2={scr(x, y, 1)[0]} y2={scr(x, y, 1)[1]} stroke={colors.ink} strokeOpacity={0.3} />
          ) : null;
        })}
        <polygon points={startOutline} fill="none" stroke={colors.ink} strokeOpacity={0.35} strokeDasharray="3 3" />

        {/* member axis with the position of the cut */}
        <g data-testid="prism-z-axis" stroke={colors.dimensions} fill={colors.dimensions} fontSize={11}>
          <line x1={scr(0, 0)[0]} y1={scr(0, 0)[1]} x2={scr(0, 0, 1)[0] + 22} y2={scr(0, 0, 1)[1] - 15} strokeDasharray="2 3" />
          <circle cx={scr(0, 0)[0]} cy={scr(0, 0)[1]} r={2.5} stroke="none" />
          <circle cx={scr(0, 0, 1)[0]} cy={scr(0, 0, 1)[1]} r={2.5} stroke="none" />
          <text
            x={scr(-data.halfX * 1000, -data.halfY * 1000)[0] - 8}
            y={scr(-data.halfX * 1000, -data.halfY * 1000)[1] + 16}
            textAnchor="end"
            stroke="none"
          >
            z = 0
          </text>
          <text
            x={scr(data.halfX * 1000, data.halfY * 1000, 1)[0] + 12}
            y={scr(data.halfX * 1000, data.halfY * 1000, 1)[1] - 4}
            stroke="none"
          >
            z = {L.toFixed(2)} m
          </text>
        </g>

        <polygon points={cutOutline} fill={colors.paper} /> {/* opaque, so the cut reads as a solid plate */}
        <g data-testid="prism-front">{front}</g>
        <polygon points={cutOutline} fill="none" stroke={colors.ink} strokeWidth={2} />
        <circle data-testid="prism-cut-marker" cx={cutC[0]} cy={cutC[1]} r={3} fill={colors.ink} />

        {/* neutral axis on the cut */}
        {data.neutral && (
          <line
            data-testid="prism-neutral"
            x1={scr(data.neutral[0][0] * 1000, data.neutral[0][1] * 1000, zf)[0]}
            y1={scr(data.neutral[0][0] * 1000, data.neutral[0][1] * 1000, zf)[1]}
            x2={scr(data.neutral[1][0] * 1000, data.neutral[1][1] * 1000, zf)[0]}
            y2={scr(data.neutral[1][0] * 1000, data.neutral[1][1] * 1000, zf)[1]}
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
          const o: P2 = cutC;
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
          const [px, py] = scr(data.critical.x * 1000, data.critical.y * 1000, zf);
          return (
            <g data-testid="prism-critical">
              <circle cx={px} cy={py} r={9} fill="none" stroke="#fff" strokeWidth={3} />
              <circle cx={px} cy={py} r={9} fill="none" stroke={colors.ink} strokeWidth={2} />
            </g>
          );
        })()}

        {/* corner σ on the cut */}
        {data.corners.map((c, i) => {
          const [px, py] = scr(lbl[i][0] * 1000, lbl[i][1] * 1000, zf);
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
            const o: P2 = [600, 285];
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
          <text x={530} y={322} fontSize={10} fontWeight={400} fill={colors.dimensions}>
            {t("f3d.cut.local")}
          </text>
        </g>

        {/* legend */}
        <g fontSize={12} fill={colors.ink}>
          <rect x={LEGEND_X} y={20} width={14} height={14} fill={colors.tension} fillOpacity={0.8} />
          <text x={LEGEND_X + 20} y={32}>
            {t("f3d.cut.tension")}
          </text>
          <rect x={LEGEND_X} y={42} width={14} height={14} fill={colors.compression} fillOpacity={0.8} />
          <text x={LEGEND_X + 20} y={54}>
            {t("f3d.cut.compression")}
          </text>
          <line x1={LEGEND_X} y1={72} x2={LEGEND_X + 14} y2={72} stroke="#ca8a04" strokeWidth={2} strokeDasharray="4 2" />
          <text x={LEGEND_X + 20} y={76}>
            {t("f3d.cut.neutral")}
          </text>
          <circle cx={LEGEND_X + 7} cy={92} r={7} fill="none" stroke={colors.ink} strokeWidth={2} />
          <text x={LEGEND_X + 20} y={96}>
            {t("f3d.cut.critical")}
          </text>
          {loads.map((l, i) => {
            const y = 126 + i * 56;
            const [fx, fy, fz] = l.force;
            return (
              <g key={`${l.kind}-${l.id}`} fontFamily="monospace" fontSize={11}>
                <rect x={LEGEND_X} y={y - 10} width={10} height={10} fill={LOAD_COLORS[l.kind]} />
                <text x={LEGEND_X + 16} y={y}>
                  {l.kind === "q" ? `q ${l.id}` : `${t("f3d.cut.reaction")} ${l.id}`}
                </text>
                <text x={LEGEND_X + 16} y={y + 13}>
                  ({fmt(fx)}, {fmt(fy)}, {fmt(fz)}) {unit}
                  {l.kind === "q" ? "/m" : ""}
                </text>
                {l.moment && (
                  <text x={LEGEND_X + 16} y={y + 26}>
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
