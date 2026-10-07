"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { ProfileExplorer } from "@/components/ProfileExplorer";
import { TubeExplorer } from "@/components/TubeExplorer";
import type { TranslationKey } from "@/contexts/LanguageContext";

const TABS: { id: "rolled" | "CHS" | "SHS"; key: TranslationKey }[] = [
  { id: "rolled", key: "prof.tab.rolled" },
  { id: "CHS", key: "prof.tab.chs" },
  { id: "SHS", key: "prof.tab.shs" },
];

export default function PerfilesPage() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("rolled");

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <header className="z-10 flex items-center gap-3 border-b border-stone-200 bg-white px-4 py-2 shadow-sm dark:border-stone-700 dark:bg-stone-900">
        <Link
          href="/"
          className="text-sm text-stone-500 transition-colors hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100"
        >
          {t("quiz.back")}
        </Link>
        <span className="text-stone-300 dark:text-stone-600">|</span>
        <h1 className="text-base font-semibold tracking-tight text-stone-800 dark:text-stone-100">
          {t("prof.title")}
        </h1>
      </header>
      <nav
        role="tablist"
        className="flex gap-1 border-b border-stone-200 bg-white px-3 pt-2 dark:border-stone-700 dark:bg-stone-900"
      >
        {TABS.map((x) => (
          <button
            key={x.id}
            type="button"
            role="tab"
            aria-selected={tab === x.id}
            onClick={() => setTab(x.id)}
            className={`rounded-t px-4 py-2 text-sm ${
              tab === x.id
                ? "border border-b-0 border-stone-200 bg-stone-50 font-semibold text-teal-700 dark:border-stone-700 dark:bg-stone-950 dark:text-teal-300"
                : "text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100"
            }`}
          >
            {t(x.key)}
          </button>
        ))}
      </nav>
      <main className="flex-1">
        {tab === "rolled" ? (
          <ProfileExplorer />
        ) : (
          <TubeExplorer key={tab} kind={tab} />
        )}
      </main>
    </div>
  );
}
