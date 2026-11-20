import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import CasioReaccionesPage from "@/app/casio-reacciones/page";
import { EXCENTR_LINES, PANDEO_LINES, PERFILES_LINES, SECCION_LINES, REACC_LINES, RETIC_LINES, TRACCION_LINES, VIGACAB_LINES } from "@/lib/casioPrograms";

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
    SECCION_LINES.forEach((l) => expect(perfil).toContain(l));
    expect(perfil).toContain("→List 1");
    const vigacab = screen.getByTestId("casio-vigacab").textContent!;
    VIGACAB_LINES.forEach((l) => expect(vigacab).toContain(l));
    for (const [id, lines] of [["casio-traccion", TRACCION_LINES], ["casio-pandeo", PANDEO_LINES], ["casio-retic", RETIC_LINES], ["casio-perfiles", PERFILES_LINES], ["casio-excentr", EXCENTR_LINES]] as const)
      lines.forEach((l) => expect(screen.getByTestId(id).textContent).toContain(l));
    expect(document.body.textContent).toMatch(/Ocho programas|Eight programs/);
    expect(document.body.textContent).toMatch(/VIGACAB/);
  });

  test("the copy button puts the plain program lines (no line numbers) on the clipboard", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    render(
      <LanguageProvider>
        <CasioReaccionesPage />
      </LanguageProvider>,
    );
    fireEvent.click(screen.getByTestId("casio-perfil-copy"));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(SECCION_LINES.join("\n")));
    fireEvent.click(screen.getByTestId("casio-reacc-copy"));
    await waitFor(() => expect(writeText).toHaveBeenLastCalledWith(REACC_LINES.join("\n")));
    await waitFor(() => expect(screen.getAllByRole("status").some((e) => /Copied|Copiado/.test(e.textContent!))).toBe(true));
  });

  test("the download button hands over a .g1m with the program's name", async () => {
    const created: Blob[] = [];
    URL.createObjectURL = vi.fn((b: Blob) => (created.push(b), "blob:test"));
    URL.revokeObjectURL = vi.fn();
    const clicks: string[] = [];
    const click = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function (this: HTMLAnchorElement) {
      clicks.push(this.download);
    };
    render(
      <LanguageProvider>
        <CasioReaccionesPage />
      </LanguageProvider>,
    );
    fireEvent.click(screen.getByTestId("casio-perfil-download"));
    fireEvent.click(screen.getByTestId("casio-reacc-download"));
    fireEvent.click(screen.getByTestId("casio-vigacab-download"));
    fireEvent.click(screen.getByTestId("casio-traccion-download"));
    fireEvent.click(screen.getByTestId("casio-pandeo-download"));
    fireEvent.click(screen.getByTestId("casio-retic-download"));
    fireEvent.click(screen.getByTestId("casio-perfiles-download"));
    fireEvent.click(screen.getByTestId("casio-excentr-download"));
    HTMLAnchorElement.prototype.click = click;
    expect(clicks).toEqual(["SECCION.g1m", "REACC.g1m", "VIGACAB.g1m", "TRACCION.g1m", "PANDEO.g1m", "RETIC.g1m", "PERFILES.g1m", "EXCENTR.g1m"]);
    expect(created).toHaveLength(8);
    const head = new Uint8Array(await created[1].arrayBuffer()).slice(0, 8);
    expect(String.fromCharCode(...Array.from(head).map((b) => ~b & 255))).toBe("USBPower");
    expect(document.body.textContent).toMatch(/@MainMem/);
  });
});
