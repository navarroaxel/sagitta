"use client";

import React, { useState } from "react";
import { useLanguage, type TranslationKey } from "@/contexts/LanguageContext";
import { DEFLECTION_CASES, maxDeflection, type DeflectionCaseId } from "@/lib/deflection";
import { Sub } from "@/components/Sub";

const num = (v: string) => (v.trim() === "" ? NaN : Number(v.replace(",", ".")));

export default function DeflectionCalculator() {
  const { t } = useLanguage();
  const [id, setId] = useState<DeflectionCaseId>("ss-udl");
  const [w, setW] = useState("10");
  const [l, setL] = useState("400");
  const [E, setE] = useState("2100000");
  const [J, setJ] = useState("8000");
  const c = DEFLECTION_CASES.find((d) => d.id === id)!;
  const f = maxDeflection(id, num(w), num(l), num(E), num(J));
  const ok =
    [num(w), num(l), num(E), num(J), f].every(Number.isFinite) && num(l) > 0 && num(E) > 0 && num(J) > 0;

  const field = (label: string, value: string, set: (v: string) => void) => (
    <label className="flex flex-col gap-1 text-sm text-stone-600 dark:text-stone-400">
      <Sub>{label}</Sub>
      <input
        aria-label={label.replace(/_/g, "")}
        inputMode="decimal"
        value={value}
        onChange={(e) => set(e.target.value)}
        className="rounded border border-stone-300 bg-white px-2 py-1 font-mono text-stone-900 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
      />
    </label>
  );

  return (
    <div data-testid="deflection-calc" className="my-4 rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
      <p className="mb-3 font-semibold">{t("fla.calc.title")}</p>
      <label className="mb-3 flex flex-col gap-1 text-sm text-stone-600 dark:text-stone-400">
        {t("fla.calc.case")}
        <select
          aria-label={t("fla.calc.case")}
          value={id}
          onChange={(e) => setId(e.target.value as DeflectionCaseId)}
          className="rounded border border-stone-300 bg-white px-2 py-1 text-stone-900 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
        >
          {DEFLECTION_CASES.map((d, i) => (
            <option key={d.id} value={d.id}>
              {i + 1}) {t(`fla.case.${d.id}` as TranslationKey)}
            </option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {field(c.load === "point" ? t("fla.calc.load.point") : t("fla.calc.load.dist"), w, setW)}
        {field(t("fla.calc.l"), l, setL)}
        {field(t("fla.calc.E"), E, setE)}
        {field(t("fla.calc.J"), J, setJ)}
      </div>
      <p className="mt-3 font-mono text-lg" data-testid="deflection-result">
        <Sub>{t("fla.calc.result")}</Sub> = {ok ? `${f.toFixed(3)} cm` : "—"}
        {ok && f > 0 && (
          <span className="ml-3 text-sm text-stone-500">
            {t("fla.calc.ratio")}
            {Math.round(num(l) / f)}
          </span>
        )}
      </p>
    </div>
  );
}
