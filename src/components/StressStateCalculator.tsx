"use client";

import React, { useState } from "react";
import { useLanguage, type TranslationKey } from "@/contexts/LanguageContext";
import {
  classify,
  invariants,
  eigenspaceSize,
  principalDirection,
  principalStresses,
  stressOnPlane,
  tensor,
  type Vec3,
} from "@/lib/stressState";
import { Sub } from "@/components/Sub";

const num = (v: string) => (v.trim() === "" ? NaN : Number(v.replace(",", ".")));
const f4 = (v: number) => (Math.abs(v) < 5e-5 ? "0" : v.toFixed(4).replace(/\.?0+$/, ""));
const vec = (v: Vec3) => `(${v.map(f4).join(" ; ")})`;

const FIELDS = [
  ["σ_x", "-20"],
  ["σ_y", "30"],
  ["σ_z", "0"],
  ["τ_xy", "10"],
  ["τ_yz", "0"],
  ["τ_xz", "5"],
] as const;

// Tensor (six independent components) → invariants, class, stress on a plane, principal stresses and directions.
export default function StressStateCalculator() {
  const { t } = useLanguage();
  const [vals, setVals] = useState<string[]>(FIELDS.map((f) => f[1]));
  const [nv, setNv] = useState<string[]>(["0.5", "0.5", "0.7071"]);
  const v = vals.map(num);
  const n = nv.map(num);
  const ok = v.every(Number.isFinite);
  const okN = n.every(Number.isFinite) && Math.hypot(...n) > 0;
  const T = ok ? tensor(v[0], v[1], v[2], v[3], v[4], v[5]) : null;
  const inv = T ? invariants(T) : null;
  const kind = T ? classify(T) : null;
  const plane = T && okN ? stressOnPlane(T, n as Vec3) : null;
  const pr = T ? principalStresses(T) : null;

  const input = (label: string, value: string, set: (x: string) => void, aria: string) => (
    <label className="flex flex-col gap-1 text-sm text-stone-600 dark:text-stone-400">
      <Sub>{label}</Sub>
      <input
        aria-label={aria}
        inputMode="decimal"
        value={value}
        onChange={(e) => set(e.target.value)}
        className="rounded border border-stone-300 bg-white px-2 py-1 font-mono text-stone-900 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
      />
    </label>
  );

  return (
    <div data-testid="stress-calc" className="my-4 rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
      <p className="mb-3 font-semibold">{t("tns.calc.title")}</p>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {FIELDS.map(([name], i) =>
          input(name, vals[i], (x) => setVals((p) => p.map((q, k) => (k === i ? x : q))), name.replace(/_/g, "")),
        )}
      </div>
      <p className="mb-1 mt-3 text-sm text-stone-600 dark:text-stone-400">{t("tns.calc.n")}</p>
      <div className="grid grid-cols-3 gap-3 sm:max-w-xs">
        {["l", "m", "n"].map((name, i) =>
          input(name, nv[i], (x) => setNv((p) => p.map((q, k) => (k === i ? x : q))), `normal ${name}`),
        )}
      </div>

      <div className="mt-4 grid gap-3 font-mono text-[14px]" data-testid="stress-result">
        <div>
          <p className="font-sans text-xs font-semibold text-stone-500">{t("tns.calc.inv")}</p>
          <p data-testid="stress-inv">
            {inv ? <Sub>{`I_1 = ${f4(inv.I1)}   I_2 = ${f4(inv.I2)}   I_3 = ${f4(inv.I3)}`}</Sub> : "—"}
          </p>
          <p className="font-sans text-xs text-stone-500">
            {t("tns.calc.kind")}: {kind ? t(`tns.calc.${kind}` as TranslationKey) : "—"}
          </p>
        </div>
        <div>
          <p className="font-sans text-xs font-semibold text-stone-500">{t("tns.calc.plane")}</p>
          {plane ? (
            <ul data-testid="stress-plane">
              <li>{t("tns.calc.rho")} = {vec(plane.rho)}  |{t("tns.calc.rho")}| = {f4(plane.rhoMag)}</li>
              <li>{t("tns.calc.sigma")} = {vec(plane.sigma)}  |σ| = {f4(Math.abs(plane.sigmaN))}</li>
              <li>{t("tns.calc.tau")} = {vec(plane.tau)}  |τ| = {f4(plane.tauMag)}</li>
            </ul>
          ) : (
            <p>—</p>
          )}
        </div>
        <div>
          <p className="font-sans text-xs font-semibold text-stone-500">{t("tns.calc.princ")}</p>
          {pr && T ? (
            <ul data-testid="stress-principal">
              {pr.map((s, i) => {
                const d = principalDirection(T, s);
                return (
                  <li key={i}>
                    <Sub>{`σ_${i + 1} = ${f4(s)}`}</Sub>  n = {d ? vec(d) : eigenspaceSize(T, s) >= 3 ? t("tns.calc.any") : t("tns.calc.eigen")}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>—</p>
          )}
        </div>
      </div>
    </div>
  );
}
