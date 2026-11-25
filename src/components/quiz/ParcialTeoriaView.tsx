"use client";

import { useState } from "react";
import { Sub } from "@/components/Sub";
import { useLanguage } from "@/contexts/LanguageContext";
import { PARCIAL_TEORIA_QUESTIONS } from "@/lib/parcialTeoriaData";

const LETTERS = ["A", "B", "C", "D"];

const BASE =
  "w-full rounded border px-3 py-2 text-left text-sm transition-colors motion-reduce:transition-none disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500";
const STYLE = {
  idle: "border-stone-200 bg-white text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800",
  right:
    "border-emerald-400 bg-emerald-50 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-100",
  wrong:
    "border-red-400 bg-red-50 text-red-900 dark:border-red-700 dark:bg-red-950 dark:text-red-100",
  reveal:
    "border-emerald-300 bg-emerald-50/60 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200",
  muted:
    "border-stone-200 bg-stone-50 text-stone-400 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-500",
};

// The questions of the course's theory form, graded at once: the first option
// picked is final (as in the other quizzes) and the right one is revealed with
// the reason. The key is ours (see parcialTeoriaData.ts), not the form's.
export function ParcialTeoriaView() {
  const { t } = useLanguage();
  const [answers, setAnswers] = useState<(number | null)[]>(
    PARCIAL_TEORIA_QUESTIONS.map(() => null),
  );
  const answered = answers.filter((a) => a !== null).length;
  const correct = answers.filter(
    (a, i) => a === PARCIAL_TEORIA_QUESTIONS[i].correct,
  ).length;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-3 p-4">
      <div className="flex items-center justify-between gap-3">
        <p
          aria-live="polite"
          className="text-sm text-stone-600 dark:text-stone-300"
        >
          {answered} / {PARCIAL_TEORIA_QUESTIONS.length} {t("pt.marked")} ·{" "}
          {correct} {t("pt.correct")}
        </p>
        <button
          type="button"
          onClick={() => setAnswers(PARCIAL_TEORIA_QUESTIONS.map(() => null))}
          className="rounded border border-stone-200 bg-stone-100 px-3 py-1.5 text-sm text-stone-800 transition-colors hover:bg-stone-200 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
        >
          {t("pt.reset")}
        </button>
      </div>

      {PARCIAL_TEORIA_QUESTIONS.map((q, i) => {
        const answer = answers[i];
        const graded = answer !== null;
        const ok = answer === q.correct;
        return (
          <div
            key={i}
            data-testid={`pt-question-${i + 1}`}
            className={`rounded-lg border p-4 ${
              graded
                ? ok
                  ? "border-emerald-300 bg-emerald-50/40 dark:border-emerald-800 dark:bg-emerald-950/20"
                  : "border-red-300 bg-red-50/40 dark:border-red-800 dark:bg-red-950/20"
                : "border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900"
            }`}
          >
            <p className="text-sm text-stone-800 dark:text-stone-100">
              <span className="mr-2 rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-500 dark:bg-stone-800 dark:text-stone-400">
                {i + 1}
              </span>
              {q.statement}
            </p>
            <div className="mt-3 flex flex-col gap-2">
              {q.options.map((label, j) => {
                const state = !graded
                  ? "idle"
                  : j === q.correct
                    ? j === answer
                      ? "right"
                      : "reveal"
                    : j === answer
                      ? "wrong"
                      : "muted";
                return (
                  <button
                    key={j}
                    type="button"
                    disabled={graded}
                    aria-pressed={answer === j}
                    onClick={() =>
                      setAnswers((prev) => {
                        if (prev[i] !== null) return prev;
                        const next = [...prev];
                        next[i] = j;
                        return next;
                      })
                    }
                    className={`${BASE} ${STYLE[state]}`}
                  >
                    <span className="mr-2 font-semibold">{LETTERS[j]})</span>
                    {label}
                  </button>
                );
              })}
            </div>
            {graded && (
              <div
                aria-live="polite"
                className="mt-3 border-t border-stone-200 pt-3 text-xs text-stone-600 dark:border-stone-700 dark:text-stone-300"
              >
                <p
                  className={`font-medium ${
                    ok
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-red-700 dark:text-red-400"
                  }`}
                >
                  {ok ? t("claudeQuiz.verdict.ok") : t("claudeQuiz.verdict.no")}
                </p>
                <p className="mt-1">
                  <Sub>{q.explanation}</Sub>
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
