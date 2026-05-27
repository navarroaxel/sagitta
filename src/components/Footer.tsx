"use client";

import { useLanguage } from "@/contexts/LanguageContext";

const RELATED = [
  {
    href: "https://relax-method-viz.vercel.app",
    teaserKey: "footer.relax_teaser" as const,
  },
  {
    href: "https://kinelab-theta.vercel.app",
    teaserKey: "footer.kinelab_teaser" as const,
  },
  {
    href: "https://resonara-phi.vercel.app",
    teaserKey: "footer.resonara_teaser" as const,
  },
];

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-4 py-2 text-xs text-stone-500 dark:text-stone-400 shrink-0">
      <span className="shrink-0">{t("footer.description")}</span>
      <span className="shrink-0 font-medium text-stone-400 dark:text-stone-500">
        {t("footer.also")}
      </span>
      <div className="flex flex-wrap gap-2">
        {RELATED.map(({ href, teaserKey }) => (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 px-2 py-0.5 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 hover:text-stone-800 dark:hover:text-stone-100 transition-colors"
          >
            {t(teaserKey)}
            <svg
              aria-hidden
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="size-2.5 opacity-50"
            >
              <path d="M2.5 9.5 9.5 2.5M5 2.5h4.5v4.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        ))}
      </div>
    </footer>
  );
}
