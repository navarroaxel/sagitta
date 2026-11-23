"use client";

import React from "react";
import { useLanguage, type TranslationKey } from "@/contexts/LanguageContext";
import { Sub, plain } from "@/components/Sub";
import { GuidePage, Section } from "@/components/guide/GuideBits";
import { ROWS } from "@/lib/summaryRows";
import { DefinitionFigure } from "@/components/DefinitionFigure";
import { Figure } from "@/components/guide/GuideBits";
import { EXAM_TERMS } from "@/lib/summaryRows";
import Link from "next/link";

export default function ResumenPage() {
  const { t } = useLanguage();
  const k = (s: string) => t(s as TranslationKey);
  return (
    <GuidePage title="rs.title" kicker="Σ" lead="rs.lead" footer="rs.footer">
      <button
        type="button"
        onClick={() => window.print()}
        className="mb-2 rounded-md border border-teal-600 px-3 py-1.5 text-sm font-medium text-teal-700 hover:bg-teal-50 print:hidden dark:border-teal-400 dark:text-teal-300 dark:hover:bg-stone-800"
      >
        {t("rs.print")}
      </button>

      <Section kicker="rs.s1.kicker" title="rs.s1.title">
        <p className="mb-4 max-w-[66ch] text-stone-700 dark:text-stone-300">
          <Sub>{t("rs.s1.units")}</Sub>
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm" data-testid="rs-table">
            <thead>
              <tr className="border-b-2 border-stone-300 dark:border-stone-600">
                <th className="py-2 pr-3">{t("rs.th.topic")}</th>
                <th className="py-2 pr-3">{t("rs.th.formula")}</th>
                <th className="py-2 pr-3">{t("rs.th.use")}</th>
                <th className="py-2">{t("rs.th.see")}</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.id} data-testid={`rs-row-${r.id}`} className="border-b border-stone-200 align-top dark:border-stone-700">
                  <th scope="row" className="py-2 pr-3 font-semibold">{k(`rs.t.${r.id}`)}</th>
                  <td className="py-2 pr-3 font-mono">
                    <Sub>{r.formula}</Sub>
                  </td>
                  <td className="py-2 pr-3 text-stone-700 dark:text-stone-300">
                    <Sub>{k(`rs.u.${r.id}`)}</Sub>
                  </td>
                  <td className="py-2 text-[13px]">
                    <Link href={r.guide} className="font-medium text-teal-700 hover:underline dark:text-teal-300">
                      {t("rs.guide")}
                    </Link>
                    <ul className="mt-1 space-y-0.5 print:hidden">
                      {r.terms.map((term) => (
                        <li key={term}>
                          <Link href={`/definiciones#${term}`} className="text-stone-600 hover:underline dark:text-stone-400">
                            <Sub>{k(`def.t.${term.split(".")[1]}`)}</Sub>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section kicker="rs.s2.kicker" title="rs.s2.title">
        <div className="space-y-8">
          {EXAM_TERMS.map((id, n) => {
            const term = id.split(".")[1];
            return (
              <div key={id} data-testid={`rs-q${n + 1}`} className="break-inside-avoid">
                <h4 className="mb-2 text-lg font-semibold">
                  {n + 1}. <Sub>{k(`def.t.${term}`)}</Sub>
                </h4>
                <p className="max-w-[66ch] leading-relaxed text-stone-700 dark:text-stone-300">
                  <Sub>{k(`def.d.${term}`)}</Sub>
                </p>
                <div className="max-w-md">
                  <Figure caption={<Sub>{k(`def.f.${term}`)}</Sub>}>
                    <DefinitionFigure id={id} label={plain(k(`def.f.${term}`))} />
                  </Figure>
                </div>
                <Link href={`/definiciones#${id}`} className="text-sm text-teal-700 hover:underline print:hidden dark:text-teal-300">
                  {t("rs.s2.see")}
                </Link>
              </div>
            );
          })}
        </div>
      </Section>
    </GuidePage>
  );
}
