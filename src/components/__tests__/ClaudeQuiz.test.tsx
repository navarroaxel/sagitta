import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ClaudeQuiz } from "../claude-quiz/ClaudeQuiz";
import { CLAUDE_QUIZ_QUESTIONS } from "@/lib/claudeQuizData";

function setup() {
  return render(
    <LanguageProvider>
      <ClaudeQuiz />
    </LanguageProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("ClaudeQuiz", () => {
  test("renders every question by default (topic filter = all)", () => {
    setup();
    // Each question renders its 1-based index badge; check the last one exists.
    expect(screen.getByText(String(CLAUDE_QUIZ_QUESTIONS.length))).toBeInTheDocument();
  });

  test("clicking the correct option shows the Correct verdict and increments the correct counter", () => {
    setup();
    const first = CLAUDE_QUIZ_QUESTIONS[0];
    const correctLabel = first.options.en[first.correct];
    fireEvent.click(screen.getAllByText(correctLabel)[0]);
    expect(screen.getByText("Correct")).toBeInTheDocument();
    expect(screen.getByText(/1 answered/)).toBeInTheDocument();
    expect(screen.getByText(/1 correct/)).toBeInTheDocument();
  });

  test("clicking a wrong option shows Incorrect and marks the correct option", () => {
    setup();
    const first = CLAUDE_QUIZ_QUESTIONS[0];
    const wrongIndex = first.correct === 0 ? 1 : 0;
    const wrongLabel = first.options.en[wrongIndex];
    fireEvent.click(screen.getAllByText(wrongLabel)[0]);
    expect(screen.getByText("Incorrect")).toBeInTheDocument();
  });

  test("topic filter reduces the number of visible cards", () => {
    setup();
    const fuerzasCount = CLAUDE_QUIZ_QUESTIONS.filter(
      (q) => q.topic === "fuerzas",
    ).length;
    fireEvent.click(screen.getByRole("button", { name: /Force systems/ }));
    // The first `fuerzasCount` index badges (1..N) should be present, and the
    // one right after should not (it belongs to the next topic).
    expect(screen.getByText(String(fuerzasCount))).toBeInTheDocument();
    expect(screen.queryByText(String(fuerzasCount + 1))).not.toBeInTheDocument();
  });

  test("unanswered-only filter hides answered questions", () => {
    const { container } = setup();
    const first = CLAUDE_QUIZ_QUESTIONS[0];
    const second = CLAUDE_QUIZ_QUESTIONS[1];
    const correctLabel = first.options.en[first.correct];
    fireEvent.click(screen.getAllByText(correctLabel)[0]);

    const cardFor = (id: string) =>
      container.querySelector(`[data-testid="claude-question-${id}"]`);

    fireEvent.click(screen.getByRole("button", { name: /Unanswered only/ }));
    expect(cardFor(first.id)).not.toBeInTheDocument();
    expect(cardFor(second.id)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Unanswered only/ }));
    expect(cardFor(first.id)).toBeInTheDocument();
  });

  test("answering a question while unanswered-only is active keeps it in view", () => {
    const { container } = setup();
    const first = CLAUDE_QUIZ_QUESTIONS[0];
    const second = CLAUDE_QUIZ_QUESTIONS[1];

    fireEvent.click(screen.getByRole("button", { name: /Unanswered only/ }));

    const cardFor = (id: string) =>
      container.querySelector(`[data-testid="claude-question-${id}"]`);
    expect(cardFor(first.id)).toBeInTheDocument();

    // Answer the first question while the filter stays on — it should not
    // be removed from the list mid-session.
    const correctLabel = first.options.en[first.correct];
    fireEvent.click(screen.getAllByText(correctLabel)[0]);
    expect(cardFor(first.id)).toBeInTheDocument();
    expect(cardFor(second.id)).toBeInTheDocument();

    // Toggling the filter off and on again re-freezes the snapshot, which
    // now excludes the just-answered question.
    fireEvent.click(screen.getByRole("button", { name: /Unanswered only/ }));
    fireEvent.click(screen.getByRole("button", { name: /Unanswered only/ }));
    expect(cardFor(first.id)).not.toBeInTheDocument();
  });

  test("reset clears answers back to an unanswered state", () => {
    setup();
    const first = CLAUDE_QUIZ_QUESTIONS[0];
    const correctLabel = first.options.en[first.correct];
    fireEvent.click(screen.getAllByText(correctLabel)[0]);
    expect(screen.getByText(/1 answered/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByText(/0 answered/)).toBeInTheDocument();
    expect(screen.queryByText("Correct")).not.toBeInTheDocument();
  });
});
