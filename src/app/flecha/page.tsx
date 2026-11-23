"use client";

import React from "react";
import { useLanguage, type TranslationKey } from "@/contexts/LanguageContext";
import { Sub, plain } from "@/components/Sub";
import { Eq, Figure, GuidePage, Para, Section } from "@/components/guide/GuideBits";
import DeflectionCalculator from "@/components/DeflectionCalculator";
import { DEFLECTION_CASES, type DeflectionCaseId } from "@/lib/deflection";

const INK = "#16232E";
const FAINT = "#C9D2D8";
const LOAD = "#C0392B";
const MOMENT = "#7A2A9A";

// Element ds of the axis: circular arcs centred on C, radii meeting the ends of ds.
function CurvatureSVG() {
  const { t } = useLanguage();
  const cx = 130;
  const cy = 20;
  const rho = 140;
  const pt = (r: number, phi: number) => [cx + r * Math.sin(phi), cy + r * Math.cos(phi)] as const;
  const arc = (r: number, phi: number) => {
    const [x1, y1] = pt(r, -phi);
    const [x2, y2] = pt(r, phi);
    return `M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 0 0 ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  };
  const dphi = 0.18;
  const [ax, ay] = pt(rho, -dphi);
  const [bx, by] = pt(rho, dphi);
  return (
    <svg viewBox="0 0 260 190" className="h-auto w-full" role="img" aria-label={plain(t("fla.s1.fig"))}>
      <line x1={cx} y1={cy} x2={ax} y2={ay} stroke={FAINT} strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1={cx} y1={cy} x2={bx} y2={by} stroke={FAINT} strokeWidth="1.5" strokeDasharray="4 3" />
      <path d={arc(rho, 0.5)} fill="none" stroke={INK} strokeWidth="2.5" />
      <path d={arc(rho, dphi)} fill="none" stroke={MOMENT} strokeWidth="4" />
      <path d={arc(40, dphi)} fill="none" stroke={INK} strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r="3.5" fill={INK} />
      <text x="138" y="18" fontSize="13" fontWeight="600" fill={INK}>C</text>
      <text x="130" y="72" fontSize="12" fontStyle="italic" textAnchor="middle" fill={INK}>dθ</text>
      <text x="108" y="96" fontSize="13" fontStyle="italic" fill={INK}>ρ</text>
      <text x="130" y="180" fontSize="12" fontStyle="italic" textAnchor="middle" fill={MOMENT}>ds</text>
    </svg>
  );
}

// Tiny schematic of each of the seven cases: beam, supports, load.
function CaseSVG({ id }: { id: DeflectionCaseId }) {
  const cant = id.startsWith("cant");
  const x0 = 20;
  const x1 = 180;
  const yb = 44;
  const arrows = (xs: number[]) =>
    xs.map((x) => (
      <g key={x}>
        <line x1={x} y1={14} x2={x} y2={yb - 2} stroke={LOAD} strokeWidth="1.5" />
        <polygon points={`${x},${yb} ${x - 3},${yb - 7} ${x + 3},${yb - 7}`} fill={LOAD} />
      </g>
    ));
  const tri = (up: boolean) =>
    [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
      const x = x0 + 8 + i * 20;
      const frac = (x - x0) / (x1 - x0);
      const hgt = 30 * (up ? frac : 1 - frac);
      return (
        <g key={i}>
          <line x1={x} y1={yb - hgt} x2={x} y2={yb - 2} stroke={LOAD} strokeWidth="1.5" />
        </g>
      );
    });
  return (
    <svg viewBox="0 0 200 64" className="h-auto w-full" role="img" aria-hidden="true">
      <line x1={x0} y1={yb} x2={x1} y2={yb} stroke={INK} strokeWidth="3" strokeLinecap="round" />
      {cant ? (
        <rect x={x0 - 6} y={yb - 14} width="6" height="28" fill={INK} />
      ) : (
        <>
          <polygon points={`${x0},${yb} ${x0 - 6},${yb + 12} ${x0 + 6},${yb + 12}`} fill="none" stroke={INK} strokeWidth="1.5" />
          <polygon points={`${x1},${yb} ${x1 - 6},${yb + 12} ${x1 + 6},${yb + 12}`} fill="none" stroke={INK} strokeWidth="1.5" />
        </>
      )}
      {(id === "ss-udl" || id === "cant-udl") && arrows([40, 70, 100, 130, 160])}
      {id === "ss-point" && arrows([100])}
      {id === "cant-point" && arrows([x1])}
      {id === "cant-tri-down" && tri(false)}
      {id === "cant-tri-up" && tri(true)}
      {id === "ss-tri" && tri(false)}
    </svg>
  );
}

export default function FlechaPage() {
  const { t } = useLanguage();
  return (
    <GuidePage title="fla.title" kicker="M · E · J_x · f" lead="fla.lead" footer="fla.footer">
      <Section kicker="fla.s1.kicker" title="fla.s1.title">
        <Para k="fla.s1.p1" />
        <Eq>{"1/ρ = ε / {y}"}</Eq>
        <Para k="fla.s1.p2" />
        <Eq>{"ε = σ/{E} = {M}·{y} / ({J}_x·{E})"}</Eq>
        <Para k="fla.s1.p3" />
        <Eq boxed>{"1/ρ = {M} / ({E}·{J}_x)"}</Eq>
        <Eq boxed>{"ρ = {E}·{J}_x / {M}"}</Eq>
        <div className="mx-auto max-w-xs">
          <Figure caption={<Sub>{t("fla.s1.fig")}</Sub>}>
            <CurvatureSVG />
          </Figure>
        </div>
      </Section>

      <Section kicker="fla.s2.kicker" title="fla.s2.title">
        <Para k="fla.s2.p1" />
        <Eq>{"1/ρ = dθ/{dz} = {d}²{y}/{dz}²"}</Eq>
        <Para k="fla.s2.p2" />
        <Eq boxed>{"{d}²{y}/{dz}² = − {M} / ({E}·{J}_x)"}</Eq>
        <Para k="fla.s2.p3" />
      </Section>

      <Section kicker="fla.s3.kicker" title="fla.s3.title">
        <Para k="fla.s3.p1" />
        <Eq>{"df = {x}·tg α ≈ {x}·{d}α = {x}·{dx}/ρ = {M}·{x}·{dx} / ({E}·{J}_x)"}</Eq>
        <Para k="fla.s3.p2" />
        <Eq boxed>{"f = ∫₀^l {M}·{x}·{dx} / ({E}·{J}_x)"}</Eq>
        <Para k="fla.s3.p3" />
      </Section>

      <Section kicker="fla.s4.kicker" title="fla.s4.title">
        <Para k="fla.s4.p1" />
        <ol className="mb-4 grid gap-3 sm:grid-cols-2">
          {DEFLECTION_CASES.map((c, i) => (
            <li
              key={c.id}
              data-testid={`fla-case-${c.id}`}
              className="rounded-lg border border-stone-200 bg-white p-3 dark:border-stone-700 dark:bg-stone-900"
            >
              <p className="mb-1 text-sm font-semibold">
                {i + 1}) {t(`fla.case.${c.id}` as TranslationKey)}
              </p>
              <div className="rounded bg-white p-1 dark:bg-stone-100">
                <CaseSVG id={c.id} />
              </div>
              <p className="mt-1 font-mono text-[15px]">
                <Sub>{`f_max = ${c.label} / (E·J_x)`}</Sub>
              </p>
              {c.z && <p className="mt-1 text-[13px] text-stone-500">{t("fla.case.ss-tri.z")}</p>}
            </li>
          ))}
        </ol>
        <p className="mb-2 text-sm text-stone-500 dark:text-stone-400"><Sub>{t("fla.s4.note")}</Sub></p>
        <DeflectionCalculator />
      </Section>
    </GuidePage>
  );
}
