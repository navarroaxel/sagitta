"use client";

import { useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Profile } from "@/lib/profiles";
import { ProfileLegend, SectionDrawing } from "./ProfileSection";
import {
  ALL_PROFILES,
  SERIES,
  filterProfiles,
  type SeriesFilter,
  type SortKey,
} from "@/lib/profileSearch";

const COLUMNS: { key: SortKey; label: string; unit: string }[] = [
  { key: "h", label: "h", unit: "mm" },
  { key: "bf", label: "b", unit: "mm" },
  { key: "tf", label: "tf", unit: "mm" },
  { key: "tw", label: "tw", unit: "mm" },
  { key: "hw", label: "hw", unit: "mm" },
  { key: "r", label: "r", unit: "mm" },
  { key: "A", label: "A", unit: "cm²" },
  { key: "Ix", label: "Ix", unit: "cm⁴" },
  { key: "Sx", label: "Sx", unit: "cm³" },
  { key: "rx", label: "rx", unit: "cm" },
  { key: "Iy", label: "Iy", unit: "cm⁴" },
  { key: "Sy", label: "Sy", unit: "cm³" },
  { key: "ry", label: "ry", unit: "cm" },
  { key: "J", label: "J", unit: "cm⁴" },
];

const num = (s: string) => {
  const v = parseFloat(s.replace(",", "."));
  return Number.isFinite(v) && v > 0 ? v : undefined;
};

const inputCls =
  "rounded border border-stone-300 bg-white px-2 py-1.5 text-sm dark:border-stone-600 dark:bg-stone-800";

export function ProfileExplorer() {
  const { t } = useLanguage();
  const [text, setText] = useState("");
  const [series, setSeries] = useState<SeriesFilter>("all");
  const [minIx, setMinIx] = useState("");
  const [minSx, setMinSx] = useState("");
  const [minA, setMinA] = useState("");
  const [sort, setSort] = useState<{
    key: SortKey;
    dir: "asc" | "desc";
  } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const rows = useMemo(
    () =>
      filterProfiles({
        text,
        series,
        minIx: num(minIx),
        minSx: num(minSx),
        minA: num(minA),
        sortKey: sort?.key,
        sortDir: sort?.dir,
      }),
    [text, series, minIx, minSx, minA, sort],
  );

  const sel: Profile | undefined = ALL_PROFILES.find(
    (p) => p.name === selected,
  );

  function toggleSort(key: SortKey) {
    setSort((s) =>
      !s || s.key !== key
        ? { key, dir: "asc" }
        : s.dir === "asc"
          ? { key, dir: "desc" }
          : null,
    );
  }

  function copy(label: string, value: number) {
    try {
      void navigator.clipboard?.writeText(String(value));
    } catch {
      /* clipboard unavailable: still show feedback-free */
    }
    setCopied(label);
    setTimeout(() => setCopied((c) => (c === label ? null : c)), 1200);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-3 p-3 sm:p-4">
      <div className="flex flex-wrap items-end gap-3">
        <input
          type="search"
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("prof.search")}
          aria-label={t("prof.search")}
          className={`${inputCls} w-full sm:w-64`}
        />
        <div
          role="group"
          className="flex max-w-full flex-wrap overflow-hidden rounded border border-stone-300 dark:border-stone-600"
        >
          {(["all", ...SERIES] as const).map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={series === s}
              onClick={() => setSeries(s)}
              className={`px-3 py-1.5 ${
                s === "IPN" || s === "IPB" ? "text-sm font-bold" : "text-xs"
              } ${
                series === s
                  ? "bg-teal-600 text-white"
                  : "bg-white text-stone-700 hover:bg-stone-100 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
              }`}
            >
              {s === "all" ? t("prof.all") : s}
            </button>
          ))}
        </div>
        <fieldset className="flex flex-wrap items-center gap-2">
          <legend className="sr-only">{t("prof.min_label")}</legend>
          {[
            ["Ix ≥", "cm⁴", minIx, setMinIx],
            ["Sx ≥", "cm³", minSx, setMinSx],
            ["A ≥", "cm²", minA, setMinA],
          ].map(([label, unit, val, set]) => (
            <label
              key={label as string}
              className="flex items-center gap-1 text-sm text-stone-600 dark:text-stone-300"
            >
              {label as string}
              <input
                inputMode="decimal"
                value={val as string}
                onChange={(e) => (set as (v: string) => void)(e.target.value)}
                className={`${inputCls} w-24`}
                aria-label={`${t("prof.min_label")} ${label as string}`}
              />
              <span className="text-xs text-stone-400">{unit as string}</span>
            </label>
          ))}
          {(minIx || minSx || minA) && (
            <button
              type="button"
              onClick={() => {
                setSort({ key: "A", dir: "asc" });
              }}
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
        <Detail
          p={sel}
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
            {rows.map((p) => {
              const on = p.name === selected;
              return (
                <tr
                  key={p.name}
                  onClick={() => setSelected(on ? null : p.name)}
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
                    {p.name}
                  </th>
                  {COLUMNS.map((c) => (
                    <td
                      key={c.key}
                      className={`px-3 py-1.5 ${sort?.key === c.key ? "bg-stone-50 dark:bg-stone-800/40" : ""}`}
                    >
                      {p[c.key]}
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
        {t("prof.units")}
      </p>
    </div>
  );
}

function Detail({
  p,
  copied,
  onCopy,
  onClose,
}: {
  p: Profile;
  copied: string | null;
  onCopy: (label: string, v: number) => void;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  return (
    <section
      aria-label={t("prof.detail")}
      className="flex flex-wrap items-start gap-4 rounded border border-teal-300 bg-white p-3 dark:border-teal-800 dark:bg-stone-900"
    >
      <div className="w-full sm:w-[490px] sm:max-w-full">
        <SectionDrawing p={p} />
      </div>
      <div className="min-w-0 flex-1 basis-72 space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{p.name}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="×"
            className="ml-auto rounded px-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            ×
          </button>
        </div>
        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 lg:grid-cols-7">
          {COLUMNS.map((c) => (
            <button
              key={c.key}
              type="button"
              title={t("prof.copy")}
              onClick={() => onCopy(c.key, p[c.key])}
              className="rounded border border-stone-200 px-2 py-1 text-left text-sm hover:bg-teal-50 dark:border-stone-700 dark:hover:bg-teal-950"
            >
              <span className="text-xs text-stone-500 dark:text-stone-400">
                {c.label} [{c.unit}]
              </span>
              <br />
              <span className="font-semibold tabular-nums">
                {copied === c.key ? t("prof.copied") : p[c.key]}
              </span>
            </button>
          ))}
        </div>
        <ProfileLegend p={p} />
      </div>
    </section>
  );
}
