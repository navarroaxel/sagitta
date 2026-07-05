"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export interface ScoreBarProps {
  correct: number;
  total: number;
}

export function ScoreBar({ correct, total }: ScoreBarProps) {
  const { t } = useLanguage();
  return (
    <div className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-800 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100">
      {t("quiz.score")}: {correct} / {total}
    </div>
  );
}
