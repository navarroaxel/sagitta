"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  useLanguage,
  type Language,
  type TranslationKey,
} from "@/contexts/LanguageContext";
import {
  useColors,
  setColor,
  setColors,
  resetColors,
  HIGH_CONTRAST_COLORS,
  type ColorKey,
} from "@/contexts/ColorContext";
import {
  applyMode,
  readStoredMode,
  THEME_ICONS,
  THEME_ORDER,
  type ThemeMode,
} from "@/lib/theme";
import { usePrefs, setPref, SNAP_OPTIONS } from "@/contexts/PrefsContext";

// useLayoutEffect warns during SSR; fall back to useEffect on the server.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

// Customizable colors, grouped for the panel.
const COLOR_ROWS: { key: ColorKey; label: TranslationKey }[] = [
  { key: "loads", label: "settings.color.loads" },
  { key: "reactions", label: "settings.color.reactions" },
  { key: "member", label: "settings.color.members" },
  { key: "node", label: "settings.color.nodes" },
  { key: "ink", label: "settings.color.labels" },
  { key: "grid", label: "settings.color.grid" },
  { key: "paper", label: "settings.color.background" },
];
const DIAGRAM_ROWS: { key: ColorKey; label: TranslationKey }[] = [
  { key: "tension", label: "settings.color.n_tension" },
  { key: "compression", label: "settings.color.n_compression" },
  { key: "shear", label: "settings.color.shear" },
  { key: "moment", label: "settings.color.moment" },
];

const segBtn = (active: boolean) =>
  `px-2.5 py-1 text-xs font-medium transition-colors ${
    active
      ? "bg-stone-800 text-white dark:bg-stone-200 dark:text-stone-900"
      : "bg-white text-stone-600 hover:bg-stone-50 dark:bg-stone-900 dark:text-stone-400 dark:hover:bg-stone-800"
  }`;

function ColorRow({ colorKey, label }: { colorKey: ColorKey; label: string }) {
  const colors = useColors();
  const value = colors[colorKey];
  const [draft, setDraft] = useState(value);

  // Re-sync the text field with the live value (e.g. after Restore defaults or a
  // change via the swatch picker) using the render-phase pattern instead of an
  // effect — this keeps focus and avoids cascading renders.
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setDraft(value);
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-stone-600 dark:text-stone-300">{label}</span>
      <div className="flex items-center gap-1.5">
        <input
          type="color"
          value={value}
          aria-label={label}
          onChange={(e) => setColor(colorKey, e.target.value)}
          className="h-6 w-6 cursor-pointer rounded border border-stone-300 bg-transparent p-0 dark:border-stone-600"
        />
        <input
          type="text"
          value={draft}
          spellCheck={false}
          aria-label={`${label} hex`}
          onChange={(e) => {
            const v = e.target.value;
            setDraft(v);
            if (HEX_RE.test(v)) setColor(colorKey, v);
          }}
          onBlur={() => setDraft(value)}
          className="w-20 rounded border border-stone-300 bg-white px-1.5 py-0.5 font-mono text-xs text-stone-700 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200"
        />
      </div>
    </div>
  );
}

export function SettingsPanel() {
  const { t, language, toggle } = useLanguage();
  const prefs = usePrefs();
  const [open, setOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>("auto");
  const [themeMounted, setThemeMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    // The layout's inline script sets the .dark class pre-hydration, but React
    // reconciles <html>'s className back to its SSR value during hydration. A
    // layout effect runs after the commit but before paint, restoring it with
    // no visible flash.
    const stored = readStoredMode();
    setThemeMode(stored);
    applyMode(stored);
    setThemeMounted(true);
  }, []);

  useEffect(() => {
    if (themeMode !== "auto") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyMode("auto");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [themeMode]);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const currentTheme = themeMounted ? themeMode : "auto";

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("settings.title")}
        title={t("settings.title")}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="settings-panel"
        className="inline-flex items-center rounded border border-stone-300 bg-stone-100 px-2 py-1 text-sm text-stone-700 transition-colors hover:bg-stone-200 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
      >
        <span aria-hidden>⚙</span>
      </button>

      {open && (
        <div
          id="settings-panel"
          className="absolute top-full right-0 z-50 mt-1 max-h-[80vh] w-72 space-y-3 overflow-y-auto rounded-lg border border-stone-200 bg-white p-3 shadow-lg dark:border-stone-700 dark:bg-stone-900"
        >
          {/* Colors */}
          <div>
            <p className="mb-2 text-[10px] font-semibold tracking-wider text-stone-400 uppercase dark:text-stone-500">
              {t("settings.section.colors")}
            </p>
            <div className="space-y-1.5">
              {COLOR_ROWS.map((r) => (
                <ColorRow key={r.key} colorKey={r.key} label={t(r.label)} />
              ))}
            </div>

            <p className="mt-3 mb-2 text-[10px] font-semibold tracking-wider text-stone-400 uppercase dark:text-stone-500">
              {t("settings.section.diagrams")}
            </p>
            <div className="space-y-1.5">
              {DIAGRAM_ROWS.map((r) => (
                <ColorRow key={r.key} colorKey={r.key} label={t(r.label)} />
              ))}
            </div>

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setColors(HIGH_CONTRAST_COLORS)}
                className="flex-1 rounded border border-stone-200 bg-stone-100 px-2 py-1 text-xs text-stone-600 transition-colors hover:bg-stone-200 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
              >
                {t("settings.high_contrast")}
              </button>
              <button
                type="button"
                onClick={resetColors}
                className="flex-1 rounded border border-stone-200 bg-stone-100 px-2 py-1 text-xs text-stone-600 transition-colors hover:bg-stone-200 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
              >
                {t("settings.reset")}
              </button>
            </div>
          </div>

          {/* Interface */}
          <div className="border-t border-stone-200 pt-3 dark:border-stone-700">
            <p className="mb-2 text-[10px] font-semibold tracking-wider text-stone-400 uppercase dark:text-stone-500">
              {t("settings.section.interface")}
            </p>

            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-stone-600 dark:text-stone-300">
                {t("settings.language")}
              </span>
              <div className="flex overflow-hidden rounded-md border border-stone-300 dark:border-stone-600">
                {(["es", "en"] as Language[]).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => {
                      if (language !== v) toggle();
                    }}
                    className={`${segBtn(language === v)} font-mono`}
                  >
                    {v.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-600 dark:text-stone-300">
                {t("settings.theme")}
              </span>
              <div className="flex overflow-hidden rounded-md border border-stone-300 dark:border-stone-600">
                {THEME_ORDER.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => {
                      setThemeMode(v);
                      applyMode(v);
                    }}
                    title={`${t("settings.theme")} ${v}`}
                    suppressHydrationWarning
                    className={segBtn(currentTheme === v)}
                  >
                    {THEME_ICONS[v]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="border-t border-stone-200 pt-3 dark:border-stone-700">
            <p className="mb-2 text-[10px] font-semibold tracking-wider text-stone-400 uppercase dark:text-stone-500">
              {t("settings.section.preferences")}
            </p>

            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-stone-600 dark:text-stone-300">
                {t("settings.remember_work")}
              </span>
              <div className="flex overflow-hidden rounded-md border border-stone-300 dark:border-stone-600">
                {([true, false] as const).map((v) => (
                  <button
                    key={String(v)}
                    type="button"
                    onClick={() => setPref("rememberWork", v)}
                    className={segBtn(prefs.rememberWork === v)}
                  >
                    {v ? t("settings.on") : t("settings.off")}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-600 dark:text-stone-300">
                {t("settings.snap")}
              </span>
              <div className="flex overflow-hidden rounded-md border border-stone-300 dark:border-stone-600">
                {SNAP_OPTIONS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setPref("snap", v)}
                    className={`${segBtn(prefs.snap === v)} font-mono`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
