"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { ParcialView } from "@/components/quiz/ParcialView";

export default function ParcialPage() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <header className="z-10 flex items-center gap-3 border-b border-stone-200 bg-white px-4 py-2 shadow-sm dark:border-stone-700 dark:bg-stone-900">
        <Link
          href="/"
          className="text-sm text-stone-500 transition-colors hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100"
        >
          {t("parcial.back")}
        </Link>
        <span className="text-stone-300 dark:text-stone-600">|</span>
        <h1 className="text-base font-semibold tracking-tight text-stone-800 dark:text-stone-100">
          {t("parcial.title")}
        </h1>
      </header>

      <main className="flex-1 overflow-auto">
        <ParcialView />
      </main>
    </div>
  );
}
