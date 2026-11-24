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
  test("shows all 37 questions and the eight topic filters", () => {
    setup();
    expect(MATERIALS_QUIZ_QUESTIONS).toHaveLength(37);
    expect(screen.getByText("37")).toBeInTheDocument();
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
