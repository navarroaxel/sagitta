"use client";

import React from "react";
import { ViewOptions } from "./FrameCanvas";
import { useLanguage } from "@/contexts/LanguageContext";
import { useColors } from "@/contexts/ColorContext";
import { usePrefs, setPref } from "@/contexts/PrefsContext";

interface Props {
  opts: ViewOptions;
  onChange: (opts: ViewOptions) => void;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-semibold text-stone-600 dark:text-stone-300">
      {children}
    </span>
  );
}

interface ScaleSliderProps {
  label: React.ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  accentColor: string;
  onChange: (v: number) => void;
}

function ScaleSlider({ label, value, min, max, step, accentColor, onChange }: ScaleSliderProps) {
  return (
    <label className="flex items-center gap-1 text-stone-600 dark:text-stone-300">
      {label}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-20"
        style={{ accentColor }}
      />
      <span className="w-8 text-right font-mono text-xs">{value.toFixed(2)}</span>
    </label>
  );
}

export default function DiagramControls({ opts, onChange }: Props) {
  const { t } = useLanguage();
  const colors = useColors();
  const prefs = usePrefs();

  const set = <K extends keyof ViewOptions>(k: K, v: ViewOptions[K]) =>
    onChange({ ...opts, [k]: v });

  const toggle = (k: keyof ViewOptions) => onChange({ ...opts, [k]: !opts[k] });

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-stone-200 bg-stone-100 px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-800">
      {/* Diagram toggles */}
      <SectionLabel>{t("controls.show")}</SectionLabel>
      {(["N", "Q", "M"] as const).map((d) => {
        const key = `show${d}` as keyof ViewOptions;
        // Match the diagram's customizable color (N uses its tension color).
        const color = d === "N" ? colors.tension : d === "Q" ? colors.shear : colors.moment;
        return (
          <label
            key={d}
            className="flex cursor-pointer items-center gap-1 font-mono font-bold"
            style={{ color }}
          >
            <input
              type="checkbox"
              checked={opts[key] as boolean}
              onChange={() => toggle(key)}
              style={{ accentColor: color }}
            />
            {d}
          </label>
        );
      })}
      <span className="h-4 w-px bg-stone-300 dark:bg-stone-600" />
      <label className="flex cursor-pointer items-center gap-1 text-stone-600 dark:text-stone-300">
        <input
          type="checkbox"
          checked={opts.showReactions}
          onChange={() => toggle("showReactions")}
        />
        {t("controls.reactions")}
      </label>
      <label className="flex cursor-pointer items-center gap-1 text-stone-600 dark:text-stone-300">
        <input
          type="checkbox"
          checked={opts.showLoads}
          onChange={() => toggle("showLoads")}
        />
        {t("controls.loads")}
      </label>
      <label className="flex cursor-pointer items-center gap-1 text-stone-600 dark:text-stone-300">
        <input
          type="checkbox"
          checked={opts.showValues}
          onChange={() => toggle("showValues")}
        />
        {t("controls.values")}
      </label>
      <label className="flex cursor-pointer items-center gap-1 text-stone-600 dark:text-stone-300">
        <input
          type="checkbox"
          checked={opts.showGrid}
          onChange={() => toggle("showGrid")}
        />
        {t("controls.grid")}
      </label>
      <label className="flex cursor-pointer items-center gap-1 text-stone-600 dark:text-stone-300">
        <input
          type="checkbox"
          checked={opts.showMemberLabels}
          onChange={() => toggle("showMemberLabels")}
        />
        {t("controls.member_labels")}
      </label>
      <label className="flex cursor-pointer items-center gap-1 text-stone-600 dark:text-stone-300">
        <input
          type="checkbox"
          checked={prefs.showDimensions}
          onChange={() => setPref("showDimensions", !prefs.showDimensions)}
        />
        {t("controls.dimensions")}
      </label>

      <span className="h-4 w-px bg-stone-300 dark:bg-stone-600" />

      {/* Scale sliders */}
      <SectionLabel>{t("controls.scale")}</SectionLabel>
      <ScaleSlider
        label={
          <span className="font-mono font-bold" style={{ color: colors.loads }}>
            {t("controls.loads")}
          </span>
        }
        value={opts.scaleLoads}
        min={0.1}
        max={5}
        step={0.05}
        accentColor={colors.loads}
        onChange={(v) => set("scaleLoads", v)}
      />
      {(["N", "Q", "M"] as const).map((d) => {
        const key = `scale${d}` as keyof ViewOptions;
        const color = d === "N" ? colors.tension : d === "Q" ? colors.shear : colors.moment;
        return (
          <ScaleSlider
            key={d}
            label={
              <span className="w-4 font-mono font-bold" style={{ color }}>
                {d}
              </span>
            }
            value={opts[key] as number}
            min={0.1}
            max={3}
            step={0.05}
            accentColor={color}
            onChange={(v) => set(key, v)}
          />
        );
      })}
    </div>
  );
}
