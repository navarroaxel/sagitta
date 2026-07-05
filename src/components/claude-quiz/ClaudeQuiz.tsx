"use client";

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getPrefs, usePrefs } from "@/contexts/PrefsContext";
import {
  ClaudeQuizAnswer,
  ClaudeQuizQuestion,
  ClaudeQuizTopic,
  filterByTopic,
  resultTier,
  scoreClaudeQuiz,
  shuffle,
} from "@/lib/claudeQuiz";
import { CLAUDE_QUIZ_QUESTIONS, CLAUDE_QUIZ_TOPICS } from "@/lib/claudeQuizData";
import { ClaudeQuestionCard } from "./ClaudeQuestionCard";

const ANSWERS_KEY = "sagitta-claude-quiz-answers";

// useLayoutEffect warns during SSR; fall back to useEffect on the server.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

type AnswerMap = Record<string, ClaudeQuizAnswer>;

const EMPTY_ANSWERS: AnswerMap = Object.fromEntries(
  CLAUDE_QUIZ_QUESTIONS.map((q) => [q.id, null]),
);

const TOPICS: (ClaudeQuizTopic | "all")[] = [
  "all",
  ...(Object.keys(CLAUDE_QUIZ_TOPICS) as ClaudeQuizTopic[]),
];

const chipClass = (active: boolean) =>
  `rounded-full border px-3 py-1 text-xs font-medium transition-colors motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 ${
    active
      ? "border-stone-800 bg-stone-800 text-white dark:border-stone-200 dark:bg-stone-200 dark:text-stone-900"
      : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400 dark:hover:bg-stone-800"
  }`;

export function ClaudeQuiz() {
  const { t } = useLanguage();
  const prefs = usePrefs();
  const [order, setOrder] = useState<ClaudeQuizQuestion[]>(CLAUDE_QUIZ_QUESTIONS);
  const [answers, setAnswers] = useState<AnswerMap>(EMPTY_ANSWERS);
  const [topic, setTopic] = useState<ClaudeQuizTopic | "all">("all");
  const [unansweredOnly, setUnansweredOnly] = useState(false);
  // Snapshot of question ids to keep showing while unansweredOnly is on, so
  // a card doesn't vanish out from under the user the instant they answer it.
  const [frozenIds, setFrozenIds] = useState<Set<string> | null>(null);

  // ── "Remember my work" persistence ──────────────────────────────────────
  // Restore is gated behind a post-hydration effect (not a useState
  // initializer) so the prerendered HTML matches the first client render.
  const [loaded, setLoaded] = useState(false);
  useIsomorphicLayoutEffect(() => {
    if (getPrefs().rememberWork) {
      try {
        const saved = localStorage.getItem(ANSWERS_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as AnswerMap;
          setAnswers({ ...EMPTY_ANSWERS, ...parsed });
        }
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
      } else {
        localStorage.removeItem(ANSWERS_KEY);
      }
    } catch {
      /* storage unavailable */
    }
  }, [answers, prefs.rememberWork, loaded]);

  const visible = useMemo(() => {
    const byTopic = filterByTopic(order, topic);
    return unansweredOnly && frozenIds
      ? byTopic.filter((q) => frozenIds.has(q.id))
      : byTopic;
  }, [order, topic, unansweredOnly, frozenIds]);
  const answerArray = useMemo(
    () => CLAUDE_QUIZ_QUESTIONS.map((q) => answers[q.id] ?? null),
    [answers],
  );
  const score = useMemo(
    () => scoreClaudeQuiz(CLAUDE_QUIZ_QUESTIONS, answerArray),
    [answerArray],
  );
  const allAnswered = score.total > 0 && score.answered === score.total;
  const percentage = score.total
    ? Math.round((score.correct / score.total) * 100)
    : 0;
  const tier = resultTier(percentage);

  const handleAnswer = (id: string, value: number) => {
    setAnswers((prev) => (prev[id] !== null ? prev : { ...prev, [id]: value }));
  };

  const handleShuffle = () => setOrder((prev) => shuffle(prev));

  // Snapshot of the currently-unanswered ids for a topic, used to freeze the
  // "unanswered only" view so it doesn't shift while the user is answering.
  const snapshotUnanswered = (tp: ClaudeQuizTopic | "all") =>
    new Set(
      filterByTopic(CLAUDE_QUIZ_QUESTIONS, tp)
        .filter((q) => (answers[q.id] ?? null) === null)
        .map((q) => q.id),
    );

  const handleTopicChange = (tp: ClaudeQuizTopic | "all") => {
    setTopic(tp);
    if (unansweredOnly) setFrozenIds(snapshotUnanswered(tp));
  };

  const handleToggleUnanswered = () => {
    setUnansweredOnly((prev) => {
      const next = !prev;
      setFrozenIds(next ? snapshotUnanswered(topic) : null);
      return next;
    });
  };

  const handleReset = () => {
    setAnswers(EMPTY_ANSWERS);
    setOrder(CLAUDE_QUIZ_QUESTIONS);
    setTopic("all");
    setUnansweredOnly(false);
    setFrozenIds(null);
  };

  const topicCount = (tp: ClaudeQuizTopic | "all") =>
    filterByTopic(CLAUDE_QUIZ_QUESTIONS, tp).length;

  const unansweredInTopic = filterByTopic(CLAUDE_QUIZ_QUESTIONS, topic).filter(
    (q) => (answers[q.id] ?? null) === null,
  ).length;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-3 p-4">
      <div className="flex flex-wrap gap-2">
        {TOPICS.map((tp) => (
          <button
            key={tp}
            type="button"
            aria-pressed={topic === tp}
            onClick={() => handleTopicChange(tp)}
            className={chipClass(topic === tp)}
          >
            {tp === "all" ? t("claudeQuiz.filter.all") : t(`claudeQuiz.topic.${tp}`)}{" "}
            <span className="opacity-60">({topicCount(tp)})</span>
          </button>
        ))}
        <button
          type="button"
          aria-pressed={unansweredOnly}
          onClick={handleToggleUnanswered}
          className={chipClass(unansweredOnly)}
        >
          {t("claudeQuiz.filter.unanswered")}{" "}
          <span className="opacity-60">({unansweredInTopic})</span>
        </button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div
          aria-live="polite"
          className="text-sm text-stone-600 dark:text-stone-300"
        >
          {score.answered} {t("claudeQuiz.answered")} · {score.correct}{" "}
          {t("claudeQuiz.correct")}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleShuffle}
            className="rounded border border-stone-200 bg-stone-100 px-3 py-1.5 text-sm text-stone-800 transition-colors hover:bg-stone-200 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
          >
            {t("claudeQuiz.shuffle")}
          </button>
          <button
            onClick={handleReset}
            className="rounded border border-stone-200 bg-stone-100 px-3 py-1.5 text-sm text-stone-800 transition-colors hover:bg-stone-200 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
          >
            {t("claudeQuiz.reset")}
          </button>
        </div>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
        <div
          className="h-full bg-stone-700 transition-[width] motion-reduce:transition-none dark:bg-stone-300"
          style={{
            width: `${(score.answered / (CLAUDE_QUIZ_QUESTIONS.length || 1)) * 100}%`,
          }}
        />
      </div>

      {visible.length === 0 && (
        <p className="rounded-lg border border-dashed border-stone-300 p-4 text-center text-sm text-stone-500 dark:border-stone-700 dark:text-stone-400">
          {t("claudeQuiz.empty")}
        </p>
      )}

      {visible.map((question) => (
        <ClaudeQuestionCard
          key={question.id}
          question={question}
          index={CLAUDE_QUIZ_QUESTIONS.indexOf(question)}
          answer={answers[question.id] ?? null}
          onAnswer={(value) => handleAnswer(question.id, value)}
        />
      ))}

      {allAnswered && (
        <div
          aria-live="polite"
          className="rounded-lg border border-stone-200 bg-white p-4 text-sm dark:border-stone-700 dark:bg-stone-900"
        >
          <p className="font-semibold text-stone-800 dark:text-stone-100">
            {t("quiz.score")}: {score.correct} / {score.total} ({percentage}%)
          </p>
          <p className="mt-1 text-stone-600 dark:text-stone-300">
            {t(`claudeQuiz.result.${tier}`)}
          </p>
        </div>
      )}
    </div>
  );
}
