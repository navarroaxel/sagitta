import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ResistenciaQuizPage from "@/app/resistencia-quiz/page";
import { MATERIALS_QUIZ_QUESTIONS } from "@/lib/materialsQuizData";

beforeEach(() => window.localStorage.clear());

function setup() {
  return render(
    <LanguageProvider>
      <ResistenciaQuizPage />
    </LanguageProvider>,
  );
}

describe("/resistencia-quiz", () => {
  test("shows all 39 questions and the eight topic filters", () => {
    setup();
    expect(MATERIALS_QUIZ_QUESTIONS).toHaveLength(39);
    expect(screen.getByText("39")).toBeInTheDocument();
    for (const name of [
      "Axial load",
      "Bending",
      "Shear",
      "State of stress",
      "Materials",
      "Plane areas",
      "Deflection",
      "Buckling",
    ]) {
      expect(
        screen.getByRole("button", { name: new RegExp(`^${name} \\(\\d+\\)`) }),
      ).toBeInTheDocument();
    }
  });

  test("answering the right option grades it", () => {
    setup();
    const q = MATERIALS_QUIZ_QUESTIONS[0];
    fireEvent.click(screen.getAllByText(q.options.en[q.correct])[0]);
    expect(screen.getByText("Correct")).toBeInTheDocument();
    expect(screen.getByText(/1 correct/)).toBeInTheDocument();
  });

  test("no question-type chip (every question is multiple choice)", () => {
    setup();
    expect(screen.queryByText("Multiple choice")).not.toBeInTheDocument();
  });
});

describe("subscripts in the questions", () => {
  test("J_x, σ_E, N_Ω… render as real subscripts, never as a literal underscore", () => {
    const { container } = setup();
    // answer every question so the explanations show too
    for (const q of MATERIALS_QUIZ_QUESTIONS) {
      fireEvent.click(
        container.querySelector(
          `[data-testid="claude-question-${q.id}"] button`,
        )!,
      );
    }
    expect(container.textContent).not.toMatch(/[A-Za-zσΩ]_[A-Za-zΩ0-9]/);
    expect(container.querySelectorAll("sub").length).toBeGreaterThan(40);
  });
});
