import {
  ClaudeQuizAnswer,
  ClaudeQuizQuestion,
  ClaudeQuizTopic,
  filterByTopic,
  isCorrectAnswer,
  resultTier,
  scoreClaudeQuiz,
  shuffle,
} from "../claudeQuiz";
import { CLAUDE_QUIZ_QUESTIONS, CLAUDE_QUIZ_TOPICS } from "../claudeQuizData";

function q(
  id: string,
  topic: ClaudeQuizTopic,
  correct: number,
  numOptions = 2,
): ClaudeQuizQuestion {
  return {
    id,
    topic,
    type: numOptions > 2 ? "mc" : "vf",
    statement: { en: `statement ${id}`, es: `enunciado ${id}` },
    options: {
      en: Array.from({ length: numOptions }, (_, i) => `opt-en-${i}`),
      es: Array.from({ length: numOptions }, (_, i) => `opt-es-${i}`),
    },
    correct,
    explanation: { en: `explanation ${id}`, es: `explicación ${id}` },
  };
}

// ─── isCorrectAnswer(): matches the question's correct index ──────────────
describe("isCorrectAnswer", () => {
  const question = q("x1", "fuerzas", 1);

  test("true when the answer matches the correct index", () => {
    expect(isCorrectAnswer(question, 1)).toBe(true);
  });
  test("false for a different index", () => {
    expect(isCorrectAnswer(question, 0)).toBe(false);
  });
  test("false for null (unanswered)", () => {
    expect(isCorrectAnswer(question, null)).toBe(false);
  });
});

// ─── scoreClaudeQuiz(): answered/correct/total tally ───────────────────────
describe("scoreClaudeQuiz", () => {
  const questions = [
    q("s1", "fuerzas", 0),
    q("s2", "vinculos", 1),
    q("s3", "cadenas", 0),
  ];

  test("all correct", () => {
    const answers: ClaudeQuizAnswer[] = [0, 1, 0];
    expect(scoreClaudeQuiz(questions, answers)).toEqual({
      answered: 3,
      correct: 3,
      total: 3,
    });
  });

  test("mixed answered/unanswered/wrong", () => {
    const answers: ClaudeQuizAnswer[] = [0, 0, null];
    expect(scoreClaudeQuiz(questions, answers)).toEqual({
      answered: 2,
      correct: 1,
      total: 3,
    });
  });

  test("none answered", () => {
    const answers: ClaudeQuizAnswer[] = [null, null, null];
    expect(scoreClaudeQuiz(questions, answers)).toEqual({
      answered: 0,
      correct: 0,
      total: 3,
    });
  });
});

// ─── filterByTopic(): "all" passes through, else exact topic match ────────
describe("filterByTopic", () => {
  const questions = [
    q("t1", "fuerzas", 0),
    q("t2", "vinculos", 0),
    q("t3", "fuerzas", 0),
  ];

  test('"all" returns every question', () => {
    expect(filterByTopic(questions, "all")).toEqual(questions);
  });

  test("a specific topic returns only matching questions", () => {
    expect(filterByTopic(questions, "fuerzas")).toEqual([questions[0], questions[2]]);
  });

  test("a topic with no matches returns an empty array", () => {
    expect(filterByTopic(questions, "reticulados")).toEqual([]);
  });
});

// ─── shuffle(): permutes without mutating the input, rng is injectable ────
describe("shuffle", () => {
  test("does not mutate the original array", () => {
    const original = [1, 2, 3, 4];
    const copy = [...original];
    shuffle(original);
    expect(original).toEqual(copy);
  });

  test("returns the same elements (a permutation)", () => {
    const result = shuffle([1, 2, 3, 4, 5]);
    expect(result.slice().sort()).toEqual([1, 2, 3, 4, 5]);
  });

  test("with rng() always 0, produces a deterministic, verifiable order", () => {
    // Fisher–Yates with rng()=0 always swaps i with index 0, reversing except
    // it walks down from the end — verify against a hand-computed result.
    const result = shuffle([1, 2, 3, 4], () => 0);
    expect(result).toEqual([2, 3, 4, 1]);
  });
});

// ─── resultTier(): percentage buckets ──────────────────────────────────────
describe("resultTier", () => {
  test(">= 85 is great", () => {
    expect(resultTier(85)).toBe("great");
    expect(resultTier(100)).toBe("great");
  });
  test(">= 60 and < 85 is ok", () => {
    expect(resultTier(60)).toBe("ok");
    expect(resultTier(84)).toBe("ok");
  });
  test("< 60 is low", () => {
    expect(resultTier(59)).toBe("low");
    expect(resultTier(0)).toBe("low");
  });
});

// ─── CLAUDE_QUIZ_QUESTIONS: data integrity ─────────────────────────────────
describe("CLAUDE_QUIZ_QUESTIONS data", () => {
  // Inertia was dropped (out of syllabus for this partial): 43 - 9 = 34.
  // 8 True/False questions were added to balance the True/False ratio: 42.
  // 4 more were added afterwards (image-based tension/compression MC, an
  // image-based Q/M polynomial-degree V/F, an image-based symmetry V/F, and
  // a truss bending-moment V/F): 46. Plus an MC on two-plate hinged chains
  // (47), a V/F on the hinge moment being zero (48), and a V/F on whether
  // truss symmetry requires symmetric loads (49).
  test("has 49 questions", () => {
    expect(CLAUDE_QUIZ_QUESTIONS).toHaveLength(49);
  });

  test("every id is unique", () => {
    const ids = CLAUDE_QUIZ_QUESTIONS.map((question) => question.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("every question has a valid topic from CLAUDE_QUIZ_TOPICS", () => {
    const validTopics = new Set(Object.keys(CLAUDE_QUIZ_TOPICS));
    for (const question of CLAUDE_QUIZ_QUESTIONS) {
      expect(validTopics.has(question.topic)).toBe(true);
    }
  });

  test("every question has at least 2 options in both languages, matching lengths", () => {
    for (const question of CLAUDE_QUIZ_QUESTIONS) {
      expect(question.options.es.length).toBeGreaterThanOrEqual(2);
      expect(question.options.es.length).toBe(question.options.en.length);
    }
  });

  test("`correct` is a valid index into the options array", () => {
    for (const question of CLAUDE_QUIZ_QUESTIONS) {
      expect(question.correct).toBeGreaterThanOrEqual(0);
      expect(question.correct).toBeLessThan(question.options.es.length);
    }
  });

  test("vf questions have exactly 2 options; mc questions have more than 2", () => {
    for (const question of CLAUDE_QUIZ_QUESTIONS) {
      if (question.type === "vf") {
        expect(question.options.es.length).toBe(2);
      } else {
        expect(question.options.es.length).toBeGreaterThan(2);
      }
    }
  });

  test("mc correct answers are not all in the same option position", () => {
    const mcQuestions = CLAUDE_QUIZ_QUESTIONS.filter((q) => q.type === "mc");
    const positions = new Set(mcQuestions.map((q) => q.correct));
    // Guards against every multiple-choice question having its correct
    // option at index 0 (a giveaway to anyone skimming the answer key).
    expect(positions.size).toBeGreaterThan(1);
    const atIndexZero = mcQuestions.filter((q) => q.correct === 0).length;
    expect(atIndexZero / mcQuestions.length).toBeLessThan(0.5);
  });

  test("statement and explanation are non-empty in both languages", () => {
    for (const question of CLAUDE_QUIZ_QUESTIONS) {
      expect(question.statement.es.length).toBeGreaterThan(0);
      expect(question.statement.en.length).toBeGreaterThan(0);
      expect(question.explanation.es.length).toBeGreaterThan(0);
      expect(question.explanation.en.length).toBeGreaterThan(0);
    }
  });

  test("at least one question carries an image", () => {
    expect(CLAUDE_QUIZ_QUESTIONS.some((question) => question.image)).toBe(true);
  });

  test("when a question has an image, its src is absolute and alt text is bilingual", () => {
    for (const question of CLAUDE_QUIZ_QUESTIONS) {
      if (!question.image) continue;
      expect(question.image.src.startsWith("/")).toBe(true);
      expect(question.image.alt.es.length).toBeGreaterThan(0);
      expect(question.image.alt.en.length).toBeGreaterThan(0);
    }
  });
});
