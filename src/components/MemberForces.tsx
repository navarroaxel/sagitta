"use client";

import React from "react";
import { FrameModel } from "@/lib/types";
import { SolveOutput } from "@/lib/solve";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  model: FrameModel;
  solved: SolveOutput | null;
}

const TOL = 1e-2; // kN — below this the axial force is treated as zero

function Th({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: boolean;
}) {
  return (
    <th
      className={`bg-stone-50 px-2 py-1 text-xs font-semibold text-stone-500 dark:bg-stone-800 dark:text-stone-400 ${
        right ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

// Axial force per member: N = -memForces[e][0] (tension positive, matching
// sampling.ts / the N diagram convention). Constant for two-force members.
export default function MemberForces({ model, solved }: Props) {
  const { t } = useLanguage();

  if (!solved || !solved.result.stable) {
    return (
      <p className="px-1 py-2 text-xs text-stone-400 dark:text-stone-500">
        {t("forces.unavailable")}
      </p>
    );
  }

  const rows = model.members.map((m) => {
    const e = solved.memberIndex.get(m.id)!;
    const raw = -solved.result.memForces[e][0];
    const N = Math.abs(raw) < TOL ? 0 : raw;
    const stateKey =
      N > 0 ? "forces.tension" : N < 0 ? "forces.compression" : "forces.zero";
    const color =
      N > 0
        ? "text-teal-600 dark:text-teal-400"
        : N < 0
          ? "text-red-600 dark:text-red-400"
          : "text-stone-400 dark:text-stone-500";
    return { id: m.id, N, state: t(stateKey as never), color };
  });

  return (
    <>
    <p className="px-2 pt-2 pb-1 text-xs font-semibold text-stone-500 dark:text-stone-400">
      {t("forces.title")}
    </p>
    <table className="w-full border-collapse text-xs">
      <thead>
        <tr>
          <Th>{t("forces.member")}</Th>
          <Th right>N ({model.unit})</Th>
          <Th right>{t("forces.state")}</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr
            key={r.id}
            className="border-t border-stone-100 dark:border-stone-700"
          >
            <td className="px-2 py-1 font-mono text-stone-700 dark:text-stone-300">
              {r.id}
            </td>
            <td className="px-2 py-1 text-right font-mono tabular-nums text-stone-800 dark:text-stone-200">
              {r.N.toFixed(2)}
            </td>
            <td className={`px-2 py-1 text-right font-medium ${r.color}`}>
              {r.state}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </>
  );
}
