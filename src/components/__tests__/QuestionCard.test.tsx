import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { QuestionCard } from "../quiz/QuestionCard";
import { QuizAnswer, QuizQuestion } from "@/lib/quiz";

const question: QuizQuestion = {
  id: 1,
  statement: { en: "Statement one", es: "Enunciado uno" },
  answer: true,
  explanation: { en: "Because reasons.", es: "Porque sí." },
};

function setup(answer: QuizAnswer, graded: boolean, onAnswer = vi.fn()) {
  render(
    <LanguageProvider>
      <QuestionCard
        question={question}
        index={0}
        answer={answer}
        graded={graded}
        onAnswer={onAnswer}
      />
    </LanguageProvider>,
  );
  return { onAnswer };
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("QuestionCard", () => {
  test("selecting True marks the True button pressed", () => {
    const { onAnswer } = setup(null, false);
    fireEvent.click(screen.getByText("True"));
    expect(onAnswer).toHaveBeenCalledWith(true);
  });

  test("reflects the current answer as the pressed option", () => {
    setup(false, false);
    expect(screen.getByText("False")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("True")).toHaveAttribute("aria-pressed", "false");
  });

  test("after grading with a correct answer, shows correct status and the explanation", () => {
    setup(true, true);
    expect(screen.getByText("Correct")).toBeInTheDocument();
    expect(screen.getByText("Because reasons.")).toBeInTheDocument();
  });

  test("after grading with a wrong answer, shows incorrect status", () => {
    setup(false, true);
    expect(screen.getByText("Incorrect")).toBeInTheDocument();
  });

  test("after grading with no answer, shows unanswered status", () => {
    setup(null, true);
    expect(screen.getByText("Unanswered")).toBeInTheDocument();
  });

  test("buttons are disabled once graded", () => {
    setup(true, true);
    expect(screen.getByText("True")).toBeDisabled();
    expect(screen.getByText("False")).toBeDisabled();
  });
});
