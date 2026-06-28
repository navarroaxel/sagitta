"use client";

import React, { useState, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import FrameCanvas, { ViewOptions } from "@/components/FrameCanvas";
import ModelEditor from "@/components/ModelEditor";
import DiagramControls from "@/components/DiagramControls";
import PresetMenu from "@/components/PresetMenu";
import { SettingsPanel } from "@/components/SettingsPanel";
import { GitHubLink } from "@/components/GitHubLink";
import { Footer } from "@/components/Footer";
import { FrameModel } from "@/lib/types";
import { solveModel, SolveOutput } from "@/lib/solve";
import { PRESETS } from "@/lib/presets";
import { useLanguage } from "@/contexts/LanguageContext";

const DEFAULT_MODEL: FrameModel = PRESETS[0].model;

const DEFAULT_VIEW: ViewOptions = {
  showN: false,
  showQ: true,
  showM: true,
  showReactions: true,
  showLoads: true,
  showValues: true,
  showGrid: false,
  showMemberLabels: false,
  scaleN: 1,
  scaleQ: 1,
  scaleM: 1,
  scaleLoads: 1,
};

export default function Home() {
  const { t } = useLanguage();
  const [model, setModel] = useState<FrameModel>(DEFAULT_MODEL);
  const [viewOpts, setViewOpts] = useState<ViewOptions>(DEFAULT_VIEW);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [highlightedLoadId, setHighlightedLoadId] = useState<string | null>(
    null,
  );
  const svgRef = useRef<SVGSVGElement>(null);

  const solved = useMemo<SolveOutput | null>(() => {
    try {
      if (model.nodes.length < 2 || model.members.length < 1) return null;
      return solveModel(model);
    } catch (e) {
      console.error("Solver error:", e);
      return null;
    }
  }, [model]);

  const handleNodeMove = useCallback((id: string, x: number, y: number) => {
    setModel((m) => ({
      ...m,
      nodes: m.nodes.map((n) => (n.id === id ? { ...n, x, y } : n)),
    }));
  }, []);

  const handleExportSVG = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const serializer = new XMLSerializer();
    const source =
      '<?xml version="1.0" encoding="utf-8"?>\n' +
      serializer.serializeToString(svg);
    const blob = new Blob([source], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "frame-diagram.svg";
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleExportPNG = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = svg.viewBox.baseVal.width * 2;
    canvas.height = svg.viewBox.baseVal.height * 2;
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = "frame-diagram.png";
      a.click();
    };
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
  }, []);

  const hasError = solved && !solved.result.stable;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      {/* Top toolbar */}
      <header className="z-10 flex items-center gap-3 border-b border-stone-200 bg-white px-4 py-2 shadow-sm dark:border-stone-700 dark:bg-stone-900">
        <h1 className="text-base font-semibold tracking-tight text-stone-800 dark:text-stone-100">
          {t("app.title")}
        </h1>
        <Link
          href="/learn"
          className="text-xs text-stone-400 transition-colors hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
        >
          {t("learn.link")}
        </Link>
        <div className="flex-1" />
        <PresetMenu
          onLoad={(m) => {
            setModel(m);
          }}
        />
        <button
          onClick={() => setModel(DEFAULT_MODEL)}
          className="rounded border border-stone-200 bg-stone-100 px-3 py-1.5 text-sm text-stone-800 transition-colors hover:bg-stone-200 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
        >
          {t("app.reset")}
        </button>
        <button
          onClick={handleExportSVG}
          className="rounded bg-stone-700 px-3 py-1.5 text-sm text-white transition-colors hover:bg-stone-800 dark:bg-stone-600 dark:hover:bg-stone-500"
        >
          {t("app.export_svg")}
        </button>
        <button
          onClick={handleExportPNG}
          className="rounded bg-stone-700 px-3 py-1.5 text-sm text-white transition-colors hover:bg-stone-800 dark:bg-stone-600 dark:hover:bg-stone-500"
        >
          {t("app.export_png")}
        </button>
        <GitHubLink />
        <SettingsPanel />
      </header>

      {/* Diagram controls */}
      <DiagramControls opts={viewOpts} onChange={setViewOpts} />

      {/* Error banner */}
      {hasError && (
        <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          {t("app.error_unstable")}
        </div>
      )}

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: editor panel */}
        <aside
          className={`flex-shrink-0 overflow-hidden border-r border-stone-200 bg-white transition-[width] duration-200 dark:border-stone-700 dark:bg-stone-900 ${
            sidebarOpen ? "w-[345px]" : "w-0 border-r-transparent"
          }`}
        >
          <div className="h-full w-[345px] overflow-auto">
            <ModelEditor
              model={model}
              onChange={setModel}
              solved={solved}
              highlightedLoadId={highlightedLoadId}
              onHighlightLoad={setHighlightedLoadId}
            />
          </div>
        </aside>

        {/* Right: canvas */}
        <main className="flex flex-1 items-center justify-center overflow-hidden bg-stone-100 p-2 dark:bg-stone-800">
          <div className="overflow-hidden rounded border border-stone-200 shadow-sm dark:border-stone-600">
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
        title={sidebarOpen ? "Collapse panel" : "Expand panel"}
        style={{ left: sidebarOpen ? 345 : 0 }}
        className="fixed top-1/2 z-50 flex h-12 w-4 -translate-y-1/2 items-center justify-center rounded-r border border-l-0 border-stone-200 bg-white text-xs text-stone-400 shadow-md transition-[left] duration-200 select-none hover:bg-stone-50 hover:text-stone-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-500 dark:hover:bg-stone-800 dark:hover:text-stone-200"
      >
        {sidebarOpen ? "‹" : "›"}
      </button>
    </div>
  );
}
