"use client";

import { useSyncExternalStore } from "react";
import { DEFAULT_COLORS, type Colors } from "@/components/canvas/constants";

/** Built-in palette — the values the app ships with. */
export { DEFAULT_COLORS };
export type { Colors };
export type ColorKey = keyof Colors;

/**
 * High-contrast preset: pure black structure on a white background with
 * fully-saturated, well-separated hues for each signal — for projectors,
 * printing, or low-vision use.
 */
export const HIGH_CONTRAST_COLORS: Colors = {
  ink: "#000000",
  paper: "#ffffff",
  tension: "#008a00",
  compression: "#e00000",
  shear: "#0030ff",
  moment: "#7a00ff",
  loads: "#ff6600",
  reactions: "#008b8b",
  member: "#000000",
  node: "#000000",
  grid: "#c8c8c8",
  dimensions: "#000000",
};

const STORAGE_KEY = "sagitta-colors";
const STORE_EVENT = "sagitta:colors-change";

// useSyncExternalStore requires getSnapshot to return a referentially stable
// value between renders. We cache the merged palette and only rebuild it when
// the raw localStorage string actually changes, so unrelated re-renders keep
// the same object identity (and don't trigger an update loop).
let cachedRaw: string | null | undefined;
let cached: Colors = DEFAULT_COLORS;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function getSnapshot(): Colors {
  if (typeof window === "undefined") return DEFAULT_COLORS;
  const raw = readRaw();
  if (raw === cachedRaw) return cached;
  cachedRaw = raw;
  if (!raw) {
    cached = DEFAULT_COLORS;
    return cached;
  }
  try {
    const overrides = JSON.parse(raw) as Partial<Colors>;
    cached = { ...DEFAULT_COLORS, ...overrides };
  } catch {
    cached = DEFAULT_COLORS;
  }
  return cached;
}

function getServerSnapshot(): Colors {
  return DEFAULT_COLORS;
}

function subscribe(callback: () => void) {
  // STORE_EVENT covers same-tab writes; "storage" covers other tabs.
  window.addEventListener(STORE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(STORE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function readOverrides(): Partial<Colors> {
  if (typeof window === "undefined") return {};
  const raw = readRaw();
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Partial<Colors>;
  } catch {
    return {};
  }
}

function write(overrides: Partial<Colors>) {
  if (Object.keys(overrides).length === 0) {
    window.localStorage.removeItem(STORAGE_KEY);
  } else {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  }
  window.dispatchEvent(new Event(STORE_EVENT));
}

/** Override a single color. Setting it back to the default drops the override. */
export function setColor(key: ColorKey, hex: string) {
  if (typeof window === "undefined") return;
  const overrides = readOverrides();
  if (hex === DEFAULT_COLORS[key]) {
    delete overrides[key];
  } else {
    overrides[key] = hex;
  }
  write(overrides);
}

/** Replace the whole palette with a preset (e.g. high contrast). */
export function setColors(next: Colors) {
  if (typeof window === "undefined") return;
  const overrides: Partial<Colors> = {};
  (Object.keys(next) as ColorKey[]).forEach((k) => {
    if (next[k] !== DEFAULT_COLORS[k]) overrides[k] = next[k];
  });
  write(overrides);
}

/** Clear every override, restoring the built-in palette. */
export function resetColors() {
  if (typeof window === "undefined") return;
  write({});
}

/** Live palette = defaults merged with the user's overrides. */
export function useColors(): Colors {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
