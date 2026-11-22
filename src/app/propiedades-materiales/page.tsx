"use client";

import React from "react";
import { useLanguage, type TranslationKey } from "@/contexts/LanguageContext";
import { Sub, SvgSub } from "@/components/Sub";
import { Eq, Figure, GuidePage, Para, Section } from "@/components/guide/GuideBits";

const INK = "#16232E";
const FAINT = "#C9D2D8";
const TENSION = "#0B8A8A";
const LOAD = "#C0392B";

// Schematic σ–ε diagram of a ductile steel with the limits σP, σE, σFl, σRot and the three periods.
function StressStrainSVG() {
  const { t } = useLanguage();
  const O = [40, 170];
  const P = [78, 100];
  const E = [96, 82];
  const S = [112, 72];
  const T = [168, 72];
  const M = [250, 28];
  const Z = [318, 62];
  const path =
    `M ${O} L ${P} Q ${(P[0] + E[0]) / 2 + 6},${(P[1] + E[1]) / 2 - 2} ${E[0]},${E[1]} L ${S} ` +
    `l 8,-4 l 8,5 l 8,-5 l 8,4 l 8,-3 L ${T} C 195,70 215,30 ${M} C 285,24 310,34 ${Z}`;
  const guide = (y: number, x: number, label: string) => (
    <g>
      <line x1="40" y1={y} x2={x} y2={y} stroke={FAINT} strokeWidth="1" strokeDasharray="3 3" />
      <text x="34" y={y + 4} fontSize="11" textAnchor="end" fill={INK}><SvgSub>{label}</SvgSub></text>
    </g>
  );
  return (
    <svg viewBox="0 0 380 220" className="h-auto w-full" role="img" aria-label={t("mat.s5.fig")}>
      <line x1="40" y1="170" x2="360" y2="170" stroke={INK} strokeWidth="1.5" />
      <line x1="40" y1="170" x2="40" y2="10" stroke={INK} strokeWidth="1.5" />
      {guide(P[1], P[0], "σ_P")}
      {guide(E[1], E[0], "σ_E")}
      {guide(M[1], M[0], "σ_Rot")}
      <line x1={Z[0]} y1={Z[1]} x2={Z[0]} y2="170" stroke={FAINT} strokeWidth="1" strokeDasharray="3 3" />
      <path d={path} fill="none" stroke={LOAD} strokeWidth="2.5" />
      <path d={`M ${O} L ${P}`} fill="none" stroke={TENSION} strokeWidth="3.5" />
      <circle cx={P[0]} cy={P[1]} r="3" fill={INK} />
      <circle cx={M[0]} cy={M[1]} r="3" fill={INK} />
      <circle cx={Z[0]} cy={Z[1]} r="3" fill={INK} />
      <text x="52" y="146" fontSize="12" fontStyle="italic" fill={TENSION}>β</text>
      <text x="372" y="162" fontSize="11" textAnchor="end" fill={INK}><SvgSub>{t("mat.s5.fig.eps")}</SvgSub></text>
      <text x="46" y="16" fontSize="11" fill={INK}><SvgSub>{t("mat.s5.fig.sigma")}</SvgSub></text>
      <text x={Z[0] - 6} y={Z[1] - 8} fontSize="12" fontWeight="600" fill={INK}>Z</text>
      <line x1="40" y1="190" x2={E[0] + 4} y2="190" stroke={INK} strokeWidth="1" />
      <text x="62" y="204" fontSize="11" fill={INK}>{t("mat.s5.fig.p1")}</text>
      <line x1={E[0] + 8} y1="190" x2={T[0]} y2="190" stroke={INK} strokeWidth="1" />
      <text x="116" y="204" fontSize="11" fill={INK}>{t("mat.s5.fig.p2")}</text>
      <line x1={T[0] + 4} y1="190" x2={Z[0]} y2="190" stroke={INK} strokeWidth="1" />
      <text x="214" y="204" fontSize="11" fill={INK}>{t("mat.s5.fig.p3")}</text>
    </svg>
  );
}

// Resilience: area under the elastic straight line up to σe.
function ResilienceSVG() {
  const { t } = useLanguage();
  return (
    <svg viewBox="0 0 220 160" className="h-auto w-full" role="img" aria-label={t("mat.s6.fig")}>
      <line x1="30" y1="130" x2="205" y2="130" stroke={INK} strokeWidth="1.5" />
      <line x1="30" y1="130" x2="30" y2="14" stroke={INK} strokeWidth="1.5" />
      <polygon points="30,130 130,40 130,130" fill={TENSION} opacity="0.3" stroke={TENSION} strokeWidth="1.5" />
      <path d="M 130 40 Q 150 24 170 22" fill="none" stroke={LOAD} strokeWidth="2" />
      <line x1="30" y1="40" x2="130" y2="40" stroke={FAINT} strokeWidth="1" strokeDasharray="3 3" />
      <text x="24" y="44" fontSize="11" textAnchor="end" fill={INK}><SvgSub>σ_e</SvgSub></text>
      <text x="126" y="146" fontSize="11" textAnchor="middle" fill={INK}><SvgSub>ε_e</SvgSub></text>
      <text x="94" y="112" fontSize="12" fill={INK}>U = ½·σ²/E</text>
    </svg>
  );
}

export default function PropiedadesMaterialesPage() {
  const { t } = useLanguage();
  const list = (keys: string[], prefix: string, ordered = false) => {
    const L = ordered ? "ol" : "ul";
    return (
      <L className={`mb-4 max-w-[66ch] space-y-2 pl-6 text-stone-700 dark:text-stone-300 ${ordered ? "list-decimal" : "list-disc"}`}>
        {keys.map((k) => (
          <li key={k}>
            <Sub>{t(`${prefix}${k}` as TranslationKey)}</Sub>
          </li>
        ))}
      </L>
    );
  };
  return (
    <GuidePage title="mat.title" kicker="σ · ε · E" lead="mat.lead" footer="mat.footer">
      <Section kicker="mat.s1.kicker" title="mat.s1.title">
        <Para k="mat.s1.p1" />
        <Para k="mat.s1.p2" />
      </Section>

      <Section kicker="mat.s2.kicker" title="mat.s2.title">
        <Para k="mat.s2.p1" />
        <Para k="mat.s2.p2" />
        <Eq>{t("mat.s2.e1")}</Eq>
        <Para k="mat.s2.p3" />
        <Para k="mat.s2.p4" />
        <Eq boxed>{t("mat.s2.e2")}</Eq>
        <Para k="mat.s2.p5" />
        {list(["t1", "t2", "t3"], "mat.s2.", true)}
        <Para k="mat.s2.p6" />
      </Section>

      <Section kicker="mat.s3.kicker" title="mat.s3.title">
        <Para k="mat.s3.p1" />
        <Para k="mat.s3.p2" />
        <Eq boxed>{t("mat.s3.e1")}</Eq>
        <Para k="mat.s3.p3" />
      </Section>

      <Section kicker="mat.s4.kicker" title="mat.s4.title">
        {list(["d1", "d2"], "mat.s4.")}
        {list(["l1", "l2", "l3", "l4"], "mat.s4.")}
        <Para k="mat.s4.p1" />
        <Eq boxed>{t("mat.s4.e1")}</Eq>
      </Section>

      <Section kicker="mat.s5.kicker" title="mat.s5.title">
        <div className="mx-auto max-w-lg">
          <Figure caption={<Sub>{t("mat.s5.fig")}</Sub>}>
            <StressStrainSVG />
          </Figure>
        </div>
        <div className="mb-4 grid gap-3">
          {(["s1", "s2", "s3"] as const).map((k) => (
            <div key={k} data-testid={`mat-phase-${k}`} className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
              <p className="mb-1 font-semibold"><Sub>{t(`mat.s5.${k}.t` as TranslationKey)}</Sub></p>
              <p className="text-[15px] leading-relaxed text-stone-600 dark:text-stone-400"><Sub>{t(`mat.s5.${k}.d` as TranslationKey)}</Sub></p>
            </div>
          ))}
        </div>
        <Para k="mat.s5.hooke" />
        <Eq boxed>σ = E · ε        E = tg β</Eq>
      </Section>

      <Section kicker="mat.s6.kicker" title="mat.s6.title">
        <Para k="mat.s6.p1" />
        <Para k="mat.s6.p2" />
        <Para k="mat.s6.p3" />
        <Eq boxed>{t("mat.s6.e1")}</Eq>
        <div className="mx-auto max-w-xs">
          <Figure caption={<Sub>{t("mat.s6.fig")}</Sub>}>
            <ResilienceSVG />
          </Figure>
        </div>
        <Para k="mat.s6.p4" />
        <Para k="mat.s6.p5" />
      </Section>

      <Section kicker="mat.s7.kicker" title="mat.s7.title">
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          {(["m1", "m2", "m3"] as const).map((k) => (
            <div key={k} data-testid={`mat-type-${k}`} className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
              <p className="mb-1 font-semibold">{t(`mat.s7.${k}.t` as TranslationKey)}</p>
              <p className="text-[15px] leading-relaxed text-stone-600 dark:text-stone-400">{t(`mat.s7.${k}.d` as TranslationKey)}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section kicker="mat.s8.kicker" title="mat.s8.title">
        <Para k="mat.s8.p1" />
        <Para k="mat.s8.p2" />
        <Para k="mat.s8.p3" />
        <Eq>{t("mat.s8.e1")}</Eq>
        <Para k="mat.s8.p4" />
        <Eq boxed>{t("mat.s8.q1")}</Eq>
        <Eq boxed>{t("mat.s8.q2")}</Eq>
        <Eq boxed>{t("mat.s8.q3")}</Eq>
        <Eq boxed>{t("mat.s8.q4")}</Eq>
        <p className="mb-2 max-w-[66ch] text-sm leading-relaxed text-amber-700 dark:text-amber-400">
          <Sub>{t("mat.s8.note")}</Sub>
        </p>
      </Section>
    </GuidePage>
  );
}
