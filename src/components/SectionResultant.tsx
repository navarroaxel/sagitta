"use client";

import React from "react";
import { SIGMA_EPS, SectionCutData, sectionOutline } from "@/lib/sectionCut";
import { resultantLayout } from "@/lib/resultantDiagram";
import FullscreenFigure from "./FullscreenFigure";
import SignMark from "./SignMark";
import { useColors } from "@/contexts/ColorContext";
import { useLanguage } from "@/contexts/LanguageContext";

// The professor's resultant ("oblique") diagram in its own figure, in the plane of the section:
// the profile, the neutral axis (E.N.), the two lines parallel to it through the extreme fibres,
// and σ plotted on a baseline between those lines as two triangles (+ to one side, − to the other).
const CX = 230,
  CY = 150;
const K_MAX = 60; // px of the largest ordinate
const EXT = 30; // px the parallels stick out past the extreme corners
const P = (a: [number, number]) => `${a[0]},${a[1]}`;

export default function SectionResultant({ data, controls }: { data: SectionCutData; controls?: React.ReactNode }) {
  const { t } = useLanguage();
  const colors = useColors();
  const pos = colors.tension,
    neg = colors.compression;
  const col = (v: number) => (v >= 0 ? pos : neg);

  const p = data.profile;
  const wMm = data.rotated ? p.h : p.bf,
    hMm = data.rotated ? p.bf : p.h;
  const s = 170 / Math.max(wMm, hMm);
  const hw = (wMm / 2) * s,
    hh = (hMm / 2) * s;
  const outline = sectionOutline(p, data.rotated)
    .map(([x, y]) => `${CX + x * s},${CY - y * s}`)
    .join(" ");

  // the baseline sits clear of the section: the negative ordinates run back along their parallel
  const l = resultantLayout(data, { cx: CX, cy: CY, s, dist: Math.hypot(hw, hh) + K_MAX + 40 });
  // everything that gets drawn, to frame the figure around it
  const pts: [number, number][] = [
    [CX - hw, CY - hh - 20],
    [CX + hw, CY + hh],
    [CX - hw, CY + hh],
  ];

  let body: React.ReactNode = null;
  if (!l) {
    // σ is the same everywhere: zero (a free end with nothing on it) or only N. No neutral axis to draw.
    const sig = data.corners.reduce((acc, c) => acc + c.sigma, 0) / data.corners.length;
    const zero = Math.max(...data.corners.map((c) => Math.abs(c.sigma))) < SIGMA_EPS;
    const x0 = CX + hw + 40;
    body = (
      <g data-testid="cut-resultant-uniform" fontSize={12}>
        {!zero && <SignMark x={x0 + 8} y={CY - 4} sign={sig >= 0 ? 1 : -1} color={col(sig)} />}
        <text x={x0 + (zero ? 0 : 24)} y={CY} fill={zero ? colors.ink : col(sig)} fontWeight={700}>
          {zero ? t("f3d.cut.uniform_zero") : `${t("f3d.cut.uniform")} = ${sig.toFixed(2)}`}
        </text>
        <text x={x0 + (zero ? 0 : 24)} y={CY + 18} fill={colors.dimensions} fontSize={11}>
          {zero ? t("f3d.cut.uniform_zero_why") : t("f3d.cut.uniform_why")}
        </text>
      </g>
    );
  }
  if (l) {
    const n = l.n; // ordinates lie along the parallels
    const k = K_MAX / Math.max(Math.abs(l.hi.sigma), Math.abs(l.lo.sigma), 1e-12);
    const ord = (tt: number): [number, number] => {
      const [x, y] = l.at(tt);
      const v = l.sigmaAt(tt) * k;
      return [x + n[0] * v, y + n[1] * v];
    };
    const unit = (a: [number, number], b: [number, number]): [number, number] => {
      const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
      return d < 1e-9 ? [0, 0] : [(b[0] - a[0]) / d, (b[1] - a[1]) / d];
    };
    // a parallel to the E.N. through a corner, from the baseline to a little past the corner
    const parallel = (end: { corner: [number, number]; t: number }) => {
      const b = l.at(end.t);
      const u = unit(b, end.corner);
      return { from: b, to: [end.corner[0] + u[0] * EXT, end.corner[1] + u[1] * EXT] as [number, number] };
    };
    // the E.N.: from the baseline to a little past the centroid
    const b0 = l.at(l.t0);
    const lam = (CX - b0[0]) * l.e[0] + (CY - b0[1]) * l.e[1];
    const R = Math.max(hw, hh) + 40;
    const reach = lam + (lam >= 0 ? 1 : -1) * R;
    const enEnd: [number, number] = [b0[0] + l.e[0] * reach, b0[1] + l.e[1] * reach];
    // with a big N and little bending the E.N. lies far from the section, in the direction σ grows
    // (the baseline meets it miles away): then it is left out, and out of the framing, instead of
    // shrinking the figure around it
    const enNear = Math.abs((b0[0] - CX) * l.u[0] + (b0[1] - CY) * l.u[1]) <= 3 * R;

    const crosses = l.lo.sigma < 0 && l.hi.sigma > 0;
    const tLo = Math.min(l.lo.t, l.hi.t),
      tHi = Math.max(l.lo.t, l.hi.t);
    const parts: { key: string; pts: [number, number][]; sign: number }[] = crosses
      ? [
          { key: "neg", pts: [l.at(l.lo.t), ord(l.lo.t), l.at(l.t0)], sign: -1 },
          { key: "pos", pts: [l.at(l.t0), ord(l.hi.t), l.at(l.hi.t)], sign: 1 },
        ]
      : [
          {
            key: l.hi.sigma > 0 ? "pos" : "neg",
            pts: [l.at(l.lo.t), ord(l.lo.t), ord(l.hi.t), l.at(l.hi.t)],
            sign: l.hi.sigma > 0 ? 1 : -1,
          },
        ];
    const centroid = (pts: [number, number][]): [number, number] => [
      pts.reduce((a, q) => a + q[0], 0) / pts.length,
      pts.reduce((a, q) => a + q[1], 0) / pts.length,
    ];
    const ends = [
      { id: "max", end: l.hi },
      { id: "min", end: l.lo },
    ];
    // the σ label goes past the end of the baseline (away from the other end), never on top of it:
    // beside it when the baseline is flat-ish, below/above it when it is steep
    const CH = 6.6; // px per character of the 11 px monospace label
    const labelAt = (end: { t: number; sigma: number }, other: { t: number }) => {
      const dir = end.t >= other.t ? 1 : -1;
      const text = `${t(end === l.hi ? "f3d.cut.smax" : "f3d.cut.smin")} = ${end.sigma.toFixed(2)}`;
      const w = text.length * CH;
      const flat = Math.abs(l.u[0]) >= 0.4;
      const [bx, by] = l.at(end.t + dir * (flat ? 12 : 24));
      const right = dir * l.u[0] >= 0;
      const anchor: "start" | "middle" | "end" = flat ? (right ? "start" : "end") : "middle";
      const y = flat ? by + 4 : by + (dir * l.u[1] > 0 ? 10 : 0);
      const x0 = anchor === "start" ? bx : anchor === "end" ? bx - w : bx - w / 2;
      return { x: bx, y, anchor, box: [x0, y - 12, x0 + w, y + 4] as [number, number, number, number] };
    };
    pts.push(l.at(tLo - 20), l.at(tHi + 20));
    if (enNear) pts.push(b0, enEnd, [enEnd[0] + 30, enEnd[1]]);
    ends.forEach(({ id, end }) => {
      const b = labelAt(end, id === "max" ? l.lo : l.hi).box;
      pts.push(parallel(end).to, ord(end.t), [b[0], b[1]], [b[2], b[3]]);
    });
    body = (
      <>
        {ends.map(({ id, end }) => {
          const pl = parallel(end);
          return (
            <g key={id}>
              <line
                data-testid={`cut-extreme-${id}`}
                x1={pl.from[0]}
                y1={pl.from[1]}
                x2={pl.to[0]}
                y2={pl.to[1]}
                stroke={col(end.sigma)}
                strokeWidth={1.4}
              />
              <circle cx={end.corner[0]} cy={end.corner[1]} r={3.5} fill={col(end.sigma)} />
            </g>
          );
        })}
        {enNear && (
          <>
            <line
              data-testid="cut-resultant-neutral"
              x1={b0[0]}
              y1={b0[1]}
              x2={enEnd[0]}
              y2={enEnd[1]}
              stroke="#ca8a04"
              strokeWidth={2}
              strokeDasharray="7 4"
            />
            <text x={enEnd[0] + 6} y={enEnd[1] - 6} fontSize={11} fontWeight={700} fill="#a16207">
              {t("f3d.cut.neutral_short")}
            </text>
          </>
        )}

        <line
          x1={l.at(tLo - 20)[0]}
          y1={l.at(tLo - 20)[1]}
          x2={l.at(tHi + 20)[0]}
          y2={l.at(tHi + 20)[1]}
          stroke="#78716c"
        />
        {parts.map(({ key, pts, sign }) => {
          const c = centroid(pts);
          return (
            <g key={key} data-testid={`cut-resultant-${key}`}>
              <polygon points={pts.map(P).join(" ")} fill={col(sign)} fillOpacity={0.45} stroke={col(sign)} />
              <SignMark x={c[0]} y={c[1]} sign={sign > 0 ? 1 : -1} color={col(sign)} />
            </g>
          );
        })}
        {ends.map(({ id, end }) => {
          const { x, y, anchor } = labelAt(id === "max" ? l.hi : l.lo, id === "max" ? l.lo : l.hi);
          return (
            <text
              key={id}
              data-testid={`cut-resultant-${id}`}
              x={x}
              y={y}
              textAnchor={anchor}
              fontSize={11}
              fontFamily="monospace"
              fontWeight={700}
              fill={col(end.sigma)}
            >
              {t(id === "max" ? "f3d.cut.smax" : "f3d.cut.smin")} = {end.sigma.toFixed(2)}
            </text>
          );
        })}
      </>
    );
  }

  if (!l) pts.push([CX + hw + 40, CY - 18], [CX + hw + 40 + 330, CY + 26]); // the note on the right
  const M = 14; // margin around the drawing
  const x0 = Math.min(...pts.map((q) => q[0])) - M,
    y0 = Math.min(...pts.map((q) => q[1])) - M - 22, // + a row for the title
    x1 = Math.max(...pts.map((q) => q[0])) + M,
    y1 = Math.max(...pts.map((q) => q[1])) + M;
  const vw = Math.max(x1 - x0, 380);
  return (
    <div data-testid="cut-resultant">
      <FullscreenFigure testId="fs-cut-resultant" controls={controls}>
      <svg
        width="100%"
        viewBox={`${x0} ${y0} ${vw} ${y1 - y0}`}
        style={{ background: colors.paper, maxWidth: vw }}
      >
        <text x={x0 + 10} y={y0 + 18} fontSize={12} fontWeight={700} fill={colors.ink}>
          {t("f3d.cut.resultant")}
        </text>
        <polygon points={outline} fill="#e7e5e4" stroke={colors.ink} strokeWidth={1.5} />
        <line x1={CX - hw - 10} y1={CY} x2={CX + hw + 10} y2={CY} stroke="#a8a29e" strokeDasharray="4 3" />
        <line x1={CX} y1={CY - hh - 10} x2={CX} y2={CY + hh + 10} stroke="#a8a29e" strokeDasharray="4 3" />
        <text x={CX + hw + 14} y={CY - 5} fontSize={11} fill={colors.dimensions}>
          x
        </text>
        <text x={CX + 5} y={CY - hh - 14} fontSize={11} fill={colors.dimensions}>
          y
        </text>
        {body}
      </svg>
      </FullscreenFigure>
    </div>
  );
}
