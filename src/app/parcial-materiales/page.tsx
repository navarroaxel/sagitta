"use client";

import { ClaudeQuizHeader } from "@/components/claude-quiz/ClaudeQuizHeader";
import { ParcialTeoriaView } from "@/components/quiz/ParcialTeoriaView";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ParcialMaterialesPage() {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <ClaudeQuizHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-6">
        <h1 className="text-xl font-semibold tracking-tight text-stone-800 dark:text-stone-100">
          {t("pt.title")}
        </h1>
        <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
          {t("pt.intro")}
        </p>
      </main>
      <ParcialTeoriaView />
    </div>
  );
}
