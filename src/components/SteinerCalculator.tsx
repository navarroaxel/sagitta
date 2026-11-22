"use client";

import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { rectJ, steiner } from "@/lib/planeSections";
import { Sub } from "@/components/Sub";

const num = (v: string) => (v.trim() === "" ? NaN : Number(v.replace(",", ".")));
const fmt = (v: number) => v.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 }).replace(/,/g, " ");

// Steiner for a rectangle: J about an axis parallel to the centroidal one at distance d.
export default function SteinerCalculator() {
  const { t } = useLanguage();
  const [b, setB] = useState("8");
  const [h, setH] = useState("16");
  const [d, setD] = useState("8");
  const B = num(b);
  const H = num(h);
  const D = num(d);
  const ok = [B, H, D].every(Number.isFinite) && B > 0 && H > 0;
  const A = B * H;
  const Jg = rectJ(B, H);
  const J = steiner(Jg, A, D);

  const field = (label: string, value: string, set: (v: string) => void) => (
    <label className="flex flex-col gap-1 text-sm text-stone-600 dark:text-stone-400">
      {label}
      <input
        aria-label={label}
        inputMode="decimal"
        value={value}
        onChange={(e) => set(e.target.value)}
        className="rounded border border-stone-300 bg-white px-2 py-1 font-mono text-stone-900 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
      />
    </label>
  );

  return (
    <div data-testid="steiner-calc" className="my-4 rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
      <p className="mb-3 font-semibold">{t("pln.s5.calc.title")}</p>
      <div className="grid grid-cols-3 gap-3">
        {field(t("pln.s5.calc.b"), b, setB)}
        {field(t("pln.s5.calc.h"), h, setH)}
        {field(t("pln.s5.calc.d"), d, setD)}
      </div>
      <p className="mt-2 text-[13px] text-stone-500 dark:text-stone-400">
        <Sub>{t("pln.s5.calc.hint")}</Sub>
      </p>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[15px] sm:grid-cols-4" data-testid="steiner-result">
        {[
          ["pln.s5.calc.jg", `${ok ? fmt(Jg) : "—"} cm⁴`],
          ["pln.s5.calc.area", `${ok ? fmt(A) : "—"} cm²`],
          ["pln.s5.calc.ad2", `${ok ? fmt(A * D * D) : "—"} cm⁴`],
          ["pln.s5.calc.j", `${ok ? fmt(J) : "—"} cm⁴`],
        ].map(([k, v]) => (
          <div key={k}>
            <dt className="text-xs text-stone-500">
              <Sub>{t(k as "pln.s5.calc.jg")}</Sub>
            </dt>
            <dd className={k === "pln.s5.calc.j" ? "font-semibold text-teal-700 dark:text-teal-400" : ""}>{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
