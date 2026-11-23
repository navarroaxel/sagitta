"use client";

import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { criticalLoad, criticalStress, equilibriumState, radiusOfGyration, slenderness } from "@/lib/buckling";
import { Sub } from "@/components/Sub";

const num = (v: string) => (v.trim() === "" ? NaN : Number(v.replace(",", ".")));
const fmt = (v: number, d = 0) =>
  v.toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d }).replace(/,/g, " ");

// Euler's critical load of one bar, with the equilibrium state under an applied load F.
export default function PandeoCalculator() {
  const { t } = useLanguage();
  const [E, setE] = useState("2100000");
  const [J, setJ] = useState("6750");
  const [A, setA] = useState("360");
  const [l, setL] = useState("800");
  const [c, setC] = useState("1");
  const [F, setF] = useState("350000");

  const e = num(E), j = num(J), a = num(A), len = num(l), cc = num(c), f = num(F);
  const ok = [e, j, a, len, cc].every((v) => Number.isFinite(v) && v > 0);
  const Fk = ok ? criticalLoad(e, j, cc, len) : NaN;
  const lam = ok ? slenderness(cc, len, radiusOfGyration(j, a)) : NaN;
  const sk = ok ? criticalStress(e, lam) : NaN;
  const state = ok && Number.isFinite(f) && f > 0 ? equilibriumState(f, Fk, 1e-6) : null;

  const field = (label: string, value: string, set: (v: string) => void) => (
    <label className="flex flex-col gap-1 text-sm text-stone-600 dark:text-stone-400">
      <Sub>{label}</Sub>
      <input
        aria-label={label.replace(/_/g, "")}
        inputMode="decimal"
        value={value}
        onChange={(ev) => set(ev.target.value)}
        className="rounded border border-stone-300 bg-white px-2 py-1 font-mono text-stone-900 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
      />
    </label>
  );

  return (
    <div data-testid="pandeo-calc" className="my-4 rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
      <p className="mb-3 font-semibold">{t("pnd.calc.title")}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {field(t("pnd.calc.E"), E, setE)}
        {field(t("pnd.calc.J"), J, setJ)}
        {field(t("pnd.calc.A"), A, setA)}
        {field(t("pnd.calc.l"), l, setL)}
        {field(t("pnd.calc.c"), c, setC)}
        {field(t("pnd.calc.F"), F, setF)}
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[15px] sm:grid-cols-4" data-testid="pandeo-result" aria-live="polite">
        <div>
          <dt className="text-xs text-stone-500"><Sub>{t("pnd.calc.Fk")}</Sub></dt>
          <dd>{ok ? `${fmt(Fk)} kg` : "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-500">{t("pnd.calc.lambda")}</dt>
          <dd>{ok ? fmt(lam, 1) : "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-500"><Sub>{t("pnd.calc.sk")}</Sub></dt>
          <dd>{ok ? `${fmt(sk, 0)} kg/cm²` : "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-500">{t("pnd.calc.state")}</dt>
          <dd
            data-testid="pandeo-state"
            className={state === "unstable" ? "font-semibold text-red-700 dark:text-red-400" : state === "stable" ? "font-semibold text-teal-700 dark:text-teal-400" : "font-semibold text-amber-700"}
          >
            {state ? t(`pnd.calc.${state}` as "pnd.calc.stable") : "—"}
          </dd>
        </div>
      </dl>
      <p className="mt-2 text-[13px] text-stone-500 dark:text-stone-400"><Sub>{t("pnd.calc.hint")}</Sub></p>
    </div>
  );
}
