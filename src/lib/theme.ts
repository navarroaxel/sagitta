// Theme (light/dark) handling, shared by the settings menu and the layout's
// pre-hydration init script. Theme is applied as a `.dark` class on <html>;
// see globals.css `@custom-variant dark`.

export type ThemeMode = "auto" | "light" | "dark";

const STORAGE_KEY = "sagitta-theme";

export function readStoredMode(): ThemeMode {
  if (typeof window === "undefined") return "auto";
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "light" || v === "dark" ? v : "auto";
}

export function applyMode(mode: ThemeMode): void {
  if (typeof window === "undefined") return;
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const useDark = mode === "dark" || (mode === "auto" && systemDark);
  document.documentElement.classList.toggle("dark", useDark);
  if (mode === "auto") {
    window.localStorage.removeItem(STORAGE_KEY);
  } else {
    window.localStorage.setItem(STORAGE_KEY, mode);
  }
}

export const THEME_ORDER: ThemeMode[] = ["auto", "light", "dark"];

export const THEME_ICONS: Record<ThemeMode, string> = {
  auto: "🌗",
  light: "☀️",
  dark: "🌙",
};
