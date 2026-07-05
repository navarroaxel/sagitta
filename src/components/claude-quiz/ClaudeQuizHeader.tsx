"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export function ClaudeQuizHeader() {
  const { t } = useLanguage();
  return (
    <header className="z-10 flex items-center gap-3 border-b border-stone-200 bg-white px-4 py-2 shadow-sm dark:border-stone-700 dark:bg-stone-900">
      <Link
        href="/"
        className="text-sm text-stone-500 transition-colors hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100"
      >
        {t("quiz.back")}
      </Link>
      <span className="text-stone-300 dark:text-stone-600">|</span>
      <Link
        href="/quiz"
        className="text-sm text-stone-500 transition-colors hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100"
      >
        {t("claudeQuiz.back")}
      </Link>
    </header>
  );
}
