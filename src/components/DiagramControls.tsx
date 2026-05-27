'use client';

import React from 'react';
import { ViewOptions } from './FrameCanvas';
import { useLanguage } from '@/contexts/LanguageContext';

interface Props {
  opts: ViewOptions;
  onChange: (opts: ViewOptions) => void;
}

export default function DiagramControls({ opts, onChange }: Props) {
  const { t } = useLanguage();

  const set = <K extends keyof ViewOptions>(k: K, v: ViewOptions[K]) =>
    onChange({ ...opts, [k]: v });

  const toggle = (k: keyof ViewOptions) =>
    onChange({ ...opts, [k]: !opts[k] });

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2 bg-stone-100 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 text-sm">
      {/* Diagram toggles */}
      <span className="font-semibold text-stone-600 dark:text-stone-300 text-xs">{t('controls.show')}</span>
      {(['N', 'Q', 'M'] as const).map((d) => {
        const key = `show${d}` as keyof ViewOptions;
        const color = d === 'N' ? 'text-teal-700 dark:text-teal-400' : d === 'Q' ? 'text-blue-700 dark:text-blue-400' : 'text-violet-700 dark:text-violet-400';
        return (
          <label key={d} className={`flex items-center gap-1 cursor-pointer font-mono font-bold ${color}`}>
            <input type="checkbox" checked={opts[key] as boolean}
              onChange={() => toggle(key)} className="accent-current" />
            {d}
          </label>
        );
      })}
      <span className="w-px h-4 bg-stone-300 dark:bg-stone-600" />
      <label className="flex items-center gap-1 cursor-pointer text-stone-600 dark:text-stone-300">
        <input type="checkbox" checked={opts.showReactions} onChange={() => toggle('showReactions')} />
        {t('controls.reactions')}
      </label>
      <label className="flex items-center gap-1 cursor-pointer text-stone-600 dark:text-stone-300">
        <input type="checkbox" checked={opts.showLoads} onChange={() => toggle('showLoads')} />
        {t('controls.loads')}
      </label>
      <label className="flex items-center gap-1 cursor-pointer text-stone-600 dark:text-stone-300">
        <input type="checkbox" checked={opts.showValues} onChange={() => toggle('showValues')} />
        {t('controls.values')}
      </label>
      <label className="flex items-center gap-1 cursor-pointer text-stone-600 dark:text-stone-300">
        <input type="checkbox" checked={opts.showGrid} onChange={() => toggle('showGrid')} />
        {t('controls.grid')}
      </label>

      <span className="w-px h-4 bg-stone-300 dark:bg-stone-600" />

      {/* Scale sliders */}
      <span className="font-semibold text-stone-600 dark:text-stone-300 text-xs">{t('controls.scale')}</span>
      {(['N', 'Q', 'M'] as const).map((d) => {
        const key = `scale${d}` as keyof ViewOptions;
        const color = d === 'N' ? 'accent-teal-700' : d === 'Q' ? 'accent-blue-700' : 'accent-violet-700';
        return (
          <label key={d} className="flex items-center gap-1 text-stone-600 dark:text-stone-300">
            <span className="font-mono font-bold w-4">{d}</span>
            <input type="range" min={0.1} max={3} step={0.05}
              value={opts[key] as number}
              onChange={(e) => set(key, parseFloat(e.target.value))}
              className={`w-20 ${color}`} />
            <span className="w-8 text-right font-mono text-xs">{(opts[key] as number).toFixed(2)}</span>
          </label>
        );
      })}
    </div>
  );
}
