"use client";

import React, { useState } from "react";
import { PRESETS } from "@/lib/presets";
import { FrameModel } from "@/lib/types";
import { useLanguage, TranslationKey } from "@/contexts/LanguageContext";

interface Props {
  onLoad: (model: FrameModel) => void;
}

type Category = "beams" | "frames" | "trusses";

// One entry per preset, ORDERED to match the PRESETS array in presets.ts
// (index i here -> PRESETS[i]). `cat` groups the preset in the dropdown.
const PRESET_META: { key: TranslationKey; cat: Category }[] = [
  { key: "preset.simply_supported", cat: "beams" },
  { key: "preset.cantilever", cat: "beams" },
  { key: "preset.portal_fixed", cat: "frames" },
  { key: "preset.three_hinged", cat: "frames" },
  { key: "preset.two_bay", cat: "frames" },
  { key: "preset.portico_r3", cat: "frames" },
  { key: "preset.l_frame_hinge", cat: "frames" },
  { key: "preset.l_frame_overhang", cat: "frames" },
  { key: "preset.two_column_portal", cat: "frames" },
  { key: "preset.reticulado_r2", cat: "trusses" },
  { key: "preset.symmetric_truss", cat: "trusses" },
  { key: "preset.truss_wall", cat: "trusses" },
  { key: "preset.truss_cantilever", cat: "trusses" },
  { key: "preset.truss_tower", cat: "trusses" },
  { key: "preset.truss_triangular", cat: "trusses" },
  { key: "preset.truss_three_panel", cat: "trusses" },
  { key: "preset.portico_reticulado", cat: "frames" },
  { key: "preset.fixed_beam_hinge_overhang", cat: "beams" },
  { key: "preset.fixed_beam_udl_hinge", cat: "beams" },
  { key: "preset.t_frame_fixed", cat: "frames" },
  { key: "preset.symmetric_two_bay", cat: "frames" },
  { key: "preset.portal_moment", cat: "frames" },
  { key: "preset.z_frame", cat: "frames" },
];

const CATEGORY_ORDER: { cat: Category; titleKey: TranslationKey }[] = [
  { cat: "beams", titleKey: "preset.cat_beams" },
  { cat: "frames", titleKey: "preset.cat_frames" },
  { cat: "trusses", titleKey: "preset.cat_trusses" },
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
        <div className="absolute top-full left-0 z-20 mt-1 max-h-[360px] min-w-[200px] overflow-y-auto rounded border border-stone-200 bg-white shadow-lg dark:border-stone-700 dark:bg-stone-800">
          {CATEGORY_ORDER.map(({ cat, titleKey }) => (
            <div key={cat}>
              <div className="sticky top-0 bg-stone-100 px-4 py-1 text-xs font-semibold tracking-wide text-stone-500 uppercase dark:bg-stone-900 dark:text-stone-400">
                {t(titleKey)}
              </div>
              {PRESET_META.map((meta, i) =>
                meta.cat === cat ? (
                  <button
                    key={PRESETS[i].name}
                    className="w-full px-4 py-2 text-left text-sm text-stone-800 transition-colors hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-700"
                    onClick={() => {
                      onLoad(PRESETS[i].model);
                      setOpen(false);
                    }}
                  >
                    {t(meta.key)}
                  </button>
                ) : null,
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
