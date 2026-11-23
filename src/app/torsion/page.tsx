"use client";

import NavMenu from "@/components/NavMenu";
import React from "react";
import Link from "next/link";
import { useLanguage, type TranslationKey } from "@/contexts/LanguageContext";
import { SettingsPanel } from "@/components/SettingsPanel";
import { Sub, SvgSub, eqLines } from "@/components/Sub";

const INK = "#16232E";
const FAINT = "#C9D2D8";
const TENSION = "#0B8A8A";
const MOMENT = "#7A2A9A";

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

function Eq({ children, boxed }: { children: string; boxed?: boolean }) {
  return (
    <div
      className={
        boxed
          ? "my-3 rounded-md border-2 border-teal-600 px-4 py-3 text-center font-mono text-lg dark:border-teal-400"
          : "my-3 rounded-md bg-stone-100 px-4 py-2 text-center font-mono text-[15px] dark:bg-stone-900"
      }
    >
      {eqLines(children).map((line, i) => (
        <div key={i}>
          <Sub>{line}</Sub>
        </div>
      ))}
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
      <h3 className="mb-3 text-2xl font-semibold tracking-tight">
        <Sub>{t(title)}</Sub>
      </h3>
      {children}
    </section>
  );
}

// Circular section: a point at radius ρ moves along an arc of angle φ.
function TwistSVG() {
  const { t } = useLanguage();
  const cx = 110;
  const cy = 100;
  const R = 80;
  const phi = (25 * Math.PI) / 180;
  const bx = cx + R * Math.cos(-0.3);
  const by = cy + R * Math.sin(-0.3);
  const b2x = cx + R * Math.cos(-0.3 - phi);
  const b2y = cy + R * Math.sin(-0.3 - phi);
  return (
    <svg viewBox="0 0 220 200" className="h-auto w-full" role="img" aria-label={t("tor.s2.fig")}>
      <circle cx={cx} cy={cy} r={R} fill="#E7EEF2" stroke={INK} strokeWidth="2" />
      <circle cx={cx} cy={cy} r="3" fill={INK} />
      <line x1={cx} y1={cy} x2={bx} y2={by} stroke={FAINT} strokeWidth="2" strokeDasharray="4 3" />
      <line x1={cx} y1={cy} x2={b2x} y2={b2y} stroke={MOMENT} strokeWidth="2.5" />
      <path d={`M ${bx} ${by} A ${R} ${R} 0 0 0 ${b2x} ${b2y}`} fill="none" stroke={MOMENT} strokeWidth="3" />
      <path d={`M ${cx + 30} ${cy - 9} A 30 30 0 0 0 ${cx + 30 * Math.cos(-0.3 - phi)} ${cy + 30 * Math.sin(-0.3 - phi) }`} fill="none" stroke={INK} strokeWidth="1.5" />
      <text x={bx + 6} y={by + 10} fontSize="13" fontWeight="600" fill={INK}>B</text>
      <text x={b2x + 4} y={b2y - 6} fontSize="13" fontWeight="600" fill={MOMENT}>B′</text>
      <text x={cx + 38} y={cy - 18} fontSize="13" fontStyle="italic" fill={INK}>φ</text>
      <text x={cx - 8} y={cy + 22} fontSize="12" fontStyle="italic" fill={INK}>O</text>
      <text x={cx + 28} y={cy + 44} fontSize="12" fontStyle="italic" fill={INK}>ρ</text>
    </svg>
  );
}

// τ varies linearly with ρ across the diameter.
function TauSVG() {
  return (
    <svg viewBox="0 0 220 150" className="h-auto w-full" role="img" aria-label="τ = G·γ ∝ ρ">
      <circle cx="60" cy="75" r="50" fill="#E7EEF2" stroke={INK} strokeWidth="2" />
      <line x1="60" y1="75" x2="110" y2="75" stroke={INK} strokeWidth="1.5" strokeDasharray="2 3" />
      <polygon points="60,75 110,75 110,25" fill={TENSION} opacity="0.35" stroke={TENSION} strokeWidth="1.5" />
      <line x1="110" y1="75" x2="110" y2="25" stroke={TENSION} strokeWidth="2" />
      <text x="116" y="34" fontSize="12" fill={INK}><SvgSub>τ_max</SvgSub></text>
      <text x="62" y="92" fontSize="11" fill={INK}>τ = 0</text>
      <text x="92" y="92" fontSize="12" fontStyle="italic" fill={INK}>ρ</text>
    </svg>
  );
}

export default function TorsionPage() {
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
        <h1 className="text-base font-semibold tracking-tight text-stone-800 dark:text-stone-100">{t("tor.title")}</h1>
        <NavMenu />
        <div className="flex-1" />
        <SettingsPanel />
      </header>

      <main className="flex-1 overflow-auto">
        <article className="mx-auto max-w-3xl px-6 py-12">
          <Kicker><Sub>M_t · τ · φ</Sub></Kicker>
          <h2 className="mb-4 text-4xl font-bold leading-tight tracking-tight text-balance">{t("tor.title")}</h2>
          <p className="mb-6 max-w-[60ch] text-lg leading-relaxed text-stone-600 dark:text-stone-300">
            <Sub>{t("tor.lead")}</Sub>
          </p>

          <Section kicker="tor.s1.kicker" title="tor.s1.title">
            <Para k="tor.s1.p1" />
            <Para k="tor.s1.p2" />
          </Section>

          <Section kicker="tor.s2.kicker" title="tor.s2.title">
            <Para k="tor.s2.p1" />
            <ol className="mb-4 max-w-[66ch] list-decimal space-y-2 pl-6 text-stone-700 dark:text-stone-300">
              <li>{t("tor.s2.h1")}</li>
              <li>{t("tor.s2.h2")}</li>
              <li>{t("tor.s2.h3")}</li>
            </ol>
            <Para k="tor.s2.p2" />
            <div className="mx-auto max-w-xs">
              <Figure caption={t("tor.s2.fig")}>
                <TwistSVG />
              </Figure>
            </div>
            <Para k="tor.s2.p3" />
            <Eq>{"γ = ρ·φ / {l}"}</Eq>
          </Section>

          <Section kicker="tor.s3.kicker" title="tor.s3.title">
            <Para k="tor.s3.p1" />
            <Eq>{"τ = {G}·γ"}</Eq>
            <Para k="tor.s3.p2" />
            <Eq>{"τ = {G}·ρ·φ / {l}"}</Eq>
            <div className="mx-auto max-w-xs">
              <Figure caption={<Sub>{t("tor.s3.fig")}</Sub>}>
                <TauSVG />
              </Figure>
            </div>
            <Para k="tor.s3.p3" />
            <Eq>{"∫ τ·ρ {dA} = {G}·(φ/{l})·∫ρ² {dA} = {M}_t"}</Eq>
            <Para k="tor.s3.p4" />
            <Eq>{"φ / {l} = {M}_t / ({G}·{J}_0)"}</Eq>
            <Eq boxed>{"τ = {M}_t·ρ / {J}_0"}</Eq>
          </Section>

          <Section kicker="tor.s4.kicker" title="tor.s4.title">
            <Para k="tor.s4.p1" />
            <Eq>{"{J}_0 = π·{D}⁴ / 32"}</Eq>
            <Eq boxed>{"τ_max = 16·{M}_t / (π·{D}³) = 2·{M}_t / (π·{R}³)"}</Eq>
            <Para k="tor.s4.p2" />
            <Eq boxed>{"φ = {M}_t·{l} / ({G}·{J}_0)"}</Eq>
            <Para k="tor.s4.p3" />
          </Section>

          <Section kicker="tor.s5.kicker" title="tor.s5.title">
            <Para k="tor.s5.p1" />
            <Eq>{"{J}_0 = π·({D}_e⁴ − {D}_i⁴) / 32 = π·{D}_e⁴·(1 − n⁴) / 32"}</Eq>
            <Eq>{"τ_max = 16·{M}_t / (π·{D}_e³·(1 − n⁴))"}</Eq>
            <Eq>{"φ = 32·{M}_t·{l} / (π·{D}_e⁴·(1 − n⁴)·{G})"}</Eq>
            <Para k="tor.s5.p2" />
          </Section>

          <Section kicker="tor.s6.kicker" title="tor.s6.title">
            <Para k="tor.s6.p1" />
            <Eq>{"{M}_t = {P} / ω = 71 620·{N} / n   [kg·cm]"}</Eq>
            <Para k="tor.s6.p2" />
            <Eq boxed>{"{D} = ∛(16·{M}_t / (π·τ_adm)) ≈ 1,72·∛({M}_t / τ_adm)"}</Eq>
          </Section>

          <Section kicker="tor.s7.kicker" title="tor.s7.title">
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              {(["e1", "e2"] as const).map((e) => (
                <div
                  key={e}
                  data-testid={`tor-${e}`}
                  className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900"
                >
                  <p className="mb-1 font-semibold">{t(`tor.s7.${e}.title` as TranslationKey)}</p>
                  <p className="mb-2 text-[15px] text-stone-600 dark:text-stone-400">
                    <Sub>{t(`tor.s7.${e}.p` as TranslationKey)}</Sub>
                  </p>
                  <p className="whitespace-pre-line font-mono text-[14px] leading-relaxed">
                    <Sub>{t(`tor.s7.${e}.r` as TranslationKey)}</Sub>
                  </p>
                </div>
              ))}
            </div>
            <p className="max-w-[66ch] text-sm leading-relaxed text-amber-700 dark:text-amber-400"><Sub>{t("tor.note")}</Sub></p>
          </Section>

          <footer className="mt-12 border-t border-stone-200 pt-6 text-sm leading-relaxed text-stone-500 dark:border-stone-800 dark:text-stone-400">
            <p className="max-w-[64ch]">{t("tor.footer")}</p>
          </footer>
        </article>
      </main>
    </div>
  );
}
