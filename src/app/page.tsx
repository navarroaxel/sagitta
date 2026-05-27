'use client';

import React, { useState, useMemo, useRef, useCallback } from 'react';
import FrameCanvas, { ViewOptions } from '@/components/FrameCanvas';
import ModelEditor from '@/components/ModelEditor';
import DiagramControls from '@/components/DiagramControls';
import PresetMenu from '@/components/PresetMenu';
import { ThemeToggle } from '@/components/ThemeToggle';
import { GitHubLink } from '@/components/GitHubLink';
import { Footer } from '@/components/Footer';
import { FrameModel } from '@/lib/types';
import { solveModel, SolveOutput } from '@/lib/solve';
import { PRESETS } from '@/lib/presets';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { t, toggle, language } = useLanguage();
  const [model, setModel] = useState<FrameModel>(DEFAULT_MODEL);
  const [viewOpts, setViewOpts] = useState<ViewOptions>(DEFAULT_VIEW);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [highlightedLoadId, setHighlightedLoadId] = useState<string | null>(null);
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
    <div className="flex flex-col h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 overflow-hidden">
      {/* Top toolbar */}
      <header className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700 shadow-sm z-10">
        <h1 className="font-semibold text-base tracking-tight text-stone-800 dark:text-stone-100">
          {t('app.title')}
        </h1>
        <div className="flex-1" />
        <PresetMenu onLoad={(m) => { setModel(m); }} />
        <button
          onClick={() => setModel(DEFAULT_MODEL)}
          className="px-3 py-1.5 text-sm bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 rounded border border-stone-200 dark:border-stone-600 text-stone-800 dark:text-stone-200 transition-colors">
          {t('app.reset')}
        </button>
        <button
          onClick={handleExportSVG}
          className="px-3 py-1.5 text-sm bg-stone-700 hover:bg-stone-800 dark:bg-stone-600 dark:hover:bg-stone-500 text-white rounded transition-colors">
          {t('app.export_svg')}
        </button>
        <button
          onClick={handleExportPNG}
          className="px-3 py-1.5 text-sm bg-stone-700 hover:bg-stone-800 dark:bg-stone-600 dark:hover:bg-stone-500 text-white rounded transition-colors">
          {t('app.export_png')}
        </button>
        <button
          onClick={toggle}
          aria-label={t('language.switch_aria')}
          className="px-2 py-1 text-xs font-mono bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 rounded border border-stone-200 dark:border-stone-600 text-stone-700 dark:text-stone-200 transition-colors uppercase tracking-wide">
          {language === 'en' ? 'ES' : 'EN'}
        </button>
        <GitHubLink />
        <ThemeToggle />
      </header>

      {/* Diagram controls */}
      <DiagramControls opts={viewOpts} onChange={setViewOpts} />

      {/* Error banner */}
      {hasError && (
        <div className="bg-red-50 dark:bg-red-950 border-b border-red-200 dark:border-red-800 px-4 py-2 text-sm text-red-700 dark:text-red-400 font-medium">
          {t('app.error_unstable')}
        </div>
      )}

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: editor panel */}
        <aside
          className={`flex-shrink-0 border-r border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 overflow-hidden transition-[width] duration-200 ${
            sidebarOpen ? 'w-[345px]' : 'w-0 border-r-transparent'
          }`}
        >
          <div className="w-[345px] h-full overflow-auto">
            <ModelEditor model={model} onChange={setModel}
              highlightedLoadId={highlightedLoadId}
              onHighlightLoad={setHighlightedLoadId} />
          </div>
        </aside>

        {/* Right: canvas */}
        <main className="flex-1 overflow-hidden flex items-center justify-center bg-stone-100 dark:bg-stone-800 p-2">
          <div className="shadow-sm border border-stone-200 dark:border-stone-600 rounded overflow-hidden">
            <FrameCanvas
              model={model}
              solved={solved}
              viewOpts={viewOpts}
              onNodeMove={handleNodeMove}
              svgRef={svgRef}
              highlightedLoadId={highlightedLoadId}
            />
          </div>
        </main>
      </div>

      <Footer />

      {/* Sidebar toggle — fixed, slides with the panel */}
      <button
        onClick={() => setSidebarOpen((v) => !v)}
        title={sidebarOpen ? 'Collapse panel' : 'Expand panel'}
        style={{ left: sidebarOpen ? 345 : 0 }}
        className="fixed top-1/2 -translate-y-1/2 z-50 flex items-center justify-center w-4 h-12 bg-white dark:bg-stone-900 border border-l-0 border-stone-200 dark:border-stone-700 rounded-r shadow-md text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 transition-[left] duration-200 text-xs select-none"
      >
        {sidebarOpen ? '‹' : '›'}
      </button>
    </div>
  );
}
