"use client";

import React from "react";
import { FrameModel } from "@/lib/types";
import { SolveOutput } from "@/lib/solve";
import { Station } from "@/lib/sampling";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  model: FrameModel;
  solved: SolveOutput | null;
}

const TOL = 1e-2; // below this a force/moment value is treated as zero
const EQ_TOL = 1e-3; // equilibrium residual tolerance for the ✓/✗ indicator

function Th({
  children,
  right,
  title,
}: {
  children: React.ReactNode;
  right?: boolean;
  title?: string;
}) {
  return (
    <th
      title={title}
      className={`bg-stone-50 px-2 py-1 text-xs font-semibold text-stone-500 dark:bg-stone-800 dark:text-stone-400 ${
        right ? "text-right" : "text-left"
      } ${title ? "cursor-help" : ""}`}
    >
      {children}
    </th>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-2 pt-3 pb-1 text-xs font-semibold text-stone-500 dark:text-stone-400">
      {children}
    </p>
  );
}

const numCell =
  "px-2 py-1 text-right font-mono tabular-nums text-stone-800 dark:text-stone-200";
const idCell = "px-2 py-1 font-mono text-stone-700 dark:text-stone-300";
const rowCls = "border-t border-stone-100 dark:border-stone-700";

// Station maximising |key| along a member (signed value preserved).
function peak(stations: Station[], key: "Q" | "M"): Station | null {
  if (!stations.length) return null;
  return stations.reduce((best, s) =>
    Math.abs(s[key]) > Math.abs(best[key]) ? s : best,
  );
}

function clean(v: number): number {
  return Math.abs(v) < TOL ? 0 : v;
}

export default function ResultsPanel({ model, solved }: Props) {
  const { t } = useLanguage();

  if (!solved || !solved.result.stable) {
    return (
      <p className="px-1 py-2 text-xs text-stone-400 dark:text-stone-500">
        {t("forces.unavailable")}
      </p>
    );
  }

  const { result, stations, nodeIndex, memberIndex } = solved;
  const u = model.unit;

  // ── Section A: member forces (N axial + peak Q + peak M) ──────────────────
  const memberRows = model.members.map((m) => {
    const e = memberIndex.get(m.id)!;
    const rawN = -result.memForces[e][0];
    const N = clean(rawN);
    const color =
      N > 0
        ? "text-teal-600 dark:text-teal-400"
        : N < 0
          ? "text-red-600 dark:text-red-400"
          : "text-stone-400 dark:text-stone-500";
    const badge =
      N > 0
        ? "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300"
        : N < 0
          ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
          : "bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400";
    const stateKey =
      N > 0
        ? "forces.tension"
        : N < 0
          ? "forces.compression"
          : "forces.zero";
    const stateShort = N > 0 ? "T" : N < 0 ? "C" : "0";
    const qPeak = peak(stations[e], "Q");
    const mPeak = peak(stations[e], "M");
    return {
      id: m.id,
      N,
      color,
      badge,
      state: t(stateKey),
      stateShort,
      Q: clean(qPeak ? qPeak.Q : 0),
      Qx: qPeak ? qPeak.x : null,
      M: clean(mPeak ? mPeak.M : 0),
      Mx: mPeak ? mPeak.x : null,
    };
  });

  // ── Section B: support reactions ──────────────────────────────────────────
  const reactionRows = model.nodes
    .filter((n) => n.support !== "free")
    .map((n) => {
      const i = nodeIndex.get(n.id)!;
      const r = result.reactions[i];
      return {
        id: n.id,
        rx: clean(r.rx),
        ry: clean(r.ry),
        rm: clean(r.rm),
      };
    });

  // ── Section C: nodal displacements ────────────────────────────────────────
  const dispRows = model.nodes.map((n) => {
    const i = nodeIndex.get(n.id)!;
    return {
      id: n.id,
      ux: result.U[3 * i] * 1000, // m → mm
      uy: result.U[3 * i + 1] * 1000,
      theta: result.U[3 * i + 2],
    };
  });

  // ── Section D: global equilibrium (applied loads + reactions ≈ 0) ──────────
  const nodeById = new Map(model.nodes.map((n) => [n.id, n]));
  let sFx = 0;
  let sFy = 0;
  let sM = 0;
  const addForce = (px: number, py: number, fx: number, fy: number, m = 0) => {
    sFx += fx;
    sFy += fy;
    sM += px * fy - py * fx + m;
  };
  for (const load of model.loads) {
    if (load.type === "nodal") {
      const n = nodeById.get(load.node);
      if (n) addForce(n.x, n.y, load.fx, load.fy, load.m);
    } else {
      const e = memberIndex.get(load.member);
      const mem = model.members.find((mm) => mm.id === load.member);
      if (e === undefined || !mem) continue;
      const ni = nodeById.get(mem.n1);
      if (!ni) continue;
      const { L, c, s } = result.geo[e];
      if (load.type === "mpoint") {
        addForce(ni.x + load.dist * c, ni.y + load.dist * s, load.gx, load.gy);
      } else {
        // mudl: total resultant gx·L, gy·L acting at the member midpoint
        addForce(ni.x + (L / 2) * c, ni.y + (L / 2) * s, load.gx * L, load.gy * L);
      }
    }
  }
  for (const n of model.nodes) {
    if (n.support === "free") continue;
    const r = result.reactions[nodeIndex.get(n.id)!];
    addForce(n.x, n.y, r.rx, r.ry, r.rm);
  }
  const eqRows: { label: string; value: number }[] = [
    { label: t("results.eq_fx"), value: sFx },
    { label: t("results.eq_fy"), value: sFy },
    { label: t("results.eq_m"), value: sM },
  ];

  return (
    <div className="space-y-2">
      {/* Section A — Member forces */}
      <section>
        <SectionTitle>{t("results.section.member_forces")}</SectionTitle>
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <Th>{t("forces.member")}</Th>
              <Th right>N ({u})</Th>
              <Th right>{t("forces.state")}</Th>
              <Th right>
                {t("results.column.q")} ({u})
              </Th>
              <Th right>
                {t("results.column.m")} ({u}·m)
              </Th>
            </tr>
          </thead>
          <tbody>
            {memberRows.map((r) => (
              <tr key={r.id} className={rowCls}>
                <td className={idCell}>{r.id}</td>
                <td className={`${numCell} font-medium ${r.color}`}>
                  {r.N.toFixed(2)}
                </td>
                <td className="px-2 py-1 text-right">
                  <span
                    title={r.state}
                    className={`inline-block w-5 cursor-help rounded py-0.5 text-center text-[10px] font-bold ${r.badge}`}
                  >
                    {r.stateShort}
                  </span>
                </td>
                <td
                  className={`${numCell} cursor-help`}
                  title={
                    r.Qx === null
                      ? undefined
                      : `${t("results.peak_at")} ${r.Qx.toFixed(2)} m`
                  }
                >
                  {r.Q.toFixed(2)}
                </td>
                <td
                  className={`${numCell} cursor-help`}
                  title={
                    r.Mx === null
                      ? undefined
                      : `${t("results.peak_at")} ${r.Mx.toFixed(2)} m`
                  }
                >
                  {r.M.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Section B — Support reactions */}
      <section>
        <SectionTitle>{t("results.section.reactions")}</SectionTitle>
        {reactionRows.length === 0 ? (
          <p className="px-2 py-1 text-xs text-stone-400 dark:text-stone-500">
            —
          </p>
        ) : (
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                <Th>{t("results.node")}</Th>
                <Th right>
                  {t("results.rx")} ({u})
                </Th>
                <Th right>
                  {t("results.ry")} ({u})
                </Th>
                <Th right>
                  {t("results.m")} ({u}·m)
                </Th>
              </tr>
            </thead>
            <tbody>
              {reactionRows.map((r) => (
                <tr key={r.id} className={rowCls}>
                  <td className={idCell}>{r.id}</td>
                  <td className={numCell}>{r.rx.toFixed(2)}</td>
                  <td className={numCell}>{r.ry.toFixed(2)}</td>
                  <td className={numCell}>{r.rm.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Section C — Nodal displacements */}
      <section>
        <SectionTitle>{t("results.section.displacements")}</SectionTitle>
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <Th title={t("results.tip.node")}>{t("results.node")}</Th>
              <Th right title={t("results.tip.ux")}>
                {t("results.ux")}
              </Th>
              <Th right title={t("results.tip.uy")}>
                {t("results.uy")}
              </Th>
              <Th right title={t("results.tip.theta")}>
                {t("results.theta")}
              </Th>
            </tr>
          </thead>
          <tbody>
            {dispRows.map((r) => (
              <tr key={r.id} className={rowCls}>
                <td className={idCell}>{r.id}</td>
                <td className={numCell}>{r.ux.toFixed(3)}</td>
                <td className={numCell}>{r.uy.toFixed(3)}</td>
                <td className={numCell}>{r.theta.toExponential(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Section D — Equilibrium check */}
      <section>
        <SectionTitle>{t("results.section.equilibrium")}</SectionTitle>
        <table className="w-full border-collapse text-xs">
          <tbody>
            {eqRows.map((r) => {
              const ok = Math.abs(r.value) < EQ_TOL;
              return (
                <tr key={r.label} className={rowCls}>
                  <td className={idCell}>{r.label}</td>
                  <td className={numCell}>{clean(r.value).toFixed(2)}</td>
                  <td
                    className={`px-2 py-1 text-right font-medium ${
                      ok
                        ? "text-teal-600 dark:text-teal-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {ok ? t("results.eq_ok") : t("results.eq_fail")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
