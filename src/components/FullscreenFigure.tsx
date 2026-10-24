"use client";

import React, { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

// Wraps a figure (an SVG) with a full-screen toggle in its top-right corner. Uses the browser's
// Fullscreen API on the wrapper, so Esc exits and the figure scales to the screen (see globals.css).
export default function FullscreenFigure({
  children,
  testId,
  controls,
}: {
  children: React.ReactNode;
  testId?: string;
  controls?: React.ReactNode; // rendered inside the figure only while it is full screen
}) {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const [fs, setFs] = useState(false);

  useEffect(() => {
    const sync = () => setFs(document.fullscreenElement === ref.current);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  const toggle = () => {
    const el = ref.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen?.();
    else void el.requestFullscreen?.();
  };

  const label = fs ? t("f3d.fullscreen.exit") : t("f3d.fullscreen.enter");
  return (
    <div ref={ref} data-testid={testId} className={`fs-figure relative ${controls ? "fs-has-controls" : ""}`}>
      <button
        type="button"
        aria-label={label}
        title={label}
        className="absolute top-1 right-1 z-10 flex h-7 w-7 items-center justify-center rounded border border-stone-300 bg-white/90 text-stone-600 hover:bg-stone-200 hover:text-stone-900 dark:border-stone-600 dark:bg-stone-900/90 dark:text-stone-300 dark:hover:bg-stone-700"
        onClick={toggle}
      >
        <svg className="fs-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
          {fs ? (
            <path d="M5 1v4H1M9 1v4h4M5 13V9H1M9 13V9h4" />
          ) : (
            <path d="M1 5V1h4M13 5V1H9M1 9v4h4M13 9v4H9" />
          )}
        </svg>
      </button>
      {children}
      {fs && controls && (
        <div className="fixed inset-x-0 bottom-0 z-10 flex justify-center p-3">
          <div className="w-full max-w-3xl rounded border border-stone-300 bg-white/95 px-4 py-2 text-stone-900 shadow-lg dark:border-stone-600 dark:bg-stone-900/95 dark:text-stone-100">
            {controls}
          </div>
        </div>
      )}
    </div>
  );
}
