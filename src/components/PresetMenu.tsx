'use client';

import React, { useState } from 'react';
import { PRESETS } from '@/lib/presets';
import { FrameModel } from '@/lib/types';

interface Props {
  onLoad: (model: FrameModel) => void;
}

export default function PresetMenu({ onLoad }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="px-3 py-1.5 text-sm bg-stone-200 hover:bg-stone-300 rounded border border-stone-300 transition-colors">
        Examples ▾
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-stone-200 rounded shadow-lg min-w-[200px]">
          {PRESETS.map((p) => (
            <button key={p.name}
              className="w-full text-left px-4 py-2 text-sm hover:bg-stone-100 transition-colors"
              onClick={() => { onLoad(p.model); setOpen(false); }}>
              {p.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
