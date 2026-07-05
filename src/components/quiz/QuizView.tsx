"use client";

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { getPrefs, usePrefs } from "@/contexts/PrefsContext";
import { gradeQuiz, QuizAnswer } from "@/lib/quiz";
import { quizQuestions } from "@/lib/quizData";
import { QuestionCard } from "./QuestionCard";
import { ScoreBar } from "./ScoreBar";

const ANSWERS_KEY = "sagitta-quiz-answers";
const GRADED_KEY = "sagitta-quiz-graded";

const EMPTY_ANSWERS: QuizAnswer[] = quizQuestions.map(() => null);

// useLayoutEffect warns during SSR; fall back to useEffect on the server.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function QuizView() {
  const { t } = useLanguage();
  const prefs = usePrefs();
  const [answers, setAnswers] = useState<QuizAnswer[]>(EMPTY_ANSWERS);
  const [graded, setGraded] = useState(false);

  // ── "Remember my work" persistence ──────────────────────────────────────
  // Restore is gated behind a post-hydration effect (not a useState
  // initializer) so the prerendered HTML matches the first client render.
  const [loaded, setLoaded] = useState(false);
  useIsomorphicLayoutEffect(() => {
    if (getPrefs().rememberWork) {
      try {
        const savedAnswers = localStorage.getItem(ANSWERS_KEY);
        if (savedAnswers) {
          const a = JSON.parse(savedAnswers) as QuizAnswer[];
          if (Array.isArray(a) && a.length === quizQuestions.length) {
            setAnswers(a);
          }
        }
        const savedGraded = localStorage.getItem(GRADED_KEY);
        if (savedGraded) setGraded(JSON.parse(savedGraded) as boolean);
      } catch {
        /* ignore a corrupt cache */
      }
    }
    setLoaded(true);
  }, []);

  // Save (or clear) the working state as it changes / the preference toggles.
  useEffect(() => {
    if (!loaded) return;
    try {
      if (prefs.rememberWork) {
        localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
        localStorage.setItem(GRADED_KEY, JSON.stringify(graded));
      } else {
        localStorage.removeItem(ANSWERS_KEY);
        localStorage.removeItem(GRADED_KEY);
      }
    } catch {
      /* storage unavailable */
    }
  }, [answers, graded, prefs.rememberWork, loaded]);

  const result = useMemo(
    () => gradeQuiz(answers, quizQuestions),
    [answers],
  );

  const handleAnswer = (index: number, value: boolean) => {
    if (graded) return;
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleReset = () => {
    setAnswers(EMPTY_ANSWERS);
    setGraded(false);
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-3 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => setGraded(true)}
            disabled={graded}
            className="rounded bg-stone-700 px-3 py-1.5 text-sm text-white transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-stone-600 dark:hover:bg-stone-500"
          >
            {t("quiz.check")}
          </button>
          <button
            onClick={handleReset}
            className="rounded border border-stone-200 bg-stone-100 px-3 py-1.5 text-sm text-stone-800 transition-colors hover:bg-stone-200 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
          >
            {t("quiz.reset")}
          </button>
        </div>
        {graded && <ScoreBar correct={result.correct} total={result.total} />}
      </div>

      {quizQuestions.map((question, i) => (
        <QuestionCard
          key={question.id}
          question={question}
          index={i}
          answer={answers[i]}
          graded={graded}
          onAnswer={(value) => handleAnswer(i, value)}
        />
      ))}

      <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
        <p className="text-xs font-semibold tracking-wide text-stone-400 uppercase dark:text-stone-500">
          {t("quiz.more.title")}
        </p>
        <Link
          href="/claude-quiz"
          className="mt-1 block text-sm text-stone-700 underline decoration-stone-300 underline-offset-2 transition-colors hover:text-stone-900 dark:text-stone-200 dark:decoration-stone-600 dark:hover:text-stone-50"
        >
          {t("quiz.more.claude")}
        </Link>
      </div>
    </div>
  );
}
