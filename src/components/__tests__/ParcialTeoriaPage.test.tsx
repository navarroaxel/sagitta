import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ParcialTeoriaPage from "@/app/parcial-teoria/page";
import { PARCIAL_TEORIA_QUESTIONS } from "@/lib/parcialTeoriaData";

function setup() {
  return render(
    <LanguageProvider>
      <ParcialTeoriaPage />
    </LanguageProvider>,
  );
}

describe("/parcial-teoria", () => {
  test("has the 25 questions with 4 options each and stores no answer key", () => {
    expect(PARCIAL_TEORIA_QUESTIONS).toHaveLength(25);
    for (const q of PARCIAL_TEORIA_QUESTIONS) {
      expect(q.options).toHaveLength(4);
      expect(Object.keys(q).sort()).toEqual(["options", "statement"]);
    }
    setup();
    expect(screen.getByTestId("pt-question-25")).toBeInTheDocument();
  });

  test("marking an option records it but never grades it", () => {
    const { container } = setup();
    fireEvent.click(
      container.querySelector('[data-testid="pt-question-1"] button')!,
    );
    expect(screen.getByText(/1 \/ 25/)).toBeInTheDocument();
    expect(screen.queryByText(/^(Correct|Incorrect)$/)).not.toBeInTheDocument();
    expect(
      container
        .querySelector('[data-testid="pt-question-1"] button')!
        .getAttribute("aria-pressed"),
    ).toBe("true");
  });
});
