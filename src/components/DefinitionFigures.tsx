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
// β: the angle of the elastic line with the ε axis; its arc (radius 40 about O) ends exactly on the line.
const BETA = Math.atan2(O[1] - P[1], P[0] - O[0]);
const BETA_ARC = `M ${O[0] + 40} ${O[1]} A 40 40 0 0 0 ${(O[0] + 40 * Math.cos(BETA)).toFixed(1)} ${(O[1] - 40 * Math.sin(BETA)).toFixed(1)}`;
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
      {/* ductility: the plastic period, the region under the curve from the elastic limit to the rupture */}
      {focus === "ductility" && <path d={PLASTIC_AREA} fill={TENSION} fillOpacity="0.28" />}
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
          <path d={BETA_ARC} fill="none" stroke={INK} strokeWidth="1" />
          <text x={O[0] + 48 * Math.cos(BETA / 2)} y={O[1] - 48 * Math.sin(BETA / 2) + 4} fontSize="12" fontStyle="italic" fill={TENSION}>β</text>
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

// The bending plane and the line of forces in two views: the beam seen from the side (the plane of the drawing is the
// bending plane: it holds the axis and the load) and the cross-section A–A, where that plane is seen edge-on as a line.
export function BendingPlaneFigure({ label }: { label: string }) {
  const { t } = useLanguage();
  const id = "def-bp";
  return (
    <svg viewBox="0 0 440 190" className="h-auto w-full" role="img" aria-label={label}>
      <defs>
        <marker id={id} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={LOAD} />
        </marker>
      </defs>
      {/* side view: the shaded rectangle is the bending plane itself */}
      <rect x="14" y="16" width="240" height="150" fill={TENSION} fillOpacity="0.1" stroke={TENSION} strokeWidth="1.5" strokeDasharray="5 3" />
      <rect x="40" y="60" width="190" height="60" fill={FAINT} fillOpacity="0.4" stroke={INK} strokeWidth="1.5" />
      <line x1="40" y1="90" x2="230" y2="90" stroke={INK} strokeWidth="1" strokeDasharray="6 3" />
      <polygon points="50,120 40,138 60,138" fill="none" stroke={INK} strokeWidth="1.5" />
      <polygon points="220,120 210,138 230,138" fill="none" stroke={INK} strokeWidth="1.5" />
      <line x1="135" y1="22" x2="135" y2="58" stroke={LOAD} strokeWidth="2.5" markerEnd={`url(#${id})`} />
      <Txt x="143" y="36" fill={LOAD}>P</Txt>
      <Txt x="22" y="32" fill={TENSION} fontWeight="600">{t("def.fig.plane")}</Txt>
      <Txt x="22" y="158" fill={TENSION} fontSize="11">{t("def.fig.planedraw")}</Txt>
      {/* the cut A–A and its trace */}
      <line x1="190" y1="44" x2="190" y2="136" stroke={INK} strokeWidth="1" strokeDasharray="4 3" />
      <line x1="190" y1="60" x2="190" y2="120" stroke={LOAD} strokeWidth="3.5" />
      <Txt x="190" y="40" textAnchor="middle">A</Txt>
      <Txt x="190" y="150" textAnchor="middle">A</Txt>
      {/* the section: the plane seen edge-on is the line of forces */}
      <line x1="196" y1="60" x2="320" y2="60" stroke={FAINT} strokeWidth="1" strokeDasharray="3 3" />
      <line x1="196" y1="120" x2="320" y2="120" stroke={FAINT} strokeWidth="1" strokeDasharray="3 3" />
      <rect x="320" y="60" width="60" height="60" fill={FAINT} fillOpacity="0.4" stroke={INK} strokeWidth="1.5" />
      <line x1="350" y1="42" x2="350" y2="138" stroke={LOAD} strokeWidth="3.5" />
      <circle cx="350" cy="90" r="3" fill={INK} />
      <Txt x="350" y="22" textAnchor="middle" fontWeight="600">{t("def.fig.section")}</Txt>
      <Txt x="350" y="158" textAnchor="middle" fill={LOAD} fontWeight="600">{t("def.fig.forceline")}</Txt>
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

// The neutral axis: on the left a bent segment (the top fibre shortens, the bottom one lengthens, the neutral one keeps its
// length); on the right the section with σ linear in the distance to the neutral axis and zero on it.
export function NeutralAxisFigure({ label }: { label: string }) {
  const { t } = useLanguage();
  const na = t("def.fig.na");
  return (
    <svg viewBox="0 0 440 205" className="h-auto w-full" role="img" aria-label={label}>
      <path
        d="M 69.4 95.2 A 135 135 0 0 0 170.6 95.2 L 189.3 141.5 A 185 185 0 0 1 50.7 141.5 Z"
        fill={TENSION}
        fillOpacity="0.1"
        stroke={INK}
        strokeWidth="1.5"
      />
      <path d="M 60.1 118.4 A 160 160 0 0 0 179.9 118.4" fill="none" stroke={INK} strokeWidth="1.5" strokeDasharray="6 3" />
      <path d="M 69.4 95.2 A 135 135 0 0 0 170.6 95.2" fill="none" stroke={LOAD} strokeWidth="3" />
      <path d="M 50.7 141.5 A 185 185 0 0 0 189.3 141.5" fill="none" stroke={TENSION} strokeWidth="3" />
      <Txt x="120" y="83" textAnchor="middle" fill={LOAD}>{t("def.fig.shortens")}</Txt>
      <Txt x="120" y="168" textAnchor="middle" fill={TENSION}>{t("def.fig.lengthens")}</Txt>
      <Txt x="40" y="122" textAnchor="end" fill={INK}>{na}</Txt>

      <rect x="222" y="50" width="30" height="120" fill={FAINT} fillOpacity="0.35" stroke={INK} strokeWidth="1.5" />
      <line x1="216" y1="110" x2="362" y2="110" stroke={INK} strokeWidth="1.5" strokeDasharray="6 3" />
      <line x1="310" y1="44" x2="310" y2="176" stroke={INK} strokeWidth="1" />
      <polygon points="310,110 310,50 266,50" fill={LOAD} fillOpacity="0.2" stroke={LOAD} strokeWidth="2" />
      <polygon points="310,110 310,170 354,170" fill={TENSION} fillOpacity="0.2" stroke={TENSION} strokeWidth="2" />
      <Txt x="262" y="44" textAnchor="end" fill={LOAD}>{t("def.fig.compression")}</Txt>
      <Txt x="358" y="186" fill={TENSION}>{t("def.fig.tension")}</Txt>
      <Txt x="366" y="114" fill={INK}>{na}</Txt>
      <Txt x="316" y="104" fill={INK} fontSize="11">σ = 0</Txt>
    </svg>
  );
}

// ---- Plane areas: an L-shaped section with what each moment adds up (all measured on the drawing) ----

export const PLANE_FOCI = ["static", "centroid", "inertia", "product", "polar", "gyration", "principal", "principalMoments"] as const;
export type PlaneFocus = (typeof PLANE_FOCI)[number];

// The L section (screen coordinates), its two rectangles in y-up coordinates measured from the origin O of the axes.
const AO = [60, 160]; // origin of the x, y axes
const L_OUTLINE = "90,30 110,30 110,120 180,120 180,140 90,140";
const L_PARTS = [
  { x: 90, y: 30, w: 20, h: 110 }, // vertical leg
  { x: 110, y: 120, w: 70, h: 20 }, // horizontal leg
];
const L_AREA = L_PARTS.reduce((a, r) => a + r.w * r.h, 0);
// centroid (screen)
const GX = L_PARTS.reduce((a, r) => a + r.w * r.h * (r.x + r.w / 2), 0) / L_AREA;
const GY = L_PARTS.reduce((a, r) => a + r.w * r.h * (r.y + r.h / 2), 0) / L_AREA;
// about the axes at O (y up): J_x = Σ(b·h³/12 + A·d²)
const JX_O = L_PARTS.reduce((a, r) => {
  const yc = AO[1] - (r.y + r.h / 2);
  return a + (r.w * r.h ** 3) / 12 + r.w * r.h * yc * yc;
}, 0);
const GYRATION = Math.sqrt(JX_O / L_AREA);
// central principal axes: tg 2θ = 2·Jxy / (Jy − Jx), θ from x counter-clockwise (y up), Jxy the central product of inertia
const JX_G = L_PARTS.reduce((a, r) => {
  const dy = GY - (r.y + r.h / 2);
  return a + (r.w * r.h ** 3) / 12 + r.w * r.h * dy * dy;
}, 0);
const JY_G = L_PARTS.reduce((a, r) => {
  const dx = r.x + r.w / 2 - GX;
  return a + (r.h * r.w ** 3) / 12 + r.w * r.h * dx * dx;
}, 0);
const JXY_G = L_PARTS.reduce((a, r) => a + r.w * r.h * (r.x + r.w / 2 - GX) * (GY - (r.y + r.h / 2)), 0);
const THETA_A = 0.5 * Math.atan2(2 * JXY_G, JY_G - JX_G); // one of the principal axes
const J_AT = (th: number) => JX_G * Math.cos(th) ** 2 + JY_G * Math.sin(th) ** 2 - JXY_G * Math.sin(2 * th);
// axis 1 is the one with the larger moment (J_1 = J_max); its angle from x, turned into (−90°, 90°]
const THETA1 = (() => {
  const th = J_AT(THETA_A) >= J_AT(THETA_A + Math.PI / 2) ? THETA_A : THETA_A + Math.PI / 2;
  return th > Math.PI / 2 ? th - Math.PI : th <= -Math.PI / 2 ? th + Math.PI : th;
})();

export function PlaneAreaFigure({ focus, label }: { focus: PlaneFocus; label: string }) {
  const { t } = useLanguage();
  const centered = focus === "principal" || focus === "principalMoments" || focus === "centroid";
  const dim = (x1: number, y1: number, x2: number, y2: number, color: string) => (
    <g stroke={color} strokeWidth="1.5">
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      {y1 === y2 ? (
        <g>
          <line x1={x1} y1={y1 - 4} x2={x1} y2={y1 + 4} />
          <line x1={x2} y1={y2 - 4} x2={x2} y2={y2 + 4} />
        </g>
      ) : (
        <g>
          <line x1={x1 - 4} y1={y1} x2={x1 + 4} y2={y1} />
          <line x1={x2 - 4} y1={y2} x2={x2 + 4} y2={y2} />
        </g>
      )}
    </g>
  );
  const dA = (x: number, y: number, color = LOAD) => <rect x={x} y={y} width="10" height="8" fill={color} stroke="#fff" strokeWidth="0.8" />;
  const axes = (ox: number, oy: number) => (
    <g>
      <line x1={ox} y1={oy} x2="236" y2={oy} stroke={INK} strokeWidth="1.5" />
      <line x1={ox} y1={oy} x2={ox} y2="16" stroke={INK} strokeWidth="1.5" />
      <Txt x="240" y={oy + 4}>{"{x}"}</Txt>
      <Txt x={ox + 6} y="20">{"{y}"}</Txt>
    </g>
  );
  return (
    <svg viewBox="0 0 360 195" className="h-auto w-full" role="img" aria-label={label}>
      <polygon points={L_OUTLINE} fill={TENSION} fillOpacity="0.14" stroke={INK} strokeWidth="1.5" />
      {!centered && axes(AO[0], AO[1])}

      {focus === "static" && (
        <g>
          {dA(150, 124)}
          {dim(AO[0] - 14, 160, AO[0] - 14, 124, LOAD)}
          <line x1="150" y1="128" x2={AO[0] - 14} y2="128" stroke={FAINT} strokeWidth="1" strokeDasharray="3 3" />
          <Txt x={AO[0] - 20} y="146" textAnchor="end" fill={LOAD}>{"{y}"}</Txt>
          <Txt x="166" y="116" fill={LOAD}>{"{dA}"}</Txt>
          <Txt x="190" y="90" fill={INK} fontSize="13">{"{S}_x = ∫ {y} {dA}"}</Txt>
        </g>
      )}
      {focus === "centroid" && (
        <g>
          <line x1={GX} y1={GY} x2={GX} y2="168" stroke={FAINT} strokeWidth="1" strokeDasharray="3 3" />
          <line x1={GX} y1={GY} x2="52" y2={GY} stroke={FAINT} strokeWidth="1" strokeDasharray="3 3" />
          <line x1="52" y1="168" x2="236" y2="168" stroke={INK} strokeWidth="1.5" />
          <line x1="52" y1="168" x2="52" y2="16" stroke={INK} strokeWidth="1.5" />
          <Txt x="240" y="172">{"{x}"}</Txt>
          <Txt x="58" y="20">{"{y}"}</Txt>
          {dim(52, 176, GX, 176, LOAD)}
          {dim(44, GY, 44, 168, LOAD)}
          <Txt x={(52 + GX) / 2} y="190" textAnchor="middle" fill={LOAD}>{"{x}_g"}</Txt>
          <Txt x="38" y={(GY + 168) / 2 + 4} textAnchor="end" fill={LOAD}>{"{y}_g"}</Txt>
          <circle cx={GX} cy={GY} r="4" fill={LOAD} stroke="#fff" strokeWidth="1" />
          <Txt x={GX + 8} y={GY - 6} fill={LOAD} fontWeight="600">G</Txt>
          <Txt x="196" y="60" fontSize="13">{"{x}_g = {S}_y / {A}"}</Txt>
          <Txt x="196" y="80" fontSize="13">{"{y}_g = {S}_x / {A}"}</Txt>
        </g>
      )}
      {focus === "inertia" && (
        <g>
          {dA(95, 34, LOAD)}
          {dA(150, 130, TENSION)}
          {dim(AO[0] - 14, 160, AO[0] - 14, 34, LOAD)}
          {dim(AO[0] - 30, 160, AO[0] - 30, 130, TENSION)}
          <Txt x={AO[0] - 36} y="148" textAnchor="end" fill={TENSION}>{"{y}_1"}</Txt>
          <Txt x={AO[0] - 20} y="100" textAnchor="end" fill={LOAD}>{"{y}_2"}</Txt>
          <Txt x="112" y="44" fill={LOAD} fontSize="11">{t("def.fig.far")}</Txt>
          <Txt x="186" y="138" fill={TENSION} fontSize="11">{t("def.fig.near")}</Txt>
          <Txt x="190" y="90" fontSize="13">{"{J}_x = ∫ {y}² {dA}"}</Txt>
        </g>
      )}
      {focus === "product" && (
        <g>
          {dA(150, 124)}
          <line x1="155" y1="128" x2="155" y2="160" stroke={FAINT} strokeWidth="1" strokeDasharray="3 3" />
          <line x1="155" y1="128" x2="60" y2="128" stroke={FAINT} strokeWidth="1" strokeDasharray="3 3" />
          {dim(60, 150, 155, 150, TENSION)}
          {dim(AO[0] - 14, 160, AO[0] - 14, 128, LOAD)}
          <Txt x="108" y="146" textAnchor="middle" fill={TENSION}>{"{x}"}</Txt>
          <Txt x={AO[0] - 20} y="148" textAnchor="end" fill={LOAD}>{"{y}"}</Txt>
          <Txt x="166" y="118" fill={INK}>{"{dA}"}</Txt>
          <Txt x="190" y="90" fontSize="13">{"{J}_xy = ∫ {x}·{y} {dA}"}</Txt>
        </g>
      )}
      {focus === "polar" && (
        <g>
          {dA(150, 124)}
          <line x1={AO[0]} y1={AO[1]} x2="155" y2="128" stroke={LOAD} strokeWidth="2" />
          <line x1="155" y1="128" x2="155" y2="160" stroke={FAINT} strokeWidth="1" strokeDasharray="3 3" />
          <circle cx={AO[0]} cy={AO[1]} r="3" fill={INK} />
          <Txt x={AO[0] - 6} y={AO[1] + 14} textAnchor="end">O</Txt>
          <Txt x="100" y="140" fill={LOAD} fontWeight="600">ρ</Txt>
          <Txt x="190" y="76" fontSize="13">{"{J}_p = ∫ ρ² {dA}"}</Txt>
          <Txt x="190" y="96" fontSize="13">{"ρ² = {x}² + {y}²"}</Txt>
          <Txt x="190" y="116" fontSize="13">{"{J}_p = {J}_x + {J}_y"}</Txt>
        </g>
      )}
      {focus === "gyration" && (
        <g>
          <line x1="40" y1={AO[1] - GYRATION} x2="236" y2={AO[1] - GYRATION} stroke={LOAD} strokeWidth="3" strokeDasharray="8 4" />
          {dim(AO[0] - 14, 160, AO[0] - 14, AO[1] - GYRATION, LOAD)}
          <Txt x={AO[0] - 20} y={AO[1] - GYRATION / 2 + 4} textAnchor="end" fill={LOAD}>{"{i}"}</Txt>
          <Txt x="190" y={AO[1] - GYRATION - 6} fill={LOAD} fontSize="11">{t("def.fig.conc")}</Txt>
          <Txt x="190" y="62" fontSize="13">{"{J} = {A}·{i}²"}</Txt>
        </g>
      )}
      {centered && focus !== "centroid" && (
        <g>
          <line x1={GX - 90} y1={GY} x2={GX + 90} y2={GY} stroke={FAINT} strokeWidth="1" strokeDasharray="4 3" />
          <line x1={GX} y1={GY - 90} x2={GX} y2={GY + 90} stroke={FAINT} strokeWidth="1" strokeDasharray="4 3" />
          <line x1={GX - 88 * Math.cos(THETA1)} y1={GY + 88 * Math.sin(THETA1)} x2={GX + 88 * Math.cos(THETA1)} y2={GY - 88 * Math.sin(THETA1)} stroke={LOAD} strokeWidth="2.5" />
          <line x1={GX + 88 * Math.sin(THETA1)} y1={GY + 88 * Math.cos(THETA1)} x2={GX - 88 * Math.sin(THETA1)} y2={GY - 88 * Math.cos(THETA1)} stroke={TENSION} strokeWidth="2.5" />
          <path d={`M ${GX + 36} ${GY} A 36 36 0 0 0 ${GX + 36 * Math.cos(THETA1)} ${GY - 36 * Math.sin(THETA1)}`} fill="none" stroke={INK} strokeWidth="1" />
          <Txt x={GX + 44 * Math.cos(THETA1 / 2)} y={GY - 44 * Math.sin(THETA1 / 2) + 4} fontSize="11">α</Txt>
          <circle cx={GX} cy={GY} r="3.5" fill={INK} />
          <Txt x={GX + 92 * Math.cos(THETA1)} y={GY - 92 * Math.sin(THETA1) + 4} fill={LOAD} fontWeight="600">{focus === "principal" ? "1" : "{J}_1"}</Txt>
          <Txt x={GX - 92 * Math.sin(THETA1) - 6} y={GY - 92 * Math.cos(THETA1)} fill={TENSION} fontWeight="600">{focus === "principal" ? "2" : "{J}_2"}</Txt>
          <Txt x="236" y="40" fontSize="13">{focus === "principal" ? "{J}_xy = 0" : "{J}_1 = {J}_max"}</Txt>
          {focus === "principalMoments" && <Txt x="236" y="60" fontSize="13">{"{J}_2 = {J}_min"}</Txt>}
        </g>
      )}
    </svg>
  );
}

// ---- Figures that also answer the theory questions of /resumen ----

// 1. Torsion: τ grows linearly with ρ along a diameter of the circular section.
export function TorsionFigure({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 300 150" className="h-auto w-full" role="img" aria-label={label}>
      <circle cx="80" cy="75" r="55" fill="none" stroke={INK} strokeWidth="1.5" />
      <line x1="25" y1="75" x2="135" y2="75" stroke={INK} strokeWidth="1" strokeDasharray="4 3" />
      {/* τ on the right radius (up) and the left one (down) */}
      <polygon points="80,75 135,75 135,35" fill={LOAD} fillOpacity="0.15" stroke={LOAD} strokeWidth="2" />
      <polygon points="80,75 25,75 25,115" fill={LOAD} fillOpacity="0.15" stroke={LOAD} strokeWidth="2" />
      <line x1="107" y1="75" x2="107" y2="55" stroke={LOAD} strokeWidth="1.5" />
      <line x1="53" y1="75" x2="53" y2="95" stroke={LOAD} strokeWidth="1.5" />
      <circle cx="80" cy="75" r="2.5" fill={INK} />
      <Txt x="138" y="33">τ_max</Txt>
      <Txt x="86" y="108">τ = 0</Txt>
      <Txt x="107" y="90" textAnchor="middle" fill={TENSION}>ρ</Txt>
      <Txt x="135" y="90" textAnchor="middle">R</Txt>
    </svg>
  );
}

// 2. Collignon–Jourawski: parabolic τ over a rectangle; S is the area above the fibre, s its width.
export function ShearFigure({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 300 170" className="h-auto w-full" role="img" aria-label={label}>
      <rect x="40" y="20" width="70" height="130" fill="none" stroke={INK} strokeWidth="1.5" />
      <rect x="40" y="20" width="70" height="35" fill={TENSION} fillOpacity="0.25" />
      <line x1="30" y1="85" x2="120" y2="85" stroke={INK} strokeWidth="1" strokeDasharray="4 3" />
      <line x1="40" y1="55" x2="110" y2="55" stroke={INK} strokeWidth="1" strokeDasharray="2 2" />
      <Txt x="26" y="88" textAnchor="end">E.N.</Txt>
      <Txt x="75" y="41" textAnchor="middle">S</Txt>
      <Txt x="75" y="68" textAnchor="middle">s</Txt>
      <line x1="130" y1="20" x2="130" y2="150" stroke={INK} strokeWidth="1" />
      <path d="M 130 20 Q 270 85 130 150" fill={LOAD} fillOpacity="0.15" stroke={LOAD} strokeWidth="2" />
      <line x1="130" y1="85" x2="200" y2="85" stroke={LOAD} strokeWidth="1.5" />
      <line x1="110" y1="85" x2="130" y2="85" stroke={FAINT} strokeWidth="1" />
      <Txt x="206" y="80">τ_max</Txt>
      <Txt x="136" y="16">τ = 0</Txt>
      <Txt x="136" y="164">τ = 0</Txt>
    </svg>
  );
}

// 5. Steiner: the axis x is at distance d from the centroidal axis xg.
export function SteinerFigure({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 300 175" className="h-auto w-full" role="img" aria-label={label}>
      <rect x="90" y="30" width="120" height="60" fill={TENSION} fillOpacity="0.2" stroke={INK} strokeWidth="1.5" />
      <line x1="70" y1="60" x2="230" y2="60" stroke={INK} strokeWidth="1" strokeDasharray="5 3" />
      <line x1="70" y1="130" x2="230" y2="130" stroke={INK} strokeWidth="1.5" />
      <circle cx="150" cy="60" r="3" fill={INK} />
      <line x1="150" y1="60" x2="150" y2="130" stroke={LOAD} strokeWidth="1" strokeDasharray="2 2" />
      <line x1="248" y1="60" x2="248" y2="130" stroke={LOAD} strokeWidth="1.5" />
      <line x1="243" y1="60" x2="253" y2="60" stroke={LOAD} strokeWidth="1.5" />
      <line x1="243" y1="130" x2="253" y2="130" stroke={LOAD} strokeWidth="1.5" />
      <Txt x="258" y="99" fill={LOAD}>d</Txt>
      <Txt x="156" y="54">G</Txt>
      <Txt x="64" y="64" textAnchor="end">x_g</Txt>
      <Txt x="64" y="134" textAnchor="end">x</Txt>
      <Txt x="150" y="164" textAnchor="middle">J_x = J_g + A·d²</Txt>
    </svg>
  );
}
