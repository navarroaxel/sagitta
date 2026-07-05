"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import {
  ClaudeQuizAnswer,
  ClaudeQuizQuestion,
  isCorrectAnswer,
} from "@/lib/claudeQuiz";

export interface ClaudeQuestionCardProps {
  question: ClaudeQuizQuestion;
  index: number;
  answer: ClaudeQuizAnswer;
  onAnswer: (value: number) => void;
}

const OPTION_BASE =
  "w-full rounded px-3 py-2 text-left text-sm transition-colors motion-reduce:transition-none disabled:cursor-not-allowed border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500";

type OptionState = "idle" | "selected-correct" | "selected-wrong" | "reveal-correct" | "muted";

const OPTION_STYLES: Record<OptionState, string> = {
  idle: "border-stone-200 bg-white text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800",
  "selected-correct":
    "border-emerald-400 bg-emerald-50 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-100",
  "selected-wrong":
    "border-red-400 bg-red-50 text-red-900 dark:border-red-700 dark:bg-red-950 dark:text-red-100",
  "reveal-correct":
    "border-emerald-300 bg-emerald-50/60 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200",
  muted:
    "border-stone-200 bg-stone-50 text-stone-400 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-500",
};

export function ClaudeQuestionCard({
  question,
  index,
  answer,
  onAnswer,
}: ClaudeQuestionCardProps) {
  const { t, language } = useLanguage();
  const graded = answer !== null;
  const correct = graded && isCorrectAnswer(question, answer);

  const stateFor = (optionIndex: number): OptionState => {
    if (!graded) return "idle";
    if (optionIndex === question.correct) {
      return optionIndex === answer ? "selected-correct" : "reveal-correct";
    }
    return optionIndex === answer ? "selected-wrong" : "muted";
  };

  return (
    <div
      data-testid={`claude-question-${question.id}`}
      className={`rounded-lg border p-4 transition-colors motion-reduce:transition-none ${
        graded
          ? correct
            ? "border-emerald-300 bg-emerald-50/40 dark:border-emerald-800 dark:bg-emerald-950/20"
            : "border-red-300 bg-red-50/40 dark:border-red-800 dark:bg-red-950/20"
          : "border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900"
      }`}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-stone-100 px-2 py-0.5 font-medium text-stone-500 dark:bg-stone-800 dark:text-stone-400">
          {index + 1}
        </span>
        <span className="rounded-full bg-stone-100 px-2 py-0.5 text-stone-500 dark:bg-stone-800 dark:text-stone-400">
          {t(`claudeQuiz.topic.${question.topic}`)}
        </span>
        <span className="rounded-full bg-stone-100 px-2 py-0.5 text-stone-500 dark:bg-stone-800 dark:text-stone-400">
          {t(`claudeQuiz.type.${question.type}`)}
        </span>
      </div>

      <p className="text-sm text-stone-800 dark:text-stone-100">
        {question.statement[language]}
      </p>

      {question.image && (
        // eslint-disable-next-line @next/next/no-img-element -- static SVG served from /public
        <img
          src={question.image.src}
          alt={question.image.alt[language]}
          className="mt-3 w-full rounded border border-stone-200 bg-white dark:border-stone-700"
        />
      )}

      <div className="mt-3 flex flex-col gap-2">
        {question.options[language].map((label, i) => (
          <button
            key={i}
            type="button"
            disabled={graded}
            aria-pressed={answer === i}
            onClick={() => onAnswer(i)}
            className={`${OPTION_BASE} ${OPTION_STYLES[stateFor(i)]}`}
          >
            {label}
          </button>
        ))}
      </div>

      {graded && (
        <div
          aria-live="polite"
          className="mt-3 border-t border-stone-200 pt-3 text-xs text-stone-600 dark:border-stone-700 dark:text-stone-300"
        >
          <p
            className={`font-medium ${
              correct
                ? "text-emerald-700 dark:text-emerald-400"
                : "text-red-700 dark:text-red-400"
            }`}
          >
            {correct ? t("claudeQuiz.verdict.ok") : t("claudeQuiz.verdict.no")}
          </p>
          <p className="mt-1">{question.explanation[language]}</p>
        </div>
      )}
    </div>
  );
}
