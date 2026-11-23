"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { SvgSub, plain } from "@/components/Sub";

const INK = "#16232E";
const FAINT = "#C9D2D8";
const TENSION = "#0B8A8A";
const LOAD = "#C0392B";

function Txt(props: React.SVGProps<SVGTextElement> & { children: string }) {
  const { children, ...rest } = props;
  return (
    <text fontSize="11" fill={INK} {...rest}>
      <SvgSub>{children}</SvgSub>
    </text>
  );
}

// 1. Torsion: τ grows linearly with ρ along a diameter of the circular section.
export function TorsionFigure() {
  const { t } = useLanguage();
  return (
    <svg viewBox="0 0 300 150" className="h-auto w-full" role="img" aria-label={plain(t("rs.f1"))}>
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
export function ShearFigure() {
  const { t } = useLanguage();
  return (
    <svg viewBox="0 0 300 170" className="h-auto w-full" role="img" aria-label={plain(t("rs.f2"))}>
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

// 3. Equilibrium: a ball on a valley, a plane and a hill.
export function EquilibriumFigure() {
  const { t } = useLanguage();
  return (
    <svg viewBox="0 0 360 160" className="h-auto w-full" role="img" aria-label={plain(t("rs.f3"))}>
      <path d="M 10 40 Q 60 130 110 40" fill="none" stroke={INK} strokeWidth="2" />
      <circle cx="60" cy="77" r="8" fill={TENSION} />
      <line x1="130" y1="85" x2="230" y2="85" stroke={INK} strokeWidth="2" />
      <circle cx="180" cy="77" r="8" fill={TENSION} />
      <path d="M 250 120 Q 300 30 350 120" fill="none" stroke={INK} strokeWidth="2" />
      <circle cx="300" cy="67" r="8" fill={TENSION} />
      <Txt x="60" y="142" textAnchor="middle" fontWeight="600">{t("rs.fig.stable")}</Txt>
      <Txt x="180" y="142" textAnchor="middle" fontWeight="600">{t("rs.fig.indiff")}</Txt>
      <Txt x="300" y="142" textAnchor="middle" fontWeight="600">{t("rs.fig.unstable")}</Txt>
      <Txt x="60" y="157" textAnchor="middle">F &lt; F_k</Txt>
      <Txt x="180" y="157" textAnchor="middle">F = F_k</Txt>
      <Txt x="300" y="157" textAnchor="middle">F &gt; F_k</Txt>
    </svg>
  );
}

// 4. Hooke: straight line up to σP, slope E = tg β.
export function HookeFigure() {
  const { t } = useLanguage();
  return (
    <svg viewBox="0 0 300 160" className="h-auto w-full" role="img" aria-label={plain(t("rs.f4"))}>
      <line x1="40" y1="130" x2="280" y2="130" stroke={INK} strokeWidth="1.5" />
      <line x1="40" y1="130" x2="40" y2="15" stroke={INK} strokeWidth="1.5" />
      <line x1="40" y1="50" x2="150" y2="50" stroke={FAINT} strokeWidth="1" strokeDasharray="3 3" />
      <line x1="150" y1="50" x2="150" y2="130" stroke={FAINT} strokeWidth="1" strokeDasharray="3 3" />
      <path d="M 150 50 Q 190 35 235 38" fill="none" stroke={LOAD} strokeWidth="2" strokeDasharray="4 3" />
      <line x1="40" y1="130" x2="150" y2="50" stroke={TENSION} strokeWidth="3.5" />
      <circle cx="150" cy="50" r="3" fill={INK} />
      <path d="M 80 130 A 40 40 0 0 0 72.4 106.5" fill="none" stroke={INK} strokeWidth="1" />
      <Txt x="88" y="121" fill={TENSION}>β</Txt>
      <Txt x="34" y="54" textAnchor="end">σ_P</Txt>
      <Txt x="150" y="144" textAnchor="middle">ε_P</Txt>
      <Txt x="46" y="16">σ</Txt>
      <Txt x="284" y="134">ε</Txt>
      <Txt x="60" y="62" fill={TENSION}>σ = E·ε</Txt>
      <Txt x="160" y="112">E = tg β</Txt>
    </svg>
  );
}

// 5. Steiner: the axis x is at distance d from the centroidal axis xg.
export function SteinerFigure() {
  const { t } = useLanguage();
  return (
    <svg viewBox="0 0 300 175" className="h-auto w-full" role="img" aria-label={plain(t("rs.f5"))}>
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
