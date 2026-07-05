"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { QuizAnswer, QuizQuestion } from "@/lib/quiz";

const segBtn = (active: boolean) =>
  `flex-1 rounded px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed ${
    active
      ? "bg-stone-800 text-white dark:bg-stone-200 dark:text-stone-900"
      : "bg-white text-stone-600 hover:bg-stone-50 dark:bg-stone-900 dark:text-stone-400 dark:hover:bg-stone-800"
  }`;

const statusStyles: Record<string, string> = {
  correct:
    "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950",
  incorrect: "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950",
  unanswered:
    "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950",
};

const badgeStyles: Record<string, string> = {
  correct:
    "bg-green-600 text-white dark:bg-green-500 dark:text-green-950",
  incorrect: "bg-red-600 text-white dark:bg-red-500 dark:text-red-950",
  unanswered: "bg-amber-500 text-white dark:bg-amber-400 dark:text-amber-950",
};

export interface QuestionCardProps {
  question: QuizQuestion;
  index: number;
  answer: QuizAnswer;
  graded: boolean;
  onAnswer: (value: boolean) => void;
}

// Status of this question once the exam is graded, mirroring gradeQuiz's rules.
function statusOf(answer: QuizAnswer, question: QuizQuestion) {
  if (answer === null) return "unanswered" as const;
  return answer === question.answer ? ("correct" as const) : ("incorrect" as const);
}

export function QuestionCard({
  question,
  index,
  answer,
  graded,
  onAnswer,
}: QuestionCardProps) {
  const { t, language } = useLanguage();
  const status = graded ? statusOf(answer, question) : null;

  return (
    <div
      className={`rounded-lg border p-4 transition-colors ${
        status
          ? statusStyles[status]
          : "border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-stone-800 dark:text-stone-100">
          <span className="mr-2 font-mono text-stone-400 dark:text-stone-500">
            {index + 1}.
          </span>
          {question.statement[language]}
        </p>
        {status && (
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${badgeStyles[status]}`}
          >
            {t(`quiz.${status}`)}
          </span>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={graded}
          aria-pressed={answer === true}
          onClick={() => onAnswer(true)}
          className={segBtn(answer === true)}
        >
          {t("quiz.true")}
        </button>
        <button
          type="button"
          disabled={graded}
          aria-pressed={answer === false}
          onClick={() => onAnswer(false)}
          className={segBtn(answer === false)}
        >
          {t("quiz.false")}
        </button>
      </div>

      {graded && (
        <div className="mt-3 border-t border-stone-200 pt-3 text-xs text-stone-600 dark:border-stone-700 dark:text-stone-300">
          <p className="font-medium text-stone-700 dark:text-stone-200">
            {t("quiz.correctAnswer")}{" "}
            {question.answer ? t("quiz.true") : t("quiz.false")}
          </p>
          <p className="mt-1">{question.explanation[language]}</p>
        </div>
      )}
    </div>
  );
}
