"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import FrameCanvas, { ViewOptions } from "@/components/FrameCanvas";
import { PRESETS } from "@/lib/presets";
import { solveModel, SolveOutput } from "@/lib/solve";
import { useLanguage } from "@/contexts/LanguageContext";
import { SettingsPanel } from "@/components/SettingsPanel";

// ─── Constants ───────────────────────────────────────────────────────────────

const PRESET_INDEX = 16; // fixedBeamHingeOverhang

const BASE_VIEW: ViewOptions = {
  showN: false,
  showQ: false,
  showM: false,
  showReactions: false,
  showLoads: false,
  showValues: false,
  showGrid: false,
  showMemberLabels: false,
  scaleN: 1,
  scaleQ: 1,
  scaleM: 1,
  scaleLoads: 1,
};

const STEP_VIEW: ViewOptions[] = [
  // 0: The model — loads + member labels
  { ...BASE_VIEW, showLoads: true, showMemberLabels: true },
  // 1: Determinacy — same view
  { ...BASE_VIEW, showLoads: true, showMemberLabels: true },
  // 2: Hinge trick — loads only (no reactions yet)
  { ...BASE_VIEW, showLoads: true },
  // 3: Full reactions
  { ...BASE_VIEW, showLoads: true, showReactions: true },
  // 4: Shear diagram
  { ...BASE_VIEW, showQ: true, showValues: true },
  // 5: Moment + shear together (locate M_max)
  { ...BASE_VIEW, showM: true, showQ: true, showValues: true },
];

const STEP_FORMULAS: (string | null)[] = [
  null,
  "unknowns (4) = equations (3 global + 1 hinge)",
  "ΣM_A12 = 0: V_B·2 − q·2·1 − P3·4 = 0  →  V_B = 14 T",
  "ΣFy: V_A + 14 = 10 + 4 + 20 + 5  →  V_A = 25 T",
  "V(x) = V_A − ΣPi − q·(x−7)   [x ∈ [7, 12]]",
  "dM/dx = V(x) = 0  →  x = 9.75 m  (0.25 m from hinge)",
];

const STEP_COUNT = STEP_VIEW.length;

// ─── Main page ────────────────────────────────────────────────────────────────

export default function LearnHingePage() {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);

  const model = useMemo(() => PRESETS[PRESET_INDEX].model, []);

  const solved = useMemo<SolveOutput | null>(() => {
    try {
      return solveModel(model);
    } catch {
      return null;
    }
  }, [model]);

  const stepTitleKeys = [
    "learn.hinge.step.0.title",
    "learn.hinge.step.1.title",
    "learn.hinge.step.2.title",
    "learn.hinge.step.3.title",
    "learn.hinge.step.4.title",
    "learn.hinge.step.5.title",
  ] as const;

  const stepDescKeys = [
    "learn.hinge.step.0.desc",
    "learn.hinge.step.1.desc",
    "learn.hinge.step.2.desc",
    "learn.hinge.step.3.desc",
    "learn.hinge.step.4.desc",
    "learn.hinge.step.5.desc",
  ] as const;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      {/* Header */}
      <header className="z-10 flex items-center gap-3 border-b border-stone-200 bg-white px-4 py-2 shadow-sm dark:border-stone-700 dark:bg-stone-900">
        <Link
          href="/"
          className="text-sm text-stone-500 transition-colors hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100"
        >
          {t("learn.back")}
        </Link>
        <span className="text-stone-300 dark:text-stone-600">|</span>
        <h1 className="text-base font-semibold tracking-tight text-stone-800 dark:text-stone-100">
          {t("learn.hinge.title")}
        </h1>
        <div className="flex-1" />
        <SettingsPanel />
      </header>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: step panel */}
        <aside className="flex w-80 flex-shrink-0 flex-col gap-5 overflow-auto border-r border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-900">
          {/* Step indicator */}
          <div className="text-xs font-medium uppercase tracking-wider text-stone-400 dark:text-stone-500">
            {t("learn.step")} {step + 1} {t("learn.of")} {STEP_COUNT}
          </div>

          {/* Step dots */}
          <div className="flex gap-1.5">
            {Array.from({ length: STEP_COUNT }).map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                aria-label={`${t("learn.step")} ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === step
                    ? "w-6 bg-stone-700 dark:bg-stone-300"
                    : i < step
                      ? "w-2 bg-stone-400 dark:bg-stone-500"
                      : "w-2 bg-stone-200 dark:bg-stone-700"
                }`}
              />
            ))}
          </div>

          {/* Step title */}
          <h2 className="text-xl font-semibold text-stone-800 dark:text-stone-100">
            {t(stepTitleKeys[step])}
          </h2>

          {/* Step description */}
          <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-400">
            {t(stepDescKeys[step])}
          </p>

          {/* Formula */}
          {STEP_FORMULAS[step] && (
            <div className="rounded border border-stone-200 bg-stone-50 px-4 py-3 font-mono text-sm text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300">
              {STEP_FORMULAS[step]}
            </div>
          )}

          <div className="flex-1" />

          {/* Navigation */}
          <div className="flex gap-2">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="flex-1 rounded border border-stone-200 bg-stone-100 px-3 py-2 text-sm text-stone-700 transition-colors hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-40 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
            >
              {t("learn.prev")}
            </button>
            <button
              onClick={() => setStep((s) => Math.min(STEP_COUNT - 1, s + 1))}
              disabled={step === STEP_COUNT - 1}
              className="flex-1 rounded border border-stone-700 bg-stone-700 px-3 py-2 text-sm text-white transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-40 dark:border-stone-500 dark:bg-stone-600 dark:hover:bg-stone-500"
            >
              {t("learn.next")}
            </button>
          </div>
        </aside>

        {/* Right: canvas */}
        <main className="flex flex-1 items-center justify-center overflow-hidden bg-stone-100 p-2 dark:bg-stone-800">
          <div className="overflow-hidden rounded border border-stone-200 shadow-sm dark:border-stone-600">
            <FrameCanvas
              model={model}
              solved={solved}
              viewOpts={STEP_VIEW[step]}
              onNodeMove={() => {}}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
