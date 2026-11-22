"use client";

import React from "react";
import { useLanguage, type TranslationKey } from "@/contexts/LanguageContext";
import { Sub } from "@/components/Sub";
import { Eq, GuidePage, Para, Section } from "@/components/guide/GuideBits";
import StressStateCalculator from "@/components/StressStateCalculator";

function Matrix({ rows }: { rows: string[][] }) {
  return (
    <div className="my-3 flex justify-center">
      <table data-testid="tensor-matrix" className="border-x-2 border-stone-700 px-2 font-mono text-[15px] dark:border-stone-300">
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j} className="px-3 py-0.5 text-center">
                  <Sub>{c}</Sub>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function EstadoDeTensionPage() {
  const { t } = useLanguage();
  return (
    <GuidePage title="tns.title" kicker="T · I_1 I_2 I_3 · σ_1 σ_2 σ_3" lead="tns.lead" footer="tns.footer">
      <Section kicker="tns.s1.kicker" title="tns.s1.title">
        <Para k="tns.s1.p1" />
        <Matrix
          rows={[
            ["σ_x", "τ_xy", "τ_xz"],
            ["τ_xy", "σ_y", "τ_yz"],
            ["τ_xz", "τ_yz", "σ_z"],
          ]}
        />
        <Para k="tns.s1.p2" />
        <Matrix
          rows={[
            ["−20", "10", "5"],
            ["10", "30", "0"],
            ["5", "0", "0"],
          ]}
        />
      </Section>

      <Section kicker="tns.s2.kicker" title="tns.s2.title">
        <Para k="tns.s2.p1" />
        <Eq>{t("tns.s2.e1")}</Eq>
        <Eq>{t("tns.s2.e2")}</Eq>
        <Eq>{t("tns.s2.e3")}</Eq>
        <Para k="tns.s2.p2" />
        <p data-testid="tns-invariants" className="mb-4 max-w-[66ch] rounded-md bg-stone-100 px-4 py-2 font-mono text-[14px] dark:bg-stone-900">
          <Sub>{t("tns.s2.p3")}</Sub>
        </p>
      </Section>

      <Section kicker="tns.s3.kicker" title="tns.s3.title">
        <Para k="tns.s3.p1" />
        <Eq boxed>{t("tns.s3.e1")}</Eq>
        <Eq>{t("tns.s3.e2")}</Eq>
        <Eq>{t("tns.s3.e3")}</Eq>
        <p data-testid="tns-plane" className="mb-4 max-w-[66ch] rounded-md bg-stone-100 px-4 py-2 font-mono text-[14px] dark:bg-stone-900">
          {t("tns.s3.p2")}
        </p>
      </Section>

      <Section kicker="tns.s4.kicker" title="tns.s4.title">
        <Para k="tns.s4.p1" />
        <Eq boxed>{t("tns.s4.e1")}</Eq>
        <Para k="tns.s4.p2" />
        <pre className="my-3 overflow-x-auto rounded-md bg-stone-100 px-4 py-2 font-mono text-[14px] dark:bg-stone-900">
          <Sub>{t("tns.s4.e2")}</Sub>
        </pre>
        <Para k="tns.s4.p3" />
        <p data-testid="tns-principal" className="mb-4 max-w-[66ch] rounded-md bg-stone-100 px-4 py-2 font-mono text-[14px] dark:bg-stone-900">
          <Sub>{t("tns.s4.p4")}</Sub>
        </p>
      </Section>

      <Section kicker="tns.s5.kicker" title="tns.s5.title">
        <div className="mb-4 overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="border-b border-stone-300 text-stone-500 dark:border-stone-700">
                <th className="py-2 pr-3 font-medium">{t("tns.s5.th.s")} / {t("tns.s5.th.sys")}</th>
                <th className="py-2 font-medium">{t("tns.s5.th.n")}</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {(["1", "2", "3"] as const).map((k) => (
                <tr key={k} data-testid={`tns-dir-${k}`} className="border-b border-stone-200 align-top dark:border-stone-800">
                  <td className="py-2 pr-3"><Sub>{t(`tns.s5.r${k}` as TranslationKey)}</Sub></td>
                  <td className="py-2 whitespace-nowrap">{t(`tns.s5.n${k}` as TranslationKey)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Para k="tns.s5.p1" />
        <StressStateCalculator />
      </Section>
    </GuidePage>
  );
}
