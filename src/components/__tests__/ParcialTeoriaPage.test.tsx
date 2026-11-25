import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ParcialTeoriaPage from "@/app/parcial-teoria/page";
import { PARCIAL_TEORIA_QUESTIONS as Q } from "@/lib/parcialTeoriaData";

function setup() {
  return render(
    <LanguageProvider>
      <ParcialTeoriaPage />
    </LanguageProvider>,
  );
}

const buttons = (c: HTMLElement, n: number) =>
  c.querySelectorAll<HTMLButtonElement>(
    `[data-testid="pt-question-${n}"] button`,
  );

describe("/parcial-teoria", () => {
  test("has the 25 questions, 4 options each, a valid key and a reason", () => {
    expect(Q).toHaveLength(25);
    for (const q of Q) {
      expect(q.options).toHaveLength(4);
      expect(q.correct).toBeGreaterThanOrEqual(0);
      expect(q.correct).toBeLessThan(4);
      expect(q.explanation.length).toBeGreaterThan(20);
    }
  });

  test("the key of the hand-checkable questions", () => {
    // 5: S about the base = b·h²/2 · 13: W is in cm³ · 22: fixed–free c = 2
    expect(Q[4].options[Q[4].correct]).toBe("Sx = (b · h²) / 2");
    expect(Q[12].options[Q[12].correct]).toBe("cm³");
    expect(Q[21].options[Q[21].correct]).toBe("c = 2,0");
    expect(Q[2].options[Q[2].correct]).toBe("Δl = (N · l) / (A · E)");
  });

  test("the right option is graded correct and counted", () => {
    const { container } = setup();
    fireEvent.click(buttons(container, 1)[Q[0].correct]);
    expect(
      screen.getByText(/1 \/ 25 answered · 1 correct/),
    ).toBeInTheDocument();
    expect(screen.getByText("Correct")).toBeInTheDocument();
  });

  test("a wrong option is graded incorrect, reveals the right one and is final", () => {
    const { container } = setup();
    const wrong = Q[0].correct === 0 ? 1 : 0;
    fireEvent.click(buttons(container, 1)[wrong]);
    expect(screen.getByText("Incorrect")).toBeInTheDocument();
    expect(screen.getByText(/0 correct/)).toBeInTheDocument();
    expect(buttons(container, 1)[Q[0].correct].disabled).toBe(true);
  });
});
