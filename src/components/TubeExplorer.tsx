"use client";

import { useMemo, useState } from "react";
import { useLanguage, type TranslationKey } from "@/contexts/LanguageContext";
import {
  ALL_TUBES,
  filterTubes,
  type Tube,
  type TubeSortKey,
} from "@/lib/tubes";

const COLUMNS: { key: TubeSortKey; unit: string }[] = [
  { key: "D", unit: "mm" },
  { key: "t", unit: "mm" },
  { key: "A", unit: "cm²" },
  { key: "g", unit: "kg/m" },
  { key: "I", unit: "cm⁴" },
  { key: "S", unit: "cm³" },
  { key: "r", unit: "cm" },
  { key: "Z", unit: "cm³" },
  { key: "J", unit: "cm⁴" },
  { key: "C", unit: "cm³" },
];

const num = (s: string) => {
  const v = parseFloat(s.replace(",", "."));
  return Number.isFinite(v) && v > 0 ? v : undefined;
};

const inputCls =
  "rounded border border-stone-300 bg-white px-2 py-1.5 text-sm dark:border-stone-600 dark:bg-stone-800";
const LINE = "stroke-stone-500 dark:stroke-stone-400";
const TEXT = "fill-stone-700 dark:fill-stone-200";

export function TubeExplorer({ kind }: { kind: Tube["kind"] }) {
  const { t } = useLanguage();
  const [text, setText] = useState("");
  const [minI, setMinI] = useState("");
  const [minS, setMinS] = useState("");
  const [minA, setMinA] = useState("");
  const [sort, setSort] = useState<{
    key: TubeSortKey;
    dir: "asc" | "desc";
  } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const label = (key: TubeSortKey) =>
    key === "D" ? (kind === "CHS" ? "D" : "B") : key;

  const rows = useMemo(
    () =>
      filterTubes({
        text,
        kind,
        minI: num(minI),
        minS: num(minS),
        minA: num(minA),
        sortKey: sort?.key,
        sortDir: sort?.dir,
      }),
    [text, kind, minI, minS, minA, sort],
  );
  const sel = ALL_TUBES.find((x) => x.name === selected && x.kind === kind);

  function toggleSort(key: TubeSortKey) {
    setSort((s) =>
      !s || s.key !== key
        ? { key, dir: "asc" }
        : s.dir === "asc"
          ? { key, dir: "desc" }
          : null,
    );
  }
  function copy(key: string, value: number) {
    try {
      void navigator.clipboard?.writeText(String(value));
    } catch {
      /* clipboard unavailable */
    }
    setCopied(key);
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 1200);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-3 p-3 sm:p-4">
      <div className="flex flex-wrap items-end gap-3">
        <input
          type="search"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("prof.tube.search")}
          aria-label={t("prof.tube.search")}
          className={`${inputCls} w-full sm:w-64`}
        />
        <fieldset className="flex flex-wrap items-center gap-2">
          <legend className="sr-only">{t("prof.min_label")}</legend>
          {(
            [
              ["I ≥", "cm⁴", minI, setMinI],
              ["S ≥", "cm³", minS, setMinS],
              ["A ≥", "cm²", minA, setMinA],
            ] as const
          ).map(([lab, unit, val, set]) => (
            <label
              key={lab}
              className="flex items-center gap-1 text-sm text-stone-600 dark:text-stone-300"
            >
              {lab}
              <input
                inputMode="decimal"
                value={val}
                onChange={(e) => set(e.target.value)}
                className={`${inputCls} w-24`}
                aria-label={`${t("prof.min_label")} ${lab}`}
              />
              <span className="text-xs text-stone-400">{unit}</span>
            </label>
          ))}
          {(minI || minS || minA) && (
            <button
              type="button"
              onClick={() => setSort({ key: "A", dir: "asc" })}
              className="rounded border border-stone-300 px-2 py-1.5 text-xs text-stone-600 hover:bg-stone-100 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-700"
            >
              {t("prof.lightest")}
            </button>
          )}
        </fieldset>
        <span className="ml-auto text-sm text-stone-500 dark:text-stone-400">
          {rows.length} {t("prof.count")}
        </span>
      </div>

      <p className="text-xs text-stone-500 dark:text-stone-400">
        {t("prof.hint")}
      </p>

      {sel && (
        <TubeDetail
          x={sel}
          copied={copied}
          onCopy={copy}
          onClose={() => setSelected(null)}
        />
      )}

      <div className="max-h-[70vh] overflow-auto rounded border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900">
        <table className="w-full border-collapse text-right text-sm tabular-nums">
          <thead className="sticky top-0 z-10 bg-stone-100 dark:bg-stone-800">
            <tr>
              <th className="sticky left-0 z-20 bg-stone-100 px-3 py-2 text-left dark:bg-stone-800">
                {t("prof.profile")}
              </th>
              {COLUMNS.map((c) => {
                const active = sort?.key === c.key;
                return (
                  <th
                    key={c.key}
                    aria-sort={
                      active
                        ? sort!.dir === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                    className="px-0"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort(c.key)}
                      className="w-full px-3 py-2 text-right font-semibold hover:bg-stone-200 dark:hover:bg-stone-700"
                    >
                      {label(c.key)}
                      {active && (sort!.dir === "asc" ? " ▲" : " ▼")}
                      <div className="text-[10px] font-normal text-stone-400">
                        {c.unit}
                      </div>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((x) => {
              const on = x.name === selected;
              return (
                <tr
                  key={x.name}
                  onClick={() => setSelected(on ? null : x.name)}
                  aria-selected={on}
                  className={`cursor-pointer border-t border-stone-100 dark:border-stone-800 ${
                    on
                      ? "bg-teal-50 dark:bg-teal-950"
                      : "hover:bg-stone-50 dark:hover:bg-stone-800/60"
                  }`}
                >
                  <th
                    scope="row"
                    className={`sticky left-0 px-3 py-1.5 text-left font-semibold ${
                      on
                        ? "bg-teal-50 dark:bg-teal-950"
                        : "bg-white dark:bg-stone-900"
                    }`}
                  >
                    {x.name}
                  </th>
                  {COLUMNS.map((c) => (
                    <td
                      key={c.key}
                      className={`px-3 py-1.5 ${sort?.key === c.key ? "bg-stone-50 dark:bg-stone-800/40" : ""}`}
                    >
                      {x[c.key]}
                    </td>
                  ))}
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={COLUMNS.length + 1}
                  className="px-3 py-8 text-center text-stone-500"
                >
                  {t("prof.none")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-stone-500 dark:text-stone-400">
        {t("prof.tube.units")}
      </p>
    </div>
  );
}

function TubeDetail({
  x,
  copied,
  onCopy,
  onClose,
}: {
  x: Tube;
  copied: string | null;
  onCopy: (key: string, v: number) => void;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const sq = x.kind === "SHS";
  const dims: [string, TranslationKey, string][] = [
    [sq ? "B" : "D", sq ? "prof.tube.B" : "prof.tube.D", `${x.D} mm`],
    ["t", "prof.tube.t", `${x.t} mm`],
    ...(sq
      ? ([["R", "prof.tube.R", `${2 * x.t} mm`]] as [
          string,
          TranslationKey,
          string,
        ][])
      : []),
    ["g", "prof.tube.g", `${x.g} kg/m`],
  ];
  const props: [string, TranslationKey][] = [
    ["A", "prof.tube.A"],
    ["I", "prof.tube.I"],
    ["S", "prof.tube.S"],
    ["r", "prof.tube.r"],
    ["Z", "prof.tube.Z"],
    ["J", "prof.tube.J"],
    ["C", "prof.tube.C"],
  ];
  return (
    <section
      aria-label={t("prof.detail")}
      className="flex flex-wrap items-start gap-4 rounded border border-teal-300 bg-white p-3 dark:border-teal-800 dark:bg-stone-900"
    >
      <div className="w-full sm:w-[340px] sm:max-w-full">
        <TubeDrawing x={x} />
      </div>
      <div className="min-w-0 flex-1 basis-72 space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{x.name}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="×"
            className="ml-auto rounded px-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            ×
          </button>
        </div>
        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 lg:grid-cols-5">
          {COLUMNS.map((c) => (
            <button
              key={c.key}
              type="button"
              title={t("prof.copy")}
              onClick={() => onCopy(c.key, x[c.key])}
              className="rounded border border-stone-200 px-2 py-1 text-left text-sm hover:bg-teal-50 dark:border-stone-700 dark:hover:bg-teal-950"
            >
              <span className="text-xs text-stone-500 dark:text-stone-400">
                {c.key === "D" ? (sq ? "B" : "D") : c.key} [{c.unit}]
              </span>
              <br />
              <span className="font-semibold tabular-nums">
                {copied === c.key ? t("prof.copied") : x[c.key]}
              </span>
            </button>
          ))}
        </div>
        <div
          className="space-y-3 text-sm"
          role="group"
          aria-label={t("prof.leg.title")}
        >
          <dl className="grid grid-cols-[auto_1fr_auto] gap-x-3 gap-y-0.5">
            {dims.map(([sym, key, v]) => (
              <div key={sym} className="contents">
                <dt className="font-bold">{sym}</dt>
                <dd className="text-stone-600 dark:text-stone-300">{t(key)}</dd>
                <dd className="text-right tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
          <ul className="space-y-0.5 text-stone-600 dark:text-stone-300">
            {props.map(([sym, key]) => (
              <li key={sym}>
                <b className="text-stone-900 dark:text-stone-100">{sym}</b>{" "}
                {t(key)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// Tube section to scale with its dimension marks and the two principal axes (X-X, Y-Y).
function TubeDrawing({ x }: { x: Tube }) {
  const sq = x.kind === "SHS";
  const VB = 320;
  const C = VB / 2;
  const k = 150 / x.D;
  const S = x.D * k; // outer size
  const t = Math.max(x.t * k, 2);
  const o = C - S / 2;
  const R = 2 * x.t * k;

  // wall position at x = tx (the circle's wall curves away from the flat bottom of the square)
  const tx = C + S * 0.22;
  const dx = tx - C;
  const yOut = sq ? o + S : C + Math.sqrt((S / 2) ** 2 - dx ** 2);
  const yIn = sq ? o + S - t : C + Math.sqrt((S / 2 - t) ** 2 - dx ** 2);

  const ring = sq
    ? `${rrect(o, o, S, R)} ${rrect(o + t, o + t, S - 2 * t, Math.max(R - t, 0.01))}`
    : `${circle(C, C, S / 2)} ${circle(C, C, S / 2 - t)}`;

  return (
    <svg
      viewBox={`0 0 ${VB} ${VB}`}
      role="img"
      aria-label={x.name}
      className="h-auto w-full max-w-[340px]"
    >
      <defs>
        <marker
          id="dim-arrow"
          viewBox="0 0 10 10"
          refX="10"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path
            d="M0,1.5 L10,5 L0,8.5 z"
            className="fill-stone-600 dark:fill-stone-300"
          />
        </marker>
      </defs>
      <path
        d={ring}
        fillRule="evenodd"
        className="fill-stone-300 stroke-stone-600 dark:fill-stone-600 dark:stroke-stone-300"
        strokeWidth="1.2"
      />
      {/* axes */}
      <line
        x1={o - 14}
        x2={o + S + 14}
        y1={C}
        y2={C}
        className="stroke-teal-600 dark:stroke-teal-400"
        strokeDasharray="6 3"
        strokeWidth="1.2"
      />
      <text
        x={o + S + 16}
        y={C - 6}
        fontSize="14"
        fontWeight="700"
        className="fill-teal-700 dark:fill-teal-300"
      >
        X-X
      </text>
      <line
        x1={C}
        x2={C}
        y1={o - 14}
        y2={o + S + 14}
        className="stroke-amber-600 dark:stroke-amber-400"
        strokeDasharray="6 3"
        strokeWidth="1.2"
      />
      <text
        x={C}
        y={o + S + 30}
        textAnchor="middle"
        fontSize="14"
        fontWeight="700"
        className="fill-amber-700 dark:fill-amber-300"
      >
        Y-Y
      </text>
      {/* D / B */}
      <g className={LINE} strokeWidth="0.8">
        <line x1={o} x2={o} y1={o - 2} y2={o - 24} />
        <line x1={o + S} x2={o + S} y1={o - 2} y2={o - 24} />
        <line
          x1={o}
          x2={o + S}
          y1={o - 20}
          y2={o - 20}
          markerStart="url(#dim-arrow)"
          markerEnd="url(#dim-arrow)"
        />
      </g>
      <text x={C} y={o - 25} textAnchor="middle" fontSize="12" className={TEXT}>
        {sq ? "B" : "D"} = {x.D}
      </text>
      {/* t: arrows onto both faces of the bottom wall */}
      <g className={LINE} strokeWidth="0.8">
        <line
          x1={tx}
          x2={tx}
          y1={yOut + 16}
          y2={yOut}
          markerEnd="url(#dim-arrow)"
        />
        <line
          x1={tx}
          x2={tx}
          y1={yIn - 16}
          y2={yIn}
          markerEnd="url(#dim-arrow)"
        />
      </g>
      <text x={tx + 8} y={yOut + 20} fontSize="12" className={TEXT}>
        t = {x.t}
      </text>
      {sq && (
        <text
          x={o + R * 0.45}
          y={o + R * 0.45 + 14}
          fontSize="11"
          className={TEXT}
        >
          R = {2 * x.t}
        </text>
      )}
    </svg>
  );
}

function circle(cx: number, cy: number, r: number) {
  return `M${cx - r},${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
}
function rrect(x: number, y: number, s: number, r: number) {
  const q = Math.min(r, s / 2);
  return `M${x + q},${y}H${x + s - q}a${q} ${q} 0 0 1 ${q} ${q}V${y + s - q}a${q} ${q} 0 0 1 ${-q} ${q}H${x + q}a${q} ${q} 0 0 1 ${-q} ${-q}V${y + q}a${q} ${q} 0 0 1 ${q} ${-q}Z`;
}
