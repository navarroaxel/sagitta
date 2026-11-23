"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { SvgSub } from "@/components/Sub";

const INK = "#16232E";
const FAINT = "#C9D2D8";
const TENSION = "#0B8A8A";
const LOAD = "#C0392B";

function Txt(props: React.SVGProps<SVGTextElement> & { children: string }) {
  const { children, ...rest } = props;
  return (
    <text fontSize="12" fill={INK} {...rest}>
      <SvgSub>{children}</SvgSub>
    </text>
  );
}

// A segment of beam between two sections: the forces on each side reduce at the centroid to a bending couple M (equal and
// opposite at the two faces, sagging), and in the second case also to the shear force Q.
function Segment({ x, shear, id }: { x: number; shear: boolean; id: string }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <rect x="20" y="50" width="140" height="40" fill={TENSION} fillOpacity="0.12" stroke={INK} strokeWidth="1.5" />
      <line x1="20" y1="70" x2="160" y2="70" stroke={INK} strokeWidth="1" strokeDasharray="5 3" />
      <circle cx="20" cy="70" r="2.5" fill={INK} />
      <circle cx="160" cy="70" r="2.5" fill={INK} />
      <path d="M 20 90 A 20 20 0 0 1 20 50" fill="none" stroke={LOAD} strokeWidth="2.5" markerEnd={`url(#${id})`} />
      <path d="M 160 90 A 20 20 0 0 0 160 50" fill="none" stroke={LOAD} strokeWidth="2.5" markerEnd={`url(#${id})`} />
      <Txt x="-4" y="44" fill={LOAD}>M</Txt>
      <Txt x="176" y="44" fill={LOAD}>M</Txt>
      {shear && (
        <g>
          <line x1="20" y1="124" x2="20" y2="94" stroke={TENSION} strokeWidth="2.5" markerEnd={`url(#${id}-q)`} />
          <line x1="160" y1="96" x2="160" y2="126" stroke={TENSION} strokeWidth="2.5" markerEnd={`url(#${id}-q)`} />
          <Txt x="26" y="122" fill={TENSION}>Q</Txt>
          <Txt x="166" y="122" fill={TENSION}>Q</Txt>
        </g>
      )}
    </g>
  );
}

export function SimpleBendingFigure({ label }: { label: string }) {
  const { t } = useLanguage();
  return (
    <svg viewBox="0 0 420 175" className="h-auto w-full" role="img" aria-label={label}>
      <defs>
        <marker id="def-fs" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={LOAD} />
        </marker>
        <marker id="def-fs-b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={LOAD} />
        </marker>
        <marker id="def-fs-b-q" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={TENSION} />
        </marker>
      </defs>
      <Segment x={14} shear={false} id="def-fs" />
      <Segment x={224} shear id="def-fs-b" />
      <line x1="210" y1="30" x2="210" y2="140" stroke={FAINT} strokeWidth="1" />
      <Txt x="104" y="162" textAnchor="middle" fontWeight="600">{t("def.fig.pure")}</Txt>
      <Txt x="314" y="162" textAnchor="middle" fontWeight="600">{t("def.fig.shear")}</Txt>
    </svg>
  );
}

export type StressStrainFocus =
  | "stiffness"
  | "P"
  | "E"
  | "Fl"
  | "Rot"
  | "safety"
  | "elastic"
  | "ductility"
  | "resilience"
  | "toughness"
  | "types";

// Schematic stress–strain diagram of a ductile steel (the one of /propiedades-materiales) with one thing highlighted.
const O = [40, 170];
const P = [80, 100];
const E = [96, 82];
const M = [250, 28];
const Z = [318, 62];
const CURVE =
  "M 40 170 L 80 100 Q 88 90 96 82 L 112 72 l 8,-4 l 8,5 l 8,-5 l 8,4 l 8,-3 L 168 72 C 195 70 215 30 250 28 C 285 24 310 34 318 62";
// The yield stretch of the curve itself (same points as in CURVE), so the highlight follows the real function.
const YIELD_STRETCH = "M 112 72 l 8,-4 l 8,5 l 8,-5 l 8,4 l 8,-3 L 168 72";
const ELASTIC_AREA = "M 40 170 L 80 100 Q 88 90 96 82 L 96 170 Z";
const PLASTIC_AREA = "M 96 82 L 112 72 l 8,-4 l 8,5 l 8,-5 l 8,4 l 8,-3 L 168 72 C 195 70 215 30 250 28 C 285 24 310 34 318 62 L 318 170 L 96 170 Z";
const SLOPE = (P[1] - O[1]) / (P[0] - O[0]); // screen slope of the elastic line
const U = [206, 50]; // a point of the plastic period
const UNLOAD_X = U[0] - (O[1] - U[1]) / -SLOPE; // where the parallel unloading line meets the ε axis

export function StressStrainFigure({ focus, label }: { focus: StressStrainFocus; label: string }) {
  const { t } = useLanguage();
  const guide = (y: number, x: number, name: string, color = INK) => (
    <g>
      <line x1="40" y1={y} x2={x} y2={y} stroke={FAINT} strokeWidth="1" strokeDasharray="3 3" />
      <text x="34" y={y + 4} fontSize="11" textAnchor="end" fill={color}>
        <SvgSub>{name}</SvgSub>
      </text>
    </g>
  );
  const dot = (p: number[]) => <circle cx={p[0]} cy={p[1]} r="3.5" fill={LOAD} stroke="#fff" strokeWidth="1" />;
  const bracket = (x1: number, x2: number, y: number, color: string) => (
    <g stroke={color} strokeWidth="1.8">
      <line x1={x1} y1={y} x2={x2} y2={y} />
      <line x1={x1} y1={y - 5} x2={x1} y2={y + 5} />
      <line x1={x2} y1={y - 5} x2={x2} y2={y + 5} />
    </g>
  );
  return (
    <svg viewBox="0 0 380 215" className="h-auto w-full" role="img" aria-label={label}>
      {/* highlighted areas first, under the curve */}
      {focus === "resilience" && <path d={ELASTIC_AREA} fill={TENSION} fillOpacity="0.3" />}
      {focus === "toughness" && <path d={`${CURVE} L 318 170 Z`} fill={TENSION} fillOpacity="0.25" />}
      {/* ductility is a strain range, not an area under the curve (that is toughness): a band over the ε interval */}
      {focus === "ductility" && <rect x={E[0]} y="14" width={Z[0] - E[0]} height="156" fill={TENSION} fillOpacity="0.12" />}
      {focus === "elastic" && (
        <g>
          <path d={ELASTIC_AREA} fill={TENSION} fillOpacity="0.3" />
          <path d={PLASTIC_AREA} fill={LOAD} fillOpacity="0.1" />
        </g>
      )}
      <line x1="40" y1="170" x2="360" y2="170" stroke={INK} strokeWidth="1.5" />
      <line x1="40" y1="170" x2="40" y2="10" stroke={INK} strokeWidth="1.5" />
      <text x="372" y="162" fontSize="11" textAnchor="end" fill={INK}>ε</text>
      <text x="46" y="16" fontSize="11" fill={INK}>σ</text>

      {focus === "types" ? (
        <g>
          <path d={CURVE} fill="none" stroke={LOAD} strokeWidth="2.5" />
          <path d="M 40 170 L 100 65" fill="none" stroke={INK} strokeWidth="2.5" />
          <path d="M 94 59 L 106 71 M 106 59 L 94 71" stroke={INK} strokeWidth="2" />
          <text x="112" y="62" fontSize="12" fontWeight="600" fill={INK}>{t("def.fig.brittle")}</text>
          <text x="240" y="20" fontSize="12" fontWeight="600" fill={LOAD}>{t("def.fig.ductile")}</text>
        </g>
      ) : (
        <path d={CURVE} fill="none" stroke={LOAD} strokeWidth="2.5" />
      )}

      {focus === "stiffness" && (
        <g>
          <line x1={O[0]} y1={O[1]} x2={P[0]} y2={P[1]} stroke={TENSION} strokeWidth="4.5" />
          <path d="M 80 170 A 40 40 0 0 0 72.4 146.5" fill="none" stroke={INK} strokeWidth="1" />
          <text x="86" y="162" fontSize="12" fontStyle="italic" fill={TENSION}>β</text>
          <text x="100" y="128" fontSize="12" fill={TENSION}>E = tg β</text>
        </g>
      )}
      {focus === "P" && (
        <g>
          {guide(P[1], P[0], "σ_P", LOAD)}
          <line x1={P[0]} y1={P[1]} x2={P[0]} y2="170" stroke={FAINT} strokeWidth="1" strokeDasharray="3 3" />
          <line x1={O[0]} y1={O[1]} x2={P[0]} y2={P[1]} stroke={TENSION} strokeWidth="4" />
          {dot(P)}
        </g>
      )}
      {focus === "E" && (
        <g>
          {/* the proportional part (up to σP) stays marked, so the stretch where proportionality is lost (σP to σE) stands out */}
          {guide(P[1], P[0], "σ_P", TENSION)}
          <line x1={P[0]} y1={P[1]} x2={P[0]} y2="170" stroke={FAINT} strokeWidth="1" strokeDasharray="3 3" />
          <line x1={O[0]} y1={O[1]} x2={P[0]} y2={P[1]} stroke={TENSION} strokeWidth="4.5" />
          <circle cx={P[0]} cy={P[1]} r="3.5" fill={TENSION} stroke="#fff" strokeWidth="1" />
          <text x="104" y="136" fontSize="11" fill={TENSION}>E = tg β</text>
          {guide(E[1], E[0], "σ_E", LOAD)}
          <line x1={E[0]} y1={E[1]} x2={E[0]} y2="170" stroke={FAINT} strokeWidth="1" strokeDasharray="3 3" />
          {dot(E)}
        </g>
      )}
      {focus === "Fl" && (
        <g>
          {guide(72, 112, "σ_Fl", LOAD)}
          <path d={YIELD_STRETCH} fill="none" stroke={TENSION} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
      {focus === "Rot" && (
        <g>
          {guide(M[1], M[0], "σ_Rot", LOAD)}
          <line x1={M[0]} y1={M[1]} x2={M[0]} y2="170" stroke={FAINT} strokeWidth="1" strokeDasharray="3 3" />
          {dot(M)}
        </g>
      )}
      {focus === "safety" && (
        <g>
          {/* the working stress stays below σP and σE: in the proportional (Hooke) part */}
          {guide(P[1], P[0], "σ_P", TENSION)}
          <line x1={P[0]} y1={P[1]} x2={P[0]} y2="170" stroke={FAINT} strokeWidth="1" strokeDasharray="3 3" />
          <line x1={O[0]} y1={O[1]} x2={P[0]} y2={P[1]} stroke={TENSION} strokeWidth="4.5" />
          <circle cx={P[0]} cy={P[1]} r="3.5" fill={TENSION} stroke="#fff" strokeWidth="1" />
          {guide(E[1], E[0], "σ_E", LOAD)}
          <circle cx={E[0]} cy={E[1]} r="3.5" fill={LOAD} stroke="#fff" strokeWidth="1" />
          <line x1="40" y1="127" x2="150" y2="127" stroke={INK} strokeWidth="2.2" strokeDasharray="6 3" />
          <text x="34" y="131" fontSize="11" textAnchor="end" fill={INK}><SvgSub>σ_adm</SvgSub></text>
          <text x="156" y="131" fontSize="11" fill={INK}><SvgSub>σ_adm = σ_E / ν</SvgSub></text>
        </g>
      )}
      {focus === "elastic" && (
        <g>
          <line x1={U[0]} y1={U[1]} x2={UNLOAD_X} y2="170" stroke={INK} strokeWidth="1.5" strokeDasharray="5 3" />
          <line x1={U[0]} y1={U[1]} x2={U[0]} y2="170" stroke={FAINT} strokeWidth="1" strokeDasharray="3 3" />
          {dot(U)}
          {bracket(40, UNLOAD_X, 184, INK)}
          <text x={(40 + UNLOAD_X) / 2} y="200" fontSize="11" textAnchor="middle" fill={INK}>{t("def.fig.permanent")}</text>
          <text x="62" y="148" fontSize="11" fill={TENSION}>{t("def.fig.elastic")}</text>
          <text x="258" y="130" fontSize="11" fill={LOAD}>{t("def.fig.plastic")}</text>
        </g>
      )}
      {focus === "ductility" && (
        <g>
          {bracket(E[0], Z[0], 186, TENSION)}
          <line x1={Z[0]} y1={Z[1]} x2={Z[0]} y2="170" stroke={FAINT} strokeWidth="1" strokeDasharray="3 3" />
          <text x={(E[0] + Z[0]) / 2} y="205" fontSize="11" textAnchor="middle" fill={TENSION}>{t("def.t.ductilidad")}</text>
        </g>
      )}
      {focus === "resilience" && (
        <g>
          <line x1={E[0]} y1={E[1]} x2={E[0]} y2="170" stroke={FAINT} strokeWidth="1" strokeDasharray="3 3" />
          <text x="48" y="190" fontSize="11" fill={TENSION}>{t("def.t.resiliencia")}</text>
          <text x="110" y="145" fontSize="11" fill={INK}><SvgSub>U = ½·σ_e² / E</SvgSub></text>
        </g>
      )}
      {focus === "toughness" && (
        <g>
          <line x1={Z[0]} y1={Z[1]} x2={Z[0]} y2="170" stroke={FAINT} strokeWidth="1" strokeDasharray="3 3" />
          <text x="150" y="150" fontSize="12" fontWeight="600" fill={TENSION}>{t("def.t.tenacidad")}</text>
        </g>
      )}
    </svg>
  );
}

// The bending plane (axis + loads) in oblique perspective; its trace on the end section is the line of forces.
export function BendingPlaneFigure({ label }: { label: string }) {
  const { t } = useLanguage();
  return (
    <svg viewBox="0 0 430 190" className="h-auto w-full" role="img" aria-label={label}>
      <defs>
        <marker id="def-bp" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={LOAD} />
        </marker>
      </defs>
      {/* the beam: front, top and end faces */}
      <polygon points="40,60 260,60 260,120 40,120" fill={FAINT} fillOpacity="0.35" stroke={INK} strokeWidth="1.5" />
      <polygon points="40,60 260,60 296,34 76,34" fill={FAINT} fillOpacity="0.2" stroke={INK} strokeWidth="1.5" />
      <polygon points="260,60 296,34 296,94 260,120" fill={FAINT} fillOpacity="0.5" stroke={INK} strokeWidth="1.5" />
      {/* the bending plane: vertical, through the axis, in the middle of the width */}
      <polygon points="48,150 293,150 293,14 48,14" fill={TENSION} fillOpacity="0.14" stroke={TENSION} strokeWidth="1.5" strokeDasharray="5 3" />
      <line x1="58" y1="90" x2="278" y2="90" stroke={INK} strokeWidth="1" strokeDasharray="6 3" />
      <line x1="278" y1="47" x2="278" y2="107" stroke={LOAD} strokeWidth="3.5" />
      <circle cx="278" cy="77" r="2.5" fill={INK} />
      <line x1="208" y1="14" x2="208" y2="44" stroke={LOAD} strokeWidth="2.5" markerEnd="url(#def-bp)" />
      <Txt x="214" y="30" fill={LOAD}>P</Txt>
      <Txt x="60" y="30" fill={TENSION} fontWeight="600">{t("def.fig.plane")}</Txt>
      <line x1="280" y1="108" x2="318" y2="138" stroke={LOAD} strokeWidth="1" />
      <Txt x="320" y="146" fill={LOAD} fontWeight="600">{t("def.fig.forceline")}</Txt>
    </svg>
  );
}

// Normal (straight) bending vs oblique bending: the line of forces on the section against the principal axes.
export function ObliqueBendingFigure({ label }: { label: string }) {
  const { t } = useLanguage();
  const panel = (cx: number, angle: number, title: string) => {
    const a = (angle * Math.PI) / 180;
    const dx = 80 * Math.sin(a);
    const dy = 80 * Math.cos(a);
    return (
      <g>
        <rect x={cx - 30} y="35" width="60" height="100" fill={TENSION} fillOpacity="0.14" stroke={INK} strokeWidth="1.5" />
        <line x1={cx - 78} y1="85" x2={cx + 78} y2="85" stroke={INK} strokeWidth="1" />
        <line x1={cx} y1="10" x2={cx} y2="160" stroke={INK} strokeWidth="1" />
        <Txt x={cx + 82} y="89">{"{x}"}</Txt>
        <Txt x={cx + 5} y="14">{"{y}"}</Txt>
        <line x1={cx - dx} y1={85 + dy} x2={cx + dx} y2={85 - dy} stroke={LOAD} strokeWidth="3" strokeDasharray={angle ? undefined : "7 4"} />
        {angle > 0 && (
          <g>
            <path d={`M ${cx} 45 A 40 40 0 0 1 ${cx + 40 * Math.sin(a)} ${85 - 40 * Math.cos(a)}`} fill="none" stroke={INK} strokeWidth="1" />
            <Txt x={cx + 5} y="32">α</Txt>
          </g>
        )}
        <circle cx={cx} cy="85" r="2.5" fill={INK} />
        <Txt x={cx} y="180" textAnchor="middle" fontWeight="600">{title}</Txt>
      </g>
    );
  };
  return (
    <svg viewBox="0 0 420 190" className="h-auto w-full" role="img" aria-label={label}>
      {panel(100, 0, t("def.fig.straight"))}
      {panel(320, 25, t("def.fig.oblique"))}
      <Txt x="210" y="85" textAnchor="middle" fill={LOAD} fontWeight="600" fontSize="10">{" "}</Txt>
    </svg>
  );
}
