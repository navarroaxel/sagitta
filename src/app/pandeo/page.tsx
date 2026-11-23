"use client";

import React from "react";
import { useLanguage, type TranslationKey } from "@/contexts/LanguageContext";
import { Sub, plain } from "@/components/Sub";
import { Eq, Figure, GuidePage, Para, Section } from "@/components/guide/GuideBits";
import PandeoCalculator from "@/components/PandeoCalculator";
import { END_CONDITIONS } from "@/lib/buckling";
import { EndConditionSVG, HyperbolaSVG } from "@/components/PandeoFigures";

const EXAMPLES = ["e1", "e2", "e3", "e4"] as const;

export default function PandeoPage() {
  const { t, language } = useLanguage();
  const cases = [
    { k: "c1", cls: "border-teal-600" },
    { k: "c2", cls: "border-amber-500" },
    { k: "c3", cls: "border-red-600" },
  ] as const;
  return (
    <GuidePage title="pnd.title" kicker="F_k · λ · c" lead="pnd.lead" footer="pnd.footer">
      <Section kicker="pnd.s1.kicker" title="pnd.s1.title">
        <Para k="pnd.s1.p1" />
        <Para k="pnd.s1.p2" />
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          {cases.map(({ k, cls }) => (
            <div key={k} data-testid={`pnd-${k}`} className={`rounded-lg border-l-4 bg-white p-3 dark:bg-stone-900 ${cls}`}>
              <p className="mb-1 font-semibold"><Sub>{t(`pnd.s1.${k}.t` as TranslationKey)}</Sub></p>
              <p className="text-[15px] text-stone-600 dark:text-stone-400">{t(`pnd.s1.${k}.d` as TranslationKey)}</p>
            </div>
          ))}
        </div>
        <Para k="pnd.s1.p3" />
      </Section>

      <Section kicker="pnd.s2.kicker" title="pnd.s2.title">
        <ol className="mb-4 max-w-[66ch] list-decimal space-y-2 pl-6 text-stone-700 dark:text-stone-300">
          {(["h1", "h2", "h3", "h4"] as const).map((k) => (
            <li key={k}>
              <Sub>{t(`pnd.s2.${k}` as TranslationKey)}</Sub>
            </li>
          ))}
        </ol>
      </Section>

      <Section kicker="pnd.s3.kicker" title="pnd.s3.title">
        <Para k="pnd.s3.p1" />
        <Eq boxed>{"{F}_k = π²·{E}·{J}_min / (c²·{l}²)"}</Eq>
        <Para k="pnd.s3.p2" />
        <Eq>{"λ = {l}_0 / i_min        {F}_k = π²·{E}·{A} / λ²"}</Eq>
        <Para k="pnd.s3.p3" />
        <Eq boxed>{"σ_k = {F}_k / {A} = π²·{E} / λ²"}</Eq>
        <div className="mx-auto max-w-md">
          <Figure caption={<Sub>{t("pnd.s3.fig")}</Sub>}>
            <HyperbolaSVG />
          </Figure>
        </div>
        <Para k="pnd.s3.p4" />
      </Section>

      <Section kicker="pnd.s4.kicker" title="pnd.s4.title">
        <Para k="pnd.s4.p1" />
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {END_CONDITIONS.map((ec) => (
            <div key={ec.id} data-testid={`pnd-end-${ec.id}`} className="rounded-lg border border-stone-200 bg-white p-2 text-center dark:border-stone-700 dark:bg-stone-100">
              <EndConditionSVG id={ec.id} />
              <p className="text-[13px] text-stone-600">
                {t(`pnd.s4.${ec.id === "cantilever" ? "fixedfree" : ec.id.replace(/-/g, "")}` as TranslationKey)}
              </p>
              <p className="font-mono text-sm text-stone-800">c = {String(ec.c).replace(".", language === "es" ? "," : ".")}</p>
            </div>
          ))}
        </div>
        <Para k="pnd.s4.p2" />
      </Section>

      <Section kicker="pnd.s5.kicker" title="pnd.s5.title">
        <div className="mb-4 grid gap-3">
          {EXAMPLES.map((e) => (
            <div key={e} data-testid={`pnd-${e}`} className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
              <p className="mb-1 text-[15px] font-semibold"><Sub>{t(`pnd.s5.${e}.t` as TranslationKey)}</Sub></p>
              <p className="whitespace-pre-line font-mono text-[14px] leading-relaxed"><Sub>{t(`pnd.s5.${e}.r` as TranslationKey)}</Sub></p>
            </div>
          ))}
        </div>
        <p className="mb-2 max-w-[66ch] text-sm leading-relaxed text-amber-700 dark:text-amber-400"><Sub>{t("pnd.s5.note")}</Sub></p>
        <PandeoCalculator />
      </Section>
    </GuidePage>
  );
}
