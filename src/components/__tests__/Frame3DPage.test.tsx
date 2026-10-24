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
