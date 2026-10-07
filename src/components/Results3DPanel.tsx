"use client";

import React from "react";
import { FrameModel3D } from "@/lib/types3d";
import { SolveOutput3D } from "@/lib/solve3d";
import { DIAGRAMS_3D, equilibrium3D, peak3D } from "@/lib/results3d";
import { clean } from "@/lib/results";
import { StressResult, ratioColor } from "@/lib/stress3d";
import { useLanguage } from "@/contexts/LanguageContext";

const EQ_TOL = 1e-3;
const th = "px-2 py-1 text-left text-xs font-semibold text-stone-500 dark:text-stone-400";
const td = "px-2 py-1 font-mono text-xs";

export default function Results3DPanel({
  model,
  solved,
  stress = null,
}: {
  model: FrameModel3D;
  solved: SolveOutput3D | null;
  stress?: StressResult | null;
}) {
  const { t } = useLanguage();
  if (!solved || !solved.result.stable)
    return (
      <p className="p-3 text-sm text-stone-500 dark:text-stone-400">
        {t("results.unavailable")}
      </p>
    );
  const eq = equilibrium3D(model, solved);
  const ok = (v: number[]) => v.every((x) => Math.abs(x) < EQ_TOL);
  const fmt = (v: number) => clean(v).toFixed(2);
  const supports = model.nodes
    .map((n, i) => ({ n, r: solved.result.reactions[i] }))
    .filter(({ n }) => n.support !== "free");

  return (
    <div className="space-y-4 p-3" data-testid="results3d">
      <section>
        <h3 className="mb-1 text-xs font-bold tracking-wide text-stone-600 uppercase dark:text-stone-300">
          {t("results.section.reactions")}
        </h3>
        <table className="w-full">
          <thead>
            <tr>
              <th className={th}>{t("results.node")}</th>
              {["Fx", "Fy", "Fz", "Mx", "My", "Mz"].map((h) => (
                <th key={h} className={th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {supports.map(({ n, r }) => (
              <tr key={n.id}>
                <td className={td}>{n.id}</td>
                {[r.fx, r.fy, r.fz, r.mx, r.my, r.mz].map((v, k) => (
                  <td key={k} className={td}>
                    {fmt(v)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h3 className="mb-1 text-xs font-bold tracking-wide text-stone-600 uppercase dark:text-stone-300">
          {t("f3d.results.peaks")}
        </h3>
        <table className="w-full">
          <thead>
            <tr>
              <th className={th}>{t("editor.members.id")}</th>
              {DIAGRAMS_3D.map((d) => (
                <th key={d} className={th}>
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {model.members.map((m, e) => (
              <tr key={m.id}>
                <td className={td}>{m.id}</td>
                {DIAGRAMS_3D.map((d) => (
                  <td key={d} className={td}>
                    {fmt(peak3D(solved.stations[e], d)![d])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section data-testid="stress-section">
        <h3 className="mb-1 text-xs font-bold tracking-wide text-stone-600 uppercase dark:text-stone-300">
          {t("f3d.results.stress")}
        </h3>
        {stress && stress.some(Boolean) ? (
          <table className="w-full">
            <thead>
              <tr>
                <th className={th}>{t("editor.members.id")}</th>
                <th className={th}>{t("f3d.results.profile")}</th>
                <th className={th}>{t("f3d.results.sigma_max")}</th>
                <th className={th}>{t("f3d.results.ratio")}</th>
                <th className={th} />
              </tr>
            </thead>
            <tbody>
              {model.members.map((m, e) => {
                const r = stress[e];
                return (
                  <tr key={m.id} data-testid={`stress-row-${m.id}`}>
                    <td className={td}>{m.id}</td>
                    <td className={td}>{r ? r.profile : "—"}</td>
                    <td className={td}>{r ? r.max.sigma.toFixed(2) : "—"}</td>
                    <td className={td} style={r ? { color: ratioColor(r.ratio) } : undefined}>
                      {r ? r.ratio.toFixed(2) : "—"}
                    </td>
                    <td className={td}>{r ? (r.ok ? "✓" : "✗") : ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="text-xs text-stone-500 dark:text-stone-400">{t("f3d.results.no_profile")}</p>
        )}
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
          σ adm = {model.sigmaAdm} kN/cm². {t("f3d.results.stress_note")}
        </p>
      </section>

      <section>
        <h3 className="mb-1 text-xs font-bold tracking-wide text-stone-600 uppercase dark:text-stone-300">
          {t("results.section.equilibrium")}
        </h3>
        <p className={td}>
          ΣF {ok(eq.f) ? t("results.eq_ok") : t("results.eq_fail")} · ΣM{" "}
          {ok(eq.m) ? t("results.eq_ok") : t("results.eq_fail")}
        </p>
      </section>
    </div>
  );
}
