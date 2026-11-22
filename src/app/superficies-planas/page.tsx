"use client";

import React from "react";
import { useLanguage, type TranslationKey } from "@/contexts/LanguageContext";
import { SvgSub, Sub } from "@/components/Sub";
import { Eq, Figure, GuidePage, Para, Section } from "@/components/guide/GuideBits";
import SteinerCalculator from "@/components/SteinerCalculator";

const INK = "#16232E";
const MOMENT = "#7A2A9A";
const REACT = "#1A73E8";

// Steiner: area with centroid G and axes Xg, Yg (through G), and X, Y displaced b and a.
function SteinerSVG() {
  const { t } = useLanguage();
  const gx = 150;
  const gy = 80;
  const ox = 60;
  const oy = 150;
  return (
    <svg viewBox="0 0 260 180" className="h-auto w-full" role="img" aria-label={t("pln.s5.fig")}>
      <rect x="110" y="40" width="80" height="80" rx="6" fill="#E7EEF2" stroke={INK} strokeWidth="2" />
      {/* centroidal axes */}
      <line x1="96" y1={gy} x2="214" y2={gy} stroke={MOMENT} strokeWidth="1.5" strokeDasharray="5 3" />
      <line x1={gx} y1="28" x2={gx} y2="132" stroke={MOMENT} strokeWidth="1.5" strokeDasharray="5 3" />
      {/* displaced axes */}
      <line x1={ox - 14} y1={oy} x2="236" y2={oy} stroke={REACT} strokeWidth="2" />
      <line x1={ox} y1="22" x2={ox} y2={oy + 12} stroke={REACT} strokeWidth="2" />
      <circle cx={gx} cy={gy} r="3.5" fill={INK} />
      <text x={gx + 6} y={gy - 6} fontSize="13" fontWeight="600" fill={INK}>G</text>
      <text x="218" y={gy - 5} fontSize="12" fill={MOMENT}><SvgSub>X_g</SvgSub></text>
      <text x={gx + 4} y="26" fontSize="12" fill={MOMENT}><SvgSub>Y_g</SvgSub></text>
      <text x="240" y={oy + 4} fontSize="12" fill={REACT}>X</text>
      <text x={ox + 5} y="22" fontSize="12" fill={REACT}>Y</text>
      {/* distances */}
      <line x1="222" y1={gy} x2="222" y2={oy} stroke={INK} strokeWidth="1" />
      <text x="226" y={(gy + oy) / 2 + 4} fontSize="12" fontStyle="italic" fill={INK}>b</text>
      <line x1={ox} y1="140" x2={gx} y2="140" stroke={INK} strokeWidth="1" />
      <text x={(ox + gx) / 2 - 3} y="136" fontSize="12" fontStyle="italic" fill={INK}>a</text>
    </svg>
  );
}

const EXAMPLES = ["ex1", "ex2", "ex3"] as const;

export default function SuperficiesPlanasPage() {
  const { t } = useLanguage();
  return (
    <GuidePage title="pln.title" kicker="S_x · J_x · J_xy" lead="pln.lead" footer="pln.footer">
      <Section kicker="pln.s1.kicker" title="pln.s1.title">
        <Para k="pln.s1.p1" />
        <Eq>{t("pln.s1.e1")}</Eq>
        <Para k="pln.s1.p2" />
        <Para k="pln.s1.p3" />
        <p className="mb-4 max-w-[66ch] rounded-md border-l-4 border-teal-600 bg-stone-100 px-4 py-2 font-medium dark:border-teal-400 dark:bg-stone-900">
          {t("pln.s1.p4")}
        </p>
      </Section>

      <Section kicker="pln.s2.kicker" title="pln.s2.title">
        <Para k="pln.s2.p1" />
        <Eq boxed>{t("pln.s2.e1")}</Eq>
        <Eq boxed>{t("pln.s2.e2")}</Eq>
        <Para k="pln.s2.p2" />
        <p className="mb-2 font-semibold">{t("pln.s2.ex.title")}</p>
        <div className="mb-4 grid gap-3">
          {EXAMPLES.map((e) => (
            <div
              key={e}
              data-testid={`pln-${e}`}
              className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900"
            >
              <p className="mb-1 text-[15px] font-semibold">{t(`pln.s2.${e}.t` as TranslationKey)}</p>
              <p className="font-mono text-[14px] leading-relaxed">
                <Sub>{t(`pln.s2.${e}.r` as TranslationKey)}</Sub>
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section kicker="pln.s3.kicker" title="pln.s3.title">
        <Para k="pln.s3.p1" />
        <ul className="mb-4 max-w-[66ch] list-disc space-y-2 pl-5 text-stone-700 dark:text-stone-300">
          <li data-testid="pln-add"><Sub>{t("pln.s3.add")}</Sub></li>
          <li data-testid="pln-sub"><Sub>{t("pln.s3.sub")}</Sub></li>
        </ul>
      </Section>

      <Section kicker="pln.s4.kicker" title="pln.s4.title">
        <Para k="pln.s4.p1" />
        <Eq>{t("pln.s4.e1")}</Eq>
        <Eq>{t("pln.s4.e2")}</Eq>
        <Eq>{t("pln.s4.e3")}</Eq>
        <Para k="pln.s4.p2" />
        <Eq>{t("pln.s4.e4")}</Eq>
        <Para k="pln.s4.p3" />
        <Eq boxed>J_x = b·h³ / 12</Eq>
        <Para k="pln.s4.p4" />
        <Para k="pln.s4.p5" />
      </Section>

      <Section kicker="pln.s5.kicker" title="pln.s5.title">
        <Para k="pln.s5.p1" />
        <div className="mx-auto max-w-xs">
          <Figure caption={<Sub>{t("pln.s5.fig")}</Sub>}>
            <SteinerSVG />
          </Figure>
        </div>
        <Para k="pln.s5.p2" />
        <Eq>{t("pln.s5.e1")}</Eq>
        <Para k="pln.s5.p3" />
        <Eq boxed>J_x = J_xg + A·b²</Eq>
        <Eq boxed>J_y = J_yg + A·a²</Eq>
        <div data-testid="pln-steiner-use" className="my-4 rounded-lg border-2 border-teal-600 bg-white p-4 dark:border-teal-400 dark:bg-stone-900">
          <p className="mb-2 font-semibold">{t("pln.s5.use.title")}</p>
          <Para k="pln.s5.use.p1" />
          <Para k="pln.s5.use.p2" />
        </div>
        <SteinerCalculator />
      </Section>

      <Section kicker="pln.s6.kicker" title="pln.s6.title">
        <Para k="pln.s6.p1" />
        <Eq>{t("pln.s6.e1")}</Eq>
        <Eq>{t("pln.s6.e2")}</Eq>
        <Eq>{t("pln.s6.e3")}</Eq>
        <Para k="pln.s6.p2" />
      </Section>

      <Section kicker="pln.s7.kicker" title="pln.s7.title">
        <Para k="pln.s7.p1" />
        <Para k="pln.s7.p2" />
        <Eq boxed>{t("pln.s7.e1")}</Eq>
        <Para k="pln.s7.p3" />
        <Para k="pln.s7.p4" />
        <Para k="pln.s7.p5" />
      </Section>
    </GuidePage>
  );
}
