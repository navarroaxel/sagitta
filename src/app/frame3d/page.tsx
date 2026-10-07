"use client";

import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";
import Frame3DCanvas, { View3DOptions } from "@/components/Frame3DCanvas";
import Model3DEditor from "@/components/Model3DEditor";
import NavMenu from "@/components/NavMenu";
import { Footer } from "@/components/Footer";
import { GitHubLink } from "@/components/GitHubLink";
import { SettingsPanel } from "@/components/SettingsPanel";
import { useLanguage } from "@/contexts/LanguageContext";
import { solveModel3D } from "@/lib/solve3d";
import { computeStress } from "@/lib/stress3d";
import { PRESETS_3D } from "@/lib/presets3d";
import { DIAGRAMS_3D, Diagram3D } from "@/lib/results3d";
import { FrameModel3D } from "@/lib/types3d";

const DEFAULT = PRESETS_3D[0].model;
const btn =
  "rounded border border-stone-200 bg-stone-100 px-3 py-1.5 text-sm text-stone-800 transition-colors hover:bg-stone-200 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700";

export default function Frame3DPage() {
  const { t } = useLanguage();
  const [model, setModel] = useState<FrameModel3D>(DEFAULT);
  const [opts, setOpts] = useState<View3DOptions>({
    diagram: null,
    showLoads: true,
    showReactions: true,
    showValues: true,
    showMemberLabels: false,
    colorByStress: false,
    scale: 1,
  });
  const svgRef = useRef<SVGSVGElement>(null);
  const solved = useMemo(() => solveModel3D(model), [model]);
  const stress = useMemo(
    () => (solved && solved.result.stable ? computeStress(model, solved) : null),
    [model, solved],
  );
  const hasError = !solved || !solved.result.stable;
  const toggle = (
    k: "showLoads" | "showReactions" | "showValues" | "showMemberLabels" | "colorByStress",
  ) =>
    setOpts((o) => ({ ...o, [k]: !o[k] }));

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <header className="z-10 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-stone-200 bg-white px-4 py-2 shadow-sm dark:border-stone-700 dark:bg-stone-900">
        <h1 className="text-sm font-semibold tracking-tight sm:text-base">{t("f3d.title")}</h1>
        <NavMenu />
        <Link href="/" className="text-sm text-sky-700 hover:underline dark:text-sky-400">
          {t("f3d.back_2d")}
        </Link>
        <div className="hidden flex-1 sm:block" />
        <select
          aria-label={t("preset.examples")}
          className={btn}
          value=""
          onChange={(e) => {
            const p = PRESETS_3D.find((x) => x.key === e.target.value);
            if (p) setModel(p.model);
          }}
        >
          <option value="" disabled>
            {t("preset.examples")}
          </option>
          {PRESETS_3D.map((p) => (
            <option key={p.key} value={p.key}>
              {t(`f3d.example.${p.key}` as const)}
            </option>
          ))}
        </select>
        <button className={btn} onClick={() => setModel(DEFAULT)}>
          {t("f3d.reset")}
        </button>
        <GitHubLink />
        <SettingsPanel />
      </header>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-stone-200 bg-stone-100 px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-800">
        <span className="font-semibold text-stone-500">{t("f3d.diagram")}</span>
        <label className="flex items-center gap-1">
          <input
            type="radio"
            name="diagram"
            checked={opts.diagram === null}
            onChange={() => setOpts((o) => ({ ...o, diagram: null }))}
          />
          {t("f3d.diagram_none")}
        </label>
        {DIAGRAMS_3D.map((d: Diagram3D) => (
          <label key={d} className="flex items-center gap-1 font-mono font-bold">
            <input
              type="radio"
              name="diagram"
              checked={opts.diagram === d}
              onChange={() => setOpts((o) => ({ ...o, diagram: d }))}
            />
            {d}
          </label>
        ))}
        <label className="flex items-center gap-1 font-mono font-bold text-red-700 dark:text-red-400">
          <input
            type="radio"
            name="diagram"
            checked={opts.diagram === "S"}
            onChange={() => setOpts((o) => ({ ...o, diagram: "S" }))}
          />
          σ
        </label>
        <span className="h-4 w-px bg-stone-300 dark:bg-stone-600" />
        {(
          [
            ["showReactions", "controls.reactions"],
            ["showLoads", "controls.loads"],
            ["showValues", "controls.values"],
            ["showMemberLabels", "controls.member_labels"],
            ["colorByStress", "f3d.view.stress_colors"],
          ] as const
        ).map(([k, label]) => (
          <label key={k} className="flex items-center gap-1 text-stone-600 dark:text-stone-300">
            <input type="checkbox" checked={opts[k]} onChange={() => toggle(k)} />
            {t(label)}
          </label>
        ))}
        <label className="flex items-center gap-1 text-stone-600 dark:text-stone-300">
          {t("controls.scale")}
          <input
            type="range"
            min={0.2}
            max={3}
            step={0.1}
            value={opts.scale}
            onChange={(e) => setOpts((o) => ({ ...o, scale: parseFloat(e.target.value) }))}
          />
        </label>
      </div>

      {hasError && (
        <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          {t("f3d.error")}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[380px] flex-shrink-0 overflow-auto border-r border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900">
          <Model3DEditor model={model} onChange={setModel} solved={solved} stress={stress} />
        </aside>
        <main className="flex flex-1 flex-col items-center justify-center gap-2 overflow-auto bg-stone-100 p-2 dark:bg-stone-800">
          <div className="overflow-hidden rounded border border-stone-200 shadow-sm dark:border-stone-600">
            <Frame3DCanvas model={model} solved={solved} stress={stress} viewOpts={opts} svgRef={svgRef} />
          </div>
          <p className="max-w-[900px] text-xs text-stone-500 dark:text-stone-400">{t("f3d.note")}</p>
        </main>
      </div>
      <Footer />
    </div>
  );
}
