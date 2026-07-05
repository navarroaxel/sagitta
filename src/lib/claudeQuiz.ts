// Pure logic for the "Estabilidad" theory quiz (True/False + multiple choice).
// Kept free of React so it can be unit-tested in isolation.

export type ClaudeQuizTopic = "fuerzas" | "vinculos" | "cadenas" | "reticulados";

export type ClaudeQuizType = "vf" | "mc";

export interface ClaudeQuizQuestion {
  id: string;
  topic: ClaudeQuizTopic;
  type: ClaudeQuizType;
  statement: { en: string; es: string };
  /** Optional figure (e.g. a truss or beam diagram) shown above the statement. */
  image?: { src: string; alt: { en: string; es: string } };
  options: { en: string[]; es: string[] };
  correct: number;
  explanation: { en: string; es: string };
}

export type ClaudeQuizAnswer = number | null;

export interface ClaudeQuizScore {
  answered: number;
  correct: number;
  total: number;
}

export type ResultTier = "great" | "ok" | "low";

// True when the given answer index matches the question's correct option.
export function isCorrectAnswer(
  question: ClaudeQuizQuestion,
  answer: ClaudeQuizAnswer,
): boolean {
  return answer !== null && answer === question.correct;
}

// Tally of answered/correct/total across a question set and its answers.
export function scoreClaudeQuiz(
  questions: ClaudeQuizQuestion[],
  answers: ClaudeQuizAnswer[],
): ClaudeQuizScore {
  let answered = 0;
  let correct = 0;
  questions.forEach((question, i) => {
    const answer = answers[i] ?? null;
    if (answer !== null) answered++;
    if (isCorrectAnswer(question, answer)) correct++;
  });
  return { answered, correct, total: questions.length };
}

// Questions matching the given topic, or every question when topic is "all".
export function filterByTopic(
  questions: ClaudeQuizQuestion[],
  topic: ClaudeQuizTopic | "all",
): ClaudeQuizQuestion[] {
  return topic === "all"
    ? questions
    : questions.filter((question) => question.topic === topic);
}

// Fisher–Yates shuffle. Does not mutate `items`; `rng` is injectable for
// deterministic tests (defaults to Math.random).
export function shuffle<T>(items: T[], rng: () => number = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Overall verdict tier from a percentage score (0-100).
export function resultTier(percentage: number): ResultTier {
  if (percentage >= 85) return "great";
  if (percentage >= 60) return "ok";
  return "low";
}
