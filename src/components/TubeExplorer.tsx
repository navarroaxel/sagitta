"use client";

import { useMemo, useState } from "react";
import { useLanguage, type TranslationKey } from "@/contexts/LanguageContext";
import {
  ALL_TUBES,
  filterTubes,
  type AnyTube,
  type TubeKind,
  type TubeSortKey,
} from "@/lib/tubes";

type Column = { key: TubeSortKey; label: string; unit: string };

const round_ = (key: string, unit: string): Column => ({
  key,
  label: key,
  unit,
});

// circular / square: one dimension D (or B) and one I; rectangular: B, H and both axes.
function columnsFor(kind: TubeKind): Column[] {
  if (kind === "RHS")
    return [
      round_("B", "mm"),
      round_("H", "mm"),
      round_("t", "mm"),
      round_("A", "cm²"),
      round_("g", "kg/m"),
      round_("Ix", "cm⁴"),
      round_("Sx", "cm³"),
      round_("rx", "cm"),
      round_("Zx", "cm³"),
      round_("Iy", "cm⁴"),
      round_("Sy", "cm³"),
      round_("ry", "cm"),
      round_("Zy", "cm³"),
      round_("J", "cm⁴"),
      round_("C", "cm³"),
    ];
  return [
    { key: "D", label: kind === "CHS" ? "D" : "B", unit: "mm" },
    round_("t", "mm"),
    round_("A", "cm²"),
    round_("g", "kg/m"),
    round_("I", "cm⁴"),
    round_("S", "cm³"),
    round_("r", "cm"),
    round_("Z", "cm³"),
    round_("J", "cm⁴"),
    round_("C", "cm³"),
  ];
}

const val = (x: AnyTube, key: string) =>
  (x as unknown as Record<string, number>)[key];

const num = (s: string) => {
  const v = parseFloat(s.replace(",", "."));
  return Number.isFinite(v) && v > 0 ? v : undefined;
};

const inputCls =
  "rounded border border-stone-300 bg-white px-2 py-1.5 text-sm dark:border-stone-600 dark:bg-stone-800";
const LINE = "stroke-stone-500 dark:stroke-stone-400";
const TEXT = "fill-stone-700 dark:fill-stone-200";

export function TubeExplorer({ kind }: { kind: TubeKind }) {
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

  const columns = useMemo(() => columnsFor(kind), [kind]);
  const rect = kind === "RHS";

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
              [rect ? "Ix ≥" : "I ≥", "cm⁴", minI, setMinI],
              [rect ? "Sx ≥" : "S ≥", "cm³", minS, setMinS],
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
          columns={columns}
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
              {columns.map((c) => {
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
                      {c.label}
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
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={`px-3 py-1.5 ${sort?.key === c.key ? "bg-stone-50 dark:bg-stone-800/40" : ""}`}
                    >
                      {val(x, c.key)}
                    </td>
                  ))}
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + 1}
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
  columns,
  copied,
  onCopy,
  onClose,
}: {
  x: AnyTube;
  columns: Column[];
  copied: string | null;
  onCopy: (key: string, v: number) => void;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const rect = x.kind === "RHS";
  const sq = x.kind === "SHS";
  type Dim = [string, TranslationKey, string];
  const dims: Dim[] = [
    ...(rect
      ? ([
          ["B", "prof.tube.B", `${x.B} mm`],
          ["H", "prof.tube.H", `${x.H} mm`],
        ] as Dim[])
      : ([
          [sq ? "B" : "D", sq ? "prof.tube.B" : "prof.tube.D", `${x.D} mm`],
        ] as Dim[])),
    ["t", "prof.tube.t", `${x.t} mm`],
    ...(rect || sq ? ([["R", "prof.tube.R", `${2 * x.t} mm`]] as Dim[]) : []),
    ["g", "prof.tube.g", `${x.g} kg/m`],
  ];
  const props: [string, TranslationKey][] = rect
    ? [
        ["A", "prof.tube.A"],
        ["I", "prof.tube.I"],
        ["S", "prof.tube.S"],
        ["r", "prof.tube.r"],
        ["Z", "prof.tube.Z"],
        ["J", "prof.tube.J"],
        ["C", "prof.tube.C"],
      ]
    : [
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
      <div className="w-full sm:w-[360px] sm:max-w-full">
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
          {columns.map((c) => (
            <button
              key={c.key}
              type="button"
              title={t("prof.copy")}
              onClick={() => onCopy(c.key, val(x, c.key))}
              className="rounded border border-stone-200 px-2 py-1 text-left text-sm hover:bg-teal-50 dark:border-stone-700 dark:hover:bg-teal-950"
            >
              <span className="text-xs text-stone-500 dark:text-stone-400">
                {c.label} [{c.unit}]
              </span>
              <br />
              <span className="font-semibold tabular-nums">
                {copied === c.key ? t("prof.copied") : val(x, c.key)}
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
// X-X is the horizontal axis (parallel to B); for the rectangular tube the depth H is vertical.
function TubeDrawing({ x }: { x: AnyTube }) {
  const rect = x.kind === "RHS";
  const sq = x.kind === "SHS";
  const w0 = rect ? x.B : x.D; // outer width
  const h0 = rect ? x.H : x.D; // outer depth
  const VB = 360;
  const C = VB / 2;
  const k = 170 / Math.max(w0, h0);
  const W = w0 * k;
  const H = h0 * k;
  const t = Math.max(x.t * k, 2);
  const ox = C - W / 2;
  const oy = C - H / 2;
  const R = 2 * x.t * k;

  // wall position at tx (a circle's wall curves away from the flat bottom of a square/rectangle)
  const tx = C + W * 0.22;
  const dx = tx - C;
  const flat = sq || rect;
  const yOut = flat ? oy + H : C + Math.sqrt((H / 2) ** 2 - dx ** 2);
  const yIn = flat ? oy + H - t : C + Math.sqrt((H / 2 - t) ** 2 - dx ** 2);

  const ring = flat
    ? `${rrect(ox, oy, W, H, R)} ${rrect(ox + t, oy + t, W - 2 * t, H - 2 * t, Math.max(R - t, 0.01))}`
    : `${circle(C, C, W / 2)} ${circle(C, C, W / 2 - t)}`;

  const labelW = rect ? `B = ${x.B}` : `${sq ? "B" : "D"} = ${x.D}`;
  const dimX = ox + W + 46; // H dimension line

  return (
    <svg
      viewBox={`0 0 ${VB} ${VB}`}
      role="img"
      aria-label={x.name}
      className="h-auto w-full max-w-[360px]"
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
        x1={ox - 14}
        x2={ox + W + 14}
        y1={C}
        y2={C}
        className="stroke-teal-600 dark:stroke-teal-400"
        strokeDasharray="6 3"
        strokeWidth="1.2"
      />
      <text
        x={ox + W + 16}
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
        y1={oy - 14}
        y2={oy + H + 14}
        className="stroke-amber-600 dark:stroke-amber-400"
        strokeDasharray="6 3"
        strokeWidth="1.2"
      />
      <text
        x={C}
        y={oy + H + 30}
        textAnchor="middle"
        fontSize="14"
        fontWeight="700"
        className="fill-amber-700 dark:fill-amber-300"
      >
        Y-Y
      </text>
      {/* B / D */}
      <g className={LINE} strokeWidth="0.8">
        <line x1={ox} x2={ox} y1={oy - 2} y2={oy - 24} />
        <line x1={ox + W} x2={ox + W} y1={oy - 2} y2={oy - 24} />
        <line
          x1={ox}
          x2={ox + W}
          y1={oy - 20}
          y2={oy - 20}
          markerStart="url(#dim-arrow)"
          markerEnd="url(#dim-arrow)"
        />
      </g>
      <text
        x={C}
        y={oy - 25}
        textAnchor="middle"
        fontSize="12"
        className={TEXT}
      >
        {labelW}
      </text>
      {/* H (rectangular tubes only) */}
      {rect && (
        <>
          <g className={LINE} strokeWidth="0.8">
            <line x1={ox + W + 2} x2={dimX + 4} y1={oy} y2={oy} />
            <line x1={ox + W + 2} x2={dimX + 4} y1={oy + H} y2={oy + H} />
            <line
              x1={dimX}
              x2={dimX}
              y1={oy}
              y2={oy + H}
              markerStart="url(#dim-arrow)"
              markerEnd="url(#dim-arrow)"
            />
          </g>
          <text x={dimX + 6} y={C + 4} fontSize="12" className={TEXT}>
            H = {x.H}
          </text>
        </>
      )}
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
      {(sq || rect) && (
        <>
          {/* R: leader from the top-left corner arc out to the left, clear of the axes */}
          <line
            x1={ox + R * 0.29}
            y1={oy + R * 0.29}
            x2={ox - 6}
            y2={oy + 4}
            className={LINE}
            strokeWidth="0.8"
          />
          <text
            x={ox - 8}
            y={oy + 8}
            textAnchor="end"
            fontSize="11"
            className={TEXT}
          >
            R = {+(2 * x.t).toFixed(2)}
          </text>
        </>
      )}
    </svg>
  );
}

function circle(cx: number, cy: number, r: number) {
  return `M${cx - r},${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
}
function rrect(x: number, y: number, w: number, h: number, r: number) {
  const q = Math.min(r, w / 2, h / 2);
  return `M${x + q},${y}H${x + w - q}a${q} ${q} 0 0 1 ${q} ${q}V${y + h - q}a${q} ${q} 0 0 1 ${-q} ${q}H${x + q}a${q} ${q} 0 0 1 ${-q} ${-q}V${y + q}a${q} ${q} 0 0 1 ${q} ${-q}Z`;
}
