"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sub, SvgSub, plain } from "@/components/Sub";
import { Eq, Figure, GuidePage, Para, Section } from "@/components/guide/GuideBits";

const INK = "#16232E";
const TENSION = "#0B8A8A";
const LOAD = "#C0392B";
const MOMENT = "#7A2A9A";

// Right triangle, legs 9 (horizontal) and 6 (vertical), 20 px per cm. The centroid is at x = 3, y = 2.
const K = 20;
const OX = 50;
const OY = 150;
const px = (x: number) => OX + K * x;
const py = (y: number) => OY - K * y;

function CentroidAxisSVG() {
  const { t } = useLanguage();
  const xg = 3;
  const yg = 2;
  const yCut = 6 * (1 - xg / 9); // height of the hypotenuse over x = xg
  const d1 = 1.6;
  const d2 = 2;
  return (
    <svg viewBox="0 0 290 195" className="h-auto w-full" role="img" aria-label={plain(t("qt.fig"))}>
      <polygon points={`${px(0)},${py(0)} ${px(xg)},${py(0)} ${px(xg)},${py(yCut)} ${px(0)},${py(6)}`} fill={TENSION} fillOpacity="0.2" stroke={TENSION} strokeWidth="1.5" />
      <polygon points={`${px(xg)},${py(0)} ${px(9)},${py(0)} ${px(xg)},${py(yCut)}`} fill={LOAD} fillOpacity="0.2" stroke={LOAD} strokeWidth="1.5" />
      <polygon points={`${px(0)},${py(0)} ${px(9)},${py(0)} ${px(0)},${py(6)}`} fill="none" stroke={INK} strokeWidth="2" />
      {/* centroidal axes */}
      <line x1={px(xg)} y1="12" x2={px(xg)} y2="166" stroke={MOMENT} strokeWidth="1.5" strokeDasharray="6 3" />
      <line x1="34" y1={py(yg)} x2="248" y2={py(yg)} stroke={MOMENT} strokeWidth="1.5" strokeDasharray="6 3" />
      <circle cx={px(xg)} cy={py(yg)} r="3.5" fill={INK} />
      <text x={px(xg) + 6} y={py(yg) - 5} fontSize="13" fontWeight="600" fill={INK}>G</text>
      <text x={px(xg) + 5} y="22" fontSize="12" fill={MOMENT}><SvgSub>y_G</SvgSub></text>
      <text x="252" y={py(yg) + 4} fontSize="12" fill={MOMENT}><SvgSub>x_G</SvgSub></text>
      <text x="70" y="124" fontSize="14" fontWeight="600" fill={TENSION}><SvgSub>F_1</SvgSub></text>
      <text x="152" y="132" fontSize="14" fontWeight="600" fill={LOAD}><SvgSub>F_2</SvgSub></text>
      {/* distances from the centroid of each part to the axis */}
      <line x1={px(xg - d1)} y1="172" x2={px(xg)} y2="172" stroke={TENSION} strokeWidth="1.5" />
      <line x1={px(xg)} y1="172" x2={px(xg + d2)} y2="172" stroke={LOAD} strokeWidth="1.5" />
      {[xg - d1, xg, xg + d2].map((x) => (
        <line key={x} x1={px(x)} y1="167" x2={px(x)} y2="177" stroke={INK} strokeWidth="1.2" />
      ))}
      <text x={px(xg - d1 / 2)} y="188" fontSize="12" fill={TENSION} textAnchor="middle"><SvgSub>d_1</SvgSub></text>
      <text x={px(xg + d2 / 2)} y="188" fontSize="12" fill={LOAD} textAnchor="middle"><SvgSub>d_2</SvgSub></text>
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
            <CentroidAxisSVG />
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
