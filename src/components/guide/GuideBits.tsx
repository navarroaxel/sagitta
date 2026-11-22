"use client";

import NavMenu from "@/components/NavMenu";
import React from "react";
import Link from "next/link";
import { useLanguage, type TranslationKey } from "@/contexts/LanguageContext";
import { SettingsPanel } from "@/components/SettingsPanel";
import { Sub } from "@/components/Sub";

// Building blocks shared by the static study-guide pages (/flecha, /corte-en-flexion).

export function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 font-mono text-xs font-medium uppercase tracking-wider text-teal-700 dark:text-teal-400">
      {children}
    </p>
  );
}

export function Figure({ children, caption }: { children: React.ReactNode; caption?: React.ReactNode }) {
  return (
    <figure className="my-5 rounded-lg border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-100">
      {children}
      {caption && (
        <figcaption className="mt-2 text-center text-[13px] leading-snug text-stone-500 dark:text-stone-600">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export function Eq({ children, boxed }: { children: string; boxed?: boolean }) {
  return (
    <div
      className={
        boxed
          ? "my-3 rounded-md border-2 border-teal-600 px-4 py-3 text-center font-mono text-lg dark:border-teal-400"
          : "my-3 rounded-md bg-stone-100 px-4 py-2 text-center font-mono text-[15px] dark:bg-stone-900"
      }
    >
      <Sub>{children}</Sub>
    </div>
  );
}

export function Para({ k }: { k: TranslationKey }) {
  const { t } = useLanguage();
  return (
    <p className="mb-4 max-w-[66ch] leading-relaxed text-stone-700 dark:text-stone-300">
      <Sub>{t(k)}</Sub>
    </p>
  );
}

export function Section({
  kicker,
  title,
  children,
}: {
  kicker: TranslationKey;
  title: TranslationKey;
  children: React.ReactNode;
}) {
  const { t } = useLanguage();
  return (
    <section className="mt-12 border-t border-stone-200 pt-8 dark:border-stone-800">
      <Kicker>{t(kicker)}</Kicker>
      <h3 className="mb-3 text-2xl font-semibold tracking-tight">
        <Sub>{t(title)}</Sub>
      </h3>
      {children}
    </section>
  );
}

export function GuidePage({
  title,
  kicker,
  lead,
  footer,
  children,
}: {
  title: TranslationKey;
  kicker: string;
  lead: TranslationKey;
  footer: TranslationKey;
  children: React.ReactNode;
}) {
  const { t } = useLanguage();
  return (
    <div className="flex h-screen flex-col overflow-hidden print:block print:h-auto print:overflow-visible bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <header className="z-10 print:hidden flex items-center gap-3 border-b border-stone-200 bg-white px-4 py-2 shadow-sm dark:border-stone-700 dark:bg-stone-900">
        <Link
          href="/"
          className="text-sm text-stone-500 transition-colors hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100"
        >
          {t("learn.back")}
        </Link>
        <span className="text-stone-300 dark:text-stone-600">|</span>
        <h1 className="text-base font-semibold tracking-tight text-stone-800 dark:text-stone-100">{t(title)}</h1>
        <NavMenu />
        <div className="flex-1" />
        <SettingsPanel />
      </header>
      <main className="flex-1 overflow-auto print:overflow-visible">
        <article className="mx-auto max-w-3xl px-6 py-12">
          <Kicker>
            <Sub>{kicker}</Sub>
          </Kicker>
          <h2 className="mb-4 text-4xl font-bold leading-tight tracking-tight text-balance">{t(title)}</h2>
          <p className="mb-6 max-w-[60ch] text-lg leading-relaxed text-stone-600 dark:text-stone-300">
            <Sub>{t(lead)}</Sub>
          </p>
          {children}
          <footer className="mt-12 border-t border-stone-200 pt-6 text-sm leading-relaxed text-stone-500 dark:border-stone-800 dark:text-stone-400">
            <p className="max-w-[64ch]">{t(footer)}</p>
          </footer>
        </article>
      </main>
    </div>
  );
}
