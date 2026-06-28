"use client";

import { useSyncExternalStore } from "react";

/** Non-color user preferences that persist across reloads. */
export interface Prefs {
  /** Auto-save the current model + view options and restore them on reload. */
  rememberWork: boolean;
  /** Node drag / grid snap increment, in metres. */
  snap: number;
}

export const DEFAULT_PREFS: Prefs = {
  rememberWork: true,
  snap: 0.25,
};

export const SNAP_OPTIONS = [0.25, 0.5, 1] as const;

const STORAGE_KEY = "sagitta-prefs";
const STORE_EVENT = "sagitta:prefs-change";

// Cache so getSnapshot returns a stable reference between renders (required by
// useSyncExternalStore); rebuilt only when the stored string changes.
let cachedRaw: string | null | undefined;
let cached: Prefs = DEFAULT_PREFS;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function getSnapshot(): Prefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  const raw = readRaw();
  if (raw === cachedRaw) return cached;
  cachedRaw = raw;
  if (!raw) {
    cached = DEFAULT_PREFS;
    return cached;
  }
  try {
    cached = { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<Prefs>) };
  } catch {
    cached = DEFAULT_PREFS;
  }
  return cached;
}

function getServerSnapshot(): Prefs {
  return DEFAULT_PREFS;
}

function subscribe(callback: () => void) {
  window.addEventListener(STORE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(STORE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

/** Set one preference. Values equal to the default are dropped from storage. */
export function setPref<K extends keyof Prefs>(key: K, value: Prefs[K]) {
  if (typeof window === "undefined") return;
  const next: Prefs = { ...getSnapshot(), [key]: value };
  const overrides: Partial<Prefs> = {};
  (Object.keys(next) as (keyof Prefs)[]).forEach((k) => {
    if (next[k] !== DEFAULT_PREFS[k]) (overrides[k] as Prefs[typeof k]) = next[k];
  });
  if (Object.keys(overrides).length === 0) {
    window.localStorage.removeItem(STORAGE_KEY);
  } else {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  }
  window.dispatchEvent(new Event(STORE_EVENT));
}

export function usePrefs(): Prefs {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Read the current prefs outside React (e.g. in a mount effect). */
export function getPrefs(): Prefs {
  return getSnapshot();
}
