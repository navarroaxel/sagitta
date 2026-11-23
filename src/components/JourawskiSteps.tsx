"use client";

import React from "react";
import { useLanguage, type TranslationKey } from "@/contexts/LanguageContext";
import { Sub, SvgSub, plain } from "@/components/Sub";
import { Figure } from "@/components/guide/GuideBits";

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

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <marker id={`${id}-r`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill={LOAD} />
      </marker>
      <marker id={`${id}-t`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill={TENSION} />
      </marker>
    </defs>
  );
}

const Arrow = ({ id, x1, y1, x2, y2, color = "r", w = 2.5 }: { id: string; x1: number; y1: number; x2: number; y2: number; color?: "r" | "t"; w?: number }) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color === "r" ? LOAD : TENSION} strokeWidth={w} markerEnd={`url(#${id}-${color})`} />
);

// The slice (a longitudinal section of the beam) seen from the side: x = 60 … 200 is dx, y = 40 … 140 is the depth.
const X1 = 60;
const X2 = 200;
const TOP = 40;
const BOT = 140;
const NA = 90;
const CUT = 66;

function Slice({ fill = "none" }: { fill?: string }) {
  return (
    <g>
      <rect x={X1} y={TOP} width={X2 - X1} height={BOT - TOP} fill={fill} stroke={INK} strokeWidth="1.5" />
      <Txt x={X1} y="28" textAnchor="middle">1</Txt>
      <Txt x={X2} y="28" textAnchor="middle">2</Txt>
    </g>
  );
}

// 1. the beam cut by two sections: M and Q on face 1, M + dM and Q on face 2 (as in the notes' sketch)
function Step1({ label }: { label: string }) {
  const id = "jr1";
  return (
    <svg viewBox="0 0 260 190" className="h-auto w-full" role="img" aria-label={label}>
      <Defs id={id} />
      <Slice fill={FAINT} />
      <path d={`M ${X1} ${NA + 34} A 34 34 0 0 1 ${X1} ${NA - 34}`} fill="none" stroke={LOAD} strokeWidth="2.5" markerEnd={`url(#${id}-r)`} />
      <path d={`M ${X2} ${NA + 34} A 34 34 0 0 0 ${X2} ${NA - 34}`} fill="none" stroke={LOAD} strokeWidth="2.5" markerEnd={`url(#${id}-r)`} />
      <Arrow id={id} x1={X1 + 14} y1={NA + 22} x2={X1 + 14} y2={NA - 22} />
      <Arrow id={id} x1={X2 - 14} y1={NA - 22} x2={X2 - 14} y2={NA + 22} />
      <Txt x="14" y="136" fill={LOAD}>M</Txt>
      <Txt x={X1 + 20} y="128" fill={LOAD}>Q</Txt>
      <Txt x={X2 - 28} y="128" fill={LOAD}>Q</Txt>
      <Txt x="212" y="150" fill={LOAD}>M + dM</Txt>
      <line x1={X1} y1="168" x2={X2} y2="168" stroke={INK} strokeWidth="1" />
      <line x1={X1} y1="163" x2={X1} y2="173" stroke={INK} strokeWidth="1.5" />
      <line x1={X2} y1="163" x2={X2} y2="173" stroke={INK} strokeWidth="1.5" />
      <Txt x={(X1 + X2) / 2} y="184" textAnchor="middle">dx</Txt>
    </svg>
  );
}

// 2. the bending moments give linear normal stresses: σ on face 1 and a little more on face 2
function Step2({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 260 190" className="h-auto w-full" role="img" aria-label={label}>
      <Slice fill="none" />
      <line x1={X1 - 6} y1={NA} x2={X2 + 6} y2={NA} stroke={INK} strokeWidth="1" strokeDasharray="5 3" />
      <polygon points={`${X1},${TOP} ${X1 - 26},${TOP} ${X1},${NA}`} fill={LOAD} fillOpacity="0.22" stroke={LOAD} strokeWidth="1.8" />
      <polygon points={`${X1},${NA} ${X1 - 26},${BOT} ${X1},${BOT}`} fill={TENSION} fillOpacity="0.22" stroke={TENSION} strokeWidth="1.8" />
      <polygon points={`${X2},${TOP} ${X2 + 36},${TOP} ${X2},${NA}`} fill={LOAD} fillOpacity="0.22" stroke={LOAD} strokeWidth="1.8" />
      <polygon points={`${X2},${NA} ${X2 + 36},${BOT} ${X2},${BOT}`} fill={TENSION} fillOpacity="0.22" stroke={TENSION} strokeWidth="1.8" />
      <Txt x={X1 - 28} y={TOP - 4} textAnchor="middle">σ</Txt>
      <Txt x={X2 + 36} y={TOP - 4} textAnchor="middle">σ + dσ</Txt>
      <Txt x={X2 + 10} y={NA - 4} fill={INK} fontSize="11">E.N.</Txt>
    </svg>
  );
}

// 3. cut the slice with a surface parallel to the axis: a line from the side, the curve s on the cross-section
function Step3({ label, side, section }: { label: string; side: string; section: string }) {
  const sx = 176; // cross-section x range 176 … 236
  return (
    <svg viewBox="0 0 270 195" className="h-auto w-full" role="img" aria-label={label}>
      <rect x="14" y={TOP} width="110" height={BOT - TOP} fill="none" stroke={INK} strokeWidth="1.5" />
      <rect x="14" y={TOP} width="110" height={CUT - TOP} fill={TENSION} fillOpacity="0.25" />
      <line x1="8" y1={CUT} x2="130" y2={CUT} stroke={INK} strokeWidth="2" strokeDasharray="5 3" />
      <line x1="14" y1={NA} x2="124" y2={NA} stroke={INK} strokeWidth="1" strokeDasharray="5 3" />
      <rect x={sx} y={TOP} width="60" height={BOT - TOP} fill="none" stroke={INK} strokeWidth="1.5" />
      <rect x={sx} y={TOP} width="60" height={CUT - TOP} fill={TENSION} fillOpacity="0.25" />
      <line x1={sx - 6} y1={CUT} x2={sx + 66} y2={CUT} stroke={LOAD} strokeWidth="3" />
      <line x1={sx - 6} y1={NA} x2={sx + 66} y2={NA} stroke={INK} strokeWidth="1" strokeDasharray="5 3" />
      <Txt x={sx + 30} y={CUT - 12} textAnchor="middle" fill={TENSION} fontWeight="600">Ω</Txt>
      <Txt x={sx + 30} y={CUT + 16} textAnchor="middle" fill={LOAD}>s</Txt>
      <line x1={sx - 12} y1={CUT} x2={sx - 12} y2={NA} stroke={INK} strokeWidth="1" />
      <line x1={sx - 16} y1={CUT} x2={sx - 8} y2={CUT} stroke={INK} strokeWidth="1" />
      <line x1={sx - 16} y1={NA} x2={sx - 8} y2={NA} stroke={INK} strokeWidth="1" />
      <Txt x={sx - 18} y={(CUT + NA) / 2 + 4} textAnchor="end">y</Txt>
      <Txt x="69" y="162" textAnchor="middle" fontSize="11">{side}</Txt>
      <Txt x={sx + 30} y="162" textAnchor="middle" fontSize="11">{section}</Txt>
      <Txt x="130" y={CUT + 4} fill={INK} fontSize="11">{" "}</Txt>
    </svg>
  );
}

// 4. the cut surface in perspective: the curve s of the cross-section pushed along dx, parallel to the axis. A straight s
// gives a plane (rectangle, double T); any curve gives a curved (cylindrical) surface. Ω has the same shape on both faces.
function Step4({ label, plane, curved, axis }: { label: string; plane: string; curved: string; axis: string }) {
  const D = [48, -34];
  const panel = (ox: number, kind: "plane" | "curved") => {
    const x0 = ox;
    const x1 = ox + 70;
    const top = 56;
    const bot = 136;
    const cut =
      kind === "plane"
        ? `M ${x0} 92 L ${x1} 92`
        : `M ${x0} 94 C ${x0 + 20} 72 ${x0 + 40} 116 ${x1} 86`;
    const end = kind === "plane" ? [x1, 92] : [x1, 86];
    const start = kind === "plane" ? [x0, 92] : [x0, 94];
    const shifted = (d: string) => d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_m, a, b) => `${Number(a) + D[0]} ${Number(b) + D[1]}`);
    const surface =
      kind === "plane"
        ? `M ${x0} 92 L ${x1} 92 L ${x1 + D[0]} ${92 + D[1]} L ${x0 + D[0]} ${92 + D[1]} Z`
        : `${cut} L ${end[0] + D[0]} ${end[1] + D[1]} ${shifted(`C ${x0 + 40} 116 ${x0 + 20} 72 ${x0} 94`)} Z`;
    const omegaFront =
      kind === "plane"
        ? `M ${x0} ${top} L ${x1} ${top} L ${x1} 92 L ${x0} 92 Z`
        : `M ${x0} ${top} L ${x1} ${top} L ${x1} 86 C ${x0 + 40} 116 ${x0 + 20} 72 ${x0} 94 Z`;
    return (
      <g>
        <rect x={x0} y={top} width="70" height={bot - top} fill="none" stroke={INK} strokeWidth="1.5" />
        <polygon points={`${x0},${top} ${x1},${top} ${x1 + D[0]},${top + D[1]} ${x0 + D[0]},${top + D[1]}`} fill={TENSION} fillOpacity="0.1" stroke={INK} strokeWidth="1.5" />
        <polygon points={`${x1},${top} ${x1 + D[0]},${top + D[1]} ${x1 + D[0]},${bot + D[1]} ${x1},${bot}`} fill="none" stroke={INK} strokeWidth="1.5" />
        <polygon points={`${x1},${top} ${x1 + D[0]},${top + D[1]} ${x1 + D[0]},${end[1] + D[1]} ${x1},${end[1]}`} fill={TENSION} fillOpacity="0.2" />
        <path d={omegaFront} fill={TENSION} fillOpacity="0.22" />
        <path d={surface} fill={TENSION} fillOpacity="0.35" stroke={INK} strokeWidth="1" strokeDasharray="3 2" />
        <path d={cut} fill="none" stroke={LOAD} strokeWidth="3" />
        <circle cx={start[0]} cy={start[1]} r="2" fill={LOAD} />
        <Txt x={x0 + 35} y={top + 12} textAnchor="middle" fill={TENSION} fontWeight="600">Ω</Txt>
        <Txt x={x0 + 35} y={kind === "plane" ? 108 : 124} textAnchor="middle" fill={LOAD}>s</Txt>
        {/* which face is which, and dx: the distance between face 1 (front, with the curve s) and face 2 (back) */}
        <Txt x={x0 - 4} y={top + 2} textAnchor="end">1</Txt>
        <Txt x={x1 + D[0] + 8} y={top + D[1] + 8}>2</Txt>
        <g stroke={INK} strokeWidth="1.2">
          <line x1={x1 + 8} y1={bot + 8} x2={x1 + 8 + D[0]} y2={bot + 8 + D[1]} />
          <line x1={x1 + 3} y1={bot + 13} x2={x1 + 13} y2={bot + 3} />
          <line x1={x1 + 3 + D[0]} y1={bot + 13 + D[1]} x2={x1 + 13 + D[0]} y2={bot + 3 + D[1]} />
        </g>
        <Txt x={x1 + 10 + D[0] / 2} y={bot + 14 + D[1] / 2 + 6} fontSize="11">dx</Txt>
        <Txt x={x0 - 6} y="166" fontSize="11">{kind === "plane" ? plane : curved}</Txt>
      </g>
    );
  };
  return (
    <svg viewBox="0 0 400 178" className="h-auto w-full" role="img" aria-label={label}>
      <defs>
        <marker id="jr4-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={INK} />
        </marker>
      </defs>
      {panel(10, "plane")}
      {panel(210, "curved")}
      <line x1="158" y1="140" x2="196" y2="112" stroke={INK} strokeWidth="1.5" markerEnd="url(#jr4-a)" />
      <Txt x="168" y="150" fontSize="11">{axis}</Txt>
    </svg>
  );
}

// 5. the free body of Ω: N on face 1, N + dN on face 2 (compression above the neutral axis) and dT on the cut
function Step5({ label }: { label: string }) {
  const id = "jr5";
  const top = 52;
  const bot = 92;
  return (
    <svg viewBox="0 0 300 190" className="h-auto w-full" role="img" aria-label={label}>
      <Defs id={id} />
      <rect x={X1} y={top} width={X2 - X1} height={bot - top} fill={TENSION} fillOpacity="0.25" stroke={INK} strokeWidth="1.5" />
      <Txt x={X1} y={top - 8} textAnchor="middle">1</Txt>
      <Txt x={X2} y={top - 8} textAnchor="middle">2</Txt>
      <Txt x={(X1 + X2) / 2} y={(top + bot) / 2 + 4} textAnchor="middle" fill={TENSION} fontWeight="600">Ω</Txt>
      <Arrow id={id} x1={X1 - 40} y1={(top + bot) / 2} x2={X1 - 2} y2={(top + bot) / 2} />
      <Arrow id={id} x1={X2 + 56} y1={(top + bot) / 2} x2={X2 + 2} y2={(top + bot) / 2} />
      <Txt x={X1 - 40} y={(top + bot) / 2 - 8}>N_Ω</Txt>
      <Txt x={X2 + 16} y={(top + bot) / 2 - 8}>N_Ω + dN_Ω</Txt>
      <Arrow id={id} x1={X1 + 14} y1={bot + 14} x2={X2 - 14} y2={bot + 14} color="t" w={3} />
      <line x1={X1} y1={bot} x2={X2} y2={bot} stroke={LOAD} strokeWidth="3" />
      <Txt x={(X1 + X2) / 2} y={bot + 34} textAnchor="middle" fill={TENSION}>dT = τ·s·dx</Txt>
      <Txt x={(X1 + X2) / 2} y={bot + 56} textAnchor="middle" fontSize="11">dT = dN_Ω</Txt>
    </svg>
  );
}

const STEPS: { n: number; cap: TranslationKey; render: (label: string, t: (k: TranslationKey) => string) => React.ReactNode }[] = [
  { n: 1, cap: "shr.steps.1", render: (label) => <Step1 label={label} /> },
  { n: 2, cap: "shr.steps.2", render: (label) => <Step2 label={label} /> },
  { n: 3, cap: "shr.steps.3", render: (label, t) => <Step3 label={label} side={t("shr.steps.side")} section={t("shr.steps.section")} /> },
  { n: 4, cap: "shr.steps.4", render: (label, t) => <Step4 label={label} plane={t("shr.steps.plane")} curved={t("shr.steps.curved")} axis={t("shr.steps.axis")} /> },
  { n: 5, cap: "shr.steps.5", render: (label) => <Step5 label={label} /> },
];

// The cuts made to the beam, step by step, before the formula.
export default function JourawskiSteps() {
  const { t } = useLanguage();
  return (
    <div data-testid="shr-steps" className="my-6">
      <p className="mb-3 font-semibold">
        <Sub>{t("shr.steps.title")}</Sub>
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {STEPS.map((s) => (
          <div key={s.n} data-testid={`shr-step-${s.n}`}>
            <Figure
              caption={
                <span>
                  <strong>{`${s.n}. `}</strong>
                  <Sub>{t(s.cap)}</Sub>
                </span>
              }
            >
              {s.render(plain(t(s.cap)), t)}
            </Figure>
          </div>
        ))}
      </div>
    </div>
  );
}
