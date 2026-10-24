import { render as rtlRender, screen, fireEvent } from "@testing-library/react";
import type { ReactElement } from "react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Frame3DPage from "@/app/frame3d/page";

const render = (ui: ReactElement) => rtlRender(<LanguageProvider>{ui}</LanguageProvider>);

describe("/frame3d editor panel", () => {
  test("the nodes / members / loads panel can be collapsed to leave room for the section cut, and reopened", () => {
    render(<Frame3DPage />);
    const panel = document.getElementById("editor-panel")!;
    const toggle = screen.getByRole("button", { name: "Hide the nodes / members / loads panel" });
    expect(panel.hidden).toBe(false);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(toggle);
    expect(panel.hidden).toBe(true);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(toggle.getAttribute("aria-label")).toBe("Show the nodes / members / loads panel");
    fireEvent.click(toggle);
    expect(panel.hidden).toBe(false);
  });
});

describe("/frame3d full screen", () => {
  test("the frame diagram has a full-screen button that shows the canvas alone", () => {
    // jsdom has no Fullscreen API: install the method for this test
    const req = vi.fn();
    const proto = HTMLElement.prototype as unknown as { requestFullscreen?: () => void };
    proto.requestFullscreen = req;
    try {
      render(<Frame3DPage />);
      const fig = screen.getByTestId("fs-frame3d");
      expect(fig.querySelector('[data-testid="frame3d-canvas"]')).toBeTruthy();
      fireEvent.click(screen.getByRole("button", { name: "Full screen" }));
      expect(req).toHaveBeenCalledTimes(1);
      expect(req.mock.contexts[0]).toBe(fig);
    } finally {
      delete proto.requestFullscreen;
    }
  });
});

describe("/frame3d presets", () => {
  const select = () => screen.getByLabelText(/Examples/) as HTMLSelectElement;
  const chosenLabel = () => select().selectedOptions[0]?.textContent ?? "";

  test("the labels carry a permanent number, in list order, and no loads", () => {
    render(<Frame3DPage />);
    const labels = Array.from(select().options)
      .filter((o) => o.value)
      .map((o) => o.textContent!);
    expect(labels.map((l) => l.match(/^#(\d+)/)?.[1])).toEqual(["1", "2", "3", "4", "5", "6", "7", "8"]);
    labels.forEach((l) => expect(l).not.toMatch(/kg\/m|\d+ kg/)); // the loads live in the model, not in the name
  });

  test("the select shows which preset is loaded (so '#3' is readable in a screenshot), and goes back to the placeholder when the model is edited", () => {
    render(<Frame3DPage />);
    expect(chosenLabel()).toMatch(/^#1 /); // the default model is preset #1
    fireEvent.change(select(), { target: { value: "frame_overhang" } });
    expect(chosenLabel()).toMatch(/^#5 /);
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(chosenLabel()).toMatch(/^#1 /);
    fireEvent.change(screen.getByLabelText("B z"), { target: { value: "6.5" } }); // an edit: no longer a preset
    expect(select().value).toBe("");
  });

  test("a line says where σ max is: at the support for #1, INSIDE the bar for #5 (flagged)", () => {
    render(<Frame3DPage />);
    expect(screen.getByTestId("peak-note").textContent).toMatch(/bar M1 \(IPB 260\).*at the fixed support A/);
    expect(screen.getByTestId("peak-note").className).not.toContain("amber");
    fireEvent.change(select(), { target: { value: "frame_overhang" } });
    const note = screen.getByTestId("peak-note");
    expect(note.textContent).toMatch(/inside the bar, 1\.31 m from A/);
    expect(note.className).toContain("amber"); // the case that needs the interior maximum stands out
  });
});
