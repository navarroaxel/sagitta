"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import FrameCanvas, { ViewOptions } from "@/components/FrameCanvas";
import { PRESETS } from "@/lib/presets";
import { solveModel, SolveOutput } from "@/lib/solve";
import { makeTransform } from "@/lib/geometry";
import { SVG_W, SVG_H } from "@/components/canvas/constants";
import { useLanguage } from "@/contexts/LanguageContext";
import { SettingsPanel } from "@/components/SettingsPanel";
import { FrameModel } from "@/lib/types";

// ─── Constants ───────────────────────────────────────────────────────────────

const PRESET_INDICES = [4, 12] as const;

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
  // 0: The model
  { ...BASE_VIEW, showLoads: true, showMemberLabels: true },
  // 1: Support reactions
  { ...BASE_VIEW, showLoads: true, showReactions: true },
  // 2: Shear diagram
  { ...BASE_VIEW, showQ: true, showValues: true },
  // 3: 1m trick — show M diagram with tangent construction overlay
  { ...BASE_VIEW, showM: true, showValues: true },
  // 4: Pole and bisections — same M diagram with bisection overlay
  { ...BASE_VIEW, showM: true, showValues: true },
  // 5: Bending moment diagram (plain)
  { ...BASE_VIEW, showM: true, showValues: true },
  // 6: Theorem I
  { ...BASE_VIEW, showM: true, showValues: true, showLoads: true },
  // 7: Full picture
  {
    ...BASE_VIEW,
    showN: true,
    showQ: true,
    showM: true,
    showReactions: true,
    showLoads: true,
    showValues: true,
  },
];

const STEP_FORMULAS: (string | null)[] = [
  null,
  null,
  null,
  "Q [kN] × 1 [m] = [kN·m]",
  null,
  null,
  "θ_B/A = ∫[A→B] M/EI · dx",
  "t_B/A = ∫[A→B] (M/EI) · x̄ · dx",
];

const STEP_COUNT = STEP_VIEW.length;

// ─── Geometry helpers ─────────────────────────────────────────────────────────

function lineIntersect(
  ax: number,
  ay: number,
  adx: number,
  ady: number,
  bx: number,
  by: number,
  bdx: number,
  bdy: number,
): { x: number; y: number } | null {
  const det = adx * bdy - ady * bdx;
  if (Math.abs(det) < 1e-6) return null;
  const t = ((bx - ax) * bdy - (by - ay) * bdx) / det;
  return { x: ax + t * adx, y: ay + t * ady };
}

// ─── Construction overlay ─────────────────────────────────────────────────────

// Renders SVG construction geometry (tangent lines, pole, bisections) for UDL
// members. Designed to be passed as `svgOverlay` to FrameCanvas — it lives
// inside the pan/zoom <g> so it moves with the rest of the content.
function ConstructionOverlay({
  model,
  solved,
  step,
}: {
  model: FrameModel;
  solved: SolveOutput;
  step: number;
}) {
  const tr = useMemo(
    () => makeTransform(model.nodes, SVG_W, SVG_H, 1),
    [model.nodes],
  );

  if (!solved.result.stable) return null;

  // Global max M to match FrameCanvas diagram scale
  let globalMaxM = 0;
  solved.stations.forEach((sts) => {
    sts.forEach((s) => {
      globalMaxM = Math.max(globalMaxM, Math.abs(s.M));
    });
  });
  if (globalMaxM < 1e-9) return null;

  // Same formula as FrameCanvas / buildMemberDiagram
  const mScale = (0.17 * tr.box.diagLen * tr.k) / globalMaxM;

  const udlMemberIds = new Set(
    model.loads
      .filter((l): l is Extract<(typeof model.loads)[number], { type: "mudl" }> => l.type === "mudl")
      .map((l) => l.member),
  );

  const amber = "#f59e0b";
  const red = "#ef4444";

  const elements: React.ReactNode[] = [];

  model.members.forEach((mem, ei) => {
    if (!udlMemberIds.has(mem.id)) return;

    const ni = model.nodes.find((n) => n.id === mem.n1);
    const nj = model.nodes.find((n) => n.id === mem.n2);
    if (!ni || !nj) return;

    const sts = solved.stations[ei];
    if (!sts || sts.length === 0) return;

    const Q_i = sts[0].Q;
    const Q_j = sts[sts.length - 1].Q;
    const M_i = sts[0].M;
    const M_j = sts[sts.length - 1].M;

    // World unit vector along member (i → j)
    const dx_w = nj.x - ni.x,
      dy_w = nj.y - ni.y;
    const len_w = Math.hypot(dx_w, dy_w);
    const ux = dx_w / len_w,
      uy = dy_w / len_w;

    // Screen M-diagram normal direction.
    // Derivation: world normal 90°CCW = (-uy, ux); with sideSign=-1 → (uy, -ux);
    // applying y-flip for screen: (uy_w, ux_w).
    const nx = uy,
      ny = ux;

    // Screen coords of member axis endpoints
    const si_x = tr.toSX(ni.x),
      si_y = tr.toSY(ni.y);
    const sj_x = tr.toSX(nj.x),
      sj_y = tr.toSY(nj.y);

    // M-diagram screen positions at endpoints
    const mi_x = si_x + nx * mScale * M_i;
    const mi_y = si_y + ny * mScale * M_i;
    const mj_x = sj_x + nx * mScale * M_j;
    const mj_y = sj_y + ny * mScale * M_j;

    // Tangent direction in screen for 1 world-unit step along member (i→j).
    // Along member: tr.k px in screen member direction (ux, -uy).
    // Normal (M change): Q * mScale in (nx, ny) direction.
    const dir_ix = tr.k * ux + Q_i * mScale * nx;
    const dir_iy = -tr.k * uy + Q_i * mScale * ny;
    const dir_jx = tr.k * ux + Q_j * mScale * nx;
    const dir_jy = -tr.k * uy + Q_j * mScale * ny;

    // Pole = intersection of tangent from mi (fwd) and tangent from mj (back)
    const pole = lineIntersect(mi_x, mi_y, dir_ix, dir_iy, mj_x, mj_y, -dir_jx, -dir_jy);

    if (step === 3) {
      // ── 1m trick markers ──────────────────────────────────────────────────
      // At i-end: from axis point, go 1m along member, then Q_i perpendicular
      const t1_ix = si_x + ux * tr.k; // 1m point on axis from i
      const t1_iy = si_y - uy * tr.k;
      const tip_ix = t1_ix + nx * Q_i * mScale; // Q_i offset = tangent tip
      const tip_iy = t1_iy + ny * Q_i * mScale;

      // At j-end: from axis point, go 1m back along member, then Q_j
      const t1_jx = sj_x - ux * tr.k;
      const t1_jy = sj_y + uy * tr.k;
      const tip_jx = t1_jx + nx * Q_j * mScale;
      const tip_jy = t1_jy + ny * Q_j * mScale;

      elements.push(
        <g key={`t1m-${mem.id}`} opacity={0.92}>
          {/* Tangent lines from M-diagram endpoints → pole */}
          {pole && (
            <>
              <line
                x1={mi_x} y1={mi_y} x2={pole.x} y2={pole.y}
                stroke={amber} strokeWidth={1.5} strokeDasharray="7,4"
              />
              <line
                x1={mj_x} y1={mj_y} x2={pole.x} y2={pole.y}
                stroke={amber} strokeWidth={1.5} strokeDasharray="7,4"
              />
            </>
          )}
          {/* i-end: 1m tick on axis */}
          <line
            x1={si_x} y1={si_y} x2={t1_ix} y2={t1_iy}
            stroke={amber} strokeWidth={1} strokeDasharray="3,2"
          />
          <circle cx={t1_ix} cy={t1_iy} r={2.5} fill={amber} />
          <text
            x={(si_x + t1_ix) / 2} y={(si_y + t1_iy) / 2 - 7}
            fontSize={8} fill={amber} fontFamily="monospace" textAnchor="middle"
            style={{ paintOrder: "stroke", stroke: "white", strokeWidth: 2 }}
          >
            1m
          </text>
          {/* i-end: Q bar from tick to tip */}
          <line
            x1={t1_ix} y1={t1_iy} x2={tip_ix} y2={tip_iy}
            stroke={amber} strokeWidth={2}
          />
          <circle cx={tip_ix} cy={tip_iy} r={3.5} fill={amber} />
          <text
            x={tip_ix + 5} y={tip_iy + 3}
            fontSize={9} fill={amber} fontFamily="monospace"
            style={{ paintOrder: "stroke", stroke: "white", strokeWidth: 2 }}
          >
            Q={Q_i.toFixed(1)}
          </text>

          {/* j-end: 1m tick on axis */}
          <line
            x1={sj_x} y1={sj_y} x2={t1_jx} y2={t1_jy}
            stroke={amber} strokeWidth={1} strokeDasharray="3,2"
          />
          <circle cx={t1_jx} cy={t1_jy} r={2.5} fill={amber} />
          <text
            x={(sj_x + t1_jx) / 2} y={(sj_y + t1_jy) / 2 - 7}
            fontSize={8} fill={amber} fontFamily="monospace" textAnchor="middle"
            style={{ paintOrder: "stroke", stroke: "white", strokeWidth: 2 }}
          >
            1m
          </text>
          {/* j-end: Q bar from tick to tip */}
          <line
            x1={t1_jx} y1={t1_jy} x2={tip_jx} y2={tip_jy}
            stroke={amber} strokeWidth={2}
          />
          <circle cx={tip_jx} cy={tip_jy} r={3.5} fill={amber} />
          <text
            x={tip_jx + 5} y={tip_jy + 3}
            fontSize={9} fill={amber} fontFamily="monospace"
            style={{ paintOrder: "stroke", stroke: "white", strokeWidth: 2 }}
          >
            Q={Q_j.toFixed(1)}
          </text>
        </g>,
      );
    } else if (step === 4 && pole) {
      // ── Level 1: pole + midspan point ────────────────────────────────────
      const m1_x = (mi_x + pole.x) / 2; // midpoint of A→P
      const m1_y = (mi_y + pole.y) / 2;
      const m2_x = (pole.x + mj_x) / 2; // midpoint of P→B
      const m2_y = (pole.y + mj_y) / 2;
      const mid_x = (m1_x + m2_x) / 2; // t=0.5 — point on parabola
      const mid_y = (m1_y + m2_y) / 2;

      // ── Level 2: quarter-span points ─────────────────────────────────────
      // Left sub-triangle (A, M₁, mid): control points of left half-parabola
      const q1_x = (mi_x + m1_x) / 2;
      const q1_y = (mi_y + m1_y) / 2;
      const q2_x = (m1_x + mid_x) / 2;
      const q2_y = (m1_y + mid_y) / 2;
      const ql_x = (q1_x + q2_x) / 2; // t=0.25 — point on parabola
      const ql_y = (q1_y + q2_y) / 2;

      // Right sub-triangle (mid, M₂, B)
      const q3_x = (mid_x + m2_x) / 2;
      const q3_y = (mid_y + m2_y) / 2;
      const q4_x = (m2_x + mj_x) / 2;
      const q4_y = (m2_y + mj_y) / 2;
      const qr_x = (q3_x + q4_x) / 2; // t=0.75 — point on parabola
      const qr_y = (q3_y + q4_y) / 2;

      const dim = "#9ca3af"; // gray for level-2 construction lines

      elements.push(
        <g key={`polo-${mem.id}`} opacity={0.92}>
          {/* ── Level-2 bisection lines (drawn first, behind level-1) ── */}
          {/* Left sub-triangle */}
          <line x1={mi_x} y1={mi_y} x2={q1_x} y2={q1_y} stroke={dim} strokeWidth={0.75} />
          <line x1={m1_x} y1={m1_y} x2={q2_x} y2={q2_y} stroke={dim} strokeWidth={0.75} />
          <line x1={q1_x} y1={q1_y} x2={q2_x} y2={q2_y} stroke={dim} strokeWidth={0.75} strokeDasharray="3,3" />
          {/* Right sub-triangle */}
          <line x1={mid_x} y1={mid_y} x2={q3_x} y2={q3_y} stroke={dim} strokeWidth={0.75} />
          <line x1={m2_x} y1={m2_y} x2={q4_x} y2={q4_y} stroke={dim} strokeWidth={0.75} />
          <line x1={q3_x} y1={q3_y} x2={q4_x} y2={q4_y} stroke={dim} strokeWidth={0.75} strokeDasharray="3,3" />

          {/* ── Level-1 construction ── */}
          {/* Tangent lines from M endpoints → pole */}
          <line x1={mi_x} y1={mi_y} x2={pole.x} y2={pole.y} stroke={amber} strokeWidth={1.5} strokeDasharray="7,4" />
          <line x1={mj_x} y1={mj_y} x2={pole.x} y2={pole.y} stroke={amber} strokeWidth={1.5} strokeDasharray="7,4" />
          {/* A→M₁ and M₂→P arms */}
          <line x1={mi_x} y1={mi_y} x2={m1_x} y2={m1_y} stroke={amber} strokeWidth={1} />
          <line x1={pole.x} y1={pole.y} x2={m2_x} y2={m2_y} stroke={amber} strokeWidth={1} />
          {/* M₁─M₂ connector */}
          <line x1={m1_x} y1={m1_y} x2={m2_x} y2={m2_y} stroke={amber} strokeWidth={1} strokeDasharray="4,3" />

          {/* M₁ */}
          <circle cx={m1_x} cy={m1_y} r={3.5} fill={amber} />
          <text x={m1_x - 4} y={m1_y - 7} fontSize={8} fill={amber} fontFamily="monospace" textAnchor="middle"
            style={{ paintOrder: "stroke", stroke: "white", strokeWidth: 2 }}>M₁</text>
          {/* M₂ */}
          <circle cx={m2_x} cy={m2_y} r={3.5} fill={amber} />
          <text x={m2_x + 4} y={m2_y - 7} fontSize={8} fill={amber} fontFamily="monospace"
            style={{ paintOrder: "stroke", stroke: "white", strokeWidth: 2 }}>M₂</text>

          {/* Pole P */}
          <circle cx={pole.x} cy={pole.y} r={5} fill={red} />
          <text x={pole.x + 7} y={pole.y - 4} fontSize={10} fill={red} fontFamily="monospace" fontWeight="bold"
            style={{ paintOrder: "stroke", stroke: "white", strokeWidth: 3 }}>P</text>

          {/* ── Verified points ON the parabola ── */}
          {/* t=0.25 */}
          <circle cx={ql_x} cy={ql_y} r={4.5} fill="none" stroke={red} strokeWidth={2} />
          <circle cx={ql_x} cy={ql_y} r={2} fill={red} />
          {/* t=0.50 */}
          <circle cx={mid_x} cy={mid_y} r={4.5} fill="none" stroke={red} strokeWidth={2} />
          <circle cx={mid_x} cy={mid_y} r={2} fill={red} />
          {/* t=0.75 */}
          <circle cx={qr_x} cy={qr_y} r={4.5} fill="none" stroke={red} strokeWidth={2} />
          <circle cx={qr_x} cy={qr_y} r={2} fill={red} />
        </g>,
      );
    }
  });

  return elements.length > 0 ? <>{elements}</> : null;
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function LearnPage() {
  const { t } = useLanguage();
  const [presetIdx, setPresetIdx] = useState<(typeof PRESET_INDICES)[number]>(PRESET_INDICES[0]);
  const [step, setStep] = useState(0);

  const model = useMemo(() => PRESETS[presetIdx].model, [presetIdx]);

  const solved = useMemo<SolveOutput | null>(() => {
    try {
      return solveModel(model);
    } catch {
      return null;
    }
  }, [model]);

  const stepTitleKeys = [
    "learn.step.0.title",
    "learn.step.1.title",
    "learn.step.2.title",
    "learn.step.tangent.title",
    "learn.step.polo.title",
    "learn.step.3.title",
    "learn.step.4.title",
    "learn.step.5.title",
  ] as const;

  const stepDescKeys = [
    "learn.step.0.desc",
    "learn.step.1.desc",
    "learn.step.2.desc",
    "learn.step.tangent.desc",
    "learn.step.polo.desc",
    "learn.step.3.desc",
    "learn.step.4.desc",
    "learn.step.5.desc",
  ] as const;

  const overlay =
    solved && (step === 3 || step === 4) ? (
      <ConstructionOverlay model={model} solved={solved} step={step} />
    ) : undefined;

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
          {t("learn.title")}
        </h1>
        <div className="flex-1" />
        {/* Preset selector */}
        <div className="flex gap-1">
          {PRESET_INDICES.map((pi, i) => (
            <button
              key={pi}
              onClick={() => {
                setPresetIdx(pi);
                setStep(0);
              }}
              className={`rounded border px-3 py-1 text-xs transition-colors ${
                presetIdx === pi
                  ? "border-stone-700 bg-stone-700 text-white dark:border-stone-400 dark:bg-stone-600"
                  : "border-stone-200 bg-stone-100 text-stone-700 hover:bg-stone-200 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
              }`}
            >
              {i === 0 ? t("learn.preset.two_bay") : t("learn.preset.frame_truss")}
            </button>
          ))}
        </div>
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
              svgOverlay={overlay}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
