"use client";

import React from "react";
import { useLanguage, type TranslationKey } from "@/contexts/LanguageContext";
import { Sub } from "@/components/Sub";
import { GuidePage, Section } from "@/components/guide/GuideBits";
import { ROWS } from "@/lib/summaryRows";

const QUESTIONS: { id: string; answers: number }[] = [
  { id: "q1", answers: 5 },
  { id: "q2", answers: 4 },
  { id: "q3", answers: 3 },
  { id: "q4", answers: 3 },
  { id: "q5", answers: 3 },
];

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
                <th className="py-2">{t("rs.th.use")}</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.id} data-testid={`rs-row-${r.id}`} className="border-b border-stone-200 align-top dark:border-stone-700">
                  <th scope="row" className="py-2 pr-3 font-semibold">{k(`rs.t.${r.id}`)}</th>
                  <td className="py-2 pr-3 font-mono">
                    <Sub>{r.formula}</Sub>
                  </td>
                  <td className="py-2 text-stone-700 dark:text-stone-300">
                    <Sub>{k(`rs.u.${r.id}`)}</Sub>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section kicker="rs.s2.kicker" title="rs.s2.title">
        <div className="space-y-6">
          {QUESTIONS.map((q, n) => (
            <div key={q.id} data-testid={`rs-${q.id}`} className="break-inside-avoid">
              <h4 className="mb-2 text-lg font-semibold">
                {n + 1}. <Sub>{k(`rs.${q.id}.t`)}</Sub>
              </h4>
              <ul className="max-w-[66ch] list-disc space-y-1.5 pl-6 text-stone-700 dark:text-stone-300">
                {Array.from({ length: q.answers }, (_, i) => (
                  <li key={i}>
                    <Sub>{k(`rs.${q.id}.a${i + 1}`)}</Sub>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section kicker="rs.s3.kicker" title="rs.s3.title">
        <ul className="mb-4 max-w-[66ch] list-disc space-y-1.5 pl-6 text-stone-700 dark:text-stone-300">
          {["c1", "c2", "c3"].map((c) => (
            <li key={c}>
              <Sub>{k(`rs.s3.${c}`)}</Sub>
            </li>
          ))}
        </ul>
        <p className="max-w-[66ch] text-sm text-stone-600 dark:text-stone-400">
          <Sub>{t("rs.s3.note")}</Sub>
        </p>
      </Section>
    </GuidePage>
  );
}
