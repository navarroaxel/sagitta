"use client";

import React, {
  useState,
  useMemo,
  useRef,
  useCallback,
  useEffect,
  useLayoutEffect,
} from "react";
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
import { PRESETS, presetSlug, findPresetBySlug } from "@/lib/presets";
import { encodeModel, decodeModel } from "@/lib/share";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePrefs, getPrefs } from "@/contexts/PrefsContext";

const MODEL_KEY = "sagitta-model";
const VIEW_KEY = "sagitta-view";

// useLayoutEffect warns during SSR; fall back to useEffect on the server.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

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
  const prefs = usePrefs();
  const [model, setModel] = useState<FrameModel>(DEFAULT_MODEL);
  const [viewOpts, setViewOpts] = useState<ViewOptions>(DEFAULT_VIEW);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [highlightedLoadId, setHighlightedLoadId] = useState<string | null>(
    null,
  );
  const svgRef = useRef<SVGSVGElement>(null);
  const [shareCopied, setShareCopied] = useState(false);

  // ── "Remember my work" persistence + shared-link restore ────────────────
  // Restore is gated behind a post-hydration effect (not a useState
  // initializer) so the prerendered HTML matches the first client render.
  const [loaded, setLoaded] = useState(false);
  useIsomorphicLayoutEffect(() => {
    // A shared link (?preset=<slug> or ?model=<base64url>) takes precedence
    // over remembered work; strip it from the address bar once applied.
    try {
      const params = new URLSearchParams(window.location.search);
      const modelParam = params.get("model");
      const presetParam = params.get("preset");
      const shared = modelParam
        ? decodeModel(modelParam)
        : presetParam
          ? (findPresetBySlug(presetParam)?.model ?? null)
          : null;
      if (shared) {
        setModel(shared);
        window.history.replaceState(null, "", window.location.pathname);
        setLoaded(true);
        return;
      }
    } catch {
      /* malformed URL — fall through to the normal restore */
    }
    if (getPrefs().rememberWork) {
      try {
        const savedModel = localStorage.getItem(MODEL_KEY);
        if (savedModel) {
          const m = JSON.parse(savedModel) as FrameModel;
          if (m?.nodes && m?.members) setModel(m);
        }
        const savedView = localStorage.getItem(VIEW_KEY);
        if (savedView) {
          setViewOpts({
            ...DEFAULT_VIEW,
            ...(JSON.parse(savedView) as Partial<ViewOptions>),
          });
        }
      } catch {
        /* ignore a corrupt cache */
      }
    }
    setLoaded(true);
  }, []);

  // Save (or clear) the working state as it changes / the preference toggles.
  useEffect(() => {
    if (!loaded) return;
    try {
      if (prefs.rememberWork) {
        localStorage.setItem(MODEL_KEY, JSON.stringify(model));
        localStorage.setItem(VIEW_KEY, JSON.stringify(viewOpts));
      } else {
        localStorage.removeItem(MODEL_KEY);
        localStorage.removeItem(VIEW_KEY);
      }
    } catch {
      /* storage unavailable */
    }
  }, [model, viewOpts, prefs.rememberWork, loaded]);

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

  const handleShare = useCallback(async () => {
    const url = new URL(window.location.origin + window.location.pathname);
    // A pristine preset (loaded, not edited) is still the same object reference,
    // so we can share the short ?preset= form; otherwise encode the full model.
    const preset = PRESETS.find((p) => p.model === model);
    if (preset) url.searchParams.set("preset", presetSlug(preset.name));
    else url.searchParams.set("model", encodeModel(model));
    const link = url.toString();
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      window.prompt("", link); // clipboard blocked — let the user copy manually
    }
    setShareCopied(true);
    window.setTimeout(() => setShareCopied(false), 1800);
  }, [model]);

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
        <Link
          href="/esfuerzos-caracteristicos"
          className="text-xs text-stone-400 transition-colors hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
        >
          {t("esf.link")}
        </Link>
        <Link
          href="/quiz"
          className="text-xs text-stone-400 transition-colors hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
        >
          {t("quiz.link")}
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
        <button
          onClick={handleShare}
          aria-label={t("app.share")}
          title={shareCopied ? t("app.share_copied") : t("app.share_title")}
          className="flex items-center justify-center rounded bg-sky-700 px-2.5 py-1.5 text-white transition-colors hover:bg-sky-800 dark:bg-sky-600 dark:hover:bg-sky-500"
        >
          {shareCopied ? (
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          )}
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
