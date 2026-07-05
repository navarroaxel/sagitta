// Pure grading logic for the True/False statics quiz.
// Kept free of React so the math can be unit-tested in isolation.

export type QuizQuestion = {
  id: number;
  statement: { en: string; es: string };
  answer: boolean;
  explanation: { en: string; es: string };
};

export type QuizAnswer = boolean | null;

export type QuestionStatus = "correct" | "incorrect" | "unanswered";

export interface GradeResult {
  correct: number;
  total: number;
  perQuestion: QuestionStatus[];
}

// Grades each answer against its question, then tallies the correct count.
export function gradeQuiz(
  answers: QuizAnswer[],
  questions: QuizQuestion[],
): GradeResult {
  const perQuestion = questions.map((question, i): QuestionStatus => {
    const answer = answers[i];
    if (answer === null || answer === undefined) return "unanswered";
    return answer === question.answer ? "correct" : "incorrect";
  });
  return {
    correct: perQuestion.filter((status) => status === "correct").length,
    total: questions.length,
    perQuestion,
  };
}
