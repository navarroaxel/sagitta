'use client';

import React, { useState } from 'react';
import { PRESETS } from '@/lib/presets';
import { FrameModel } from '@/lib/types';
import { useLanguage, TranslationKey } from '@/contexts/LanguageContext';

interface Props {
  onLoad: (model: FrameModel) => void;
}

// Ordered to match PRESETS array in presets.ts
const PRESET_KEYS: TranslationKey[] = [
  'preset.simply_supported',
  'preset.cantilever',
  'preset.portal_fixed',
  'preset.three_hinged',
  'preset.two_bay',
];

export default function PresetMenu({ onLoad }: Props) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="px-3 py-1.5 text-sm bg-stone-200 hover:bg-stone-300 dark:bg-stone-700 dark:hover:bg-stone-600 rounded border border-stone-300 dark:border-stone-600 text-stone-800 dark:text-stone-200 transition-colors">
        {t('preset.examples')}
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-20 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded shadow-lg min-w-[200px]">
          {PRESETS.map((p, i) => (
            <button key={p.name}
              className="w-full text-left px-4 py-2 text-sm text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
              onClick={() => { onLoad(p.model); setOpen(false); }}>
              {t(PRESET_KEYS[i] ?? 'preset.simply_supported')}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
