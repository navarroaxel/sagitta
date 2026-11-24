import {
  MATERIALS_QUIZ_QUESTIONS,
  MATERIALS_QUIZ_TOPICS,
} from "../materialsQuizData";

describe("materials quiz bank", () => {
  test("has 35 multiple-choice questions with unique ids", () => {
    expect(MATERIALS_QUIZ_QUESTIONS).toHaveLength(35);
    expect(new Set(MATERIALS_QUIZ_QUESTIONS.map((q) => q.id)).size).toBe(35);
    expect(MATERIALS_QUIZ_QUESTIONS.every((q) => q.type === "mc")).toBe(true);
  });
  test("each question has 4 distinct options per language and a valid answer", () => {
    for (const q of MATERIALS_QUIZ_QUESTIONS) {
      for (const lang of ["es", "en"] as const) {
        expect(q.options[lang]).toHaveLength(4);
        expect(new Set(q.options[lang]).size).toBe(4);
      }
      expect(q.correct).toBeGreaterThanOrEqual(0);
      expect(q.correct).toBeLessThan(4);
      expect(q.explanation.es.length).toBeGreaterThan(10);
    }
  });
  test("every topic is used and the correct letter varies", () => {
    for (const tp of Object.keys(MATERIALS_QUIZ_TOPICS)) {
      expect(MATERIALS_QUIZ_QUESTIONS.some((q) => q.topic === tp)).toBe(true);
    }
    const counts = [0, 1, 2, 3].map(
      (i) => MATERIALS_QUIZ_QUESTIONS.filter((q) => q.correct === i).length,
    );
    expect(Math.min(...counts)).toBeGreaterThanOrEqual(4);
  });
  test("the right answer is not given away by its length or its letter", () => {
    const counts = [0, 1, 2, 3].map(
      (i) => MATERIALS_QUIZ_QUESTIONS.filter((q) => q.correct === i).length,
    );
    expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(2);
    for (const q of MATERIALS_QUIZ_QUESTIONS) {
      for (const lang of ["es", "en"] as const) {
        const len = q.options[lang].map((o) => o.length);
        const others = len.filter((_, i) => i !== q.correct);
        expect(len[q.correct] / Math.max(...others)).toBeLessThan(1.5);
      }
    }
  });
});
