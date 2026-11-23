"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { SvgSub, plain } from "@/components/Sub";
import { criticalStress, END_CONDITIONS } from "@/lib/buckling";

const INK = "#16232E";
const FAINT = "#C9D2D8";
const LOAD = "#C0392B";
const MOMENT = "#7A2A9A";
const TENSION = "#0B8A8A";
const AMBER = "#C98A06";

type EndId = (typeof END_CONDITIONS)[number]["id"];

// Euler's hyperbola σk(λ) = π²E/λ² for steel.
export function HyperbolaSVG({ label }: { label?: string }) {
  const { t } = useLanguage();
  const E = 2_100_000;
  const x0 = 40, x1 = 330, y0 = 150, y1 = 20;
  const lamMin = 30, lamMax = 200;
  const smax = criticalStress(E, lamMin);
  const px = (lam: number) => x0 + ((lam - lamMin) / (lamMax - lamMin)) * (x1 - x0);
  const py = (s: number) => y0 - (s / smax) * (y0 - y1);
  const pts: string[] = [];
  for (let lam = lamMin; lam <= lamMax; lam += 2) pts.push(`${px(lam).toFixed(1)},${py(criticalStress(E, lam)).toFixed(1)}`);
  return (
    <svg viewBox="0 0 360 180" className="h-auto w-full" role="img" aria-label={label ?? plain(t("pnd.s3.fig"))}>
      <line x1={x0} y1={y0} x2={x1 + 10} y2={y0} stroke={INK} strokeWidth="1.5" />
      <line x1={x0} y1={y0} x2={x0} y2={y1 - 6} stroke={INK} strokeWidth="1.5" />
      <polyline points={pts.join(" ")} fill="none" stroke={LOAD} strokeWidth="2.5" />
      <text x={x1 + 12} y={y0 + 4} fontSize="13" fontStyle="italic" fill={INK}>{t("pnd.s3.fig.axis.x")}</text>
      <text x={x0 + 6} y={y1 - 6} fontSize="12" fill={INK}><SvgSub>{t("pnd.s3.fig.axis.y")}</SvgSub></text>
      <text x={x1 - 90} y={y0 - 70} fontSize="12" fill={LOAD}><SvgSub>σ_k = π²·E / λ²</SvgSub></text>
    </svg>
  );
}

// The drawing of one end condition (a <g> in a 100 × 130 box): the buckled shape (schematic) and its supports.
export function EndConditionShape({ id }: { id: EndId }) {
  const top = 14, bot = 110;
  const fixedTop = id === "fixed-fixed";
  const fixedBottom = id !== "pinned";
  const shape: Record<string, string> = {
    cantilever: `M 50 ${bot} C 50 ${bot - 50} 75 ${top + 25} 78 ${top}`,
    pinned: `M 50 ${bot} C 80 ${bot - 40} 80 ${top + 40} 50 ${top}`,
    "fixed-pinned": `M 50 ${bot} C 50 ${bot - 35} 76 ${top + 45} 50 ${top}`,
    "fixed-fixed": `M 50 ${bot} C 50 ${bot - 30} 78 ${bot - 34} 78 ${(top + bot) / 2} C 78 ${top + 34} 50 ${top + 30} 50 ${top}`,
  };
  return (
    <g>
      <line x1="50" y1={top} x2="50" y2={bot} stroke={FAINT} strokeWidth="1.5" strokeDasharray="3 3" />
      <path d={shape[id]} fill="none" stroke={MOMENT} strokeWidth="2.5" />
      {fixedBottom ? (
        <g stroke={INK} strokeWidth="1.5">
          <line x1="34" y1={bot} x2="66" y2={bot} />
          {[36, 44, 52, 60].map((x) => <line key={x} x1={x} y1={bot} x2={x - 5} y2={bot + 8} />)}
        </g>
      ) : (
        <polygon points={`50,${bot} 44,${bot + 10} 56,${bot + 10}`} fill="none" stroke={INK} strokeWidth="1.5" />
      )}
      {fixedTop && (
        <g stroke={INK} strokeWidth="1.5">
          <line x1="34" y1={top} x2="66" y2={top} />
          {[36, 44, 52, 60].map((x) => <line key={x} x1={x} y1={top} x2={x - 5} y2={top - 8} />)}
        </g>
      )}
      {!fixedTop && id !== "cantilever" && <polygon points={`50,${top} 44,${top - 10} 56,${top - 10}`} fill="none" stroke={INK} strokeWidth="1.5" />}
      {id === "cantilever" && <circle cx="78" cy={top} r="2.5" fill={LOAD} />}
    </g>
  );
}

// One bar per end condition with its buckled shape (schematic) and l0 = c·l.
export function EndConditionSVG({ id }: { id: EndId }) {
  return (
    <svg viewBox="0 0 100 130" className="h-auto w-full" role="img" aria-hidden="true">
      <EndConditionShape id={id} />
    </svg>
  );
}

const KEY: Record<EndId, "fixedfree" | "pinned" | "fixedpinned" | "fixedfixed"> = {
  cantilever: "fixedfree",
  pinned: "pinned",
  "fixed-pinned": "fixedpinned",
  "fixed-fixed": "fixedfixed",
};

// The four end conditions side by side, each with its c (l0 = c·l).
export function EndConditionsFigure({ label }: { label: string }) {
  const { t, language } = useLanguage();
  const comma = (c: number) => String(c).replace(".", language === "es" ? "," : ".");
  return (
    <svg viewBox="0 0 440 190" className="h-auto w-full" role="img" aria-label={label}>
      {END_CONDITIONS.map((ec, i) => (
        <g key={ec.id} transform={`translate(${i * 110} 0)`}>
          <EndConditionShape id={ec.id} />
          <text x="50" y="146" fontSize="11" textAnchor="middle" fill={INK}>{t(`pnd.s4.${KEY[ec.id]}`)}</text>
          <text x="50" y="164" fontSize="12" textAnchor="middle" fontWeight="600" fill={INK}>
            <SvgSub>{`c = ${comma(ec.c)}`}</SvgSub>
          </text>
        </g>
      ))}
    </svg>
  );
}

function Arrow({ id, x1, y1, x2, y2, color, w = 2.2 }: { id: string; x1: number | string; y1: number | string; x2: number | string; y2: number | string; color: string; w?: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={w} markerEnd={`url(#${id})`} />;
}

function Marker({ id, color }: { id: string; color: string }) {
  return (
    <marker id={id} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
    </marker>
  );
}

// The three cases of the notes: a bar loaded with F and pushed by a lateral load H; what it does when H stops.
export function EquilibriumBarsFigure({ label }: { label: string }) {
  const { t } = useLanguage();
  const id = "pnd-eq";
  const bar = (cx: number, bulge: number, color: string, dashed = false) => (
    <path d={`M ${cx} 22 Q ${cx + bulge} 88 ${cx} 154`} fill="none" stroke={color} strokeWidth="3" strokeDasharray={dashed ? "5 4" : undefined} />
  );
  const panel = (cx: number, kind: "stable" | "indiff" | "unstable") => (
    <g key={kind}>
      <line x1={cx} y1="22" x2={cx} y2="154" stroke={FAINT} strokeWidth="1.5" strokeDasharray="3 3" />
      {kind === "unstable" && bar(cx, 70, FAINT, true)}
      {bar(cx, 34, kind === "stable" ? TENSION : kind === "indiff" ? AMBER : LOAD)}
      <Arrow id={`${id}-f`} x1={cx} y1="2" x2={cx} y2="20" color={INK} w={2.5} />
      <Arrow id={`${id}-f`} x1={cx} y1="174" x2={cx} y2="156" color={INK} w={2.5} />
      <text x={cx + 8} y="14" fontSize="12" fill={INK}><SvgSub>F</SvgSub></text>
      {kind === "stable" && <Arrow id={`${id}-s`} x1={cx + 30} y1="88" x2={cx + 6} y2="88" color={TENSION} w={2.5} />}
      {kind === "unstable" && <Arrow id={`${id}-u`} x1={cx + 18} y1="88" x2={cx + 44} y2="88" color={LOAD} w={2.5} />}
      <text x={cx} y="196" fontSize="12" textAnchor="middle" fontWeight="600" fill={INK}>
        {t(kind === "stable" ? "rs.fig.stable" : kind === "indiff" ? "rs.fig.indiff" : "rs.fig.unstable")}
      </text>
      <text x={cx} y="212" fontSize="12" textAnchor="middle" fill={INK}>
        <SvgSub>{kind === "stable" ? "F < F_k" : kind === "indiff" ? "F = F_k" : "F > F_k"}</SvgSub>
      </text>
      <text x={cx} y="228" fontSize="11" textAnchor="middle" fill={INK}>
        {t(kind === "stable" ? "pnd.fig.back" : kind === "indiff" ? "pnd.fig.stays" : "pnd.fig.grows")}
      </text>
    </g>
  );
  return (
    <svg viewBox="0 0 420 236" className="h-auto w-full" role="img" aria-label={label}>
      <defs>
        <Marker id={`${id}-f`} color={INK} />
        <Marker id={`${id}-s`} color={TENSION} />
        <Marker id={`${id}-u`} color={LOAD} />
      </defs>
      {panel(70, "stable")}
      {panel(210, "indiff")}
      {panel(350, "unstable")}
    </svg>
  );
}

// F against the lateral deflection: the straight position is stable below F_k and unstable above; at F_k any deflection.
export function BifurcationFigure({ label }: { label: string }) {
  const { t } = useLanguage();
  const x0 = 190, y0 = 160, yk = 80;
  return (
    <svg viewBox="0 0 380 190" className="h-auto w-full" role="img" aria-label={label}>
      <line x1="30" y1={y0} x2="350" y2={y0} stroke={INK} strokeWidth="1.5" />
      <line x1={x0} y1={y0} x2={x0} y2="12" stroke={INK} strokeWidth="1.5" />
      <text x="354" y={y0 + 4} fontSize="12" fill={INK}>δ</text>
      <text x={x0 + 8} y="18" fontSize="12" fill={INK}><SvgSub>F</SvgSub></text>
      <line x1={x0} y1={y0} x2={x0} y2={yk} stroke={TENSION} strokeWidth="4" />
      <line x1={x0} y1={yk} x2={x0} y2="22" stroke={LOAD} strokeWidth="2.5" strokeDasharray="6 4" />
      <line x1="80" y1={yk} x2="300" y2={yk} stroke={AMBER} strokeWidth="3" />
      <circle cx={x0} cy={yk} r="3.5" fill={INK} />
      <text x="34" y={yk + 4} fontSize="12" fill={INK}><SvgSub>F_k</SvgSub></text>
      <line x1="30" y1={yk} x2="80" y2={yk} stroke={FAINT} strokeWidth="1" strokeDasharray="3 3" />
      <text x={x0 + 8} y="125" fontSize="11" fill={TENSION} fontWeight="600">{t("rs.fig.stable")}</text>
      <text x={x0 + 8} y="45" fontSize="11" fill={LOAD} fontWeight="600">{t("rs.fig.unstable")}</text>
      <text x="304" y={yk - 6} fontSize="11" textAnchor="end" fill={AMBER} fontWeight="600">{t("rs.fig.indiff")}</text>
    </svg>
  );
}

// The ideal bar of Euler: pinned at the bottom, guided at the top, force exactly on the axis, no lateral forces.
export function IdealBarFigure({ label }: { label: string }) {
  const { t } = useLanguage();
  const id = "pnd-ib";
  return (
    <svg viewBox="0 0 360 200" className="h-auto w-full" role="img" aria-label={label}>
      <defs>
        <Marker id={`${id}-f`} color={LOAD} />
      </defs>
      <rect x="150" y="40" width="20" height="110" fill={FAINT} fillOpacity="0.5" stroke={INK} strokeWidth="1.5" />
      <line x1="160" y1="30" x2="160" y2="160" stroke={INK} strokeWidth="1" strokeDasharray="6 3" />
      <polygon points="160,150 148,170 172,170" fill="none" stroke={INK} strokeWidth="1.5" />
      <line x1="140" y1="170" x2="180" y2="170" stroke={INK} strokeWidth="1.5" />
      <g stroke={INK} strokeWidth="1.5">
        <line x1="140" y1="38" x2="180" y2="38" />
        <circle cx="147" cy="31" r="3" fill="none" />
        <circle cx="160" cy="31" r="3" fill="none" />
        <circle cx="173" cy="31" r="3" fill="none" />
      </g>
      <Arrow id={`${id}-f`} x1={160} y1="2" x2={160} y2="26" color={LOAD} w={3} />
      <text x="170" y="16" fontSize="12" fill={LOAD}><SvgSub>F</SvgSub></text>
      <text x="196" y="80" fontSize="11" fill={INK}>{t("pnd.fig.axis")}</text>
      <text x="196" y="168" fontSize="11" fill={INK}>{t("pnd.fig.pinned")}</text>
      <text x="196" y="30" fontSize="11" fill={INK}>{t("pnd.fig.guided")}</text>
      <text x="196" y="106" fontSize="11" fill={INK}>{t("pnd.fig.nolateral")}</text>
    </svg>
  );
}
