"use client";

import React, { useState } from "react";
import { PRESETS } from "@/lib/presets";
import { FrameModel } from "@/lib/types";
import { useLanguage, TranslationKey } from "@/contexts/LanguageContext";

interface Props {
  onLoad: (model: FrameModel) => void;
}

// Ordered to match PRESETS array in presets.ts
const PRESET_KEYS: TranslationKey[] = [
  "preset.simply_supported",
  "preset.cantilever",
  "preset.portal_fixed",
  "preset.three_hinged",
  "preset.two_bay",
  "preset.portico_reticulado",
];

export default function PresetMenu({ onLoad }: Props) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded border border-stone-300 bg-stone-200 px-3 py-1.5 text-sm text-stone-800 transition-colors hover:bg-stone-300 dark:border-stone-600 dark:bg-stone-700 dark:text-stone-200 dark:hover:bg-stone-600"
      >
        {t("preset.examples")}
      </button>
      {open && (
        <div className="absolute top-full left-0 z-20 mt-1 min-w-[200px] rounded border border-stone-200 bg-white shadow-lg dark:border-stone-700 dark:bg-stone-800">
          {PRESETS.map((p, i) => (
            <button
              key={p.name}
              className="w-full px-4 py-2 text-left text-sm text-stone-800 transition-colors hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-700"
              onClick={() => {
                onLoad(p.model);
                setOpen(false);
              }}
            >
              {t(PRESET_KEYS[i] ?? "preset.simply_supported")}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
