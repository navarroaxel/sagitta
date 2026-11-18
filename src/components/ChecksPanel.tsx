"use client";

import React from "react";
import { FrameModel } from "@/lib/types";
import { SolveOutput } from "@/lib/solve";
import { runChecks } from "@/lib/checks";
import { useLanguage } from "@/contexts/LanguageContext";

// Verification and sizing of the members that carry a `section` (src/lib/checks.ts). Rendered at the
// top of the results tab; nothing is shown when no member has a section.
const th =
  "bg-stone-50 px-2 py-1 text-xs font-semibold text-stone-500 dark:bg-stone-800 dark:text-stone-400";
const num =
  "px-2 py-1 text-right font-mono tabular-nums text-stone-800 dark:text-stone-200";
const id = "px-2 py-1 font-mono text-stone-700 dark:text-stone-300";
const row = "border-t border-stone-100 dark:border-stone-700";
const good = "text-teal-600 dark:text-teal-400";
const bad = "text-red-600 dark:text-red-400";

// `|| 0`: never "-0"; no-break space as thousands separator: a number never wraps in the narrow panel.
const n0 = (v: number) =>
  (Math.round(v) || 0).toLocaleString("en-US").replace(/,/g, "\u00a0");
const n1 = (v: number) => (Math.round(v * 10) / 10).toFixed(1);
const n2 = (v: number) => (Math.round(v * 100) / 100).toFixed(2);

function Title({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-2 pt-3 pb-1 text-xs font-semibold text-stone-500 dark:text-stone-400">
      {children}
    </p>
  );
}

export default function ChecksPanel({
  model,
  solved,
}: {
  model: FrameModel;
  solved: SolveOutput;
}) {
  const { t } = useLanguage();
  const withSection = model.members.some((m) => m.section);
  if (!withSection) return null;

  const sigmaAdm = model.sigmaAdm;
  if (!sigmaAdm || !(sigmaAdm > 0)) {
    return (
      <section>
        <Title>{t("checks.title")}</Title>
        <p className="px-2 text-xs text-stone-400 dark:text-stone-500">
          {t("checks.no_sigma")}
        </p>
      </section>
    );
  }

  const checks = runChecks(model, solved);
  const verify = checks.filter((c) => c.kind === "verify");
  const size = checks.filter((c) => c.kind === "size");
  const cable = checks.filter((c) => c.kind === "cable");
  const u = model.unit;
  const compressed =
    verify.some((c) => c.demand.compressed) || size.some((c) => c.compressed);

  return (
    <section aria-label={t("checks.title")} className="space-y-1">
      <Title>
        {t("checks.title")} · σ<sub>adm</sub> = {n0(sigmaAdm)} {u}/cm²
      </Title>

      {solved.selfWeight.length > 0 && (
        <p className="px-2 text-[11px] text-stone-500 dark:text-stone-400">
          {t("checks.self_weight")}:{" "}
          {solved.selfWeight
            .map(
              (w) =>
                `${w.member} ${w.profile} ${n1(w.w)} ${u}/m = ${n0(w.total)} ${u}`,
            )
            .join(" · ")}
        </p>
      )}

      {verify.length > 0 && (
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className={`${th} text-left`}>{t("checks.member")}</th>
              <th className={`${th} text-left`}>{t("checks.profile")}</th>
              <th className={`${th} text-right`}>
                σ<sub>max</sub> ({u}/cm²)
              </th>
              <th className={`${th} text-right`}>
                σ / σ<sub>adm</sub>
              </th>
              <th className={`${th} text-right`}>{t("checks.result")}</th>
            </tr>
          </thead>
          <tbody>
            {verify.map((c) => (
              <React.Fragment key={c.member}>
                <tr className={row}>
                  <td className={id}>{c.member}</td>
                  <td className={id}>{c.profile.name}</td>
                  <td className={num}>{n0(c.sigma)}</td>
                  <td className={`${num} whitespace-nowrap`}>
                    {n0(c.ratio * 100)} %
                  </td>
                  <td
                    className={`px-2 py-1 text-right font-medium ${c.ok ? good : bad}`}
                  >
                    {c.ok ? t("checks.pass") : t("checks.fail")}
                  </td>
                </tr>
                <tr>
                  <td
                    colSpan={5}
                    className="px-2 pb-1 text-[11px] text-stone-500 dark:text-stone-400"
                  >
                    M = {n0(c.demand.M)} {u}·m, N = {n0(c.demand.N)} {u}
                    {c.buckling &&
                      ` · P = ${n0(c.buckling.P)} ${c.buckling.ok ? "≤" : ">"} P_cr = ${n0(c.buckling.pcr)} ${u}`}
                    {c.deflection &&
                      ` · ${t("checks.deflection")} = ${n1(c.deflection.f)} cm (x = ${n2(c.deflection.x)} m, L/f = ${n0(
                        (c.deflection.L * 100) / c.deflection.f,
                      )})`}
                    {c.ok
                      ? ""
                      : ` · ${t("checks.lightest")} ${c.profile.series}: ${
                          c.suggestion
                            ? `${c.suggestion.profile.name} (σ = ${n0(c.suggestion.sigma)})`
                            : t("checks.none")
                        }`}
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}

      {size.length > 0 && (
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className={`${th} text-left`}>{t("checks.member")}</th>
              <th className={`${th} text-right`}>N ({u})</th>
              <th className={`${th} text-right`}>M ({u}·m)</th>
              <th className={`${th} text-left`}>{t("checks.lightest")}</th>
            </tr>
          </thead>
          <tbody>
            {size.map((c) => (
              <tr key={c.member} className={row}>
                <td className={id}>{c.member}</td>
                <td className={num}>{n0(c.demand.N)}</td>
                <td className={num}>{n0(c.demand.M)}</td>
                <td className="px-2 py-1 font-mono text-stone-800 dark:text-stone-200">
                  {c.unloaded
                    ? t("checks.unloaded")
                    : c.results.map((r) => (
                        <div key={r.series}>
                          {r.pick ? (
                            <>
                              {r.pick.profile.name}{" "}
                              <span className="text-stone-500 dark:text-stone-400">
                                (σ = {n0(r.pick.sigma)}
                                {r.pick.pcr !== undefined &&
                                  `, P_cr = ${n0(r.pick.pcr)}`}
                                , {n1(r.pick.profile.w)} kg/m)
                              </span>
                            </>
                          ) : (
                            <span className={bad}>
                              {r.series}: {t("checks.none")}
                            </span>
                          )}
                        </div>
                      ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {cable.length > 0 && (
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className={`${th} text-left`}>{t("checks.cable")}</th>
              <th className={`${th} text-right`}>N ({u})</th>
              <th className={`${th} text-right`}>
                l<sub>0</sub> (m)
              </th>
              <th className={`${th} text-right`}>
                A<sub>nec</sub> (cm²)
              </th>
              <th className={`${th} text-right`} title={t("checks.d_min_long")}>
                Ø<sub>nec</sub> (cm)
              </th>
              <th className={`${th} text-right`}>ΔL (cm)</th>
            </tr>
          </thead>
          <tbody>
            {cable.map((c) => (
              <React.Fragment key={c.member}>
                <tr className={row}>
                  <td className={id}>{c.member}</td>
                  <td className={num}>{n0(c.N)}</td>
                  <td className={num}>{n2(c.L)}</td>
                  <td className={num}>{n2(c.areaReq)}</td>
                  <td className={num}>{n2(c.dReq)}</td>
                  <td className={num}>{n2(c.elongation)}</td>
                </tr>
                <tr>
                  <td
                    colSpan={6}
                    className="px-2 pb-1 text-[11px] font-medium text-stone-700 dark:text-stone-300"
                  >
                    Ø<sub>nec</sub> = {n2(c.dReq)} cm = {n1(c.dReq * 10)} mm ·{" "}
                    {t("checks.d_adopted")} ≥ {n1(c.dAdopted)} cm
                  </td>
                </tr>
                {!c.tension && (
                  <tr>
                    <td colSpan={6} className={`px-2 pb-1 text-[11px] ${bad}`}>
                      {t("checks.not_tension")}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}

      {compressed && (
        <p className="px-2 text-[11px] text-stone-400 italic dark:text-stone-500">
          {t("checks.note_buckling")}
        </p>
      )}
    </section>
  );
}
