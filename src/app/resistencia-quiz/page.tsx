"use client";

import { ClaudeQuiz } from "@/components/claude-quiz/ClaudeQuiz";
import { ClaudeQuizHeader } from "@/components/claude-quiz/ClaudeQuizHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import type { ClaudeQuizTopic } from "@/lib/claudeQuiz";
import {
  MATERIALS_QUIZ_QUESTIONS,
  MATERIALS_QUIZ_TOPICS,
} from "@/lib/materialsQuizData";

const TOPICS = Object.keys(MATERIALS_QUIZ_TOPICS) as ClaudeQuizTopic[];

export default function ResistenciaQuizPage() {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <ClaudeQuizHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-6">
        <h1 className="text-xl font-semibold tracking-tight text-stone-800 dark:text-stone-100">
          {t("mq.title")}
        </h1>
        <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
          {t("mq.intro")}
        </p>
      </main>
      <ClaudeQuiz
        questions={MATERIALS_QUIZ_QUESTIONS}
        topics={TOPICS}
        storageKey="sagitta-materials-quiz-answers"
        showType={false}
      />
    </div>
  );
}
