"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PARCIAL_TEORIA_QUESTIONS } from "@/lib/parcialTeoriaData";

const LETTERS = ["A", "B", "C", "D"];

// The questions of the course's theory form, to practise: marking an option
// only records it — there is no answer key, so nothing is graded.
export function ParcialTeoriaView() {
  const { t } = useLanguage();
  const [answers, setAnswers] = useState<(number | null)[]>(
    PARCIAL_TEORIA_QUESTIONS.map(() => null),
  );
  const answered = answers.filter((a) => a !== null).length;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-3 p-4">
      <div className="flex items-center justify-between gap-3">
        <p
          aria-live="polite"
          className="text-sm text-stone-600 dark:text-stone-300"
        >
          {answered} / {PARCIAL_TEORIA_QUESTIONS.length} {t("pt.marked")}
        </p>
        <button
          type="button"
          onClick={() => setAnswers(PARCIAL_TEORIA_QUESTIONS.map(() => null))}
          className="rounded border border-stone-200 bg-stone-100 px-3 py-1.5 text-sm text-stone-800 transition-colors hover:bg-stone-200 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
        >
          {t("pt.reset")}
        </button>
      </div>

      {PARCIAL_TEORIA_QUESTIONS.map((q, i) => (
        <div
          key={i}
          data-testid={`pt-question-${i + 1}`}
          className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900"
        >
          <p className="text-sm text-stone-800 dark:text-stone-100">
            <span className="mr-2 rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-500 dark:bg-stone-800 dark:text-stone-400">
              {i + 1}
            </span>
            {q.statement}
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {q.options.map((label, j) => (
              <button
                key={j}
                type="button"
                aria-pressed={answers[i] === j}
                onClick={() =>
                  setAnswers((prev) => {
                    const next = [...prev];
                    next[i] = next[i] === j ? null : j;
                    return next;
                  })
                }
                className={`w-full rounded border px-3 py-2 text-left text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 motion-reduce:transition-none ${
                  answers[i] === j
                    ? "border-stone-700 bg-stone-100 text-stone-900 dark:border-stone-300 dark:bg-stone-800 dark:text-stone-50"
                    : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
                }`}
              >
                <span className="mr-2 font-semibold">{LETTERS[j]})</span>
                {label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
