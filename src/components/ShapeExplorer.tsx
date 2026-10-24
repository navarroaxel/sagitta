"use client";

import { useMemo, useState } from "react";
import { useLanguage, type TranslationKey } from "@/contexts/LanguageContext";
import {
  SHAPES,
  defaults,
  type BasicShape,
  type Loop,
  type PropKey,
  type ShapeId,
  type ShapeProps,
} from "@/lib/basicShapes";

const inputCls =
  "rounded border border-stone-300 bg-white px-2 py-1.5 text-sm dark:border-stone-600 dark:bg-stone-800";

const GROUPS: { title: TranslationKey; rows: { key: PropKey; label: string; unit: string }[] }[] = [
  {
    title: "prof.shapes.g_cg",
    rows: [
      { key: "xg", label: "xg", unit: "" },
      { key: "yg", label: "yg", unit: "" },
      { key: "F", label: "F", unit: "²" },
    ],
  },
  {
    title: "prof.shapes.g_o",
    rows: [
      { key: "Jx", label: "Jx", unit: "⁴" },
      { key: "Jy", label: "Jy", unit: "⁴" },
      { key: "Jxy", label: "Jxy", unit: "⁴" },
    ],
  },
  {
    title: "prof.shapes.g_g",
    rows: [
      { key: "Jxg", label: "Jxg", unit: "⁴" },
      { key: "Jyg", label: "Jyg", unit: "⁴" },
      { key: "Jxyg", label: "Jxyg", unit: "⁴" },
    ],
  },
];

// 6 significant digits, no exponent for the sizes this table deals with; a zero stays a clean 0
const fmt = (v: number) => (Math.abs(v) < 1e-9 ? "0" : String(Number(v.toPrecision(6))));

const path = (loops: Loop[], X: (x: number) => number, Y: (y: number) => number) =>
  loops
    .map(({ pts }) => "M" + pts.map(([x, y]) => `${X(x).toFixed(2)},${Y(y).toFixed(2)}`).join("L") + "Z")
    .join(" ");

// The shape with the table's axes: X, Y at O, and the dashed Xg, Yg through the centroid G.
function ShapeFigure({ loops, props, size = 300 }: { loops: Loop[]; props: ShapeProps; size?: number }) {
  const xs = loops.flatMap((l) => l.pts.map((q) => q[0])).concat(0, props.xg);
  const ys = loops.flatMap((l) => l.pts.map((q) => q[1])).concat(0, props.yg);
  const x0 = Math.min(...xs),
    x1 = Math.max(...xs),
    y0 = Math.min(...ys),
    y1 = Math.max(...ys);
  const M = 34; // px kept free around the drawing for the axes and their names
  const k = Math.min((size - 2 * M) / Math.max(x1 - x0, 1e-9), (size - 2 * M) / Math.max(y1 - y0, 1e-9));
  const w = (x1 - x0) * k + 2 * M,
    h = (y1 - y0) * k + 2 * M;
  const X = (x: number) => M + (x - x0) * k;
  const Y = (y: number) => h - M - (y - y0) * k;
  const gx = X(props.xg),
    gy = Y(props.yg),
    ox = X(0),
    oy = Y(0);
  const ext = 22; // how far the axes go past the shape
  return (
    <svg
      viewBox={`0 0 ${w.toFixed(1)} ${h.toFixed(1)}`}
      width="100%"
      style={{ maxWidth: w, maxHeight: size + 40 }}
      data-testid="shape-figure"
      className="text-stone-700 dark:text-stone-200"
      role="img"
    >
      <defs>
        <marker id="shape-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0,0L8,4L0,8z" fill="currentColor" />
        </marker>
      </defs>
      <path
        d={path(loops, X, Y)}
        fillRule="evenodd"
        className="fill-teal-600/25 stroke-teal-700 dark:fill-teal-400/25 dark:stroke-teal-300"
        strokeWidth={1.5}
      />
      {/* axes through the centroid */}
      <g className="stroke-amber-600 dark:stroke-amber-400" strokeDasharray="5 3" strokeWidth={1}>
        <line x1={X(x0) - ext / 2} y1={gy} x2={X(x1) + ext} y2={gy} />
        <line x1={gx} y1={Y(y0) + ext / 2} x2={gx} y2={Y(y1) - ext} />
      </g>
      {/* X, Y at O */}
      <g stroke="currentColor" strokeWidth={1.4}>
        <line x1={ox} y1={oy} x2={X(x1) + ext} y2={oy} markerEnd="url(#shape-arrow)" />
        <line x1={ox} y1={oy} x2={ox} y2={Y(y1) - ext} markerEnd="url(#shape-arrow)" />
      </g>
      <g fontSize={12} fontWeight={700} fill="currentColor">
        <text x={X(x1) + ext - 4} y={oy + 15}>X</text>
        <text x={ox + 6} y={Y(y1) - ext + 8}>Y</text>
        <text x={ox - 12} y={oy + 14}>O</text>
      </g>
      <g fontSize={11} className="fill-amber-700 dark:fill-amber-300" fontWeight={700}>
        <text x={X(x1) + ext - 8} y={gy - 5}>Xg</text>
        <text x={gx + 5} y={Y(y1) - ext + 8}>Yg</text>
        <text x={gx + 6} y={gy - 6}>G</text>
      </g>
      <circle cx={gx} cy={gy} r={3.5} className="fill-amber-600 dark:fill-amber-400" />
    </svg>
  );
}

function Thumb({ shape }: { shape: BasicShape }) {
  const loops = shape.outline(defaults(shape));
  const xs = loops.flatMap((l) => l.pts.map((q) => q[0])),
    ys = loops.flatMap((l) => l.pts.map((q) => q[1]));
  const x0 = Math.min(...xs),
    x1 = Math.max(...xs),
    y0 = Math.min(...ys),
    y1 = Math.max(...ys);
  const S = 36,
    k = (S - 6) / Math.max(x1 - x0, y1 - y0);
  return (
    <svg viewBox={`0 0 ${S} ${S}`} width={S} height={S} aria-hidden="true">
      <path
        d={path(
          loops,
          (x) => 3 + (x - x0) * k + (S - 6 - (x1 - x0) * k) / 2,
          (y) => S - 3 - (y - y0) * k - (S - 6 - (y1 - y0) * k) / 2,
        )}
        fillRule="evenodd"
        className="fill-teal-600/30 stroke-teal-700 dark:fill-teal-400/30 dark:stroke-teal-300"
        strokeWidth={1.2}
      />
    </svg>
  );
}

export function ShapeExplorer() {
  const { t } = useLanguage();
  const [id, setId] = useState<ShapeId>("rectangle");
  const shape = SHAPES.find((s) => s.id === id)!;
  // typed values, kept as text so a half-typed number is not rewritten under the cursor
  const [typed, setTyped] = useState<Record<string, string>>(() =>
    Object.fromEntries(Object.entries(defaults(shape)).map(([k, v]) => [k, String(v)])),
  );

  function pick(next: ShapeId) {
    const s = SHAPES.find((x) => x.id === next)!;
    setId(next);
    setTyped(Object.fromEntries(Object.entries(defaults(s)).map(([k, v]) => [k, String(v)])));
  }

  const values = useMemo(
    () => Object.fromEntries(shape.params.map((q) => [q.key, parseFloat((typed[q.key] ?? "").replace(",", "."))])),
    [shape, typed],
  );
  const ok = shape.valid(values);
  const result = useMemo(() => (ok ? shape.props(values) : null), [ok, shape, values]);
  const loops = useMemo(() => (ok ? shape.outline(values) : null), [ok, shape, values]);

  return (
    <div className="mx-auto max-w-6xl space-y-3 p-3 sm:p-4" data-testid="shape-explorer">
      <p className="text-xs text-stone-500 dark:text-stone-400">{t("prof.shapes.note")}</p>

      <div role="radiogroup" aria-label={t("prof.shapes.pick")} className="flex flex-wrap gap-2">
        {SHAPES.map((s) => (
          <button
            key={s.id}
            type="button"
            role="radio"
            aria-checked={s.id === id}
            data-testid={`shape-pick-${s.id}`}
            onClick={() => pick(s.id)}
            className={`flex w-24 flex-col items-center gap-1 rounded border px-1 py-2 text-center text-[11px] leading-tight ${
              s.id === id
                ? "border-teal-500 bg-teal-50 font-semibold text-teal-800 dark:border-teal-400 dark:bg-teal-950 dark:text-teal-200"
                : "border-stone-200 bg-white text-stone-600 hover:border-stone-400 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300"
            }`}
          >
            <Thumb shape={s} />
            {t(`prof.shape.${s.id}` as TranslationKey)}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-start gap-4">
        <div className="w-full space-y-3 sm:w-[340px] sm:max-w-full">
          <fieldset className="flex flex-wrap items-center gap-3">
            <legend className="mb-1 text-sm font-semibold">
              {t(`prof.shape.${shape.id}` as TranslationKey)} — {t("prof.shapes.dims")}
            </legend>
            {shape.params.map((q) => (
              <label key={q.key} className="flex items-center gap-1 text-sm text-stone-600 dark:text-stone-300">
                <span className="font-mono">{q.key === "alpha" ? "α" : q.key}</span>
                <input
                  type="text"
                  inputMode="decimal"
                  aria-label={q.key === "alpha" ? "alpha" : q.key}
                  value={typed[q.key] ?? ""}
                  onChange={(e) => setTyped((c) => ({ ...c, [q.key]: e.target.value }))}
                  className={`${inputCls} w-24`}
                />
                {q.unit && <span className="text-xs text-stone-400">{q.unit}</span>}
              </label>
            ))}
          </fieldset>
          {shape.id === "sector" && (
            <p className="text-xs text-stone-500 dark:text-stone-400">{t("prof.shapes.alpha_hint")}</p>
          )}
          {loops && result ? (
            <ShapeFigure loops={loops} props={result} />
          ) : (
            <p role="alert" className="text-sm text-amber-700 dark:text-amber-300" data-testid="shape-invalid">
              {t("prof.shapes.invalid")}
            </p>
          )}
        </div>

        <div className="min-w-0 flex-1 basis-96 overflow-x-auto rounded border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900">
          <table className="w-full border-collapse text-sm tabular-nums">
            <thead className="bg-stone-100 dark:bg-stone-800">
              <tr>
                <th className="px-3 py-2 text-left">&nbsp;</th>
                <th className="px-3 py-2 text-left">{t("prof.shapes.formula")}</th>
                <th className="px-3 py-2 text-right">{t("prof.shapes.value")}</th>
              </tr>
            </thead>
            {GROUPS.map((g) => (
              <tbody key={g.title}>
                <tr className="bg-stone-50 dark:bg-stone-800/50">
                  <th colSpan={3} className="px-3 py-1 text-left text-xs font-semibold text-stone-500 dark:text-stone-400">
                    {t(g.title)}
                  </th>
                </tr>
                {g.rows.map((r) => (
                  <tr key={r.key} className="border-t border-stone-100 dark:border-stone-800">
                    <th scope="row" className="px-3 py-1.5 text-left font-semibold">
                      {r.label}
                    </th>
                    <td className="px-3 py-1.5 font-mono text-xs text-stone-600 dark:text-stone-300">
                      {shape.formulas[r.key]}
                    </td>
                    <td className="px-3 py-1.5 text-right" data-testid={`shape-val-${r.key}`}>
                      {result ? (
                        <>
                          {fmt(result[r.key])}
                          {result[r.key] !== 0 && <span className="text-xs text-stone-400">{" "}u{r.unit}</span>}
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
      </div>
    </div>
  );
}
