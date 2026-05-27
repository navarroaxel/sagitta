'use client';

import React, { useState, useMemo, useRef, useCallback } from 'react';
import FrameCanvas, { ViewOptions } from '@/components/FrameCanvas';
import ModelEditor from '@/components/ModelEditor';
import DiagramControls from '@/components/DiagramControls';
import PresetMenu from '@/components/PresetMenu';
import { FrameModel } from '@/lib/types';
import { solveModel, SolveOutput } from '@/lib/solve';
import { PRESETS } from '@/lib/presets';

const DEFAULT_MODEL: FrameModel = PRESETS[0].model;

const DEFAULT_VIEW: ViewOptions = {
  showN: false,
  showQ: true,
  showM: true,
  showReactions: true,
  showLoads: true,
  showValues: true,
  showGrid: false,
  scaleN: 1,
  scaleQ: 1,
  scaleM: 1,
};

export default function Home() {
  const [model, setModel] = useState<FrameModel>(DEFAULT_MODEL);
  const [viewOpts, setViewOpts] = useState<ViewOptions>(DEFAULT_VIEW);
  const svgRef = useRef<SVGSVGElement>(null);

  const solved = useMemo<SolveOutput | null>(() => {
    try {
      if (model.nodes.length < 2 || model.members.length < 1) return null;
      return solveModel(model);
    } catch (e) {
      console.error('Solver error:', e);
      return null;
    }
  }, [model]);

  const handleNodeMove = useCallback((id: string, x: number, y: number) => {
    setModel((m) => ({
      ...m,
      nodes: m.nodes.map((n) => n.id === id ? { ...n, x, y } : n),
    }));
  }, []);

  const handleExportSVG = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const serializer = new XMLSerializer();
    const source = '<?xml version="1.0" encoding="utf-8"?>\n' + serializer.serializeToString(svg);
    const blob = new Blob([source], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'frame-diagram.svg';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleExportPNG = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = svg.viewBox.baseVal.width * 2;
    canvas.height = svg.viewBox.baseVal.height * 2;
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = 'frame-diagram.png';
      a.click();
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source);
  }, []);

  const hasError = solved && !solved.result.stable;

  return (
    <div className="flex flex-col h-screen bg-stone-50 text-stone-900 overflow-hidden">
      {/* Top toolbar */}
      <header className="flex items-center gap-3 px-4 py-2 bg-white border-b border-stone-200 shadow-sm z-10">
        <h1 className="font-semibold text-base tracking-tight text-stone-800">
          Frame Diagram Simulator
        </h1>
        <div className="flex-1" />
        <PresetMenu onLoad={(m) => { setModel(m); }} />
        <button
          onClick={() => setModel(DEFAULT_MODEL)}
          className="px-3 py-1.5 text-sm bg-stone-100 hover:bg-stone-200 rounded border border-stone-200 transition-colors">
          Reset
        </button>
        <button
          onClick={handleExportSVG}
          className="px-3 py-1.5 text-sm bg-stone-700 hover:bg-stone-800 text-white rounded transition-colors">
          Export SVG
        </button>
        <button
          onClick={handleExportPNG}
          className="px-3 py-1.5 text-sm bg-stone-700 hover:bg-stone-800 text-white rounded transition-colors">
          Export PNG
        </button>
      </header>

      {/* Diagram controls */}
      <DiagramControls opts={viewOpts} onChange={setViewOpts} />

      {/* Error banner */}
      {hasError && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-sm text-red-700 font-medium">
          ⚠ Unstable or singular model — check supports and connectivity. Diagrams cannot be computed.
        </div>
      )}

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: editor panel */}
        <aside className="w-72 flex-shrink-0 border-r border-stone-200 bg-white overflow-auto">
          <ModelEditor model={model} onChange={setModel} />
        </aside>

        {/* Right: canvas */}
        <main className="flex-1 overflow-hidden flex items-center justify-center bg-stone-100 p-2">
          <div className="shadow-sm border border-stone-200 rounded overflow-hidden">
            <FrameCanvas
              model={model}
              solved={solved}
              viewOpts={viewOpts}
              onNodeMove={handleNodeMove}
              svgRef={svgRef}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
