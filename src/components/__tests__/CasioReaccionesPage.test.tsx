import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import CasioReaccionesPage from "@/app/casio-reacciones/page";
import { PERFIL_LINES, REACC_LINES } from "@/lib/casioPrograms";

describe("/casio-reacciones", () => {
  test("shows both programs line by line, with the data of the IPB table", () => {
    render(
      <LanguageProvider>
        <CasioReaccionesPage />
      </LanguageProvider>,
    );
    const reacc = screen.getByTestId("casio-reacc").textContent!;
    REACC_LINES.forEach((l) => expect(reacc).toContain(l));
    const perfil = screen.getByTestId("casio-perfil").textContent!;
    PERFIL_LINES.forEach((l) => expect(perfil).toContain(l));
    expect(perfil).toContain("→List 1");
    expect(document.body.textContent).toMatch(/Dos programas|Two programs/);
  });
});
