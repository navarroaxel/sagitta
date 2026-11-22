"use client";

import React from "react";
import Link from "next/link";
import { useLanguage, type TranslationKey } from "@/contexts/LanguageContext";
import { SettingsPanel } from "@/components/SettingsPanel";
import { Sub, SvgSub } from "@/components/Sub";

const INK = "#16232E";
const FAINT = "#C9D2D8";
const TENSION = "#0B8A8A";
const COMPRESSION = "#C0392B";

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 font-mono text-xs font-medium uppercase tracking-wider text-teal-700 dark:text-teal-400">
      {children}
    </p>
  );
}

function Figure({ children, caption }: { children: React.ReactNode; caption?: React.ReactNode }) {
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

// A displayed equation with the notes' number on the right.
function Eq({ children, n }: { children: string; n?: number }) {
  return (
    <div className="my-3 flex items-baseline justify-between gap-4 rounded-md bg-stone-100 px-4 py-2 font-mono text-[15px] dark:bg-stone-900">
      <span><Sub>{children}</Sub></span>
      {n !== undefined && <span className="text-stone-400">({n})</span>}
    </div>
  );
}

function Para({ k }: { k: TranslationKey }) {
  const { t } = useLanguage();
  return (
    <p className="mb-4 max-w-[66ch] leading-relaxed text-stone-700 dark:text-stone-300">
      <Sub>{t(k)}</Sub>
    </p>
  );
}

function Section({ kicker, title, children }: { kicker: TranslationKey; title: TranslationKey; children: React.ReactNode }) {
  const { t } = useLanguage();
  return (
    <section className="mt-12 border-t border-stone-200 pt-8 dark:border-stone-800">
      <Kicker>{t(kicker)}</Kicker>
      <h3 className="mb-3 text-2xl font-semibold tracking-tight"><Sub>{t(title)}</Sub></h3>
      {children}
    </section>
  );
}

// Beam segment before (dashed) and after bending: top fibre shorter, bottom longer, N.A. unchanged.
function BendingSVG() {
  const { t } = useLanguage();
  return (
    <svg viewBox="0 0 360 170" className="h-auto w-full" role="img" aria-label={t("flx.s4.fig")}>
      {/* before */}
      <rect x="40" y="40" width="280" height="60" fill="none" stroke={FAINT} strokeWidth="1.5" strokeDasharray="5 4" />
      {/* after: trapezoid-ish curved piece */}
      <path d="M 40 40 Q 180 58 320 40 L 320 100 Q 180 126 40 100 Z" fill="#E7EEF2" stroke={INK} strokeWidth="2" />
      <path d="M 40 70 Q 180 92 320 70" fill="none" stroke={INK} strokeWidth="1.5" strokeDasharray="2 3" />
      <text x="330" y="74" fontSize="12" fontWeight="600" fill={INK}>{t("flx.s4.fig.na")}</text>
      <text x="180" y="30" fontSize="12" fontWeight="600" fill={COMPRESSION} textAnchor="middle">
        {t("flx.s4.fig.compression")}
      </text>
      <text x="180" y="150" fontSize="12" fontWeight="600" fill={TENSION} textAnchor="middle">
        {t("flx.s4.fig.tension")}
      </text>
      <text x="26" y="36" fontSize="12" fontWeight="600" fill={INK} textAnchor="end">C</text>
      <text x="26" y="104" fontSize="12" fontWeight="600" fill={INK} textAnchor="end">D</text>
      <text x="334" y="36" fontSize="12" fontWeight="600" fill={INK}>E</text>
      <text x="334" y="108" fontSize="12" fontWeight="600" fill={INK}>F</text>
    </svg>
  );
}

// Linear stress diagram across the depth: σ = σ₁·y, zero at the N.A.
function StressSVG() {
  return (
    <svg viewBox="0 0 220 180" className="h-auto w-full" role="img" aria-label="σ = σ1·y">
      <rect x="30" y="20" width="40" height="140" fill="#E7EEF2" stroke={INK} strokeWidth="2" />
      <line x1="14" y1="90" x2="206" y2="90" stroke={INK} strokeWidth="1.5" strokeDasharray="2 3" />
      <polygon points="120,20 120,90 190,90" fill={COMPRESSION} opacity="0.35" stroke={COMPRESSION} strokeWidth="1.5" />
      <polygon points="120,90 120,160 50,90" fill={TENSION} opacity="0.35" stroke={TENSION} strokeWidth="1.5" />
      <line x1="120" y1="14" x2="120" y2="166" stroke={INK} strokeWidth="1" />
      <text x="196" y="86" fontSize="12" fontStyle="italic" fill={INK}>σ</text>
      <text x="8" y="86" fontSize="12" fill={INK}>N.A.</text>
      <text x="78" y="60" fontSize="12" fontStyle="italic" fill={INK}>y</text>
      <text x="124" y="30" fontSize="11" fill={INK}><SvgSub>σ_max</SvgSub></text>
    </svg>
  );
}

export default function FlexionPage() {
  const { t } = useLanguage();
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <header className="z-10 flex items-center gap-3 border-b border-stone-200 bg-white px-4 py-2 shadow-sm dark:border-stone-700 dark:bg-stone-900">
        <Link
          href="/"
          className="text-sm text-stone-500 transition-colors hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100"
        >
          {t("learn.back")}
        </Link>
        <span className="text-stone-300 dark:text-stone-600">|</span>
        <h1 className="text-base font-semibold tracking-tight text-stone-800 dark:text-stone-100">{t("flx.title")}</h1>
        <div className="flex-1" />
        <SettingsPanel />
      </header>

      <main className="flex-1 overflow-auto">
        <article className="mx-auto max-w-3xl px-6 py-12">
          <Kicker>M · σ · J</Kicker>
          <h2 className="mb-4 text-4xl font-bold leading-tight tracking-tight text-balance">{t("flx.title")}</h2>
          <p className="mb-6 max-w-[60ch] text-lg leading-relaxed text-stone-600 dark:text-stone-300">
            <Sub>{t("flx.lead")}</Sub>
          </p>

          <Section kicker="flx.s1.kicker" title="flx.s1.title">
            <Para k="flx.s1.p1" />
            <Para k="flx.s1.p2" />
            <ul className="mb-4 max-w-[66ch] list-disc space-y-2 pl-5 text-stone-700 dark:text-stone-300">
              <li>{t("flx.s1.normal")}</li>
              <li>{t("flx.s1.oblique")}</li>
            </ul>
          </Section>

          <Section kicker="flx.s2.kicker" title="flx.s2.title">
            <Para k="flx.s2.p1" />
            <Para k="flx.s2.p2" />
          </Section>

          <Section kicker="flx.s3.kicker" title="flx.s3.title">
            <Para k="flx.s3.intro" />
            <ol className="mb-4 max-w-[66ch] list-[lower-alpha] space-y-2 pl-6 text-stone-700 dark:text-stone-300">
              <li>{t("flx.s3.a")}</li>
              <li>{t("flx.s3.b")}</li>
              <li><Sub>{t("flx.s3.c")}</Sub></li>
            </ol>
            <Para k="flx.s3.note" />
          </Section>

          <Section kicker="flx.s4.kicker" title="flx.s4.title">
            <Para k="flx.s4.p1" />
            <div className="mx-auto max-w-md">
              <Figure caption={t("flx.s4.fig")}>
                <BendingSVG />
              </Figure>
            </div>
            <Para k="flx.s4.p2" />
          </Section>

          <Section kicker="flx.s5.kicker" title="flx.s5.title">
            <Para k="flx.s5.p1" />
            <Eq n={1}>∫ σ dA = 0</Eq>
            <Eq n={2}>∫ y (σ dA) = M</Eq>
            <Para k="flx.s5.p2" />
            <Eq n={3}>σ_1 = σ / y   →   σ = σ_1·y</Eq>
            <Para k="flx.s5.p3" />
            <Eq n={4}>σ_1 ∫ y dA = 0</Eq>
            <Eq n={5}>σ_1 ∫ y² dA = M</Eq>
            <Para k="flx.s5.p4" />
            <Para k="flx.s5.p5" />
            <Eq n={7}>M = σ_1·J_x = (σ / y)·J_x</Eq>
            <div className="my-3 rounded-md border-2 border-teal-600 px-4 py-3 text-center font-mono text-xl dark:border-teal-400">
              σ = M·y / <Sub>J_x</Sub>
            </div>
            <div className="mx-auto max-w-[14rem]">
              <Figure>
                <StressSVG />
              </Figure>
            </div>
            <Para k="flx.s5.p6" />
            <Eq n={8}>σ = M_max·v / J_x</Eq>
            <Eq n={9}>σ = M_max / (J_x / v)</Eq>
            <Para k="flx.s5.p7" />
            <Eq n={10}>σ = M / W_x</Eq>
          </Section>

          <Section kicker="flx.s6.kicker" title="flx.s6.title">
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
                <p className="mb-1 font-semibold">{t("flx.s6.ver")}</p>
                <p className="font-mono text-[15px]"><Sub>σ = M / W_x ≤ σ_adm</Sub></p>
              </div>
              <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
                <p className="mb-1 font-semibold">{t("flx.s6.siz")}</p>
                <p className="font-mono text-[15px]"><Sub>W_nec = M_max / σ_adm</Sub></p>
              </div>
            </div>
            <Para k="flx.s6.p1" />
            <Para k="flx.s6.p2" />
          </Section>

          <footer className="mt-12 border-t border-stone-200 pt-6 text-sm leading-relaxed text-stone-500 dark:border-stone-800 dark:text-stone-400">
            <p className="max-w-[64ch]">{t("flx.footer")}</p>
          </footer>
        </article>
      </main>
    </div>
  );
}
