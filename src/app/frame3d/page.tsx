"use client";

import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";
import Frame3DCanvas, { View3DOptions } from "@/components/Frame3DCanvas";
import FullscreenFigure from "@/components/FullscreenFigure";
import Model3DEditor from "@/components/Model3DEditor";
import NavMenu from "@/components/NavMenu";
import { Footer } from "@/components/Footer";
import { GitHubLink } from "@/components/GitHubLink";
import { SettingsPanel } from "@/components/SettingsPanel";
import { useLanguage } from "@/contexts/LanguageContext";
import { solveModel3D } from "@/lib/solve3d";
import { computeStress } from "@/lib/stress3d";
import SectionCut, { CutState, resolveCut } from "@/components/SectionCut";
import { PRESETS_3D } from "@/lib/presets3d";
import { peakLocation } from "@/lib/peakLocation";
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
    showLocalAxes: false,
    scale: 1,
  });
  const [cut, setCut] = useState<CutState>({ on: false, member: "", t: 0 });
  const [panelOpen, setPanelOpen] = useState(true); // the nodes / members / loads editor
  const svgRef = useRef<SVGSVGElement>(null);
  const solved = useMemo(() => solveModel3D(model), [model]);
  const stress = useMemo(
    () => (solved && solved.result.stable ? computeStress(model, solved) : null),
    [model, solved],
  );
  // the loaded model is a preset (by identity: any edit makes a new object, and the select goes back to its placeholder)
  const currentPreset = PRESETS_3D.find((p) => p.model === model)?.key ?? "";
  const peak = useMemo(
    () => (solved && stress ? peakLocation(model, solved, stress) : null),
    [model, solved, stress],
  );
  const fill = (text: string, vars: Record<string, string>) =>
    Object.entries(vars).reduce((acc, [k, v]) => acc.replace(`{${k}}`, v), text);
  const peakWhere = !peak
    ? ""
    : peak.where.kind === "constant"
      ? t("f3d.peak.constant")
      : peak.where.kind === "inside"
        ? fill(t("f3d.peak.inside"), { dist: peak.where.dist.toFixed(2), node: peak.where.node })
        : fill(
            t(
              peak.where.support === "fixed"
                ? "f3d.peak.node_fixed"
                : peak.where.support === "pinned"
                  ? "f3d.peak.node_pinned"
                  : "f3d.peak.node_free",
            ),
            { node: peak.where.node },
          );
  const cutRes = cut.on ? resolveCut(model, solved, cut) : null;
  const cutMarker =
    cutRes && solved ? { member: cutRes.e, x: solved.stations[cutRes.e][cutRes.station].x } : null;
  const hasError = !solved || !solved.result.stable;
  const toggle = (
    k: "showLoads" | "showReactions" | "showValues" | "showMemberLabels" | "colorByStress" | "showLocalAxes",
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
          value={currentPreset}
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
            ["showLocalAxes", "f3d.view.local_axes"],
          ] as const
        ).map(([k, label]) => (
          <label key={k} className="flex items-center gap-1 text-stone-600 dark:text-stone-300">
            <input type="checkbox" checked={opts[k]} onChange={() => toggle(k)} />
            {t(label)}
          </label>
        ))}
        <label className="flex items-center gap-1 text-stone-600 dark:text-stone-300">
          <input
            type="checkbox"
            aria-label={t("f3d.cut.toggle")}
            checked={cut.on}
            onChange={() => setCut((c) => ({ ...c, on: !c.on }))}
          />
          {t("f3d.cut.toggle")}
        </label>
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
        <aside
          className={`flex flex-shrink-0 flex-col border-r border-stone-200 bg-white transition-[width] dark:border-stone-700 dark:bg-stone-900 ${panelOpen ? "w-[380px]" : "w-9"}`}
        >
          <div className={`flex border-b border-stone-200 dark:border-stone-700 ${panelOpen ? "justify-end px-1 py-1" : "justify-center py-1"}`}>
            <button
              type="button"
              aria-expanded={panelOpen}
              aria-controls="editor-panel"
              aria-label={panelOpen ? t("f3d.panel.hide") : t("f3d.panel.show")}
              title={panelOpen ? t("f3d.panel.hide") : t("f3d.panel.show")}
              className="flex h-7 w-7 items-center justify-center rounded text-base font-bold text-stone-500 hover:bg-stone-200 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-stone-100"
              onClick={() => setPanelOpen((v) => !v)}
            >
              {panelOpen ? "«" : "»"}
            </button>
          </div>
          <div id="editor-panel" hidden={!panelOpen} className="flex-1 overflow-auto">
            <Model3DEditor model={model} onChange={setModel} solved={solved} stress={stress} />
          </div>
        </aside>
        <main className="flex flex-1 flex-wrap content-start items-start justify-center gap-3 overflow-auto bg-stone-100 p-2 dark:bg-stone-800">
          <div className="min-w-[420px] flex-1 basis-[560px]" style={{ maxWidth: 900 }}>
            <div className="overflow-hidden rounded border border-stone-200 shadow-sm dark:border-stone-600">
              <FullscreenFigure testId="fs-frame3d">
                <Frame3DCanvas model={model} solved={solved} stress={stress} cut={cutMarker} viewOpts={opts} svgRef={svgRef} />
              </FullscreenFigure>
            </div>
            {peak && (
              <p
                data-testid="peak-note"
                className={`mt-2 text-xs ${
                  peak.where.kind === "inside"
                    ? "font-semibold text-amber-700 dark:text-amber-400"
                    : "text-stone-600 dark:text-stone-300"
                }`}
              >
                {fill(t("f3d.peak"), {
                  member: peak.member,
                  profile: peak.profile,
                  pct: (peak.ratio * 100).toFixed(0),
                  where: peakWhere,
                })}
              </p>
            )}
            <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">{t("f3d.note")}</p>
          </div>
          {cut.on && (
            <section className="min-w-[380px] flex-1 basis-[420px] rounded border border-stone-200 bg-white p-3 dark:border-stone-600 dark:bg-stone-900" style={{ maxWidth: panelOpen ? 580 : 780 }}>
              <h2 className="mb-2 text-sm font-semibold">{t("f3d.cut.title")}</h2>
              <SectionCut model={model} solved={solved} stress={stress} cut={cut} onChange={setCut} />
            </section>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}
