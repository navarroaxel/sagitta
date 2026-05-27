'use client';

import React from 'react';
import { ViewOptions } from './FrameCanvas';

interface Props {
  opts: ViewOptions;
  onChange: (opts: ViewOptions) => void;
}

export default function DiagramControls({ opts, onChange }: Props) {
  const set = <K extends keyof ViewOptions>(k: K, v: ViewOptions[K]) =>
    onChange({ ...opts, [k]: v });

  const toggle = (k: keyof ViewOptions) =>
    onChange({ ...opts, [k]: !opts[k] });

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2 bg-stone-100 border-b border-stone-200 text-sm">
      {/* Diagram toggles */}
      <span className="font-semibold text-stone-600 text-xs">Show:</span>
      {(['N', 'Q', 'M'] as const).map((d) => {
        const key = `show${d}` as keyof ViewOptions;
        const color = d === 'N' ? 'text-teal-700' : d === 'Q' ? 'text-blue-700' : 'text-violet-700';
        return (
          <label key={d} className={`flex items-center gap-1 cursor-pointer font-mono font-bold ${color}`}>
            <input type="checkbox" checked={opts[key] as boolean}
              onChange={() => toggle(key)} className="accent-current" />
            {d}
          </label>
        );
      })}
      <span className="w-px h-4 bg-stone-300" />
      <label className="flex items-center gap-1 cursor-pointer text-stone-600">
        <input type="checkbox" checked={opts.showReactions} onChange={() => toggle('showReactions')} />
        Reactions
      </label>
      <label className="flex items-center gap-1 cursor-pointer text-stone-600">
        <input type="checkbox" checked={opts.showLoads} onChange={() => toggle('showLoads')} />
        Loads
      </label>
      <label className="flex items-center gap-1 cursor-pointer text-stone-600">
        <input type="checkbox" checked={opts.showValues} onChange={() => toggle('showValues')} />
        Values
      </label>
      <label className="flex items-center gap-1 cursor-pointer text-stone-600">
        <input type="checkbox" checked={opts.showGrid} onChange={() => toggle('showGrid')} />
        Grid
      </label>

      <span className="w-px h-4 bg-stone-300" />

      {/* Scale sliders */}
      <span className="font-semibold text-stone-600 text-xs">Scale:</span>
      {(['N', 'Q', 'M'] as const).map((d) => {
        const key = `scale${d}` as keyof ViewOptions;
        const color = d === 'N' ? 'accent-teal-700' : d === 'Q' ? 'accent-blue-700' : 'accent-violet-700';
        return (
          <label key={d} className="flex items-center gap-1 text-stone-600">
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
