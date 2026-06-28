import { render, screen, fireEvent } from "@testing-library/react";
import { SettingsPanel } from "../SettingsPanel";
import {
  useColors,
  DEFAULT_COLORS,
  HIGH_CONTRAST_COLORS,
} from "@/contexts/ColorContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { usePrefs } from "@/contexts/PrefsContext";

// Probe component that surfaces the live "loads" color so we can assert the
// store updates flow through useColors().
function LoadsProbe() {
  const c = useColors();
  return <div data-testid="loads-probe">{c.loads}</div>;
}

// Surfaces live prefs (rememberWork|snap) the same way for assertions.
function PrefsProbe() {
  const p = usePrefs();
  return <div data-testid="prefs-probe">{`${p.rememberWork}|${p.snap}`}</div>;
}

function setup() {
  return render(
    <LanguageProvider>
      <SettingsPanel />
      <LoadsProbe />
      <PrefsProbe />
    </LanguageProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("SettingsPanel", () => {
  test("panel is closed until the gear button is clicked", () => {
    setup();
    // Color rows are not in the DOM until the panel opens.
    expect(screen.queryByLabelText("Loads")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    expect(screen.getByLabelText("Loads")).toBeInTheDocument();
  });

  test("the toggle exposes aria-expanded and controls the panel region", () => {
    setup();
    const toggle = screen.getByRole("button", { name: "Settings" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls", "settings-panel");

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    // The opened panel carries the id the button points at.
    expect(document.getElementById("settings-panel")).toBeInTheDocument();
  });

  test("renders a swatch + hex field for every customizable color", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    // One representative per group, including a diagram color.
    for (const label of ["Loads", "Reactions", "Background", "Shear (Q)"]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
      expect(screen.getByLabelText(`${label} hex`)).toBeInTheDocument();
    }
  });

  test("editing a hex value updates the live palette", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    expect(screen.getByTestId("loads-probe")).toHaveTextContent(
      DEFAULT_COLORS.loads,
    );

    fireEvent.change(screen.getByLabelText("Loads hex"), {
      target: { value: "#123456" },
    });
    expect(screen.getByTestId("loads-probe")).toHaveTextContent("#123456");
    // The swatch reflects the same value.
    expect(screen.getByLabelText("Loads")).toHaveValue("#123456");
  });

  test("an invalid hex string does not change the palette", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    fireEvent.change(screen.getByLabelText("Loads hex"), {
      target: { value: "#xyz" },
    });
    expect(screen.getByTestId("loads-probe")).toHaveTextContent(
      DEFAULT_COLORS.loads,
    );
  });

  test("Restore defaults clears overrides", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    fireEvent.change(screen.getByLabelText("Loads hex"), {
      target: { value: "#123456" },
    });
    expect(screen.getByTestId("loads-probe")).toHaveTextContent("#123456");

    fireEvent.click(screen.getByRole("button", { name: "Restore defaults" }));
    expect(screen.getByTestId("loads-probe")).toHaveTextContent(
      DEFAULT_COLORS.loads,
    );
  });

  test("High contrast applies the high-contrast palette", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    fireEvent.click(screen.getByRole("button", { name: "High contrast" }));
    expect(screen.getByTestId("loads-probe")).toHaveTextContent(
      HIGH_CONTRAST_COLORS.loads,
    );
    // And it can still be reverted.
    fireEvent.click(screen.getByRole("button", { name: "Restore defaults" }));
    expect(screen.getByTestId("loads-probe")).toHaveTextContent(
      DEFAULT_COLORS.loads,
    );
  });

  test("Preferences: grid snap updates the live prefs", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    expect(screen.getByTestId("prefs-probe")).toHaveTextContent("true|0.25");
    fireEvent.click(screen.getByRole("button", { name: "0.5" }));
    expect(screen.getByTestId("prefs-probe")).toHaveTextContent("true|0.5");
  });

  test("Preferences: 'Remember my work' can be turned off", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    fireEvent.click(screen.getByRole("button", { name: "Off" }));
    expect(screen.getByTestId("prefs-probe")).toHaveTextContent("false|0.25");
  });

  test("language and theme controls live inside the panel", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    expect(screen.getByRole("button", { name: "ES" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "EN" })).toBeInTheDocument();
  });
});
