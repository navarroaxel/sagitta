"use client";

import React, { useId } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sub, SvgSub, plain } from "@/components/Sub";
import { Eq, Figure, GuidePage, Para, Section } from "@/components/guide/GuideBits";

const INK = "#16232E";
const TENSION = "#0B8A8A";
const LOAD = "#C0392B";
const MOMENT = "#7A2A9A";

// The exam's figure: a rectangle (10 × 4 cm, 24 px per cm); F1 (/ hatching) is its left quarter, F2 (\ hatching) the rest,
// and y_G goes through the centroid of the whole rectangle (so it crosses F2).
function RectangleSVG() {
  const { t } = useLanguage();
  const id = useId();
  const k = 24;
  const x0 = 40;
  const y0 = 36;
  const w = 10 * k;
  const h = 4 * k;
  const w1 = w / 4;
  const xg = x0 + w / 2; // y_G
  const ym = y0 + h / 2;
  const g1 = x0 + w1 / 2; // centroid of F1
  const g2 = x0 + w1 + (w - w1) / 2; // centroid of F2
  return (
    <svg viewBox="0 0 330 185" className="h-auto w-full" role="img" aria-label={plain(t("qt.fig"))}>
      <defs>
        <pattern id={`${id}-a`} width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M -2 10 L 10 -2" stroke={TENSION} strokeWidth="1.2" />
        </pattern>
        <pattern id={`${id}-b`} width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M -2 -2 L 10 10" stroke={LOAD} strokeWidth="1.2" />
        </pattern>
      </defs>
      <rect data-part="F1" x={x0} y={y0} width={w1} height={h} fill={`url(#${id}-a)`} stroke={TENSION} strokeWidth="1.5" />
      <rect data-part="F2" x={x0 + w1} y={y0} width={w - w1} height={h} fill={`url(#${id}-b)`} stroke={LOAD} strokeWidth="1.5" />
      <rect x={x0} y={y0} width={w} height={h} fill="none" stroke={INK} strokeWidth="2" />
      <line x1={xg} y1={y0 - 18} x2={xg} y2={y0 + h + 18} stroke={MOMENT} strokeWidth="1.5" strokeDasharray="6 3" />
      <line x1={x0 - 18} y1={ym} x2={x0 + w + 18} y2={ym} stroke={MOMENT} strokeWidth="1.5" strokeDasharray="6 3" />
      <circle cx={xg} cy={ym} r="3.5" fill={INK} />
      <circle cx={g1} cy={ym} r="3" fill={TENSION} />
      <circle cx={g2} cy={ym} r="3" fill={LOAD} />
      <rect x={xg - 22} y={ym + 4} width="18" height="16" fill="#fff" fillOpacity="0.9" />
      <text x={xg - 19} y={ym + 17} fontSize="13" fontWeight="600" fill={INK}>G</text>
      <rect x={g1 - 12} y={ym + 6} width="24" height="16" fill="#fff" fillOpacity="0.9" />
      <text x={g1 - 9} y={ym + 18} fontSize="12" fill={TENSION}><SvgSub>G_1</SvgSub></text>
      <rect x={g2 - 12} y={ym + 6} width="24" height="16" fill="#fff" fillOpacity="0.9" />
      <text x={g2 - 9} y={ym + 18} fontSize="12" fill={LOAD}><SvgSub>G_2</SvgSub></text>
      <text x={xg + 5} y={y0 - 20} fontSize="12" fill={MOMENT}><SvgSub>y_G</SvgSub></text>
      <text x={x0 + w + 22} y={ym + 4} fontSize="12" fill={MOMENT}><SvgSub>x_G</SvgSub></text>
      <rect x={x0 + 6} y={y0 + 8} width="26" height="20" fill="#fff" fillOpacity="0.9" />
      <text x={x0 + 9} y={y0 + 23} fontSize="14" fontWeight="600" fill={TENSION}><SvgSub>F_1</SvgSub></text>
      <rect x={xg + 50} y={y0 + h - 30} width="26" height="20" fill="#fff" fillOpacity="0.9" />
      <text x={xg + 53} y={y0 + h - 15} fontSize="14" fontWeight="600" fill={LOAD}><SvgSub>F_2</SvgSub></text>
      {/* distances from the centroid of each part to the axis y_G */}
      <line x1={g1} y1="150" x2={xg} y2="150" stroke={TENSION} strokeWidth="1.5" />
      <line x1={xg} y1="150" x2={g2} y2="150" stroke={LOAD} strokeWidth="1.5" />
      {[g1, xg, g2].map((x) => (
        <line key={x} x1={x} y1="145" x2={x} y2="155" stroke={INK} strokeWidth="1.2" />
      ))}
      <text x={(g1 + xg) / 2} y="170" fontSize="12" fill={TENSION} textAnchor="middle"><SvgSub>d_1</SvgSub></text>
      <text x={(xg + g2) / 2} y="170" fontSize="12" fill={LOAD} textAnchor="middle"><SvgSub>d_2</SvgSub></text>
    </svg>
  );
}

export default function PreguntasTeoriaPage() {
  const { t } = useLanguage();
  return (
    <GuidePage title="qt.title" kicker="S_yG(F_1) = −S_yG(F_2)" lead="qt.lead" footer="qt.footer">
      <Section kicker="qt.stmt.kicker" title="qt.stmt.title">
        <p className="mb-4 max-w-[66ch] rounded-md border-l-4 border-teal-600 bg-stone-100 px-4 py-2 font-medium dark:border-teal-400 dark:bg-stone-900">
          <Sub>{t("qt.stmt.q")}</Sub>
        </p>
      </Section>

      <Section kicker="qt.ans.kicker" title="qt.ans.title">
        <Para k="qt.ans.p1" />
        <Eq boxed>{"{S}_yG({F}_1) = −{S}_yG({F}_2)    {S}_yG({F}_1) + {S}_yG({F}_2) = 0"}</Eq>
        <Para k="qt.ans.p2" />
        <Para k="qt.ans.p3" />
      </Section>

      <Section kicker="qt.why.kicker" title="qt.why.title">
        <Para k="qt.why.p1" />
        <Para k="qt.why.p2" />
        <Para k="qt.why.p3" />
        <Para k="qt.why.p4" />
        <Eq>{"{F}_1·{d}_1 = {F}_2·{d}_2"}</Eq>
        <Para k="qt.why.p5" />
      </Section>

      <Section kicker="qt.ex.kicker" title="qt.ex.title">
        <Para k="qt.ex.p1" />
        <div className="mx-auto max-w-sm">
          <Figure caption={<Sub>{t("qt.fig")}</Sub>}>
            <RectangleSVG />
          </Figure>
        </div>
        <div data-testid="qt-ex" className="mb-4 rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
          <p className="whitespace-pre-line font-mono text-[14px] leading-relaxed">
            <Sub>{t("qt.ex.r")}</Sub>
          </p>
        </div>
        <p className="text-sm">
          <Link href="/definiciones#pln.estatico" className="text-teal-700 underline dark:text-teal-400">
            {t("qt.defs")}
          </Link>
        </p>
      </Section>

      <Section kicker="qt.exam.kicker" title="qt.exam.title">
        <p data-testid="qt-answer" className="mb-4 max-w-[66ch] rounded-md border-l-4 border-teal-600 bg-stone-100 px-4 py-3 leading-relaxed dark:border-teal-400 dark:bg-stone-900">
          <Sub>{t("qt.exam.p")}</Sub>
        </p>
      </Section>
    </GuidePage>
  );
}
