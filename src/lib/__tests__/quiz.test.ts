import { gradeQuiz, QuizAnswer, QuizQuestion } from "../quiz";

function q(id: number, answer: boolean): QuizQuestion {
  return {
    id,
    statement: { en: `statement ${id}`, es: `enunciado ${id}` },
    answer,
    explanation: { en: `explanation ${id}`, es: `explicación ${id}` },
  };
}

// ─── gradeQuiz(): per-question status + aggregate score ────────────────────
describe("gradeQuiz", () => {
  const questions: QuizQuestion[] = [q(1, true), q(2, false), q(3, true)];

  test("all correct", () => {
    const answers: QuizAnswer[] = [true, false, true];
    expect(gradeQuiz(answers, questions)).toEqual({
      correct: 3,
      total: 3,
      perQuestion: ["correct", "correct", "correct"],
    });
  });

  test("mixed correct, incorrect and unanswered", () => {
    const answers: QuizAnswer[] = [true, true, null];
    expect(gradeQuiz(answers, questions)).toEqual({
      correct: 1,
      total: 3,
      perQuestion: ["correct", "incorrect", "unanswered"],
    });
  });

  test("all unanswered", () => {
    const answers: QuizAnswer[] = [null, null, null];
    expect(gradeQuiz(answers, questions)).toEqual({
      correct: 0,
      total: 3,
      perQuestion: ["unanswered", "unanswered", "unanswered"],
    });
  });
});
